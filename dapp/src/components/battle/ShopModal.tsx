"use client";

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
  onBuy: (upgrade: number) => void;
  isPending: boolean;
}

const UPGRADES = [
  { id: 0, label: "Potion Heal +10", upgrade: 0 },
  { id: 1, label: "Potion Carry +1", upgrade: 1 },
  { id: 2, label: "Temp ATK +5", upgrade: 2 },
  { id: 3, label: "1 Potion", upgrade: 3 },
] as const;

export function ShopModal({
  open,
  onClose,
  onBuy,
  isPending,
}: ShopModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-title"
    >
      <div className="w-full max-w-sm rounded-lg border bg-background p-4 shadow-lg">
        <h2 id="shop-title" className="text-lg font-semibold">
          Shop
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Buy an upgrade (blue gems).
        </p>
        <ul className="mt-4 space-y-2">
          {UPGRADES.map(({ id, label, upgrade }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onBuy(upgrade)}
                disabled={isPending}
                className="w-full rounded-md border bg-muted/50 px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-md border py-2 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
