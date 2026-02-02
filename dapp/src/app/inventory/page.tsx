"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useOwnedNFTs } from "@/data";
import { RARITY_NAMES, SLOT_NAMES } from "@/config/contracts";
import { PET_CATALOG } from "@/config/contracts";
import type { EquipmentNFTFields, PetNFTFields } from "@/config/contracts";
import { UpgradeGearBlock } from "@/components/inventory/UpgradeGearBlock";
import { UpgradePetBlock } from "@/components/inventory/UpgradePetBlock";

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

function groupGearForUpgrade(
  gear: { objectId: string; fields: EquipmentNFTFields }[]
): { key: string; objectIds: [string, string, string]; fields: EquipmentNFTFields }[] {
  const byKey = new Map<
    string,
    { objectIds: string[]; fields: EquipmentNFTFields }
  >();
  for (const item of gear) {
    const f = item.fields;
    const key = `${f.slot}_${f.set_id}_${f.rarity}`;
    let entry = byKey.get(key);
    if (!entry) {
      entry = { objectIds: [], fields: f };
      byKey.set(key, entry);
    }
    entry.objectIds.push(item.objectId);
  }
  const out: { key: string; objectIds: [string, string, string]; fields: EquipmentNFTFields }[] = [];
  for (const [key, { objectIds, fields }] of byKey) {
    if (objectIds.length >= 3 && fields.rarity < 4)
      out.push({
        key,
        objectIds: [objectIds[0], objectIds[1], objectIds[2]],
        fields,
      });
  }
  return out;
}

function groupPetsForUpgrade(
  pets: { objectId: string; fields: PetNFTFields }[]
): { key: string; objectIds: [string, string, string]; fields: PetNFTFields }[] {
  const byKey = new Map<
    string,
    { objectIds: string[]; fields: PetNFTFields }
  >();
  for (const item of pets) {
    const f = item.fields;
    const key = `${f.pet_id}_${f.rarity}`;
    let entry = byKey.get(key);
    if (!entry) {
      entry = { objectIds: [], fields: f };
      byKey.set(key, entry);
    }
    entry.objectIds.push(item.objectId);
  }
  const out: { key: string; objectIds: [string, string, string]; fields: PetNFTFields }[] = [];
  for (const [key, { objectIds, fields }] of byKey) {
    if (objectIds.length >= 3 && fields.rarity < 4)
      out.push({
        key,
        objectIds: [objectIds[0], objectIds[1], objectIds[2]],
        fields,
      });
  }
  return out;
}

export default function InventoryPage() {
  const account = useCurrentAccount();
  const { gear, pets, isPending, refetch } = useOwnedNFTs();
  const gearUpgrades = groupGearForUpgrade(
    gear.map((g) => ({ objectId: g.objectId, fields: g.fields as EquipmentNFTFields }))
  );
  const petUpgrades = groupPetsForUpgrade(
    pets.map((p) => ({ objectId: p.objectId, fields: p.fields as PetNFTFields }))
  );

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
          {gearUpgrades.length > 0 && (
            <section>
              <h2 className="text-lg font-medium">Upgrade gear (3 same → 1 next rarity)</h2>
              <ul className="mt-2 space-y-2">
                {gearUpgrades.map((g) => (
                  <li key={g.key}>
                    <UpgradeGearBlock
                      objectIds={g.objectIds}
                      fields={g.fields}
                      onSuccess={refetch}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {petUpgrades.length > 0 && (
            <section>
              <h2 className="text-lg font-medium">Upgrade pets (3 same → 1 next rarity)</h2>
              <ul className="mt-2 space-y-2">
                {petUpgrades.map((p) => (
                  <li key={p.key}>
                    <UpgradePetBlock
                      objectIds={p.objectIds}
                      fields={p.fields}
                      onSuccess={refetch}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

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

          <section className="rounded-lg border bg-muted/30 p-4">
            <h2 className="text-lg font-medium">Marketplace</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              List for sale: place NFT in your Kiosk and list with price (MIST). Buy: kiosk::purchase + pay 5% admin fee + confirm_request. Configure TRANSFER_POLICY_* and use Kiosk SDK for full flow.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
