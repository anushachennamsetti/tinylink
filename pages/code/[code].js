import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Clock, Link2, BarChart3 } from "lucide-react";
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

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <BarChart3 className="text-blue-600 dark:text-blue-400" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics — <span className="text-blue-600 dark:text-blue-400">{link.code}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Detailed link performance overview
          </p>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* TOTAL CLICKS */}
        <div className="p-6 rounded-xl bg-white/90 dark:bg-gray-800/60 backdrop-blur shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Clicks</p>
          <p className="text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            {link.total_clicks}
          </p>
        </div>

        {/* CREATED AT */}
        <div className="p-6 rounded-xl bg-white/90 dark:bg-gray-800/60 backdrop-blur shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Created At</p>
          <div className="flex items-center gap-2 mt-2 text-gray-900 dark:text-white font-semibold">
            <Clock size={18} />
            {createdAt || "Loading..."}
          </div>
        </div>

        {/* LAST CLICKED */}
        <div className="p-6 rounded-xl bg-white/90 dark:bg-gray-800/60 backdrop-blur shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last Clicked</p>
          <div className="flex items-center gap-2 mt-2 text-gray-900 dark:text-white font-semibold">
            <Clock size={18} />
            {lastClicked || "Never"}
          </div>
        </div>

      </div>

      {/* LINK INFORMATION CARD */}
      <div className="p-6 rounded-xl bg-white/90 dark:bg-gray-800/60 backdrop-blur shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">

        {/* SHORT URL */}
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Short URL</p>

          <a
            href={shortUrl}
            target="_blank"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline break-all mt-1"
          >
            <Link2 size={18} />
            {shortUrl}
            <ExternalLink size={16} />
          </a>
        </div>

        {/* TARGET URL */}
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Destination URL</p>

          <a
            href={link.target_url}
            target="_blank"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline break-all mt-1"
          >
            {link.target_url}
            <ExternalLink size={16} />
          </a>
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">

        <a
          href="/"
          className="flex items-center gap-2 px-5 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-black dark:hover:bg-gray-900 transition font-semibold"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </a>

        <a
          href={`/${link.code}`}
          target="_blank"
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <ExternalLink size={18} />
          Visit Link
        </a>

      </div>

    </div>
  );
}
