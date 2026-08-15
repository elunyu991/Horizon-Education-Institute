# Supabase Setup — Horizon Education Institute

This site stores every form submission (admissions applications + contact messages) in
Supabase. The client views them on **`admin.html`**. Everything is already wired up —
you only need to complete the 4 steps below.

---

## Step 1 — Run the database schema (one time)

1. Open your Supabase project dashboard.
2. Go to **SQL Editor** (left sidebar).
3. Click **New query**, open the file `supabase/schema.sql` from this project, and paste
   its contents into the editor.
4. Click **Run**.

This creates two tables — `applications` and `contact_messages` — with row-level security
so that **anyone can submit** but **only you (staff) can read** the submissions.

> ⚠️ **Important:** the SELECT policies in `schema.sql` contain the placeholder
> `YOUR_STAFF_EMAIL`. Before running the SQL, open the file and replace `YOUR_STAFF_EMAIL`
> in **both** `create policy ... for select` blocks with your own staff email (the one you
> will use to sign in on `admin.html`). If you leave the placeholder or use the wrong
> address, sign-in will succeed but the tables will show a permission error.

---

## Step 2 — Paste your project URL and anon key

1. In the Supabase dashboard go to **Project Settings → API**.
2. Copy the **Project URL** (e.g. `https://abcdefgh.supabase.co`).
3. Copy the **anon/public key** (the long `eyJ...` string).
4. Open `js/supabase-config.js` in this project and paste them in:

```js
window.SUPABASE_CONFIG = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "eyJ..."
};
```

> ⚠️ Use the **anon** (public) key here — never the `service_role` key. The anon key is
> safe to include in the frontend because row-level security protects the data.

---

## Step 3 — Create your staff account

Two options:

- **Recommended:** In the Supabase dashboard go to **Authentication → Users → Add user**,
  create a user with the email you whitelisted in Step 1. Note: if **Confirm email** is
  enabled, the user may need to confirm their email before the login token works.
- **Optional:** if **Authentication → Providers → Email** has *Enable sign-ups* on, you can
  instead use the "create an account" link on `admin.html` itself.

Then open **`admin.html`** on your site and sign in with that account — you'll see every
application and contact message, newest first.

---

## Step 4 — Test it

1. Open `apply-now.html` and submit a test application → you should see the success message.
2. Open `admin.html`, sign in, and confirm the submission appears under **Applications**.
3. Repeat for the contact form on `contact.html` → **Contact Messages** tab.

---

## How it works

| File | Purpose |
|---|---|
| `js/supabase-config.js` | Your project URL + anon key (the only file you edit) |
| `js/supabase-client.js` | Dependency-free fetch client (submit / sign-in / sign-up / load) |
| `js/script.js` | Detects `form[data-table]`, saves submissions on submit |
| `admin.html` + `js/supabase-admin.js` | Client-facing dashboard to view submissions |
| `supabase/schema.sql` | Tables + row-level security policies |

No build step, no npm packages, no backend server — it works on any static host
(including GitHub Pages).

## Notes

- If a visitor submits while the site is offline, the fetch will fail with a clear
  message — nothing is lost silently.
- To stop new sign-ups once your staff account exists, turn off **Enable sign-ups** in
  Supabase → Authentication → Providers → Email.
- Submissions are stored in your Supabase Postgres database and can also be browsed
  directly under **Table Editor** in the dashboard.
