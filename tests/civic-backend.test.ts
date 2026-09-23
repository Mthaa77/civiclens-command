import { afterEach, describe, expect, it, vi } from "vitest";

import { appRouter } from "../server/routers";

afterEach(() => vi.unstubAllGlobals());

describe("connected civic backend", () => {
  it("reports the Treasury and MDB sources as connected when both respond", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const caller = appRouter.createCaller({ req: {} as never, res: {} as never, user: null });
    const result = await caller.civic.status();
    expect(result.status).toBe("connected");
    expect(result.sources).toHaveLength(2);
    expect(result.sources.every((source) => source.status === "connected")).toBe(true);
  });

  it("degrades gracefully when one official source is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));
    const caller = appRouter.createCaller({ req: {} as never, res: {} as never, user: null });
    const result = await caller.civic.status();
    expect(result.status).toBe("degraded");
    expect(result.sources.every((source) => source.status === "offline")).toBe(true);
  });

  it("returns a source-aware service pulse for water, electricity, roads, and refuse", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const caller = appRouter.createCaller({ req: {} as never, res: {} as never, user: null });
    const result = await caller.civic.servicePulse();
    expect(result.feeds.map((feed) => feed.id)).toEqual(["water", "electricity", "roads", "refuse"]);
    expect(result.sourceChecks).toHaveLength(3);
    expect(result.sourceReachable).toBe(true);
  });
});
