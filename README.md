TinyLink – Modern URL Shortener with Analytics

TinyLink is a fully-featured URL Shortening web app built using Next.js, PostgreSQL (NeonDB), and TailwindCSS, providing a clean dashboard UI, detailed analytics, theme switching, and a smooth user experience.

🔴 Live Demo:
👉 https://tinylink-7gv7.vercel.app/

🚀 Features
🔗 URL Shortening

Create short URLs instantly

Supports custom short codes (6–8 characters)

Smart validation

One-click copy to clipboard

📊 Analytics Dashboard

Total links

Total clicks

Top performing link

Live search & filtering

Click timestamps (last clicked, created at)

📈 Stats Page

Displays full analytics for a specific short link

Includes:

Total clicks

Created time

Last clicked time

Target URL

Short URL

Optimized responsive UI

🌙 Dark / Light Mode

Persistent theme using localStorage

Clean animations

Sidebar + dashboard theme awareness

🧩 Tech Stack

Next.js (Pages Router)

Neon PostgreSQL

TailwindCSS

lucide-react icons

Vercel Deployment

📁 Project Structure
/pages
   |_ index.js           // Dashboard UI
   |_ [code].js          // Redirect handler
   |_ code/[code].js     // Stats page UI
   |_ api/links          // POST + GET links
   |_ api/links/[code]   // DELETE link
   |_ api/hello.js

/lib
   |_ db.js              // Neon PostgreSQL client

/styles
   |_ globals.css

tailwind.config.js
.env.local

⚙️ Environment Variables

Create .env.local at the root:

DATABASE_URL=your-neon-postgres-connection-url


Example (NeonDB):

postgresql://user:password@ep-xxxxx.ap-south-1.aws.neon.tech/neondb?sslmode=require

🛠 Getting Started (Local Development)

Install dependencies:

npm install


Run development server:

npm run dev


Visit:

👉 http://localhost:3000/

🧪 Sample Database Seed (Optional)
INSERT INTO links (code, target_url, total_clicks, created_at)
VALUES
('abc123', 'https://google.com', 5, NOW()),
('hello12', 'https://vercel.com', 12, NOW()),
('track99', 'https://github.com', 0, NOW());

🌍 Deploying on Vercel

Push your project to GitHub

Open Vercel → New Project

Select Repository

Add environment variable:

DATABASE_URL=your_neon_db_url


Deploy 🎉

🤖 ChatGPT Prompts Used (Safe & Professional)

These are the safe development questions used during the build:

“Help me design a dark/light mode dashboard using TailwindCSS.”

“Guide me in connecting Next.js API routes to Neon PostgreSQL using pg.”

“Provide a clean UI layout for a link stats analytics page.”

“Fix this routing issue in Next.js for dynamic pages.”

“Optimize my code structure for a URL shortener project.”

No personal data, no sensitive information. Only coding support.

🖼 Screenshots (Add Later)
Dashboard

(Insert image here)

Stats Page

(Insert image here)

Dark Mode

(Insert image here)

✨ Future Improvements

QR code generator

Authentication system

Click location/device analytics

Bulk link upload

Custom branded domains

👩‍💻 Author

Anusha Chennamsetti
Full-Stack Developer & UI/UX Designer

GitHub: https://github.com/anushachennamsetti

⭐ Support

If you like the project, please star the repo 🌟
