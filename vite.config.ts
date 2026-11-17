// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Plugin } from "vite";
import { createScramjetAssetMiddleware } from "./scripts/scramjet-assets.mjs";
import { attachScramjetWebSocket } from "./scripts/scramjet-server.mjs";

const scramjetDevPlugin: Plugin = {
  name: "mathspot-scramjet-dev",
  configureServer(server) {
    const env = loadEnv(server.config.mode, server.config.envDir, "");
    const secret = process.env["SCRAMJET_SESSION_SECRET"] ?? env["SCRAMJET_SESSION_SECRET"];
    if (secret) process.env["SCRAMJET_SESSION_SECRET"] = secret;

    server.middlewares.use(createScramjetAssetMiddleware());
    if (server.httpServer) attachScramjetWebSocket(server.httpServer, secret);
  },
};

export default defineConfig({
  nitro: { preset: "node-middleware" },
  vite: { plugins: [scramjetDevPlugin] },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
