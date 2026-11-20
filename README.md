# Cloud IX website

Marketing site for Cloud IX, built with [Astro](https://astro.build).

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Structure

- `src/layouts/BaseLayout.astro` – page shell: fonts, safety bar, footer, quick-exit button.
- `src/components/` – shared building blocks:
  - `SkyHero` + `PageIntro` – the light-sky header band (nav, stars, drifting clouds, cloud bank) and standard hero copy.
  - `Button` – pill buttons (`primary`, `outline`, `light`, `outline-dark`; `sm`/`md`/`lg`).
  - `SectionHeading`, `FaqItem`, `LegalDocWithToc`, `Cloud`, `ShootingStar`, `Logo`.
- `src/data/site.ts` – routes, nav and footer links. Link to pages via `routes.*`.
- `src/styles/global.css` – design tokens (CSS variables), shared classes and the animation utilities.
- `src/pages/` – one file per route.

Animations respect `prefers-reduced-motion`.

## Forms

The Contact and HECVAT forms post to `/api/forms/contact` and
`/api/forms/hecvat-request`, handled by `server/index.mjs` (form fields are
defined in `server/forms.mjs`). Each submission is saved to Firestore
(`form_submissions` collection) and emailed to `support@cloud-ix.com` with
Reply-To set to the sender. They work without JavaScript too (redirect to
`/thanks`). `npm run dev` has no form backend; to test forms locally:

```bash
npm run build
SAVE_TO_FIRESTORE=false SMTP_HOST=... SMTP_USER=... SMTP_PASS=... npm start   # http://localhost:8080
```

## Deploy (Google Cloud Run)

One-time setup (replace `PROJECT_ID`; region defaults to `us-central1`):

```bash
gcloud config set project PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com secretmanager.googleapis.com
gcloud artifacts repositories create web --repository-format=docker --location=us-central1
gcloud firestore databases create --location=nam5
gcloud iam service-accounts create cloud-ix-website
gcloud projects add-iam-policy-binding PROJECT_ID --member=serviceAccount:cloud-ix-website@PROJECT_ID.iam.gserviceaccount.com --role=roles/datastore.user
printf '%s' 'SMTP_PASSWORD_HERE' | gcloud secrets create smtp-password --data-file=-
gcloud secrets add-iam-policy-binding smtp-password --member=serviceAccount:cloud-ix-website@PROJECT_ID.iam.gserviceaccount.com --role=roles/secretmanager.secretAccessor
```

Cloud Build's service account also needs permission to deploy: grant it
`roles/run.admin` and `roles/iam.serviceAccountUser` (Cloud Build → Settings
lets you toggle both).

Deploy:

```bash
gcloud builds submit --config cloudbuild.yaml
```

To deploy on every push to `main`, create a Cloud Build trigger for this
GitHub repo using `cloudbuild.yaml`. Then map the domain in Cloud Run →
Manage custom domains (or put a load balancer in front) and add the DNS
records it shows.

Email defaults to Google Workspace SMTP (`smtp.gmail.com`, user
`support@cloud-ix.com`, password = a Google app password). For another
provider, change the `_SMTP_*` / `_FORM_FROM` substitutions in
`cloudbuild.yaml` (e.g. SendGrid: host `smtp.sendgrid.net`, user `apikey`,
password = API key).
