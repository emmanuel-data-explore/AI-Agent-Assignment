import { describe, expect, it } from "vitest";

describe("Supabase server credentials", () => {
  it("authenticates against the configured REST endpoint", async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(url, "SUPABASE_URL must be configured").toBeTruthy();
    expect(key, "SUPABASE_SERVICE_ROLE_KEY must be configured").toBeTruthy();
    const response = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key!, Authorization: `Bearer ${key!}` },
      signal: AbortSignal.timeout(10000),
    });
    expect(response.status, `Supabase REST returned ${response.status}`).not.toBe(401);
    expect(response.status, `Supabase REST returned ${response.status}`).not.toBe(403);
    expect(response.status).toBeLessThan(500);
  }, 15000);
});
