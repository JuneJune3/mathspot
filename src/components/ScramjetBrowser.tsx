import { useEffect, useRef, useState } from "react";
import type { BareMuxConnection } from "@mercuryworkshop/bare-mux";
import type { ScramjetFrame } from "@mercuryworkshop/scramjet";

declare global {
  interface Window {
    BareMux?: { BareMuxConnection: new (worker: string) => BareMuxConnection };
  }
}

const scriptLoads = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const existing = scriptLoads.get(src);
  if (existing) return existing;

  const load = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoads.delete(src);
      reject(new Error(`Could not load Scramjet asset: ${src}`));
    };
    document.head.appendChild(script);
  });
  scriptLoads.set(src, load);
  return load;
}

type Props = {
  url: string;
  sessionId: string;
  token: string;
  onLoad?: () => void;
  onError?: (message: string) => void;
};

export function ScramjetBrowser({ url, sessionId, token, onLoad, onError }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);
  const [error, setError] = useState("");
  onLoadRef.current = onLoad;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    let frame: ScramjetFrame | undefined;

    const start = async () => {
      try {
        await Promise.all([loadScript("/scram/scramjet.all.js"), loadScript("/baremux/index.js")]);
        await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        if (cancelled) return;

        const loader = window.$scramjetLoadController;
        const BareMuxConnection = window.BareMux?.BareMuxConnection;
        if (!loader || !BareMuxConnection) throw new Error("Scramjet could not initialize.");

        const { ScramjetController } = loader();
        const controller = new ScramjetController({
          files: {
            wasm: "/scram/scramjet.wasm.wasm",
            all: "/scram/scramjet.all.js",
            sync: "/scram/scramjet.sync.js",
          },
        });
        await controller.init();
        if (cancelled) return;

        const connection = new BareMuxConnection(
          `/baremux/worker.js?session=${encodeURIComponent(sessionId)}`,
        );
        const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
        await connection.setTransport("/libcurl/index.mjs", [
          { websocket: `${wsProtocol}//${location.host}/wisp/?token=${encodeURIComponent(token)}` },
        ]);
        if (cancelled) return;

        frame = controller.createFrame();
        frame.frame.title = "Scramjet browser";
        frame.frame.className = "absolute inset-0 h-full w-full border-0";
        frame.frame.allow =
          "clipboard-read; clipboard-write; autoplay; fullscreen; gamepad; encrypted-media";
        frame.frame.onload = () => onLoadRef.current?.();
        container.current?.appendChild(frame.frame);
        frame.go(url);
      } catch (cause) {
        if (cancelled) return;
        const message = cause instanceof Error ? cause.message : "Scramjet could not start.";
        setError(message);
        onErrorRef.current?.(message);
      }
    };

    void start();
    return () => {
      cancelled = true;
      frame?.frame.remove();
    };
  }, [url, sessionId, token]);

  return (
    <div ref={container} className="absolute inset-0">
      {error && (
        <p
          role="alert"
          className="absolute inset-0 grid place-items-center bg-site-import-background p-4 text-center text-sm text-site-import-foreground"
        >
          {error}
        </p>
      )}
    </div>
  );
}
