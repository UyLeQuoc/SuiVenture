"use client";

import { PET_CATALOG, RARITY_NAMES } from "@/config/contracts";
import { RARITY_STYLES } from "@/components/rarity";
import { cn } from "@/lib/utils";

/** Props pet: pet_id, rarity, bonus (optional). */
export interface PetCardFields {
  pet_id: number;
  rarity: number;
  bonus_type?: number;
  bonus_value?: string;
}

interface PetCardProps {
  pet: PetCardFields;
  /** Có hiện tên + rarity dưới ảnh không. */
  showMeta?: boolean;
  className?: string;
}

/** Màu cuối gradient (top→bottom: đen → màu rarity). */
const RARITY_GRADIENT_END: Record<number, string> = {
  0: "#4b5563",
  1: "#2563eb",
  2: "#9333ea",
  3: "#d97706",
  4: "#db2777",
};

/** Ảnh pet: 1 ảnh tĩnh mỗi pet_id. Map pet_id → file trong /pets. */
const PET_IMAGE_SRC: Record<number, string> = {
  0: "/pets/ember.png",
  1: "/pets/turtle.png",
  2: "/pets/ghost.png",
  3: "/pets/plant.png",
  4: "/pets/electric.png",
};

/** Hiển thị ảnh pet (1 ảnh, không sprite). */
function PetImage({ petId, className }: { petId: number; className?: string }) {
  const src = PET_IMAGE_SRC[petId];
  if (!src) {
    return (
      <div
        className={cn("size-full rounded-full bg-white/10", className)}
        aria-hidden
      />
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={100}
      height={100}
      className={cn("size-full object-cover scale-[1.2]", className)}
      aria-hidden
    />
  );
}

export function PetCard({ pet, showMeta = true, className }: PetCardProps) {
  const style = RARITY_STYLES[pet.rarity] ?? RARITY_STYLES[0];
  const gradientEnd = RARITY_GRADIENT_END[pet.rarity] ?? RARITY_GRADIENT_END[0];
  const info = PET_CATALOG[pet.pet_id];
  const name = info?.name ?? `Pet ${pet.pet_id}`;
  const rarityName = RARITY_NAMES[pet.rarity] ?? `Rarity ${pet.rarity}`;

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
      {/* Khu vực SVG pet */}
      <div className="relative flex flex-1 items-center justify-center bg-black/20 p-4">
        <div className="size-14 opacity-95">
          <PetImage petId={pet.pet_id} />
        </div>
      </div>
      {showMeta && (
        <div className="border-t border-white/20 px-2 py-1.5 text-center">
          <p className="truncate text-xs font-medium">{name}</p>
          <p className="text-[10px] opacity-90">{rarityName}</p>
        </div>
      )}
    </div>
  );
}
