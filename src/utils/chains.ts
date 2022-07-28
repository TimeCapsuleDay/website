import { Chain } from "@usedapp/core";

export const BitTorrentChain: Chain = {
  chainId: 1029,
  chainName: "BitTorrent Testnet",
  isTestChain: false,
  isLocalChain: false,
  multicallAddress: "0x98073aF95aa4745f0A06Ed876f7Ea43Ddc29cdC2",
  getExplorerAddressLink: (address: string) =>
    `https://testscan.bt.io/#/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) =>
    `https://testscan.bt.io/#/tx/${transactionHash}`,
  rpcUrl: "https://pre-rpc.bt.io/",
  blockExplorerUrl: "https://testscan.bt.io/",
  nativeCurrency: {
    name: "BitTorrent Token",
    symbol: "BTT",
    decimals: 18,
  },
};
