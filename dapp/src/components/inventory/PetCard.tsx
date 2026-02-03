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

/** SVG icon cho từng pet_id: Ember, Shell, Whisper, Bloom, Spark */
function PetIcon({ petId, className }: { petId: number; className?: string }) {
  const c = className ?? "size-full";
  switch (petId) {
    case 0: // Ember - flame
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case 1: // Shell - turtle
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 22a8 8 0 0 0 8-8c0-4-2-6-2-6H6s-2 2-2 6a8 8 0 0 0 8 8z" />
          <path d="M6 8h12" />
          <path d="M8 12h8" />
        </svg>
      );
    case 2: // Whisper - ghost
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 10h.01" />
          <path d="M15 10h.01" />
          <path d="M12 2a8 8 0 0 0-8 8v12l2-2 2 2 2-2 2 2 2-2 2 2V10a8 8 0 0 0-8-8z" />
        </svg>
      );
    case 3: // Bloom - flower
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 22v-4" />
          <path d="M12 18a6 6 0 0 0 6-6c0-4-6-6-6-6s-6 2-6 6a6 6 0 0 0 6 6z" />
          <path d="M12 14v-2" />
          <path d="M12 12a6 6 0 0 0 6-6c0-2-2-4-6-6-4 2-6 4-6 6a6 6 0 0 0 6 6z" />
          <path d="M12 8V6" />
          <path d="M12 6a4 4 0 0 0 4-4 4 4 0 0 0-4-4 4 4 0 0 0-4 4 4 4 0 0 0 4 4z" />
        </svg>
      );
    case 4: // Spark - lightning
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m13 2 3 8h5l-4 6 2-8h-6z" />
          <path d="M9 12 6 22l4-6H4l6-4z" />
        </svg>
      );
    default:
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
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
          <PetIcon petId={pet.pet_id} />
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
