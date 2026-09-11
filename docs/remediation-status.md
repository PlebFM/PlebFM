# Remediation status — 2026-09-11

Application changes are implemented on `alex/app-remediation`, including the earlier MDK PR #111. Production cutover is pending the external setup and live acceptance below.

| Audit area                          | Implementation                                                                                                                                      | Verification                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Credential exposure and host writes | Public host allowlist, hidden refresh token field, authenticated ownership checks, validated partial updates, old session cutoff                    | Route tests and production HTTP smoke checks                                                  |
| Payment integrity                   | Immutable stored orders, exact amount/currency/hash checks, unique provider identity, atomic order/bid/balance writes, stable retry keys            | Real Mongo replica-set concurrency, replay, underpayment and rollback tests                   |
| MDK availability and recovery       | Default MDK provider, persisted checkout reference before mint, signed business webhooks, bounded background reconciliation, protected SDK dispatch | Mocked SDK contract/recovery tests; actual server module loading through HTTP smoke           |
| Spotify and queue                   | Correct venue lookup, separate catalog/playback credentials, owner-only queue mutations, empty queue handling, skip, refresh/disconnect handling    | Lookup/queue tests; real Spotify OAuth/playback still required                                |
| Subscriptions                       | Paid-period entitlements, MDK monthly checkout/renewal/cancellation, legacy signed Stripe webhook/import, real receipts                             | Price/activation/overlap tests, raw webhook verification, billing browser/HTTP checks         |
| Host features                       | Ledger earnings, analytics, withdrawal reservations/retry/refunds, branding, domain ownership/DNS validation, guarded deletion                      | Transaction and domain tests; browser settings persistence and analytics/billing verification |
| Dependencies and CI                 | Patched Next/Sharp/transitive packages; restored PR/main workflow; Ubuntu build and production HTTP smoke workflow                                  | Local lint/typecheck/build pass; production audit reports no known vulnerabilities            |

Local verification: **92 tests in 13 files passed**. **18 production HTTP smoke checks passed** against an isolated fixture. Browser checks confirmed the home/guest pages, dashboard earnings, analytics, setting persistence, appearance saving and billing history. Browser testing found and fixed both the client database-import crash and the Pages Router SDK import failure. These checks used synthetic identities/data and did not move money.

Read-only preflight against the locally configured services found **17 hosts**, the obsolete `spotifyRefreshToken_1` index, no new-ledger unresolved records, and **zero Stripe subscriptions under the configured key**. This is not a claim about any other Stripe account/environment. The linked Vercel team reports Pro.

## Pending before production cutover

- Configure MDK app credentials, backed-up mnemonic, Basic/Pro products, business webhook secret and cron secret; verify both callback endpoints.
- Configure Vercel domain automation credentials and complete a real test-domain setup.
- Apply the reviewed schema/index migration, inventory outstanding legacy invoices, and revoke/re-authorize the exposed Spotify grants. No production migration, grant revocation, merge or deployment was performed during implementation.
- Perform small real bid, closed-browser fulfillment, subscription renewal/cancellation, withdrawal and Spotify playback acceptance tests in an isolated staging environment.
- Separate production credentials from preview environments and confirm wallet reserves cover host liabilities before enabling withdrawals.

The full sequence, migration commands, recovery rules and rollback constraints are in [payments-cutover.md](payments-cutover.md). Missing credentials are a deployment gate, not a waived test.
