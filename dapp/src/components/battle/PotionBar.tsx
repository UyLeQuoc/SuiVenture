"use client";

interface PotionBarProps {
  potionCount: string;
  potionMaxCarry: string;
  potionHealAmount: string;
  onUsePotion: () => void;
  isPending: boolean;
}

export function PotionBar({
  potionCount,
  potionMaxCarry,
  potionHealAmount,
  onUsePotion,
  isPending,
}: PotionBarProps) {
  const count = Number(potionCount);
  const max = Number(potionMaxCarry);
  const heal = Number(potionHealAmount);

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
      <span className="text-sm font-medium">
        Potions: {count}/{max}
      </span>
      <span className="text-sm text-muted-foreground">Heal: {heal} HP</span>
      <button
        type="button"
        onClick={onUsePotion}
        disabled={count === 0 || isPending}
        className="ml-auto rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "..." : "Use potion"}
      </button>
    </div>
  );
}
