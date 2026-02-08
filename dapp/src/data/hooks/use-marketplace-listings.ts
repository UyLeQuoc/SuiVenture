"use client";

import { useMemo } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import {
  PACKAGE_ID,
  equipmentNFTType,
  petNFTType,
  type EquipmentNFTFields,
  type PetNFTFields,
} from "@/config/contracts";
import { createKioskClient } from "@/lib/kiosk-client";
import type { KioskItem } from "@mysten/kiosk";

export interface MarketplaceListing {
  kioskId: string;
  itemId: string;
  itemType: "gear" | "pet";
  fullType: string;
  price: string;
  fields: EquipmentNFTFields | PetNFTFields;
}

export function useMarketplaceListings() {
  const client = useSuiClient();
  const kioskClient = useMemo(() => createKioskClient(client), [client]);

  const gearType = equipmentNFTType(PACKAGE_ID);
  const petType = petNFTType(PACKAGE_ID);

  const { data, isPending, refetch } = useQuery({
    queryKey: ["marketplace-listings", PACKAGE_ID],
    queryFn: async () => {
      // Query ItemListed events for both types to find kiosks with listings
      const [gearEvents, petEvents] = await Promise.all([
        client.queryEvents({
          query: { MoveEventType: `0x2::kiosk::ItemListed<${gearType}>` },
          limit: 50,
          order: "descending",
        }),
        client.queryEvents({
          query: { MoveEventType: `0x2::kiosk::ItemListed<${petType}>` },
          limit: 50,
          order: "descending",
        }),
      ]);

      // Collect unique kiosk IDs from events
      const kioskIds = new Set<string>();
      for (const ev of [...gearEvents.data, ...petEvents.data]) {
        const parsed = ev.parsedJson as { kiosk?: string } | undefined;
        if (parsed?.kiosk) kioskIds.add(parsed.kiosk);
      }

      // Fetch each kiosk's contents to get currently-listed items
      const listings: MarketplaceListing[] = [];

      await Promise.all(
        [...kioskIds].map(async (kioskId) => {
          try {
            const kioskData = await kioskClient.getKiosk({
              id: kioskId,
              options: {
                withListingPrices: true,
                withObjects: true,
                objectOptions: { showContent: true },
              },
            });

            for (const item of kioskData.items) {
              if (!item.listing || item.listing.price == null) continue;
              if (item.listing.isExclusive) continue;

              const isGear = item.type === gearType;
              const isPet = item.type === petType;
              if (!isGear && !isPet) continue;

              const fields = extractFields(item);
              if (!fields) continue;

              listings.push({
                kioskId,
                itemId: item.objectId,
                itemType: isGear ? "gear" : "pet",
                fullType: item.type,
                price: item.listing.price,
                fields,
              });
            }
          } catch {
            // Kiosk may have been destroyed or is inaccessible
          }
        })
      );

      return listings;
    },
    enabled: PACKAGE_ID !== "0x0",
    refetchInterval: 30_000,
  });

  return {
    listings: data ?? [],
    isPending,
    refetch,
  };
}

function extractFields(
  item: KioskItem
): EquipmentNFTFields | PetNFTFields | null {
  const content = item.data?.content;
  if (!content || content.dataType !== "moveObject") return null;
  const fields = content.fields as Record<string, unknown>;

  if ("slot" in fields && "set_id" in fields) {
    return fields as unknown as EquipmentNFTFields;
  }
  if ("pet_id" in fields && "bonus_type" in fields) {
    return fields as unknown as PetNFTFields;
  }
  return null;
}
