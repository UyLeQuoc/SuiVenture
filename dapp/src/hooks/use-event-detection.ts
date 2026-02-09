import { type RunFields } from "@/config/contracts";

export type DetectedEvent =
  | { type: "combat"; gemsGained: number; damageTaken: number; isBoss: boolean }
  | { type: "heal"; hpGained: number }
  | { type: "bad_event"; hpLost: number }
  | { type: "lucky_gacha"; potionsGained: number }
  | null;

/**
 * Detect what event happened by diffing RunFields before and after a roll.
 * The contract doesn't emit events, so we infer from state changes.
 */
export function detectEvent(
  prev: RunFields,
  next: RunFields
): DetectedEvent {
  const prevHp = Number(prev.current_hp);
  const nextHp = Number(next.current_hp);
  const prevGems = Number(prev.blue_gems);
  const nextGems = Number(next.blue_gems);
  const prevPotions = Number(prev.potion_count);
  const nextPotions = Number(next.potion_count);
  const rollCount = Number(next.roll_count);

  const hpDiff = nextHp - prevHp;
  const gemDiff = nextGems - prevGems;
  const potionDiff = nextPotions - prevPotions;

  // Combat: gems increased (enemy drops gems)
  if (gemDiff > 0) {
    const isBoss = rollCount % 5 === 0 && rollCount > 0;
    return {
      type: "combat",
      gemsGained: gemDiff,
      damageTaken: hpDiff < 0 ? Math.abs(hpDiff) : 0,
      isBoss,
    };
  }

  // Lucky gacha: potions increased (and no gem/heal change from potions)
  if (potionDiff > 0) {
    return { type: "lucky_gacha", potionsGained: potionDiff };
  }

  // Heal: HP increased with no gem or potion change
  if (hpDiff > 0) {
    return { type: "heal", hpGained: hpDiff };
  }

  // Bad event: HP decreased with no gem change
  if (hpDiff < 0) {
    return { type: "bad_event", hpLost: Math.abs(hpDiff) };
  }

  return null;
}
