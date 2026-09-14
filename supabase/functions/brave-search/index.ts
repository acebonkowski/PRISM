/**
 * brave-search — Supabase Edge Function
 *
 * Forwards Brave Search queries for the Prism extension so the Brave API
 * key stays server-side and never ships in the extension bundle. Takes
 * { query: string } and returns the same trimmed result shape the
 * extension previously built from Brave's response itself.
 *
 * Deploy:
 *   supabase functions deploy brave-search
 *   supabase secrets set BRAVE_API_KEY=BSA...
 */

const BRAVE_API_KEY = Deno.env.get("BRAVE_API_KEY");
const BRAVE_URL = "https://api.search.brave.com/res/v1/web/search";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (!BRAVE_API_KEY) {
    return new Response(JSON.stringify({ error: "BRAVE_API_KEY not configured", results: [] }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "query required", results: [] }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const url = `${BRAVE_URL}?q=${encodeURIComponent(query)}&count=5`;
    const braveRes = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
      },
    });

    if (!braveRes.ok) {
      throw new Error(`Brave API error: ${braveRes.status}`);
    }

    const data = await braveRes.json();
    const results = (data.web?.results || []).slice(0, 5).map((r: Record<string, string>) => ({
      title: r.title,
      url: r.url,
      description: r.description || "",
      published: r.page_age || "",
    }));

    return new Response(JSON.stringify(results), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err), results: [] }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
