"use client";

import {
  GACHA_GEAR_RARITY_PERCENTS,
  GACHA_PRICE_10X_MIST,
  GACHA_PRICE_MIST,
  gearPulledEventType,
  MODULE_GACHA_GEAR,
  NFT_MINT_AUTHORITY_ID,
  PACKAGE_ID,
  RANDOM_ID,
  RARITY_NAMES,
  type GearPulledEvent,
} from "@/config/contracts";
import { GearCard } from "@/components/inventory/GearCard";
import { RARITY_STYLES } from "@/components/rarity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { gsap } from "gsap";
import { InfoIcon, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const CONFIGURED =
  PACKAGE_ID !== "0x0" &&
  NFT_MINT_AUTHORITY_ID !== "0x0"

function parseGearPulledEvents(events: { type: string; parsedJson?: unknown }[]): GearPulledEvent[] {
  const type = gearPulledEventType(PACKAGE_ID);
  return events
    .filter((e) => e.type === type && e.parsedJson != null)
    .map((e) => e.parsedJson as GearPulledEvent);
}

export function GachaGearCard() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [error, setError] = useState<string | null>(null);
  const [pulledItems, setPulledItems] = useState<GearPulledEvent[] | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handlePull = useCallback(
    (count: 1 | 10) => {
      setError(null);
      setPulledItems(null);
      if (!account || !CONFIGURED) {
        setError(
          !account
            ? "Connect wallet"
            : "Configure package and gacha IDs in env (see README)."
        );
        return;
      }
      const amount = count === 1 ? GACHA_PRICE_MIST : GACHA_PRICE_10X_MIST;
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [amount]);
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_GACHA_GEAR}::pull_gear`,
        arguments: [
          tx.object(NFT_MINT_AUTHORITY_ID),
          coin,
          tx.pure.u8(count),
          tx.object(RANDOM_ID),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            const digest = result.digest;
            if (!digest) return;
            try {
              const txBlock = await client.waitForTransaction({
                digest,
                options: { showEvents: true },
              });
              const events = txBlock.events ?? [];
              const items = parseGearPulledEvents(events);
              setPulledItems(items);
            } catch {
              setPulledItems([]);
            }
          },
          onError: (err) => {
            setError(err.message ?? "Transaction failed");
          },
        }
      );
    },
    [account, client, signAndExecute]
  );

  const closeResults = useCallback(() => {
    setPulledItems(null);
  }, []);

  // GSAP stagger when results modal opens
  useEffect(() => {
    if (pulledItems === null || pulledItems.length === 0) return;
    const t = setTimeout(() => {
      const el = modalContentRef.current;
      if (!el) return;
      const cards = el.querySelectorAll("[data-gear-card]");
      gsap.fromTo(
        cards,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: "back.out(1.2)" }
      );
    }, 50);
    return () => clearTimeout(t);
  }, [pulledItems]);

  return (
    <section className="relative p-4 h-72 mb-32">
      <img src="/gacha-gear-bg.png" alt="Gear Gacha" className="absolute top-0 left-0 w-full h-full object-cover" />
      <div className="absolute top-7 left-1/2 -translate-x-1/2 z-10">
        <h2 className="text-white text-2xl font-bold">Gear Gacha</h2>
      </div>
      <div className="absolute top-0 right-0 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:opacity-80 transition-opacity duration-300 relative inline-flex items-center justify-center w-10 h-10 bg-[#79759C] rounded-sm cursor-pointer p-2 border-3 border-[#040001]"
              aria-label="Rarity rates"
            >
              <InfoIcon className="w-5 h-5 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="min-w-[180px] bg-[#3A2E2E] border-3 border-[#040001]">
            <div className="px-2 py-1.5 text-xs font-medium text-white">
              Rarity rates
            </div>
            {RARITY_NAMES.map((name, index) => {
              const style = RARITY_STYLES[index] ?? RARITY_STYLES[0];
              const percent = GACHA_GEAR_RARITY_PERCENTS[index] ?? 0;
              return (
                <div
                  key={name}
                  className={cn(
                    "flex items-center justify-between gap-4 px-2 py-1.5 text-sm",
                    style.text
                  )}
                >
                  <span className="font-medium">{name}</span>
                  <span className="tabular-nums opacity-90">{percent}%</span>
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="absolute top-40 left-1/2 -translate-x-1/2 z-10 w-50">
        <div
          className="relative inline-block origin-[center_100%]"
          style={{ animation: "chest-float 2.5s ease-in-out infinite" }}
        >
          {[
            { top: "5%", left: "-8%", delay: "0s" },
            { top: "-2%", left: "15%", delay: "0.3s" },
            { top: "10%", right: "-5%", left: "auto", delay: "0.6s" },
            { top: "35%", left: "-12%", delay: "0.2s" },
            { top: "40%", right: "-10%", left: "auto", delay: "0.5s" },
            { top: "20%", left: "-15%", delay: "0.4s" },
            { top: "25%", right: "-12%", left: "auto", delay: "0.1s" },
            { top: "-5%", right: "10%", left: "auto", delay: "0.45s" },
          ].map((pos) => (
            <span
              key={`${pos.top}-${pos.left ?? pos.right}-${pos.delay}`}
              className="absolute size-2 rounded-full bg-amber-200/90 shadow-[0_0_6px_2px_rgba(251,191,36,0.6)]"
              style={{
                ...pos,
                animation: "sparkle 1.8s ease-in-out infinite",
                animationDelay: pos.delay,
              }}
              aria-hidden
            />
          ))}
          <img
            src="/gear-chest.png"
            alt="Gacha Chest"
            className="relative z-10 w-full object-cover"
          />
        </div>
      </div>
      <div className="absolute -bottom-25 left-0 right-0 flex gap-2 bg-[#3A2E2E] p-4 py-2 border-3 border-[#040001] flex justify-center">
        <button
          type="button"
          onClick={() => handlePull(1)}
          disabled={!account || isPending}
          className="relative inline-flex items-center justify-center w-32 text-sm font-medium text-white hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          <img src="/gacha-green-button.png" alt="" className="w-full object-cover" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
            <span className="whitespace-nowrap">1x Draw</span>
            <span className="flex items-center gap-0.5 whitespace-nowrap">
              <img src="/sui.png" alt="Coin" className="w-4 h-4 object-cover" />
              0.01 SUI
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => handlePull(10)}
          disabled={!account || isPending}
          className="relative inline-flex items-center justify-center w-32 text-sm font-medium text-white hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          <img src="/gacha-yellow-button.png" alt="" className="w-full object-cover" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
            <span className="whitespace-nowrap">10x Draw</span>
            <span className="flex items-center gap-0.5 whitespace-nowrap">
              <img src="/sui.png" alt="Coin" className="w-4 h-4 object-cover" />
              0.1 SUI
            </span>
          </span>
        </button>
      </div>

      {/* Results modal */}
      {pulledItems !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-label="Gear pulled"
        >
          <div
            ref={modalContentRef}
            className="relative w-[360px] overflow-auto rounded-sm border-2 border-[#6D678F]/50 bg-[#252430] p-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                You pulled {pulledItems.length} gear{pulledItems.length !== 1 ? "s" : ""}
              </h3>
              <button
                type="button"
                onClick={closeResults}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {pulledItems.map((item, i) => (
                <div key={item.object_id ?? i} data-gear-card>
                  <GearCard
                    gear={{
                      slot: item.slot,
                      set_id: item.set_id,
                      rarity: item.rarity,
                      atk: item.atk,
                      hp: item.hp,
                      acc: item.acc,
                      def: item.def,
                    }}
                    showMeta
                    showImage
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="absolute -bottom-16 left-0 right-0 text-center text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
