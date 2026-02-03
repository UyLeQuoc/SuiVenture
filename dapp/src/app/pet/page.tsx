"use client";

import { useCallback, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useOwnedNFTs } from "@/data";
import { usePlayer } from "@/data";
import { PET_CATALOG, type PetNFTFields, type PlayerFields } from "@/config/contracts";
import { PetCard } from "@/components/inventory/PetCard";
import { PetModal, type PetModalState } from "@/components/inventory/PetModal";
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
  const { player, refetch: refetchPlayer } = usePlayer();
  const { pets, isPending, refetch } = useOwnedNFTs();
  const [modal, setModal] = useState<PetModalState & { open: boolean }>({
    open: false,
    objectId: null,
    fields: null,
    isEquipped: false,
  });

  const equippedPetId = useMemo(() => getEquippedPetId(player), [player]);
  const equippedPet = useMemo(() => {
    if (!equippedPetId || !pets.length) return null;
    return pets.find((p) => p.objectId === equippedPetId) ?? null;
  }, [equippedPetId, pets]);

  const openModalFromSlot = useCallback(() => {
    setModal({
      open: true,
      objectId: equippedPet?.objectId ?? null,
      fields: equippedPet ? (equippedPet.fields as PetNFTFields) : null,
      isEquipped: Boolean(equippedPetId),
    });
  }, [equippedPet, equippedPetId]);

  const openModalFromPet = useCallback(
    (objectId: string, fields: PetNFTFields) => {
      setModal({
        open: true,
        objectId,
        fields,
        isEquipped: objectId === equippedPetId,
      });
    },
    [equippedPetId]
  );

  const closeModal = useCallback(() => {
    setModal((m) => ({ ...m, open: false }));
  }, []);

  const handleEquipOrUnequip = useCallback(() => {
    // TODO: wire to game_state::equip_pet / unequip_pet when available
    closeModal();
    refetch();
    refetchPlayer();
  }, [closeModal, refetch, refetchPlayer]);

  const handleSell = useCallback(() => {
    // TODO: kiosk place + list
    closeModal();
  }, [closeModal]);

  const handleTransfer = useCallback(() => {
    // TODO: transfer NFT to address
    closeModal();
  }, [closeModal]);

  if (!account) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-[#6D678F]/30 bg-[#252430]/40 px-6 py-12">
        <p className="text-center text-gray-400">Connect wallet to view pets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Equipped: 1 slot as PetCard or empty placeholder */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Equipped
        </h2>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={openModalFromSlot}
            className="group w-full max-w-[140px] justify-self-center rounded-sm focus:outline-none focus:ring-2 focus:ring-[#6D678F] focus:ring-offset-2 focus:ring-offset-[#1a191e]"
          >
            {equippedPet ? (
              <PetCard
                pet={{
                  pet_id: (equippedPet.fields as PetNFTFields).pet_id,
                  rarity: (equippedPet.fields as PetNFTFields).rarity,
                  bonus_type: (equippedPet.fields as PetNFTFields).bonus_type,
                  bonus_value: (equippedPet.fields as PetNFTFields).bonus_value,
                }}
                showMeta={false}
                className="w-full transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]"
              />
            ) : (
              <div
                className={cn(
                  "flex aspect-square w-full flex-col items-center justify-center rounded-sm border-2 border-dashed transition-colors",
                  "border-[#6D678F]/50 bg-[#252430]/60 group-hover:border-[#6D678F] group-hover:bg-[#252430]/80"
                )}
              >
                <span className="text-xs font-medium text-gray-500">Pet</span>
                <span className="mt-1 text-xs text-gray-600">Empty</span>
              </div>
            )}
          </button>
        </div>
      </section>

      {/* Owned pets: grid of PetCards */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          My pets
        </h2>
        {isPending ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-[#6D678F]/20 bg-[#252430]/30">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#6D678F]/30 bg-[#252430]/20">
            <p className="text-center text-sm text-gray-500">
              No pets yet.
              <br />
              <span className="text-gray-600">Pull from Shop to get pets.</span>
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pets.map((item) => {
              const f = item.fields as PetNFTFields;
              const isEquipped = item.objectId === equippedPetId;
              return (
                <li key={item.objectId} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => openModalFromPet(item.objectId, f)}
                    className={cn(
                      "group relative w-full max-w-[140px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#6D678F] focus:ring-offset-2 focus:ring-offset-[#1a191e]",
                      "transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]"
                    )}
                  >
                    <PetCard
                      pet={{
                        pet_id: f.pet_id,
                        rarity: f.rarity,
                        bonus_type: f.bonus_type,
                        bonus_value: f.bonus_value,
                      }}
                      showMeta={true}
                    />
                    {isEquipped && (
                      <span
                        className="absolute left-1 top-1 rounded bg-[#6D678F]/90 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
                        aria-hidden
                      >
                        On
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Pet catalog */}
      <section
        className={cn(
          "rounded-xl border p-4",
          "border-[#6D678F]/30 bg-[#252430]/40"
        )}
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Pet catalog
        </h2>
        <ul className="space-y-1.5 text-sm text-gray-400">
          {PET_CATALOG.map((p) => (
            <li key={p.pet_id}>
              <span className="font-medium text-white">{p.name}</span>:{" "}
              {p.bonus_type} · {p.art_hint}
            </li>
          ))}
        </ul>
      </section>

      <PetModal
        open={modal.open}
        onClose={closeModal}
        state={{
          objectId: modal.objectId,
          fields: modal.fields,
          isEquipped: modal.isEquipped,
        }}
        onEquipOrUnequip={handleEquipOrUnequip}
        onSell={handleSell}
        onTransfer={handleTransfer}
      />
    </div>
  );
}
