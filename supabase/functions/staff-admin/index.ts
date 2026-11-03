import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://ashiwaju01.github.io";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
  "Content-Type": "application/json",
};
const reply = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (req) => {
  if (req.headers.get("origin") !== ALLOWED_ORIGIN) {
    return new Response(JSON.stringify({ error: "Origin not allowed." }), {
      status: 403, headers: { "Content-Type": "application/json", "Vary": "Origin" },
    });
  }
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return reply({ error: "Sign in is required." }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return reply({ error: "Admin service is not configured." }, 503);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const user = authData?.user;
  if (authError || !user) return reply({ error: "Your session is invalid. Sign in again." }, 401);
  if (user.app_metadata?.role !== "staff_admin") {
    return reply({ error: "This account is not authorised for the staff dashboard." }, 403);
  }

  let body: { action?: string; table?: string; id?: string; status?: string };
  try {
    const raw = await req.text();
    if (raw.length > 4000) return reply({ error: "Request is too large." }, 413);
    body = JSON.parse(raw);
  } catch {
    return reply({ error: "Invalid request body." }, 400);
  }

  if (body.action === "list") {
    const [reservations, contacts, newsletter] = await Promise.all([
      admin.from("reservation_requests").select("id,reference,location,requested_date,requested_time,party_size,first_name,last_name,email,phone,note,status,created_at").order("created_at", { ascending: false }).limit(100),
      admin.from("contact_requests").select("id,name,email,phone,subject,message,status,created_at").order("created_at", { ascending: false }).limit(100),
      admin.from("newsletter_signups").select("id,email,status,consented_at").order("consented_at", { ascending: false }).limit(100),
    ]);
    const error = reservations.error || contacts.error || newsletter.error;
    if (error) {
      console.error("Staff list query failed:", error.message);
      return reply({ error: "Could not load the staff inbox." }, 500);
    }
    return reply({
      reservations: reservations.data || [],
      contacts: contacts.data || [],
      newsletter: newsletter.data || [],
      fetched_at: new Date().toISOString(),
    });
  }

  if (body.action === "update") {
    const table = body.table;
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";
    const allowed: Record<string, string[]> = {
      reservation_requests: ["pending", "confirmed", "declined", "cancelled"],
      contact_requests: ["new", "in_progress", "closed"],
      newsletter_signups: ["pending", "subscribed", "unsubscribed"],
    };
    if (!table || !allowed[table] || !id || !allowed[table].includes(status)) {
      return reply({ error: "Invalid record update." }, 400);
    }
    const { data, error } = await admin.from(table).update({ status }).eq("id", id).select("id,status").maybeSingle();
    if (error) {
      console.error("Staff update failed:", error.message);
      return reply({ error: "Could not update this record." }, 500);
    }
    if (!data) return reply({ error: "Record not found." }, 404);
    return reply({ ok: true, record: data });
  }

  return reply({ error: "Unknown action." }, 400);
});
