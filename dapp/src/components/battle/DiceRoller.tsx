"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Dices, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiceRollerProps {
  onRoll: () => void;
  isPending: boolean;
  disabled?: boolean;
  bossNext?: boolean;
}

export function DiceRoller({ onRoll, isPending, disabled, bossNext }: DiceRollerProps) {
  const diceRef = useRef<SVGSVGElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!diceRef.current) return;
    if (isPending) {
      tweenRef.current = gsap.to(diceRef.current, {
        rotation: 720,
        duration: 1,
        repeat: -1,
        ease: "linear",
      });
    } else {
      tweenRef.current?.kill();
      if (diceRef.current) {
        gsap.set(diceRef.current, { rotation: 0 });
      }
    }
    return () => { tweenRef.current?.kill(); };
  }, [isPending]);

  return (
    <div className="flex flex-col gap-1.5">
      {bossNext && (
        <div className="flex items-center justify-center gap-1.5 text-purple-400">
          <Crown className="size-3.5" />
          <span className="text-xs font-bold animate-pulse">Boss fight next!</span>
          <Crown className="size-3.5" />
        </div>
      )}
      <button
        type="button"
        onClick={onRoll}
        disabled={disabled || isPending}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-all",
          bossNext
            ? "bg-purple-600 text-white hover:bg-purple-500 ring-1 ring-purple-400/40"
            : "bg-[#6D678F] text-white hover:bg-[#5a5478]",
          "hover:scale-[1.02] active:scale-[0.98]",
          "disabled:opacity-50 disabled:pointer-events-none disabled:scale-100"
        )}
      >
        <Dices ref={diceRef} className="size-5" />
        {isPending ? "Rolling..." : "Roll 2d6"}
      </button>
    </div>
  );
}
