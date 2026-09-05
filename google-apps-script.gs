// Paste into Extensions > Apps Script in the target Google Sheet, then deploy as a Web app.
const SCRIPT_SECRET = '7f38d19ca64e4b31ab0d8e5296f473c6';
const REGISTRATION_SHEET_NAME = 'Taal Tarang Registrations';
const HEADERS = ['Submitted at', 'Full Name', 'Contact', 'Grade/Year', 'Stream/Course', 'Branch', 'Enrollment', 'Date of Birth', 'Studying in SKC since', 'SSC School', 'HSC School', 'Dance Experience', 'SKC Events', 'Other Events', 'Links/Achievements', 'Dance Styles', 'Why Selected', 'Undertaking'];

function doGet() {
  return json({ ok: true, message: 'Taal Tarang Google Sheet connection is ready.' });
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  if (payload.secret !== SCRIPT_SECRET) return json({ ok: false, error: 'Unauthorized' });
  const d = payload.data || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(REGISTRATION_SHEET_NAME) || spreadsheet.insertSheet(REGISTRATION_SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    const duplicate = findDuplicate(sheet, d.fullName, d.contact);
    if (payload.action === 'check') return json({ ok: !duplicate, error: duplicate || '' });
    if (payload.action !== 'submit') return json({ ok: false, error: 'Unknown request.' });
    if (duplicate) return json({ ok: false, error: duplicate });
    sheet.appendRow([new Date(), d.fullName, d.contact, d.grade, d.course, d.branch, d.enrollment, d.dob, d.skcSince, d.sscSchool, d.hscSchool, d.experience, d.skcEvents, d.outsideEvents, d.links, d.styles, d.why, d.undertaking].map(safe));
    return json({ ok: true });
  } finally { lock.releaseLock(); }
}

function findDuplicate(sheet, fullName, contact) {
  const rows = sheet.getDataRange().getValues().slice(1);
  const nameKey = String(fullName || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const contactKey = String(contact || '').replace(/\D/g, '');
  if (rows.some((row) => String(row[1] || '').trim().replace(/\s+/g, ' ').toLowerCase() === nameKey)) return 'This Full Name is already registered.';
  if (rows.some((row) => String(row[2] || '').replace(/\D/g, '') === contactKey)) return 'This Contact Number is already registered.';
  return '';
}

function safe(value) {
  const text = Array.isArray(value) ? value.join(', ') : String(value || '');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
