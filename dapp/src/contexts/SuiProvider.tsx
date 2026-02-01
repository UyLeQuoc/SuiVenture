"use client";

import {
  createNetworkConfig,
  SuiClientProvider,
  useSuiClientContext,
  WalletProvider,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { useEffect } from "react";
import "@mysten/dapp-kit/dist/index.css";
import { isEnokiNetwork, registerEnokiWallets } from "@mysten/enoki";
import { clientConfig } from "@/config/clientConfig";

const { networkConfig } = createNetworkConfig({
  [clientConfig.SUI_NETWORK]: {
    url: clientConfig.SUI_FULLNODE_URL,
  },
});
const queryClient = new QueryClient();

export const SuiProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={clientConfig.SUI_NETWORK}
      >
        <RegisterEnokiWallets />
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};

const RegisterEnokiWallets = () => {
  const { client, network } = useSuiClientContext();
  useEffect(() => {
    if (!isEnokiNetwork(network)) return;
    const { unregister } = registerEnokiWallets({
      apiKey: clientConfig.ENOKI_PUBLIC_KEY,
      providers: {
        ...(clientConfig.GOOGLE_CLIENT_ID && {
          google: {
            clientId: clientConfig.GOOGLE_CLIENT_ID,
          },
        }),
      },
      client,
      network,
    });
    return unregister;
  }, [client, network]);
  return null;
};
