"use client";

import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import {
  PACKAGE_ID,
  NFT_MINT_AUTHORITY_ID,
  MODULE_UPGRADE,
  RARITY_NAMES,
  SLOT_NAMES,
} from "@/config/contracts";
import type { EquipmentNFTFields } from "@/config/contracts";

const MYSTIC_RARITY = 4;

interface UpgradeGearBlockProps {
  objectIds: [string, string, string];
  fields: EquipmentNFTFields;
  onSuccess?: () => void;
}

export function UpgradeGearBlock({
  objectIds,
  fields,
  onSuccess,
}: UpgradeGearBlockProps) {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [error, setError] = useState<string | null>(null);
  const [digest, setDigest] = useState<string | null>(null);

  const slotName = SLOT_NAMES[fields.slot] ?? `Slot ${fields.slot}`;
  const rarityName = RARITY_NAMES[fields.rarity] ?? `Rarity ${fields.rarity}`;
  const nextRarity = fields.rarity + 1;
  const nextRarityName =
    nextRarity <= MYSTIC_RARITY
      ? RARITY_NAMES[nextRarity] ?? `Rarity ${nextRarity}`
      : null;

  const canUpgrade =
    PACKAGE_ID !== "0x0" &&
    NFT_MINT_AUTHORITY_ID !== "0x0" &&
    fields.rarity < MYSTIC_RARITY &&
    nextRarityName;

  const handleUpgrade = () => {
    if (!canUpgrade) return;
    setError(null);
    setDigest(null);
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_UPGRADE}::upgrade_gear_entry`,
      arguments: [
        tx.object(objectIds[0]),
        tx.object(objectIds[1]),
        tx.object(objectIds[2]),
        tx.object(NFT_MINT_AUTHORITY_ID),
      ],
    });
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setDigest(result.digest ?? null);
          onSuccess?.();
        },
        onError: (err) => setError(err.message ?? "Transaction failed"),
      }
    );
  };

  if (!canUpgrade) return null;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
      <p className="font-medium">
        Upgrade: {slotName} · Set {fields.set_id} · {rarityName} → {nextRarityName}
      </p>
      <p className="text-muted-foreground text-xs">
        3 items → 1 higher rarity
      </p>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={isPending}
        className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "…" : "Upgrade gear"}
      </button>
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {digest && (
        <p className="mt-1 text-xs text-muted-foreground">
          Tx:{" "}
          <a
            href={`https://suiexplorer.com/txblock/${digest}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {digest.slice(0, 10)}…
          </a>
        </p>
      )}
    </div>
  );
}
