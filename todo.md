# API Migration Todo

## Migration Pattern

- Change from NextApiRequest/Response to NextRequest/NextResponse
- Use route.ts naming convention (not [filename].ts)
- Replace getServerSession with auth() from @/utils/auth
- Update import paths to use @ alias
- Export named functions (GET, POST) instead of default handlers
- Remove middleware wrappers or adapt them

## Migrated APIs (app/api)

- ✅ Spotify APIs (search, playback, getSong)
- ✅ Billing history
- ✅ Hosts API (hosts/route.ts and hosts/[shortName]/route.ts)

## Remaining APIs to Migrate (pages/api)

- Auth ([...nextauth].ts)
- User (user.ts)
- Invoice (invoice.ts)
- Leaderboard/queue (leaderboard/queue.ts)
- Billing (create-checkout.ts, webhook.ts)
- Subscriptions (current.ts)
