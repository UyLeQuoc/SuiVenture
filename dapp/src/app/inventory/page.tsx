"use client";

import { useCallback, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useOwnedNFTs, useKioskActions } from "@/data";
import { usePlayer } from "@/data";
import { equipmentNFTType, PACKAGE_ID } from "@/config/contracts";
import {
  SLOT_NAMES,
  type EquipmentNFTFields,
  type PlayerFields,
} from "@/config/contracts";
import { GearCard } from "@/components/inventory/GearCard";
import { GearModal, type GearModalState } from "@/components/inventory/GearModal";
import { cn } from "@/lib/utils";

const SLOT_KEYS: (keyof PlayerFields)[] = [
  "equipped_helmet",
  "equipped_weapon",
  "equipped_shield",
  "equipped_boots",
];

function normalizeOptionId(val: unknown): string | null {
  if (typeof val === "string" && val) return val;
  if (val && typeof val === "object" && "vec" in val && Array.isArray((val as { vec: unknown[] }).vec)) {
    const first = (val as { vec: string[] }).vec[0];
    return typeof first === "string" && first ? first : null;
  }
  return null;
}

function getEquippedId(player: PlayerFields | undefined, slotIndex: number): string | null {
  if (!player) return null;
  const key = SLOT_KEYS[slotIndex];
  if (!key) return null;
  return normalizeOptionId(player[key]);
}

function isGearEquipped(
  objectId: string,
  player: PlayerFields | undefined
): boolean {
  if (!player) return false;
  return SLOT_KEYS.some(
    (key) => normalizeOptionId(player[key]) === objectId
  );
}

export default function InventoryPage() {
  const account = useCurrentAccount();
  const { player, refetch: refetchPlayer } = usePlayer();
  const { gear, isPending, refetch } = useOwnedNFTs();
  const { listItem, isPending: isSelling } = useKioskActions();
  const [modal, setModal] = useState<GearModalState & { open: boolean }>({
    open: false,
    objectId: null,
    fields: null,
    slotIndex: null,
    isEquipped: false,
  });

  const gearByObjectId = useMemo(() => {
    const m = new Map<string, { objectId: string; fields: EquipmentNFTFields }>();
    for (const g of gear) {
      const f = g.fields as EquipmentNFTFields;
      m.set(g.objectId, { objectId: g.objectId, fields: f });
    }
    return m;
  }, [gear]);

  const equippedSlots = useMemo(() => {
    return [0, 1, 2, 3].map((slotIndex) => {
      const id = getEquippedId(player, slotIndex);
      const item = id ? gearByObjectId.get(id) ?? null : null;
      return { slotIndex, objectId: id, fields: item?.fields ?? null };
    });
  }, [player, gearByObjectId]);

  const openModalFromSlot = useCallback(
    (slotIndex: number) => {
      const slot = equippedSlots[slotIndex];
      setModal({
        open: true,
        objectId: slot.objectId,
        fields: slot.fields,
        slotIndex,
        isEquipped: Boolean(slot.objectId),
      });
    },
    [equippedSlots]
  );

  const openModalFromGear = useCallback(
    (objectId: string, fields: EquipmentNFTFields) => {
      setModal({
        open: true,
        objectId,
        fields,
        slotIndex: null,
        isEquipped: isGearEquipped(objectId, player),
      });
    },
    [player]
  );

  const closeModal = useCallback(() => {
    setModal((m) => ({ ...m, open: false }));
  }, []);

  const handleEquipOrUnequip = useCallback(() => {
    // TODO: wire to game_state::equip_* / unequip when available
    closeModal();
    refetch();
    refetchPlayer();
  }, [closeModal, refetch, refetchPlayer]);

  const handleSell = useCallback(
    async (priceSui: string) => {
      if (!modal.objectId) return;
      const priceMist = BigInt(Math.round(Number(priceSui) * 1_000_000_000));
      const itemType = equipmentNFTType(PACKAGE_ID);
      try {
        await listItem(modal.objectId, itemType, priceMist);
        closeModal();
        refetch();
      } catch (e) {
        console.error("List failed:", e);
      }
    },
    [modal.objectId, listItem, closeModal, refetch]
  );

  const handleTransfer = useCallback(() => {
    // TODO: transfer NFT to address
    closeModal();
  }, [closeModal]);

  if (!account) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-[#6D678F]/30 bg-[#252430]/40 px-6 py-12">
        <p className="text-center text-gray-400">
          Connect wallet to view inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Equipped: 4 slots as GearCards or empty placeholders */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Equipped
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {equippedSlots.map(({ slotIndex, fields }) => (
            <button
              key={slotIndex}
              type="button"
              onClick={() => openModalFromSlot(slotIndex)}
              className="group w-full max-w-[140px] justify-self-center focus:outline-none focus:ring-2 focus:ring-[#6D678F] focus:ring-offset-2 focus:ring-offset-[#1a191e] rounded-sm"
            >
              {fields ? (
                <GearCard
                  gear={{
                    slot: fields.slot,
                    set_id: fields.set_id,
                    rarity: fields.rarity,
                    atk: fields.atk,
                    hp: fields.hp,
                    acc: fields.acc,
                    def: fields.def,
                  }}
                  showMeta={false}
                  className="transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]"
                />
              ) : (
                <div
                  className={cn(
                    "flex aspect-square w-full flex-col items-center justify-center rounded-sm border-2 border-dashed transition-colors",
                    "border-[#6D678F]/50 bg-[#252430]/60 group-hover:border-[#6D678F] group-hover:bg-[#252430]/80"
                  )}
                >
                  <span className="text-xs font-medium text-gray-500">
                    {SLOT_NAMES[slotIndex]}
                  </span>
                  <span className="mt-1 text-xs text-gray-600">Empty</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Backpack: grid of GearCards */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Backpack
        </h2>
        {isPending ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-[#6D678F]/20 bg-[#252430]/30">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : gear.length === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#6D678F]/30 bg-[#252430]/20">
            <p className="text-center text-sm text-gray-500">
              No gear yet.
              <br />
              <span className="text-gray-600">Pull from Shop to get gear.</span>
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 grid-cols-4">
            {gear.map((item) => {
              const f = item.fields as EquipmentNFTFields;
              const equipped = isGearEquipped(item.objectId, player);
              return (
                <li key={item.objectId} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => openModalFromGear(item.objectId, f)}
                    className={cn(
                      "group relative w-full max-w-[140px] focus:outline-none focus:ring-2 focus:ring-[#6D678F] focus:ring-offset-2 focus:ring-offset-[#1a191e] rounded-sm",
                      "transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]"
                    )}
                  >
                    <GearCard
                      gear={{
                        slot: f.slot,
                        set_id: f.set_id,
                        rarity: f.rarity,
                        atk: f.atk,
                        hp: f.hp,
                        acc: f.acc,
                        def: f.def,
                      }}
                      showMeta={false}
                    />
                    {equipped && (
                      <span
                        className="absolute top-1 left-1 rounded bg-[#6D678F]/90 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
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

      <GearModal
        open={modal.open}
        onClose={closeModal}
        state={{
          objectId: modal.objectId,
          fields: modal.fields,
          slotIndex: modal.slotIndex,
          isEquipped: modal.isEquipped,
        }}
        onEquipOrUnequip={handleEquipOrUnequip}
        onSell={handleSell}
        onTransfer={handleTransfer}
        isSelling={isSelling}
      />
    </div>
  );
}
