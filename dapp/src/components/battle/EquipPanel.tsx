"use client";

import { useMemo, useState } from "react";
import { useOwnedNFTs } from "@/data";
import { SLOT_NAMES, type EquipmentNFTFields } from "@/config/contracts";
import { GearCard } from "@/components/inventory/GearCard";
import { GearPickerModal } from "@/components/battle/GearPickerModal";
import type { EquippedGearMap } from "@/hooks/use-equipped-gear";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface EquipPanelProps {
  equipped: EquippedGearMap;
  onEquip: (slotIndex: number, objectId: string) => void;
  onUnequip: (slotIndex: number) => void;
}

export function EquipPanel({ equipped, onEquip, onUnequip }: EquipPanelProps) {
  const { gear } = useOwnedNFTs();
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  const gearByObjectId = useMemo(() => {
    const m = new Map<string, EquipmentNFTFields>();
    for (const g of gear) {
      m.set(g.objectId, g.fields as EquipmentNFTFields);
    }
    return m;
  }, [gear]);

  const equippedIds = useMemo(() => new Set(Object.values(equipped)), [equipped]);

  // Sum stats from equipped gear
  const totalStats = useMemo(() => {
    let atk = 0, hp = 0, acc = 0, def = 0;
    for (const objectId of Object.values(equipped)) {
      const f = gearByObjectId.get(objectId);
      if (f) {
        atk += Number(f.atk ?? 0);
        hp += Number(f.hp ?? 0);
        acc += Number(f.acc ?? 0);
        def += Number(f.def ?? 0);
      }
    }
    return { atk, hp, acc, def };
  }, [equipped, gearByObjectId]);

  const hasAnyEquipped = Object.keys(equipped).length > 0;

  return (
    <>
      <div className="rounded-lg border border-[#6D678F]/30 bg-[#252430]/60 p-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Equipment <span className="text-gray-600">(Preview)</span>
        </p>

        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((slotIndex) => {
            const objectId = equipped[slotIndex];
            const fields = objectId ? gearByObjectId.get(objectId) : undefined;

            return (
              <div key={slotIndex} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    objectId ? undefined : setPickerSlot(slotIndex)
                  }
                  className={cn(
                    "w-full rounded-sm transition-transform hover:scale-105 active:scale-95",
                    !objectId && "cursor-pointer"
                  )}
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
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex aspect-square w-full flex-col items-center justify-center rounded-sm border-2 border-dashed transition-colors",
                        "border-[#6D678F]/40 bg-[#1D1C21]/60 hover:border-[#6D678F] hover:bg-[#252430]/80"
                      )}
                    >
                      <span className="text-[10px] font-medium text-gray-500">
                        {SLOT_NAMES[slotIndex]}
                      </span>
                    </div>
                  )}
                </button>
                {objectId && (
                  <button
                    type="button"
                    onClick={() => onUnequip(slotIndex)}
                    className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-600/80 text-white hover:bg-red-500 transition-colors"
                    title="Unequip"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {hasAnyEquipped && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400">
            {totalStats.atk > 0 && <span>ATK +{totalStats.atk}</span>}
            {totalStats.hp > 0 && <span>HP +{totalStats.hp}</span>}
            {totalStats.acc > 0 && <span>ACC +{totalStats.acc}</span>}
            {totalStats.def > 0 && <span>DEF +{totalStats.def}</span>}
          </div>
        )}
      </div>

      <GearPickerModal
        open={pickerSlot !== null}
        slotIndex={pickerSlot ?? 0}
        equippedIds={equippedIds}
        onPick={(objectId) => {
          if (pickerSlot !== null) onEquip(pickerSlot, objectId);
          setPickerSlot(null);
        }}
        onClose={() => setPickerSlot(null)}
      />
    </>
  );
}
