# Jimmy's Coffee backend setup

The public website is hosted on GitHub Pages, which cannot run server-side code. The repository now includes a Supabase Edge Function and database schema for storing contact messages, reservation requests, and newsletter signup requests.

## Important status

The live page is deliberately configured with empty backend values in `index.html`. Until a dedicated Jimmy's Coffee Supabase project is selected and configured, forms use a clearly labelled email-draft fallback. Drafting an email does **not** submit it, subscribe someone, or reserve a table.

## Setup

1. Create/use a **dedicated Jimmy's Coffee Supabase project**. Do not reuse an unrelated client project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Deploy `supabase/functions/submit-request/index.ts` as an Edge Function named `submit-request`. Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to deployed functions; keep the service-role key server-side only.
4. In `index.html`, set `window.JC_BACKEND_URL` to the project API URL and `window.JC_BACKEND_ANON_KEY` to that project's publishable/anon key. The public key is expected to be exposed in a browser; the service-role key must never be.
5. Test each form with a real email/phone and verify rows appear in the correct tables.
6. Add an email delivery provider (for example, Resend) and secrets to the Edge Function if the café team needs automatic email alerts. This initial function stores requests in Supabase; it does not yet send notification emails.
7. Newsletter rows are saved as `pending`, not automatically subscribed. Add double opt-in and unsubscribe support before sending marketing email.
8. Reservation requests are saved as `pending`; they are not confirmed bookings. A staff workflow must confirm availability and update the status.

## Tables

- `contact_requests`: enquiries from the contact form.
- `reservation_requests`: table requests, with server-generated references and pending status.
- `newsletter_signups`: email signups pending confirmation.

RLS is enabled and direct public table access is revoked. Writes are performed by the Edge Function using its server-side service role key.
