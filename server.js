import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json());

async function callGoogleSheet(action, data) {
  const url = process.env.GOOGLE_SHEETS_WEB_APP_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) throw new Error('Google Sheet connection is not configured.');
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, secret, data }) });
  const text = await response.text();
  let result;
  try { result = JSON.parse(text); } catch { throw new Error('Google Sheet authorization failed. Redeploy the Apps Script as a Web app with access set to Anyone.'); }
  if (!response.ok || !result.ok) {
    if (result.error === 'Unauthorized') throw new Error('Google Sheet setup mismatch: paste the current google-apps-script.gs file into Apps Script and redeploy it as a New version.');
    throw new Error(result.error || 'Google Sheet did not accept this registration.');
  }
  return result;
}

app.post('/api/check-registration', async (req, res) => {
  const { fullName, contact } = req.body;
  if (!String(fullName || '').trim()) return res.status(400).json({ error: 'Enter Full Name.' });
  if (!/^\d{10}$/.test(String(contact || ''))) return res.status(400).json({ error: 'Enter a valid 10-digit Contact Number.' });
  try { await callGoogleSheet('check', { fullName, contact }); res.json({ ok: true }); }
  catch (error) { res.status(409).json({ error: error.message }); }
});

app.post('/api/submit-registration', async (req, res) => {
  try { await callGoogleSheet('submit', req.body); res.status(201).json({ ok: true }); }
  catch (error) { res.status(409).json({ error: error.message }); }
});

app.use(express.static(path.join(projectDirectory, 'dist')));
app.get('*', (_req, res) => res.sendFile(path.join(projectDirectory, 'dist', 'index.html')));
app.listen(process.env.PORT || 3001, () => console.log('Registration app running on http://localhost:3001'));
