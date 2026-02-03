/// Game state: Player (persistent) and Run (per-session).
/// One-time init or create_player; start_run / end_run.
module sui_venture_project::game_state;

use std::option::{none, Option};
use sui::object::{ID, UID};
use sui::transfer;
use sui::tx_context::TxContext;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BOARD_TILE_COUNT: u64 = 32;
const FLOOR_COUNT: u8 = 15;
const BASE_POTION_CARRY: u64 = 3;
const BASE_POTION_HEAL: u64 = 30;
const BASE_ATK: u64 = 10;
const BASE_HP: u64 = 100;
const BASE_ACC: u64 = 80;
const BASE_DEF: u64 = 5;

// Slots: 0 Helmet, 1 Armor, 2 Weapon, 3 Shield (Player/Run fields map by index)
const SLOT_HELMET: u8 = 0;
const SLOT_ARMOR: u8 = 1;
const SLOT_WEAPON: u8 = 2;
const SLOT_SHIELD: u8 = 3;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

const ENotOwner: u64 = 1;
const EInvalidPlayer: u64 = 2;
const ERunActive: u64 = 3;
const ENoRun: u64 = 4;

// ---------------------------------------------------------------------------
// Player (owned, persistent)
// ---------------------------------------------------------------------------

public struct Player has key, store {
    id: UID,
    base_atk: u64,
    base_hp: u64,
    base_acc: u64,
    base_def: u64,
    blue_gems: u64,
    equipped_helmet: Option<ID>,
    equipped_weapon: Option<ID>,
    equipped_shield: Option<ID>,
    equipped_boots: Option<ID>,
    equipped_pet: Option<ID>,
}

// ---------------------------------------------------------------------------
// Run (owned, per-session)
// ---------------------------------------------------------------------------

public struct Run has key, store {
    id: UID,
    player_id: ID,
    current_hp: u64,
    max_hp: u64,
    temp_atk: u64,
    temp_acc: u64,
    temp_def: u64,
    floor: u8,
    position_on_board: u64,
    roll_count: u64,
    blue_gems: u64,
    potion_count: u64,
    potion_heal_amount: u64,
    potion_max_carry: u64,
    board_tile_count: u64,
    temp_helmet: Option<ID>,
    temp_weapon: Option<ID>,
    temp_shield: Option<ID>,
    temp_boots: Option<ID>,
}

// ---------------------------------------------------------------------------
// Player getters
// ---------------------------------------------------------------------------

public fun id(player: &Player): ID {
    object::id(player)
}

public fun base_atk(player: &Player): u64 {
    player.base_atk
}

public fun base_hp(player: &Player): u64 {
    player.base_hp
}

public fun base_acc(player: &Player): u64 {
    player.base_acc
}

public fun base_def(player: &Player): u64 {
    player.base_def
}

public fun blue_gems(player: &Player): u64 {
    player.blue_gems
}

public fun equipped_helmet(player: &Player): Option<ID> {
    player.equipped_helmet
}

public fun equipped_weapon(player: &Player): Option<ID> {
    player.equipped_weapon
}

public fun equipped_shield(player: &Player): Option<ID> {
    player.equipped_shield
}

public fun equipped_boots(player: &Player): Option<ID> {
    player.equipped_boots
}

public fun equipped_pet(player: &Player): Option<ID> {
    player.equipped_pet
}

// ---------------------------------------------------------------------------
// Run getters
// ---------------------------------------------------------------------------

public fun run_id(run: &Run): ID {
    object::id(run)
}

public fun player_id(run: &Run): ID {
    run.player_id
}

public fun current_hp(run: &Run): u64 {
    run.current_hp
}

public fun max_hp(run: &Run): u64 {
    run.max_hp
}

public fun floor(run: &Run): u8 {
    run.floor
}

public fun position_on_board(run: &Run): u64 {
    run.position_on_board
}

public fun roll_count(run: &Run): u64 {
    run.roll_count
}

public fun run_blue_gems(run: &Run): u64 {
    run.blue_gems
}

public fun potion_count(run: &Run): u64 {
    run.potion_count
}

public fun potion_heal_amount(run: &Run): u64 {
    run.potion_heal_amount
}

public fun potion_max_carry(run: &Run): u64 {
    run.potion_max_carry
}

public fun board_tile_count(run: &Run): u64 {
    run.board_tile_count
}

public fun temp_atk(run: &Run): u64 {
    run.temp_atk
}

public fun temp_acc(run: &Run): u64 {
    run.temp_acc
}

public fun temp_def(run: &Run): u64 {
    run.temp_def
}

public fun temp_helmet(run: &Run): Option<ID> {
    run.temp_helmet
}

public fun temp_weapon(run: &Run): Option<ID> {
    run.temp_weapon
}

public fun temp_shield(run: &Run): Option<ID> {
    run.temp_shield
}

