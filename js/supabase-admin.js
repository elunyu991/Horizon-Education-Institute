// ============================================================
// Horizon Education Institute — Submissions admin logic
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const api = window.HorizonSupabase;
  const loginSection = document.getElementById("loginSection");
  const dashSection = document.getElementById("dashboardSection");
  const loginForm = document.getElementById("adminLoginForm");
  const signupForm = document.getElementById("adminSignupForm");
  const showSignup = document.getElementById("showSignup");
  const adminMsg = document.getElementById("adminMsg");
  const dashMsg = document.getElementById("dashMsg");
  const userChip = document.getElementById("userChip");
  const refreshBtn = document.getElementById("refreshBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const SESSION_KEY = "hei_supabase_session";
  let token = null;

  // Friendly display name: stored name → email prefix → generic.
  function displayName(s) {
    if (s && s.name && s.name.trim() && s.name !== s.email) return s.name.trim();
    if (s && s.email) {
      const prefix = s.email.split("@")[0].replace(/[._-]+/g, " ").trim();
      if (prefix) {
        return prefix.replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }
    return "there";
  }

  function applyWelcome(s) {
    const el = document.getElementById("adminWelcome");
    if (el) el.textContent = "Welcome, " + displayName(s) + " 👋";
    userChip.textContent = "👤 " + displayName(s);
  }

  const setMsg = (el, text, color) => {
    if (!el) return;
    el.textContent = text;
    el.style.color = color || "#c62828";
  };

  const show = (el) => el && el.classList.remove("hidden");
  const hide = (el) => el && el.classList.add("hidden");

  // --- Session persistence ---
  function loadSession() {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (s && s.token) {
        token = s.token;
        applyWelcome(s);
        show(dashSection); hide(loginSection);
        loadAll();
      }
    } catch (e) { /* ignore */ }
  }

  function saveSession(s) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }

  // --- Sign in ---
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;
    setMsg(adminMsg, "Signing in…", "#666");
    const res = await api.signIn(email, password);
    if (res.ok) {
      token = res.token;
      const meta = res.user && res.user.user_metadata && res.user.user_metadata.full_name;
      const s = { token: res.token, email, name: meta || email };
      saveSession(s);
      applyWelcome(s);
      hide(loginSection); show(dashSection);
      loadAll();
    } else {
      setMsg(adminMsg, res.message);
    }
  });

  // --- Sign up (if enabled) ---
  showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    signupForm.classList.toggle("hidden");
  });

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    setMsg(adminMsg, "Creating account…", "#666");
    const res = await api.signUp(email, password, { full_name: name });
    if (res.ok) {
      setMsg(adminMsg, "Account created! If email confirmation is enabled in Supabase, check your inbox and confirm first, then sign in above.", "#1e7e34");
      signupForm.reset();
      signupForm.classList.add("hidden");
    } else {
      setMsg(adminMsg, res.message);
    }
  });

  // --- Logout ---
  logoutBtn.addEventListener("click", () => {
    token = null;
    localStorage.removeItem(SESSION_KEY);
    hide(dashSection); show(loginSection);
    setMsg(adminMsg, "");
  });

  // --- Tabs ---
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.getAttribute("data-tab");
      document.querySelectorAll(".admin-card").forEach((c) => c.classList.add("hidden"));
      const target = document.getElementById("tab-" + tab);
      if (target) target.classList.remove("hidden");
    });
  });

  // --- Rendering helpers ---
  function renderTable(headEl, bodyEl, rows, countEl, label) {
    headEl.innerHTML = "";
    bodyEl.innerHTML = "";
    if (countEl) countEl.textContent = label + ": " + rows.length + " submission(s)";

    if (!rows.length) {
      headEl.innerHTML = "<th>No submissions yet</th>";
      bodyEl.innerHTML = '<tr><td>Nothing here yet — form submissions will appear in this table.</td></tr>';
      return;
    }

    const keys = Object.keys(rows[0]).filter((k) => k !== "id");
    headEl.innerHTML = keys
      .map((k) => "<th>" + k.replace(/_/g, " ").toUpperCase() + "</th>")
      .join("");

    rows.forEach((row) => {
      const tr = document.createElement("tr");
      keys.forEach((k) => {
        const td = document.createElement("td");
        let v = row[k];
        if (v === null || v === undefined) v = "—";
        if (k === "created_at") {
          try { v = new Date(v).toLocaleString(); } catch (e) { /* keep */ }
        }
        td.textContent = v;
        tr.appendChild(td);
      });
      bodyEl.appendChild(tr);
    });
  }

  // --- Handle expired / invalid session tokens ---
  function handleAuthError(message) {
    if (/permission denied|JWT|invalid api key|401|PGRST301|PGRST302/i.test(message)) {
      token = null;
      localStorage.removeItem(SESSION_KEY);
      hide(dashSection); show(loginSection);
      setMsg(dashMsg, "");
      setMsg(adminMsg, "Your session expired or you don't have permission to view submissions — please sign in again.", "#c62828");
      return true;
    }
    return false;
  }

  // --- Load all submissions ---
  async function loadAll() {
    setMsg(dashMsg, "Loading…", "#666");
    const [apps, msgs, studs] = await Promise.all([
      api.loadRows("applications", token),
      api.loadRows("contact_messages", token),
      api.loadRows("student_profiles", token)
    ]);

    if (apps.ok) {
      renderTable(
        document.getElementById("appHead"),
        document.getElementById("appBody"),
        apps.rows,
        document.getElementById("appCount"),
        "Applications"
      );
    } else if (!handleAuthError(apps.message)) {
      setMsg(dashMsg, "Applications: " + apps.message);
    }

    if (msgs.ok) {
      renderTable(
        document.getElementById("msgHead"),
        document.getElementById("msgBody"),
        msgs.rows,
        document.getElementById("msgCount"),
        "Contact messages"
      );
    } else if (!handleAuthError(msgs.message)) {
      setMsg(dashMsg, (dashMsg.textContent ? dashMsg.textContent + " · " : "") + "Messages: " + msgs.message);
    }

    if (studs.ok) {
      renderTable(
        document.getElementById("studHead"),
        document.getElementById("studBody"),
        studs.rows,
        document.getElementById("studCount"),
        "Registered students"
      );
    } else if (!handleAuthError(studs.message)) {
      setMsg(dashMsg, (dashMsg.textContent ? dashMsg.textContent + " · " : "") + "Students: " + studs.message);
    }

    if (apps.ok && msgs.ok && studs.ok) setMsg(dashMsg, "");
  }

  refreshBtn.addEventListener("click", loadAll);

  loadSession();
});
