"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useOwnedNFTs } from "@/data";
import { RARITY_NAMES, SLOT_NAMES } from "@/config/contracts";
import { PET_CATALOG } from "@/config/contracts";
import type { EquipmentNFTFields, PetNFTFields } from "@/config/contracts";

function GearItem({
  objectId,
  fields,
}: {
  objectId: string;
  fields: EquipmentNFTFields;
}) {
  const slotName = SLOT_NAMES[fields.slot] ?? `Slot ${fields.slot}`;
  const rarityName = RARITY_NAMES[fields.rarity] ?? `Rarity ${fields.rarity}`;
  return (
    <li className="rounded-lg border bg-card p-3 text-sm">
      <p className="font-medium">
        {slotName} · Set {fields.set_id} · {rarityName}
      </p>
      <p className="text-muted-foreground">
        ATK +{fields.atk} HP +{fields.hp} ACC +{fields.acc} DEF +{fields.def}
      </p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{objectId}</p>
    </li>
  );
}

function PetItem({
  objectId,
  fields,
}: {
  objectId: string;
  fields: PetNFTFields;
}) {
  const pet = PET_CATALOG[fields.pet_id];
  const name = pet?.name ?? `Pet ${fields.pet_id}`;
  const rarityName = RARITY_NAMES[fields.rarity] ?? `Rarity ${fields.rarity}`;
  return (
    <li className="rounded-lg border bg-card p-3 text-sm">
      <p className="font-medium">
        {name} · {rarityName}
      </p>
      <p className="text-muted-foreground">
        Bonus type {fields.bonus_type} value {fields.bonus_value}
      </p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{objectId}</p>
    </li>
  );
}

export default function InventoryPage() {
  const account = useCurrentAccount();
  const { gear, pets, isPending } = useOwnedNFTs();

  if (!account) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-muted-foreground">Connect wallet to view inventory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inventory</h1>
      <p className="text-muted-foreground">
        Owned Equipment and Pet NFTs. Equip, upgrade (3 same → 1 next rarity),
        or list for sale in Kiosk.
      </p>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          <section>
            <h2 className="text-lg font-medium">Gear ({gear.length})</h2>
            {gear.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No gear. Pull from Gacha.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {gear.map((item) => (
                  <GearItem
                    key={item.objectId}
                    objectId={item.objectId}
                    fields={item.fields as EquipmentNFTFields}
                  />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-medium">Pets ({pets.length})</h2>
            {pets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pets. Pull from Gacha.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {pets.map((item) => (
                  <PetItem
                    key={item.objectId}
                    objectId={item.objectId}
                    fields={item.fields as PetNFTFields}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
