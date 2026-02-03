import { GearCard, type GearCardFields } from "@/components/inventory/GearCard";
import { RarityColorReference } from "@/components/rarity";

/** Mock gear để test: 5 ô với slot/set/rarity khác nhau. */
const MOCK_GEARS: GearCardFields[] = [
  { slot: 0, set_id: 0, rarity: 0, atk: "1", hp: "0", acc: "0", def: "0" },   // Helmet Set 0, Normal
  { slot: 1, set_id: 0, rarity: 1, atk: "2", hp: "0", acc: "0", def: "0" },   // Weapon Set 0, Rare
  { slot: 2, set_id: 1, rarity: 2, atk: "0", hp: "5", acc: "0", def: "2" },   // Shield Set 1, Epic
  { slot: 3, set_id: 1, rarity: 3, atk: "1", hp: "3", acc: "1", def: "1" },   // Boots Set 1, Legend
  { slot: 0, set_id: 1, rarity: 4, atk: "3", hp: "2", acc: "2", def: "2" },   // Helmet Set 1, Mystic
];

export default function TestRarityPage() {
  return (
    <div className="space-y-10 pb-8">
      <section>
        <p className="mb-4 text-sm text-muted-foreground">
          Rarity color reference — 5 ô mock để chỉnh style.
        </p>
        <RarityColorReference />
      </section>

      <section>
        <p className="mb-4 text-sm text-muted-foreground">
          GearCard: truyền slot, set_id, rarity → hình (set + slot), nền theo rarity.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {MOCK_GEARS.map((gear, i) => (
            <GearCard
              key={`${gear.slot}-${gear.set_id}-${gear.rarity}-${i}`}
              gear={gear}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
