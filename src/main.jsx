import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const api = 'http://localhost:3001/api';

function RegistrationForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', age: '', city: '' });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const requestOtp = async () => {
    if (!form.phone.trim()) return setMessage('Please enter your WhatsApp number first.');
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`${api}/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: form.phone }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOtpSent(true); setMessage(data.message);
    } catch (error) { setMessage(error.message || 'Could not send the OTP.'); }
    finally { setBusy(false); }
  };
  const verifyOtp = async () => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`${api}/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: form.phone, code: otp }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setVerified(true); setMessage('Your WhatsApp number is verified.');
    } catch (error) { setMessage(error.message || 'Incorrect OTP.'); }
    finally { setBusy(false); }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!verified) return setMessage('Verify your WhatsApp number before registering.');
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`${api}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(`Registration complete! A WhatsApp confirmation was sent to ${form.phone}.`);
    } catch (error) { setMessage(error.message || 'Registration could not be completed.'); }
    finally { setBusy(false); }
  };

  return <main><section className="card"><p className="eyebrow">SKC DANCE GROUP</p><h1>TAAL TARANG</h1><p className="intro">Register for the event. Verify your contact number with an OTP, then receive your confirmation on WhatsApp.</p>
    <form onSubmit={submit}>
      <label>Full name<input name="name" value={form.name} onChange={change} required /></label>
      <label>WhatsApp number<input name="phone" value={form.phone} onChange={change} placeholder="+91 98765 43210" required disabled={verified} /></label>
      {!verified && <div className="otp-row"><button type="button" onClick={requestOtp} disabled={busy}>{otpSent ? 'Resend OTP' : 'Send OTP'}</button>{otpSent && <><input aria-label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" inputMode="numeric" /><button type="button" onClick={verifyOtp} disabled={busy || !otp}>Verify</button></>}</div>}
      {verified && <p className="verified">✓ WhatsApp number verified</p>}
      <label>Email address<input type="email" name="email" value={form.email} onChange={change} required /></label>
      <div className="two"><label>Age<input type="number" name="age" min="1" value={form.age} onChange={change} required /></label><label>City<input name="city" value={form.city} onChange={change} required /></label></div>
      <button className="submit" disabled={busy}>{busy ? 'Please wait…' : 'Register now'}</button>
      {message && <p className="message" role="status">{message}</p>}
    </form>
  </section></main>;
}
createRoot(document.getElementById('root')).render(<RegistrationForm />);
