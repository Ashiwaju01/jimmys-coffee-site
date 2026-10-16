import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });
const str = (v: unknown, max = 2000) => typeof v === "string" ? v.trim().slice(0, max) : "";
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Backend is not configured." }, 503);

  let body: { type?: unknown; payload?: Record<string, unknown> };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
  if (!body.payload || typeof body.payload !== "object") return json({ error: "Missing form data." }, 400);
  const p = body.payload;
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  if (body.type === "newsletter") {
    const email = str(p.email, 254).toLowerCase();
    if (!emailOk(email)) return json({ error: "Enter a valid email address." }, 400);
    const { error } = await db.from("newsletter_signups").upsert({ email, status: "pending" }, { onConflict: "email", ignoreDuplicates: true });
    if (error) return json({ error: "Could not save your signup. Please try again." }, 500);
    return json({ ok: true, message: "Signup request received. Subscription still requires confirmation." }, 201);
  }

  if (body.type === "contact") {
    const name = str(p.name, 120), email = str(p.email, 254).toLowerCase();
    const phone = str(p.phone, 50), subject = str(p.subject, 180), message = str(p.message, 5000);
    if (!name || !emailOk(email) || !subject || message.length < 2) return json({ error: "Check the required contact fields." }, 400);
    const { error } = await db.from("contact_requests").insert({ name, email, phone, subject, message });
    if (error) return json({ error: "Could not save your message. Please try again." }, 500);
    return json({ ok: true }, 201);
  }

  if (body.type === "reservation") {
    const location = str(p.location, 180), date = str(p.date, 10), time = str(p.time, 30);
    const party_size = str(p.party_size, 10), first_name = str(p.first_name, 100), last_name = str(p.last_name, 100);
    const email = str(p.email, 254).toLowerCase(), phone = str(p.phone, 50), note = str(p.note, 1000);
    if (!location || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !time || !party_size || !first_name || !last_name || (!emailOk(email) && !phone)) {
      return json({ error: "Check your reservation details and provide a valid email or phone number." }, 400);
    }
    const reference = "JC-" + crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
    const { error } = await db.from("reservation_requests").insert({
      reference, location, requested_date: date, requested_time: time, party_size, first_name, last_name,
      email: email || null, phone: phone || null, note: note || null,
    });
    if (error) return json({ error: "Could not save your reservation request. Please try again." }, 500);
    return json({ ok: true, reference, status: "pending" }, 201);
  }

  return json({ error: "Unknown request type." }, 400);
});
