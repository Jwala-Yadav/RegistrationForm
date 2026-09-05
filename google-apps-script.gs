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
  // Checks are read-only, so they do not need to wait behind another visitor's save.
  if (payload.action === 'check') {
    const duplicate = findDuplicate(getRegistrationSheet(), d.fullName, d.contact);
    return json({ ok: !duplicate, error: duplicate || '' });
  }
  if (payload.action !== 'submit') return json({ ok: false, error: 'Unknown request.' });

  // Keep the lock for saves and check again after acquiring it. This prevents
  // two simultaneous visitors from registering the same name or number.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getRegistrationSheet();
    const duplicate = findDuplicate(sheet, d.fullName, d.contact);
    if (duplicate) return json({ ok: false, error: duplicate });
    sheet.appendRow([new Date(), d.fullName, d.contact, d.grade, d.course, d.branch, d.enrollment, d.dob, d.skcSince, d.sscSchool, d.hscSchool, d.experience, d.skcEvents, d.outsideEvents, d.links, listText(d.styles), d.why, listText(d.undertaking)].map(safe));
    return json({ ok: true });
  } finally { lock.releaseLock(); }
}

function getRegistrationSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(REGISTRATION_SHEET_NAME) || spreadsheet.insertSheet(REGISTRATION_SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function findDuplicate(sheet, fullName, contact) {
  const nameKey = String(fullName || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const contactKey = String(contact || '').replace(/\D/g, '');
  const registrationCount = sheet.getLastRow() - 1;
  if (registrationCount < 1) return '';
  // Only the name and contact columns are needed for this check.
  const rows = sheet.getRange(2, 2, registrationCount, 2).getValues();
  if (rows.some((row) => String(row[0] || '').trim().replace(/\s+/g, ' ').toLowerCase() === nameKey)) return 'This Full Name is already registered.';
  if (rows.some((row) => String(row[1] || '').replace(/\D/g, '') === contactKey)) return 'This Contact Number is already registered.';
  return '';
}

function safe(value) {
  const text = String(value || '');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function listText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (typeof value === 'object') {
    const entries = [];
    for (const key in value) entries.push(String(value[key]));
    if (entries.length) return entries.join(', ');
  }
  return String(value);
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
