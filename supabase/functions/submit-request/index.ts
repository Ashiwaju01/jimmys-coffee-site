import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://ashiwaju01.github.io";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
  "Content-Type": "application/json",
};
const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });
const str = (v: unknown, max = 2000) => typeof v === "string" ? v.trim().slice(0, max) : "";
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (origin !== ALLOWED_ORIGIN) {
    return new Response(JSON.stringify({ error: "Origin not allowed." }), {
      status: 403, headers: { "Content-Type": "application/json", "Vary": "Origin" },
    });
  }
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (Number(req.headers.get("content-length") || "0") > 12000) return json({ error: "Request is too large." }, 413);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Backend is not configured." }, 503);

  let rawBody: string;
  try {
    rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).length > 12000) return json({ error: "Request is too large." }, 413);
  } catch { return json({ error: "Could not read request." }, 400); }

  let body: { type?: unknown; payload?: Record<string, unknown> };
  try { body = JSON.parse(rawBody); } catch { return json({ error: "Invalid JSON." }, 400); }
  if (!body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) {
    return json({ error: "Missing form data." }, 400);
  }
  const type = str(body.type, 20);
  if (!["newsletter", "contact", "reservation"].includes(type)) return json({ error: "Unknown request type." }, 400);

  // Hash the proxy-provided client address; never persist the raw IP address.
  const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unavailable";
  const bucketHash = await sha256(type + ":" + clientIp);
  const windowMs = 15 * 60 * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString();
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: requestCount, error: rateError } = await db.rpc("consume_submission_rate_limit", {
    p_bucket_hash: bucketHash, p_window_start: windowStart, p_limit: 8,
  });
  if (rateError) {
    console.error("Rate limit check failed:", rateError.message);
    return json({ error: "Submissions are temporarily unavailable. Please try again shortly." }, 503);
  }
  if (Number(requestCount) > 8) return json({ error: "Too many submissions. Please wait 15 minutes and try again." }, 429);

  const p = body.payload;
  if (type === "newsletter") {
    const email = str(p.email, 254).toLowerCase();
    if (!emailOk(email)) return json({ error: "Enter a valid email address." }, 400);
    const { error } = await db.from("newsletter_signups").upsert(
      { email, status: "pending" }, { onConflict: "email", ignoreDuplicates: true },
    );
    if (error) return json({ error: "Could not save your signup. Please try again." }, 500);
    return json({ ok: true, message: "Signup request received. Subscription still requires confirmation." }, 201);
  }

  if (type === "contact") {
    const name = str(p.name, 120), email = str(p.email, 254).toLowerCase();
    const phone = str(p.phone, 50), subject = str(p.subject, 180), message = str(p.message, 5000);
    if (!name || !emailOk(email) || !subject || message.length < 2) {
      return json({ error: "Check the required contact fields." }, 400);
    }
    const { error } = await db.from("contact_requests").insert({ name, email, phone, subject, message });
    if (error) return json({ error: "Could not save your message. Please try again." }, 500);
    return json({ ok: true }, 201);
  }

  const location = str(p.location, 180), date = str(p.date, 10), time = str(p.time, 30);
  const partySize = Number(str(p.party_size, 3));
  const first_name = str(p.first_name, 100), last_name = str(p.last_name, 100);
  const email = str(p.email, 254).toLowerCase(), phone = str(p.phone, 50), note = str(p.note, 1000);
  const parsedDate = new Date(date + "T00:00:00Z");
  const dateIsReal = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
  if (!location || !dateIsReal || !time || !Number.isInteger(partySize) || partySize < 1 || partySize > 20
      || !first_name || !last_name || (!emailOk(email) && !phone)) {
    return json({ error: "Check your reservation details and provide a valid email or phone number." }, 400);
  }
  const reference = "JC-" + crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  const { error } = await db.from("reservation_requests").insert({
    reference, location, requested_date: date, requested_time: time, party_size: String(partySize),
    first_name, last_name, email: email || null, phone: phone || null, note: note || null,
  });
  if (error) return json({ error: "Could not save your reservation request. Please try again." }, 500);
  return json({ ok: true, reference, status: "pending" }, 201);
});
