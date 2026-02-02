"use client";

import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  PACKAGE_ID,
  transferPolicyCapGearType,
  transferPolicyCapPetType,
} from "@/config/contracts";

export interface AdminCaps {
  capGearId: string | null;
  capPetId: string | null;
  hasAny: boolean;
}

export function useAdminCaps(): AdminCaps & {
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const account = useCurrentAccount();
  const gearType = transferPolicyCapGearType(PACKAGE_ID);
  const petType = transferPolicyCapPetType(PACKAGE_ID);

  const { data: gearData, ...gearQuery } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address ?? "",
      filter: { StructType: gearType },
      options: { showContent: false },
    },
    {
      enabled:
        !!account?.address &&
        PACKAGE_ID !== "0x0" &&
        gearType.includes(PACKAGE_ID),
    }
  );

  const { data: petData, ...petQuery } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address ?? "",
      filter: { StructType: petType },
      options: { showContent: false },
    },
    {
      enabled:
        !!account?.address &&
        PACKAGE_ID !== "0x0" &&
        petType.includes(PACKAGE_ID),
    }
  );

  const capGearId =
    gearData?.data?.[0]?.data?.objectId ?? null;
  const capPetId =
    petData?.data?.[0]?.data?.objectId ?? null;

  return {
    capGearId,
    capPetId,
    hasAny: !!(capGearId || capPetId),
    isPending: gearQuery.isPending || petQuery.isPending,
    isError: gearQuery.isError || petQuery.isError,
    refetch: () => {
      gearQuery.refetch();
      petQuery.refetch();
    },
  };
}
