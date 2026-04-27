# Product Requirements Document (PRD): Student Study Planner Dashboard

## 1. Executive Summary & Problem Statement

### Problem Statement
Students often struggle to manage their academic lives effectively, juggling classes, assignments, exams, and personal study time across multiple disjointed tools (calendars, note apps, to-do lists). This fragmentation leads to missed deadlines, inefficient study sessions, and increased stress. There is a need for a centralized, offline-first dashboard that unifies scheduling, task management, and productivity tracking.

### Executive Summary
The Student Study Planner Dashboard is a premium, client-side web application designed to be the ultimate productivity hub for students. Built entirely with HTML5, CSS3, Vanilla JavaScript, and LocalStorage, it provides a seamless, responsive, and visually stunning dark-mode interface. The dashboard integrates seven core modules—timetable, task tracking, analytics, Pomodoro timer, exam countdown, quick notes, and deep UI customization—enabling students to organize their academic lives efficiently without requiring backend servers or internet connectivity.

---

## 2. Goals, Objectives & Success Metrics

### Goals
- Provide a unified, all-in-one productivity tool tailored specifically for student workflows.
- Deliver a premium, visually engaging, and responsive User Interface (UI) that students enjoy using daily.
- Ensure 100% data privacy and offline capability by storing all user data locally.

### Objectives
- Develop and integrate 7 distinct productivity modules within a single dashboard.
- Achieve a fully responsive design that works flawlessly on desktop, tablet, and mobile devices.
- Implement a robust data management system using browser LocalStorage.

### Success Metrics
- **Performance:** App loads and becomes interactive in under 1 second.
- **Usability:** Users can add a task, start a timer, or create a note in 3 clicks or fewer.
- **Reliability:** Zero data loss during browser refreshes or normal application usage.
- **Adoption (Hypothetical):** High daily active usage driven by the streak and analytics features.

---

## 3. Detailed Feature Requirements

### Module 1: Weekly Schedule & Timetable
- **Color-Coded Grid:** A visual weekly calendar view (Monday - Sunday) displaying classes and study blocks.
- **Drag-and-Drop:** Ability to drag classes or study blocks to reschedule them across days and times.
- **Customization:** Users can assign distinct colors to different subjects for quick visual recognition.

### Module 2: Task & Assignment Tracker
- **CRUD Operations:** Create, read, update, and delete tasks/assignments.
- **Metadata:** Tasks include titles, due dates, priority levels (High, Medium, Low), and associated subjects.
- **Filtering & Sorting:** Filter tasks by subject, priority, or completion status. Sort by due date.
- **Visual Cues:** Overdue tasks highlighted in red; completed tasks struck through.

### Module 3: Progress & Analytics
- **Visual Charts:** Utilization of Chart.js to display study hours per subject (e.g., Bar or Doughnut charts).
- **Streak Tracking:** Gamification feature tracking consecutive days of logging study time or completing tasks.
- **GPA Input:** A localized calculator/tracker where students can input grades and credits to estimate their GPA.

### Module 4: Pomodoro Focus Timer
- **Standard Cycles:** Default 25-minute focus sessions followed by 5-minute short breaks.
- **Custom Duration:** Ability for users to adjust focus and break durations to suit their preferences.
- **Session Logging:** Completed Pomodoro sessions automatically log time to the Analytics module.
- **Audio/Visual Alerts:** Notifications when a timer completes (browser notifications or subtle audio chimes).

### Module 5: Exam Countdown
- **Countdown Cards:** Dedicated cards displaying the name of the exam, date, and exact days remaining.
- **Urgency Color Coding:** Cards change color based on proximity (e.g., Green > 14 days, Yellow < 14 days, Red < 3 days).
- **Sorting:** Automatically ordered by the nearest upcoming exam.

### Module 6: Quick Notes
- **Sticky Note Interface:** A masonry or grid layout of digital sticky notes.
- **Subject Tagging:** Notes can be tagged with specific subjects for organization.
- **Search Functionality:** Real-time text search to quickly find specific notes by content or title.

### Module 7: UI & Customization
- **Theme:** Default sleek, modern Dark Mode to reduce eye strain.
- **Accent Colors:** Users can choose an accent color (e.g., Neon Blue, Purple, Emerald) that updates buttons, borders, and active states globally.
- **Responsive Design:** Fluid layout adjusting from large desktop monitors down to mobile screens.

---

## 4. Tech Stack

- **Structure:** HTML5 (Semantic elements, accessibility considerations).
- **Styling:** CSS3 (Vanilla CSS, CSS Variables for theming, Flexbox/Grid for layout, animations/transitions).
- **Logic:** Vanilla JavaScript (ES6+, DOM manipulation, event handling).
- **Data Visualization:** Chart.js (for rendering analytics graphs).
- **Storage:** Browser `localStorage` (JSON serialization/deserialization for persistent offline state).
- **Icons:** FontAwesome or Phosphor Icons (via CDN).
- **Fonts:** Google Fonts (e.g., Inter, Outfit, or Roboto).

---

## 5. File Structure & LocalStorage Data Schema

### File Structure
```text
student-study-planner/
│
├── index.html          # Main Dashboard & UI Shell
├── style.css           # Global Styles, UI Customization & Themes
├── main.js             # Initialization, Routing/Tab Logic
│
├── js/
│   ├── modules/
│   │   ├── timetable.js    # Drag-and-drop timetable logic
│   │   ├── tasks.js        # Task tracker logic
│   │   ├── analytics.js    # Chart.js integration & GPA
│   │   ├── pomodoro.js     # Timer logic
│   │   ├── exams.js        # Countdown calculations
│   │   ├── notes.js        # Sticky notes logic
│   │   └── theme.js        # UI Customization & Accent colors
│   └── storage.js      # LocalStorage wrapper (Save/Load logic)
│
└── assets/             # Images, placeholder SVGs
```

