"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { HeartPulse, Package, Sword, FlaskConical, Store, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
  onBuy: (upgrade: number) => void;
  isPending: boolean;
  potionHealAmount: number;
  potionMaxCarry: number;
  tempAtk: number;
  potionCount: number;
}

const UPGRADES = [
  {
    id: 0,
    icon: HeartPulse,
    label: "Heal Power",
    desc: "+10 potion heal",
    color: "text-green-400",
    valueFn: (p: ShopModalProps) => p.potionHealAmount,
  },
  {
    id: 1,
    icon: Package,
    label: "Carry Cap",
    desc: "+1 max potions",
    color: "text-amber-300",
    valueFn: (p: ShopModalProps) => p.potionMaxCarry,
  },
  {
    id: 2,
    icon: Sword,
    label: "ATK Up",
    desc: "+5 attack",
    color: "text-orange-400",
    valueFn: (p: ShopModalProps) => p.tempAtk,
  },
  {
    id: 3,
    icon: FlaskConical,
    label: "Buy Potion",
    desc: "+1 potion",
    color: "text-purple-300",
    valueFn: (p: ShopModalProps) => `${p.potionCount}/${p.potionMaxCarry}`,
  },
] as const;

export function ShopModal(props: ShopModalProps) {
  const { open, onClose, onBuy, isPending } = props;
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !gridRef.current) return;
    const cards = gridRef.current.children;
    gsap.fromTo(
      cards,
      { y: 20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: "power2.out" }
    );
  }, [open]);

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
      <div className="relative z-10 w-[360px] rounded-xl border bg-[#1D1C21] p-5 shadow-2xl border-[#6D678F]/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Store className="size-5 text-[#6D678F]" />
            <h2 id="shop-title" className="text-lg font-bold text-white">
              Shop
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-white hover:bg-[#6D678F]/20 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 gap-2">
          {UPGRADES.map(({ id, icon: Icon, label, desc, color, valueFn }) => (
            <button
              key={id}
              type="button"
              onClick={() => onBuy(id)}
              disabled={isPending}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all",
                "border-[#6D678F]/30 bg-[#252430] hover:bg-[#6D678F]/20 hover:border-[#6D678F]/60",
                "disabled:opacity-50 disabled:pointer-events-none"
              )}
            >
              <Icon className={cn("size-6", color)} />
              <span className="text-xs font-bold text-white">{label}</span>
              <span className="text-[10px] text-gray-400">{desc}</span>
              <span className="text-[10px] text-gray-500">
                Current: {valueFn(props)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
