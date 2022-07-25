import { ChakraProvider } from "@chakra-ui/react";
import { Config, DAppProvider, DEFAULT_SUPPORTED_CHAINS } from "@usedapp/core";

import theme from "../theme";
import { AppProps } from "next/app";
import { BitTorrentChain } from "../utils/chains";

function MyApp({ Component, pageProps }: AppProps) {
  const config: Config = {
    readOnlyChainId: BitTorrentChain.chainId,
    readOnlyUrls: {
      [BitTorrentChain.chainId]: "https://pre-rpc.bt.io",
    },
    networks: [...DEFAULT_SUPPORTED_CHAINS, BitTorrentChain],
  };

  return (
    <ChakraProvider theme={theme}>
      <DAppProvider config={config}>
        <Component {...pageProps} />
      </DAppProvider>
    </ChakraProvider>
  );
}

export default MyApp;
