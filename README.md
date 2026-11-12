Trimrr — Modern URL Shortener & Analytics Platform
Trimrr is a full-featured, responsive URL shortener and link management platform built with React, Vite, Tailwind CSS, Supabase, and Recharts. It allows users to turn long URLs into clean, customizable short links, generate QR codes, track click metrics, and inspect real-time geographic and device analytics.
🚀 Features
⚡ Instant URL Shortening: Convert long URLs into concise 4-character codes with a single click.
🎯 Custom Branded Links: Create custom vanity aliases (e.g., /my-portfolio, /summer-sale) instead of random characters.
📱 Automatic QR Code Generation: Instant QR code generation with live preview and 1-click PNG download.
📊 Real-time Click Analytics:
Total Clicks: Aggregate and link-specific click counters.
Location Analytics: Line charts tracking click volume across cities and countries.
Device Breakdown: Interactive pie charts showing desktop vs. mobile visitor distribution.
🔒 Authentication & User Profiles:
Secure email/password authentication powered by Supabase Auth.
Profile image uploads with Supabase Storage.
User-isolated dashboard (urls protected by Row-Level Security).
🛡️ Fallback & Resilience:
Built-in local mock database engine for rapid offline prototyping without requiring remote credentials.
Safe cascading deletion: removes child click records to prevent foreign key errors.
Geolocation fallback: guaranteed redirection even if external IP lookup APIs are blocked or rate-limited.
📱 Fully Responsive Design: Built with Tailwind CSS and Radix UI primitives for seamless mobile, tablet, and desktop experiences without horizontal overflow.
🛠️ Tech Stack
Layer
Technologies
Frontend Framework
React 18, Vite 5
Styling & UI Components
Tailwind CSS, Radix UI Primitives, Lucide React Icons
Routing
React Router v6 (createBrowserRouter, RouterProvider)
Charts & Visualizations
Recharts (LineChart, PieChart, ResponsiveContainer)
QR Code Engine
react-qrcode-logo (HTML5 Canvas to PNG Blob)
Validation
Yup schema validation
Device & Geo Detection
ua-parser-js, IP Geolocation API (ipapi.co)
Backend & Storage
Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
📁 Project Architecture
├── public/                 # Static assets (logos, default banners, sample QRs)
├── src/
│   ├── components/         # Reusable feature & layout components
│   │   ├── ui/             # Radix UI design primitives (button, card, dialog, tabs, etc.)
│   │   ├── create-link.jsx # Modal dialog with live QR preview to create short links
│   │   ├── device-stats.jsx# Recharts pie chart for desktop vs. mobile breakdown
│   │   ├── header.jsx      # Top navigation with avatar dropdown & authentication state
│   │   ├── link-card.jsx   # Individual link tile with copy, download QR, and delete
│   │   ├── location-stats.jsx # Recharts line chart showing geographic distribution
│   │   ├── login.jsx       # Login form with Yup validation
│   │   ├── require-auth.jsx# Route guard redirecting unauthenticated users to /auth
│   │   └── signup.jsx      # Signup form with avatar file upload
│   ├── db/                 # Supabase client & API services
│   │   ├── apiAuth.js      # Auth API (login, signup, getSession, logout)
│   │   ├── apiClicks.js    # Clicks API (storeClicks, getClicksForUrls)
│   │   ├── apiUrls.js      # URLs CRUD operations (getUrls, createUrl, deleteUrl)
│   │   └── supabase.js     # Supabase client with local mock database fallback
│   ├── hooks/
│   │   └── use-fetch.js    # Custom async hook managing data, loading, error, and fn
│   ├── layouts/
│   │   └── app-layout.jsx  # Main application wrapper with header, container, & footer
│   ├── pages/
│   │   ├── auth.jsx        # Login & Signup tabbed page
│   │   ├── dashboard.jsx   # User dashboard displaying KPI cards, search filter & links
│   │   ├── landing.jsx     # Landing page with hero input, banner, and FAQs accordion
│   │   ├── link.jsx        # Deep-dive analytics page for an individual link
│   │   └── redirect-link.jsx # Public redirect route (/:id) that records click & redirects
│   ├── App.jsx             # React Router configuration
│   └── main.jsx            # React root mount entry point
├── .env.example            # Environment variables template
├── tailwind.config.js      # Tailwind CSS configuration (ES modules)
└── vite.config.js          # Vite bundler configuration (port 3000, 0.0.0.0 host)
​
🗄️ Database Schema & Supabase Setup
1. SQL Schema
Execute the following in your Supabase Dashboard → SQL Editor:
-- 1. Create the URLs Table
CREATE TABLE urls (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_url TEXT NOT NULL,
  short_url TEXT NOT NULL UNIQUE,
  custom_url TEXT UNIQUE,
  qr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the Clicks Table with Cascade Delete
CREATE TABLE clicks (
  id BIGSERIAL PRIMARY KEY,
  url_id BIGINT REFERENCES urls(id) ON DELETE CASCADE,
  city TEXT,
  country TEXT,
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- 4. URLs Policies
-- Allow authenticated users to view only their own links
CREATE POLICY "Allow users to view own urls"
  ON urls FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow public/anonymous visitors to look up links for redirection
CREATE POLICY "Allow public read for redirection"
  ON urls FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to insert their own links
CREATE POLICY "Allow users to create urls"
  ON urls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own links
CREATE POLICY "Allow users to delete own urls"
  ON urls FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Clicks Policies
-- Allow anyone (authenticated or anon) to record clicks on redirection
CREATE POLICY "Allow public insert on clicks"
  ON clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to view click statistics
CREATE POLICY "Allow authenticated read clicks"
  ON clicks FOR SELECT
  TO authenticated
  USING (true);
​
2. Storage Buckets Setup
In Supabase → Storage:
Create a bucket named profile_pic and toggle Public bucket to ON.
Create a bucket named qrs and toggle Public bucket to ON.
⚙️ Environment Variables
Create a .env file in the project root:
# Your Supabase Project URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Your Supabase Anon Public Key
VITE_SUPABASE_KEY=your-anon-public-key
​
Note: If environment variables are omitted, the application automatically activates an in-memory/localStorage mock database with demo accounts, links, and analytics.
🏃 Getting Started Locally
Clone the repository:
git clone <https://github.com/Nikhil028-com/URL-SHORTNER.git>
cd URL-SHORTNER
​
Install dependencies:
npm install
​
Start the development server:
npm run dev
​
Open http://localhost:3000 in your browser.
Build for production:
npm run build
​
🔮 Future Expansion Opportunities
Link Expiration & Click Limits: Set links to automatically deactivate after a specified date or maximum click threshold.
Password Protection: Require a passcode before visitors can proceed to sensitive destination URLs.
UTM Campaign Builder: Automatically append Google Analytics tracking tags (utm_source, utm_medium, utm_campaign).
Custom Branded Domains: Allow users to connect custom domain names (e.g., link.yourbrand.com).
Browser Extension: A 1-click Chrome/Firefox extension to shorten the current browser tab instantly.
CSV Bulk Export: Export analytics and link directories to Excel/CSV for marketing reporting.
