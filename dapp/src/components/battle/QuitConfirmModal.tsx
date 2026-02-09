"use client";

import { cn } from "@/lib/utils";
import { LogOut, Gem, Package, X } from "lucide-react";
import { getLootCount, getLootPreview } from "./loot-preview";

interface QuitConfirmModalProps {
  open: boolean;
  floor: number;
  gems: number;
  onAbandon: () => void;
  onCollectGems: () => void;
  onCollectWithLoot: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function QuitConfirmModal({
  open,
  floor,
  gems,
  onAbandon,
  onCollectGems,
  onCollectWithLoot,
  onCancel,
  isPending,
}: QuitConfirmModalProps) {
  if (!open) return null;

  const lootCount = getLootCount(floor);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative z-10 w-[360px] rounded-xl border border-amber-500/30 bg-[#1D1C21] p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LogOut className="size-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Quit Run?</h3>
          </div>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="size-4" />
          </button>
        </div>

        <p className="text-sm text-gray-300 mb-3">
          You{"'"}ll keep rewards based on your progress.
        </p>

        {/* Loot preview */}
        <div className="flex items-center gap-3 rounded-lg bg-[#252430] px-3 py-2 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-300">
            <Gem className="size-3.5 text-cyan-400" />
            <span>{gems} gems</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-300">
            <Package className="size-3.5 text-amber-400" />
            <span>Floor {floor} &rarr; {getLootPreview(floor)}</span>
          </div>
        </div>

        {/* 3 options */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onAbandon}
            disabled={isPending}
            className={cn(
              "w-full rounded-lg border border-[#6D678F]/30 px-3 py-2.5 text-sm font-medium transition-colors",
              "text-gray-400 hover:bg-[#6D678F]/20 disabled:opacity-50"
            )}
          >
            Abandon (no rewards)
          </button>

          <button
            type="button"
            onClick={onCollectGems}
            disabled={isPending || gems === 0}
            className={cn(
              "w-full rounded-lg px-3 py-2.5 text-sm font-bold transition-colors",
              "bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50"
            )}
          >
            {isPending ? "..." : `Collect ${gems} Gems`}
          </button>

          <button
            type="button"
            onClick={onCollectWithLoot}
            disabled={isPending || lootCount === 0}
            className={cn(
              "w-full rounded-lg px-3 py-2.5 text-sm font-bold transition-colors",
              "bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50"
            )}
          >
            {isPending ? "..." : `Collect Gems + ${lootCount} Loot`}
          </button>
        </div>
      </div>
    </div>
  );
}
