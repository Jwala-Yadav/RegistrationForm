export default async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const { action, data } = await request.json();
  const url = process.env.GOOGLE_SHEETS_WEB_APP_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) return Response.json({ error: 'Google Sheet connection is not configured.' }, { status: 503 });
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, secret, data }) });
  const text = await response.text();
  try {
    const result = JSON.parse(text);
    return Response.json(result, { status: result.ok ? 200 : 409 });
  } catch {
    return Response.json({ error: 'Google Sheet authorization failed. Check the Apps Script deployment access.' }, { status: 502 });
  }
};
