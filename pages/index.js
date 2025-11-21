import { useState, useEffect } from "react";

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchLinks() {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
    setLoaded(true);
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const body = {
      target_url: targetUrl,
      code: customCode || undefined,
    };

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 201) {
      setMessage("✨ Link created successfully!");
      setTargetUrl("");
      setCustomCode("");
      fetchLinks();
    } else if (res.status === 409) {
      setMessage("❌ Custom code already exists");
    } else {
      setMessage("❌ Failed to create link");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage and track your short links</p>
      </div>

      {/* Stats Cards */}
      {!loaded ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
          <div className="h-24 bg-gray-300 rounded-lg"></div>
          <div className="h-24 bg-gray-300 rounded-lg"></div>
          <div className="h-24 bg-gray-300 rounded-lg"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500">Total Links</p>
            <p className="text-3xl font-bold mt-1">{links.length}</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500">Total Clicks</p>
            <p className="text-3xl font-bold mt-1">
  {links.reduce((t, l) => t + Number(l.total_clicks), 0)}
</p>

          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500">Top Link</p>
            <p className="text-xl font-semibold mt-1">
              {links.length
                ? links.reduce((a, b) =>
                    a.total_clicks > b.total_clicks ? a : b
                  ).code
                : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Create Link */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Create Short Link</h2>

        <form className="grid gap-4" onSubmit={handleAdd}>
          <div>
            <label className="font-semibold block mb-1">Target URL</label>
            <input
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">
              Custom Code (optional)
            </label>
            <input
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              placeholder="mybrand"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
          </div>

          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Link"}
          </button>
        </form>

        {message && <p className="text-blue-600 mt-3">{message}</p>}
      </div>

      {/* Links Table */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Your Links</h2>

        {!loaded ? (
          <div className="h-20 bg-gray-300 rounded-lg animate-pulse"></div>
        ) : links.length === 0 ? (
          <p className="text-gray-500">No links yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Target</th>
                  <th className="p-3 text-center">Clicks</th>
                  <th className="p-3 text-center">Last Clicked</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.code} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{link.code}</td>
                    <td className="p-3 max-w-[250px] truncate">
                      {link.target_url}
                    </td>
                    <td className="p-3 text-center">{link.total_clicks}</td>
                    <td className="p-3 text-center">
                      {link.last_clicked
                        ? new Date(link.last_clicked).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-3 text-center space-x-3">
                      <a
                        href={`/code/${link.code}`}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        View
                      </a>
                      <button
                        onClick={() =>
                          fetch(`/api/links/${link.code}`, {
                            method: "DELETE",
                          }).then(fetchLinks)
                        }
                        className="text-red-600 font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
