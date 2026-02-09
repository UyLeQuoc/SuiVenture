"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Heart, Sword, Shield, Crosshair, Gem, Layers } from "lucide-react";
import { HpBar } from "./HpBar";

interface StatsPanelProps {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  acc: number;
  floor: number;
  gems: number;
}

export function StatsPanel({ hp, maxHp, atk, def, acc, floor, gems }: StatsPanelProps) {
  const gemRef = useRef<HTMLSpanElement>(null);
  const prevGems = useRef(gems);

  useEffect(() => {
    if (gems > prevGems.current && gemRef.current) {
      gsap.fromTo(
        gemRef.current,
        { scale: 1.4 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }
      );
    }
    prevGems.current = gems;
  }, [gems]);

  return (
    <div className="rounded-lg border border-[#6D678F]/30 bg-[#252430]/60 p-3 space-y-2">
      {/* HP Row */}
      <div className="flex items-center gap-2">
        <Heart className="size-4 shrink-0 text-red-400" />
        <HpBar hp={hp} maxHp={maxHp} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-orange-300">
          <Sword className="size-3.5" />
          <span className="font-medium">{atk}</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-300">
          <Shield className="size-3.5" />
          <span className="font-medium">{def}</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-300">
          <Crosshair className="size-3.5" />
          <span className="font-medium">{acc}</span>
        </div>
      </div>

      {/* Floor & Gems Row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-gray-300">
          <Layers className="size-3.5" />
          <span>Floor {floor}/15</span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-300">
          <Gem className="size-3.5" />
          <span ref={gemRef} className="font-medium inline-block">{gems} gems</span>
        </div>
      </div>
    </div>
  );
}
