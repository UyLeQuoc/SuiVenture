"use client";

import { cn } from "@/lib/utils";

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
  onBuy: (upgrade: number) => void;
  isPending: boolean;
}

const UPGRADES = [
  { id: 0, label: "Potion Heal +10", upgrade: 0 },
  { id: 1, label: "Potion Carry +1", upgrade: 1 },
  { id: 2, label: "Temp ATK +5", upgrade: 2 },
  { id: 3, label: "1 Potion", upgrade: 3 },
] as const;

export function ShopModal({
  open,
  onClose,
  onBuy,
  isPending,
}: ShopModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-title"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-sm rounded-lg border bg-[#252430] p-4 shadow-xl border-[#6D678F]/30">
        <h2 id="shop-title" className="text-lg font-semibold text-white">
          Shop
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Buy an upgrade (blue gems).
        </p>
        <ul className="mt-4 space-y-2">
          {UPGRADES.map(({ id, label, upgrade }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onBuy(upgrade)}
                disabled={isPending}
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-left text-sm font-medium transition-colors",
                  "border-[#6D678F]/30 bg-[#1D1C21] text-white hover:bg-[#6D678F]/20 disabled:opacity-50"
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "mt-4 w-full rounded-md border py-2 text-sm font-medium transition-colors",
            "border-[#6D678F]/30 text-gray-300 hover:bg-[#6D678F]/20"
          )}
        >
          Close
        </button>
      </div>
    </div>
  );
}
