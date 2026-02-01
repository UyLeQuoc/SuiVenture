"use client";

import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { usePlayer } from "@/data";
import { useRun } from "@/data";
import {
  PACKAGE_ID,
  RANDOM_ID,
  MODULE_GAME_STATE,
  MODULE_RUN_LOGIC,
} from "@/config/contracts";
import { Board } from "@/components/battle/Board";
import { PotionBar } from "@/components/battle/PotionBar";
import { ShopModal } from "@/components/battle/ShopModal";

const CONFIGURED =
  PACKAGE_ID !== "0x0" && RANDOM_ID !== "0x0";

export default function BattlePage() {
  const account = useCurrentAccount();
  const { player, playerObjectId, refetch: refetchPlayer } = usePlayer();
  const { run, runObjectId, refetch: refetchRun } = useRun();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [shopOpen, setShopOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    refetchPlayer();
    refetchRun();
  };

  const runTx = (tx: Transaction) => {
    setError(null);
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => refetch(),
        onError: (err) => setError(err.message ?? "Transaction failed"),
      }
    );
  };

  const handleCreatePlayer = () => {
    if (!account || !CONFIGURED) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_GAME_STATE}::create_player_and_transfer`,
      arguments: [],
    });
    runTx(tx);
  };

  const handleStartRun = () => {
    if (!account || !playerObjectId || !CONFIGURED) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_GAME_STATE}::start_run_entry`,
      arguments: [tx.object(playerObjectId)],
    });
    runTx(tx);
  };

  const handleRoll = () => {
    if (!runObjectId || !CONFIGURED) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_RUN_LOGIC}::roll_and_move_entry`,
      arguments: [tx.object(runObjectId), tx.object(RANDOM_ID)],
    });
    runTx(tx);
  };

  const handleUsePotion = () => {
    if (!runObjectId) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_RUN_LOGIC}::use_potion_entry`,
      arguments: [tx.object(runObjectId)],
    });
    runTx(tx);
  };

  const handleShopBuy = (upgrade: number) => {
    if (!runObjectId) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_RUN_LOGIC}::shop_buy_entry`,
      arguments: [tx.object(runObjectId), tx.pure.u8(upgrade)],
    });
    runTx(tx);
    setShopOpen(false);
  };

  const floor = run?.floor ?? 0;
  const showShop = floor > 0 && floor % 3 === 0;

  if (!account) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Battle</h1>
        <p className="text-muted-foreground">Connect wallet to start.</p>
      </div>
    );
  }

  if (!CONFIGURED) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Battle</h1>
        <p className="text-muted-foreground">
          Set NEXT_PUBLIC_PACKAGE_ID and RANDOM_ID to enable.
        </p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Battle</h1>
        <p className="text-muted-foreground">Create a player first.</p>
        <button
          type="button"
          onClick={handleCreatePlayer}
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "..." : "Create player"}
        </button>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Battle</h1>
        <p className="text-muted-foreground">Start a run to play.</p>
        <button
          type="button"
          onClick={handleStartRun}
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "..." : "Start run"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Battle</h1>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium">
          HP: {run.current_hp} / {run.max_hp}
        </p>
        <p className="text-sm text-muted-foreground">
          Floor {run.floor} · Roll count: {run.roll_count} · Blue gems:{" "}
          {run.blue_gems}
        </p>
      </div>

      <Board
        positionOnBoard={Number(run.position_on_board)}
        boardTileCount={Number(run.board_tile_count)}
        floor={run.floor}
      />

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleRoll}
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "..." : "Roll 2d6"}
        </button>
        {showShop && (
          <button
            type="button"
            onClick={() => setShopOpen(true)}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Open shop
          </button>
        )}
      </div>

      <PotionBar
        potionCount={run.potion_count}
        potionMaxCarry={run.potion_max_carry}
        potionHealAmount={run.potion_heal_amount}
        onUsePotion={handleUsePotion}
        isPending={isPending}
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <ShopModal
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        onBuy={handleShopBuy}
        isPending={isPending}
      />
    </div>
  );
}
