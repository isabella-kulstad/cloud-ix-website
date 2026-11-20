// Form definitions: which fields each form accepts, which are required,
// and how its notification email is titled.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const forms = {
  contact: {
    label: 'Contact',
    fields: ['topic', 'name', 'email', 'org', 'role', 'message'],
    required: ['name', 'email', 'message'],
    subject: (d) => `Website contact: ${d.topic || 'Message'} from ${d.name}`,
  },
  'hecvat-request': {
    label: 'HECVAT request',
    fields: ['name', 'title', 'institution', 'email', 'team', 'documents', 'timeline', 'notes', 'walkthrough'],
    required: ['name', 'institution', 'email', 'documents'],
    subject: (d) => `HECVAT request: ${d.institution} (${d.name})`,
    // Without JavaScript the browser sends the checked boxes as "docs".
    aliases: { documents: 'docs' },
  },
};

const MAX_LEN = 5000;

/**
 * Pick the known fields from a request body and validate them.
 * Returns { data } on success or { error } with a short reason.
 */
export function parseSubmission(form, body) {
  const data = {};
  for (const key of form.fields) {
    const raw = body[key] || body[form.aliases?.[key]];
    const value = Array.isArray(raw) ? raw.join(', ') : raw;
    if (typeof value === 'string' && value.trim()) data[key] = value.trim().slice(0, MAX_LEN);
  }
  const missing = form.required.filter((k) => !data[k]);
  if (missing.length) return { error: `Missing: ${missing.join(', ')}` };
  if (!EMAIL_RE.test(data.email)) return { error: 'Invalid email' };
  return { data };
}

/** Plain-text email body: one "Label: value" block per field. */
export function formatEmail(form, data) {
  const lines = form.fields
    .filter((k) => data[k])
    .map((k) => `${k[0].toUpperCase()}${k.slice(1)}:\n${data[k]}\n`);
  return `New ${form.label} submission from cloud-ix.com\n\n${lines.join('\n')}`;
}
