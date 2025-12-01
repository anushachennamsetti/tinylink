import "../styles/globals.css";
import { useEffect, useState } from "react";
import { Moon, Sun, Menu, X, Link2, Activity, Shield } from "lucide-react";

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState("light");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load theme initially
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  // When theme changes → update DOM
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full w-64 z-40
          bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl 
          border-r border-gray-100 dark:border-gray-700
          shadow-xl transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TinyLink
          </h1>

          <button className="md:hidden" onClick={() => setMobileOpen(false)}>
            <X className="text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        <nav className="p-5 space-y-2 text-gray-700 dark:text-gray-300">
          <a
            href="/"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <Activity size={18} /> Dashboard
          </a>

          <a
            href="/healthz"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <Shield size={18} /> Health Check
          </a>
        </nav>

       
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10">
        
        {/* TOP MOBILE BAR */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="text-gray-700 dark:text-gray-300" size={28} />
          </button>

          <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
        </div>

        <Component {...pageProps} />
      </main>
    </div>
  );
}
