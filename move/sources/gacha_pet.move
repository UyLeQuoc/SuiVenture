/// Gacha for pets only. Pay SUI, get random PetNFT (pet_id, rarity weighted).
/// Payment is sent directly to admin address (no shared GachaPet object).
/// Supports 1x (0.01 SUI) or 10x (0.1 SUI); emits PetPulled per item.
module sui_venture_project::gacha_pet;

use sui::coin::{Self, Coin};
use sui::event;
use sui::object;
use sui::random::{Self, Random, RandomGenerator};
use sui::sui::SUI;
use sui::tx_context::TxContext;

use sui_venture_project::nft_collection::{Self, NftMintAuthority};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/// Price per pull in MIST (e.g. 0.01 SUI = 10_000_000 MIST).
const PRICE_MIST: u64 = 10_000_000;

/// Admin wallet: receives all gacha payments.
const ADMIN: address = @admin;

// Rarity: Normal 0, Rare 1, Epic 2, Legend 3, Mystic 4
const RARITY_NORMAL: u8 = 0;
const RARITY_RARE: u8 = 1;
const RARITY_EPIC: u8 = 2;
const RARITY_LEGEND: u8 = 3;
const RARITY_MYSTIC: u8 = 4;

const NUM_PET_IDS: u8 = 5;

// Bonus types (catalog §2.3.1): +ATK%, +DEF flat, +ACC%, +HP regen, +Crit chance
const BONUS_ATK_PCT: u8 = 0;
const BONUS_DEF_FLAT: u8 = 1;
const BONUS_ACC_PCT: u8 = 2;
const BONUS_HP_REGEN: u8 = 3;
const BONUS_CRIT: u8 = 4;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

const EInsufficientPayment: u64 = 1;
const EInvalidCount: u64 = 2;

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/// Emitted per pet minted (1 or 10 per tx). Frontend uses this to show items.
public struct PetPulled has copy, drop {
    sender: address,
    object_id: object::ID,
    pet_id: u8,
    rarity: u8,
    bonus_type: u8,
    bonus_value: u64,
}

// ---------------------------------------------------------------------------
// Weighted rarity: same as gacha_gear
// ---------------------------------------------------------------------------

fun roll_rarity(g: &mut RandomGenerator): u8 {
    let roll = random::generate_u8_in_range(g, 0, 99);
    if (roll <= 49) RARITY_NORMAL
    else if (roll <= 74) RARITY_RARE
    else if (roll <= 89) RARITY_EPIC
    else if (roll <= 96) RARITY_LEGEND
    else RARITY_MYSTIC
}

// Catalog: pet_id 0 Ember +ATK%, 1 Shell +DEF, 2 Whisper +ACC%, 3 Bloom +HP regen, 4 Spark +Crit
fun bonus_for_pet(pet_id: u8): (u8, u64) {
    if (pet_id == 0) (BONUS_ATK_PCT, 10)
    else if (pet_id == 1) (BONUS_DEF_FLAT, 5)
    else if (pet_id == 2) (BONUS_ACC_PCT, 10)
    else if (pet_id == 3) (BONUS_HP_REGEN, 3)
    else (BONUS_CRIT, 5)
}

// Scale bonus value by rarity (rarity+1)
fun bonus_value_for_rarity(base: u64, rarity: u8): u64 {
    base * ((rarity as u64) + 1)
}

// ---------------------------------------------------------------------------
// Pull pet: pay count * PRICE_MIST (1x = 0.01 SUI, 10x = 0.1 SUI), get random PetNFT(s)
// ---------------------------------------------------------------------------

/// Pay total (count * 0.01 SUI) to admin; receive count random PetNFTs. Emits PetPulled per item.
public entry fun pull_pet(
    authority: &mut NftMintAuthority,
    mut coin: Coin<SUI>,
    count: u8,
    r: &Random,
    ctx: &mut TxContext,
) {
    assert!(count == 1 || count == 10, EInvalidCount);
    let total = (count as u64) * PRICE_MIST;
    assert!(coin::value(&coin) >= total, EInsufficientPayment);
    let pay = coin::split(&mut coin, total, ctx);
    transfer::public_transfer(pay, ADMIN);
    if (coin::value(&coin) > 0) {
        transfer::public_transfer(coin, ctx.sender());
    } else {
        coin::destroy_zero(coin);
    };

    let sender = ctx.sender();
    let mut generator = random::new_generator(r, ctx);
    let mut i = 0u8;
    while (i < count) {
        let pet_id = random::generate_u8_in_range(&mut generator, 0, NUM_PET_IDS - 1);
        let rarity = roll_rarity(&mut generator);
        let (bonus_type, base_value) = bonus_for_pet(pet_id);
        let bonus_value = bonus_value_for_rarity(base_value, rarity);
        let object_id = nft_collection::mint_pet(authority, pet_id, rarity, bonus_type, bonus_value, ctx);
        event::emit(PetPulled {
            sender,
            object_id,
            pet_id,
            rarity,
            bonus_type,
            bonus_value,
        });
        i = i + 1;
    };
}
