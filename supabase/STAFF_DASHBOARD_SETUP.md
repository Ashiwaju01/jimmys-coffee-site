# Jimmy's Coffee staff dashboard setup

The staff dashboard is published at:

https://ashiwaju01.github.io/jimmys-coffee-site/admin.html

## 1. Create the first staff account

1. Open the Jimmy's Coffee Supabase project: https://supabase.com/dashboard/project/fvrdqmkoicunwaqmonyn/auth/users
2. Create a user for the staff member using their work email. Use a strong, unique password and deliver it securely.
3. Copy the new user's email address.
4. In the SQL Editor for this Jimmy's Coffee project, run the following after replacing the placeholder with that exact email:

```sql
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"staff_admin"}'::jsonb
where email = 'STAFF_MEMBER_WORK_EMAIL';
```

5. The staff member should sign in at the dashboard URL above. If they were already signed in before the role was assigned, sign out and sign in again to refresh their token.

Only users with the server-controlled `app_metadata.role = staff_admin` claim can read or update customer records. Do not use `user_metadata` for this role.

To revoke this dashboard role from a user:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
where email = 'STAFF_MEMBER_WORK_EMAIL';
```

## 2. Enable automatic backend deployment from GitHub

In https://github.com/Ashiwaju01/jimmys-coffee-site/settings/secrets/actions create these repository secrets:

- `SUPABASE_ACCESS_TOKEN`: a Supabase personal access token generated in your Supabase account.
- `SUPABASE_PROJECT_ID`: `fvrdqmkoicunwaqmonyn`.

Never put either secret in frontend files, commits, issues, or chat. The workflow deploys both `submit-request` and the JWT-protected `staff-admin` function and applies checked-in migrations.

## 3. Access boundaries

- The public website can submit forms but cannot query customer tables directly.
- The staff dashboard does not expose a service-role key to the browser.
- The staff API requires a valid Supabase user JWT and a server-verified `staff_admin` app-metadata role.
- Dashboard record actions are limited to the status values enforced by the database.
- Newsletter status changes only record consent state; email delivery, double opt-in and unsubscribe links still require a configured email provider.
