# SuiVenture

Rogue-like dice dungeon crawler on Sui. Connect wallet → Gacha Gear/Pet → Equip → Battle (Start Run → Roll → Events).

## Repo layout

- **move/** – Move 2024 contracts (game_state, nft_collection, gacha_gear, gacha_pet, run_logic, upgrade, marketplace)
- **dapp/** – Next.js dApp (bottom nav: Gacha, Inventory, Battle, Pet)
- **ts-utils/** – Deploy scripts

## Move: build and test

```bash
cd move
sui move build
sui move test
```

## Deploy

1. Set env in `ts-utils/.env` (see `ts-utils/.env.example`): `ADMIN_PRIVATE_KEY`, `NETWORK`, optional `PACKAGE_PATH`.
2. From repo root or ts-utils:

```bash
cd ts-utils && pnpm deploy_testnet   # or deploy_devnet / deploy_mainnet
```

3. After deploy, capture **Package ID** and shared/owned object IDs (GachaGear, GachaPet, NftMintAuthority, Random, TransferPolicy for gear/pet) and set them in `dapp/.env.local` (see dapp README).

## dApp: run locally

```bash
cd dapp
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Default route is `/gacha`. Set `NEXT_PUBLIC_*` env vars (see `dapp/.env.example`) so Gacha and Battle work after deploy.

## Flow

1. **Connect** wallet (header).
2. **Gacha** – Pull Gear (0.01 SUI) or Pull Pet (0.01 SUI).
3. **Inventory** – View owned gear/pets; equip, upgrade (3 same → 1 next rarity), list for sale (Kiosk).
4. **Battle** – Create player (once), Start Run, Roll 2d6, move on board, combat/shop/heal; Use potion; Open shop when floor % 3 === 0.
5. **Pet** – View equipped pet and owned pets; catalog (Ember, Shell, Whisper, Bloom, Spark).

## License / AI

Open source. Built with AI-assisted development.
