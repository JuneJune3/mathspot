import type { Socket } from "node:net";

export function createScramjetToken(sessionId: string, expiresAt: number, secret: string | undefined): string;
export function verifyScramjetToken(
  token: string,
  secret: string | undefined,
  now?: number,
): { sessionId: string; expiresAt: number } | null;
export function trackScramjetConnection(sessionId: string, socket: Socket): void;
export function activeScramjetConnectionCount(): number;
export function revokeScramjetSession(sessionId: string): void;
