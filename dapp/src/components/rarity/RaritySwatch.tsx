import { RARITY_NAMES } from "@/config/contracts";
import { cn } from "@/lib/utils";

/** Rarity style map: bg, border, text. Dùng chung cho swatch và inventory. */
export const RARITY_STYLES: Record<
  number,
  { bg: string; border: string; text: string }
> = {
  0: {
    bg: "bg-gray-600/40",
    border: "border-gray-400/60",
    text: "text-gray-400",
  },
  1: {
    bg: "bg-blue-600/40",
    border: "border-blue-400/60",
    text: "text-blue-400",
  },
  2: {
    bg: "bg-purple-600/40",
    border: "border-purple-400/60",
    text: "text-purple-400",
  },
  3: {
    bg: "bg-amber-600/40",
    border: "border-amber-400/60",
    text: "text-amber-400",
  },
  4: {
    bg: "bg-pink-600/40",
    border: "border-pink-400/60",
    text: "text-pink-400",
  },
};

interface RaritySwatchProps {
  rarityIndex: number;
  showLabel?: boolean;
  className?: string;
}

export function RaritySwatch({
  rarityIndex,
  showLabel = true,
  className,
}: RaritySwatchProps) {
  const style = RARITY_STYLES[rarityIndex] ?? RARITY_STYLES[0];
  const name = RARITY_NAMES[rarityIndex] ?? `Rarity ${rarityIndex}`;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 p-6 min-h-[120px] transition-colors",
        style.bg,
        style.border,
        style.text,
        className
      )}
    >
      <span className="font-medium">{name}</span>
      {showLabel && (
        <span className="mt-1 text-xs opacity-80">Rarity {rarityIndex}</span>
      )}
    </div>
  );
}
