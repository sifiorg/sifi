import { StoryFn } from '@storybook/react';
import { SwapHistoryModal, SwapHistoryModalProps } from './SwapHistoryModal';
import { SwapHistoryProvider } from 'src/providers/SwapHistoryProvider';
import { localStorageKeys } from 'src/utils/localStorageKeys';

export default {
  title: 'Modals/SwapHistoryModal',
  component: SwapHistoryModal,
};

const Template: StoryFn<SwapHistoryModalProps> = args => (
  <SwapHistoryProvider>
    <SwapHistoryModal {...args} />
  </SwapHistoryProvider>
);

export const Default: StoryFn<SwapHistoryModalProps> = Template.bind({});
Default.args = {
  isOpen: true,
  closeModal: () => console.log('Modal closed'),
};

const mockData =
  '[{"quote":{"fromAmount":"1000000","fromToken":{"name":"USDCoin","address":"0xaf88d065e77c8cC2239327C5EDb3A432268e5831","symbol":"USDC","decimals":6,"chainId":42161,"logoURI":"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png","extensions":{"bridgeInfo":{"1":{"tokenAddress":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}}}},"toToken":{"name":"USDCoin","address":"0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359","symbol":"USDC","decimals":6,"chainId":137,"logoURI":"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"},"toAmount":"999513","estimatedGas":"650000","approveAddress":"0x65c49E9996A877d062085B71E1460fFBe3C4c5Aa","permit2Address":"0x000000000022D473030F116dDEE9F6B43aC78BA3","toAmountAfterFeesUsd":"0.98","source":{"name":"sifi","quote":{"element":{"fromToken":"0xaf88d065e77c8cc2239327c5edb3a432268e5831","shareBps":"10000","toToken":"0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","actions":[{"type":"warpUniV3Like","exchange":"ZyberSwapV3","tokens":["0xaf88d065e77c8cc2239327c5edb3a432268e5831","0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"],"pools":["0xcc065eb6460272481216757293ffc54a061ba60e"],"fromToken":"0xaf88d065e77c8cc2239327c5edb3a432268e5831","toToken":"0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"},{"type":"jumpStargate","exchange":"Stargate","fromToken":"0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","toToken":"0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","dstChainId":109,"srcPoolId":2,"dstPoolId":2,"lzFee":"134508134279159","dstWarpLinkEngage":{"gasForCall":"464106","amountOut":"999513","element":{"shareBps":"10000","fromToken":"0xc2132d05d31c914a87c6611c10748aeb04b58e8f","toToken":"0x3c499c542cef5e3811e1192ce70d8cc03d5c3359","actions":[{"type":"warpUniV3Like","exchange":"UniswapV3","tokens":["0xc2132d05d31c914a87c6611c10748aeb04b58e8f","0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"],"pools":["0x31083a78e11b18e450fd139f9abea98cd53181b7"],"fromToken":"0xc2132d05d31c914a87c6611c10748aeb04b58e8f","toToken":"0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"}]}}}]},"contractMethod":"warpLinkEngage"}}},"createdAt":"2024-01-15T20:53:06.641Z","hash":"0xfe117e17695dd4ab0eeca8af1868ad98aecf871ad5813a271548c1066a132325"},{"quote":{"fromAmount":"1000000","fromToken":{"name":"Tether USD","address":"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9","symbol":"USDT","decimals":6,"chainId":42161,"logoURI":"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png","extensions":{"bridgeInfo":{"1":{"tokenAddress":"0xdAC17F958D2ee523a2206206994597C13D831ec7"}}}},"toToken":{"name":"USDCoin","address":"0xaf88d065e77c8cC2239327C5EDb3A432268e5831","symbol":"USDC","decimals":6,"chainId":42161,"logoURI":"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png","extensions":{"bridgeInfo":{"1":{"tokenAddress":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}}}},"toAmount":"998896","estimatedGas":"315600","approveAddress":"0x65c49E9996A877d062085B71E1460fFBe3C4c5Aa","permit2Address":"0x000000000022D473030F116dDEE9F6B43aC78BA3","toAmountAfterFeesUsd":"0.92","source":{"name":"sifi","quote":{"element":{"shareBps":"10000","fromToken":"0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","toToken":"0xaf88d065e77c8cc2239327c5edb3a432268e5831","actions":[{"type":"warpWooFiV2","pools":["0xeff23b4be1091b53205e35f3afcd9c7182bf3062"],"fromToken":"0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","toToken":"0xaf88d065e77c8cc2239327c5edb3a432268e5831"}]},"contractMethod":"warpStateless"}}},"createdAt":"2024-01-15T20:52:33.801Z","hash":"0x8ee6401ed157247b9a7990afb7f5bf7e925a16ac3aa0c1744eeb8f8137903982"}]';

localStorage.setItem(localStorageKeys.SWAP_HISTORY, mockData);
