import { getNamedAccounts, network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { uniqBy } from 'lodash';
import pMap from 'p-map';
import { deploy, getFunctionSelectorsFromContract, verify } from '../deploy-helpers';
import { networkAddresses } from '../deploy-helpers/addresses';
import { DiamondCutFacet, DiamondLoupeFacet } from '../typechain-types';
import { FacetCutAction } from '../types/diamond.t';

const actionNames = Object.keys(FacetCutAction);

const addresses = networkAddresses[network.name];

type Init = {
  name: string;
  address: string;
  calldata: string;
};

let FACET_NAMES = [
  'DiamondCutFacet',
  'DiamondLoupeFacet',
  'OwnershipFacet',
  'StarVault',
  'UniV2LikeFacet',
  // NOTE: Used by UniV3Like and WarpLink
  'UniV3Callback',
  'UniV3Like',
  'WarpLink',
  'Curve',
];

if (addresses?.uniswapV2Router02 && addresses?.uniswapV2Factory) {
  // Uniswap V2 only has an official router on Ethereum
  FACET_NAMES = [...FACET_NAMES, 'UniV2RouterFacet'];
}

/**
 * Add, replace, or remove facets in the diamond
 */
const func = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre;
  const { get } = deployments;

  const { defaultDeployer } = await getNamedAccounts();
  const diamondDeployment = await get('SifiDiamond');
  const diamondCutDeployment = await get('DiamondCutFacet');

  const initForFacet: Partial<Record<string, () => Promise<Init>>> = {
    UniV2RouterFacet: async () => {
      if (!addresses?.uniswapV2Router02) {
        throw new Error(`UniswapV2Router02 address is unknown for network ${network.name}`);
      }

      const initDeployment = await deploy(hre, 'InitUniV2Router', {
        from: defaultDeployer,
        args: [],
      });

      const initContract = await ethers.getContractAt('InitUniV2Router', initDeployment.address);

      return {
        name: 'InitUniV2Router',
        address: initDeployment.address,
        calldata: initContract.interface.encodeFunctionData('init', [
          addresses.uniswapV2Router02,
          addresses.uniswapV2Factory ?? ethers.ZeroAddress,
          addresses.permit2 ?? ethers.ZeroAddress,
        ]),
      };
    },
    // NOTE: Adding this facet causes LibWarp to be initialized
    UniV2LikeFacet: async () => {
      if (!addresses?.weth) {
        throw new Error(`WETH address is unknown for network ${network.name}`);
      }

      const initDeployment = await deploy(hre, 'InitLibWarp', {
        from: defaultDeployer,
        args: [],
      });

      const initContract = await ethers.getContractAt('InitLibWarp', initDeployment.address);

      return {
        name: 'InitLibWarp',
        address: initDeployment.address,
        calldata: initContract.interface.encodeFunctionData('init', [
          addresses.weth ?? ethers.ZeroAddress,
          addresses.permit2 ?? ethers.ZeroAddress,
          addresses.stargateRouter ?? ethers.ZeroAddress,
        ]),
      };
    },
  };

  // TODO: Make this more pretty with a declarative approach to inits
  // TODO: Prevent duplicate inits
  initForFacet.UniV3Like = initForFacet.UniV2LikeFacet;
  initForFacet.WarpLink = initForFacet.UniV2LikeFacet;
  initForFacet.Curve = initForFacet.UniV2LikeFacet;

  for (const facetName of FACET_NAMES) {
    const args: unknown[] = [];

    const facet = await deploy(hre, facetName, {
      from: defaultDeployer,
      args: [],
    });

    await verify(facet.address, args);
  }

  const diamondCutFacet: DiamondCutFacet = await ethers.getContractAt(
    'DiamondCutFacet',
    diamondDeployment.address
  );

  const diamondLoupeFacet: DiamondLoupeFacet = await ethers.getContractAt(
    'DiamondLoupeFacet',
    diamondDeployment.address
  );

  // NOTE: Run in serial because of inner deployments
  const nextFacets = await pMap(
    FACET_NAMES,
    async (facetName: string) => {
      const facetDeployment = await get(facetName);
      const facet = await ethers.getContractAt(facetName, facetDeployment.address);

      return {
        name: facetName,
        address: facetDeployment.address,
        selectors: getFunctionSelectorsFromContract(facet),
        init: await initForFacet[facetName]?.(),
      };
    },
    { concurrency: 1 }
  );

  const nextSelectorToAddress = nextFacets.reduce<Record<string, string>>(
    (acc, facet) => ({
      ...acc,
      ...facet.selectors.reduce<Record<string, string>>((acc, selector) => {
        if (acc[selector]) {
          throw new Error(`Selector ${selector} already exists`);
        }

        return {
          ...acc,
          [selector]: facet.address,
        };
      }, {}),
    }),
    {}
  );

  const prevFacets = await diamondLoupeFacet.facets();

  const prevSelectorToAddress = prevFacets.reduce<Record<string, string>>(
    (acc, facet) => ({
      ...acc,
      ...facet.functionSelectors.reduce<Record<string, string>>(
        (acc, selector) => ({
          ...acc,
          [selector]: facet.facetAddress,
        }),
        {}
      ),
    }),
    {}
  );

  const addedFacets = nextFacets.filter(
    facet => !prevFacets.some(other => other.facetAddress === facet.address)
  );

  // Init functions are only supported for added facets
  const inits = uniqBy(addedFacets.map(facet => facet.init!).filter(Boolean), init => init.address);

  // Find selectors that are no longer used
  const cutsAddPerAddress = Object.entries(nextSelectorToAddress).reduce<Record<string, string[]>>(
    (acc, [selector, address]) => {
      if (prevSelectorToAddress[selector]) {
        return acc;
      }

      return {
        ...acc,
        [address]: [...(acc[address] || []), selector],
      };
    },
    {}
  );

  const cutsAddActions = Object.entries(cutsAddPerAddress).map(([address, selectors]) => ({
    action: FacetCutAction.Add,
    facetAddress: address,
    functionSelectors: selectors,
  }));

  const cutsRemovePerAddress = Object.entries(prevSelectorToAddress).reduce<
    Record<string, string[]>
  >((acc, [selector, address]) => {
    if (nextSelectorToAddress[selector]) {
      return acc;
    }

    return {
      ...acc,
      [address]: [...(acc[address] || []), selector],
    };
  }, {});

  if (cutsRemovePerAddress[diamondCutDeployment.address]) {
    throw new Error(
      `Cannot remove selectors from the DiamondCutFacet ${diamondCutDeployment.address}`
    );
  }

  // Flatten to a single action since all remove actions use `address(0)`
  const cutsRemoveActions = Object.values(cutsRemovePerAddress).flatMap(selectors => ({
    action: FacetCutAction.Remove,
    facetAddress: ethers.ZeroAddress,
    functionSelectors: selectors,
  }));

  const cutsReplacePerAddress = Object.entries(nextSelectorToAddress).reduce<
    Record<string, string[]>
  >((acc, [selector, address]) => {
    if (!prevSelectorToAddress[selector]) {
      return acc;
    }

    if (prevSelectorToAddress[selector] === address) {
      // Unchanged
      return acc;
    }

    return {
      ...acc,
      [address]: [...(acc[address] || []), selector],
    };
  }, {});

  const cutsReplaceActions = Object.entries(cutsReplacePerAddress).map(([address, selectors]) => ({
    action: FacetCutAction.Replace,
    facetAddress: address,
    functionSelectors: selectors,
  }));

  let cuts = [...cutsAddActions, ...cutsReplaceActions, ...cutsRemoveActions].map(cut => ({
    ...cut,
    facetName: nextFacets.find(facet => facet.address === cut.facetAddress)?.name,
  }));

  if (!cuts.length) {
    console.log('Diamond cuts are already up to date');

    return;
  }

  console.log('Cuts:');

  // HACK: Some replacements are always proposed, but fail with the error that it's being
  // replaced with the same selector
  if (network.name === 'polygon' || network.name === 'goerli') {
    cuts = cuts.filter(
      cut => cut.facetName !== 'OwnershipFacet' && cut.facetName !== 'DiamondLoupeFacet'
    );
  }

  for (const cut of cuts) {
    console.log(
      `\t${actionNames[cut.action]} ${cut.facetAddress}${
        cut.facetName ? ` (${cut.facetName})` : ''
      }`
    );

    for (const selector of cut.functionSelectors) {
      console.log(`\t\t${selector}`);
    }
  }

  let init: Init | undefined;

  if (inits.length > 1) {
    const multiInitDeployment = await deploy(hre, 'DiamondMultiInit', {
      from: defaultDeployer,
      args: [],
    });

    const multiInitContract = await ethers.getContractAt(
      'DiamondMultiInit',
      multiInitDeployment.address
    );

    init = {
      name: 'DiamondMultiInit',
      address: multiInitDeployment.address,
      calldata: multiInitContract.interface.encodeFunctionData('multiInit', [
        inits.map(init => init.address),
        inits.map(init => init.calldata),
      ]),
    };
  } else {
    init = inits[0];
  }

  if (init) {
    console.log(`Init: ${inits.map(i => i.name).join(', ')}`);
    console.log(`Address: ${init.address}; Calldata: (${init.calldata})`);
  }

  if (process.env.DRY_RUN) {
    console.log('Dry run. Not performing cuts');

    return;
  }

  await diamondCutFacet.diamondCut(
    cuts,
    init?.address ?? ethers.ZeroAddress,
    init?.calldata ?? Buffer.from([])
  );

  console.log(`Performed ${cuts.length} cuts`);
};

export default func;

func.tags = ['Diamond', 'Facets', 'v2', 'cut'];
