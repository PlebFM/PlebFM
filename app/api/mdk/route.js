/**
 * Money Dev Kit's unified endpoint.
 *
 * This is infrastructure, not application code — mdk.com calls it to spin up the
 * serverless Lightning node so it can claim incoming payments. There are no
 * events to parse and no handlers to write.
 *
 * It is an App Router route handler living alongside PlebFM's Pages Router.
 * Next.js supports both routers in one project, and `app/` here contains only
 * this file.
 *
 * Deliberately .js, not .ts: this package subpath is published via an `exports`
 * map, which the legacy `"moduleResolution": "node"` in tsconfig.json cannot
 * resolve. Resolving it would mean moving to "bundler" (TypeScript >= 5, which
 * this repo does not yet use). Money Dev Kit's own docs show this file as
 * `route.js`, so nothing is lost. See the PR description for the follow-up.
 */
export { POST, GET } from '@moneydevkit/nextjs/server/route';
