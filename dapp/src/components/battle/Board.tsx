"use client";

import { cn } from "@/lib/utils";
import { Swords, Crown, HeartPulse, Zap, Gift, User } from "lucide-react";
import type { DetectedEvent } from "@/hooks/use-event-detection";

/** Map of tile index -> event that happened there */
export type TileEventMap = Record<number, DetectedEvent>;

interface BoardProps {
  positionOnBoard: number;
  boardTileCount: number;
  floor: number;
  tileEvents?: TileEventMap;
}

const EVENT_ICON_MAP = {
  combat: { icon: Swords, color: "text-orange-400" },
  boss: { icon: Crown, color: "text-purple-400" },
  heal: { icon: HeartPulse, color: "text-green-400" },
  bad_event: { icon: Zap, color: "text-red-400" },
  lucky_gacha: { icon: Gift, color: "text-amber-400" },
} as const;

function getTileEvent(event: DetectedEvent) {
  if (!event) return null;
  const key = event.type === "combat" && event.isBoss ? "boss" : event.type;
  return EVENT_ICON_MAP[key];
}

/**
 * 8-column x 4-row serpentine board grid.
 * Row 0: L->R (0-7), Row 1: R->L (8-15), etc.
 * Shows event icons on tiles where events already happened.
 */
export function Board({ positionOnBoard, boardTileCount, floor, tileEvents = {} }: BoardProps) {
  const pos = Number(positionOnBoard);
  const total = Number(boardTileCount);
  const cols = 8;
  const rows = Math.ceil(total / cols);

  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx < total) row.push(idx);
    }
    if (r % 2 === 1) row.reverse();
    grid.push(row);
  }

  return (
    <div className="rounded-lg border border-[#6D678F]/30 bg-[#252430]/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">
          Floor {floor}
        </p>
        <p className="text-[10px] text-gray-500">
          Tile {pos + 1}/{total}
        </p>
      </div>

      <div className="flex flex-col gap-[3px]">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-[3px] justify-center">
            {row.map((tileIdx) => {
              const isCurrent = tileIdx === pos;
              const isPassed = tileIdx < pos;
              const tileEvent = tileEvents[tileIdx];
              const eventCfg = getTileEvent(tileEvent);

              return (
                <div
                  key={tileIdx}
                  className={cn(
                    "relative size-10 rounded-md flex items-center justify-center transition-all duration-300",
                    isCurrent &&
                      "border-2 border-[#6D678F] bg-[#6D678F]/40 animate-[pulse-glow_1.5s_ease-in-out_infinite]",
                    isPassed && !isCurrent &&
                      "border border-[#6D678F]/15 bg-[#1D1C21]/60",
                    !isCurrent && !isPassed &&
                      "border border-[#6D678F]/25 bg-[#252430]/80"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCurrent ? (
                    <User className="size-4 text-white" />
                  ) : isPassed && eventCfg ? (
                    <eventCfg.icon className={cn("size-3.5", eventCfg.color, "opacity-60")} />
                  ) : (
                    <span className={cn(
                      "text-[9px] font-bold",
                      isPassed ? "text-gray-700" : "text-gray-500"
                    )}>
                      {tileIdx + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
        {Object.entries(EVENT_ICON_MAP).map(([key, { icon: Icon, color }]) => (
          <div key={key} className="flex items-center gap-1">
            <Icon className={cn("size-2.5", color)} />
            <span className="text-[8px] text-gray-500 capitalize">
              {key === "bad_event" ? "Trap" : key === "lucky_gacha" ? "Lucky" : key}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
