"use client";

import { useMemo } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useOwnedNFTs } from "@/data";
import { usePlayer } from "@/data";
import {
  PET_CATALOG,
  RARITY_NAMES,
  type PetNFTFields,
  type PlayerFields,
} from "@/config/contracts";
import { cn } from "@/lib/utils";

function normalizeOptionId(val: unknown): string | null {
  if (typeof val === "string" && val) return val;
  if (
    val &&
    typeof val === "object" &&
    "vec" in val &&
    Array.isArray((val as { vec: unknown[] }).vec)
  ) {
    const first = (val as { vec: string[] }).vec[0];
    return typeof first === "string" && first ? first : null;
  }
  return null;
}

function getEquippedPetId(player: PlayerFields | undefined): string | null {
  return player ? normalizeOptionId(player.equipped_pet) : null;
}

export default function PetPage() {
  const account = useCurrentAccount();
  const { player } = usePlayer();
  const { pets, isPending } = useOwnedNFTs();

  const equippedPetId = useMemo(() => getEquippedPetId(player), [player]);
  const equippedPet = useMemo(() => {
    if (!equippedPetId || !pets.length) return null;
    return pets.find((p) => p.objectId === equippedPetId) ?? null;
  }, [equippedPetId, pets]);

  if (!account) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
        Connect wallet to view pets.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Equipped pet slot (1 slot, no title) */}
      <div className="flex justify-center">
        <button
          type="button"
          className={cn(
            "flex w-full max-w-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 min-h-[120px] transition-colors",
            "border-[#6D678F]/50 bg-[#252430]/60 hover:border-[#6D678F] hover:bg-[#252430]"
          )}
        >
          {equippedPet ? (
            <>
              <span className="text-xs font-medium text-gray-400">
                Equipped pet
              </span>
              <span className="mt-2 text-center font-medium text-white">
                {PET_CATALOG[(equippedPet.fields as PetNFTFields).pet_id]?.name ??
                  `Pet ${(equippedPet.fields as PetNFTFields).pet_id}`}
              </span>
              <span className="mt-1 text-xs text-gray-400">
                {RARITY_NAMES[(equippedPet.fields as PetNFTFields).rarity]} · Bonus{" "}
                {(equippedPet.fields as PetNFTFields).bonus_value}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-medium text-gray-400">
                Equipped pet
              </span>
              <span className="mt-2 text-sm text-gray-500">Empty</span>
            </>
          )}
        </button>
      </div>

      {/* Owned pets list (no title) */}
      {isPending ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : pets.length === 0 ? (
        <p className="text-sm text-gray-400">No pets. Pull from Shop.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {pets.map((item) => {
            const f = item.fields as PetNFTFields;
            const petMeta = PET_CATALOG[f.pet_id];
            const name = petMeta?.name ?? `Pet ${f.pet_id}`;
            const rarityName = RARITY_NAMES[f.rarity] ?? `Rarity ${f.rarity}`;
            const isEquipped = item.objectId === equippedPetId;
            return (
              <li key={item.objectId}>
                <div
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    "border-[#6D678F]/30 bg-[#252430]/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">
                        {name} · {rarityName}
                      </p>
                      <p className="text-xs text-gray-400">
                        Bonus type {f.bonus_type} · {f.bonus_value}
                      </p>
                    </div>
                    {isEquipped && (
                      <span className="shrink-0 rounded bg-[#6D678F] px-2 py-0.5 text-xs font-medium text-white">
                        Equipped
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pet catalog */}
      <section
        className={cn(
          "rounded-lg border p-4",
          "border-[#6D678F]/30 bg-[#252430]/40"
        )}
      >
        <p className="text-xs font-medium text-gray-400">Pet catalog</p>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-400">
          {PET_CATALOG.map((p) => (
            <li key={p.pet_id}>
              <span className="font-medium text-white">{p.name}</span>:{" "}
              {p.bonus_type} · {p.art_hint}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
