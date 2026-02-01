/// Run logic: roll 2d6, move, events (Combat, LuckyGacha, BadEvent, Heal), potions, shop.
/// Run is taken by value and returned updated; caller transfers back.
module sui_venture_project::run_logic;

use sui::random::{Self, Random, RandomGenerator};
use sui::tx_context::TxContext;

use sui_venture_project::game_state::{Self, Run};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHOP_INTERVAL: u8 = 3;
const BOSS_ROLL_INTERVAL: u64 = 5;

const EVENT_COMBAT: u8 = 0;
const EVENT_LUCKY_GACHA: u8 = 1;
const EVENT_BAD: u8 = 2;
const EVENT_HEAL: u8 = 3;
const NUM_EVENT_TYPES: u8 = 4;

const ENEMY_BASE_ATK: u64 = 5;
const ENEMY_BASE_DEF: u64 = 2;
const ENEMY_ACC: u64 = 50;
const BOSS_ATK_BONUS: u64 = 5;
const COMBAT_BLUE_GEMS_BASE: u64 = 1;
const BAD_EVENT_HP_LOSS_BASE: u64 = 5;
const HEAL_AMOUNT: u64 = 20;

// Shop upgrade types
const SHOP_HEAL_UP: u8 = 0;   // potion_heal_amount += 10
const SHOP_CARRY_UP: u8 = 1;  // potion_max_carry += 1
const SHOP_ATK_UP: u8 = 2;    // temp_atk += 5
const SHOP_POTION: u8 = 3;    // potion_count += 1 (cap at max_carry)

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

const ENoPotion: u64 = 1;
const EInvalidShopUpgrade: u64 = 2;

// ---------------------------------------------------------------------------
// Dice: 2d6 → 2–12
// ---------------------------------------------------------------------------

public fun roll_2d6(r: &Random, ctx: &mut TxContext): u8 {
    let mut g = random::new_generator(r, ctx);
    let d1 = random::generate_u8_in_range(&mut g, 1, 6);
    let d2 = random::generate_u8_in_range(&mut g, 1, 6);
    d1 + d2
}

// ---------------------------------------------------------------------------
// Event type for current tile (random 0–3)
// ---------------------------------------------------------------------------

fun event_type(g: &mut RandomGenerator): u8 {
    random::generate_u8_in_range(g, 0, NUM_EVENT_TYPES - 1)
}

// ---------------------------------------------------------------------------
// Combat: player hits first (d100 vs ACC), then enemy. One round.
// Enemy has 1 HP (one hit kill). Drops blue_gems. Boss = stronger enemy.
// ---------------------------------------------------------------------------

fun resolve_combat(
    run: &Run,
    is_boss: bool,
    g: &mut RandomGenerator,
): (u64, u64) {
    let floor = game_state::floor(run) as u64;
    let enemy_atk = ENEMY_BASE_ATK + floor * 2 + (if (is_boss) { BOSS_ATK_BONUS } else { 0 });
    let enemy_def = ENEMY_BASE_DEF + floor;

    let player_hit = random::generate_u8_in_range(g, 0, 99) < (game_state::temp_acc(run) as u8);
    let player_dmg = if (player_hit) {
        let dmg = game_state::temp_atk(run) - enemy_def;
        if (dmg > 0) { dmg } else { 1 }
    } else {
        0
    };
    // Enemy dies in one hit (we treat as 1 HP). Blue gems drop.
    let blue_gems_drop = COMBAT_BLUE_GEMS_BASE + floor;

    let enemy_hit = random::generate_u8_in_range(g, 0, 99) < (ENEMY_ACC as u8);
    let enemy_dmg = if (enemy_hit) {
        let dmg = enemy_atk - game_state::temp_def(run);
        if (dmg > 0) { dmg } else { 1 }
    } else {
        0
    };

    (blue_gems_drop, enemy_dmg)
}

// ---------------------------------------------------------------------------
// Roll and move: advance position, maybe floor, resolve event, return updated Run
// ---------------------------------------------------------------------------

