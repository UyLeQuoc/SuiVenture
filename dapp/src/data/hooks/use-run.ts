"use client";

import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  PACKAGE_ID,
  runType,
  type RunFields,
} from "@/config/contracts";

export function useRun() {
  const account = useCurrentAccount();
  const type = runType(PACKAGE_ID);

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
  const run =
    content && "dataType" in content && content.dataType === "moveObject"
      ? (content.fields as unknown as RunFields)
      : undefined;
  const runObjectId = first?.data?.objectId;

  return {
    run,
    runObjectId,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
