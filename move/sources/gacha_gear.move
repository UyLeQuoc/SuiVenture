/// Gacha for gear only. Pay SUI, get random EquipmentNFT (slot, set_id, rarity weighted).
/// Payment is sent directly to admin address (no shared GachaGear object).
/// Supports 1x (0.01 SUI) or 10x (0.1 SUI); emits GearPulled per item.
module sui_venture_project::gacha_gear;

use sui::coin::{Self, Coin};
use sui::event;
use sui::object;
use sui::random::{Self, Random, RandomGenerator};
use sui::sui::SUI;
use sui::transfer;
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

const NUM_SLOTS: u8 = 4;
const NUM_SET_IDS: u8 = 2;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

const EInsufficientPayment: u64 = 1;
const EInvalidCount: u64 = 2;

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/// Emitted per gear minted (1 or 10 per tx). Frontend uses this to show items.
public struct GearPulled has copy, drop {
    sender: address,
    object_id: object::ID,
    slot: u8,
    set_id: u8,
    rarity: u8,
    atk: u64,
    hp: u64,
    acc: u64,
    def: u64,
}

// ---------------------------------------------------------------------------
// Weighted rarity: roll 0-99 => Normal > Rare > Epic > Legend > Mystic
// 0-49 Normal, 50-74 Rare, 75-89 Epic, 90-96 Legend, 97-99 Mystic
// ---------------------------------------------------------------------------

fun roll_rarity(g: &mut RandomGenerator): u8 {
    let roll = random::generate_u8_in_range(g, 0, 99);
    if (roll <= 49) RARITY_NORMAL
    else if (roll <= 74) RARITY_RARE
    else if (roll <= 89) RARITY_EPIC
    else if (roll <= 96) RARITY_LEGEND
    else RARITY_MYSTIC
}

// Stats from rarity: base * (rarity + 1)
fun stats_for_rarity(rarity: u8): (u64, u64, u64, u64) {
    let mul = (rarity as u64) + 1;
    let base = 5;
    (base * mul, base * mul, base * mul, base * mul)
}

// ---------------------------------------------------------------------------
// Pull gear: pay count * PRICE_MIST (1x = 0.01 SUI, 10x = 0.1 SUI), get random EquipmentNFT(s)
// ---------------------------------------------------------------------------

/// Pay total (count * 0.01 SUI) to admin; receive count random EquipmentNFTs. Emits GearPulled per item.
public entry fun pull_gear(
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
        let slot = random::generate_u8_in_range(&mut generator, 0, NUM_SLOTS - 1);
        let set_id = random::generate_u8_in_range(&mut generator, 0, NUM_SET_IDS - 1);
        let rarity = roll_rarity(&mut generator);
        let (atk, hp, acc, def) = stats_for_rarity(rarity);
        let object_id = nft_collection::mint_gear(authority, slot, set_id, rarity, atk, hp, acc, def, ctx);
        event::emit(GearPulled {
            sender,
            object_id,
            slot,
            set_id,
            rarity,
            atk,
            hp,
            acc,
            def,
        });
        i = i + 1;
    };
}
