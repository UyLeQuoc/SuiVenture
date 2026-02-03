"use client";

import { cn } from "@/lib/utils";

interface PotionBarProps {
  potionCount: string;
  potionMaxCarry: string;
  potionHealAmount: string;
  onUsePotion: () => void;
  isPending: boolean;
}

export function PotionBar({
  potionCount,
  potionMaxCarry,
  potionHealAmount,
  onUsePotion,
  isPending,
}: PotionBarProps) {
  const count = Number(potionCount);
  const max = Number(potionMaxCarry);
  const heal = Number(potionHealAmount);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border p-3",
        "border-[#6D678F]/30 bg-[#252430]/60"
      )}
    >
      <span className="text-sm font-medium text-white">
        Potions: {count}/{max}
      </span>
      <span className="text-xs text-gray-400">Heal: {heal} HP</span>
      <button
        type="button"
        onClick={onUsePotion}
        disabled={count === 0 || isPending}
        className={cn(
          "ml-auto rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          "bg-[#6D678F] text-white hover:bg-[#5a5478] disabled:opacity-50 disabled:pointer-events-none"
        )}
      >
        {isPending ? "..." : "Use potion"}
      </button>
    </div>
  );
}
