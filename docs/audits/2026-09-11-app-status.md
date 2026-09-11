> Historical audit of main at `d72c0e9`, before remediation. See [the cutover guide](../payments-cutover.md) for the replacement implementation and remaining live acceptance requirements. The probe entry point now runs the maintained regression suite.

# PlebFM app audit — September 11, 2026

**Assessment: the public site is available and the code builds, but the app is not ready for dependable paid use.** The configured Lightning backend fails, payment accounting is unsafe, public host APIs expose credentials, and host billing is largely scaffolding. Money Dev Kit work already exists in PR #111; continue that work after closing the security and accounting gaps.

## Scope and evidence

Audited `main` at `d72c0e9c85baa40b21277a0e640439ef2b64e5c1`, matching GitHub's current main and its latest recorded successful production deployment (August 11). Reviewed application routes, models, checkout, auth, queue/playback, dashboard/settings, CI, and the current diff of [PR #111](https://github.com/PlebFM/PlebFM/pull/111) at `6bc9d5c34a7367c00df9085603a1bdb3939ac0ae`.

Live checks were read-only. No payments, subscription purchases, Spotify playback commands, account edits, credential rotation, or deployments were performed. Credential values were neither printed nor saved in audit artifacts. The LNbits check used `.env.local`; production provider environment variables were not inspected. No authenticated Spotify end-to-end session or real MDK payment was validated.

| Area                           | Observed status                                                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public website                 | `https://pleb.fm/` and `/host/login` return 200 with expected page titles. This establishes availability, not complete user-flow correctness.                                       |
| Build and static checks        | `pnpm build`, `pnpm lint`, and `pnpm exec tsc --noEmit --incremental false` all pass.                                                                                               |
| Song payments                  | LNbits remains the only provider on main. Configured wallet endpoint returns 404 text; the actual invoice-status function throws a JSON parsing error.                              |
| Payment integrity              | Offline probes reproduce arbitrary credited amounts, cross-song reuse, and concurrent duplicate credit.                                                                             |
| Host security                  | Production `/api/hosts` returns nonempty Spotify refresh tokens to an unauthenticated caller. Host mutations lack session/ownership checks in source and in an offline route probe. |
| Host billing                   | Stripe checkout creation exists, but webhook processing and subscription storage are incomplete. Bitcoin subscriptions return 501.                                                  |
| Playback/queue                 | Core integration exists. Fresh queue start crashes in a probe; host selection and token handling need correction. Real playback remains unverified.                                 |
| Dashboard/product completeness | Queue data is connected; earnings, billing history, and several actions are placeholders or incomplete.                                                                             |
| Money Dev Kit                  | Open, unmerged PR #111 contains substantial implementation. Vercel preview reports success, but merge status is blocked and paid end-to-end validation is still outstanding.        |

## Findings in priority order

### 1. Urgent: live Spotify credential exposure and unprotected host writes

[Host listing](../../pages/api/hosts.ts) returns full database documents at lines 7–9. The public [single-host route](../../pages/api/hosts/[shortName].ts) does the same. The Host schema includes `spotifyRefreshToken` without exclusion from serialization. **A read-only production request confirmed nonempty token values are present.** Only a boolean result was retained.

The host PATCH handler (lines 12–18) takes `spotifyId` from the caller and writes the requested details without checking a session or ownership. The single-host POST handler is also unauthenticated. Global middleware protects `/host/*` pages, not `/api/*`. An offline anonymous PATCH reached the mocked database write.

Fix public responses with an explicit safe field allowlist, derive write ownership from the server session, validate changes, and restrict account creation to authenticated onboarding. After closing the exposure, revoke/re-authorize affected Spotify grants as appropriate. Exposure is confirmed; credential misuse was not investigated or established.

### 2. Release blocker: a payment is not bound to the bid it purchases

[Invoice settlement](../../pages/api/invoice.ts), lines 21–38, checks only whether a supplied hash is paid, then accepts `hostId`, `songId`, `bidAmount`, and `userId` from the query string. It never compares the credited amount with the actual payment or a stored purchase intent. The probe supplied a paid one-sat invoice and observed **5,000,000 sats** passed to `submitBid`.

[Bid submission](../../lib/submit.ts), lines 67–92, checks duplicate hashes only inside one currently queued play. The same hash can fund a different song or a new play after the earlier one changes status. Concurrent requests can both pass the check. Probes reproduced two songs from one payment and two credited plays from concurrent retries.

