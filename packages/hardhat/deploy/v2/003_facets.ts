import { getNamedAccounts } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DiamondCutFacet, DiamondLoupeFacet, IDiamondCut } from '../../typechain-types';
import { FacetCutAction } from '../../types/diamond.t';
import { getFunctionSelectorsFromContract, verify } from '../helpers';

const FACET_NAMES = ['DiamondCutFacet', 'DiamondLoupeFacet', 'OwnershipFacet'];

/**
 * Add, replace, or remove facets in the diamond
 */
const func = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre;
  const { get, deploy } = deployments;
  const { defaultDeployer } = await getNamedAccounts();

  for (const facetName of FACET_NAMES) {
    const args: unknown[] = [];

    const facet = await deploy(facetName, {
      from: defaultDeployer,
      args: [],
      log: true,
      autoMine: true,
    });

    await verify(facet.address, args);
  }

  const diamondDeployment = await get('SifiDiamond');
  const diamondCutDeployment = await get('DiamondCutFacet');

  const diamondCutFacet: DiamondCutFacet = await ethers.getContractAt(
    'DiamondCutFacet',
    diamondDeployment.address
  );

  const diamondLoupeFacet: DiamondLoupeFacet = await ethers.getContractAt(
    'DiamondLoupeFacet',
    diamondDeployment.address
  );

  const nextFacets = await Promise.all(
    FACET_NAMES.map((facetName: string) =>
      Promise.resolve().then(async () => {
        const facetDeployment = await get(facetName);
        const facet = await ethers.getContractAt(facetName, facetDeployment.address);

        return {
          address: facetDeployment.address,
          selectors: getFunctionSelectorsFromContract(facet),
        };
      })
    )
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
    facetAddress: '0x0000000000000000000000000000000000000000',
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

  const cuts = [...cutsAddActions, ...cutsReplaceActions, ...cutsRemoveActions];

  if (!cuts.length) {
    console.log('Diamond cuts are already up to date');

    return;
  }

  console.log('Cuts:');

  for (const cut of cuts) {
    console.log(`\t${cut.action} ${cut.facetAddress}`);

    for (const selector of cut.functionSelectors) {
      console.log(`\t\t${selector}`);
    }
  }

  if (process.env.DRY_RUN) {
    console.log('Dry run. Not performing cuts');

    return;
  }

  // TODO: Add init support. Note that if multiple of the added/replaced cuts have an init functions
  // the DiamondCut facet needs to be upgraded to support multiple init functions
  // This can be as simple as having a map in this file of facet names to a function that
  // returns either `undefined` or the init function name and an array of arguments
  await diamondCutFacet.diamondCut(
    cuts,
    '0x0000000000000000000000000000000000000000',
    Buffer.from([])
  );

  console.log(`Performed ${cuts.length} cuts`);
};

export default func;

func.tags = ['Diamond', 'Facets', 'v2', 'cut'];
