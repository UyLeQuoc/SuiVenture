"use client";

import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { cn } from "@/lib/utils";
import { Package, ShoppingBag } from "lucide-react";

export default function MarketplacePage() {
  const account = useCurrentAccount();

  if (!account) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-[#6D678F]/30 bg-[#252430]/40 px-6 py-12">
        <p className="text-center text-gray-400">
          Connect wallet to use the marketplace.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Buy
        </h2>
        <div
          className={cn(
            "flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#6D678F]/30 bg-[#252430]/20 p-6"
          )}
        >
          <ShoppingBag className="size-10 text-[#6D678F]/60" aria-hidden />
          <p className="text-center text-sm text-gray-400">
            Listings from other players
          </p>
          <p className="text-center text-xs text-gray-500">
            Kiosk integration coming soon. You can get gear & pets from Gacha
            until then.
          </p>
          <Link
            href="/gacha"
            className="rounded-md bg-[#6D678F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5a5478]"
          >
            Open Gacha
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Sell
        </h2>
        <div
          className={cn(
            "flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border border-[#6D678F]/30 bg-[#252430]/40 p-6"
          )}
        >
          <Package className="size-10 text-[#6D678F]/60" aria-hidden />
          <p className="text-center text-sm text-gray-400">
            Sell your gear and pets
          </p>
          <p className="text-center text-xs text-gray-500">
            Open Inventory or Pet, select an item and use the &quot;Sell&quot;
            button in the detail modal. Kiosk listing will be wired when
            available.
          </p>
          <div className="flex gap-2">
            <Link
              href="/inventory"
              className="rounded-md bg-[#6D678F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5a5478]"
            >
              Gear
            </Link>
            <Link
              href="/pet"
              className="rounded-md bg-[#6D678F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5a5478]"
            >
              Pets
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
