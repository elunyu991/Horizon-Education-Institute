// ============================================================
// Horizon Education Institute — Supabase client (no dependencies)
// Uses Supabase REST + Auth endpoints via plain fetch.
// Every method returns { ok: true, ... } or { ok: false, message }.
// ============================================================
(function () {
  const cfg = window.SUPABASE_CONFIG || { url: "", anonKey: "" };

  const isConfigured = () => Boolean(cfg.url && cfg.anonKey);

  function baseHeaders(token) {
    return {
      apikey: cfg.anonKey,
      Authorization: "Bearer " + (token || cfg.anonKey),
      "Content-Type": "application/json"
    };
  }

  async function parseError(res) {
    try {
      const j = await res.json();
      return j.message || j.msg || j.error_description || ("Request failed (" + res.status + ").");
    } catch (e) {
      return "Request failed (" + res.status + ").";
    }
  }

  // INSERT a form submission into a table.
  async function submit(table, payload) {
    if (!isConfigured()) {
      return { ok: false, message: "Storage is not configured yet. Add your Supabase URL and anon key in js/supabase-config.js." };
    }
    try {
      const res = await fetch(cfg.url + "/rest/v1/" + table, {
        method: "POST",
        headers: { ...baseHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return { ok: false, message: await parseError(res) };
      return { ok: true };
    } catch (e) {
      return { ok: false, message: "Network error. Please check your connection and try again." };
    }
  }

  // Email/password sign in. Returns { ok, token, user }.
  async function signIn(email, password) {
    if (!isConfigured()) return { ok: false, message: "Supabase is not configured (see js/supabase-config.js)." };
    try {
      const res = await fetch(cfg.url + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify({ email: email, password: password })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.access_token) {
        return { ok: false, message: j.error_description || j.msg || "Invalid email or password." };
      }
      return { ok: true, token: j.access_token, user: j.user };
    } catch (e) {
      return { ok: false, message: "Network error. Please check your connection." };
    }
  }

  // Create an account (only works if sign-ups are enabled in Auth settings).
  // Optional metadata (e.g. { full_name }) is stored on the user for later use.
  async function signUp(email, password, metadata) {
    if (!isConfigured()) return { ok: false, message: "Supabase is not configured (see js/supabase-config.js)." };
    try {
      const body = { email: email, password: password };
      if (metadata && typeof metadata === "object") body.data = metadata;
      const res = await fetch(cfg.url + "/auth/v1/signup", {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify(body)
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, message: j.msg || j.error_description || "Sign-up failed." };
      return { ok: true, user: j.user };
    } catch (e) {
      return { ok: false, message: "Network error. Please check your connection." };
    }
  }

  // SELECT all rows from a table using an authenticated token.
  async function loadRows(table, token) {
    if (!isConfigured()) return { ok: false, message: "Supabase is not configured (see js/supabase-config.js)." };
    try {
      const res = await fetch(cfg.url + "/rest/v1/" + table + "?select=*&order=created_at.desc", {
        method: "GET",
        headers: baseHeaders(token)
      });
      if (!res.ok) return { ok: false, message: await parseError(res) };
      return { ok: true, rows: await res.json() };
    } catch (e) {
      return { ok: false, message: "Network error while loading submissions." };
    }
  }

  // UPSERT the signed-in student's profile row in student_profiles.
  // The payload must include user_id (the student's auth uid); RLS only
  // allows writes where auth.uid() = user_id, so no one can touch another
  // student's row.
  async function saveProfile(profile, token) {
    if (!isConfigured()) return { ok: false, message: "Supabase is not configured (see js/supabase-config.js)." };
    try {
      const res = await fetch(cfg.url + "/rest/v1/student_profiles?on_conflict=user_id", {
        method: "POST",
        headers: { ...baseHeaders(token), Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(profile)
      });
      if (!res.ok) return { ok: false, message: await parseError(res) };
      return { ok: true };
    } catch (e) {
      return { ok: false, message: "Network error while saving your profile." };
    }
  }

  // Fetch the signed-in student's OWN profile row (RLS returns only their row).
  async function loadOwnProfile(token) {
    if (!isConfigured()) return { ok: false, message: "Supabase is not configured (see js/supabase-config.js)." };
    try {
      const res = await fetch(cfg.url + "/rest/v1/student_profiles?select=*&limit=1", {
        method: "GET",
        headers: baseHeaders(token)
      });
      if (!res.ok) return { ok: false, message: await parseError(res) };
      const rows = await res.json();
      return { ok: true, profile: rows && rows[0] ? rows[0] : null };
    } catch (e) {
      return { ok: false, message: "Network error while loading your profile." };
    }
  }

  window.HorizonSupabase = { isConfigured, submit, signIn, signUp, loadRows, saveProfile, loadOwnProfile };
})();
