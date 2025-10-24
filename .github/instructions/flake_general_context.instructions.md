---
applyTo: '**'
---
# Project Context: Fleak (Comprehensive)

This document provides the complete context for the Fleak project, broken down into its four key components.

---

## Section 1: Frontend (Next.js Mini‑App)

### 1.1 Core Concept & Role

This is the primary user interface for the entire ecosystem. It is a Next.js application designed to run as a "Mini‑App" inside a Base‑compatible wallet's webview (for example, the Base App).

This frontend handles ~95% of user interactions: goal creation, evidence submission, social features, profiles, and gamification.

### 1.2 Key Responsibilities

- Authentication
  - Integrate with MiniKit's `useAuthenticate` hook to initiate user login and acquire a `cb-auth-token`.
  - Send this token to the backend (Next.js API routes) via `POST /api/auth/login` to establish a user session.

- UI/UX (React components)
  - Render screens for creating, viewing and managing all Flake types (Automatic, AI‑Verified, Social/Group).
  - Manage client state (React Context, Zustand, or similar).
  - Display user profiles, friend lists and gamification elements (streaks, badges).

- Evidence upload (CRITICAL)
  - For AI‑Verified and Social‑Verified Flakes the Mini‑App captures evidence (image/video).
  - Use browser/webview APIs to access camera or gallery and `POST` the file to the backend endpoint (e.g. `POST /api/evidence/upload`).

- Native app triggering (Automatic Flakes only)
  - Render a button that opens the Native React Native app via an Android App Link such as:

    `fleak://set-alarm?flakeId=123&token=...`

### 1.3 Communication

The frontend communicates exclusively with the Next.js backend API routes. It does not talk directly to the smart contract, database, or third‑party services — the backend handles those responsibilities.

Common API surfaces: `/api/auth/*`, `/api/flakes/*`, `/api/evidence/*`, `/api/users/*`.

---

## Section 2: Backend (Next.js API Routes)

### 2.1 Core Concept & Role

The backend is implemented as Next.js API routes within the same project as the frontend. It is the single source of truth for off‑chain data and acts as the trusted Oracle for on‑chain resolution.

### 2.2 Key Responsibilities

- Authentication
  - Provide `POST /api/auth/login` to receive the `cb-auth-token` from the Mini‑App.
  - Use the Base Mini‑App SDK `authentication.verify()` to validate tokens and create sessions (JWT or encrypted cookies).

- Database (MongoDB)
  - Connect via Mongoose, Prisma, or similar.
  - Persist users, flakes, evidence CIDs, streaks, attestors, and verdict metadata.

- Evidence & AI processing
  - Accept evidence uploads (`POST /api/evidence/upload`), upload files to IPFS (pinning service) and store the resulting CID.
  - Provide an analysis endpoint (e.g. `GET /api/flakes/analyze/[flakeId]`) that retrieves evidence from IPFS and sends it to the Google Gemini Vision model.

- Oracle / On‑chain interaction (CRITICAL)
  - Manage a hot wallet private key loaded from secure env vars (`ORACLE_PRIVATE_KEY`).
  - Provide `POST /api/flakes/resolve` (or similar) that consolidates verdicts and calls the smart contract `resolveFlake(flakeId, winnerAddress)` using ethers.js or viem.

### 2.3 Communication

Receives from:
- Next.js Mini‑App (auth, evidence uploads, CRUD operations)
- Native React Native App (verification reports for Automatic Flakes)

Sends to:
- MongoDB (persistent storage)
- IPFS / pinning service (evidence storage)
- Google Gemini API (AI analysis)
- Base blockchain (calling the smart contract as Oracle)

---

## Section 3: Native App (React Native)

### 3.1 Core Concept

Native Companion App (Android only). A small, specialized app that verifies Automatic Flakes which require OS‑level integration (currently: alarms).

### 3.2 Architecture & Role

This app is not the main Fleak product. It is a verifier/utility app installed only by users who opt into Automatic Flakes.

### 3.3 Key Responsibilities

- Listen for incoming Android App Links with scheme `fleak://`.
- Parse links such as `fleak://set-alarm?flakeId=...` and fetch flake details from the backend (e.g. `GET /api/flakes/details?id=...`).
- Use native Android APIs to set reliable alarms.
- When the alarm fires and the user dismisses it, POST a verification report to the backend (e.g. `POST /api/flakes/verify-automatic/[flakeId]`).

### 3.4 What this app does NOT do

- It does not perform blockchain operations.
- It does not manage user profiles, streaks or social features.
- It does not handle evidence uploads for AI or Social verification.

---

## Section 4: Smart Contracts (Foundry)

### 4.1 Core Concept

Smart contracts act as the escrow and immutable rulebook for financial incentives. Contracts are intentionally minimal and rely on a single trusted Oracle address (the backend) to resolve Flakes.

### 4.2 Development environment & target

- Framework: Foundry (Solidity + Forge for tests and scripts)
- Target networks: Base Sepolia (testnet) and Base Mainnet

### 4.3 Architecture & role

Contracts are "dumb": they do not verify evidence themselves — they trust the Oracle address that calls `resolveFlake`.

### 4.4 Key data structures & state

Each Flake is represented off‑chain but referenced on‑chain by an ID. Example Solidity structure (illustrative):

```solidity
struct Flake {
    uint256 flakeId;       // off‑chain ID
    uint256 totalStake;    // total escrowed funds
    address winner;        // eventual payout address
    State state;           // enum { ACTIVE, CLOSED }
    mapping(address => uint256) participants;
}

mapping(uint256 => Flake) public flakes;
```

### 4.5 Roles & permissions

- User: can create/join Flakes and stake funds.
- Owner (deployer): can manage contract settings (Ownable pattern).
- Oracle (critical): single address set in storage — only this address may call `resolveFlake`.

### 4.6 Key functions (concept)

- `createFlake(uint256 _flakeId, ...)` — public, payable: initialize Flake and accept stake.
- `joinFlake(uint256 _flakeId)` — public, payable: add stake to an existing Flake.
- `resolveFlake(uint256 _flakeId, address _winnerAddress)` — external: only callable by Oracle; closes the Flake and transfers funds to the winner.

---
