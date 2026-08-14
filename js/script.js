// Hero slider fade
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

// Announcement bar toggle
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

// Placeholder JS for future interactivity
// Example: simple form submission alert
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Your message has been sent!");
    });
  }
});


// Simple form submission alert
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Your application has been submitted!");
    });
  }
});



// Placeholder JS for admissions page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Admissions page loaded successfully.");
});


// Placeholder JS for About page
document.addEventListener("DOMContentLoaded", () => {
  console.log("About page loaded successfully.");
});


// Placeholder JS for Programs page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Programs page loaded successfully.");
});

// =======================
// Student Portal Logic
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("studentID").value;
      const pass = document.getElementById("password").value;
      const message = document.getElementById("loginMessage");

      if (id === "student123" && pass === "portal2026") {
        message.textContent = "Login successful! Redirecting...";
        message.style.color = "green";
        setTimeout(() => window.location.href = "dashboard.html", 1500);
      } else {
        message.textContent = "Invalid ID or password.";
        message.style.color = "red";
      }
    });
  }
});

// =======================
// Library Search Logic
// =======================
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
