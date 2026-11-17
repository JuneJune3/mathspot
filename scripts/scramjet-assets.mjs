import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";

const mounts = [
  ["/scram/", scramjetPath],
  ["/baremux/", baremuxPath],
  ["/libcurl/", libcurlPath],
];
const publicRoot = fileURLToPath(new URL("../.output/public/", import.meta.url));

const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".wasm": "application/wasm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function serveFile(req, res, rootPath, relativePath, cacheControl) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return true;
  }

  const root = resolve(rootPath);
  const filename = resolve(root, relativePath);
  if (filename !== root && !filename.startsWith(`${root}${sep}`)) {
    res.writeHead(404).end();
    return true;
  }

  try {
    if (!(await stat(filename)).isFile()) {
      res.writeHead(404).end();
      return true;
    }
  } catch {
    return false;
  }

  res.writeHead(200, {
    "Content-Type": mimeTypes[extname(filename)] ?? "application/octet-stream",
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "HEAD") res.end();
  else {
    const stream = createReadStream(filename);
    stream.on("error", (error) => {
      if (!res.headersSent) res.writeHead(500).end();
      else res.destroy(error);
    });
    stream.pipe(res);
  }
  return true;
}

function requestPath(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400).end();
    return null;
  }
  return pathname;
}

export async function serveScramjetAsset(req, res) {
  const pathname = requestPath(req, res);
  if (!pathname) return true;

  const mount = mounts.find(([prefix]) => pathname.startsWith(prefix));
  if (!mount) return false;
  const [prefix, rootPath] = mount;
  return serveFile(req, res, rootPath, pathname.slice(prefix.length), "public, max-age=3600");
}

export async function servePublicAsset(req, res) {
  const pathname = requestPath(req, res);
  if (!pathname) return true;
  if (pathname === "/") return false;

  const cacheControl = pathname === "/sw.js" ? "no-cache" : "public, max-age=3600";
  return serveFile(req, res, publicRoot, pathname.slice(1), cacheControl);
}

export function createScramjetAssetMiddleware() {
  return (req, res, next) => {
    void serveScramjetAsset(req, res)
      .then((handled) => {
        if (!handled) next();
      })
      .catch(next);
  };
}
