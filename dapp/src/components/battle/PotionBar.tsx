"use client";

import { FlaskConical, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface PotionBarProps {
  potionCount: number;
  potionMaxCarry: number;
  potionHealAmount: number;
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
  return (
    <div className="flex items-center gap-3 rounded-md bg-[#1D1C21]/60 px-3 py-2">
      <div className="flex items-center gap-1.5 text-purple-300">
        <FlaskConical className="size-4" />
        <span className="text-sm font-bold">
          {potionCount}/{potionMaxCarry}
        </span>
      </div>

      <div className="flex items-center gap-1 text-green-400 text-xs">
        <HeartPulse className="size-3.5" />
        <span>+{potionHealAmount}</span>
      </div>

      <button
        type="button"
        onClick={onUsePotion}
        disabled={potionCount === 0 || isPending}
        className={cn(
          "ml-auto flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
          "bg-purple-600/80 text-white hover:bg-purple-500 disabled:opacity-40 disabled:pointer-events-none"
        )}
      >
        <FlaskConical className="size-3" />
        {isPending ? "..." : "Drink"}
      </button>
    </div>
  );
}
