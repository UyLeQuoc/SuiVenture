"use client";

import { useState } from "react";
import type { PetNFTFields } from "@/config/contracts";
import { PET_CATALOG, RARITY_NAMES } from "@/config/contracts";
import { cn } from "@/lib/utils";
import { ExternalLink, Loader2 } from "lucide-react";
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
  onSell: (priceSui: string) => void;
  onTransfer: () => void;
  isSelling?: boolean;
}

export function PetModal({
  open,
  onClose,
  state,
  onEquipOrUnequip,
  onSell,
  onTransfer,
  isSelling = false,
}: PetModalProps) {
  const [sellMode, setSellMode] = useState(false);
  const [priceInput, setPriceInput] = useState("");

  if (!open) return null;

  const { objectId, fields, isEquipped } = state;
  const petInfo = fields ? PET_CATALOG[fields.pet_id] : null;
  const name = petInfo?.name ?? (fields ? `Pet ${fields.pet_id}` : null);
  const bonusLabel = petInfo?.bonus_type ?? (fields ? `Bonus ${fields.bonus_type}` : null);

  const handleClose = () => {
    setSellMode(false);
    setPriceInput("");
    onClose();
  };

  const handleSellClick = () => {
    setSellMode(true);
  };

  const handleConfirmSell = () => {
    const trimmed = priceInput.trim();
    if (!trimmed || Number(trimmed) <= 0) return;
    onSell(trimmed);
    setSellMode(false);
    setPriceInput("");
  };

  const handleCancelSell = () => {
    setSellMode(false);
    setPriceInput("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pet-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
        onKeyDown={(e) => e.key === "Escape" && handleClose()}
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

        {/* Sell price input */}
        {sellMode && (
          <div className="mb-3 space-y-2 rounded-md bg-[#1a191e] p-3">
            <label className="block text-xs font-medium text-gray-400">
              Price (SUI)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-md border border-[#6D678F]/30 bg-[#252430] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#6D678F] focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmSell}
                disabled={!priceInput.trim() || Number(priceInput) <= 0 || isSelling}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 disabled:pointer-events-none"
                )}
              >
                {isSelling ? (
                  <span className="flex items-center justify-center gap-1">
                    <Loader2 className="size-3 animate-spin" /> Listing...
                  </span>
                ) : (
                  "Confirm"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelSell}
                className="flex-1 rounded-md bg-[#6D678F]/30 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#6D678F]/50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
            onClick={sellMode ? handleConfirmSell : handleSellClick}
            disabled={!objectId || sellMode}
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
