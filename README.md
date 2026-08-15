# Horizon Education Institute

Official website for **Horizon Education Institute**, Soroti City West, Uganda — a premier institution offering certificate, diploma, and short courses in ICT, business, media, technical trades, and more.

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| About Us | `about.html` |
| Academics / Programs | `programs.html` |
| Admissions | `admissions.html` |
| Apply Now | `apply-now.html` |
| Campus Life | `campus-life.html` |
| Contact | `contact.html` |
| Academic Calendar | `academic-calendar.html` |
| Digital Library | `Library.html` |
| Student Library | `Student-Library.html` |
| Student Portal | `student_portal.html` (register → login → full dashboard) |

## Run locally

Open `index.html` in any browser, or serve the folder with a simple static server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Then visit `http://localhost:8000`.

## Technologies

- Plain **HTML5** markup
- **CSS3** with a responsive layout (mobile-first navigation, fluid grids)
- **Vanilla JavaScript** (hero slider, mobile menu, search, student portal, Supabase forms)

No build step or package manager required.

> **Note:** The Digital Library pages link to PDFs under `books/`. Drop your actual course materials into that folder to make the download buttons work.
