"use client";

import type { EquipmentNFTFields } from "@/config/contracts";
import { RARITY_NAMES, SLOT_NAMES } from "@/config/contracts";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export interface GearModalState {
  objectId: string | null;
  fields: EquipmentNFTFields | null;
  slotIndex: number | null;
  isEquipped: boolean;
}

interface GearModalProps {
  open: boolean;
  onClose: () => void;
  state: GearModalState;
  onEquipOrUnequip: () => void;
  onSell: () => void;
  onTransfer: () => void;
}

export function GearModal({
  open,
  onClose,
  state,
  onEquipOrUnequip,
  onSell,
  onTransfer,
}: GearModalProps) {
  if (!open) return null;

  const { objectId, fields, slotIndex, isEquipped } = state;
  const slotName = slotIndex !== null ? SLOT_NAMES[slotIndex] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gear-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-[360px] rounded-lg border border-[#6D678F]/30 bg-[#252430] p-4 shadow-xl">
        <h2 id="gear-modal-title" className="sr-only">
          Gear details
        </h2>
        <div className="mb-4">
          {fields ? (
            <>
              <p className="font-medium text-white">
                {SLOT_NAMES[fields.slot]} · Set {fields.set_id} ·{" "}
                {RARITY_NAMES[fields.rarity] ?? `Rarity ${fields.rarity}`}
              </p>
              <p className="text-sm text-gray-400">
                ATK +{fields.atk} HP +{fields.hp} ACC +{fields.acc} DEF +{fields.def}
              </p>
              {objectId && (
                <button type="button" className="mt-1 truncate text-xs text-gray-500 flex gap-1 items-center hover:underline cursor-pointer" onClick={() => window.open(`https://suiexplorer.com/object/${objectId}?network=testnet`, "_blank")}>{objectId.slice(0, 10)}...{objectId.slice(-10)} <ExternalLink size={12} /></button>
              )}
            </>
          ) : (
            <p className="text-gray-400">
              {slotName ? `Empty slot: ${slotName}` : "No gear selected"}
            </p>
          )}
        </div>
        <footer className="flex gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={onEquipOrUnequip}
            disabled={!fields}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "bg-[#6D678F] text-white hover:bg-[#5a5478] disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            {isEquipped ? "Unequip" : "Equip"}
          </button>
          <button
            type="button"
            onClick={onSell}
            disabled={!objectId}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "bg-[#6D678F] text-white hover:bg-[#5a5478] disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            Sell
          </button>
          <button
            type="button"
            onClick={onTransfer}
            disabled={!objectId}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "bg-[#6D678F] text-white hover:bg-[#5a5478] disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            Transfer
          </button>
        </footer>
      </div>
    </div>
  );
}
