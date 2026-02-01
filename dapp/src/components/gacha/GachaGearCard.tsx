"use client";

import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { Dice1, Loader2 } from "lucide-react";
import {
  PACKAGE_ID,
  GACHA_GEAR_ID,
  NFT_MINT_AUTHORITY_ID,
  RANDOM_ID,
  GACHA_PRICE_MIST,
  MODULE_GACHA_GEAR,
  RARITY_NAMES,
  SLOT_NAMES,
} from "@/config/contracts";

const CONFIGURED =
  PACKAGE_ID !== "0x0" &&
  GACHA_GEAR_ID !== "0x0" &&
  NFT_MINT_AUTHORITY_ID !== "0x0" &&
  RANDOM_ID !== "0x0";

export function GachaGearCard() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [digest, setDigest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePull = () => {
    setError(null);
    setDigest(null);
    if (!account || !CONFIGURED) {
      setError(
        !account
          ? "Connect wallet"
          : "Configure package and gacha IDs in env (see README)."
      );
      return;
    }

    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [GACHA_PRICE_MIST]);
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_GACHA_GEAR}::pull_gear`,
      arguments: [
        tx.object(GACHA_GEAR_ID),
        tx.object(NFT_MINT_AUTHORITY_ID),
        coin,
        tx.object(RANDOM_ID),
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setDigest(result.digest ?? null);
        },
        onError: (err) => {
          setError(err.message ?? "Transaction failed");
        },
      }
    );
  };

  if (!CONFIGURED) {
    return (
      <section className="rounded-lg border bg-card p-4 text-card-foreground">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Dice1 className="size-5" />
          Gacha Gear
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Set NEXT_PUBLIC_PACKAGE_ID, GACHA_GEAR_ID, NFT_MINT_AUTHORITY_ID, and
          RANDOM_ID to enable.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-card p-4 text-card-foreground">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Dice1 className="size-5" />
        Gacha Gear
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pay 0.01 SUI for a random gear. Slots: {SLOT_NAMES.join(", ")}. Rarity:{" "}
        {RARITY_NAMES.join(" → ")}.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={handlePull}
          disabled={!account || isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            "Pull Gear (0.01 SUI)"
          )}
        </button>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {digest && (
          <p className="text-sm text-muted-foreground">
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
    </section>
  );
}
