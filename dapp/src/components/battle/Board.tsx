"use client";

import { cn } from "@/lib/utils";

interface BoardProps {
  positionOnBoard: number;
  boardTileCount: number;
  floor: number;
}

export function Board({ positionOnBoard, boardTileCount, floor }: BoardProps) {
  const tiles = Array.from({ length: Number(boardTileCount) }, (_, i) => i);
  const pos = Number(positionOnBoard);

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">
        Floor {floor} · Tile {pos + 1} / {boardTileCount}
      </p>
      <div className="flex flex-wrap gap-1">
        {tiles.map((i) => (
          <div
            key={i}
            className={cn(
              "size-8 rounded text-center text-xs leading-8 font-medium",
              i === pos
                ? "border-2 border-[#6D678F] bg-[#6D678F]/30 text-white"
                : "border border-[#6D678F]/30 bg-[#252430]/60 text-gray-400"
            )}
            aria-current={i === pos ? "step" : undefined}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
