/// Upgrade: 3 same items → 1 next rarity. Gear: same slot+set_id+rarity; Pet: same pet_id+rarity.
module sui_venture_project::upgrade;

use sui::tx_context::TxContext;

use sui_venture_project::nft_collection;
use sui_venture_project::nft_collection::{EquipmentNFT, NftMintAuthority, PetNFT};

// ---------------------------------------------------------------------------
// Rarity: Normal 0, Rare 1, Epic 2, Legend 3, Mystic 4. Mystic cannot upgrade.
// ---------------------------------------------------------------------------

const RARITY_MYSTIC: u8 = 4;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

const ENotSameSlot: u64 = 1;
const ENotSameSetId: u64 = 2;
const ENotSameRarity: u64 = 3;
const EMaxRarity: u64 = 4;
const ENotSamePetId: u64 = 5;

const BONUS_ATK_PCT: u8 = 0;
const BONUS_DEF_FLAT: u8 = 1;
const BONUS_ACC_PCT: u8 = 2;
const BONUS_HP_REGEN: u8 = 3;
const BONUS_CRIT: u8 = 4;

// ---------------------------------------------------------------------------
// Stats for next rarity (base * (rarity+1)); next_rarity = rarity + 1
// ---------------------------------------------------------------------------

fun stats_for_rarity(rarity: u8): (u64, u64, u64, u64) {
    let mul = ((rarity + 1) as u64);
    let base = 5;
    (base * mul, base * mul, base * mul, base * mul)
}

// ---------------------------------------------------------------------------
// Upgrade gear: burn 3 same slot+set_id+rarity, mint 1 next rarity
// ---------------------------------------------------------------------------

public fun upgrade_gear(
    a: EquipmentNFT,
    b: EquipmentNFT,
    c: EquipmentNFT,
    authority: &mut NftMintAuthority,
    ctx: &mut TxContext,
) {
    let slot_a = nft_collection::slot(&a);
    let slot_b = nft_collection::slot(&b);
    let slot_c = nft_collection::slot(&c);
    assert!(slot_a == slot_b && slot_b == slot_c, ENotSameSlot);

    let set_a = nft_collection::set_id(&a);
    let set_b = nft_collection::set_id(&b);
    let set_c = nft_collection::set_id(&c);
    assert!(set_a == set_b && set_b == set_c, ENotSameSetId);

    let r_a = nft_collection::rarity_gear(&a);
    let r_b = nft_collection::rarity_gear(&b);
    let r_c = nft_collection::rarity_gear(&c);
    assert!(r_a == r_b && r_b == r_c, ENotSameRarity);
    assert!(r_a < RARITY_MYSTIC, EMaxRarity);

    let slot = slot_a;
    let set_id = set_a;
    let next_rarity = r_a + 1;
    let (atk, hp, acc, def) = stats_for_rarity(next_rarity);

    nft_collection::destroy_gear(a);
    nft_collection::destroy_gear(b);
    nft_collection::destroy_gear(c);

    nft_collection::mint_gear(authority, slot, set_id, next_rarity, atk, hp, acc, def, ctx);
}

// ---------------------------------------------------------------------------
// Upgrade pet: burn 3 same pet_id+rarity, mint 1 next rarity
// ---------------------------------------------------------------------------

fun bonus_for_pet(pet_id: u8): (u8, u64) {
    if (pet_id == 0) (BONUS_ATK_PCT, 10)
    else if (pet_id == 1) (BONUS_DEF_FLAT, 5)
    else if (pet_id == 2) (BONUS_ACC_PCT, 10)
    else if (pet_id == 3) (BONUS_HP_REGEN, 3)
    else (BONUS_CRIT, 5)
}

public fun upgrade_pet(
    a: PetNFT,
    b: PetNFT,
    c: PetNFT,
    authority: &mut NftMintAuthority,
    ctx: &mut TxContext,
) {
    let pid_a = nft_collection::pet_id(&a);
    let pid_b = nft_collection::pet_id(&b);
    let pid_c = nft_collection::pet_id(&c);
    assert!(pid_a == pid_b && pid_b == pid_c, ENotSamePetId);

    let r_a = nft_collection::rarity_pet(&a);
    let r_b = nft_collection::rarity_pet(&b);
    let r_c = nft_collection::rarity_pet(&c);
    assert!(r_a == r_b && r_b == r_c, ENotSameRarity);
    assert!(r_a < RARITY_MYSTIC, EMaxRarity);

    let pet_id = pid_a;
    let next_rarity = r_a + 1;
    let (bonus_type, base_value) = bonus_for_pet(pet_id);
    let bonus_value = base_value * ((next_rarity as u64) + 1);

    nft_collection::destroy_pet(a);
    nft_collection::destroy_pet(b);
    nft_collection::destroy_pet(c);

    nft_collection::mint_pet(authority, pet_id, next_rarity, bonus_type, bonus_value, ctx);
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

public entry fun upgrade_gear_entry(
    a: EquipmentNFT,
    b: EquipmentNFT,
    c: EquipmentNFT,
    authority: &mut NftMintAuthority,
    ctx: &mut TxContext,
) {
    upgrade_gear(a, b, c, authority, ctx);
}

public entry fun upgrade_pet_entry(
    a: PetNFT,
    b: PetNFT,
    c: PetNFT,
    authority: &mut NftMintAuthority,
    ctx: &mut TxContext,
) {
    upgrade_pet(a, b, c, authority, ctx);
}