### LocalStorage Data Schema (`appData` JSON Object)
```json
{
  "settings": {
    "theme": "dark",
    "accentColor": "#6366f1"
  },
  "subjects": [
    { "id": "sub_1", "name": "Mathematics", "color": "#ef4444" }
  ],
  "timetable": [
    { "id": "t_1", "subjectId": "sub_1", "day": "Monday", "startTime": "09:00", "endTime": "10:30" }
  ],
  "tasks": [
    { "id": "tsk_1", "title": "Calculus Assignment", "subjectId": "sub_1", "dueDate": "2024-05-15", "priority": "high", "status": "pending" }
  ],
  "exams": [
    { "id": "ex_1", "title": "Midterm Exam", "subjectId": "sub_1", "date": "2024-06-01" }
  ],
  "notes": [
    { "id": "n_1", "title": "Derivatives", "content": "Power rule...", "subjectId": "sub_1", "timestamp": "2024-05-01T10:00:00Z" }
  ],
  "analytics": {
    "studySessions": [
      { "date": "2024-05-01", "durationMinutes": 50, "subjectId": "sub_1" }
    ],
    "streak": 5,
    "lastActive": "2024-05-01"
  }
}
```

---

## 6. UI/UX Design Guide

### Typography
- **Primary Font:** `Inter` or `Outfit` (Clean, modern sans-serif).
- **Headings:** Bold (700), High contrast.
- **Body Text:** Regular (400) or Medium (500), Medium contrast to reduce strain.

### Color Palette (Dark Theme Focus)
- **Backgrounds:**
  - Base: `#0f172a` (Deep Slate/Navy)
  - Surface/Cards: `#1e293b` (Lighter Slate)
  - Hover/Active Surface: `#334155`
- **Text:**
  - Primary: `#f8fafc` (Near White)
  - Secondary: `#94a3b8` (Muted Grey)
- **Accent Colors (Customizable via CSS Variables):**
  - Primary Default (Indigo): `#6366f1`
  - Success (Emerald): `#10b981`
  - Warning (Amber): `#f59e0b`
  - Danger/Urgent (Rose): `#e11d48`

### Layout & Component Design
- **Glassmorphism/Soft UI:** Subtle borders (`1px solid rgba(255,255,255,0.1)`), soft shadows, and slight transparency on modals/dropdowns.
- **Sidebar Navigation:** Fixed left sidebar on desktop, collapsible hamburger menu or bottom tab bar on mobile.
- **Card-Based UI:** Information is encapsulated in standardized cards with consistent padding (`1.5rem`) and border-radius (`12px` or `16px`).
- **Animations:** Smooth, hardware-accelerated CSS transitions (`0.2s ease-in-out`) on hover states, tab switching, and adding/removing items from lists.

---

## 7. 4-Phase Development Plan (~2-3 Weeks)

### Phase 1: Foundation & Core Layout (Days 1-4)
- Setup project repository and file structure.
- Develop the HTML shell (Sidebar, Topbar, Main Content Area).
- Implement the core CSS design system (Variables, Typography, Base Layout).
- Build the `storage.js` module for LocalStorage CRUD operations.
- Implement UI Customization module (Theme switching, Accent colors).

### Phase 2: Essential Modules (Days 5-9)
- **Task & Assignment Tracker:** Build UI, implement create/edit/delete/filter logic.
- **Exam Countdown:** Build card UI, date comparison logic, and urgency color coding.
- **Quick Notes:** Build masonry layout, implement subject tagging and search filtering.

### Phase 3: Advanced Modules (Days 10-15)
- **Pomodoro Timer:** Implement `setInterval` logic, state management (Focus vs. Break), and session logging.
- **Progress & Analytics:** Integrate Chart.js, map LocalStorage data to chart datasets, implement streak calculation.
- **Weekly Timetable:** Build CSS Grid layout, implement HTML5 Drag-and-Drop API for schedule blocks.

### Phase 4: Polish, Testing & Deployment (Days 16-20)
- End-to-end testing across Chrome, Firefox, Safari, and mobile browsers.
- Ensure 100% responsiveness on mobile devices (adjusting padding, font sizes, stacking flex containers).
- Refine animations, hover states, and empty states (what a module looks like when no data exists).
- Final code cleanup, comments, and deployment (e.g., GitHub Pages or Vercel).

---

## 8. Risk Register & Mitigations

| Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **LocalStorage Limits** | High | Low | Browsers typically allow ~5MB. Implement size checking before saving. Advise users not to paste massive texts in notes. Offer a "Clear Old Data" utility. |
| **Data Loss on Cache Clear** | High | Medium | Implement an "Export Data" (download JSON file) and "Import Data" feature within the UI settings. |
| **Drag & Drop Mobile Issues** | Medium | High | HTML5 Drag and Drop can be finicky on touch screens. Implement touch-friendly alternatives (e.g., tap to move, or a modal to select day/time on mobile). |
| **Chart.js Performance** | Low | Low | Only render charts when the Analytics tab is active. Destroy and recreate canvas context upon data updates to prevent memory leaks. |

---

## 9. Glossary & References

### Glossary
- **LocalStorage:** A web storage API allowing JavaScript sites to store key/value pairs in a web browser with no expiration date.
- **Vanilla JS:** Plain JavaScript without any additional libraries or frameworks like React or Vue.
- **CRUD:** Create, Read, Update, Delete - the four basic operations of persistent storage.
- **Pomodoro Technique:** A time management method utilizing a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks.

### References
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [MDN Web Docs: LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN Web Docs: HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
