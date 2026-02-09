"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "suiventure:equipped-pet";

// Cached values for referential stability
const EMPTY: string | null = null;
let cachedSnapshot: string | null = EMPTY;

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function getSnapshot(): string | null {
  return cachedSnapshot;
}

function getServerSnapshot(): string | null {
  return EMPTY;
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  cachedSnapshot = readStorage();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function writeStorage(val: string | null) {
  if (val) {
    localStorage.setItem(STORAGE_KEY, val);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  cachedSnapshot = val;
  for (const cb of listeners) cb();
}

export function useEquippedPet() {
  const equippedPetId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const equipPet = useCallback((objectId: string) => {
    writeStorage(objectId);
  }, []);

  const unequipPet = useCallback(() => {
    writeStorage(null);
  }, []);

  return { equippedPetId, equipPet, unequipPet };
}
