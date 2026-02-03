import { GEAR_ART_SET_COUNT, GEAR_SLOT_COUNT } from "@/config/contracts";

/**
 * Đường dẫn ảnh gear theo set_id và slot.
 * Convention: /gear/set-{set_id}-slot-{slot}.png (2 sets × 4 slots = 8 ảnh).
 * Nếu chưa có ảnh, đặt 8 file trong public/gear/ hoặc dùng fallback.
 */
export function getGearImageSrc(setId: number, slot: number): string {
  const s = Math.max(0, Math.min(setId, GEAR_ART_SET_COUNT - 1));
  const sl = Math.max(0, Math.min(slot, GEAR_SLOT_COUNT - 1));
  return `/gear/set-${s}-slot-${sl}.png`;
}
