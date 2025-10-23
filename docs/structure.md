# Fleak Mobile UI Architecture

This document summarizes how the new mobile-first experience is organised inside the `app/` directory. It groups the main building blocks by concern so future work can extend the flows without breaking the existing contract between layers.

## Views (`app/features/*`)
- `testimonies/` renders the testimonies hub. `TestimoniesView` now orchestrates the overview screen (recent activity plus the pending badge) and the dedicated management screen for pending reviews and invitations, handling accordion expansion and modal flows internally.
- `friends/` covers the social area. `FriendsView` renders request cards and friend cards and opens the overlay sheet implemented in `AddFriendView` when the user taps the floating add button.
- `finance/` contains `FinanceView`, which displays the wallet summary (`FinanceSummaryCard`) together with the recent activity list.
- `account/` provides the profile management screen through `AccountView`, reusing `AccountInfoCard` and the shared confirmation modal.

Each view is a client component responsible only for orchestrating UI state. They never reach the mocks directly; instead they consume the controllers described below.

## Controllers (`app/controllers/*`)
- `testimonyController.ts` returns the grouped dataset (highlight card, pending reviews, invitations, recent activity) and still exposes a helper to find a single testimony when needed.
- `friendController.ts` centralises friend lists, pending requests, and the suggestion feed used in the add-friend flow.
- `financeController.ts` exposes the wallet balance plus the ledger of recent transactions.
- `accountController.ts` aggregates profile metadata and the available account actions.

Controllers are the entry point for the UI. If a real API is plugged in later only the underlying services need to evolve.

## Services (`app/services/*`)
- `testimonyService.ts` reads the testimony mocks.
- `friendService.ts` provides friends, requests, and suggestion feeds.
- `financeService.ts` returns static balance and activity data.
- `accountService.ts` returns the profile information and action list.

Services are the single source of truth for data retrieval. They currently wrap the mock files exported from `app/mocks/*`. Replacing them with `fetch` calls or React Query integrations will not require any change in the view layer.

## Shared UI Components (`app/components/*`)
- `navigation/` holds `TopBar` and `BottomNav`, the shell elements that drive navigation exactly as specified by the screen map.
- `cards/` groups reusable atomic cards (`TestimonyCard`, `FriendCard`, `FinanceSummaryCard`, `AccountInfoCard`, etc.). Every card now behaves as an accordion to reveal supplementary data and quick actions on tap.
- `modals/` contains the contextual overlays (`VoteModal`, `ConfirmModal`, `ContactActionsModal`) used throughout the flows.

The components stick to the monochrome palette requested in the brief and apply subtle shadows to echo a Material You-inspired elevation system.
