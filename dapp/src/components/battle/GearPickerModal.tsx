"use client";

import { useOwnedNFTs } from "@/data";
import { SLOT_NAMES, type EquipmentNFTFields } from "@/config/contracts";
import { GearCard } from "@/components/inventory/GearCard";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface GearPickerModalProps {
  open: boolean;
  slotIndex: number;
  onPick: (objectId: string) => void;
  onClose: () => void;
  /** Currently equipped IDs across all slots (to show "equipped" badge) */
  equippedIds: Set<string>;
}

export function GearPickerModal({
  open,
  slotIndex,
  onPick,
  onClose,
  equippedIds,
}: GearPickerModalProps) {
  const { gear, isPending } = useOwnedNFTs();

  if (!open) return null;

  const slotName = SLOT_NAMES[slotIndex] ?? `Slot ${slotIndex}`;
  const filtered = gear.filter((g) => {
    const f = g.fields as EquipmentNFTFields;
    return f.slot === slotIndex;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 w-[360px] rounded-xl border border-[#6D678F]/30 bg-[#1D1C21] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Pick {slotName}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="size-4" />
          </button>
        </div>

        {isPending ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No {slotName} gear owned.
          </p>
        ) : (
          <ul className="grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
            {filtered.map((item) => {
              const f = item.fields as EquipmentNFTFields;
              const isEquipped = equippedIds.has(item.objectId);
              return (
                <li key={item.objectId}>
                  <button
                    type="button"
                    onClick={() => onPick(item.objectId)}
                    className={cn(
                      "group relative w-full rounded-sm transition-transform hover:scale-105 active:scale-95",
                      isEquipped && "ring-2 ring-[#6D678F]"
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
                    {isEquipped && (
                      <span className="absolute top-0.5 left-0.5 rounded bg-[#6D678F]/90 px-1 py-0.5 text-[9px] font-medium text-white">
                        On
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
