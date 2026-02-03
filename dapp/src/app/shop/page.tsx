"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { GachaGearCard } from "@/components/gacha/GachaGearCard";
import { GachaPetCard } from "@/components/gacha/GachaPetCard";

export default function ShopPage() {
  const account = useCurrentAccount();

  if (!account) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
        Connect wallet to pull gear or pets.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="flex flex-col gap-4">
        <GachaGearCard />
        <GachaPetCard />
      </div>
    </div>
  );
}
