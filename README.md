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

## Deploy (Netlify)

`netlify.toml` holds the build settings; every push to `main` deploys.

The Contact (`contact`) and HECVAT (`hecvat-request`) forms submit to
[Netlify Forms](https://docs.netlify.com/forms/setup/). Submissions appear in
the Netlify dashboard under *Forms*; set up email notifications there. Locally
(`npm run dev`) there is no form backend, so submitting shows the error message.
