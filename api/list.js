import { list, get } from '@vercel/blob';

export default async function handler(req, res) {
  const key = req.headers['x-admin-key'];

  if (!process.env.ADMIN_PASSWORD || key !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    const { blobs } = await list({ prefix: 'submissions/' });
    const items = [];

    for (const b of blobs) {
      const result = await get(b.pathname, { access: 'private' });
      if (!result) continue;
      const text = await new Response(result.stream).text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
      items.push({ pathname: b.pathname, uploadedAt: b.uploadedAt, data });
    }

    items.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.status(200).json({ items });
  } catch (err) {
    console.error('list error', err);
    res.status(500).json({ error: 'internal_error' });
  }
}
