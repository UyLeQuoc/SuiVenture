/// Permanent Gear & Pet NFTs. 5 rarities; 2 set_id for gear (8 art); 5 pet_id.
/// Mint via gacha_gear / gacha_pet using NftMintAuthority.
module sui_venture_project::nft_collection;

use sui::object::{ID, UID};
use sui::transfer;
use sui::tx_context::TxContext;

// ---------------------------------------------------------------------------
// Rarity (5 tiers): Normal (0), Rare (1), Epic (2), Legend (3), Mystic (4)
// ---------------------------------------------------------------------------

const RARITY_NORMAL: u8 = 0;
const RARITY_RARE: u8 = 1;
const RARITY_EPIC: u8 = 2;
const RARITY_LEGEND: u8 = 3;
const RARITY_MYSTIC: u8 = 4;

// Slots: 0 Helmet, 1 Armor, 2 Weapon, 3 Shield
const SLOT_HELMET: u8 = 0;
const SLOT_ARMOR: u8 = 1;
const SLOT_WEAPON: u8 = 2;
const SLOT_SHIELD: u8 = 3;

const NUM_SLOTS: u8 = 4;
const NUM_SET_IDS: u8 = 2;
const NUM_PET_IDS: u8 = 5;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

const EInvalidRarity: u64 = 1;
const EInvalidSlot: u64 = 2;
const EInvalidSetId: u64 = 3;
const EInvalidPetId: u64 = 4;

// ---------------------------------------------------------------------------
// Equipment NFT (slot, set_id, rarity, stats). 2 sets × 4 slots = 8 art.
// ---------------------------------------------------------------------------

public struct EquipmentNFT has key, store {
    id: UID,
    slot: u8,
    set_id: u8,
    rarity: u8,
    atk: u64,
    hp: u64,
    acc: u64,
    def: u64,
}

// ---------------------------------------------------------------------------
// Pet NFT (pet_id, rarity, bonus). 5 pet arts.
// ---------------------------------------------------------------------------

public struct PetNFT has key, store {
    id: UID,
    pet_id: u8,
    rarity: u8,
    bonus_type: u8,
    bonus_value: u64,
}

// ---------------------------------------------------------------------------
// Mint caps (one-time from OTW)
// ---------------------------------------------------------------------------

public struct MintCapGear has key, store {
    id: UID,
}

public struct MintCapPet has key, store {
    id: UID,
}

// ---------------------------------------------------------------------------
// Shared mint authority (holds caps; gacha modules call mint via this)
// ---------------------------------------------------------------------------

public struct NftMintAuthority has key {
    id: UID,
    gear_cap: MintCapGear,
    pet_cap: MintCapPet,
}

// ---------------------------------------------------------------------------
// EquipmentNFT getters
// ---------------------------------------------------------------------------

public fun id_gear(gear: &EquipmentNFT): ID {
    object::id(gear)
}

public fun slot(gear: &EquipmentNFT): u8 {
    gear.slot
}

public fun set_id(gear: &EquipmentNFT): u8 {
    gear.set_id
}

public fun rarity_gear(gear: &EquipmentNFT): u8 {
    gear.rarity
}

public fun atk(gear: &EquipmentNFT): u64 {
    gear.atk
}

public fun hp(gear: &EquipmentNFT): u64 {
    gear.hp
}

public fun acc(gear: &EquipmentNFT): u64 {
    gear.acc
}

public fun def(gear: &EquipmentNFT): u64 {
    gear.def
}

// ---------------------------------------------------------------------------
// PetNFT getters
// ---------------------------------------------------------------------------

public fun id_pet(pet: &PetNFT): ID {
    object::id(pet)
}

public fun pet_id(pet: &PetNFT): u8 {
    pet.pet_id
}

public fun rarity_pet(pet: &PetNFT): u8 {
    pet.rarity
}

public fun bonus_type(pet: &PetNFT): u8 {
    pet.bonus_type
}

public fun bonus_value(pet: &PetNFT): u64 {
    pet.bonus_value
}

// ---------------------------------------------------------------------------
// Create mint authority (called from package init with OTW)
// ---------------------------------------------------------------------------

/// One-time witness for this module (used in init).
public struct NFT_COLLECTION has drop {}

/// Called once when the package is published. Creates and shares NftMintAuthority.
fun init(otw: NFT_COLLECTION, ctx: &mut TxContext) {
    let authority = NftMintAuthority {
        id: object::new(ctx),
        gear_cap: MintCapGear { id: object::new(ctx) },
        pet_cap: MintCapPet { id: object::new(ctx) },
    };
    transfer::share_object(authority);
}

// ---------------------------------------------------------------------------
// Destroy gear (burn). Called by upgrade when merging 3→1.
// ---------------------------------------------------------------------------

public fun destroy_gear(gear: EquipmentNFT) {
    let EquipmentNFT { id, .. } = gear;
    id.delete();
}

// ---------------------------------------------------------------------------
// Destroy pet (burn). Called by upgrade when merging 3→1.
// ---------------------------------------------------------------------------

public fun destroy_pet(pet: PetNFT) {
    let PetNFT { id, .. } = pet;
    id.delete();
}

// ---------------------------------------------------------------------------
// Mint gear (called by gacha_gear)
// ---------------------------------------------------------------------------

/// Returns the object ID of the minted gear (for event emission).
public fun mint_gear(
    _authority: &mut NftMintAuthority,
    slot: u8,
    set_id: u8,
    rarity: u8,
    atk: u64,
    hp: u64,
    acc: u64,
    def: u64,
    ctx: &mut TxContext,
): ID {
    assert!(slot < NUM_SLOTS, EInvalidSlot);
    assert!(set_id < NUM_SET_IDS, EInvalidSetId);
    assert!(rarity <= RARITY_MYSTIC, EInvalidRarity);
    let nft = EquipmentNFT {
        id: object::new(ctx),
        slot,
        set_id,
        rarity,
        atk,
        hp,
        acc,
        def,
    };
    let id = object::id(&nft);
    transfer::transfer(nft, ctx.sender());
    id
}

// ---------------------------------------------------------------------------
// Mint pet (called by gacha_pet). Creates and transfers to ctx.sender().
// ---------------------------------------------------------------------------

/// Returns the object ID of the minted pet (for event emission).
public fun mint_pet(
    _authority: &mut NftMintAuthority,
    pet_id: u8,
    rarity: u8,
    bonus_type: u8,
    bonus_value: u64,
    ctx: &mut TxContext,
): ID {
    assert!(pet_id < NUM_PET_IDS, EInvalidPetId);
    assert!(rarity <= RARITY_MYSTIC, EInvalidRarity);
    let nft = PetNFT {
        id: object::new(ctx),
        pet_id,
        rarity,
        bonus_type,
        bonus_value,
    };
    let id = object::id(&nft);
    transfer::transfer(nft, ctx.sender());
    id
}