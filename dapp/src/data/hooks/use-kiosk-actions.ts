"use client";

import { useCallback } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { KioskTransaction } from "@mysten/kiosk";
import type { KioskOwnerCap } from "@mysten/kiosk";
import { useOwnedKiosk } from "./use-kiosk";
import type { MarketplaceListing } from "./use-marketplace-listings";

export function useKioskActions() {
  const account = useCurrentAccount();
  const { kioskCap, kioskClient, refetch: refetchKiosk } = useOwnedKiosk();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["owned-kiosk"] });
    queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] });
    // useSuiClientQuery uses [network, method, params] - match getOwnedObjects at index 1
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) && query.queryKey[1] === "getOwnedObjects",
    });
  }, [queryClient]);

  /**
   * List an item for sale. Creates a kiosk first if the user doesn't have one.
   */
  const listItem = useCallback(
    async (objectId: string, itemType: string, priceMist: bigint) => {
      if (!account?.address) throw new Error("No wallet connected");

      const tx = new Transaction();
      const kioskTx = new KioskTransaction({
        transaction: tx,
        kioskClient,
        cap: kioskCap ?? undefined,
      });

      // Create kiosk if user doesn't have one
      if (!kioskCap) {
        kioskTx.create();
      }

      kioskTx.placeAndList({
        itemType,
        item: tx.object(objectId),
        price: priceMist,
      });

      if (!kioskCap) {
        kioskTx.shareAndTransferCap(account.address);
      }

      kioskTx.finalize();
      await signAndExecute({ transaction: tx });
      invalidateAll();
    },
    [account?.address, kioskCap, kioskClient, signAndExecute, invalidateAll]
  );

  /**
   * Delist an item and take it back to the wallet.
   */
  const delistItem = useCallback(
    async (itemId: string, itemType: string) => {
      if (!kioskCap) throw new Error("No kiosk found");

      const tx = new Transaction();
      const kioskTx = new KioskTransaction({
        transaction: tx,
        kioskClient,
        cap: kioskCap,
      });

      kioskTx.delist({ itemType, itemId });
      const item = kioskTx.take({ itemType, itemId });
      tx.transferObjects([item], account!.address);

      kioskTx.finalize();
      await signAndExecute({ transaction: tx });
      invalidateAll();
    },
    [account, kioskCap, kioskClient, signAndExecute, invalidateAll]
  );

  /**
   * Purchase a listed item from another player's kiosk.
   * Item is placed in buyer's kiosk by default, so we take it and transfer to
   * wallet so it appears in inventory (useOwnedNFTs uses getOwnedObjects).
   */
  const purchaseItem = useCallback(
    async (listing: MarketplaceListing) => {
      if (!account?.address) throw new Error("No wallet connected");

      const tx = new Transaction();
      const kioskTx = new KioskTransaction({
        transaction: tx,
        kioskClient,
        cap: kioskCap ?? undefined,
      });

      // Create buyer's kiosk if they don't have one (required for purchase)
      if (!kioskCap) {
        kioskTx.create();
      }

      await kioskTx.purchaseAndResolve({
        itemType: listing.fullType,
        itemId: listing.itemId,
        price: listing.price,
        sellerKiosk: listing.kioskId,
      });

      // Take from kiosk and transfer to wallet so item appears in inventory
      const item = kioskTx.take({ itemType: listing.fullType, itemId: listing.itemId });
      tx.transferObjects([item], account.address);

      if (!kioskCap) {
        kioskTx.shareAndTransferCap(account.address);
      }

      kioskTx.finalize();
      await signAndExecute({ transaction: tx });
      invalidateAll();
    },
    [account?.address, kioskCap, kioskClient, signAndExecute, invalidateAll]
  );

  return {
    listItem,
    delistItem,
    purchaseItem,
    isPending,
  };
}
