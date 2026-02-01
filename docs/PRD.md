Project Name: SuiVenture – Rogue-Life Dice Dungeon Crawler
Version: 1.0 (MVP for Sui Vibe Hackathon)
Date: February 2026
Author: Le Quoc Uy (with Grok assistance)
Platform: Web3 dApp on Sui Blockchain (fully on-chain smart contracts in Move 2024 + React/Next.js frontend)
Target Audience: Web3 gamers, rogue-like fans, dice/board game enthusiasts, Sui ecosystem builders/players
Hackathon Fit: Sui Tech Stack track (high-performance on Sui, deep Move usage: Object Model for player/run/gear, on-chain randomness, NFT minting/gacha)
1. Overview & Vision
Vibe is a rogue-like board crawler game inspired by dice-rolling progression (like Monopoly/Cờ Tỷ Phú meets Heroll + dungeon crawler). Players roll 2d6 to move around a looping board per floor, land on events (combat, gacha, bad events), fight enemies, collect temporary upgrades, and survive 15 floors while a boss periodically alters the board.
Core vibe: High luck + light strategy, addictive short runs (5-15 minutes), permadeath with meta-progression via persistent NFT gear/pets.

Tagline: Roll the dice, conquer the dungeon, feel the vibe.
Unique Selling Points (USPs):
Fully on-chain: Dice rolls, combat, gacha, progression – no centralized server.
Dice-based movement (2-12) + board events for rogue-life feel.
Persistent NFT gear/pets (passive bonuses + skins) from SUI-paid gacha.
Temporary in-run items (level-scaled) + potion system with shop upgrades.
Sui advantages: Fast tx, cheap gas, verifiable randomness.


2. Goals & Success Metrics (for MVP / Hackathon)

Deliver a fully runnable dApp demo: Connect wallet → gacha → equip → start run → complete a short run (or die) → show on-chain persistence.
Deep Sui/Move usage: Object-centric (Player, Run, NFTs), on-chain randomness, dynamic events.
UX: Smooth wallet integration, satisfying dice roll/move animations, clear combat logs.
Hackathon criteria: Innovation (Web3 rogue-like), completeness, demo performance, growth potential (NFT marketplace later?).

3. High-Level Gameplay Loop
Outside Run (Meta – Persistent):

View/edit character: Base stats, equipped permanent gear (4 slots), pet (1 slot), blue gems balance.
Gacha: Spend SUI to pull random permanent Equipment NFT or Pet NFT (passive bonuses + skin).
Equip permanent gear/pet → apply passive stat bonuses and visual skin to character.

Inside Run (Temporary – Rogue-like):

Start run → create on-chain Run object (init HP from base + passives, base potions).
Per turn: Roll 2d6 (on-chain random) → move token on board → land on event.
Events: Combat (win → drop temp equipment), lucky gacha (temp item/potion), bad event, heal.
After completing a floor (board loop): Auto heal 30% of max HP.
Use potions anytime for manual heal.
Every 3 floors: Shop opens → spend blue gems to buy/upgrade potions or temp stats.
Every 5 rolls: Boss phase → spawn extra enemies randomly on board.
Reach floor 15 + defeat final boss → win run (bonus rewards?).
HP ≤ 0 → lose run (blue gems lost, but permanent gear/pet kept).

4. Core Mechanics & Features (MVP Scope)
4.1 Stats System

4 Core Stats (all additive):
ATK: Base damage per hit.
HP: Current / Max (regen/auto heal affects current).
ACC: Hit chance % (d100 roll ≤ ACC → hit, else miss).
DEF: Flat damage reduction (min 1 dmg).

Sources:
Base stats (fixed or levelable later).
Permanent gear/pet bonuses (passive, always on).
Temporary equip in-run (slot-based, replaceable).
Shop upgrades (temp for run).


4.2 Permanent Progression (Outside Run)

Permanent Equipment NFT (minted via gacha):
Slots: Helmet, Weapon, Shield, Boots.
Stats: Bonus ATK/HP/ACC/DEF.
Rarity: Common / Rare / Epic.
Extra: Skin ID (visual overlay on character).

Permanent Pet NFT (1 slot): Bonus stats (e.g., +10% ATK, +HP regen).
Gacha: Pay fixed SUI (e.g., 0.01 SUI per pull) → random rarity/type (equipment 70%, pet 30%) → mint NFT.

4.3 In-Run Temporary Items & Potion System

Temporary Equipment:
Dropped from combat wins or lucky gacha events.
Level-scaled: Based on current floor (e.g., floor 1-5 → level 1 low stats, floor 11-15 → level 3 high stats).
On drop: Player chooses Equip (swap into slot, update stats) or Discard.
Temporary only (deleted on run end).

Potions (Bình Máu):
Find via events/lucky gacha → +1 to carry count.
Base: Carry max 3, heal +30 HP per use.
Use anytime (before/after roll/combat) → call tx to heal.

Shop (opens every 3 floors):
Spend blue gems (earned from combats/events):
Buy new potion (+1 carry, cost ~5 gems).
Upgrade heal amount (+10 HP per potion, cost ~10 gems, stackable).
Upgrade max carry (+1 slot, cost ~15 gems).
Optional: Temp stat boosts (e.g., +5 ATK for run, cost gems).



4.4 Board & Progression

15 floors.
Each floor: Looping board (~30-40 tiles), procedural/simple events per tile.
Move: Roll 2d6 → advance that many tiles → trigger tile event.
Floor end: Reach "exit" tile or complete loop → auto heal 30% max HP → next floor.
Boss phase: After every 5 total rolls (global) → random spawn 3-5 extra enemies on current board tiles.

4.5 Combat

Auto-resolved, turn-based:
Player attacks first: For each enemy, roll hit (ACC), if hit → dmg = ATK - enemy DEF.
Enemies counter: Each attacks player → dmg = enemy ATK - player DEF.
Multi-enemy: Sequential.

Enemies scale with floor (higher floor → more/higher stats).
Win: All enemies defeated → drop temp equipment + blue gems.
Lose: Player HP ≤ 0 → run ends.

5. Technical Requirements (MVP)

Smart Contracts (Move 2024, Sui SDK latest):
Modules: randomness (sui::random), nft_collection (permanent gear/pet), game_state (Player object, Run object), gacha, run_logic (roll, events, combat, shop, potion, floor heal).
On-chain everything: Dice, combat resolve, drops, upgrades.
NFT: Use Sui object/NFT standard for gear/pet.

Frontend (React/Next.js + Sui dApp Kit):
Wallet connect.
Pages: Home (stats/equip), Gacha, Inventory, Run dashboard (board visual, roll button, combat log, potion use, shop popup).
Animations: Dice roll, token move, heal effect, combat sequence.
Poll/subscribe Run object for updates.

Open Source: Full GitHub repo (contracts + FE + README with deploy/run instructions).
AI Disclosure: If used (e.g., Grok for planning/code ideas), list tools/prompts in submission.

6. Out of Scope for MVP (Future Nice-to-Have)

Multiplayer runs.
NFT marketplace for gear/pet.
More enemy types, events, boss mechanics.
Permanent progression beyond gear/pet (e.g., unlock new base stats).
Mobile/responsive polish.
Sound/music.

7. Risks & Dependencies

Sui testnet stability for demo.
On-chain tx speed/latency (Sui fast → should be OK).
Randomness fairness (use built-in verifiable random).

This PRD defines the MVP scope for building and demoing in the Sui Vibe Hackathon (Jan 27 – Feb 12, 2026). Focus on shipping a fun, on-chain rogue-life experience with strong vibe.