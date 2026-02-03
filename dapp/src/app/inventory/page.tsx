"use client";

import { useCallback, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useOwnedNFTs } from "@/data";
import { usePlayer } from "@/data";
import {
  RARITY_NAMES,
  SLOT_NAMES,
  type EquipmentNFTFields,
  type PlayerFields,
} from "@/config/contracts";
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
      <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
        Connect wallet to view inventory.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Section 1: 4 equipped slots (no title) */}
      <div className="grid grid-cols-4 gap-2">
        {equippedSlots.map(({ slotIndex, fields }) => (
          <button
            key={slotIndex}
            type="button"
            onClick={() => openModalFromSlot(slotIndex)}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 min-h-[88px] transition-colors",
              "border-[#6D678F]/50 bg-[#252430]/60 hover:border-[#6D678F] hover:bg-[#252430]"
            )}
          >
            <span className="text-xs font-medium text-gray-400">
              {SLOT_NAMES[slotIndex]}
            </span>
            {fields ? (
              <span className="mt-1 text-center text-xs text-white">
                {RARITY_NAMES[fields.rarity]} · +{fields.atk}
              </span>
            ) : (
              <span className="mt-1 text-xs text-gray-500">Empty</span>
            )}
          </button>
        ))}
      </div>

      {/* Section 2: list of gear (no title) */}
      {isPending ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : gear.length === 0 ? (
        <p className="text-sm text-gray-400">No gear. Pull from Shop.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {gear.map((item) => {
            const f = item.fields as EquipmentNFTFields;
            const equipped = isGearEquipped(item.objectId, player);
            return (
              <li key={item.objectId}>
                <button
                  type="button"
                  onClick={() => openModalFromGear(item.objectId, f)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    "border-[#6D678F]/30 bg-[#252430]/60 hover:border-[#6D678F] hover:bg-[#252430]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">
                        {SLOT_NAMES[f.slot]} · Set {f.set_id} ·{" "}
                        {RARITY_NAMES[f.rarity] ?? `Rarity ${f.rarity}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        ATK +{f.atk} HP +{f.hp} ACC +{f.acc} DEF +{f.def}
                      </p>
                    </div>
                    {equipped && (
                      <span className="shrink-0 rounded bg-[#6D678F] px-2 py-0.5 text-xs font-medium text-white">
                        Equipped
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

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
      />
    </div>
  );
}
