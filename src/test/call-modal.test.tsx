import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CallModal } from "@/components/CallModal";

const mediaDevicesDescriptor = Object.getOwnPropertyDescriptor(navigator, "mediaDevices");
const srcObjectDescriptor = Object.getOwnPropertyDescriptor(
  HTMLMediaElement.prototype,
  "srcObject",
);

afterEach(() => {
  if (mediaDevicesDescriptor) {
    Object.defineProperty(navigator, "mediaDevices", mediaDevicesDescriptor);
  } else {
    Reflect.deleteProperty(navigator, "mediaDevices");
  }
  if (srcObjectDescriptor) {
    Object.defineProperty(HTMLMediaElement.prototype, "srcObject", srcObjectDescriptor);
  } else {
    Reflect.deleteProperty(HTMLMediaElement.prototype, "srcObject");
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CallModal", () => {
  it("reports when microphone access is unsupported", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });

    render(<CallModal isOpen onClose={vi.fn()} />);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Microphone access is not supported by this browser.",
    );
  });

  it("stops a microphone stream that resolves after unmount", async () => {
    let resolveStream!: (stream: { getTracks: () => { stop: () => void }[] }) => void;
    const track = { stop: vi.fn() };
    const stream = { getTracks: () => [track] };
    const getUserMedia = vi.fn(
      () =>
        new Promise<{ getTracks: () => { stop: () => void }[] }>((resolve) => {
          resolveStream = resolve;
        }),
    );
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
    vi.stubGlobal("RTCPeerConnection", class {});

    const { unmount } = render(<CallModal isOpen onClose={vi.fn()} />);
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce());
    unmount();

    await act(async () => {
      resolveStream(stream);
    });

    expect(track.stop).toHaveBeenCalledOnce();
  });

  it("stops tracks, closes the peer connection, and clears the timer when closed", async () => {
    Object.defineProperty(HTMLMediaElement.prototype, "srcObject", {
      configurable: true,
      writable: true,
      value: null,
    });

    const track = { stop: vi.fn(), enabled: true };
    const stream = {
      getTracks: () => [track],
      getAudioTracks: () => [track],
    };
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    const addTrack = vi.fn();
    const close = vi.fn();
    class MockPeerConnection {
      ontrack: ((event: RTCTrackEvent) => void) | null = null;
      addTrack = addTrack;
      close = close;
    }
    vi.stubGlobal("RTCPeerConnection", MockPeerConnection);
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { rerender } = render(<CallModal isOpen onClose={vi.fn()} />);
    await waitFor(() => expect(addTrack).toHaveBeenCalledOnce());

    rerender(<CallModal isOpen={false} onClose={vi.fn()} />);

    expect(track.stop).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(clearIntervalSpy).toHaveBeenCalledOnce();
  });
});
