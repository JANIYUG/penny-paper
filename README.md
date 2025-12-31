# Penny & Paper — Expense Tracker

A front-end-only expense tracker dashboard with offline-first storage. Built with HTML, CSS, and vanilla JavaScript, using Chart.js for visualizations. Data persists in the browser via localStorage—no backend required.

## Features
- Dashboard with daily/weekly/monthly/yearly spend and category highlights
- Add expense flow with recent entries and payment methods
- Reports & analysis page with charts, filters, and statement preview
- Notes with reminders and quick search
- User login/signup mock (localStorage-backed)
- Mobile-friendly layout with sidebar toggle and touch scrolling

## Tech Stack
- HTML5, CSS, vanilla JavaScript
- Chart.js via CDN for charts
- Google Fonts (Roboto)
- Browser localStorage for data persistence

## Getting Started
1. Clone or download this folder.
2. Open `index.html` in a modern browser (Chrome/Edge/Firefox).
   - On Windows, double-click `index.html`, or run: `file:///c:/expense%20tracker/template/dashboard/index.html`
3. Optional: serve locally for best results (avoids some browser restrictions):
   - Using Python: `python -m http.server 8000` then visit `http://localhost:8000/index.html`

## Usage Notes
- Data (users, expenses, notes, history) is stored in localStorage per browser profile.
- “Login/Signup” is client-side only—no real authentication.
- Reset actions clear current expenses but archive them to `expenseHistory` in localStorage for statements.

## File Map
- `index.html` — single-page app: auth, dashboard, add expense, reports, notes, modals
- `style.css` — shared dark theme styling
- `script.js` — all app logic (auth, expenses, reports, notes, settings, profile)

## Customization Ideas
- Add real backend (auth + synced data)
- Export/import data (JSON/CSV)
- PWA installability and offline cache
- Category budgets and alerts
- Multi-user support with roles