public fun temp_boots(run: &Run): Option<ID> {
    run.temp_boots
}

// ---------------------------------------------------------------------------
// Shared constants for other modules
// ---------------------------------------------------------------------------

public fun board_tile_count_const(): u64 {
    BOARD_TILE_COUNT
}

public fun floor_count_const(): u8 {
    FLOOR_COUNT
}

public fun base_potion_carry_const(): u64 {
    BASE_POTION_CARRY
}

public fun base_potion_heal_const(): u64 {
    BASE_POTION_HEAL
}

// ---------------------------------------------------------------------------
// Create Player (anyone can create their first Player)
// ---------------------------------------------------------------------------

public fun create_player(ctx: &mut TxContext): Player {
    Player {
        id: object::new(ctx),
        base_atk: BASE_ATK,
        base_hp: BASE_HP,
        base_acc: BASE_ACC,
        base_def: BASE_DEF,
        blue_gems: 0,
        equipped_helmet: none(),
        equipped_weapon: none(),
        equipped_shield: none(),
        equipped_boots: none(),
        equipped_pet: none(),
    }
}

public entry fun create_player_and_transfer(ctx: &mut TxContext) {
    let player = create_player(ctx);
    transfer::transfer(player, ctx.sender());
}

// ---------------------------------------------------------------------------
// Start Run (creates Run from Player; caller must own Player)
// ---------------------------------------------------------------------------

public fun start_run(player: Player, ctx: &mut TxContext): (Player, Run) {
    let player_id = object::id(&player);
    let run = Run {
        id: object::new(ctx),
        player_id,
        current_hp: player.base_hp,
        max_hp: player.base_hp,
        temp_atk: player.base_atk,
        temp_acc: player.base_acc,
        temp_def: player.base_def,
        floor: 1,
        position_on_board: 0,
        roll_count: 0,
        blue_gems: 0,
        potion_count: BASE_POTION_CARRY,
        potion_heal_amount: BASE_POTION_HEAL,
        potion_max_carry: BASE_POTION_CARRY,
        board_tile_count: BOARD_TILE_COUNT,
        temp_helmet: none(),
        temp_weapon: none(),
        temp_shield: none(),
        temp_boots: none(),
    };
    (player, run)
}

public entry fun start_run_entry(player: Player, ctx: &mut TxContext) {
    let (player, run) = start_run(player, ctx);
    transfer::transfer(player, ctx.sender());
    transfer::transfer(run, ctx.sender());
}

// ---------------------------------------------------------------------------
// Update Run (for run_logic; returns new Run with updated fields)
// ---------------------------------------------------------------------------

/// Update Run fields. Consumes old Run, creates new Run with same player/board; used by run_logic.
/// New Run gets a new UID (Sui does not allow reusing UID in object construction).
public fun update_run(
    run: Run,
    current_hp: u64,
    max_hp: u64,
    temp_atk: u64,
    temp_acc: u64,
    temp_def: u64,
    floor: u8,
    position_on_board: u64,
    roll_count: u64,
    blue_gems: u64,
    potion_count: u64,
    potion_heal_amount: u64,
    potion_max_carry: u64,
    temp_helmet: Option<ID>,
    temp_weapon: Option<ID>,
    temp_shield: Option<ID>,
    temp_boots: Option<ID>,
    ctx: &mut TxContext,
): Run {
    let Run { id, player_id, board_tile_count, .. } = run;
    id.delete();
    Run {
        id: object::new(ctx),
        player_id,
        current_hp,
        max_hp,
        temp_atk,
        temp_acc,
        temp_def,
        floor,
        position_on_board,
        roll_count,
        blue_gems,
        potion_count,
        potion_heal_amount,
        potion_max_carry,
        board_tile_count,
        temp_helmet,
        temp_weapon,
        temp_shield,
        temp_boots,
    }
}

// ---------------------------------------------------------------------------
// End Run (burn Run)
// ---------------------------------------------------------------------------

/// Consume and delete Run. Use when run ends (win or lose) without updating Player.
public fun end_run(run: Run) {
    let Run { id, .. } = run;
    id.delete();
}

public entry fun end_run_entry(run: Run) {
    end_run(run);
}

// ---------------------------------------------------------------------------
// End Run With Rewards (burn Run, add blue_gems to Player)
// ---------------------------------------------------------------------------

/// Consume Run and add final_blue_gems to Player; then return Player.
public fun end_run_with_rewards(run: Run, player: Player, final_blue_gems: u64): Player {
    let Run { id, .. } = run;
    id.delete();
    let mut p = player;
    p.blue_gems = p.blue_gems + final_blue_gems;
    p
}

public entry fun end_run_with_rewards_entry(
    run: Run,
    player: Player,
    final_blue_gems: u64,
    ctx: &mut TxContext,
) {
    let player = end_run_with_rewards(run, player, final_blue_gems);
    transfer::transfer(player, ctx.sender());
}
