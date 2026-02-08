"use client";

import { useCallback, useMemo } from "react";
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KioskTransaction } from "@mysten/kiosk";
import type { KioskOwnerCap } from "@mysten/kiosk";
import { Transaction } from "@mysten/sui/transactions";
import { createKioskClient } from "@/lib/kiosk-client";

export function useOwnedKiosk() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const kioskClient = useMemo(() => createKioskClient(client), [client]);

  const { data, isPending, refetch } = useQuery({
    queryKey: ["owned-kiosk", account?.address],
    queryFn: async () => {
      if (!account?.address) return null;
      const result = await kioskClient.getOwnedKiosks({
        address: account.address,
      });
      if (result.kioskOwnerCaps.length === 0) return null;
      return result.kioskOwnerCaps[0];
    },
    enabled: !!account?.address,
  });

  const createKiosk = useCallback(async () => {
    if (!account?.address) throw new Error("No wallet connected");

    const tx = new Transaction();
    const kioskTx = new KioskTransaction({
      transaction: tx,
      kioskClient,
    });
    kioskTx.createAndShare(account.address);
    kioskTx.finalize();

    await signAndExecute({ transaction: tx });
    queryClient.invalidateQueries({ queryKey: ["owned-kiosk"] });
  }, [account?.address, kioskClient, signAndExecute, queryClient]);

  return {
    kioskCap: data as KioskOwnerCap | null | undefined,
    kioskId: data?.kioskId ?? null,
    hasKiosk: !!data,
    isPending,
    createKiosk,
    refetch,
    kioskClient,
  };
}