public fun roll_and_move(run: Run, r: &Random, ctx: &mut TxContext): Run {
    let mut g = random::new_generator(r, ctx);
    let dice = (random::generate_u8_in_range(&mut g, 1, 6) as u64)
        + (random::generate_u8_in_range(&mut g, 1, 6) as u64);

    let position = game_state::position_on_board(&run);
    let board_tile_count = game_state::board_tile_count(&run);
    let new_position = (position + dice) % board_tile_count;
    let floor_advanced = (position + dice) >= board_tile_count;
    let mut floor = game_state::floor(&run);
    if (floor_advanced && floor < game_state::floor_count_const()) {
        floor = floor + 1;
    };
    let roll_count = game_state::roll_count(&run) + 1;
    let is_boss = roll_count % BOSS_ROLL_INTERVAL == 0 && roll_count > 0;

    let event = if (is_boss) { EVENT_COMBAT } else { event_type(&mut g) };

    let mut current_hp = game_state::current_hp(&run);
    let mut blue_gems = game_state::run_blue_gems(&run);
    let mut potion_count = game_state::potion_count(&run);

    if (event == EVENT_COMBAT) {
        let (gems, enemy_dmg) = resolve_combat(&run, is_boss, &mut g);
        blue_gems = blue_gems + gems;
        current_hp = if (enemy_dmg >= current_hp) { 0 } else { current_hp - enemy_dmg };
    } else if (event == EVENT_LUCKY_GACHA) {
        let max_carry = game_state::potion_max_carry(&run);
        if (potion_count < max_carry) {
            potion_count = potion_count + 1;
        };
    } else if (event == EVENT_BAD) {
        let loss = BAD_EVENT_HP_LOSS_BASE + (floor as u64);
        current_hp = if (loss >= current_hp) { 0 } else { current_hp - loss };
    } else {
        // EVENT_HEAL
        let max_hp = game_state::max_hp(&run);
        current_hp = if (current_hp + HEAL_AMOUNT > max_hp) { max_hp } else { current_hp + HEAL_AMOUNT };
    };

    let max_hp = game_state::max_hp(&run);
    let temp_atk = game_state::temp_atk(&run);
    let temp_acc = game_state::temp_acc(&run);
    let temp_def = game_state::temp_def(&run);
    let potion_heal = game_state::potion_heal_amount(&run);
    let potion_max = game_state::potion_max_carry(&run);
    let th = game_state::temp_helmet(&run);
    let tw = game_state::temp_weapon(&run);
    let ts = game_state::temp_shield(&run);
    let tb = game_state::temp_boots(&run);
    game_state::update_run(
        run,
        current_hp,
        max_hp,
        temp_atk,
        temp_acc,
        temp_def,
        floor,
        new_position,
        roll_count,
        blue_gems,
        potion_count,
        potion_heal,
        potion_max,
        th,
        tw,
        ts,
        tb,
        ctx,
    )
}

// ---------------------------------------------------------------------------
// Use potion: heal, consume one potion
// ---------------------------------------------------------------------------

public fun use_potion(run: Run, ctx: &mut TxContext): Run {
    let count = game_state::potion_count(&run);
    assert!(count > 0, ENoPotion);
    let current = game_state::current_hp(&run);
    let heal = game_state::potion_heal_amount(&run);
    let max_hp = game_state::max_hp(&run);
    let new_hp = if (current + heal > max_hp) { max_hp } else { current + heal };
    let temp_atk = game_state::temp_atk(&run);
    let temp_acc = game_state::temp_acc(&run);
    let temp_def = game_state::temp_def(&run);
    let floor = game_state::floor(&run);
    let position = game_state::position_on_board(&run);
    let roll_count = game_state::roll_count(&run);
    let blue_gems = game_state::run_blue_gems(&run);
    let potion_max = game_state::potion_max_carry(&run);
    let th = game_state::temp_helmet(&run);
    let tw = game_state::temp_weapon(&run);
    let ts = game_state::temp_shield(&run);
    let tb = game_state::temp_boots(&run);
    game_state::update_run(
        run,
        new_hp,
        max_hp,
        temp_atk,
        temp_acc,
        temp_def,
        floor,
        position,
        roll_count,
        blue_gems,
        count - 1,
        heal,
        potion_max,
        th,
        tw,
        ts,
        tb,
        ctx,
    )
}

// ---------------------------------------------------------------------------
// Shop buy: apply upgrade (only valid when floor % 3 == 0; frontend checks)
// ---------------------------------------------------------------------------

public fun shop_buy(run: Run, upgrade: u8, ctx: &mut TxContext): Run {
    let mut heal = game_state::potion_heal_amount(&run);
    let mut carry = game_state::potion_max_carry(&run);
    let mut atk = game_state::temp_atk(&run);
    let mut potions = game_state::potion_count(&run);
    if (upgrade == SHOP_HEAL_UP) {
        heal = heal + 10;
    } else if (upgrade == SHOP_CARRY_UP) {
        carry = carry + 1;
    } else if (upgrade == SHOP_ATK_UP) {
        atk = atk + 5;
    } else if (upgrade == SHOP_POTION) {
        if (potions < carry) {
            potions = potions + 1;
        };
    } else {
        abort EInvalidShopUpgrade
    };
    let current_hp = game_state::current_hp(&run);
    let max_hp = game_state::max_hp(&run);
    let temp_acc = game_state::temp_acc(&run);
    let temp_def = game_state::temp_def(&run);
    let floor = game_state::floor(&run);
    let position = game_state::position_on_board(&run);
    let roll_count = game_state::roll_count(&run);
    let blue_gems = game_state::run_blue_gems(&run);
    let th = game_state::temp_helmet(&run);
    let tw = game_state::temp_weapon(&run);
    let ts = game_state::temp_shield(&run);
    let tb = game_state::temp_boots(&run);
    game_state::update_run(
        run,
        current_hp,
        max_hp,
        atk,
        temp_acc,
        temp_def,
        floor,
        position,
        roll_count,
        blue_gems,
        potions,
        heal,
        carry,
        th,
        tw,
        ts,
        tb,
        ctx,
    )
}

// ---------------------------------------------------------------------------
// Entry points (take Run by value, return updated Run to sender)
// ---------------------------------------------------------------------------

public entry fun roll_and_move_entry(run: Run, r: &Random, ctx: &mut TxContext) {
    let run = roll_and_move(run, r, ctx);
    transfer::public_transfer(run, ctx.sender());
}

public entry fun use_potion_entry(run: Run, ctx: &mut TxContext) {
    let run = use_potion(run, ctx);
    transfer::public_transfer(run, ctx.sender());
}

public entry fun shop_buy_entry(run: Run, upgrade: u8, ctx: &mut TxContext) {
    let run = shop_buy(run, upgrade, ctx);
    transfer::public_transfer(run, ctx.sender());
}