Use a persisted payment/order record with immutable host, song, user/session reference, currency, and amount. Verify settlement against it, then apply the bid and mark fulfillment atomically. A unique provider payment identity and transactional or equivalent durable fulfillment mechanism must prevent both duplicate credit and lost credit. An HMAC reference alone cannot enforce single use.

### 3. Payment availability: the configured LNbits service is not serving the expected API

The read-only `/api/v1/wallet` request against the locally configured provider returned HTTP 404, `text/plain`. Calling the actual [checkLnbitsInvoice](../../lib/lnbits.ts) function with a synthetic hash also failed with `SyntaxError` because the response was not JSON. This confirms the local configuration's failure, not the precise cause of the remote service's disappearance or production's current env values.

The LNbits adapter does not check HTTP status before parsing JSON. [usePayment](../../components/hooks/usePayment.ts) does not handle failed minting, non-JSON responses, expiration, or recovery reliably. Its polling effect also depends on callback identity and changes polling state during cleanup.

Payment fulfillment exists only in the browser-driven GET polling path. If a payer closes the tab after paying, there is no stored pending payment or background settlement path to ensure their song is credited. This needs durable fulfillment during migration.

### 4. Shared middleware selects the wrong host and couples payments to Spotify

[withJukebox](../../middleware/withJukebox.ts), lines 23–25, queries `Hosts.findOne({ filter: { shortName } })`. `filter` is not a schema field. Using the installed Mongoose 6.13.11 model, the probe confirmed this is cast to **`{}`**, so the lookup is no longer scoped to the requested venue.

Every wrapped payment request also attempts a Spotify token call first. [getAccessToken](../../lib/spotify.ts) uses `client_credentials` while accepting a refresh token; that creates an app credential rather than refreshing a user grant. App credentials can be suitable for catalog operations but not user playback. Errors returned as JSON objects are treated as truthy by the middleware, allowing an undefined access token onward.

Correct host selection, separate catalog and user-token responsibilities, and make payment receipt/fulfillment independent of Spotify availability. Fetch and validate song metadata before starting the payable order.

### 5. Host subscriptions are unfinished, not merely using the wrong processor

[Stripe webhook](../../pages/api/billing/webhook.ts), line 21, calls `Buffer.from(req.body)` with body parsing disabled. A real request stream has no parsed body; the offline probe reproduced a TypeError before signature verification. The subsequent subscription update, cancellation, and failure handlers are all TODOs.

[Current subscription API](../../pages/api/subscriptions/current.ts) returns a fabricated active Pro subscription. [Billing settings](../../components/Settings/BillingSettings.tsx) uses fixed plan/history/date values, calls an undefined `enterprise` plan when upgrading, and starts a new checkout when the user clicks payment-method “Update.” The [checkout route](../../pages/api/billing/create-checkout.ts) returns 501 for Bitcoin. There is no persisted subscription model or working entitlement lifecycle.

The [dashboard loader](../../components/Dashboard/HostDashboardLayout.tsx), lines 120–122, calls the authenticated subscription API without forwarding a session cookie, so its server-side request cannot obtain the logged-in user's subscription.

Replacing Stripe must include real subscription state, entitlements, renewal/cancellation behavior, and truthful billing UI. Existing Stripe subscribers, if any, must be inventoried separately before migration; no Stripe account data was queried in this audit.

### 6. Queue and product completion gaps

- [Fresh queue start](../../pages/api/leaderboard/queue.ts), line 234, dereferences `playingSong.songId` when there is no playing song, despite preparing a fallback track. The probe returned 500. The recent-play lookup also uses `spotifyLastPlayed.id` rather than the nested track ID returned in a history item; review this during playback validation.
- Queue mutation routes do not verify the session owns the requested host. They accept a caller-supplied Spotify token, which does not establish ownership of the selected jukebox.
- [Dashboard](../../pages/host/dashboard.tsx) displays fixed zero earnings and a fixed `+15%` trend. Skip calls `/api/skip`, which has no route in the repository.
- [Analytics](../../pages/host/analytics.tsx) is “Coming soon.” Delete jukebox and invoice download only log messages. Custom-domain/branding and host revenue promises in the plans lack matching complete implementations in the audited code.
- Host signin/signup and profile creation are implemented, but successful OAuth and full onboarding were not exercised. `useHostLogin` can mark verification complete before a session arrives; include delayed-session hydration in future coverage.

### 7. Dependency and CI status need attention

`pnpm audit --prod --json` reports **9 vulnerability instances: 2 critical, 5 high, 2 moderate**, spanning 7 advisory records. These are scanner findings, not proof all attack paths are reachable. Current affected dependencies include Next 15.5.23, direct/transitive Sharp, Nano ID, and qs.

