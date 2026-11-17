# Mathspot

Imported website: https://web-portal-pass.base44.app

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mathspot.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3295afc9-31fd-445a-acb9-577a19cc66f2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <https://github.com/JuneJune3/mathspot>
cd <mathspot>
npm i
npm run dev
```

## Node deployment

The built-in Scramjet fallback requires a Node.js host with WebSocket support. Build and run it
with:

```sh
npm run build
npm start
```

Set `SCRAMJET_SESSION_SECRET` to a private value of at least 32 characters, along with the required
Supabase server environment variables. MathSpot uses Scramjet automatically when no browser API
provider has a key or all provider slots are full. The fallback is limited to 20 concurrent proxy
sessions, disables UDP, and blocks private and loopback IP addresses.

The Lovable Cloudflare Worker deployment does not provide the Node WebSocket server required for
Scramjet; deploy the Node build to a WebSocket-capable host to use this fallback. The Scramjet
transport dependencies include AGPL-3.0 packages; review their license terms before distributing
or hosting this integration.

git commit --allow-empty -m "trigger sync"
git push origin main
