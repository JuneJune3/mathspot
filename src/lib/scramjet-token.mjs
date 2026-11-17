import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_LIFETIME_MS = 30 * 60 * 1000;
const stateKey = Symbol.for("mathspot.scramjet.runtime");

function getState() {
  const root = globalThis;
  root[stateKey] ??= { connections: new Map(), revoked: new Map() };
  return root[stateKey];
}

function signature(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createScramjetToken(sessionId, expiresAt, secret) {
  if (!secret || secret.length < 32) {
    throw new Error(
      "Scramjet fallback requires SCRAMJET_SESSION_SECRET with at least 32 characters.",
    );
  }
  const payload = `${sessionId}.${expiresAt}`;
  getState().revoked.delete(sessionId);
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyScramjetToken(token, secret, now = Date.now()) {
  if (!secret || secret.length < 32 || token.length > 512) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [sessionId, expiryText, suppliedSignature] = parts;
  if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId) || !expiryText || !suppliedSignature)
    return null;

  const expiresAt = Number(expiryText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + TOKEN_LIFETIME_MS)
    return null;

  const expected = Buffer.from(signature(`${sessionId}.${expiryText}`, secret));
  const supplied = Buffer.from(suppliedSignature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

  const state = getState();
  for (const [id, revokedUntil] of state.revoked) {
    if (revokedUntil <= now) state.revoked.delete(id);
  }
  if (state.revoked.has(sessionId)) return null;
  return { sessionId, expiresAt };
}

export function trackScramjetConnection(sessionId, socket) {
  const state = getState();
  const connections = state.connections.get(sessionId) ?? new Set();
  state.connections.set(sessionId, connections);
  connections.add(socket);
  socket.once("close", () => {
    connections.delete(socket);
    if (connections.size === 0) state.connections.delete(sessionId);
  });
}

export function activeScramjetConnectionCount() {
  let count = 0;
  for (const connections of getState().connections.values()) count += connections.size;
  return count;
}

export function revokeScramjetSession(sessionId) {
  const state = getState();
  state.revoked.set(sessionId, Date.now() + TOKEN_LIFETIME_MS);
  for (const socket of state.connections.get(sessionId) ?? []) socket.destroy();
  state.connections.delete(sessionId);
}
