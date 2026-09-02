import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'object' && req.body ? req.body : JSON.parse(req.body || '{}');
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 10);

    await put(`submissions/${id}.json`, JSON.stringify(body), {
      access: 'private',
      contentType: 'application/json',
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit error', err);
    res.status(500).json({ error: 'internal_error' });
  }
}
