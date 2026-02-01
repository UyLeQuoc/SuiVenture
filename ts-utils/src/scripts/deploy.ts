/**
 * Deploy Move contracts to Sui network
 *
 * Usage:
 *   pnpm deploy_localnet  - Deploy to localnet
 *   pnpm deploy_devnet    - Deploy to devnet
 *   pnpm deploy_testnet   - Deploy to testnet
 *   pnpm deploy_mainnet   - Deploy to mainnet
 */

import path from "node:path";
import { Config, deploy } from "@easysui/sdk";

// Set the package path to the move directory
process.env.PACKAGE_PATH = path.resolve(process.cwd(), "../move");

async function main() {
  console.log(`\nDeploying to ${Config.vars.NETWORK}...`);
  console.log(`Package path: ${process.env.PACKAGE_PATH}\n`);

  try {
    const result = await deploy();
    console.log(`\n${result}`);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main();
