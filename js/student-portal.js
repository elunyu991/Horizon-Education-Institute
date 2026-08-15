// ============================================================
// Horizon Education Institute — Student Portal
// Register → Login → Dashboard.
// Accounts are real: Supabase Auth (email + password).
// The dashboard is data-driven from js/student-data.js and
// personalises it with the student's profile in localStorage.
// ============================================================
(function () {
  "use strict";

  var SB = window.HorizonSupabase;
  var DATA = window.STUDENT_DATA || {};
  var SESSION_KEY = "hei_student_session";
  var PROFILE_KEY = "hei_student_profile";
  var ENROLLED_KEY = "hei_student_enrolled";
  var REQUESTS_KEY = "hei_student_requests";

  var authView = document.getElementById("portalAuth");
  var dashView = document.getElementById("portalDash");
  var contentEl = document.getElementById("portalContent");
  var authMsg = document.getElementById("portalAuthMsg");
  var sidebar = document.getElementById("portalSidebar");

  var session = null;
  var currentSection = "overview";

  // ---------- tiny helpers ----------
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function byId(id) { return document.getElementById(id); }
  function setMsg(el, text, color) {
    if (!el) return;
    el.textContent = text;
    el.style.color = color || "#c62828";
  }
  function today() {
    return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  function scopedKey(key) {
    var id = session && session.email ? session.email.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() : "guest";
    return key + "_" + id;
  }
  function lsGet(key, fallback) {
    try {
      var raw = localStorage.getItem(scopedKey(key));
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(scopedKey(key), JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  // ---------- Supabase profile sync (registration details are stored &
  // secured in the student_profiles table; localStorage is just a cache) ----------
  var PROFILE_SNAKE = {
    fullname: "fullname", email: "email", phone: "phone", program: "program", intake: "intake",
    studentId: "student_id", regDate: "reg_date", dob: "dob", gender: "gender",
    nationality: "nationality", address: "address",
    emergencyName: "emergency_name", emergencyRelation: "emergency_relation", emergencyPhone: "emergency_phone"
  };
  function toSnakeProfile(p) {
    var out = {};
    for (var k in PROFILE_SNAKE) {
      if (p[k] !== undefined && p[k] !== null) out[PROFILE_SNAKE[k]] = p[k];
    }
    return out;
  }
  function fromSnakeProfile(row) {
    var out = {};
    for (var k in PROFILE_SNAKE) out[k] = (row[PROFILE_SNAKE[k]] || "").trim();
    return out;
  }
  // Push the localStorage profile to Supabase (upsert on user_id).
  async function syncProfileUp() {
    if (!SB || !session || !session.token || !session.uid) return { ok: false, message: "Not signed in." };
    var p = getProfile();
    if (!p) return { ok: false, message: "No profile." };
    var payload = toSnakeProfile(p);
    payload.user_id = session.uid;
    return SB.saveProfile(payload, session.token);
  }
  // Pull the Supabase profile into localStorage (remote wins where it has data).
  async function syncProfileDown() {
    if (!SB || !session || !session.token) return null;
    var res = await SB.loadOwnProfile(session.token);
    if (res.ok && res.profile) {
      var remote = fromSnakeProfile(res.profile);
      var local = lsGet(PROFILE_KEY, null) || defaultProfile(session.email);
      var merged = {};
      for (var k in PROFILE_SNAKE) merged[k] = remote[k] ? remote[k] : (local[k] || "");
      merged.studentId = merged.studentId || local.studentId || defaultProfile(session.email).studentId;
      merged.regDate = merged.regDate || local.regDate || today();
      lsSet(PROFILE_KEY, merged);
      return merged;
    }
    return null;
  }
  // After login/registration: pull the server copy; if the student has no
  // row yet (e.g. email-confirmation-pending registration), push the local one.
  async function syncAfterAuth() {
    if (!SB || !session) return;
    var pulled = await syncProfileDown();
    if (!pulled) await syncProfileUp();
    var p = getProfile();
    if (p) {
      byId("portalSideName").textContent = p.fullname || p.email;
      byId("portalSideProgram").textContent = p.program || "";
      byId("portalTopName").textContent = p.fullname || p.email;
    }
  }

  // ---------- profile & student state ----------
  function defaultProfile(email) {
    var seed = 0;
    for (var i = 0; i < email.length; i++) seed = (seed * 31 + email.charCodeAt(i)) % 9000;
    return {
      fullname: "",
      email: email,
      phone: "",
      program: DATA.programs[0],
      intake: DATA.intakes[0],
      studentId: "HEI/" + new Date().getFullYear() + "/" + String(seed + 1000),
      regDate: today(),
      dob: "",
      gender: "",
      nationality: "Ugandan",
      address: "",
      emergencyName: "",
      emergencyRelation: "",
      emergencyPhone: ""
    };
  }
  function getProfile() {
    if (!session) return null;
    var p = lsGet(PROFILE_KEY, null);
    if (!p) { p = defaultProfile(session.email); lsSet(PROFILE_KEY, p); }
    return p;
  }
  function saveProfile(patch) {
    var p = getProfile() || defaultProfile(session.email);
    for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) p[k] = patch[k];
    lsSet(PROFILE_KEY, p);
    return p;
  }
  function enrolledCodes() {
    var codes = lsGet(ENROLLED_KEY, null);
    if (!codes || !codes.length) {
      codes = DATA.courseCatalog.slice(0, 5).map(function (c) { return c.code; });
      lsSet(ENROLLED_KEY, codes);
    }
    return codes;
  }
  function setEnrolled(codes) { lsSet(ENROLLED_KEY, codes); }
  function getRequests() { return lsGet(REQUESTS_KEY, []); }
  function addRequest(type, data) {
    var reqs = getRequests();
    reqs.push({ type: type, data: data, date: today() });
    lsSet(REQUESTS_KEY, reqs);
    return reqs;
  }

  // ---------- view switching ----------
  function showAuth(tab) {
    dashView.hidden = true;
    authView.hidden = false;
    setAuthTab(tab || "login");
    window.scrollTo(0, 0);
  }
  function showDash(section) {
    authView.hidden = true;
    dashView.hidden = false;
    var p = getProfile();
    if (p) {
      byId("portalSideName").textContent = p.fullname || p.email;
      byId("portalSideProgram").textContent = p.program || "";
      byId("portalTopName").textContent = p.fullname || p.email;
    }
    go(section || "overview");
    window.scrollTo(0, 0);
  }
  function setAuthTab(tab) {
    var tabs = document.querySelectorAll(".portal-tab");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle("active", tabs[i].getAttribute("data-auth-tab") === tab);
    }
    byId("portalLoginForm").hidden = tab !== "login";
    byId("portalRegisterForm").hidden = tab !== "register";
    setMsg(authMsg, "", "");
  }

  // ---------- auth actions ----------
  async function handleLogin(e) {
    e.preventDefault();
    var email = byId("loginEmail").value.trim();
    var pass = byId("loginPassword").value;
    setMsg(authMsg, "", "");
    if (!email || !pass) { setMsg(authMsg, "Please enter your email and password."); return; }
    if (!SB) { setMsg(authMsg, "Portal services are not configured yet. Please try again later."); return; }
    byId("loginBtn").disabled = true;
    byId("loginBtn").textContent = "Signing in…";
    var res = await SB.signIn(email, pass);
    byId("loginBtn").disabled = false;
    byId("loginBtn").textContent = "Login";
    if (!res.ok) {
      setMsg(authMsg, res.message || "Invalid email or password.");
      return;
    }
    session = { token: res.token, email: res.user.email, name: res.user.user_metadata && res.user.user_metadata.full_name, uid: res.user.id };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (err) { /* ignore */ }
    var p = getProfile();
    if (p && !p.fullname && session.name) { p.fullname = session.name; lsSet(PROFILE_KEY, p); }
    showDash("overview");
    syncAfterAuth();
  }

  async function handleRegister(e) {
    e.preventDefault();
    var fullname = byId("regFullname").value.trim();
    var email = byId("regEmail").value.trim();
    var phone = byId("regPhone").value.trim();
    var program = byId("regProgram").value;
    var intake = byId("regIntake").value;
    var pass = byId("regPassword").value;
    var pass2 = byId("regPassword2").value;
    setMsg(authMsg, "", "");
    if (!fullname || !email || !phone || !pass) { setMsg(authMsg, "Please fill in all the fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMsg(authMsg, "Please enter a valid email address."); return; }
    if (pass.length < 6) { setMsg(authMsg, "Password must be at least 6 characters."); return; }
    if (pass !== pass2) { setMsg(authMsg, "Passwords do not match."); return; }
    if (!SB) { setMsg(authMsg, "Portal services are not configured yet. Please try again later."); return; }
    byId("regBtn").disabled = true;
    byId("regBtn").textContent = "Creating account…";
    var res = await SB.signUp(email, pass);
    byId("regBtn").disabled = false;
    byId("regBtn").textContent = "Create Account";
    if (!res.ok) {
      setMsg(authMsg, res.message || "Sign-up failed. Please try again.");
      return;
    }
    // Save the profile so the dashboard is ready immediately.
    var p = defaultProfile(email);
    p.fullname = fullname; p.phone = phone; p.program = program; p.intake = intake;
    session = { token: "", email: email, name: fullname };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (err) { /* ignore */ }
    lsSet(PROFILE_KEY, p);
    // If email confirmation is required, sign-in will fail — tell the student.
    var si = await SB.signIn(email, pass);
    if (!si.ok) {
      setMsg(authMsg, "Account created! Check your email to confirm your address, then log in.");
      session = null;
      try { localStorage.removeItem(SESSION_KEY); } catch (err) { /* ignore */ }
      return;
    }
    session = { token: si.token, email: email, name: fullname, uid: si.user && si.user.id };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (err) { /* ignore */ }
    showDash("overview");
    syncAfterAuth();
  }

  function handleLogout() {
    session = null;
    try { localStorage.removeItem(SESSION_KEY); } catch (err) { /* ignore */ }
    showAuth("login");
  }

  // ---------- navigation ----------
  var SECTION_TITLES = {
    overview: "Dashboard", registration: "Course Registration", grades: "Grades & Transcripts",
    assignments: "Assignments & Exams", materials: "Learning Materials", profile: "Profile Management",
    fees: "Fee Payments", library: "Library Access", hostel: "Hostel / Accommodation",
    announcements: "Announcements & Notices", helpdesk: "Messaging / Help Desk", events: "Events Calendar",
    jobs: "Internship / Job Board", clubs: "Clubs & Societies", wellness: "Counseling & Wellness",
    feedback: "Feedback Forms"
  };
  function go(section) {
    currentSection = section;
    var items = document.querySelectorAll(".portal-nav-item");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle("active", items[i].getAttribute("data-section") === section);
    }
    byId("portalTopTitle").textContent = SECTION_TITLES[section] || "Dashboard";
    sidebar.classList.remove("open");
    var renderer = renderers[section] || renderers.overview;
    contentEl.innerHTML = renderer();
    contentEl.scrollTop = 0;
  }

  // ---------- shared render helpers ----------
  function pTable(headers, rows) {
    var h = headers.map(function (x) { return "<th>" + x + "</th>"; }).join("");
    var r = rows.map(function (row) { return "<tr>" + row.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("");
    return '<div class="p-table-wrap"><table class="p-table"><thead><tr>' + h + '</tr></thead><tbody>' + r + "</tbody></table></div>";
  }
  function badge(text, kind) {
    var k = kind || "blue";
    return '<span class="p-badge p-badge-' + k + '">' + esc(text) + "</span>";
  }
  function sectionIntro(title, sub) {
    return '<div class="p-section-head"><h2 class="p-section-title">' + esc(title) + '</h2><p class="p-section-sub">' + esc(sub) + "</p></div>";
  }
  function statTile(value, label, icon) {
    return '<div class="p-stat-tile"><div class="p-stat-ico">' + (icon || "📌") + '</div><div class="p-stat-value">' + value + '</div><div class="p-stat-label">' + esc(label) + "</div></div>";
  }
  function card(title, body) {
    return '<div class="p-card"><h3 class="p-card-title">' + esc(title) + "</h3>" + body + "</div>";
  }

  // ---------- section renderers ----------
  var renderers = {};

  renderers.overview = function () {
    var p = getProfile();
    var enrolled = enrolledCodes();
    var gpa = calcGPA();
    var outstanding = DATA.invoices.filter(function (i) { return i.status !== "Paid"; });
    var pending = DATA.assignments.filter(function (a) { return a.status !== "Submitted"; });
    var reqs = getRequests();
    var quick = [
      ["registration", "📚", "Course Registration"], ["grades", "📊", "My Grades"],
      ["fees", "💳", "Pay Fees"], ["library", "🔎", "Library"],
      ["events", "📅", "Events"], ["jobs", "💼", "Job Board"]
    ];
    return sectionIntro("Welcome back, " + (p.fullname || "Student") + " 👋",
      "Here is a snapshot of your academic life at Horizon Education Institute.")
      + '<div class="p-stat-grid">'
      + statTile(p.studentId, "Student ID", "🎓")
      + statTile(gpa, "Current GPA", "📊")
      + statTile(enrolled.length, "Enrolled Courses", "📚")
      + statTile(pending.length, "Pending Assignments", "📝")
      + '</div>'
      + '<div class="p-grid-2">'
      + card("Quick Actions",
        '<div class="p-quick-grid">' + quick.map(function (q) {
          return '<button class="p-quick-btn" data-action="goto" data-section="' + q[0] + '"><span class="p-quick-ico">' + q[1] + '</span>' + esc(q[2]) + "</button>";
        }).join("") + "</div>")
      + card("Latest Announcements",
        DATA.announcements.slice(0, 3).map(function (a) {
          return '<div class="p-announce-sm"><div class="p-announce-tag">' + badge(a.tag, "gold") + '</div><div class="p-announce-title">' + esc(a.title) + '</div><div class="p-announce-date">' + esc(a.date) + "</div></div>";
        }).join("")
        + '<button class="btn btn-outline-light-dark btn-sm mt-12" data-action="goto" data-section="announcements">View all announcements</button>')
      + "</div>"
      + card("Fee Summary", outstanding.length
        ? "<p>" + outstanding.length + " invoice(s) have an outstanding balance. <button class='btn btn-primary btn-sm' data-action='goto' data-section='fees'>Review fees</button></p>"
        : "<p>All your fees are fully paid. ✅</p>")
      + (reqs.length ? card("My Recent Requests", reqs.slice(-3).reverse().map(function (r) {
        return '<div class="p-req-row"><span class="p-req-ico">' + (r.type === "message" ? "💬" : r.type === "feedback" ? "📋" : r.type === "maintenance" ? "🔧" : r.type === "counseling" ? "🩺" : r.type === "assignment" ? "📤" : "✅") + '</span><span>' + esc(r.data.title || r.data.subject || r.data.reason || r.type) + '</span><span class="p-req-date">' + esc(r.date) + "</span></div>";
      }).join("")) : "");
  };

  // ----- Academic: Course Registration -----
  renderers.registration = function () {
    var enrolled = enrolledCodes();
    var rows = enrolled.map(function (code) {
      var c = findCourse(code);
      if (!c) return null;
      return [esc(c.code), esc(c.title), c.credits, esc(c.lecturer), esc(c.day) + " " + esc(c.time), badge("Enrolled", "green")];
    }).filter(Boolean);
    var catalog = DATA.courseCatalog.map(function (c) {
      var on = enrolled.indexOf(c.code) > -1;
      return '<label class="p-course' + (on ? " p-course-on" : "") + '">'
        + '<input type="checkbox" data-action="addDrop" data-code="' + esc(c.code) + '"' + (on ? " checked" : "") + ">"
        + '<span class="p-course-code">' + esc(c.code) + '</span>'
        + '<span class="p-course-title">' + esc(c.title) + '</span>'
        + '<span class="p-course-meta">' + c.credits + " credits · " + esc(c.school) + "</span>"
        + "</label>";
    }).join("");
    return sectionIntro("Course Registration", "Add or drop courses for the current semester and view your weekly timetable.")
      + card("My Timetable", renderTimetable(enrolled))
      + card("My Enrolled Courses (" + rows.length + ")", rows.length ? pTable(["Code", "Course", "Credits", "Lecturer", "Schedule", "Status"], rows) : "<p>You are not enrolled in any courses yet — add some below.</p>")
      + card("Course Catalog — click to add or drop", '<div class="p-catalog">' + catalog + "</div>");
  };

  function renderTimetable(codes) {
    var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    var grid = days.map(function (d) {
      var cells = codes.map(function (code) {
        var c = findCourse(code);
        return c && c.day === d ? '<div class="p-tt-item"><strong>' + esc(c.code) + "</strong><span>" + esc(c.time) + "</span><span>" + esc(c.room) + "</span></div>" : "";
      }).join("");
      return '<div class="p-tt-day"><div class="p-tt-label">' + d + "</div>" + (cells || '<div class="p-tt-none">—</div>') + "</div>";
    }).join("");
    return '<div class="p-timetable">' + grid + "</div>";
  }

  // ----- Academic: Grades & Transcripts -----
  var GRADE_POINTS = { "A": 4, "A-": 3.7, "B+": 3.3, "B": 3, "B-": 2.7, "C+": 2.3, "C": 2, "C-": 1.7, "D": 1, "F": 0 };
  function calcGPA() {
    var pts = 0, cr = 0;
    DATA.grades.forEach(function (g) {
      var p = GRADE_POINTS[g.grade] || 0;
      pts += p * g.credits; cr += g.credits;
    });
    return cr ? (pts / cr).toFixed(2) : "0.00";
  }
  function gradeBadge(g) {
    var k = g === "A" || g === "A-" ? "green" : g === "B+" || g === "B" ? "blue" : g === "B-" || g === "C+" ? "gold" : "red";
    return badge(g, k);
  }
  renderers.grades = function () {
    var p = getProfile();
    var gpa = calcGPA();
    var rows = DATA.grades.map(function (g) {
      return [esc(g.code), esc(g.title), g.credits, g.score + "%", gradeBadge(g.grade)];
    });
    var transcriptTxt = [
      "HORIZON EDUCATION INSTITUTE", "Plot 16-22, Eyoku Road, Soroti City West, Uganda",
      "STUDENT TRANSCRIPT", "",
      "Student: " + (p.fullname || ""), "Student ID: " + p.studentId, "Program: " + p.program,
      "Intake: " + p.intake, "Generated: " + today(), "",
      "Course".padEnd(14) + "Title".padEnd(40) + "Cr".padEnd(4) + "Score".padEnd(7) + "Grade"
    ];
    DATA.grades.forEach(function (g) {
      transcriptTxt.push(g.code.padEnd(14) + (g.title.slice(0, 36) || "").padEnd(40) + String(g.credits).padEnd(4) + (g.score + "%").padEnd(7) + g.grade);
    });
    transcriptTxt.push("", "Cumulative GPA: " + gpa, "", "Generated by the Horizon Education Institute Student Portal.");
    window.__transcriptText = transcriptTxt;
    return sectionIntro("Grades & Transcripts", "Your examination results, cumulative GPA, and official transcript.")
      + '<div class="p-stat-grid">'
      + statTile(gpa, "Cumulative GPA", "🎯")
      + statTile(DATA.grades.length, "Courses Completed", "📘")
      + statTile(Math.round(DATA.grades.reduce(function (s, g) { return s + g.credits; }, 0)), "Credit Hours", "⏱")
      + statTile("Distinction", "Classification Track", "🏅")
      + "</div>"
      + card("Semester Results", pTable(["Code", "Course", "Credits", "Score", "Grade"], rows))
      + card("Transcript",
        "<p>Download an official copy of your academic transcript for employers, scholarships, or transfer applications.</p>"
        + '<button class="btn btn-accent btn-sm" data-action="transcript">⬇ Download Transcript (.txt)</button>');
  };

  // ----- Academic: Assignments & Exams -----
  renderers.assignments = function () {
    var enrolled = enrolledCodes();
    var courseOpts = enrolled.map(function (code) {
      var c = findCourse(code);
      return c ? '<option value="' + esc(c.code) + '">' + esc(c.code + " — " + c.title) + "</option>" : "";
    }).join("");
    var uploads = getRequests().filter(function (r) { return r.type === "assignment"; });
    return sectionIntro("Assignments & Exams", "Track assignment deadlines, upload your work, and check the exam schedule.")
      + card("Assignment Deadlines", pTable(["Course", "Assignment", "Due Date", "Status"], DATA.assignments.map(function (a) {
        return [esc(a.course), esc(a.title), esc(a.due), a.status === "Submitted" ? badge("Submitted", "green") : badge("Pending", "gold")];
      })))
      + card("Upload Assignment",
        '<form data-form="assignment" class="p-form">'
        + '<div class="p-form-grid">'
        + '<div class="form-group"><label>Course</label><select name="course" required>' + courseOpts + "</select></div>"
        + '<div class="form-group"><label>Assignment</label><select name="title" required>' + DATA.assignments.map(function (a) { return '<option value="' + esc(a.title) + '">' + esc(a.title) + "</option>"; }).join("") + "</select></div>"
        + '<div class="form-group"><label>File</label><input type="file" name="file" required></div>'
        + "</div>"
        + '<button type="submit" class="btn btn-primary btn-sm">Upload Assignment</button>'
        + '<p class="p-form-msg"></p></form>'
        + (uploads.length ? "<h4 class='p-subhead'>My Uploads</h4>" + pTable(["Date", "Course", "Assignment", "File"], uploads.slice().reverse().map(function (u) { return [esc(u.date), esc(u.data.course), esc(u.data.title), esc(u.data.file)]; })) : ""))
      + card("Examination Schedule", pTable(["Date", "Time", "Paper", "Venue"], DATA.examSchedule.map(function (x) { return [esc(x.date), esc(x.time), esc(x.course), esc(x.room)]; })));
  };

  // ----- Academic: Learning Materials -----
  renderers.materials = function () {
    var icons = { "Lecture Notes": "📄", "e-Book": "📘", "Recorded Class": "🎬" };
    var groups = {};
    DATA.materials.forEach(function (m) {
      (groups[m.type] = groups[m.type] || []).push(m);
    });
    return sectionIntro("Learning Materials", "Lecture notes, e-books, and recorded classes for your courses.")
      + Object.keys(groups).map(function (type) {
        return card(icons[type] + " " + type, '<div class="p-materials">' + groups[type].map(function (m) {
          return '<div class="p-material"><div class="p-material-ico">' + (icons[type] || "📄") + '</div><div class="p-material-info"><div class="p-material-title">' + esc(m.title) + '</div><div class="p-material-meta">' + esc(m.course) + " · " + esc(m.size) + "</div></div>"
            + '<button class="btn btn-outline-light-dark btn-sm" data-action="download" data-item="' + esc(m.title) + '">Open</button></div>';
        }).join("") + "</div>");
      }).join("");
  };

  // ----- Admin: Profile Management -----
  renderers.profile = function () {
    var p = getProfile();
    return sectionIntro("Profile Management", "Keep your personal, contact, and emergency details up to date.")
      + '<div class="p-grid-2">'
      + card("Personal Details",
        '<form data-form="profile" class="p-form">'
        + '<div class="p-form-grid">'
        + '<div class="form-group"><label>Full name</label><input name="fullname" value="' + esc(p.fullname) + '" required></div>'
        + '<div class="form-group"><label>Email (login)</label><input value="' + esc(p.email) + '" disabled></div>'
        + '<div class="form-group"><label>Phone</label><input name="phone" value="' + esc(p.phone) + '" required></div>'
        + '<div class="form-group"><label>Date of birth</label><input name="dob" type="date" value="' + esc(p.dob) + '"></div>'
        + '<div class="form-group"><label>Gender</label><select name="gender"><option value="">Select…</option><option' + (p.gender === "Male" ? " selected" : "") + '>Male</option><option' + (p.gender === "Female" ? " selected" : "") + '>Female</option></select></div>'
        + '<div class="form-group"><label>Nationality</label><input name="nationality" value="' + esc(p.nationality) + '"></div>'
        + '<div class="form-group"><label>Program</label><select name="program">' + DATA.programs.map(function (pr) { return '<option' + (p.program === pr ? " selected" : "") + ">" + esc(pr) + "</option>"; }).join("") + "</select></div>"
        + '<div class="form-group"><label>Residential address</label><input name="address" value="' + esc(p.address) + '"></div>'
        + "</div>"
        + '<button type="submit" class="btn btn-primary btn-sm">Save Changes</button>'
        + '<p class="p-form-msg"></p></form>')
      + card("Emergency Contact",
        '<form data-form="emergency" class="p-form">'
        + '<div class="p-form-grid">'
        + '<div class="form-group"><label>Contact name</label><input name="emergencyName" value="' + esc(p.emergencyName) + '"></div>'
        + '<div class="form-group"><label>Relationship</label><input name="emergencyRelation" value="' + esc(p.emergencyRelation) + '"></div>'
        + '<div class="form-group"><label>Phone</label><input name="emergencyPhone" value="' + esc(p.emergencyPhone) + '"></div>'
        + "</div>"
        + '<button type="submit" class="btn btn-primary btn-sm">Save Emergency Contact</button>'
        + '<p class="p-form-msg"></p></form>')
      + "</div>"
      + card("Account Information",
        '<div class="p-info-grid">'
        + '<div><span class="p-info-label">Student ID</span><span class="p-info-value">' + esc(p.studentId) + "</span></div>"
        + '<div><span class="p-info-label">Registered</span><span class="p-info-value">' + esc(p.regDate) + "</span></div>"
        + '<div><span class="p-info-label">Intake</span><span class="p-info-value">' + esc(p.intake) + "</span></div>"
        + '<div><span class="p-info-label">Status</span><span class="p-info-value">' + badge("Active", "green") + "</span></div>"
        + "</div>");
  };

  // ----- Admin: Fee Payments -----
  renderers.fees = function () {
    var outstanding = DATA.invoices.filter(function (i) { return i.status !== "Paid"; });
    return sectionIntro("Fee Payments", "View your invoices, receipts, and payment options.")
      + (outstanding.length ? card("Balance Summary",
        '<div class="p-balance"><div class="p-balance-amount">' + esc(outstanding[outstanding.length - 1].amount) + '</div><div class="p-balance-label">Outstanding balance on ' + esc(outstanding.length) + " invoice(s)</div>"
        + '<button class="btn btn-accent btn-sm" data-action="pay">Pay Now — Mobile Money</button></div>') : "")
      + card("Invoices & Receipts", pTable(["Invoice", "Description", "Amount", "Paid", "Status", "Date"], DATA.invoices.map(function (i) {
        return [esc(i.id), esc(i.description), esc(i.amount), esc(i.paid), i.status === "Paid" ? badge("Paid", "green") : i.status === "Partially Paid" ? badge("Partially Paid", "gold") : badge("Outstanding", "red"), esc(i.date)];
      })))
      + card("Online Payment Options", '<div class="p-pay-grid">' + DATA.paymentMethods.map(function (m) {
        return '<div class="p-pay-card"><div class="p-pay-ico">' + m.icon + '</div><div class="p-pay-name">' + esc(m.name) + '</div><div class="p-pay-detail">' + esc(m.detail) + "</div></div>";
      }).join("") + "</div>");
  };

  // ----- Admin: Library Access -----
  renderers.library = function () {
    var books = DATA.library.map(function (b) {
      return '<div class="p-book"><div class="p-book-ico">📗</div><div class="p-book-info"><div class="p-book-title">' + esc(b.title) + '</div><div class="p-book-meta">' + esc(b.author) + " · " + esc(b.category) + "</div></div>"
        + (b.status === "Available" ? badge("Available", "green") : badge("Borrowed", "gold")) + "</div>";
    }).join("");
    return sectionIntro("Library Access", "Search the catalog, check borrow status, and browse e-resources.")
      + '<div class="p-search"><input type="search" id="pLibrarySearch" placeholder="Search books, authors, or categories…" class="form-input"><button class="btn btn-primary btn-sm" id="pLibrarySearchBtn">Search</button></div>'
      + '<div class="p-books" id="pLibraryBooks">' + books + "</div>"
      + card("Borrowed & Reserved", "<p>You currently have <strong>2</strong> books on loan: <em>Digital Marketing Handbook</em> (due Sep 08, 2026) and <em>Accounting Made Simple</em> (due Sep 12, 2026). Fines are UGX 1,000 per day after the due date.</p>");
  };

  // ----- Admin: Hostel / Accommodation -----
  renderers.hostel = function () {
    var h = DATA.hostel.allocation;
    var reqs = getRequests().filter(function (r) { return r.type === "maintenance"; });
    return sectionIntro("Hostel / Accommodation", "Your room allocation and maintenance requests.")
      + '<div class="p-grid-2">'
      + card("My Room Allocation",
        '<div class="p-room"><div class="p-room-block">' + esc(h.block) + "</div>"
        + '<div class="p-room-info">'
        + '<div class="p-room-no">Room ' + esc(h.room) + " · " + esc(h.type) + "</div>"
        + '<div class="p-room-meta">Bed: ' + esc(h.bed) + "</div>"
        + '<div class="p-room-meta">Warden: ' + esc(h.warden) + " (" + esc(h.contact) + ")</div>"
        + "</div></div>")
      + card("Raise a Maintenance Request",
        '<form data-form="maintenance" class="p-form">'
        + '<div class="form-group"><label>Issue type</label><select name="type"><option>Plumbing</option><option>Electrical</option><option>Furniture</option><option>Internet / Wi-Fi</option><option>Other</option></select></div>'
        + '<div class="form-group"><label>Describe the issue</label><textarea name="desc" rows="3" placeholder="e.g. Water tap in the bathroom is leaking…" required></textarea></div>'
        + '<button type="submit" class="btn btn-primary btn-sm">Submit Request</button>'
        + '<p class="p-form-msg"></p></form>')
      + "</div>"
      + (reqs.length ? card("My Maintenance Requests", pTable(["Date", "Type", "Issue", "Status"], reqs.slice().reverse().map(function (r) { return [esc(r.date), esc(r.data.type), esc(r.data.desc), badge("Received", "blue")]; }))) : "");
  };

  // ----- Comm: Announcements -----
  renderers.announcements = function () {
    return sectionIntro("Announcements & Notices", "Official updates from the faculty and administration.")
      + DATA.announcements.map(function (a) {
        return '<div class="p-announce">'
          + '<div class="p-announce-top">' + badge(a.tag, a.tag === "Exams" ? "red" : a.tag === "Fees" ? "gold" : "blue") + '<span class="p-announce-date">' + esc(a.date) + "</span></div>"
          + '<div class="p-announce-title">' + esc(a.title) + '</div>'
          + '<p class="p-announce-body">' + esc(a.body) + "</p></div>";
      }).join("");
  };

  // ----- Comm: Messaging / Help Desk -----
  renderers.helpdesk = function () {
    var msgs = getRequests().filter(function (r) { return r.type === "message"; });
    var contactRows = DATA.staffContacts.map(function (c) {
      return [esc(c.name), esc(c.role), esc(c.dept), esc(c.email), esc(c.phone)];
    });
    return sectionIntro("Messaging / Help Desk", "Contact lecturers, staff, or IT support — we respond within 1 working day.")
      + card("Send a Message",
        '<form data-form="message" class="p-form">'
        + '<div class="p-form-grid">'
        + '<div class="form-group"><label>To (staff)</label><select name="to">' + DATA.staffContacts.map(function (c) { return '<option value="' + esc(c.name + " — " + c.role) + '">' + esc(c.name + " — " + c.role) + "</option>"; }).join("") + "</select></div>"
        + '<div class="form-group"><label>Subject</label><input name="subject" placeholder="e.g. Question about assignment 2" required></div>'
        + "</div>"
        + '<div class="form-group"><label>Message</label><textarea name="message" rows="3" required></textarea></div>'
        + '<button type="submit" class="btn btn-primary btn-sm">Send Message</button>'
        + '<p class="p-form-msg"></p></form>')
      + card("Staff Directory", pTable(["Name", "Role", "Department", "Email", "Phone"], contactRows))
      + (msgs.length ? card("My Messages", pTable(["Date", "To", "Subject"], msgs.slice().reverse().map(function (m) { return [esc(m.date), esc(m.data.to), esc(m.data.subject)]; }))) : "");
  };

  // ----- Comm: Events Calendar -----
  renderers.events = function () {
    return sectionIntro("Events Calendar", "Academic calendar, extracurricular activities, and deadlines.")
      + '<div class="p-events">' + DATA.events.map(function (ev) {
        return '<div class="p-event"><div class="p-event-date"><span class="p-event-month">' + esc(ev.date.split(" ")[0].slice(0, 3)) + '</span><span class="p-event-day">' + esc(ev.date.split(" ")[1].replace(",", "")) + "</span></div>"
          + '<div class="p-event-info"><div class="p-event-title">' + esc(ev.title) + '</div><div class="p-event-meta">' + esc(ev.date) + " · " + esc(ev.time) + " · " + esc(ev.venue) + "</div></div>"
          + badge(ev.type, ev.type === "Exams" ? "red" : ev.type === "Sports" ? "green" : "blue") + "</div>";
      }).join("") + "</div>";
  };

  // ----- Extras: Internship / Job Board -----
  renderers.jobs = function () {
    var applied = getRequests().filter(function (r) { return r.type === "jobApp"; }).map(function (r) { return r.data.title; });
    return sectionIntro("Internship / Job Board", "Opportunities posted by the institution and partner employers.")
      + '<div class="p-jobs">' + DATA.jobs.map(function (j) {
        var isApplied = applied.indexOf(j.title) > -1;
        return '<div class="p-job"><div class="p-job-head"><div class="p-job-title">' + esc(j.title) + '</div>' + badge(j.type, j.type === "Internship" ? "green" : j.type === "Graduate" ? "blue" : "gold") + "</div>"
          + '<div class="p-job-meta">' + esc(j.org) + " · " + esc(j.location) + '</div>'
          + '<div class="p-job-foot"><span class="p-job-deadline">Deadline: ' + esc(j.deadline) + "</span>"
          + (isApplied ? badge("Applied ✓", "green") : '<button class="btn btn-primary btn-sm" data-action="applyJob" data-title="' + esc(j.title) + '" data-org="' + esc(j.org) + '">Apply</button>')
          + "</div></div>";
      }).join("") + "</div>";
  };

  // ----- Extras: Clubs & Societies -----
  renderers.clubs = function () {
    var joined = getRequests().filter(function (r) { return r.type === "club"; }).map(function (r) { return r.data.name; });
    return sectionIntro("Clubs & Societies", "Join student groups and track their activities.")
      + '<div class="p-clubs">' + DATA.clubs.map(function (c) {
        var isJoined = joined.indexOf(c.name) > -1;
        return '<div class="p-club"><div class="p-club-head"><div class="p-club-name">' + esc(c.name) + '</div>' + (isJoined ? badge("Member ✓", "green") : "") + "</div>"
          + '<div class="p-club-meta">' + esc(c.focus) + " · " + c.members + " members</div>"
          + '<div class="p-club-activity">' + esc(c.activity) + "</div>"
          + (isJoined ? "" : '<button class="btn btn-primary btn-sm" data-action="joinClub" data-name="' + esc(c.name) + '">Join Club</button>')
          + "</div>";
      }).join("") + "</div>";
  };

  // ----- Extras: Counseling & Wellness -----
  renderers.wellness = function () {
    var apps = getRequests().filter(function (r) { return r.type === "counseling"; });
    return sectionIntro("Counseling & Wellness", "Book confidential appointments and access wellbeing resources.")
      + '<div class="p-grid-2">'
      + card("Book an Appointment",
        '<form data-form="counseling" class="p-form">'
        + '<div class="p-form-grid">'
        + '<div class="form-group"><label>Date</label><input type="date" name="date" required></div>'
        + '<div class="form-group"><label>Time</label><select name="time"><option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>2:00 PM</option><option>3:00 PM</option></select></div>'
        + "</div>"
        + '<div class="form-group"><label>Reason (optional)</label><textarea name="reason" rows="2" placeholder="What would you like to discuss?"></textarea></div>'
        + '<button type="submit" class="btn btn-primary btn-sm">Book Appointment</button>'
        + '<p class="p-form-msg"></p></form>')
      + card("Wellness Resources", '<div class="p-wellness">' + DATA.wellnessResources.map(function (w) {
        return '<div class="p-wellness-item"><div class="p-wellness-title">' + esc(w.title) + '</div><p class="p-wellness-desc">' + esc(w.desc) + "</p></div>";
      }).join("") + "</div>")
      + "</div>"
      + (apps.length ? card("My Appointments", pTable(["Date", "Time", "Reason"], apps.slice().reverse().map(function (a) { return [esc(a.date), esc(a.data.time), esc(a.data.reason || "—")]; }))) : "");
  };

  // ----- Extras: Feedback Forms -----
  renderers.feedback = function () {
    var feedback = getRequests().filter(function (r) { return r.type === "feedback"; });
    var courseOpts = DATA.courseCatalog.map(function (c) { return '<option>' + esc(c.code + " — " + c.title) + "</option>"; }).join("");
    return sectionIntro("Feedback Forms", "Submit course or lecturer evaluations — your feedback is anonymous.")
      + card("Course / Lecturer Evaluation",
        '<form data-form="feedback" class="p-form">'
        + '<div class="p-form-grid">'
        + '<div class="form-group"><label>Course</label><select name="course">' + courseOpts + "</select></div>"
        + '<div class="form-group"><label>Overall rating</label><select name="rating"><option value="5">★★★★★ Excellent</option><option value="4">★★★★☆ Good</option><option value="3">★★★☆☆ Average</option><option value="2">★★☆☆☆ Fair</option><option value="1">★☆☆☆☆ Poor</option></select></div>'
        + "</div>"
        + '<div class="form-group"><label>Your comments</label><textarea name="comment" rows="3" placeholder="What went well and what could be improved?" required></textarea></div>'
        + '<button type="submit" class="btn btn-primary btn-sm">Submit Feedback</button>'
        + '<p class="p-form-msg"></p></form>')
      + (feedback.length ? card("My Submissions", pTable(["Date", "Course", "Rating", "Comment"], feedback.slice().reverse().map(function (f) { return [esc(f.date), esc(f.data.course), f.data.rating + "/5", esc(f.data.comment)]; }))) : "");
  };

  // ---------- data helpers ----------
  function findCourse(code) {
    for (var i = 0; i < DATA.courseCatalog.length; i++) {
      if (DATA.courseCatalog[i].code === code) return DATA.courseCatalog[i];
    }
    return null;
  }

  // ---------- event delegation (dashboard) ----------
  contentEl.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]");
    if (!t) return;
    var action = t.getAttribute("data-action");
    if (action === "goto") { go(t.getAttribute("data-section")); return; }
    if (action === "addDrop") {
      var code = t.getAttribute("data-code");
      var codes = enrolledCodes();
      var idx = codes.indexOf(code);
      if (t.checked && idx === -1) codes.push(code);
      if (!t.checked && idx > -1) codes.splice(idx, 1);
      setEnrolled(codes);
      go("registration");
      return;
    }
    if (action === "transcript") {
      downloadTranscript();
      return;
    }
    if (action === "download") {
      flashAction(t, "Opening…");
      return;
    }
    if (action === "pay") {
      flashAction(t, "Redirecting to payment…");
      return;
    }
    if (action === "applyJob") {
      addRequest("jobApp", { title: t.getAttribute("data-title"), org: t.getAttribute("data-org") });
      go("jobs");
      return;
    }
    if (action === "joinClub") {
      addRequest("club", { name: t.getAttribute("data-name") });
      go("clubs");
      return;
    }
  });

  contentEl.addEventListener("submit", function (e) {
    var form = e.target.closest("form[data-form]");
    if (!form) return;
    e.preventDefault();
    var kind = form.getAttribute("data-form");
    var fd = new FormData(form);
    var msgEl = form.querySelector(".p-form-msg");
    var ok = "Saved to your portal. ✅";
    if (kind === "profile") {
      saveProfile({
        fullname: fd.get("fullname"), phone: fd.get("phone"), dob: fd.get("dob"),
        gender: fd.get("gender"), nationality: fd.get("nationality"),
        program: fd.get("program"), address: fd.get("address")
      });
      byId("portalSideName").textContent = fd.get("fullname");
      byId("portalTopName").textContent = fd.get("fullname");
      syncProfileUp(); // persist the change to Supabase (secured)
    } else if (kind === "emergency") {
      saveProfile({
        emergencyName: fd.get("emergencyName"), emergencyRelation: fd.get("emergencyRelation"), emergencyPhone: fd.get("emergencyPhone")
      });
      syncProfileUp();
    } else if (kind === "assignment") {
      var file = fd.get("file");
      if (!file || !file.name) { setMsg(msgEl, "Please choose a file to upload."); return; }
      addRequest("assignment", { course: fd.get("course"), title: fd.get("title"), file: file.name });
      ok = "Assignment uploaded successfully. 📤";
    } else if (kind === "maintenance") {
      addRequest("maintenance", { type: fd.get("type"), desc: fd.get("desc") });
    } else if (kind === "message") {
      addRequest("message", { to: fd.get("to"), subject: fd.get("subject"), message: fd.get("message") });
      ok = "Message sent to " + fd.get("to") + ". 💬";
    } else if (kind === "counseling") {
      addRequest("counseling", { date: fd.get("date"), time: fd.get("time"), reason: fd.get("reason") });
      ok = "Appointment booked for " + fd.get("date") + " at " + fd.get("time") + ". 🩺";
    } else if (kind === "feedback") {
      addRequest("feedback", { course: fd.get("course"), rating: fd.get("rating"), comment: fd.get("comment") });
      ok = "Thank you! Your feedback has been submitted. 📋";
    }
    setMsg(msgEl, ok, "#1e7e34");
    form.reset();
    setTimeout(function () { go(currentSection); }, 900);
  });

  function flashAction(btn, text) {
    var old = btn.textContent;
    btn.textContent = text;
    btn.disabled = true;
    setTimeout(function () { btn.textContent = old; btn.disabled = false; }, 1500);
  }

  function downloadTranscript() {
    var txt = window.__transcriptText;
    if (!txt) return;
    var blob = new Blob([txt.join("\n")], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Transcript_" + (getProfile().studentId || "Student") + ".txt";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  // ---------- library search ----------
  contentEl.addEventListener("click", function (e) {
    if (e.target.id === "pLibrarySearchBtn" || e.target.closest("#pLibrarySearchBtn")) { filterBooks(); }
  });
  contentEl.addEventListener("keyup", function (e) {
    if (e.target.id === "pLibrarySearch") { filterBooks(); }
  });
  function filterBooks() {
    var input = byId("pLibrarySearch");
    var box = byId("pLibraryBooks");
    if (!input || !box) return;
    var q = input.value.trim().toLowerCase();
    var cards = box.querySelectorAll(".p-book");
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.display = !q || cards[i].textContent.toLowerCase().indexOf(q) > -1 ? "" : "none";
    }
  }

  // ---------- tabs & sidebar nav ----------
  document.addEventListener("click", function (e) {
    var tab = e.target.closest(".portal-tab");
    if (tab) { setAuthTab(tab.getAttribute("data-auth-tab")); return; }
    var item = e.target.closest(".portal-nav-item");
    if (item) go(item.getAttribute("data-section"));
  });

  // ---------- forms & init ----------
  byId("portalLoginForm").addEventListener("submit", handleLogin);
  byId("portalRegisterForm").addEventListener("submit", handleRegister);
  byId("portalLogout").addEventListener("click", handleLogout);
  byId("portalMenuBtn").addEventListener("click", function () {
    sidebar.classList.toggle("open");
  });

  // populate register selects
  (function () {
    var prog = byId("regProgram");
    DATA.programs.forEach(function (p) {
      var o = document.createElement("option");
      o.textContent = p; prog.appendChild(o);
    });
    var intake = byId("regIntake");
    DATA.intakes.forEach(function (i) {
      var o = document.createElement("option");
      o.textContent = i; intake.appendChild(o);
    });
  })();

  (function init() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (raw) session = JSON.parse(raw);
    } catch (err) { session = null; }
    if (session && session.email) showDash("overview");
    else showAuth("login");
  })();
})();
