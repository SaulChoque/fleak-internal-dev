# Fleak Backend API

This document describes the backend implementation that powers the Fleak mini-app. The backend is implemented with Next.js App Router API routes and follows the data flows described in `docs/data_flows.md`.

## Architecture Overview

- **Database:** MongoDB via Mongoose, connection helper in `lib/db.ts`.
- **Auth:** Client submits the Base Mini App `cb-auth-token` to `/api/auth/login`. We verify it with `@farcaster/quick-auth`, issue a signed cookie session (`SESSION_SECRET`), and upsert the user record.
- **Domain Services:** Located under `lib/server/*`, encapsulating account, finance, friend, and flake logic.
- **Evidence & AI:** Evidence uses Pinata (JWT auth). AI reviews leverage Google Gemini (`@google/generative-ai`).
- **Blockchain:** We expose encoded calldata for deposits and resolutions (`lib/server/blockchain.ts`) so the wallet can submit transactions.
- **Sessions:** Stored both as signed cookies (stateless JWT) and persisted in MongoDB (`Session` model) for revocation and TTL control.

## Environment Variables

Add the following keys to `.env`:

- `SESSION_SECRET` – 32+ char secret for signing sessions & deep links.
- `CONTRACT_ADDRESS` – Fleak escrow contract address (Base network).
- `CONTRACT_CHAIN_ID` – Chain ID (defaults to 84532 for Base Sepolia).
- `ORACLE_PRIVATE_KEY` – Optional; required when submitting on-chain resolutions automatically.
- `MONGODB_URI`, `PINATA_*`, `API_KEY_GEMINI` – already provided.

## Data Models

Located under `lib/models/*`:

- `User`: Farcaster FID, wallet metadata, streak, friends.
- `Session`: Session identifier with TTL.
- `Flake`: Core activity record, participants, evidence, attestations, chain metadata.
- `FriendRequest`: Pending friend invites.

## Key Services

- `lib/server/accountService.ts` – aggregates profile metrics.
- `lib/server/financeService.ts` – computes escrow balances & ledger.
- `lib/server/friendService.ts` – friend overview & requests.
- `lib/server/flakeService.ts` – create flakes, deposit intents, evidence, attestations, AI analysis, resolution flows.
- `lib/server/pinata.ts` – evidence uploads.
- `lib/server/gemini.ts` – AI verdict integration.

## API Reference

All authenticated endpoints expect an active session cookie (issued by `/api/auth/login`). Authentication for native automatic verification uses JWT deep links signed with `SESSION_SECRET`.

### Auth

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Verifies `cb-auth-token`, creates session, returns user & account summary. |

### Account & Finance

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/account/summary` | Returns streak count, friends, open/resolved flakes. |
| `GET` | `/api/finance/summary` | Returns escrow totals and recent ledger events. |

### Friends

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/friends/overview` | Friend list + pending requests. |
| `POST` | `/api/friends/request` | Sends a friend request to the supplied FID. |

### Flakes

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/api/flakes/create` | `{ title, description?, stakeAmount, verificationType, deadline, participants[] }` | Creates a new flake, returns record with optional automatic deep link. |
| `GET` | `/api/flakes/deposit-status?flakeId=` | – | Current escrow snapshot and participants still pending. |
| `POST` | `/api/flakes/deposit-intent` | `{ flakeId, amount }` | Returns calldata + contract info for staking. |
| `POST` | `/api/flakes/deposit-confirm` | `{ flakeId, txHash }` | Marks participant stake as confirmed. |
| `GET` | `/api/flakes/[flakeId]/status` | – | Detailed status for participants, verification state, evidence counts. |
| `GET` | `/api/flakes/details?flakeId=` | – | Public metadata used by the native verifier app. |
| `POST` | `/api/flakes/analyze/[flakeId]` | – | Triggers Gemini review (AI flakes only). |
| `GET` | `/api/flakes/analyze/[flakeId]` | – | Retrieves latest AI score & rationale. |
| `POST` | `/api/flakes/[flakeId]/evidence` | `{ cid, mimeType, sizeBytes, title? }` | Links previously uploaded CID to the flake timeline. |
| `GET` | `/api/flakes/[flakeId]/resolution` | – | Returns attestation ledger and participant outcome states. |
| `GET` | `/api/flakes/[flakeId]/payout` | – | Summarises payout breakdown. |
| `POST` | `/api/flakes/resolve` | `{ flakeId, winnerFid, winnerAddress }` | Marks flake as resolved and returns on-chain calldata. |
| `POST` | `/api/flakes/verify-automatic/[flakeId]` | `{ verifierFid, signature, completedAt? }` | Native app callback to confirm automatic verification (validates deep-link signature). |

### Evidence

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/evidence/upload` | Multipart upload to Pinata (`file`, `flakeId`, optional `title`). Returns `{ cid, size }` and links evidence to the flake. |

### Attestations

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/attestations/pending` | Lists flake IDs requiring the current user's verdict. |
| `POST` | `/api/attestations/submit` | Records a verdict and optional notes. |

## Deep Link Security

- Automatic flakes receive a signed deep link: `fleak://set-alarm?flakeId=...&signature=...`.
- The signature is an HS256 JWT (payload `{ flakeId }`, 2-hour expiry). The native verifier must include the same signature in `/api/flakes/verify-automatic/:id`.
- Server validates the signature before marking automatic verification complete.

## Deploy & Operations Notes

- **Install Dependencies:** run `npm install` after pulling this branch to install the new packages (`mongoose`, `zod`, `jose`, `@google/generative-ai`, `uuid`, `@types/mongoose`).
- **Database Migrations:** Models use simple schemas; no migrations are required beyond ensuring the MongoDB collection exists.
- **Sessions:** TTL is 24 hours. Old sessions purge automatically thanks to MongoDB TTL index.
- **Error Handling:** API routes normalise business errors via `AppError`; unexpected failures return HTTP 500 but do not expose internals.

For the full domain logic refer to the service files under `lib/server/`. These modules are designed so future integrations (on-chain automation, webhooks, analytics) can reuse their functions without re-implementing API handlers.
