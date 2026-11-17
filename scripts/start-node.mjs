import { createServer } from "node:http";
import { middleware } from "../.output/server/index.mjs";
import { servePublicAsset, serveScramjetAsset } from "./scramjet-assets.mjs";
import { attachScramjetWebSocket } from "./scramjet-server.mjs";

const secret = process.env.SCRAMJET_SESSION_SECRET;
const server = createServer((req, res) => {
  void serveScramjetAsset(req, res)
    .then((handled) => {
      if (handled) return;
      return servePublicAsset(req, res).then((served) => {
        if (!served) middleware(req, res);
      });
    })
    .catch((error) => {
      console.error("Could not serve a Scramjet asset:", error);
      if (!res.headersSent) res.writeHead(500).end();
      else res.destroy(error);
    });
});

attachScramjetWebSocket(server, secret);

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";
server.listen(port, host, () => {
  console.log(`MathSpot listening on http://${host}:${port}`);
});
