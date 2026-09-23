import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { buildServicePulses, connectedInsights, MDB_API_URL, SERVICE_SOURCE_URL, TREASURY_API_URL } from "../lib/service-intelligence";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  civic: router({
    status: publicProcedure.query(async () => {
      const sources = [
        { id: "treasury", label: "National Treasury Municipalities API", url: "https://municipaldata.treasury.gov.za/api/cubes/municipalities/members/municipality" },
        { id: "mdb", label: "Municipal Demarcation Board · MDB Wards 2026", url: "https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDB_Wards_2026/FeatureServer/0" },
      ];
      const checks = await Promise.all(sources.map(async (source) => {
        try {
          const response = await fetch(source.url, { method: "GET", signal: AbortSignal.timeout(7000) });
          return { ...source, status: response.ok ? "connected" as const : "degraded" as const, httpStatus: response.status };
        } catch {
          return { ...source, status: "offline" as const, httpStatus: null };
        }
      }));
      return {
        status: checks.every((source) => source.status === "connected") ? "connected" as const : "degraded" as const,
        checkedAt: new Date().toISOString(),
        sources: checks,
      };
    }),
    servicePulse: publicProcedure.query(async () => {
      const checkedAt = new Date().toISOString();
      const checks = await Promise.all([
        fetch(SERVICE_SOURCE_URL, { signal: AbortSignal.timeout(7000) }).then((response) => response.ok).catch(() => false),
        fetch(TREASURY_API_URL, { signal: AbortSignal.timeout(7000) }).then((response) => response.ok).catch(() => false),
        fetch(MDB_API_URL, { signal: AbortSignal.timeout(7000) }).then((response) => response.ok).catch(() => false),
      ]);
      return {
        checkedAt,
        sourceReachable: checks[0],
        feeds: buildServicePulses(checkedAt, checks[0]),
        sourceChecks: [
          { id: "municipal-notices", label: "City of Tshwane service notices", url: SERVICE_SOURCE_URL, connected: checks[0] },
          { id: "treasury", label: "National Treasury Municipal Money", url: TREASURY_API_URL, connected: checks[1] },
          { id: "mdb", label: "MDB Wards 2026", url: MDB_API_URL, connected: checks[2] },
        ],
      };
    }),
    insights: publicProcedure.query(() => ({ generatedAt: new Date().toISOString(), insights: connectedInsights })),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
