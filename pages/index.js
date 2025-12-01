"use client";

import { useState, useEffect } from "react";

const CODE_RE = /^[A-Za-z0-9]{6,8}$/;

export default function Dashboard() {
  // data + ui state
  const [links, setLinks] = useState([]);
  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false); // create action loading
  const [loadingList, setLoadingList] = useState(true); // initial list load
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | error
  const [codeError, setCodeError] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  // fetch links
  async function fetchLinks() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load links.");
      setMessageType("error");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  // validate code input
  function validateCode(v) {
    if (!v) return true;
    return CODE_RE.test(v);
  }

  useEffect(() => {
    setCodeError(!validateCode(customCode.trim()));
  }, [customCode]);

  // create link
  async function handleAdd(e) {
    e.preventDefault();
    if (!targetUrl.trim()) {
      setMessage("Please enter a target URL.");
      setMessageType("error");
      return;
    }
    if (codeError) {
      setMessage("Custom code format is invalid.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const body = { target_url: targetUrl.trim(), code: customCode.trim() || undefined };
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setMessage("Link created successfully ✨");
        setMessageType("success");
        setTargetUrl("");
        setCustomCode("");
        await fetchLinks();
      } else if (res.status === 409) {
        setMessage(json.error || "Custom code already exists");
        setMessageType("error");
      } else {
        setMessage(json.error || `Failed to create link (${res.status})`);
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network or server error");
      setMessageType("error");
    } finally {
      setLoading(false);
      // auto-clear message after a bit
      setTimeout(() => setMessage(""), 4000);
    }
  }

  // delete
  async function handleDelete(code) {
    if (!confirm(`Delete link ${code}?`)) return;
    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Link deleted");
        setMessageType("success");
        await fetchLinks();
      } else {
        setMessage("Failed to delete link");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete link");
      setMessageType("error");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  }

  // copy short url
  async function copyShortUrl(code) {
    const url = `${window.location.origin}/${code}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopiedCode(code);
      setMessage("Short URL copied to clipboard");
      setMessageType("success");
      setTimeout(() => setCopiedCode(""), 2000);
    } catch {
      setMessage("Failed to copy URL");
      setMessageType("error");
    } finally {
      setTimeout(() => setMessage(""), 2500);
    }
  }

  const numericTotalClicks = links.reduce((t, l) => t + Number(l.total_clicks || 0), 0);

  const topLinkCode =
    links.length > 0
      ? links.reduce((a, b) => (Number(a.total_clicks || 0) > Number(b.total_clicks || 0) ? a : b)).code
      : "—";

  const filteredLinks = links.filter((l) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (l.code || "").toLowerCase().includes(q) || (l.target_url || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">TinyLink</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Shorten links, view stats and manage them — fast.</p>
        </div>

        <div className="w-full sm:w-auto flex gap-3">
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"></path>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or URL"
              className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 w-48 sm:w-72"
            />
            {search && (
              <button onClick={() => setSearch("")} className="ml-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Message */}
      <div aria-live="polite" className="min-h-[1.25rem]">
        {message && (
          <div
            className={`inline-block px-4 py-2 rounded-md text-sm ${
              messageType === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : messageType === "error"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Stats cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total links</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{links.length}</p>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total clicks</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{numericTotalClicks}</p>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-tr from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/30">
              <svg className="w-6 h-6 text-green-600 dark:text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h6l3 8 4-16 3 8h5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Top link</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{topLinkCode}</p>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-tr from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-800/30">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>
      </section>

      {/* Create link form + table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* create form */}
        <form onSubmit={handleAdd} className="lg:col-span-1 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Create Short Link</h3>

          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Target URL</label>
          <input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com/long/path"
            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 mb-3 focus:ring-2 focus:ring-blue-300 outline-none"
            required
          />

          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Custom code (optional)</label>
          <input
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="6–8 alphanumeric chars"
            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 mb-2 outline-none"
          />
          {codeError && <p className="text-xs text-red-600 mb-2">Code must be 6–8 alphanumeric characters.</p>}

          <button
            disabled={loading || !targetUrl.trim() || codeError}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-95 transition disabled:opacity-50"
            type="submit"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeDasharray="31.4" strokeLinecap="round" fill="none" /></svg>
            ) : null}
            {loading ? "Creating..." : "Create"}
          </button>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Codes must match <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">[A-Za-z0-9]{6,8}</code></p>
        </form>

        {/* table */}
        <section className="lg:col-span-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Links</h3>
            <div className="text-sm text-gray-500 dark:text-gray-300">Total: {links.length}</div>
          </div>

          {/* content */}
          <div className="p-4">
            {loadingList ? (
              // skeleton
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 h-12 rounded-md" />
                ))}
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                No links found. Create one to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-600 dark:text-gray-300">
                      <th className="p-2">Code</th>
                      <th className="p-2">Target URL</th>
                      <th className="p-2 text-center">Clicks</th>
                      <th className="p-2 text-center">Last clicked</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLinks.map((l) => (
                      <tr key={l.code} className="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800 dark:even:bg-gray-900">
                        <td className="p-2 align-middle font-medium text-gray-900 dark:text-white">{l.code}</td>
                        <td className="p-2 max-w-[60%] truncate">
                          <a href={l.target_url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-300 hover:underline">
                            {l.target_url}
                          </a>
                        </td>
                        <td className="p-2 text-center">{Number(l.total_clicks || 0)}</td>
                        <td className="p-2 text-center text-sm text-gray-600 dark:text-gray-400">
                          {l.last_clicked ? new Date(l.last_clicked).toLocaleString() : "—"}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <a href={`/code/${l.code}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Stats</a>
                            <button
                              onClick={() => copyShortUrl(l.code)}
                              className="text-sm text-gray-700 dark:text-gray-300 hover:underline"
                              title="Copy short URL"
                            >
                              {copiedCode === l.code ? "Copied" : "Copy"}
                            </button>
                            <button
                              onClick={() => handleDelete(l.code)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
