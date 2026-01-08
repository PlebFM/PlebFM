# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` - Start dev server with HTTPS on port 3000
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format all files with Prettier
- `pnpm storybook` - Run Storybook on port 6007

## Architecture

PlebFM is a Bitcoin-powered jukebox that lets users bid satoshis to queue songs via Spotify. It's a Next.js 15 app using the App Router with MongoDB/Mongoose for persistence.

### Core Flow
1. **Host** signs up via Spotify OAuth, gets a `shortName` URL (e.g., `/austin`)
2. **Users** visit `/{shortName}`, search Spotify, and bid sats on songs
3. **Bids** are paid via Lightning (LNbits), creating `Play` records with running totals
4. **Queue** sorts by `runningTotal` - highest bid plays next
5. **Pusher** provides real-time updates to all clients

### Key Directories
- `app/` - App Router pages and API routes (primary)
- `pages/api/` - Legacy API routes (being migrated)
- `models/` - Mongoose schemas: Host, Play, Bid, User, Subscription
- `lib/` - Service integrations: spotify.ts, lnbits.ts, pusher.ts
- `components/` - React components organized by feature (Checkout, Dashboard, Leaderboard, etc.)
- `utils/` - Utilities including `auth.ts` (NextAuth config with Spotify provider)

### Auth & Middleware
- NextAuth with Spotify provider, configured in `utils/auth.ts`
- Middleware (`middleware.ts`) protects `/host/*` routes, public routes: `/host/login`, `/host/signup`, `/host/plans`
- Host dashboard uses `(private)` folder pattern for authenticated routes

### External Services
- **Spotify**: Song search, playback control, OAuth for hosts
- **LNbits**: Lightning invoice generation and payment verification
- **Pusher**: Real-time queue updates
- **Stripe**: Subscription billing
- **MongoDB**: Data persistence

## Code Style

- **Package Manager**: PNPM required (enforced by preinstall hook)
- **TypeScript**: Strict mode enabled, explicit return types preferred
- **Formatting**: 80 char line limit, 2 space indent, single quotes, trailing commas, semicolons required
- Use arrow functions over the function keyword
- Don't leave comments unless explicitly asked
- **Components**: React functional components with TypeScript interfaces
- **Naming**: PascalCase for components/types, camelCase for variables/functions
- **Imports**: Group by: 1) React/Next, 2) External libs, 3) Internal modules
