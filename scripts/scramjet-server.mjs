import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import {
  activeScramjetConnectionCount,
  trackScramjetConnection,
  verifyScramjetToken,
} from "../src/lib/scramjet-token.mjs";

const MAX_ACTIVE_CONNECTIONS = 20;

wisp.options.allow_udp_streams = false;
wisp.options.allow_private_ips = false;
wisp.options.allow_loopback_ips = false;
wisp.options.stream_limit_per_host = 8;
wisp.options.stream_limit_total = 32;
wisp.options.dns_servers = ["1.1.1.3", "1.0.0.3"];

function isSameOrigin(req) {
  if (!req.headers.origin || !req.headers.host) return false;
  try {
    return new URL(req.headers.origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export function attachScramjetWebSocket(server, secret) {
  server.on("upgrade", (req, socket, head) => {
    let pathname;
    let token;
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      pathname = url.pathname;
      token = url.searchParams.get("token");
    } catch {
      socket.destroy();
      return;
    }

    if (pathname !== "/wisp/") return;
    const session = token ? verifyScramjetToken(token, secret) : null;
    if (
      !session ||
      !isSameOrigin(req) ||
      activeScramjetConnectionCount() >= MAX_ACTIVE_CONNECTIONS
    ) {
      socket.destroy();
      return;
    }

    trackScramjetConnection(session.sessionId, socket);
    const expiresIn = Math.max(0, session.expiresAt - Date.now());
    const expiration = setTimeout(() => socket.destroy(), expiresIn);
    expiration.unref();
    socket.once("close", () => clearTimeout(expiration));
    wisp.routeRequest(req, socket, head);
  });
}
