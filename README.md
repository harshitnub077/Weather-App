# SkyCast - AI Engineer Intern Assessment (PM Accelerator)

SkyCast is a full-stack weather application built for the PM Accelerator AI Engineer Intern Technical Assessment. It seamlessly integrates both frontend (Assessment 1) and backend (Assessment 2) requirements, providing a unified experience for querying current weather, viewing 5-day forecasts, tracking historical weather data, and exporting records.

## Features

- **Frontend (Assessment 1)**:
  - **Dynamic Weather Query**: Search by city, zip code, or landmarks.
  - **Geolocation**: Fetch current weather using device location.
  - **5-Day Forecast**: Visually pleasing forecast grid with Lucide icons.
  - **Rich Maps & Context**: Uses Leaflet (OpenStreetMap) and the Wikipedia API to provide an interactive map and brief description of the requested location.
  - **Responsive Design**: Built with Tailwind CSS and Next.js App Router for mobile, tablet, and desktop compatibility.

- **Backend (Assessment 2 - CRUD & Export)**:
  - **Data Persistence**: Uses a local SQLite database mapped via Prisma ORM for seamless evaluation (no need to configure a Postgres/MongoDB server).
  - **Create**: Fetches and aggregates historical data (avg, max, min temp) from Open-Meteo for a specified date range and saves it.
  - **Read**: Displays a list of all saved historical queries.
  - **Update**: Allows updating the date range or location of a saved query and refetches the historical data.
  - **Delete**: Remove historical records.
  - **Multi-format Export**: Download saved records as JSON, CSV, XML, Markdown, or PDF.

## Tech Stack
- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Database**: SQLite
- **ORM**: Prisma (v5)
- **APIs**:
  - Open-Meteo (Weather & Historical data, 100% free, no API key)
  - Nominatim OpenStreetMap (Geocoding, 100% free)
  - Wikipedia API (Location details, 100% free)

## Running the Application Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   The repository already contains the SQLite DB file, but to ensure the schema is applied, run:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **View App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Submission Details
- **Candidate Name**: Harshit (or your preferred display name)
- **Company Context**: Included an "About PM Accelerator" section in the footer to provide information about the program that supports product management professionals.
- **Repository**: Public/Open-source for evaluator access.
