import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clampIdle, useIdle } from "@/lib/prefs";

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("browser inactivity", () => {
  it("limits the setting to 15 minutes", () => {
    expect(clampIdle(16)).toBe(15);
    expect(clampIdle(0)).toBe(1);
  });
  it("closes after the configured minute of inactivity", () => {
    vi.useFakeTimers();
    const close = vi.fn();
    renderHook(() => useIdle(1, true, close));
    act(() => vi.advanceTimersByTime(59_999));
    expect(close).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(close).toHaveBeenCalledTimes(1);
  });
  it("restarts the timer on activity", () => {
    vi.useFakeTimers();
    const close = vi.fn();
    renderHook(() => useIdle(1, true, close));
    act(() => vi.advanceTimersByTime(50_000));
    act(() => window.dispatchEvent(new Event("keydown")));
    act(() => vi.advanceTimersByTime(59_999));
    expect(close).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(close).toHaveBeenCalledTimes(1);
  });
  it("does not close while the visible game iframe has focus", () => {
    vi.useFakeTimers();
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.focus();
    const close = vi.fn();
    renderHook(() => useIdle(1, true, close));
    act(() => vi.advanceTimersByTime(120_000));
    expect(close).not.toHaveBeenCalled();
    iframe.remove();
  });
});