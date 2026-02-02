"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import {
  ADMIN_ADDRESS,
  PACKAGE_ID,
  TRANSFER_POLICY_GEAR_ID,
  TRANSFER_POLICY_PET_ID,
  equipmentNFTType,
  petNFTType,
} from "@/config/contracts";
import {
  useTransferPolicyBalances,
  useAdminCaps,
} from "@/data";

function PolicyCard({
  label,
  balanceMist,
  balanceSui,
  objectId,
  canWithdraw,
  onWithdraw,
  isWithdrawing,
}: {
  label: string;
  balanceMist: string;
  balanceSui: string;
  objectId: string;
  canWithdraw: boolean;
  onWithdraw: () => void;
  isWithdrawing: boolean;
}) {
  const hasBalance = balanceMist !== "0" && BigInt(balanceMist) > BigInt(0);
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="font-semibold text-foreground">{label}</h3>
      <p className="mt-1 text-2xl font-mono tabular-nums text-primary">
        {balanceSui} SUI
      </p>
      <p className="text-xs text-muted-foreground">
        {balanceMist} MIST · Policy: {objectId.slice(0, 10)}…
      </p>
      {canWithdraw && hasBalance && (
        <button
          type="button"
          onClick={onWithdraw}
          disabled={isWithdrawing}
          className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isWithdrawing ? "…" : "Withdraw all"}
        </button>
      )}
    </div>
  );
}

export default function AdminPage() {
  const account = useCurrentAccount();
  const { gear, pet, totalSui, totalMist, isPending, isError, refetch } =
    useTransferPolicyBalances();
  const { capGearId, capPetId, hasAny: hasCaps } = useAdminCaps();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [withdrawingGear, setWithdrawingGear] = useState(false);
  const [withdrawingPet, setWithdrawingPet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [digest, setDigest] = useState<string | null>(null);

  const isAdmin =
    !ADMIN_ADDRESS || (account?.address && account.address === ADMIN_ADDRESS);
  const canWithdrawGear =
    isAdmin &&
    !!capGearId &&
    TRANSFER_POLICY_GEAR_ID !== "0x0" &&
    PACKAGE_ID !== "0x0";
  const canWithdrawPet =
    isAdmin &&
    !!capPetId &&
    TRANSFER_POLICY_PET_ID !== "0x0" &&
    PACKAGE_ID !== "0x0";

  const runWithdraw = (
    policyId: string,
    capId: string,
    balanceMist: string,
    typeArg: string,
    setBusy: (b: boolean) => void
  ) => {
    const amount = BigInt(balanceMist);
    if (amount <= BigInt(0)) return;
    setError(null);
    setDigest(null);
    setBusy(true);
    const tx = new Transaction();
    const coin = tx.moveCall({
      target: "0x2::transfer_policy::withdraw",
      typeArguments: [typeArg],
      arguments: [
        tx.object(policyId),
        tx.object(capId),
        tx.pure.u64(amount.toString()),
      ],
    });
    const recipient = account?.address;
    if (!recipient) return;
    tx.transferObjects([coin], tx.pure.address(recipient));
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setDigest(result.digest ?? null);
          refetch();
          setBusy(false);
        },
        onError: (err) => {
          setError(err.message ?? "Transaction failed");
          setBusy(false);
        },
      }
    );
  };

  if (!account) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-4">
        <h1 className="text-xl font-bold">Admin</h1>
        <p className="text-muted-foreground">
          Connect wallet to view marketplace analytics and withdraw fees.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-4">
        <h1 className="text-xl font-bold">Admin</h1>
        <p className="text-destructive" role="alert">
          Access denied. This page is for the admin wallet only.
        </p>
        <p className="text-muted-foreground text-sm">
          Set NEXT_PUBLIC_ADMIN_ADDRESS to your wallet to enable admin actions.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      <div>
        <h1 className="text-xl font-bold">Admin</h1>
        <p className="text-muted-foreground text-sm">
          Marketplace fee analytics and withdraw (5% admin fee from sales).
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Policy balances (available to withdraw)
        </h2>
        {isPending ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : isError ? (
          <p className="text-destructive" role="alert">
            Failed to load policy balances.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <PolicyCard
              label="Gear policy (EquipmentNFT)"
              balanceMist={gear.balanceMist}
              balanceSui={gear.balanceSui}
              objectId={gear.objectId}
              canWithdraw={!!canWithdrawGear}
              onWithdraw={() =>
                capGearId &&
                runWithdraw(
                  TRANSFER_POLICY_GEAR_ID,
                  capGearId,
                  gear.balanceMist,
                  equipmentNFTType(PACKAGE_ID),
                  setWithdrawingGear
                )
              }
              isWithdrawing={withdrawingGear}
            />
            <PolicyCard
              label="Pet policy (PetNFT)"
              balanceMist={pet.balanceMist}
              balanceSui={pet.balanceSui}
              objectId={pet.objectId}
              canWithdraw={!!canWithdrawPet}
              onWithdraw={() =>
                capPetId &&
                runWithdraw(
                  TRANSFER_POLICY_PET_ID,
                  capPetId,
                  pet.balanceMist,
                  petNFTType(PACKAGE_ID),
                  setWithdrawingPet
                )
              }
              isWithdrawing={withdrawingPet}
            />
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-muted/30 p-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Total (both policies)
        </h2>
        <p className="mt-1 text-2xl font-mono font-semibold tabular-nums text-foreground">
          {totalSui} SUI
        </p>
        <p className="text-xs text-muted-foreground">
          {totalMist} MIST
        </p>
      </section>

      {!hasCaps && (
        <p className="text-muted-foreground text-sm">
          You do not hold TransferPolicyCap for this package. Withdraw is only
          available to the wallet that received the caps from{" "}
          <code className="rounded bg-muted px-1">create_marketplace_policies</code>.
        </p>
      )}

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
      {digest && (
        <p className="text-muted-foreground text-sm">
          Tx:{" "}
          <a
            href={`https://suiexplorer.com/txblock/${digest}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {digest.slice(0, 12)}…
          </a>
        </p>
      )}
    </div>
  );
}
