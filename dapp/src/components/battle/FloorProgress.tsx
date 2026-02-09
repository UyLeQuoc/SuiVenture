"use client";

interface FloorProgressProps {
  floor: number;
  maxFloor?: number;
}

export function FloorProgress({ floor, maxFloor = 15 }: FloorProgressProps) {
  const pct = (floor / maxFloor) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-gray-500 px-0.5">
        <span>F1</span>
        <span>F{maxFloor}</span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#252430] border border-[#6D678F]/20">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#6D678F] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
