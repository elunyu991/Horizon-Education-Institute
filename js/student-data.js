// ============================================================
// Horizon Education Institute — Student Portal sample data
// This file feeds every section of the student dashboard.
// Personalised values (student name, enrolled courses, etc.)
// come from the student's profile in localStorage.
// ============================================================
window.STUDENT_DATA = {
  programs: [
    "Diploma in Information Technology",
    "Diploma in Business Administration",
    "Certificate in Computer Science",
    "Diploma in Journalism & Media Studies",
    "Certificate in Secretarial Studies",
    "Certificate in Accounting & Finance",
    "Diploma in Education",
    "Professional Certificate in Web Development"
  ],
  intakes: ["August 2026", "March/April 2027"],

  // ----- Academic Information -----
  courseCatalog: [
    { code: "ICT 1101", title: "Introduction to Computing", credits: 4, school: "ICT & Computing", lecturer: "Mr. Okello James", day: "Monday", time: "8:00 - 10:00 AM", room: "Lab 1", semester: 1 },
    { code: "ICT 1102", title: "Computer Applications & Office Tools", credits: 3, school: "ICT & Computing", lecturer: "Ms. Auma Grace", day: "Wednesday", time: "2:00 - 4:00 PM", room: "Lab 2", semester: 1 },
    { code: "ICT 1103", title: "Web Design & Development Fundamentals", credits: 4, school: "ICT & Computing", lecturer: "Mr. Ocen Daniel", day: "Friday", time: "9:00 - 11:00 AM", room: "Lab 3", semester: 1 },
    { code: "BUS 1101", title: "Principles of Management", credits: 3, school: "Business & Management", lecturer: "Dr. Amongi Sarah", day: "Tuesday", time: "11:00 AM - 1:00 PM", room: "Room 4", semester: 1 },
    { code: "BUS 1102", title: "Business Communication Skills", credits: 3, school: "Business & Management", lecturer: "Ms. Adongo Betty", day: "Thursday", time: "10:00 AM - 12:00 PM", room: "Room 5", semester: 1 },
    { code: "MED 1101", title: "Media Ethics & Law", credits: 3, school: "Media & Communication", lecturer: "Mr. Elungat David", day: "Monday", time: "2:00 - 4:00 PM", room: "Room 6", semester: 1 },
    { code: "MED 1102", title: "News Writing & Reporting", credits: 4, school: "Media & Communication", lecturer: "Ms. Namutebi Joan", day: "Wednesday", time: "8:00 - 10:00 AM", room: "Studio A", semester: 1 },
    { code: "EDU 1101", title: "Foundations of Education", credits: 3, school: "Education", lecturer: "Mr. Odongo Peter", day: "Tuesday", time: "2:00 - 4:00 PM", room: "Room 7", semester: 1 },
    { code: "SEC 1101", title: "Office Administration & Procedures", credits: 3, school: "Business & Management", lecturer: "Ms. Acio Ruth", day: "Thursday", time: "2:00 - 4:00 PM", room: "Room 8", semester: 1 },
    { code: "ACC 1101", title: "Introduction to Accounting", credits: 4, school: "Business & Management", lecturer: "Mr. Mukasa Robert", day: "Friday", time: "2:00 - 4:00 PM", room: "Room 9", semester: 1 },
    { code: "ICT 1201", title: "Database Management Systems", credits: 4, school: "ICT & Computing", lecturer: "Mr. Okello James", day: "Tuesday", time: "8:00 - 10:00 AM", room: "Lab 1", semester: 2 },
    { code: "ICT 1202", title: "Networking Essentials", credits: 4, school: "ICT & Computing", lecturer: "Mr. Ocen Daniel", day: "Thursday", time: "8:00 - 10:00 AM", room: "Lab 2", semester: 2 },
    { code: "BUS 1201", title: "Entrepreneurship & Innovation", credits: 3, school: "Business & Management", lecturer: "Dr. Amongi Sarah", day: "Wednesday", time: "11:00 AM - 1:00 PM", room: "Room 4", semester: 2 },
    { code: "MED 1201", title: "Multimedia Production", credits: 4, school: "Media & Communication", lecturer: "Ms. Namutebi Joan", day: "Monday", time: "11:00 AM - 1:00 PM", room: "Studio A", semester: 2 }
  ],

  grades: [
    { code: "ICT 1101", title: "Introduction to Computing", credits: 4, score: 82, grade: "A" },
    { code: "ICT 1102", title: "Computer Applications & Office Tools", credits: 3, score: 74, grade: "B+" },
    { code: "BUS 1101", title: "Principles of Management", credits: 3, score: 68, grade: "B" },
    { code: "BUS 1102", title: "Business Communication Skills", credits: 3, score: 71, grade: "B+" },
    { code: "MED 1101", title: "Media Ethics & Law", credits: 3, score: 65, grade: "B" },
    { code: "SEC 1101", title: "Office Administration & Procedures", credits: 3, score: 78, grade: "A-" }
  ],

  assignments: [
    { course: "ICT 1101", title: "Assignment 2 — Computer Systems Report", due: "Aug 25, 2026", status: "Pending" },
    { course: "ICT 1103", title: "Website Project — Phase 1", due: "Sep 02, 2026", status: "Pending" },
    { course: "BUS 1101", title: "Group Case Study — Management Styles", due: "Aug 20, 2026", status: "Submitted" },
    { course: "MED 1101", title: "News Article — 800 Words", due: "Aug 28, 2026", status: "Pending" },
    { course: "ACC 1101", title: "Trial Balance Exercise", due: "Sep 05, 2026", status: "Pending" }
  ],

  examSchedule: [
    { date: "Nov 30, 2026", time: "9:00 AM - 12:00 PM", course: "ICT 1101 — Introduction to Computing", room: "Hall A" },
    { date: "Dec 01, 2026", time: "9:00 AM - 12:00 PM", course: "BUS 1101 — Principles of Management", room: "Hall B" },
    { date: "Dec 02, 2026", time: "2:00 PM - 5:00 PM", course: "ICT 1102 — Computer Applications", room: "Lab 2" },
    { date: "Dec 03, 2026", time: "9:00 AM - 12:00 PM", course: "MED 1101 — Media Ethics & Law", room: "Hall A" },
    { date: "Dec 04, 2026", time: "2:00 PM - 5:00 PM", course: "ACC 1101 — Introduction to Accounting", room: "Hall B" }
  ],

  materials: [
    { type: "Lecture Notes", title: "Introduction to Computing — Week 1-4 Notes", course: "ICT 1101", size: "1.2 MB" },
    { type: "e-Book", title: "Digital Literacy for Beginners", course: "ICT 1102", size: "4.8 MB" },
    { type: "Recorded Class", title: "Management Principles — Lecture 3 Video", course: "BUS 1101", size: "Video · 45 min" },
    { type: "Lecture Notes", title: "Media Law — Handout", course: "MED 1101", size: "860 KB" },
    { type: "e-Book", title: "Introduction to Accounting — Full Text", course: "ACC 1101", size: "6.1 MB" },
    { type: "Recorded Class", title: "News Writing Workshop Recording", course: "MED 1102", size: "Video · 58 min" }
  ],

  // ----- Administrative Services -----
  invoices: [
    { id: "INV-2026-0142", description: "Tuition Fee — Semester 1", amount: "UGX 950,000", paid: "UGX 950,000", status: "Paid", date: "Jul 15, 2026" },
    { id: "INV-2026-0143", description: "Functional & ICT Fees — Semester 1", amount: "UGX 120,000", paid: "UGX 120,000", status: "Paid", date: "Jul 15, 2026" },
    { id: "INV-2026-0187", description: "Tuition Fee — Semester 2 (installment 1 of 2)", amount: "UGX 500,000", paid: "UGX 200,000", status: "Partially Paid", date: "Jan 10, 2027" },
    { id: "INV-2026-0190", description: "Hostel Fee — Semester 2", amount: "UGX 350,000", paid: "—", status: "Outstanding", date: "Jan 12, 2027" }
  ],
  paymentMethods: [
    { name: "Mobile Money (MTN/Airtel)", detail: "Pay via USSD or the institution's MoMo number", icon: "📱" },
    { name: "Bank Transfer", detail: "Equity Bank — Account 0104 3200 5661 2", icon: "🏦" },
    { name: "Pay at Campus", detail: "Accounts Office, Main Block, 8:00 AM - 4:30 PM", icon: "🏫" }
  ],

  library: [
    { title: "Introduction to Algorithms", author: "Cormen et al.", category: "Computer Science", status: "Available" },
    { title: "Principles of Management", author: "Stephen P. Robbins", category: "Business", status: "Available" },
    { title: "Digital Marketing Handbook", author: "D. Chaffey", category: "Business", status: "Borrowed" },
    { title: "News Reporting & Writing", author: "M. Mencher", category: "Media", status: "Available" },
    { title: "Accounting Made Simple", author: "M. Piper", category: "Finance", status: "Borrowed" },
    { title: "Computer Networking: A Top-Down Approach", author: "Kurose & Ross", category: "Computer Science", status: "Available" },
    { title: "Effective Study Skills", author: "G. McPherson", category: "General", status: "Available" },
    { title: "Journalism Ethics", author: "E. Lambeth", category: "Media", status: "Available" }
  ],

  hostel: {
    allocation: { block: "Block B", room: "B-214", type: "Shared (2 per room)", bed: "Bed 1", warden: "Ms. Achen Gladys", contact: "+256 772 123 456" }
  },

  // ----- Communication & Support -----
  announcements: [
    { tag: "Exams", date: "Aug 14, 2026", title: "Semester 1 Exam Timetable Released", body: "The end-of-semester examination timetable is now available under Assignments & Exams. Verify your papers, dates, and rooms, and report any clashes to the Academic Registrar by Friday." },
    { tag: "Fees", date: "Aug 10, 2026", title: "Semester 2 Fee Deadline", body: "The first installment for Semester 2 fees is due by January 10, 2027. Late payment attracts a UGX 20,000 penalty. Pay via Mobile Money or at the Accounts Office." },
    { tag: "Events", date: "Aug 06, 2026", title: "Orientation Week — September 15-19", body: "All continuing and new students are expected to attend orientation week activities including the campus tour, clubs fair, and academic advising sessions." },
    { tag: "ICT", date: "Jul 30, 2026", title: "Student Portal Maintenance", body: "The student portal will be offline on Saturday from 2:00 AM to 4:00 AM for scheduled maintenance. Plan your course registration accordingly." },
    { tag: "Library", date: "Jul 25, 2026", title: "Library Extended Hours During Exams", body: "The library will remain open until 10:00 PM on weekdays and 6:00 PM on weekends starting from November 20 to support exam revision." }
  ],

  staffContacts: [
    { name: "Mr. Opio Samuel", role: "Academic Registrar", dept: "Academic Affairs", email: "registrar@horizon.ac.ug", phone: "+256 772 100 001" },
    { name: "Ms. Auma Grace", role: "Lecturer — ICT", dept: "ICT & Computing", email: "g.auma@horizon.ac.ug", phone: "+256 772 100 002" },
    { name: "Mr. Ocen Daniel", role: "Lecturer — Web Development", dept: "ICT & Computing", email: "d.ocen@horizon.ac.ug", phone: "+256 772 100 003" },
    { name: "Mrs. Alupo Sarah", role: "Bursar", dept: "Finance", email: "finance@horizon.ac.ug", phone: "+256 772 100 004" },
    { name: "Mr. Egesa Brian", role: "IT Support", dept: "ICT Help Desk", email: "helpdesk@horizon.ac.ug", phone: "+256 772 100 005" },
    { name: "Ms. Apio Esther", role: "Librarian", dept: "Library", email: "library@horizon.ac.ug", phone: "+256 772 100 006" }
  ],

  events: [
    { date: "Sep 15, 2026", time: "8:00 AM", title: "Orientation Week Kick-off", venue: "Main Hall", type: "Academic" },
    { date: "Sep 22, 2026", time: "8:00 AM", title: "First Day of Classes — Semester 1", venue: "Campus", type: "Academic" },
    { date: "Oct 02, 2026", time: "4:00 PM", title: "Inter-Hall Sports Gala", venue: "Playgrounds", type: "Sports" },
    { date: "Oct 16, 2026", time: "2:00 PM", title: "Career & Internship Fair", venue: "Main Hall", type: "Career" },
    { date: "Nov 30, 2026", time: "9:00 AM", title: "Semester 1 Examinations Begin", venue: "Various Halls", type: "Exams" },
    { date: "Dec 11, 2026", time: "6:00 PM", title: "End of Year Students' Dinner", venue: "Campus Grounds", type: "Social" }
  ],

  // ----- Extras -----
  jobs: [
    { title: "Junior Web Developer (Internship)", org: "Soroti Tech Hub", location: "Soroti", deadline: "Aug 30, 2026", type: "Internship" },
    { title: "IT Support Assistant", org: "Horizon Education Institute", location: "Soroti", deadline: "Sep 05, 2026", type: "Part-time" },
    { title: "Radio Production Trainee", org: "Voice of Teso FM", location: "Soroti", deadline: "Sep 10, 2026", type: "Internship" },
    { title: "Sales & Marketing Assistant", org: "UgaMart Ltd", location: "Soroti", deadline: "Sep 15, 2026", type: "Graduate" },
    { title: "Accountant (Graduate Trainee)", org: "Teso Investment Co.", location: "Soroti", deadline: "Sep 20, 2026", type: "Graduate" }
  ],

  clubs: [
    { name: "Horizon ICT Club", focus: "Coding, robotics & digital skills", members: 120, activity: "Weekly hack nights — every Friday, Lab 1" },
    { name: "Business & Entrepreneurship Club", focus: "Startups, finance & business plans", members: 95, activity: "Monthly pitch competitions" },
    { name: "Media & Journalism Club", focus: "Radio, photography & storytelling", members: 80, activity: "Campus radio shows every Wednesday" },
    { name: "Drama & Arts Society", focus: "Theatre, music & creative arts", members: 60, activity: "Rehearsals Tue & Thu, Drama Hall" },
    { name: "Debate & Leadership Forum", focus: "Public speaking & civic engagement", members: 70, activity: "Debates every Thursday, Room 5" }
  ],

  wellnessResources: [
    { title: "Counselling & Guidance Office", desc: "Confidential one-on-one counselling with our counsellor, Ms. Aduk Hellen. Open Mon-Fri, 9:00 AM - 4:00 PM, Wellness Centre." },
    { title: "Peer Support Network", desc: "Trained student peer counsellors available every weekday evening in the Wellness Centre lounge." },
    { title: "Stress Management Guide", desc: "Downloadable handbook with practical tips on exams, time management, and wellbeing." },
    { title: "Health & Medical Support", desc: "Partnership with Soroti Regional Referral Hospital for student medical care. Health card required." }
  ]
};