The Next advisories identify [an AVIF image optimization issue](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) and [a Windows-only server issue](https://github.com/advisories/GHSA-p293-qw3h-jr36), with 15.5.24 listed as the patched 15.x floor. Do not characterize the Windows issue as demonstrated against the Vercel deployment. Sharp's advisory lists 0.35.4 as its patched floor; check both direct and transitive copies when updating. Re-evaluate exposure and patches during remediation rather than assuming old overrides remain safe.

The [build workflow](../../.github/workflows/build.yaml) has its entire `on` trigger commented out. Main has no automated application test script. PR #111 adds a test command but retains the missing trigger. Its latest [Actions run](https://github.com/PlebFM/PlebFM/actions/runs/31734167631) failed with zero jobs/check runs; it is not evidence of failing application tests. Its Vercel preview check succeeded. GitHub reports the PR mergeable but blocked; the specific policy block was not established.

## Money Dev Kit: existing work and recommended path

[PR #111](https://github.com/PlebFM/PlebFM/pull/111) adds a provider adapter using `@moneydevkit/core`/`@moneydevkit/nextjs` 0.22.0, an App Router `/api/mdk` endpoint alongside the existing Pages Router, signed invoice references, provider-aware status lookup, bounded polling/recovery, and native dependency tracing. It preserves PlebFM's QR/album-art checkout instead of requiring a whole UI rewrite. The default remains LNbits unless `PAYMENT_PROVIDER=mdk` is configured.

The PR description reports 67 passing tests and explicitly says no real MDK invoice was minted or paid. Those test results were not independently rerun during this main-branch audit. Source inspection confirms that it still reads bid intent from query parameters and leaves `submitBid` unchanged; its own description acknowledges the remaining accounting flaws. It also does not replace Stripe host subscriptions. **Do not merge it as a complete payment repair.**

Current official documentation supports SAT-denominated checkout and serverless infrastructure setup. Existing Pages Router screens can remain while payment-specific App Router endpoints are added; the PR already takes that approach. [MDK Next.js integration](https://docs.moneydevkit.com/nextjs).

MDK now documents signed `checkout.completed` and subscription lifecycle webhooks. Use a verified business-event endpoint plus durable, idempotent fulfillment/reconciliation so payment credit survives closing the browser. This endpoint is distinct from the SDK's `/api/mdk` node infrastructure. [MDK webhooks](https://docs.moneydevkit.com/webhooks).

MDK subscriptions use customer-initiated Lightning renewals with email reminders rather than automatic stored-card charges. That is a product behavior change to communicate if host billing also moves. [MDK subscriptions](https://docs.moneydevkit.com/subscriptions).

Recommended sequence:

1. **Contain the live host-token exposure and unauthorized writes.** Update the affected dependencies and restore functioning CI alongside this work.
2. **Complete the payment ledger and fulfillment safety.** Immutable purchase intent, verified amount/currency, global payment uniqueness, atomic bid application, and durable recovery. Correct the venue lookup and remove Spotify from payment settlement prerequisites.
3. **Finish PR #111's MDK integration against that contract.** Configure the app credentials and backed-up mnemonic, reachable node endpoint, signed business webhooks, and deployment tracing. Revalidate the pinned SDK/API contract on the deployment platform.
4. **Validate the paid jukebox flow.** Real small payment → exactly one bid → queue notification/playback; also test tab close, refresh, expiry, provider outage, repeated callbacks, concurrent payers, and cutover with outstanding invoices. Do not create replacement payable invoices while settlement is merely unknown.
5. **Finish or explicitly defer host subscriptions.** Replace fabricated subscription/history/earnings UI, implement entitlements, choose and communicate the renewal model, and reconcile any existing Stripe subscriptions.
6. **Complete the advertised host features.** Skip, deletion, analytics, earnings/payout accounting, and remaining settings. Re-test Spotify OAuth and playback with a venue account.

## Reproduction and handoff

Run the offline probes from the repository root:

```sh
node docs/audits/payment-probes.cjs
```

On the audited revision: **0/9 required behaviors passed; nine defects reproduced; expected exit code 1.** These are targeted audit probes executing actual application modules with synthetic external dependencies, not a claim about overall test coverage. They deliberately do not load environment files or permit network/database connections. The Mongoose host-query probe uses the real installed schema caster; the Stripe probe uses a Node request stream.

The passing build/lint/typecheck results and failing behavioral probes are compatible: the defects are runtime, authorization, and business-rule failures that those static checks cannot detect.

Only this report and the offline probe script were added. Application code, live services, and PR #111 were not modified.
