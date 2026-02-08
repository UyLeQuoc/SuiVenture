/**
 * SuiVenture contract config and shared types.
 * Package and object IDs are set after deploy (env or .env.local).
 */

export const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ?? "0x0";
export const GACHA_GEAR_ID =
  process.env.NEXT_PUBLIC_GACHA_GEAR_ID ?? "0x0";
export const GACHA_PET_ID =
  process.env.NEXT_PUBLIC_GACHA_PET_ID ?? "0x0";
export const NFT_MINT_AUTHORITY_ID =
  process.env.NEXT_PUBLIC_NFT_MINT_AUTHORITY_ID ?? "0x0";
/** Sui system Random object ID (required for gacha and run_logic). */
export const RANDOM_ID = "0x8"
export const TRANSFER_POLICY_GEAR_ID =
  process.env.NEXT_PUBLIC_TRANSFER_POLICY_GEAR_ID ?? "0x0";
export const TRANSFER_POLICY_PET_ID =
  process.env.NEXT_PUBLIC_TRANSFER_POLICY_PET_ID ?? "0x0";
/** Admin wallet address; if set, only this wallet can use Admin page withdraw. */
export const ADMIN_ADDRESS =
  process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "";

/** 0.01 SUI in MIST (1x gacha price). */
export const GACHA_PRICE_MIST = BigInt(10_000_000);
/** 0.1 SUI in MIST (10x gacha price). */
export const GACHA_PRICE_10X_MIST = BigInt(100_000_000);

export const MODULE_GAME_STATE = "game_state";
export const MODULE_RUN_LOGIC = "run_logic";
export const MODULE_GACHA_GEAR = "gacha_gear";
export const MODULE_GACHA_PET = "gacha_pet";
export const MODULE_NFT_COLLECTION = "nft_collection";
export const MODULE_UPGRADE = "upgrade";
export const MODULE_MARKETPLACE = "marketplace";

/** Full type string for AdminFeeRule witness (used as the rule key on TransferPolicy). */
export function adminFeeRuleType(packageId: string) {
  return `${packageId}::${MODULE_MARKETPLACE}::AdminFeeRule`;
}

/** Rarity tiers: 0 Normal, 1 Rare, 2 Epic, 3 Legend, 4 Mystic */
export const RARITY_NAMES = [
  "Normal",
  "Rare",
  "Epic",
  "Legend",
  "Mystic",
] as const;
export type RarityName = (typeof RARITY_NAMES)[number];

/** Gear gacha rates (roll 0–99): sync with gacha_gear::roll_rarity. [Normal, Rare, Epic, Legend, Mystic] % */
export const GACHA_GEAR_RARITY_PERCENTS = [50, 25, 15, 7, 3] as const;
/** Pet gacha rates: same as gear (gacha_pet::roll_rarity). */
export const GACHA_PET_RARITY_PERCENTS = [50, 25, 15, 7, 3] as const;

/** Gear slots: 0 Helmet, 1 Armor, 2 Weapon, 3 Shield */
export const SLOT_NAMES = ["Helmet", "Armor", "Weapon", "Shield"] as const;
export type SlotName = (typeof SLOT_NAMES)[number];

/** 2 sets × 4 slots = 8 gear art assets. Frontend uses (set_id, slot) for image. */
export const GEAR_ART_SET_COUNT = 2;
export const GEAR_SLOT_COUNT = 4;

/** Pet catalog: 5 pets, one art per pet_id. */
export const PET_CATALOG = [
  { pet_id: 0, name: "Ember", bonus_type: "+ATK %", art_hint: "Fire critter" },
  { pet_id: 1, name: "Shell", bonus_type: "+DEF flat", art_hint: "Turtle" },
  { pet_id: 2, name: "Whisper", bonus_type: "+ACC %", art_hint: "Ghost" },
  { pet_id: 3, name: "Bloom", bonus_type: "+HP regen", art_hint: "Plant" },
  { pet_id: 4, name: "Spark", bonus_type: "+Crit chance", art_hint: "Electric" },
] as const;

export interface PlayerFields {
  base_atk: string;
  base_hp: string;
  base_acc: string;
  base_def: string;
  blue_gems: string;
  equipped_helmet?: string | null;
  equipped_weapon?: string | null;
  equipped_shield?: string | null;
  equipped_boots?: string | null;
  equipped_pet?: string | null;
}

export interface RunFields {
  player_id: string;
  current_hp: string;
  max_hp: string;
  temp_atk: string;
  temp_acc: string;
  temp_def: string;
  floor: number;
  position_on_board: string;
  roll_count: string;
  blue_gems: string;
  potion_count: string;
  potion_heal_amount: string;
  potion_max_carry: string;
  board_tile_count: string;
}

export interface EquipmentNFTFields {
  slot: number;
  set_id: number;
  rarity: number;
  atk: string;
  hp: string;
  acc: string;
  def: string;
}

export interface PetNFTFields {
  pet_id: number;
  rarity: number;
  bonus_type: number;
  bonus_value: string;
}

/** Event payload from gacha_gear::GearPulled (parsedJson). */
export interface GearPulledEvent {
  sender: string;
  object_id: string;
  slot: number;
  set_id: number;
  rarity: number;
  atk: string;
  hp: string;
  acc: string;
  def: string;
}

/** Event payload from gacha_pet::PetPulled (parsedJson). */
export interface PetPulledEvent {
  sender: string;
  object_id: string;
  pet_id: number;
  rarity: number;
  bonus_type: number;
  bonus_value: string;
}

/** Full type names for getOwnedObjects / getObject */
export function playerType(packageId: string) {
  return `${packageId}::${MODULE_GAME_STATE}::Player`;
}
export function runType(packageId: string) {
  return `${packageId}::${MODULE_GAME_STATE}::Run`;
}
export function equipmentNFTType(packageId: string) {
  return `${packageId}::${MODULE_NFT_COLLECTION}::EquipmentNFT`;
}
export function petNFTType(packageId: string) {
  return `${packageId}::${MODULE_NFT_COLLECTION}::PetNFT`;
}

/** TransferPolicyCap<EquipmentNFT> – admin holds this to withdraw from Gear policy. (Framework 0x2) */
export function transferPolicyCapGearType(packageId: string) {
  return `0x2::transfer_policy::TransferPolicyCap<${packageId}::${MODULE_NFT_COLLECTION}::EquipmentNFT>`;
}

/** TransferPolicyCap<PetNFT> – admin holds this to withdraw from Pet policy. (Framework 0x2) */
export function transferPolicyCapPetType(packageId: string) {
  return `0x2::transfer_policy::TransferPolicyCap<${packageId}::${MODULE_NFT_COLLECTION}::PetNFT>`;
}

/** Event type string for filtering GearPulled from tx events. */
export function gearPulledEventType(packageId: string) {
  return `${packageId}::${MODULE_GACHA_GEAR}::GearPulled`;
}

/** Event type string for filtering PetPulled from tx events. */
export function petPulledEventType(packageId: string) {
  return `${packageId}::${MODULE_GACHA_PET}::PetPulled`;
}
