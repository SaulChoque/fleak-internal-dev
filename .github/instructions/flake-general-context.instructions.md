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

### 1.4 Functional Flows (End‑to‑End Integration)

All critical user journeys are orchestrated in the Mini‑App and rely on clear handoffs to the backend, native app, and smart contracts.

- **Login & Session Bootstrapping**
  - Invoke `useAuthenticate` to obtain a `cb-auth-token` from the Base Mini‑App runtime.
  - POST the token to `/api/auth/login`; expect a signed session cookie plus the user's profile and wallet addresses.
  - Store session data in client state; refresh gated views only after receiving the backend profile to avoid stale UI.

- **Deposits & Escrow Positioning**
  - Present wallet balances and minimum stake requirements fetched via `/api/account/summary` (controller surfaces in `app/controllers`).
  - Initiate deposits by calling `/api/flakes/deposit-intent`, which returns calldata or a prepared transaction for the Base wallet.
  - Trigger the wallet's signing flow using MiniKit; once confirmed, poll `/api/flakes/deposit-status` until the backend acknowledges the on-chain transfer and updates the escrow total.

- **Create Flakes (Activities)**
  - Use form components from `app/features/*` to collect title, category, stake amount, verification type (automatic, social, AI), deadlines, and invited participants.
  - POST creation payload to `/api/flakes/create`; backend responds with the new flake ID plus any native deep link required for automatic verification.
  - For automatic flakes, immediately surface the deep link CTA (`fleak://set-alarm?...`) to route the user into the native verifier.

- **Head-to-Head Challenges (VS Flow)**
  - Allow users to challenge friends by selecting them from `/api/friends/list` results.
  - When the challenger confirms, send `/api/flakes/challenge` with the target user and flake metadata; backend coordinates invites and escrow splits.
  - Display real-time status via SSE or polling `/api/flakes/[flakeId]/status` so both parties see stake confirmations and deadlines.

- **Attestations & Verdict Support**
  - For social verification, surface pending attestation requests fetched from `/api/attestations/pending`.
  - Each friend submits a verdict via `/api/attestations/submit`, optionally with text notes.
  - For AI-assisted flakes, provide a manual "Request AI Review" action that hits `/api/flakes/analyze/[flakeId]`; show progress and final score once the backend finishes the Gemini evaluation.

- **Evidence Capture & Upload**
  - Use the browser's media picker or MiniKit utilities to capture photo/video.
  - Stream uploads to `/api/evidence/upload` with multipart form data including `flakeId` and metadata; backend returns an IPFS CID.
  - Track upload progress locally; once complete, attach the CID to the flake timeline via `/api/flakes/[flakeId]/evidence` so the backend can include it in verification reports.

- **Resolution & Escrow Release Visibility**
  - Listen for backend websocket/SSE updates (or poll) on `/api/flakes/[flakeId]/resolution` to detect when the Oracle has executed `resolveFlake` on-chain.
  - Reflect payout information (winner address, transaction hash) using data returned by `/api/flakes/[flakeId]/payout` so users see escrow release milestones inside the Mini-App.

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

### 2.4 Integration Workflows

- **Session & Profile Lifecycle**
  - `/api/auth/login` validates the `cb-auth-token`, creates a signed cookie, and hydrates the response with user metadata (wallet, streaks, active flakes).
  - Provide `/api/auth/refresh` for silent renewals; return HTTP 401 to force the Mini-App to reauthenticate via MiniKit.
  - Persist sessions in a shared data store (e.g., Redis) so both API routes and background jobs can validate user actions consistently.

- **Deposit & Escrow Coordination**
  - `/api/flakes/deposit-intent` accepts a `flakeId` (or future intent) plus desired stake; it returns encoded calldata, target contract address, and expiration so the Mini-App can open the wallet flow.
  - `/api/flakes/deposit-status` polls on-chain state via viem/ethers — cache results but invalidate whenever new stakes arrive; respond with escrow totals and outstanding participant requirements.
  - Enforce optimistic locking when multiple participants stake simultaneously; surface precise error codes so the frontend can retry gracefully.

- **Activity (Flake) Creation**
  - `/api/flakes/create` stores flake metadata in MongoDB, precomputes an on-chain identifier, and triggers any required invites or notifications.
  - For automatic flakes include `nativeDeepLink` and an `authSignature` so the native verifier can securely call back.
  - Emit application events (e.g., via a queue) for downstream systems (notifications, analytics) to stay in sync without blocking the request.

