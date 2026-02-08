"use client";

import { KioskClient, Network } from "@mysten/kiosk";
import type { SuiClient } from "@mysten/sui/client";
import {
  PACKAGE_ID,
  MODULE_MARKETPLACE,
  adminFeeRuleType,
} from "@/config/contracts";
import { clientConfig } from "@/config/clientConfig";

function networkToKioskNetwork(n: string): Network {
  if (n === "mainnet") return Network.MAINNET;
  if (n === "testnet") return Network.TESTNET;
  return Network.CUSTOM;
}

/** Cache to avoid "resolver already exists" when multiple hooks call createKioskClient */
const kioskClientCache = new WeakMap<SuiClient, KioskClient>();

/**
 * Build a KioskClient with a custom AdminFeeRule resolver.
 * Returns a cached instance per SuiClient to avoid registering the same resolver twice.
 */
export function createKioskClient(client: SuiClient): KioskClient {
  const cached = kioskClientCache.get(client);
  if (cached) return cached;

  const kioskClient = new KioskClient({
    client,
    network: networkToKioskNetwork(clientConfig.SUI_NETWORK),
  });

  const ruleType = adminFeeRuleType(PACKAGE_ID);

  try {
    kioskClient.addRuleResolver({
      rule: ruleType,
      packageId: PACKAGE_ID,
      resolveRuleFunction: ({ transaction, transferRequest, policyId, price, itemType }) => {
      const fee = (BigInt(price) * BigInt(5)) / BigInt(100);
      const feeCoin = transaction.splitCoins(transaction.gas, [fee]);

      const isGear = itemType.includes("EquipmentNFT");
      const fnName = isGear ? "pay_admin_fee_gear" : "pay_admin_fee_pet";

      transaction.moveCall({
        target: `${PACKAGE_ID}::${MODULE_MARKETPLACE}::${fnName}`,
        arguments: [
          transferRequest,
          typeof policyId === "string" ? transaction.object(policyId) : policyId,
          feeCoin,
        ],
      });
    },
  });
  } catch (e) {
    if (!String(e).includes("resolver already exists")) throw e;
  }

  kioskClientCache.set(client, kioskClient);
  return kioskClient;
}
