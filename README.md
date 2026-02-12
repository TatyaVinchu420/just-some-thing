# PlaySlot — Turf & Court Booking Interface

A lightweight booking interface for sports turfs and courts. It supports creating bookings, conflict detection for overlapping slots, venue filters, booking stats, and local persistence using `localStorage`.

## Features

- Booking form with sport, venue, date, time, and duration.
- Overlap prevention for the same venue and date.
- Upcoming bookings panel with cancellation controls.
- Venue-based filtering.
- Auto-generated quick stats.
- Data saved in browser `localStorage`.

## Run locally

Since this is a static website, you can run it with any static server.

### Option 1: Python

```bash
python3 -m http.server 4173
```

Then open: <http://localhost:4173>

### Option 2: VS Code Live Server

Open `index.html` with Live Server.

## Project structure

- `index.html` – page structure and form/layout.
- `styles.css` – responsive visual styling.
- `app.js` – booking logic, persistence, and rendering.
