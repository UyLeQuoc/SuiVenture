"use client";

import { RARITY_NAMES, SLOT_NAMES } from "@/config/contracts";
import { RARITY_STYLES } from "@/components/rarity";
import { getGearImageSrc } from "@/lib/gear-image";
import { cn } from "@/lib/utils";
import { HardHat, Shield, Shirt, Sword } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

/** Props giống gear: slot + set_id → hình, rarity → màu nền. */
export interface GearCardFields {
  slot: number;
  set_id: number;
  rarity: number;
  atk?: string;
  hp?: string;
  acc?: string;
  def?: string;
}

interface GearCardProps {
  /** Dữ liệu gear (slot, set_id, rarity, stats). */
  gear: GearCardFields;
  /** Có hiện tên slot + set + rarity và stats không. */
  showMeta?: boolean;
  /** Có hiện ảnh gear không (nếu false chỉ nền rarity + label). */
  showImage?: boolean;
  /** Ảnh thay thế khi không load được hoặc chưa có file. */
  fallbackImageSrc?: string;
  className?: string;
}

const DEFAULT_FALLBACK = "/gear.png";

/** Màu cuối gradient (top→bottom: đen → màu rarity). */
const RARITY_GRADIENT_END: Record<number, string> = {
  0: "#4b5563", // gray-600
  1: "#2563eb", // blue-600
  2: "#9333ea", // purple-600
  3: "#d97706", // amber-600
  4: "#db2777", // pink-600
};

/** Slot 0 Helmet, 1 Armor, 2 Weapon, 3 Shield – icon nhỏ góc phải dưới */
const SLOT_ICONS: LucideIcon[] = [HardHat, Shirt, Sword, Shield];

export function GearCard({
  gear,
  showMeta = true,
  showImage = true,
  fallbackImageSrc = DEFAULT_FALLBACK,
  className,
}: GearCardProps) {
  const [imgError, setImgError] = useState(false);
  const style = RARITY_STYLES[gear.rarity] ?? RARITY_STYLES[0];
  const gradientEnd = RARITY_GRADIENT_END[gear.rarity] ?? RARITY_GRADIENT_END[0];
  const slotName = SLOT_NAMES[gear.slot] ?? `Slot ${gear.slot}`;
  const rarityName = RARITY_NAMES[gear.rarity] ?? `Rarity ${gear.rarity}`;
  const imageSrc = getGearImageSrc(gear.set_id, gear.slot);
  const useFallback = imgError || !showImage;

  const SlotIcon = SLOT_ICONS[gear.slot] ?? HardHat;

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-sm border-2 transition-colors aspect-square",
        style.border,
        style.text,
        className
      )}
      style={{
        background: `linear-gradient(to bottom, #201D22 0%, ${gradientEnd} 100%)`,
      }}
    >
      {/* Ô nhỏ góc phải dưới: kí hiệu slot (kiếm, khiên, nón, giày) */}
      <div
        className="absolute bottom-0 right-0 flex size-5 items-center justify-center rounded bg-black/70 backdrop-blur-sm"
        aria-hidden
      >
        <SlotIcon className="size-3 opacity-90" strokeWidth={2.5} />
      </div>
      {/* Khu vực hình: ảnh gear hoặc placeholder */}
      <div className="relative flex flex-1 items-center justify-center bg-black/20 p-3">
        {showImage ? (
          useFallback ? (
            <img
              src={fallbackImageSrc}
              alt={slotName}
              width={64}
              height={64}
              className="object-contain opacity-80"
            />
          ) : (
            <img
              src={imageSrc}
              alt={`${slotName} Set ${gear.set_id}`}
              width={80}
              height={80}
              className="object-contain"
              onError={() => setImgError(true)}
            />
          )
        ) : (
          <span className="text-center text-sm font-medium opacity-90">
            {slotName}
            <br />
            Set {gear.set_id}
          </span>
        )}
      </div>

      {/* {showMeta && (
        <div className="border-t border-white/20 px-3 py-2 text-center">
          <p className="font-medium">
            {slotName} · Set {gear.set_id}
          </p>
          <p className="text-xs opacity-90">{rarityName}</p>
          {(gear.atk !== undefined || gear.hp !== undefined) && (
            <p className="mt-1 text-xs opacity-75">
              ATK +{gear.atk ?? "0"} HP +{gear.hp ?? "0"} ACC +{gear.acc ?? "0"}{" "}
              DEF +{gear.def ?? "0"}
            </p>
          )}
        </div>
      )} */}
    </div>
  );
}
