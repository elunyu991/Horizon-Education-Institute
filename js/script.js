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

// Generic form handling (contact / apply pages)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form");
  // Skip the student-portal login form — it has its own handler below
  if (form && form.id !== "loginForm") {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Your submission has been received successfully!");
      form.reset();
    });
  }
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
