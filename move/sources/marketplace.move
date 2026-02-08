/// Marketplace: TransferPolicy for EquipmentNFT & PetNFT with 5% admin fee rule.
/// List/buy via Sui Kiosk; buyer satisfies rule by paying 5% to policy, then confirm_request.
module sui_venture_project::marketplace;

use sui::coin;
use sui::coin::Coin;
use sui::package::Publisher;
use sui::sui::SUI;
use sui::transfer;
use sui::transfer_policy::{Self as transfer_policy, TransferPolicy, TransferPolicyCap, TransferRequest};
use sui::tx_context::TxContext;

use sui_venture_project::nft_collection::{EquipmentNFT, PetNFT};

// ---------------------------------------------------------------------------
// Admin fee rule: 5% of paid goes to TransferPolicy balance
// ---------------------------------------------------------------------------

/// Witness for the admin fee rule.
public struct AdminFeeRule has drop {}

/// Config: fee in basis points (500 = 5%).
public struct AdminFeeConfig has store, drop {
    fee_bps: u64,
}

public fun get_fee_bps(c: &AdminFeeConfig): u64 {
    c.fee_bps
}

const FEE_BPS_DEFAULT: u64 = 500;

// ---------------------------------------------------------------------------
// Satisfy rule: pay fee (5% of request.paid) to policy, add receipt
// ---------------------------------------------------------------------------

/// Buyer calls this to satisfy the admin fee rule before confirm_request.
/// fee_coin must be >= (request.paid * config.fee_bps / 10000). Excess is returned to sender.
public fun pay_admin_fee_gear(
    request: &mut TransferRequest<EquipmentNFT>,
    policy: &mut TransferPolicy<EquipmentNFT>,
    mut fee_coin: Coin<SUI>,
    ctx: &mut TxContext,
) {
    let paid = sui::transfer_policy::paid(request);
    let config = sui::transfer_policy::get_rule<EquipmentNFT, AdminFeeRule, AdminFeeConfig>(AdminFeeRule {}, policy);
    let fee = (paid * get_fee_bps(config)) / 10000;
    assert!(coin::value(&fee_coin) >= fee, 1);
    let pay = coin::split(&mut fee_coin, fee, ctx);
    sui::transfer_policy::add_to_balance(AdminFeeRule {}, policy, pay);
    sui::transfer_policy::add_receipt(AdminFeeRule {}, request);
    if (coin::value(&fee_coin) > 0) {
        transfer::public_transfer(fee_coin, ctx.sender());
    } else {
        coin::destroy_zero(fee_coin);
    };
}

public fun pay_admin_fee_pet(
    request: &mut TransferRequest<PetNFT>,
    policy: &mut TransferPolicy<PetNFT>,
    mut fee_coin: Coin<SUI>,
    ctx: &mut TxContext,
) {
    let paid = sui::transfer_policy::paid(request);
    let config = sui::transfer_policy::get_rule<PetNFT, AdminFeeRule, AdminFeeConfig>(AdminFeeRule {}, policy);
    let fee = (paid * get_fee_bps(config)) / 10000;
    assert!(coin::value(&fee_coin) >= fee, 1);
    let pay = coin::split(&mut fee_coin, fee, ctx);
    sui::transfer_policy::add_to_balance(AdminFeeRule {}, policy, pay);
    sui::transfer_policy::add_receipt(AdminFeeRule {}, request);
    if (coin::value(&fee_coin) > 0) {
        transfer::public_transfer(fee_coin, ctx.sender());
    } else {
        coin::destroy_zero(fee_coin);
    };
}

// ---------------------------------------------------------------------------
// Init: create TransferPolicies automatically on deploy
// ---------------------------------------------------------------------------

public struct MARKETPLACE has drop {}

/// Runs on package publish. Creates TransferPolicy<EquipmentNFT> and
/// TransferPolicy<PetNFT> with 5% admin fee rule, shares policies, transfers caps to deployer.
fun init(otw: MARKETPLACE,ctx: &mut TxContext) {
    let publisher = sui::package::claim(otw, ctx);

    let (mut policy_gear, cap_gear) = transfer_policy::new<EquipmentNFT>(&publisher, ctx);
    add_admin_rule_gear(&mut policy_gear, &cap_gear, ctx);
    transfer::public_share_object(policy_gear);
    transfer::public_transfer(cap_gear, ctx.sender());

    let (mut policy_pet, cap_pet) = transfer_policy::new<PetNFT>(&publisher, ctx);
    add_admin_rule_pet(&mut policy_pet, &cap_pet, ctx);
    transfer::public_share_object(policy_pet);
    transfer::public_transfer(cap_pet, ctx.sender());

    transfer::public_transfer(publisher, ctx.sender());
}

// ---------------------------------------------------------------------------
// Add admin fee rule to existing TransferPolicies
// ---------------------------------------------------------------------------

/// Add 5% admin fee rule to an existing policy (if not using create_marketplace_policies).
public entry fun add_admin_rule_gear(
    policy: &mut TransferPolicy<EquipmentNFT>,
    cap: &TransferPolicyCap<EquipmentNFT>,
    ctx: &mut TxContext,
) {
    let config = AdminFeeConfig { fee_bps: FEE_BPS_DEFAULT };
    sui::transfer_policy::add_rule<EquipmentNFT, AdminFeeRule, AdminFeeConfig>(
        AdminFeeRule {},
        policy,
        cap,
        config,
    );
}

/// Deployer calls transfer_policy::default<PetNFT>(publisher, ctx) first,
/// then this to add 5% admin fee rule.
public entry fun add_admin_rule_pet(
    policy: &mut TransferPolicy<PetNFT>,
    cap: &TransferPolicyCap<PetNFT>,
    ctx: &mut TxContext,
) {
    let config = AdminFeeConfig { fee_bps: FEE_BPS_DEFAULT };
    sui::transfer_policy::add_rule<PetNFT, AdminFeeRule, AdminFeeConfig>(
        AdminFeeRule {},
        policy,
        cap,
        config,
    );
}
