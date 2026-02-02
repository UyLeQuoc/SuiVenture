"use client";

import { useSuiClientQuery } from "@mysten/dapp-kit";
import {
  TRANSFER_POLICY_GEAR_ID,
  TRANSFER_POLICY_PET_ID,
} from "@/config/contracts";

/** Parse balance (MIST) from TransferPolicy object content. Balance may be in fields.balance or in a dynamic field. */
function parsePolicyBalance(obj: unknown): string {
  const data = obj as {
    data?: {
      content?: { dataType?: string; fields?: Record<string, unknown> };
    } | null;
  };
  const fields = data?.data?.content?.fields;
  if (!fields || typeof fields !== "object") return "0";

  // Direct field: balance = { type: "0x2::balance::Balance<...>", value: "123" }
  const balance = fields.balance;
  if (balance && typeof balance === "object" && "value" in balance) {
    const v = (balance as { value?: string }).value;
    return typeof v === "string" ? v : "0";
  }
  return "0";
}

export interface PolicyBalance {
  objectId: string;
  balanceMist: string;
  balanceSui: string;
}

export function useTransferPolicyBalances() {
  const { data: gearData, ...gearQuery } = useSuiClientQuery(
    "getObject",
    {
      id: TRANSFER_POLICY_GEAR_ID,
      options: { showContent: true },
    },
    { enabled: TRANSFER_POLICY_GEAR_ID !== "0x0" }
  );

  const { data: petData, ...petQuery } = useSuiClientQuery(
    "getObject",
    {
      id: TRANSFER_POLICY_PET_ID,
      options: { showContent: true },
    },
    { enabled: TRANSFER_POLICY_PET_ID !== "0x0" }
  );

  const gear: PolicyBalance = {
    objectId: TRANSFER_POLICY_GEAR_ID,
    balanceMist: parsePolicyBalance(gearData),
    balanceSui: "",
  };
  gear.balanceSui =
    gear.balanceMist !== "0"
      ? (Number(gear.balanceMist) / 1e9).toFixed(4)
      : "0";

  const pet: PolicyBalance = {
    objectId: TRANSFER_POLICY_PET_ID,
    balanceMist: parsePolicyBalance(petData),
    balanceSui: "",
  };
  pet.balanceSui =
    pet.balanceMist !== "0"
      ? (Number(pet.balanceMist) / 1e9).toFixed(4)
      : "0";

  const totalMist =
    BigInt(gear.balanceMist) + BigInt(pet.balanceMist);
  const totalSui =
    totalMist !== BigInt(0)
      ? (Number(totalMist) / 1e9).toFixed(4)
      : "0";

  return {
    gear,
    pet,
    totalMist: totalMist.toString(),
    totalSui,
    isPending: gearQuery.isPending || petQuery.isPending,
    isError: gearQuery.isError || petQuery.isError,
    refetch: () => {
      gearQuery.refetch();
      petQuery.refetch();
    },
  };
}
