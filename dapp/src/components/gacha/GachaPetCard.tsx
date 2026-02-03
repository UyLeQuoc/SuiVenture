"use client";

import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { Cat, Loader2 } from "lucide-react";
import {
  PACKAGE_ID,
  NFT_MINT_AUTHORITY_ID,
  RANDOM_ID,
  GACHA_PRICE_MIST,
  MODULE_GACHA_PET,
  PET_CATALOG,
  RARITY_NAMES,
} from "@/config/contracts";

const CONFIGURED =
  PACKAGE_ID !== "0x0" &&
  NFT_MINT_AUTHORITY_ID !== "0x0" &&
  RANDOM_ID !== "0x0";

export function GachaPetCard() {
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
      target: `${PACKAGE_ID}::${MODULE_GACHA_PET}::pull_pet`,
      arguments: [
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
      <section className="rounded-lg border border-[#6D678F]/30 bg-[#252430]/60 p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Cat className="size-5" />
          Pet
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Set NEXT_PUBLIC_PACKAGE_ID, NFT_MINT_AUTHORITY_ID, and RANDOM_ID to
          enable.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[#6D678F]/30 bg-[#252430]/60 p-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <Cat className="size-5" />
        Pet
      </h2>
      <p className="mt-1 text-sm text-gray-400">
        Pay 0.01 SUI for a random pet ({PET_CATALOG.map((p) => p.name).join(", ")}
        ). Rarity: {RARITY_NAMES.join(" → ")}.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={handlePull}
          disabled={!account || isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#6D678F] px-4 py-2 text-sm font-medium text-white hover:bg-[#5a5478] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            "Pull Pet (0.01 SUI)"
          )}
        </button>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {digest && (
          <p className="text-sm text-gray-400">
            Tx:{" "}
            <a
              href={`https://suiexplorer.com/txblock/${digest}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6D678F] underline hover:text-[#8a84a8]"
            >
              {digest.slice(0, 10)}…
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
