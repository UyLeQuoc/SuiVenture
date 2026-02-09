"use client";

import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePlayer } from "@/data";
import { useRun } from "@/data";
import {
  PACKAGE_ID,
  RANDOM_ID,
  MODULE_GAME_STATE,
  MODULE_RUN_LOGIC,
  type RunFields,
} from "@/config/contracts";
import { Board, type TileEventMap } from "@/components/battle/Board";
import { PotionBar } from "@/components/battle/PotionBar";
import { ShopModal } from "@/components/battle/ShopModal";
import { StatsPanel } from "@/components/battle/StatsPanel";
import { FloorProgress } from "@/components/battle/FloorProgress";
import { DiceRoller } from "@/components/battle/DiceRoller";
import { EventFeedback } from "@/components/battle/EventFeedback";
import { GameOverModal } from "@/components/battle/GameOverModal";
import { BattleAnimationModal } from "@/components/battle/BattleAnimationModal";
import { detectEvent, type DetectedEvent } from "@/hooks/use-event-detection";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { UserPlus, Play, Store, Swords } from "lucide-react";

const CONFIGURED = PACKAGE_ID !== "0x0";

export default function BattlePage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { player, playerObjectId, refetch: refetchPlayer } = usePlayer();
  const { run, runObjectId, refetch: refetchRun } = useRun();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [shopOpen, setShopOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedEvent, setDetectedEvent] = useState<DetectedEvent>(null);
  const [battleEvent, setBattleEvent] = useState<Extract<DetectedEvent, { type: "combat" }> | null>(null);
  const [tileEvents, setTileEvents] = useState<TileEventMap>({});
  const prevRunRef = useRef<RunFields | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Snapshot run state before a roll
  const snapshotRun = useCallback(() => {
    if (run) prevRunRef.current = { ...run };
  }, [run]);

  // Detect events after run changes & record tile event
  // Combat -> show battle animation first, then toast after animation ends
  // Non-combat -> show toast directly
  useEffect(() => {
    if (!run || !prevRunRef.current) return;
    const event = detectEvent(prevRunRef.current, run);
    if (event) {
      const pos = Number(run.position_on_board);
      setTileEvents((prev) => ({ ...prev, [pos]: event }));

      if (event.type === "combat") {
        setBattleEvent(event);
      } else {
        setDetectedEvent(event);
      }
    }
    prevRunRef.current = null;
  }, [run]);

  // Reset tile events when run changes (new run started)
  const prevRunIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const currentId = run?.player_id;
    const rollCount = run ? Number(run.roll_count) : -1;
    if (currentId !== prevRunIdRef.current && rollCount === 0) {
      setTileEvents({});
    }
    prevRunIdRef.current = currentId;
  }, [run]);

  // GSAP stagger entrance
  useEffect(() => {
    if (!contentRef.current) return;
    const sections = contentRef.current.children;
    gsap.fromTo(
      sections,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
    );
  }, [run ? "active" : "inactive"]);

  const refetch = () => {
    refetchPlayer();
    refetchRun();
  };

  const runTx = (tx: Transaction, opts?: { snapshot?: boolean }) => {
    setError(null);
    if (opts?.snapshot) snapshotRun();
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async (result) => {
          const digest = result.digest;
          if (!digest) return;
          try {
            await client.waitForTransaction({ digest });
          } catch {
            // proceed with refetch even if wait fails
          }
          refetch();
        },
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
    runTx(tx, { snapshot: true });
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

  const handleEndRun = () => {
    if (!runObjectId) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_GAME_STATE}::end_run_entry`,
      arguments: [tx.object(runObjectId)],
    });
    runTx(tx);
  };

  const handleEndRunWithRewards = () => {
    if (!runObjectId || !playerObjectId || !run) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_GAME_STATE}::end_run_with_rewards_entry`,
      arguments: [
        tx.object(runObjectId),
        tx.object(playerObjectId),
        tx.pure.u64(Number(run.blue_gems)),
      ],
    });
    runTx(tx);
  };

  const dismissEvent = useCallback(() => setDetectedEvent(null), []);
  const handleBattleComplete = useCallback(() => {
    if (battleEvent) {
      setDetectedEvent(battleEvent);
      setBattleEvent(null);
    }
  }, [battleEvent]);

  // Derived state
  const floor = run?.floor ?? 0;
  const showShop = floor > 0 && floor % 3 === 0;
  const gameOver = run && Number(run.current_hp) === 0;
  const bossNext =
    run && (Number(run.roll_count) + 1) % 5 === 0 && Number(run.roll_count) >= 0;

  // ── No wallet ──
  if (!account) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Swords className="size-10 text-[#6D678F]/60" />
        <p className="text-sm text-gray-400">Connect wallet to start.</p>
      </div>
    );
  }

  if (!CONFIGURED) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400 text-sm">
        Set NEXT_PUBLIC_PACKAGE_ID to enable.
      </div>
    );
  }

  // ── Create player ──
  if (!player) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5">
        <div className="rounded-full bg-[#6D678F]/15 p-5">
          <UserPlus className="size-10 text-[#6D678F]" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-bold text-white">New Adventurer</p>
          <p className="text-xs text-gray-400">Create a player to begin your journey</p>
        </div>
        <button
          type="button"
          onClick={handleCreatePlayer}
          disabled={isPending}
          className={cn(
            "flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all",
            "bg-[#6D678F] text-white hover:bg-[#5a5478] hover:scale-105 disabled:opacity-50"
          )}
        >
          <UserPlus className="size-4" />
          {isPending ? "Creating..." : "Create Player"}
        </button>
      </div>
    );
  }

  // ── Start run ──
  if (!run) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5">
        <div className="rounded-full bg-[#6D678F]/15 p-5">
          <Play className="size-10 text-[#6D678F]" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-bold text-white">Dungeon Awaits</p>
          <p className="text-xs text-gray-400">Roll dice, fight monsters, collect gems</p>
        </div>
        <button
          type="button"
          onClick={handleStartRun}
          disabled={isPending}
          className={cn(
            "flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all",
            "bg-[#6D678F] text-white hover:bg-[#5a5478] hover:scale-105 disabled:opacity-50"
          )}
        >
          <Play className="size-4" />
          {isPending ? "Starting..." : "Start Run"}
        </button>
      </div>
    );
  }

  // ── Active run ──
  return (
    <div ref={contentRef} className="flex flex-col gap-2.5 pb-4">
      {/* Stats */}
      <StatsPanel
        hp={Number(run.current_hp)}
        maxHp={Number(run.max_hp)}
        atk={Number(run.temp_atk)}
        def={Number(run.temp_def)}
        acc={Number(run.temp_acc)}
        floor={run.floor}
        gems={Number(run.blue_gems)}
      />

      {/* Floor Progress */}
      <FloorProgress floor={run.floor} />

      {/* Board with event icons */}
      <Board
        positionOnBoard={Number(run.position_on_board)}
        boardTileCount={Number(run.board_tile_count)}
        floor={run.floor}
        tileEvents={tileEvents}
      />

      {/* Actions: Dice + Potion + Shop in one compact row */}
      <div className="rounded-lg border border-[#6D678F]/30 bg-[#252430]/60 p-3 space-y-3">
        {/* Dice roller row */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <DiceRoller
              onRoll={handleRoll}
              isPending={isPending}
              disabled={!!gameOver}
              bossNext={!!bossNext}
            />
          </div>
          {showShop && (
            <button
              type="button"
              onClick={() => setShopOpen(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-bold transition-all",
                "border-amber-500/40 bg-amber-500/10 text-amber-300",
                "hover:bg-amber-500/20 hover:border-amber-500/60"
              )}
            >
              <Store className="size-4" />
              Shop
            </button>
          )}
        </div>

        {/* Potion bar inline */}
        <PotionBar
          potionCount={Number(run.potion_count)}
          potionMaxCarry={Number(run.potion_max_carry)}
          potionHealAmount={Number(run.potion_heal_amount)}
          onUsePotion={handleUsePotion}
          isPending={isPending}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 px-1" role="alert">
          {error}
        </p>
      )}

      {/* Event Feedback Toast */}
      <EventFeedback event={detectedEvent} onDismiss={dismissEvent} />

      {/* Shop Modal */}
      <ShopModal
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        onBuy={handleShopBuy}
        isPending={isPending}
        potionHealAmount={Number(run.potion_heal_amount)}
        potionMaxCarry={Number(run.potion_max_carry)}
        tempAtk={Number(run.temp_atk)}
        potionCount={Number(run.potion_count)}
      />

      {/* Battle Animation */}
      {battleEvent && (
        <BattleAnimationModal
          event={battleEvent}
          floor={run.floor}
          onComplete={handleBattleComplete}
        />
      )}

      {/* Game Over Modal */}
      <GameOverModal
        open={!!gameOver}
        floor={run.floor}
        rollCount={Number(run.roll_count)}
        gems={Number(run.blue_gems)}
        onEndRun={handleEndRun}
        onEndRunWithRewards={handleEndRunWithRewards}
        isPending={isPending}
      />
    </div>
  );
}
