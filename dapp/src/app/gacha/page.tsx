import { GachaGearCard } from "@/components/gacha/GachaGearCard";
import { GachaPetCard } from "@/components/gacha/GachaPetCard";

export default function GachaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gacha</h1>
      <p className="text-muted-foreground">
        Pull gear or pets with SUI. Each pull costs 0.01 SUI.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <GachaGearCard />
        <GachaPetCard />
      </div>
    </div>
  );
}
