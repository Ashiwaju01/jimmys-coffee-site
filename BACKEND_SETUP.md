# Jimmy's Coffee backend

The live website is connected to a dedicated Supabase project. The project is separate from Rooms Coffee.

## Deployment record

- Supabase project: `fvrdqmkoicunwaqmonyn`
- Region: Canada Central (`ca-central-1`)
- Website: GitHub Pages
- Edge Function: `submit-request` (active)
- Public browser configuration: set in `index.html` using the project's publishable key
- Database migration: applied successfully
- Tables verified: `contact_requests`, `reservation_requests`, and `newsletter_signups`
- Row Level Security: enabled on all three tables; direct public table access revoked

The newsletter, contact, and reservation endpoints each returned HTTP 201 during live API testing. Each test record was verified in its corresponding table and then deleted. The live GitHub Pages HTML was also checked to confirm it contains the correct backend URL and client configuration.

## Form behavior and remaining operational setup

- Contact messages are stored in `contact_requests`. Automatic staff email alerts are not configured yet.
- Reservation requests are stored in `reservation_requests` with a server-generated reference and `pending` status. They are requests, not confirmed bookings; staff must check availability and confirm them.
- Newsletter signups are stored in `newsletter_signups` as `pending`. Double opt-in and unsubscribe support must be implemented before sending marketing email.
- Add a transactional email provider (for example, Resend) and its server-side API secret if the café team needs automatic notifications or confirmation emails.
- The repository's GitHub Actions deployment workflow requires repository secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_ID` for future automated deployments. The initial database and Edge Function deployment was completed directly in Supabase.

## Security notes

The publishable key is intended to be visible in the browser. The service-role key remains server-side in Supabase and must never be added to `index.html` or committed to GitHub. Database writes are performed by the Edge Function.
