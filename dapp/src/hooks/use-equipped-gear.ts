"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "suiventure:equipped";

/** slotIndex (0-3) → objectId */
export type EquippedGearMap = Record<number, string>;

// Cached empty object for server snapshot (must be referentially stable)
const EMPTY_MAP: EquippedGearMap = {};

let cachedSnapshot: EquippedGearMap = EMPTY_MAP;

function readStorage(): EquippedGearMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EquippedGearMap) : EMPTY_MAP;
  } catch {
    return EMPTY_MAP;
  }
}

function getSnapshot(): EquippedGearMap {
  return cachedSnapshot;
}

function getServerSnapshot(): EquippedGearMap {
  return EMPTY_MAP;
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  // Initialize cache on first subscribe (client-side only)
  cachedSnapshot = readStorage();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function write(map: EquippedGearMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  cachedSnapshot = map;
  for (const cb of listeners) cb();
}

export function useEquippedGear() {
  const equipped = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const equipGear = useCallback((slotIndex: number, objectId: string) => {
    const next = { ...readStorage(), [slotIndex]: objectId };
    write(next);
  }, []);

  const unequipGear = useCallback((slotIndex: number) => {
    const next = { ...readStorage() };
    delete next[slotIndex];
    write(next);
  }, []);

  return { equipped, equipGear, unequipGear };
}
