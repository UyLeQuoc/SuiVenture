"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useOwnedNFTs } from "@/data";
import { usePlayer } from "@/data";
import {
  PET_CATALOG,
  RARITY_NAMES,
  type PetNFTFields,
} from "@/config/contracts";

export default function PetPage() {
  const account = useCurrentAccount();
  const { player } = usePlayer();
  const { pets, isPending } = useOwnedNFTs();

  if (!account) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Pet</h1>
        <p className="text-muted-foreground">Connect wallet to view pets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Pet</h1>
      <p className="text-muted-foreground">
        Equipped pet (1 slot). List owned Pet NFTs and equip one.
      </p>

      {player?.equipped_pet && (
        <section className="rounded-lg border bg-card p-4">
          <h2 className="text-lg font-medium">Equipped pet</h2>
          <p className="text-sm text-muted-foreground truncate">
            {player.equipped_pet}
          </p>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium">Owned pets ({pets.length})</h2>
        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : pets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pets. Pull from Gacha.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {pets.map((item) => {
              const f = item.fields as PetNFTFields;
              const pet = PET_CATALOG[f.pet_id];
              const name = pet?.name ?? `Pet ${f.pet_id}`;
              const rarityName =
                RARITY_NAMES[f.rarity] ?? `Rarity ${f.rarity}`;
              return (
                <li
                  key={item.objectId}
                  className="rounded-lg border bg-card p-3 text-sm"
                >
                  <p className="font-medium">
                    {name} · {rarityName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs mt-1">
                    {item.objectId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Equip from game_state::equip_pet (not wired in this MVP UI).
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-lg font-medium">Pet catalog</h2>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          {PET_CATALOG.map((p) => (
            <li key={p.pet_id}>
              <strong className="text-foreground">{p.name}</strong>: {p.bonus_type}{" "}
              · {p.art_hint}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
