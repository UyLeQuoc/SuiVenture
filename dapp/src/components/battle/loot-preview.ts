/** Compute loot drop count from floor (matches contract logic). */
export function getLootCount(floor: number): number {
  if (floor < 5) return 0;
  if (floor < 10) return 1;
  if (floor < 15) return 2;
  return 3;
}

/** Human-readable loot preview string. */
export function getLootPreview(floor: number): string {
  const count = getLootCount(floor);
  if (count === 0) return "No loot (floor < 5)";
  return `${count} gear drop${count > 1 ? "s" : ""}`;
}
