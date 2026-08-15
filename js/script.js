// ==========================================================
// Horizon Education Institute — global site scripts
// ==========================================================

// Hero slider fade (homepage)
(function () {
  const slides = document.querySelectorAll('.hero-slider .slide');
  if (!slides.length) return;

  let current = 0;
  slides.forEach((s, i) => s.classList.toggle('opacity-100', i === 0));
  slides.forEach((s, i) => s.classList.toggle('opacity-0', i !== 0));

  setInterval(() => {
    slides[current].classList.remove('opacity-100');
    slides[current].classList.add('opacity-0');

    current = (current + 1) % slides.length;

    slides[current].classList.remove('opacity-0');
    slides[current].classList.add('opacity-100');
  }, 5000);
})();

// Announcement bar toggle (homepage)
(function () {
  const announcement = document.getElementById('announcement');
  if (!announcement) return;

  let visible = true;
  setInterval(() => {
    visible = !visible;
    if (visible) {
      announcement.classList.add('opacity-100');
      announcement.classList.remove('opacity-0');
    } else {
      announcement.classList.add('opacity-0');
      announcement.classList.remove('opacity-100');
    }
  }, 4000);
})();

// Mobile navigation toggle (all pages)
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.querySelector(".nav-links");
  if (!menuBtn || !navLinks) return;

  menuBtn.setAttribute("aria-expanded", "false");

  const close = () => {
    navLinks.classList.remove("open");
    menuBtn.textContent = "☰";
    menuBtn.setAttribute("aria-expanded", "false");
  };

  menuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuBtn.textContent = isOpen ? "✕" : "☰";
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close the menu after choosing a destination
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
});

// Generic form handling (contact / apply pages) → saved to Supabase.
// Forms carry a data-table attribute telling us where to store the row.
document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form.form[data-table]");
  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalBtn = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Submitting…";
      }

      const payload = {};
      new FormData(form).forEach((value, key) => { payload[key] = value; });
      // created_at is set by the database (default now()) — no need to send it.

      const table = form.getAttribute("data-table");
      const result = window.HorizonSupabase
        ? await window.HorizonSupabase.submit(table, payload)
        : { ok: false, message: "Storage script failed to load. Please refresh and try again." };

      if (btn) {
        btn.disabled = false;
        btn.textContent = originalBtn;
      }

      const status = document.getElementById("formStatus");
      if (result.ok) {
        form.reset();
        if (status) {
          status.textContent = "✔ Your submission has been received successfully. We will be in touch soon!";
          status.style.color = "green";
        } else {
          alert("Your submission has been received successfully!");
        }
      } else {
        if (status) {
          status.textContent = "⚠ " + result.message;
          status.style.color = "#c62828";
        } else {
          alert(result.message);
        }
      }
    });
  });
});

// Student Portal login (demo credentials: student123 / portal2026)
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("studentID").value;
      const pass = document.getElementById("password").value;
      const message = document.getElementById("loginMessage");

      if (id === "student123" && pass === "portal2026") {
        message.textContent = "Login successful! Welcome back, student.";
        message.style.color = "green";
        loginForm.reset();
      } else {
        message.textContent = "Invalid ID or password.";
        message.style.color = "red";
      }
    });
  }
});

// Digital Library search (Library.html)
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const resultsList = document.getElementById("resultsList");

  if (searchInput && resultsList) {
    const resources = [
      "Introduction to Computer Science - eBook",
      "Leadership Development Journal - PDF",
      "Entrepreneurship in Africa - Article",
      "Advanced Web Design - eBook",
      "Faith-Based Leadership - Journal"
    ];

    window.searchLibrary = function () {
      const query = searchInput.value.toLowerCase();
      const results = resources.filter(item => item.toLowerCase().includes(query));
      resultsList.innerHTML = "";

      if (results.length > 0) {
        results.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          resultsList.appendChild(li);
        });
      } else {
        resultsList.innerHTML = "<li>No results found.</li>";
      }
    };
  }
});

// ==========================================================
// Bring the site to life — scroll reveal, animated counters,
// and a back-to-top button. Safe no-ops when elements are
// missing (every feature degrades gracefully).
// ==========================================================

// Scroll-reveal on page sections & cards
document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll(
    ".section-white, .section-light, .program-card, .feature-card, .card, .card-light, .quick-link, .gallery-card, .event-card, .dates-card, .admissions-right, .requirements-list, .apply-steps, .stats-band"
  );
  if (!targets.length) return;
  if (!("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
  );

  targets.forEach((el) => el.classList.add("reveal"));
  targets.forEach((el) => io.observe(el));
});

// Animated stat counters (uses data-count on .stat-value)
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".stat-value[data-count]");
  if (!counters.length) return;
  if (!("IntersectionObserver" in window)) return;

  const animate = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => io.observe(el));
});

// Back-to-top floating button
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "&uarr;";
  document.body.appendChild(btn);

  const onScroll = () => {
    btn.classList.toggle("visible", window.scrollY > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
