import './styles.css';
import logo from './skc-degree-logo.png';

const googleFormResponseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfpKKaLKk3bsl-WcfVxM4gGZicv6a5p7sjSZjKnXIznbsQ1yA/formResponse';
const organiserWhatsApp = '917414998366';
const isLocalServer = location.hostname === 'localhost' && location.port === '3001';
const root = document.querySelector('#root');

root.innerHTML = `
<div class="splash" aria-hidden="true"><img src="${logo}" alt="SKC Degree College"></div>
<main><section class="card wide-card"><p class="eyebrow">SKC DANCE GROUP</p><h1>TAAL TARANG</h1><p class="intro">Student Interest & Selection Questionnaire</p>
<form id="identity-form"><h2>Start registration</h2><label>Full Name<input name="fullName" required></label><label>Contact Number<input name="contact" inputmode="tel" pattern="[0-9]{10}" maxlength="10" placeholder="10-digit mobile number" required></label><p class="step-note">A contact number can be used for only one registration. Duplicate numbers are checked when you submit the completed form.</p><button class="submit" type="submit">Continue</button><p class="message" id="identity-message" role="status"></p></form>
<form id="registration-form" hidden><h2>Student details</h2><label>Full Name<input name="fullName" readonly></label><div class="two"><label>Grade/Year<select name="grade" required><option value="">Select</option><option>F.Y Degree</option><option>S.Y Degree</option><option>T.Y Degree</option></select></label><label>Stream / Course<select name="course" required><option value="">Select</option><option>B.M.S</option><option>B.F.M</option><option>B.B.I</option><option>B.A.F</option><option>B.COM</option><option>B.SC(I.T.)</option></select></label></div><div class="two"><label>Branch<select name="branch" required><option value="">Select</option><option>East</option><option>West</option></select></label><label>Enrollment Category<select name="enrollment" required><option value="">Select</option><option>Regular</option><option>NA / Integrated</option></select></label></div><label>Date of Birth<input type="date" name="dob" required></label><h2>SKC Academic History</h2><label>Studying in SKC since<select name="skcSince" required><option value="">Select grade</option><option>Nursery</option><option>Junior Kg</option><option>Senior KG</option><option>Grade 1</option><option>Grade 2</option><option>Grade 3</option><option>Grade 4</option><option>Grade 5</option><option>Grade 6</option><option>Grade 7</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>First Year - Junior College</option><option>Second Year - Junior College</option><option>First Year - Degree</option><option>Second Year - Degree</option><option>Third Year - Degree</option><option>Forth Year - Degree</option></select></label><div class="two"><label>SSC School Name<input name="sscSchool" pattern="[A-Za-z ]+" required></label><label>HSC School Name<input name="hscSchool" pattern="[A-Za-z ]+" required></label></div><h2>Dance experience</h2><label>Have you participated in dance performances or competitions before?<select name="experience" id="experience" required><option value="">Select</option><option>Yes</option><option>No</option></select></label><div id="past-experience" hidden><label>Events at SKC<input name="skcEvents"></label><label>Events outside SKC<input name="outsideEvents"></label><label>Dance videos, achievements or social-media links<textarea name="links" maxlength="300"></textarea></label></div><fieldset><legend>Which dance styles are you comfortable with?</legend><div class="checks"><label><input type="checkbox" name="styles" value="Bollywood"> Bollywood</label><label><input type="checkbox" name="styles" value="Hip-Hop"> Hip-Hop</label><label><input type="checkbox" name="styles" value="Contemporary"> Contemporary</label><label><input type="checkbox" name="styles" value="Classical"> Classical</label><label><input type="checkbox" name="styles" value="Folk"> Folk</label><label><input type="checkbox" name="styles" value="Freestyle"> Freestyle</label></div></fieldset><label>Why should you be selected to be part of Taal Tarang?<textarea name="why" maxlength="300" required></textarea></label><h2>Undertaking</h2><fieldset><legend>Please agree to both terms</legend><label><input type="checkbox" name="undertaking" value="I know that right of selection depends on panel of teachers & I completely agree to this." required> I know that selection depends on the teachers' panel and I agree.</label><label><input type="checkbox" name="undertaking" value="If selected I commit to follow all Rules, Regulations and attend 80% of combined meetings/practice sessions" required> If selected, I will follow the rules and attend 80% of meetings/practice sessions.</label></fieldset><label>Contact No.<input name="contact" readonly></label><button class="submit" type="submit">Submit registration</button><p class="message" id="form-message" role="status"></p></form><iframe name="google-response" hidden></iframe></section></main>`;

