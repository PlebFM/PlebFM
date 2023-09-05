![Builds](https://github.com/PlebFM/PlebFM/actions/workflows/build.yaml/badge.svg) [![Netlify Status](https://api.netlify.com/api/v1/badges/c8e78b64-9e0b-482a-96ee-2155db9c4bef/deploy-status)](https://app.netlify.com/sites/pleb-fm/deploys)

# Pleb.FM

Only the plebbest beats. 🎵 

It's an ongoing auction for the next song to be played.

Featuring... Connection to Spotify, anon-friendly user profiles, song boosting, and a sick UI.

Host View
<img width="1000" alt="host queue" src="https://github.com/PlebFM/PlebFM/assets/43247027/018212ad-8e93-4e02-bfb9-0872095f35bd">

---
User Song Selection

<img width="393" alt="select song" src="https://github.com/PlebFM/PlebFM/assets/43247027/b03c2f3b-1a6d-42c8-bb85-5ec13bc9f8ab">
<img width="389" alt="select bid" src="https://github.com/PlebFM/PlebFM/assets/43247027/4bebc96d-7dc7-4031-91e0-fb45a6a3b3e5">

## Getting Started

Clone and install dependencies
```bash
git clone git@github.com:PlebFM/PlebFM.git
cd PlebFM
npm i
```

Copy `.env.sample` to `.env.local` and fill in real values

```bash
cp .env.sample .env.local
```

Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [https://localhost:3000](https://localhost:3000) with your browser to see the result.
