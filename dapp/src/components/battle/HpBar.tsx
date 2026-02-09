"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface HpBarProps {
  hp: number;
  maxHp: number;
}

export function HpBar({ hp, maxHp }: HpBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const pct = maxHp > 0 ? (hp / maxHp) * 100 : 0;

  const color =
    pct > 60 ? "bg-green-500" : pct > 30 ? "bg-yellow-500" : "bg-red-500";

  useEffect(() => {
    if (!fillRef.current) return;
    gsap.to(fillRef.current, { width: `${pct}%`, duration: 0.6, ease: "power2.out" });
  }, [pct]);

  return (
    <div className="relative h-5 w-full overflow-hidden rounded-full bg-[#252430] border border-[#6D678F]/30">
      <div
        ref={fillRef}
        className={`absolute inset-y-0 left-0 rounded-full ${color} transition-colors duration-300`}
        style={{ width: `${pct}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
        {hp} / {maxHp}
      </span>
    </div>
  );
}