const identityForm = document.querySelector('#identity-form');
const registrationForm = document.querySelector('#registration-form');
const identityMessage = document.querySelector('#identity-message');
const formMessage = document.querySelector('#form-message');
const experience = document.querySelector('#experience');
let identity;

experience.addEventListener('change', () => { document.querySelector('#past-experience').hidden = experience.value !== 'Yes'; });

async function request(action, data) {
  const url = isLocalServer ? (action === 'check' ? '/api/check-registration' : '/api/submit-registration') : '/.netlify/functions/registration';
  const body = isLocalServer ? data : { action, data };
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok || !result.ok && !result.saved) throw new Error(result.error || 'Could not save this registration.');
  return result;
}

identityForm.addEventListener('submit', (event) => {
  event.preventDefault();
  identity = Object.fromEntries(new FormData(identityForm));
  registrationForm.elements.fullName.value = identity.fullName;
  registrationForm.elements.contact.value = identity.contact;
  identityForm.hidden = true;
  registrationForm.hidden = false;
  registrationForm.elements.grade.focus();
});

function addField(form, name, value) { const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.value = value || ''; form.append(input); }
function submitToOriginalGoogleForm(data) {
  const form = document.createElement('form'); form.method = 'POST'; form.action = googleFormResponseUrl; form.target = 'google-response';
  const fields = { 'entry.2103179083': data.fullName, 'entry.2137169642': data.grade, 'entry.1169628223': data.course, 'entry.1834721229': data.branch, 'entry.1120103258': data.enrollment, 'entry.1084484876': data.contact, 'entry.159741993': data.skcSince, 'entry.322619274': data.sscSchool, 'entry.1758127048': data.hscSchool, 'entry.938688363': data.experience, 'entry.2103363697': data.skcEvents, 'entry.1196969636': data.outsideEvents, 'entry.1695979800': data.links, 'entry.1481479613': data.why };
  Object.entries(fields).forEach(([name, value]) => addField(form, name, value)); const [year, month, day] = data.dob.split('-'); addField(form, 'entry.997228963_year', year); addField(form, 'entry.997228963_month', month); addField(form, 'entry.997228963_day', day); data.styles.forEach((v) => addField(form, 'entry.243934774', v)); data.undertaking.forEach((v) => addField(form, 'entry.1540658899', v)); document.body.append(form); form.submit(); form.remove();
}

registrationForm.addEventListener('submit', async (event) => {
  event.preventDefault(); const button = registrationForm.querySelector('button'); const fields = Object.fromEntries(new FormData(registrationForm));
  const data = { ...fields, ...identity, styles: [...registrationForm.querySelectorAll('[name="styles"]:checked')].map((x) => x.value), undertaking: [...registrationForm.querySelectorAll('[name="undertaking"]:checked')].map((x) => x.value) };
  if (!data.styles.length) { formMessage.textContent = 'Select at least one dance style.'; return; }
  button.disabled = true; formMessage.textContent = 'Saving your response to Google Sheet…';
  const sheetData = {
    ...data,
    styles: data.styles.join(', '),
    undertaking: data.undertaking.join(' ')
  };
  try { await request('submit', sheetData); submitToOriginalGoogleForm(data); } catch (error) { formMessage.textContent = error.message; button.disabled = false; return; }
  const summary = [`New TAAL TARANG registration`, '', `Name: ${data.fullName}`, `Contact: ${data.contact}`, `Grade/Year: ${data.grade}`, `Stream/Course: ${data.course}`, `Branch: ${data.branch}`, `Enrollment: ${data.enrollment}`, `Date of birth: ${data.dob}`, `Studying in SKC since: ${data.skcSince}`, `SSC School: ${data.sscSchool}`, `HSC School: ${data.hscSchool}`, `Dance experience: ${data.experience}`, `SKC events: ${data.skcEvents || 'Not provided'}`, `Other events: ${data.outsideEvents || 'Not provided'}`, `Links/achievements: ${data.links || 'Not provided'}`, `Dance styles: ${data.styles.join(', ')}`, `Why selected: ${data.why}`, 'Undertaking accepted: Yes'].join('\n');
  setTimeout(() => { formMessage.textContent = 'Opening WhatsApp…'; window.location.assign(`https://wa.me/${organiserWhatsApp}?text=${encodeURIComponent(summary)}`); }, 800);
});