- **VS Challenges & Participation**
  - `/api/flakes/challenge` ensures both parties have adequate escrow; if the challenged user has not deposited, provide a `pendingDeposit` payload for the frontend to prompt staking.
  - Maintain status endpoints (`/api/flakes/:id/status`) returning a normalized state machine (e.g., `PENDING_STAKES`, `ACTIVE`, `AWAITING_VERDICT`, `RESOLVED`) to keep all clients aligned.

- **Attestations (Social & AI)**
  - `/api/attestations/pending` filters by user session; include per-request tokens to prevent replay attacks when friends submit verdicts.
  - `/api/attestations/submit` validates stake ownership and attaches evidence CIDs or notes; respond with current vote tallies and quorum requirements.
  - `/api/flakes/analyze/:id` fetches IPFS media, calls Gemini, and writes structured verdict data (score, rationale, thresholds) back to MongoDB.

- **Evidence Pipeline**
  - `/api/evidence/upload` streams multipart uploads to a pinning service; cache progress via signed upload IDs so the frontend can poll.
  - `/api/flakes/:id/evidence` links the resulting CID to a timeline entry, tagging the contributor and timestamp for auditability.
  - Provide `/api/evidence/:cid` (gated) to proxy media back to clients that cannot reach IPFS directly.

- **Resolution, Oracle, and Payouts**
  - Background job aggregates attestations; once winning conditions met, it calls `/api/flakes/resolve` or triggers the same logic internally.
  - Resolve function signs a transaction with the Oracle key and submits to the contract; persist the transaction hash and monitor confirmations.
  - `/api/flakes/:id/payout` exposes on-chain receipt data, including participant distributions and final balances.

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

### 3.5 Integration & Operational Flow

- **Deep-Link Intake**
  - Register intent filters for `fleak://*` and HTTPS fallback to handle universal links from the Mini-App.
  - On open, parse query parameters (`flakeId`, `authSignature`, `expiresAt`) and validate against `/api/flakes/details` before proceeding.

- **Backend Coordination**
  - Fetch `/api/flakes/details?flakeId={id}` to retrieve automatic verification instructions (alarm time, repetition, required sensors).
  - Sync device capabilities back to `/api/devices/register` so the backend knows which verifiers are eligible.

- **Alarm Scheduling & Proof Capture**
  - Use native Android `AlarmManager` (or WorkManager) for reliable triggers; store local references keyed by `flakeId` for later cancellation.
  - When the alarm fires, prompt the user, capture required inputs (button press, optional photo/audio), and record timestamps.

- **Verification Report Submission**
  - POST to `/api/flakes/verify-automatic/{flakeId}` with signed payload containing device identifier, completion timestamp, and any captured proof references.
  - Handle backend retry tokens so submissions are idempotent; surface success/failure to the user and re-open the Mini-App via the provided callback URL.

- **Security Considerations**
  - Store minimal local data; clear sensitive tokens after successful verification.
  - Respect backend-issued expirations so stale deep links cannot be reused.

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

### 4.7 Integration Guidelines

- **Escrow Lifecycle**
  - Contracts must surface participant stakes and refundable amounts via view functions consumed by `/api/flakes/deposit-status`.
  - Emit granular events (`FlakeCreated`, `StakeAdded`, `FlakeResolved`) so the backend can index state changes without over-polling.

- **Oracle Interaction**
  - Restrict `resolveFlake` to a single `oracle` address; backend should rotate this via an admin function if keys change.
  - Include safeguards for double resolution, e.g., revert if the flake is already closed or if the winning address lacks participants.

- **Funds Management**
  - Track fees or protocol cuts explicitly; emit events detailing distributions so the frontend can show transparent payouts.
  - Support partial withdrawals only when game rules allow; backend should expose these constraints to the Mini-App.

- **Testing & Tooling**
  - Provide Foundry scripts for staging deposits and resolutions to mirror `/api` behavior during integration testing.
  - Maintain deterministic test fixtures so backend developers can run local forks and validate oracle calls end-to-end.

- **Cross-Component Contracts Data Model**
  - Mirror off-chain IDs and states; ensure mappings align with MongoDB schemas (`flakeId`, participant addresses) to avoid reconciliation issues.
  - Document ABI changes promptly and bump versioning so frontend/backend regenerate typed clients (e.g., viem/TypeChain) in lockstep.

---
