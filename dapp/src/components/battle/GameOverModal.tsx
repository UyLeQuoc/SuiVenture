"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Skull, Gem, Layers, Dices } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameOverModalProps {
  open: boolean;
  floor: number;
  rollCount: number;
  gems: number;
  onEndRun: () => void;
  onEndRunWithRewards: () => void;
  isPending: boolean;
}

export function GameOverModal({
  open,
  floor,
  rollCount,
  gems,
  onEndRun,
  onEndRunWithRewards,
  isPending,
}: GameOverModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const skullRef = useRef<SVGSVGElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const tl = gsap.timeline();

    if (overlayRef.current) {
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    }
    if (skullRef.current) {
      tl.fromTo(
        skullRef.current,
        { scale: 0, rotation: -30 },
        { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.2"
      );
    }
    if (statsRef.current) {
      const items = statsRef.current.children;
      tl.fromTo(
        items,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.1, ease: "power2.out" },
        "-=0.2"
      );
    }

    return () => { tl.kill(); };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-red-500/30 bg-[#1D1C21] p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <Skull ref={skullRef} className="size-16 text-red-500" />
          <h2 className="text-2xl font-bold text-red-400">Game Over</h2>

          <div ref={statsRef} className="w-full space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-[#252430] px-3 py-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Layers className="size-4" />
                <span className="text-sm">Floor Reached</span>
              </div>
              <span className="text-sm font-bold text-white">{floor}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#252430] px-3 py-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Dices className="size-4" />
                <span className="text-sm">Rolls Made</span>
              </div>
              <span className="text-sm font-bold text-white">{rollCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#252430] px-3 py-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Gem className="size-4" />
                <span className="text-sm">Gems Earned</span>
              </div>
              <span className="text-sm font-bold text-cyan-300">{gems}</span>
            </div>
          </div>

          <div className="flex w-full gap-2 pt-2">
            <button
              type="button"
              onClick={onEndRun}
              disabled={isPending}
              className={cn(
                "flex-1 rounded-lg border border-[#6D678F]/30 px-3 py-2.5 text-sm font-medium transition-colors",
                "text-gray-300 hover:bg-[#6D678F]/20 disabled:opacity-50"
              )}
            >
              End Run
            </button>
            <button
              type="button"
              onClick={onEndRunWithRewards}
              disabled={isPending || gems === 0}
              className={cn(
                "flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors",
                "bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50"
              )}
            >
              {isPending ? "..." : `Collect ${gems} Gems`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
