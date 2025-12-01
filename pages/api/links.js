import { query } from '../../lib/db';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

function isValidUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const r = await query('SELECT code, target_url, total_clicks, last_clicked, created_at FROM links ORDER BY created_at DESC', []);
    return res.status(200).json(r.rows);
  }

  if (req.method === 'POST') {
    const { target_url, code } = req.body || {};

    if (!target_url || !isValidUrl(target_url)) {
      return res.status(400).json({ error: 'Invalid or missing target_url' });
    }

    let finalCode = code;

    if (finalCode) {
      if (!CODE_REGEX.test(finalCode)) {
        return res.status(400).json({ error: 'Custom code must match [A-Za-z0-9]{6,8}' });
      }
      const exists = await query('SELECT 1 FROM links WHERE code=$1', [finalCode]);
      if (exists.rowCount > 0) {
        return res.status(409).json({ error: 'Code already exists' });
      }
    } else {
      const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const generate = () =>
        Array.from({ length: 6 }).map(() => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');

      let tries = 0;
      do {
        finalCode = generate();
        const r = await query('SELECT 1 FROM links WHERE code=$1', [finalCode]);
        if (r.rowCount === 0) break;
        tries++;
        if (tries > 10) return res.status(500).json({ error: 'Cannot generate unique code' });
      } while (true);
    }

    await query('INSERT INTO links(code, target_url) VALUES($1, $2)', [finalCode, target_url]);

    return res.status(201).json({
      code: finalCode,
      short_url: `${process.env.BASE_URL}/${finalCode}`,
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
}
