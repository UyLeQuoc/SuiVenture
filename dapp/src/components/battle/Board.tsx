"use client";

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
      <p className="text-sm text-muted-foreground">
        Floor {floor} · Tile {pos + 1} / {boardTileCount}
      </p>
      <div className="flex flex-wrap gap-1">
        {tiles.map((i) => (
          <div
            key={i}
            className={
              i === pos
                ? "size-8 rounded border-2 border-primary bg-primary/20 text-center text-xs leading-8 font-semibold"
                : "size-8 rounded border border-border bg-muted/50 text-center text-xs leading-8"
            }
            aria-current={i === pos ? "step" : undefined}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
