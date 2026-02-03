import { RARITY_NAMES } from "@/config/contracts";
import { RaritySwatch } from "./RaritySwatch";

/** Grid 5 ô rarity (mock) để xem và chỉnh style. */
export function RarityColorReference() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {RARITY_NAMES.map((name, index) => (
        <RaritySwatch key={name} rarityIndex={index} />
      ))}
    </div>
  );
}
