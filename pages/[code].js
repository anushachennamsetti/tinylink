import { query } from '../lib/db';

export async function getServerSideProps({ params, res }) {
  const { code } = params;

  const r = await query('SELECT target_url FROM links WHERE code=$1', [code]);

  if (r.rowCount === 0) {
    res.statusCode = 404;
    return { props: { notFound: true } };
  }

  const target = r.rows[0].target_url;

  await query(
    'UPDATE links SET total_clicks = total_clicks + 1, last_clicked = now() WHERE code=$1',
    [code]
  );

  res.setHeader('Location', target);
  res.statusCode = 302;
  res.end();

  return { props: {} };
}

export default function Page() {
  return null;
}
