"use client";

import type { PetNFTFields } from "@/config/contracts";
import { PET_CATALOG, RARITY_NAMES } from "@/config/contracts";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { PetCard } from "./PetCard";

export interface PetModalState {
  objectId: string | null;
  fields: PetNFTFields | null;
  isEquipped: boolean;
}

interface PetModalProps {
  open: boolean;
  onClose: () => void;
  state: PetModalState;
  onEquipOrUnequip: () => void;
  onSell: () => void;
  onTransfer: () => void;
}

export function PetModal({
  open,
  onClose,
  state,
  onEquipOrUnequip,
  onSell,
  onTransfer,
}: PetModalProps) {
  if (!open) return null;

  const { objectId, fields, isEquipped } = state;
  const petInfo = fields ? PET_CATALOG[fields.pet_id] : null;
  const name = petInfo?.name ?? (fields ? `Pet ${fields.pet_id}` : null);
  const bonusLabel = petInfo?.bonus_type ?? (fields ? `Bonus ${fields.bonus_type}` : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pet-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-[360px] rounded-lg border border-[#6D678F]/30 bg-[#252430] p-4 shadow-xl">
        <h2 id="pet-modal-title" className="sr-only">
          Pet details
        </h2>
        <div className="mb-2 w-20">
          <PetCard
            pet={
              fields
                ? {
                    pet_id: fields.pet_id,
                    rarity: fields.rarity,
                    bonus_type: fields.bonus_type,
                    bonus_value: fields.bonus_value,
                  }
                : { pet_id: 0, rarity: 0 }
            }
            showMeta={false}
          />
        </div>
        <div className="mb-4">
          {fields ? (
            <>
              <p className="font-medium text-white">
                {name} · {RARITY_NAMES[fields.rarity] ?? `Rarity ${fields.rarity}`}
              </p>
              <p className="text-sm text-gray-400">
                {bonusLabel} {fields.bonus_value}
              </p>
              {objectId && (
                <button
                  type="button"
                  className="mt-1 flex cursor-pointer items-center gap-1 truncate text-xs text-gray-500 hover:underline"
                  onClick={() =>
                    window.open(
                      `https://suiexplorer.com/object/${objectId}?network=testnet`,
                      "_blank"
                    )
                  }
                >
                  {objectId.slice(0, 10)}...{objectId.slice(-10)}{" "}
                  <ExternalLink size={12} />
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-400">Empty pet slot</p>
          )}
        </div>
        <footer className="flex gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={onEquipOrUnequip}
            disabled={!fields}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "bg-[#6D678F] text-white hover:bg-[#5a5478] disabled:pointer-events-none disabled:opacity-50"
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
              "bg-[#6D678F] text-white hover:bg-[#5a5478] disabled:pointer-events-none disabled:opacity-50"
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
              "bg-[#6D678F] text-white hover:bg-[#5a5478] disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            Transfer
          </button>
        </footer>
      </div>
    </div>
  );
}
