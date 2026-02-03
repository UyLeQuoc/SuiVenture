"use client";

import { RARITY_NAMES, SLOT_NAMES } from "@/config/contracts";
import { RARITY_STYLES } from "@/components/rarity";
import { getGearImageSrc } from "@/lib/gear-image";
import { cn } from "@/lib/utils";
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

export function GearCard({
  gear,
  showMeta = true,
  showImage = true,
  fallbackImageSrc = DEFAULT_FALLBACK,
  className,
}: GearCardProps) {
  const [imgError, setImgError] = useState(false);
  const style = RARITY_STYLES[gear.rarity] ?? RARITY_STYLES[0];
  const slotName = SLOT_NAMES[gear.slot] ?? `Slot ${gear.slot}`;
  const rarityName = RARITY_NAMES[gear.rarity] ?? `Rarity ${gear.rarity}`;
  const imageSrc = getGearImageSrc(gear.set_id, gear.slot);
  const useFallback = imgError || !showImage;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border-2 transition-colors",
        style.bg,
        style.border,
        style.text,
        className
      )}
    >
      {/* Khu vực hình: ảnh gear hoặc placeholder */}
      <div className="relative flex min-h-[100px] items-center justify-center bg-black/20 p-3">
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

      {showMeta && (
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
      )}
    </div>
  );
}
