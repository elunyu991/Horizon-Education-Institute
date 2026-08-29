// ============================================================
// Horizon Education Institute — Submissions admin logic
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const api = window.HorizonSupabase;
  const loginSection = document.getElementById("loginSection");
  const dashSection = document.getElementById("dashboardSection");
  const loginForm = document.getElementById("adminLoginForm");
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

  // ============================================================
  // NEWS management
  // ============================================================
  const newsFormWrap = document.getElementById("newsFormWrap");
  const newsForm = document.getElementById("newsForm");
  const newsEditId = document.getElementById("newsEditId");
  const newsFormTitle = document.getElementById("newsFormTitle");
  const newsBody2 = document.getElementById("newsBody2");
  const newsCount = document.getElementById("newsCount");

  document.getElementById("addNewsBtn").addEventListener("click", () => {
    newsEditId.value = "";
    newsFormTitle.textContent = "New Article";
    newsForm.reset();
    document.getElementById("newsPublished").checked = true;
    show(newsFormWrap);
    newsFormWrap.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("newsCancelBtn").addEventListener("click", () => {
    hide(newsFormWrap);
    newsForm.reset();
  });

  newsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById("newsTitle").value.trim(),
      summary: document.getElementById("newsSummary").value.trim(),
      body: document.getElementById("newsBody").value.trim(),
      image_url: document.getElementById("newsImage").value.trim() || null,
      published: document.getElementById("newsPublished").checked,
      updated_at: new Date().toISOString()
    };
    setMsg(dashMsg, "Saving article…", "#666");
    let res;
    if (newsEditId.value) {
      res = await api.updateRow("news", newsEditId.value, payload, token);
    } else {
      payload.created_at = new Date().toISOString();
      res = await api.insertRow("news", payload, token);
    }
    if (res.ok) {
      hide(newsFormWrap);
      newsForm.reset();
      setMsg(dashMsg, "Article saved!", "#1e7e34");
      loadNews();
    } else {
      setMsg(dashMsg, res.message);
    }
  });

  async function loadNews() {
    const res = await api.loadRows("news", token);
    if (!res.ok) { if (!handleAuthError(res.message)) setMsg(dashMsg, "News: " + res.message); return; }
    newsBody2.innerHTML = "";
    newsCount.textContent = res.rows.length + " article(s)";
    res.rows.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td>' + (item.title || "") + '</td>' +
        '<td>' + (item.created_at ? new Date(item.created_at).toLocaleDateString() : "") + '</td>' +
        '<td>' + (item.published ? '<span style="color:#1e7e34;font-weight:700;">Published</span>' : '<span style="color:#888;">Draft</span>') + '</td>' +
        '<td style="white-space:nowrap;">' +
          '<button class="news-edit-btn" data-id="' + item.id + '" style="background:none;border:none;color:#2a4a7d;font-weight:700;cursor:pointer;font-size:13px;">Edit</button> ' +
          '<button class="news-del-btn" data-id="' + item.id + '" style="background:none;border:none;color:#c62828;font-weight:700;cursor:pointer;font-size:13px;">Delete</button>' +
        '</td>';
      newsBody2.appendChild(tr);
    });
    newsBody2.querySelectorAll(".news-edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const item = res.rows.find(r => r.id === id);
        if (!item) return;
        newsEditId.value = id;
        newsFormTitle.textContent = "Edit Article";
        document.getElementById("newsTitle").value = item.title || "";
        document.getElementById("newsSummary").value = item.summary || "";
        document.getElementById("newsBody").value = item.body || "";
        document.getElementById("newsImage").value = item.image_url || "";
        document.getElementById("newsPublished").checked = item.published !== false;
        show(newsFormWrap);
        newsFormWrap.scrollIntoView({ behavior: "smooth" });
      });
    });
    newsBody2.querySelectorAll(".news-del-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this article?")) return;
        const res2 = await api.deleteRow("news", btn.dataset.id, token);
        if (res2.ok) { setMsg(dashMsg, "Article deleted.", "#1e7e34"); loadNews(); }
        else setMsg(dashMsg, res2.message);
      });
    });
  }

  // ============================================================
  // JOB ADVERTS management
  // ============================================================
  const jobFormWrap = document.getElementById("jobFormWrap");
  const jobForm = document.getElementById("jobForm");
  const jobEditId = document.getElementById("jobEditId");
  const jobFormTitle = document.getElementById("jobFormTitle");
  const jobsBody2 = document.getElementById("jobsBody2");
  const jobsCount = document.getElementById("jobsCount");

  document.getElementById("addJobBtn").addEventListener("click", () => {
    jobEditId.value = "";
    jobFormTitle.textContent = "New Job Advert";
    jobForm.reset();
    document.getElementById("jobPublished").checked = true;
    show(jobFormWrap);
    jobFormWrap.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("jobCancelBtn").addEventListener("click", () => {
    hide(jobFormWrap);
    jobForm.reset();
  });

  jobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById("jobTitle").value.trim(),
      department: document.getElementById("jobDept").value.trim(),
      location: document.getElementById("jobLocation").value.trim(),
      type: document.getElementById("jobType").value,
      deadline: document.getElementById("jobDeadline").value,
      description: document.getElementById("jobDesc").value.trim(),
      requirements: document.getElementById("jobReqs").value.trim(),
      published: document.getElementById("jobPublished").checked,
      updated_at: new Date().toISOString()
    };
    setMsg(dashMsg, "Saving job advert…", "#666");
    let res;
    if (jobEditId.value) {
      res = await api.updateRow("job_adverts", jobEditId.value, payload, token);
    } else {
      payload.created_at = new Date().toISOString();
      res = await api.insertRow("job_adverts", payload, token);
    }
    if (res.ok) {
      hide(jobFormWrap);
      jobForm.reset();
      setMsg(dashMsg, "Job advert saved!", "#1e7e34");
      loadJobs();
    } else {
      setMsg(dashMsg, res.message);
    }
  });

  async function loadJobs() {
    const res = await api.loadRows("job_adverts", token);
    if (!res.ok) { if (!handleAuthError(res.message)) setMsg(dashMsg, "Jobs: " + res.message); return; }
    jobsBody2.innerHTML = "";
    jobsCount.textContent = res.rows.length + " job advert(s)";
    res.rows.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td>' + (item.title || "") + '</td>' +
        '<td>' + (item.department || "—") + '</td>' +
        '<td>' + (item.type || "—") + '</td>' +
        '<td>' + (item.deadline || "—") + '</td>' +
        '<td>' + (item.published ? '<span style="color:#1e7e34;font-weight:700;">Published</span>' : '<span style="color:#888;">Draft</span>') + '</td>' +
        '<td style="white-space:nowrap;">' +
          '<button class="job-edit-btn" data-id="' + item.id + '" style="background:none;border:none;color:#2a4a7d;font-weight:700;cursor:pointer;font-size:13px;">Edit</button> ' +
          '<button class="job-del-btn" data-id="' + item.id + '" style="background:none;border:none;color:#c62828;font-weight:700;cursor:pointer;font-size:13px;">Delete</button>' +
        '</td>';
      jobsBody2.appendChild(tr);
    });
    jobsBody2.querySelectorAll(".job-edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const item = res.rows.find(r => r.id === id);
        if (!item) return;
        jobEditId.value = id;
        jobFormTitle.textContent = "Edit Job Advert";
        document.getElementById("jobTitle").value = item.title || "";
        document.getElementById("jobDept").value = item.department || "";
        document.getElementById("jobLocation").value = item.location || "";
        document.getElementById("jobType").value = item.type || "Full-time";
        document.getElementById("jobDeadline").value = item.deadline || "";
        document.getElementById("jobDesc").value = item.description || "";
        document.getElementById("jobReqs").value = item.requirements || "";
        document.getElementById("jobPublished").checked = item.published !== false;
        show(jobFormWrap);
        jobFormWrap.scrollIntoView({ behavior: "smooth" });
      });
    });
    jobsBody2.querySelectorAll(".job-del-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this job advert?")) return;
        const res2 = await api.deleteRow("job_adverts", btn.dataset.id, token);
        if (res2.ok) { setMsg(dashMsg, "Job advert deleted.", "#1e7e34"); loadJobs(); }
        else setMsg(dashMsg, res2.message);
      });
    });
  }

  // Override loadAll to also load news and jobs
  const _origLoadAll = loadAll;
  // We already defined loadAll above; just add news/jobs loading at the end
  // Patch: after existing loadAll runs, also load news and jobs
  const origLoadAll = loadAll;
  refreshBtn.removeEventListener("click", origLoadAll);
  async function loadAllWithContent() {
    await origLoadAll();
    loadNews();
    loadJobs();
  }
  refreshBtn.addEventListener("click", loadAllWithContent);

  // Also patch loadSession to include news/jobs on initial load
  const origLoadSession = loadSession;
  // Wrap to add news/jobs loading
  (function patchInitialLoad() {
    const orig = refreshBtn.onclick;
  })();

  loadSession();

  // Load news and jobs after session is loaded
  setTimeout(() => { if (token) { loadNews(); loadJobs(); } }, 500);
});
