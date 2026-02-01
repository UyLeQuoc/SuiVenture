#[test_only]
module sui_venture_project::sui_venture_tests;

use sui::test_scenario;
use sui::transfer;

use sui_venture_project::game_state;
use sui_venture_project::run_logic;

const SENDER: address = @0x0;

// ---------------------------------------------------------------------------
// test_start_run: create player, start run, check run fields
// ---------------------------------------------------------------------------

#[test]
fun test_start_run() {
    let mut scenario = test_scenario::begin(SENDER);
    scenario.next_tx(SENDER);
    {
        let ctx = scenario.ctx();
        let player = game_state::create_player(ctx);
        let (player, run) = game_state::start_run(player, ctx);
        assert!(game_state::floor(&run) == 1, 0);
        assert!(game_state::position_on_board(&run) == 0, 1);
        assert!(game_state::roll_count(&run) == 0, 2);
        assert!(game_state::current_hp(&run) == game_state::max_hp(&run), 3);
        assert!(game_state::potion_count(&run) == game_state::base_potion_carry_const(), 4);
        transfer::public_transfer(player, SENDER);
        transfer::public_transfer(run, SENDER);
    };
    scenario.end();
}

// ---------------------------------------------------------------------------
// test_use_potion: start run, use potion, check hp and potion count
// ---------------------------------------------------------------------------

#[test]
fun test_use_potion() {
    let mut scenario = test_scenario::begin(SENDER);
    scenario.next_tx(SENDER);
    {
        let ctx = scenario.ctx();
        let player = game_state::create_player(ctx);
        let (player, run) = game_state::start_run(player, ctx);
        transfer::public_transfer(player, SENDER);
        transfer::public_transfer(run, SENDER);
    };
    scenario.next_tx(SENDER);
    {
        let run = scenario.take_from_sender<game_state::Run>();
        let ctx = scenario.ctx();
        let run = run_logic::use_potion(run, ctx);
        assert!(game_state::potion_count(&run) == game_state::base_potion_carry_const() - 1, 0);
        assert!(game_state::current_hp(&run) == game_state::max_hp(&run), 1);
        transfer::public_transfer(run, SENDER);
    };
    scenario.end();
}

// ---------------------------------------------------------------------------
// test_shop_buy: start run, shop_buy SHOP_HEAL_UP, check potion_heal_amount
// ---------------------------------------------------------------------------

#[test]
fun test_shop_buy() {
    let mut scenario = test_scenario::begin(SENDER);
    scenario.next_tx(SENDER);
    {
        let ctx = scenario.ctx();
        let player = game_state::create_player(ctx);
        let (player, run) = game_state::start_run(player, ctx);
        transfer::public_transfer(player, SENDER);
        transfer::public_transfer(run, SENDER);
    };
    scenario.next_tx(SENDER);
    {
        let run = scenario.take_from_sender<game_state::Run>();
        let ctx = scenario.ctx();
        let run = run_logic::shop_buy(run, 0, ctx); // SHOP_HEAL_UP = 0
        assert!(game_state::potion_heal_amount(&run) == game_state::base_potion_heal_const() + 10, 0);
        transfer::public_transfer(run, SENDER);
    };
    scenario.end();
}

// ---------------------------------------------------------------------------
// test_roll_2d6: need Random; create_for_testing then roll_2d6 in range 2-12
// ---------------------------------------------------------------------------

#[test]
fun test_roll_2d6() {
    use sui::random;
    let mut scenario = test_scenario::begin(SENDER);
    scenario.next_tx(SENDER);
    {
        random::create_for_testing(scenario.ctx());
    };
    scenario.next_tx(SENDER);
    {
        let random = scenario.take_shared<random::Random>();
        let ctx = scenario.ctx();
        let sum = run_logic::roll_2d6(&random, ctx);
        assert!(sum >= 2 && sum <= 12, 0);
        test_scenario::return_shared(random);
    };
    scenario.end();
}

// ---------------------------------------------------------------------------
// test_roll_and_move: start run, roll_and_move once, check position/roll_count updated
// ---------------------------------------------------------------------------

#[test]
fun test_roll_and_move() {
    use sui::random;
    let mut scenario = test_scenario::begin(SENDER);
    scenario.next_tx(SENDER);
    {
        let ctx = scenario.ctx();
        let player = game_state::create_player(ctx);
        let (player, run) = game_state::start_run(player, ctx);
        random::create_for_testing(ctx);
        transfer::public_transfer(player, SENDER);
        transfer::public_transfer(run, SENDER);
    };
    scenario.next_tx(SENDER);
    {
        let run = scenario.take_from_sender<game_state::Run>();
        let random = scenario.take_shared<random::Random>();
        let ctx = scenario.ctx();
        let run = run_logic::roll_and_move(run, &random, ctx);
        assert!(game_state::roll_count(&run) == 1, 0);
        assert!(game_state::position_on_board(&run) < game_state::board_tile_count_const(), 1);
        transfer::public_transfer(run, SENDER);
        test_scenario::return_shared(random);
    };
    scenario.end();
}

// ---------------------------------------------------------------------------
// test_end_run: start run, end run (burn)
// ---------------------------------------------------------------------------

#[test]
fun test_end_run() {
    let mut scenario = test_scenario::begin(SENDER);
    scenario.next_tx(SENDER);
    {
        let ctx = scenario.ctx();
        let player = game_state::create_player(ctx);
        let (player, run) = game_state::start_run(player, ctx);
        transfer::public_transfer(player, SENDER);
        transfer::public_transfer(run, SENDER);
    };
    scenario.next_tx(SENDER);
    {
        let run = scenario.take_from_sender<game_state::Run>();
        game_state::end_run(run);
    };
    scenario.next_tx(SENDER);
    {
        assert!(!scenario.has_most_recent_for_sender<game_state::Run>(), 0);
    };
    scenario.end();
}
