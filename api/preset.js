import { put, get } from '@vercel/blob';

function slugify(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const slug = slugify(req.query.slug);
    if (!slug) {
      res.status(400).json({ error: 'missing_slug' });
      return;
    }
    try {
      const result = await get(`presets/${slug}.json`, { access: 'private' });
      if (!result) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      const text = await new Response(result.stream).text();
      res.status(200).json(JSON.parse(text));
    } catch (err) {
      console.error('preset get error', err);
      res.status(500).json({ error: 'internal_error' });
    }
    return;
  }

  if (req.method === 'POST') {
    const key = req.headers['x-admin-key'];
    if (!process.env.ADMIN_PASSWORD || key !== process.env.ADMIN_PASSWORD) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    try {
      const body = typeof req.body === 'object' && req.body ? req.body : JSON.parse(req.body || '{}');
      const slug = slugify(body.slug);
      if (!slug) {
        res.status(400).json({ error: 'missing_slug' });
        return;
      }
      const photos = Array.isArray(body.photos) ? body.photos.filter((p) => p && p.dataUrl) : [];
      await put(`presets/${slug}.json`, JSON.stringify({ photos }), {
        access: 'private',
        contentType: 'application/json',
      });
      res.status(200).json({ ok: true, slug });
    } catch (err) {
      console.error('preset post error', err);
      res.status(500).json({ error: 'internal_error' });
    }
    return;
  }

  res.status(405).json({ error: 'method_not_allowed' });
}
