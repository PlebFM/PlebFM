<!-- ![Builds](https://github.com/PlebFM/PlebFM/actions/workflows/build.yaml/badge.svg)  -->

[![Netlify Status](https://api.netlify.com/api/v1/badges/c8e78b64-9e0b-482a-96ee-2155db9c4bef/deploy-status)](https://app.netlify.com/sites/pleb-fm/deploys)

# Pleb.FM

Only the plebbest beats. 🎵

It's an ongoing auction for the next song to be played.

Featuring... Connection to Spotify, anon-friendly user profiles, song boosting, and a sick UI.

Host View
<img width="1679" alt="image" src="https://github.com/PlebFM/PlebFM/assets/43247027/d4c9bccb-e99e-493e-96a5-7e429e90cdd6">

---

User Song Selection

<img width="393" alt="select song" src="https://github.com/PlebFM/PlebFM/assets/43247027/b03c2f3b-1a6d-42c8-bb85-5ec13bc9f8ab">
<img width="389" alt="select bid" src="https://github.com/PlebFM/PlebFM/assets/43247027/4bebc96d-7dc7-4031-91e0-fb45a6a3b3e5">

## Getting Started

Clone and install dependencies

```bash
git clone git@github.com:PlebFM/PlebFM.git
cd PlebFM
corepack enable
pnpm install --frozen-lockfile
```

Copy `.env.sample` to `.env.local` and fill in real values

```bash
cp .env.sample .env.local
```

Run the development server

```bash
pnpm dev
```

Open [https://localhost:3000](https://localhost:3000) with your browser to see the result.

## Verification and release

Use Node.js 22 and pnpm 9.15.2. Run `pnpm check` and `pnpm audit --prod --audit-level moderate`.
Tests start a disposable MongoDB replica set and use synthetic provider responses; they do not load `.env.local` or spend money.

After `pnpm build`, run `pnpm smoke:local` for a disposable local database and synthetic host account. Open `http://localhost:3100`; `http://localhost:3101/signin` signs in the fixture host. This helper is not part of the deployed app. Stop it with Ctrl-C to remove the fixture database.

See [the MDK cutover checklist](docs/payments-cutover.md) before merging or deploying payment changes. New subscriptions use customer-initiated Lightning renewals. Existing Stripe subscriptions remain supported during migration. All payment accounting requires MongoDB transactions and the indexes installed by the preflight schema step.

The live `pleb.fm` site is hosted by Netlify; Vercel is a separate deployment target. `netlify.toml` and `netlify/functions/` configure the production build and scheduled reconciliation. CI packages both hosting paths. See [remediation status](docs/remediation-status.md) for completed setup and remaining account-access requirements.
