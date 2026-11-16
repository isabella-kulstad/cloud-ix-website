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
  - `SectionHeading`, `FaqItem`, `LegalDoc`, `Cloud`, `ShootingStar`, `Logo`.
- `src/data/site.ts` – routes, nav and footer links. Link to pages via `routes.*`.
- `src/styles/global.css` – design tokens (CSS variables), shared classes and the animation utilities.
- `src/pages/` – one file per route.

Animations respect `prefers-reduced-motion`. Forms are client-side only for now; look for `TODO` comments where submission needs a backend.
