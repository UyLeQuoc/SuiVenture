"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { cn } from "@/lib/utils";
import { ShoppingBag, Tag, X, Loader2 } from "lucide-react";
import {
  useMarketplaceListings,
  useKioskActions,
  useOwnedKiosk,
} from "@/data";
import type { MarketplaceListing } from "@/data";
import { GearCard } from "@/components/inventory/GearCard";
import { PetCard } from "@/components/inventory/PetCard";
import {
  RARITY_NAMES,
  SLOT_NAMES,
  PET_CATALOG,
  type EquipmentNFTFields,
  type PetNFTFields,
} from "@/config/contracts";

type Tab = "browse" | "my-listings";

const MIST_PER_SUI = BigInt(1_000_000_000);

function formatSui(mist: string | bigint): string {
  const val = BigInt(mist);
  const whole = val / MIST_PER_SUI;
  const frac = val % MIST_PER_SUI;
  if (frac === BigInt(0)) return `${whole}`;
  const fracStr = frac.toString().padStart(9, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}

export default function MarketplacePage() {
  const account = useCurrentAccount();
  const { listings, isPending: listingsLoading, refetch } = useMarketplaceListings();
  const { purchaseItem, delistItem, isPending: actionPending } = useKioskActions();
  const { kioskId } = useOwnedKiosk();
  const [tab, setTab] = useState<Tab>("browse");
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);

  const myListings = useMemo(
    () => (kioskId ? listings.filter((l) => l.kioskId === kioskId) : []),
    [listings, kioskId]
  );

  const otherListings = useMemo(
    () => (kioskId ? listings.filter((l) => l.kioskId !== kioskId) : listings),
    [listings, kioskId]
  );

  const handlePurchase = useCallback(async () => {
    if (!selectedListing) return;
    try {
      await purchaseItem(selectedListing);
      setSelectedListing(null);
      refetch();
    } catch (e) {
      console.error("Purchase failed:", e);
    }
  }, [selectedListing, purchaseItem, refetch]);

  const handleDelist = useCallback(
    async (listing: MarketplaceListing) => {
      try {
        await delistItem(listing.itemId, listing.fullType);
        refetch();
      } catch (e) {
        console.error("Delist failed:", e);
      }
    },
    [delistItem, refetch]
  );

  if (!account) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-[#6D678F]/30 bg-[#252430]/40 px-6 py-12">
        <p className="text-center text-gray-400">
          Connect wallet to use the marketplace.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("browse")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "browse"
              ? "bg-[#6D678F] text-white"
              : "bg-[#252430]/60 text-gray-400 hover:bg-[#252430]/80 hover:text-gray-300"
          )}
        >
          <ShoppingBag className="size-4" />
          Browse
        </button>
        <button
          type="button"
          onClick={() => setTab("my-listings")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "my-listings"
              ? "bg-[#6D678F] text-white"
              : "bg-[#252430]/60 text-gray-400 hover:bg-[#252430]/80 hover:text-gray-300"
          )}
        >
          <Tag className="size-4" />
          My Listings
          {myListings.length > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
              {myListings.length}
            </span>
          )}
        </button>
      </div>

      {/* Browse Tab */}
      {tab === "browse" && (
        <section>
          {listingsLoading ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-[#6D678F]/20 bg-[#252430]/30">
              <Loader2 className="size-6 animate-spin text-gray-500" />
            </div>
          ) : otherListings.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#6D678F]/30 bg-[#252430]/20 p-6">
              <ShoppingBag className="size-10 text-[#6D678F]/60" />
              <p className="text-center text-sm text-gray-400">
                No listings yet. Be the first to sell!
              </p>
              <div className="flex gap-2">
                <Link
                  href="/inventory"
                  className="rounded-md bg-[#6D678F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5a5478]"
                >
                  Sell Gear
                </Link>
                <Link
                  href="/pet"
                  className="rounded-md bg-[#6D678F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5a5478]"
                >
                  Sell Pets
                </Link>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {otherListings.map((listing) => (
                <li key={listing.itemId}>
                  <button
                    type="button"
                    onClick={() => setSelectedListing(listing)}
                    className="group w-full rounded-sm transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#6D678F]"
                  >
                    <ListingCard listing={listing} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* My Listings Tab */}
      {tab === "my-listings" && (
        <section>
          {myListings.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#6D678F]/30 bg-[#252430]/20 p-6">
              <Tag className="size-10 text-[#6D678F]/60" />
              <p className="text-center text-sm text-gray-400">
                No items listed. List items from your Inventory or Pets page.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {myListings.map((listing) => (
                <li key={listing.itemId}>
                  <div className="relative">
                    <ListingCard listing={listing} />
                    <button
                      type="button"
                      onClick={() => handleDelist(listing)}
                      disabled={actionPending}
                      className={cn(
                        "mt-1 w-full rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        "bg-red-600/80 text-white hover:bg-red-600 disabled:opacity-50"
                      )}
                    >
                      {actionPending ? "..." : "Delist"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Buy Confirmation Modal */}
      {selectedListing && (
        <BuyModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onBuy={handlePurchase}
          isPending={actionPending}
        />
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function ListingCard({ listing }: { listing: MarketplaceListing }) {
  return (
    <div className="relative">
      {listing.itemType === "gear" ? (
        <GearCard
          gear={listing.fields as EquipmentNFTFields}
          showMeta={false}
        />
      ) : (
        <PetCard
          pet={listing.fields as PetNFTFields}
          showMeta={false}
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-center backdrop-blur-sm">
        <span className="text-xs font-semibold text-white">
          {formatSui(listing.price)} SUI
        </span>
      </div>
    </div>
  );
}

function BuyModal({
  listing,
  onClose,
  onBuy,
  isPending,
}: {
  listing: MarketplaceListing;
  onClose: () => void;
  onBuy: () => void;
  isPending: boolean;
}) {
  const price = BigInt(listing.price);
  const fee = (price * BigInt(5)) / BigInt(100);
  const total = price + fee;

  const isGear = listing.itemType === "gear";
  const gearFields = isGear ? (listing.fields as EquipmentNFTFields) : null;
  const petFields = !isGear ? (listing.fields as PetNFTFields) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-[360px] rounded-lg border border-[#6D678F]/30 bg-[#252430] p-4 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Confirm Purchase
        </h2>

        <div className="mb-3 w-20">
          {isGear && gearFields ? (
            <GearCard gear={gearFields} showMeta={false} />
          ) : petFields ? (
            <PetCard pet={petFields} showMeta={false} />
          ) : null}
        </div>

        <div className="mb-4 space-y-1">
          {isGear && gearFields && (
            <>
              <p className="font-medium text-white">
                {SLOT_NAMES[gearFields.slot]} · Set {gearFields.set_id} ·{" "}
                {RARITY_NAMES[gearFields.rarity]}
              </p>
              <p className="text-sm text-gray-400">
                ATK +{gearFields.atk} HP +{gearFields.hp} ACC +{gearFields.acc}{" "}
                DEF +{gearFields.def}
              </p>
            </>
          )}
          {!isGear && petFields && (
            <>
              <p className="font-medium text-white">
                {PET_CATALOG[petFields.pet_id]?.name ?? `Pet ${petFields.pet_id}`} ·{" "}
                {RARITY_NAMES[petFields.rarity]}
              </p>
              <p className="text-sm text-gray-400">
                {PET_CATALOG[petFields.pet_id]?.bonus_type} {petFields.bonus_value}
              </p>
            </>
          )}
        </div>

        <div className="mb-4 space-y-1 rounded-md bg-[#1a191e] p-3 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Price</span>
            <span>{formatSui(listing.price)} SUI</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Fee (5%)</span>
            <span>{formatSui(fee.toString())} SUI</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-1 font-medium text-white">
            <span>Total</span>
            <span>{formatSui(total.toString())} SUI</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBuy}
          disabled={isPending}
          className={cn(
            "w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
            "bg-[#6D678F] text-white hover:bg-[#5a5478] disabled:opacity-50"
          )}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Processing...
            </span>
          ) : (
            "Buy Now"
          )}
        </button>
      </div>
    </div>
  );
}
