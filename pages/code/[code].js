import { useEffect, useState } from "react";
import { query } from "../../lib/db";

export async function getServerSideProps(context) {
  const { code } = context.params;

  try {
    const result = await query(
      "SELECT code, target_url, total_clicks, last_clicked, created_at FROM links WHERE code=$1",
      [code]
    );

    if (result.rowCount === 0) return { notFound: true };

    const row = result.rows[0];

    return {
      props: {
        link: {
          ...row,
          created_at: row.created_at ? row.created_at.toISOString() : null,
          last_clicked: row.last_clicked ? row.last_clicked.toISOString() : null,
        },
      },
    };
  } catch (e) {
    return { notFound: true };
  }
}

export default function StatsPage({ link }) {
  const [shortUrl, setShortUrl] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [lastClicked, setLastClicked] = useState("");

  // Generate values ONLY IN CLIENT to prevent SSR mismatch
  useEffect(() => {
    setShortUrl(`${window.location.origin}/${link.code}`);

    if (link.created_at) {
      setCreatedAt(new Date(link.created_at).toLocaleString());
    }

    if (link.last_clicked) {
      setLastClicked(new Date(link.last_clicked).toLocaleString());
    }
  }, [link]);

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Stats for <span className="text-blue-600">{link.code}</span>
        </h1>
        <p className="text-gray-500">Link analytics overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-sm">Total Clicks</p>
          <p className="text-4xl font-bold mt-2">{link.total_clicks}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-sm">Created</p>
          <p className="text-lg font-semibold mt-2">
            {createdAt || "Loading..."}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-sm">Last Clicked</p>
          <p className="text-lg font-semibold mt-2">
            {lastClicked || "Never"}
          </p>
        </div>

      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 space-y-4">
        <div>
          <p className="text-gray-500 text-sm">Short URL</p>

          <a
            className="text-blue-600 underline break-all"
            href={shortUrl || `/${link.code}`}
            target="_blank"
          >
            {shortUrl || `/${link.code}`}
          </a>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Target URL</p>
          <a
            href={link.target_url}
            className="text-blue-600 underline break-all"
            target="_blank"
          >
            {link.target_url}
          </a>
        </div>
      </div>

      <div className="flex gap-4">
        <a
          href="/"
          className="px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-black transition font-semibold"
        >
          Back to Dashboard
        </a>

        <a
          href={`/${link.code}`}
          target="_blank"
          className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Visit Link
        </a>
      </div>

    </div>
  );
}
