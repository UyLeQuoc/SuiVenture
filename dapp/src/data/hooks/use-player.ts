"use client";

import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  PACKAGE_ID,
  playerType,
  type PlayerFields,
} from "@/config/contracts";

export function usePlayer() {
  const account = useCurrentAccount();
  const type = playerType(PACKAGE_ID);

  const query = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address ?? "",
      filter: { StructType: type },
      options: { showContent: true },
    },
    { enabled: Boolean(account?.address) && PACKAGE_ID !== "0x0" }
  );

  const first = query.data?.data?.[0];
  const content = first?.data?.content;
  const player =
    content && "dataType" in content && content.dataType === "moveObject"
      ? (content.fields as unknown as PlayerFields)
      : undefined;
  const playerObjectId = first?.data?.objectId;

  return {
    player,
    playerObjectId,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
