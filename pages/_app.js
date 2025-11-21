import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-100 flex text-gray-900">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-xl border-r">
        <div className="px-6 py-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">TinyLink</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/"
            className="block px-4 py-3 rounded-lg hover:bg-blue-50 font-medium"
          >
            Dashboard
          </a>
          <a
            href="/healthz"
            className="block px-4 py-3 rounded-lg hover:bg-blue-50 font-medium"
          >
            Health Check
          </a>
        </nav>

        <div className="p-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} TinyLink
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-6 py-10">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
