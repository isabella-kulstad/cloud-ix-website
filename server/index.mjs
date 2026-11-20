// Production server for Cloud Run: serves the built Astro site from dist/
// and receives the Contact and HECVAT form submissions at /api/forms/:form.
//
// Each submission is saved to Firestore (collection "form_submissions") and
// emailed to FORM_TO via SMTP. Configuration (env vars):
//   FORM_TO        recipient (default support@cloud-ix.com)
//   FORM_FROM      sender address, must be allowed by the SMTP account
//   SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS
//   SAVE_TO_FIRESTORE  "false" to skip saving (default: save)
//   PORT           set by Cloud Run

import express from 'express';
import nodemailer from 'nodemailer';
import { Firestore } from '@google-cloud/firestore';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { forms, parseSubmission, formatEmail } from './forms.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const env = process.env;
const FORM_TO = env.FORM_TO || 'support@cloud-ix.com';

const mailer = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 587),
      secure: Number(env.SMTP_PORT) === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : null;
const db = env.SAVE_TO_FIRESTORE === 'false' ? null : new Firestore();

if (!mailer) console.warn('SMTP_HOST is not set: form submissions will not be emailed.');

// Small in-memory rate limit: 10 submissions per IP per 10 minutes (per instance).
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

app.use((_req, res, next) => {
  res.set({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});

app.post('/api/forms/:form', express.urlencoded({ extended: false, limit: '50kb' }), express.json({ limit: '50kb' }), async (req, res) => {
  const wantsHtml = !req.get('X-Requested-With'); // plain HTML form post (no JavaScript)
  const fail = (status, error) => (wantsHtml ? res.status(status).send(error) : res.status(status).json({ error }));

  const form = Object.hasOwn(forms, req.params.form) ? forms[req.params.form] : null;
  if (!form) return fail(404, 'Unknown form');
  const body = req.body || {};

  // Honeypot: bots fill the hidden field. Pretend success so they move on.
  if (body['bot-field']) return wantsHtml ? res.redirect(303, '/thanks') : res.json({ ok: true });
  if (rateLimited(req.ip)) return fail(429, 'Too many submissions, please try again later.');

  const { data, error } = parseSubmission(form, body);
  if (error) return fail(400, error);

  // Succeed if the submission reached at least one destination; log any failure.
  let delivered = false;
  if (db) {
    try {
      await db.collection('form_submissions').add({ form: req.params.form, ...data, createdAt: new Date() });
      delivered = true;
    } catch (err) {
      console.error(`Form "${req.params.form}": Firestore save failed:`, err);
    }
  }
  if (mailer) {
    try {
      await mailer.sendMail({
        from: env.FORM_FROM || env.SMTP_USER,
        to: FORM_TO,
        replyTo: data.email,
        subject: form.subject(data),
        text: formatEmail(form, data),
      });
      delivered = true;
    } catch (err) {
      console.error(`Form "${req.params.form}": email failed:`, err);
    }
  }
  if (!delivered) return fail(502, 'Could not send');

  return wantsHtml ? res.redirect(303, '/thanks') : res.json({ ok: true });
});

app.use(express.static(root, { extensions: ['html'], maxAge: '1h' }));
app.use((_req, res) => res.status(404).sendFile(path.join(root, '404.html')));

const port = Number(env.PORT || 8080);
app.listen(port, () => console.log(`Cloud IX site listening on :${port}`));
