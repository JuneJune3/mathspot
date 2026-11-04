import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Reports whether a URL can be shown in an iframe (reachable and no X-Frame-Options / CSP frame-ancestors block). Only returns a boolean. */
export const checkFrame = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ url: z.string().url().max(2000).refine((u) => /^https?:\/\//i.test(u)) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(data.url, { method: "GET", redirect: "follow", signal: ctrl.signal });
      clearTimeout(t);
      res.body?.cancel().catch(() => {});
      if (res.status >= 400) return { frameable: false };
      const xfo = (res.headers.get("x-frame-options") ?? "").toLowerCase();
      if (xfo.includes("deny") || xfo.includes("sameorigin")) return { frameable: false };
      const csp = (res.headers.get("content-security-policy") ?? "").toLowerCase();
      const fa = csp.split(";").map((s) => s.trim()).find((s) => s.startsWith("frame-ancestors"));
      if (fa && !/\s\*(\s|$)/.test(fa)) return { frameable: false };
      return { frameable: true };
    } catch {
      return { frameable: false };
    }
  });
