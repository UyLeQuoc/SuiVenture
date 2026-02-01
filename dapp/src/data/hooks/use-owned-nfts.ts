"use client";

import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  PACKAGE_ID,
  equipmentNFTType,
  petNFTType,
  type EquipmentNFTFields,
  type PetNFTFields,
} from "@/config/contracts";

interface OwnedNFT {
  objectId: string;
  type: "gear" | "pet";
  fields: EquipmentNFTFields | PetNFTFields;
}

function parseContent(item: unknown): OwnedNFT | null {
  const obj = item as { data?: { content?: { dataType?: string; fields?: unknown }; objectId?: string } | null };
  const data = obj.data;
  if (!data?.content || data.content.dataType !== "moveObject") return null;
  const fields = data.content.fields as Record<string, unknown>;
  const objectId = data.objectId ?? "";
  if ("slot" in fields && "set_id" in fields) {
    return { objectId, type: "gear", fields: fields as unknown as EquipmentNFTFields };
  }
  if ("pet_id" in fields && "bonus_type" in fields) {
    return { objectId, type: "pet", fields: fields as unknown as PetNFTFields };
  }
  return null;
}

export function useOwnedNFTs() {
  const account = useCurrentAccount();
  const gearType = equipmentNFTType(PACKAGE_ID);
  const petType = petNFTType(PACKAGE_ID);

  const { data: gearData, ...gearQuery } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address ?? "",
      filter: { StructType: gearType },
      options: { showContent: true },
    },
    { enabled: !!account?.address && PACKAGE_ID !== "0x0" }
  );

  const { data: petData, ...petQuery } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address ?? "",
      filter: { StructType: petType },
      options: { showContent: true },
    },
    { enabled: !!account?.address && PACKAGE_ID !== "0x0" }
  );

  const gear =
    gearData?.data
      ?.map((item) => parseContent(item))
      .filter((n): n is OwnedNFT => n !== null && n.type === "gear") ?? [];
  const pets =
    petData?.data
      ?.map((item) => parseContent(item))
      .filter((n): n is OwnedNFT => n !== null && n.type === "pet") ?? [];

  return {
    gear,
    pets,
    isPending: gearQuery.isPending || petQuery.isPending,
    isError: gearQuery.isError || petQuery.isError,
    refetch: () => {
      gearQuery.refetch();
      petQuery.refetch();
    },
  };
}
