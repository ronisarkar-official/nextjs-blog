# Spechype — NextJs blog app

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()
[![Node version](https://img.shields.io/badge/node-%3E%3D18-green.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-%3E%3D15-blue.svg)]()

**Spechype** — All types of blogs for PC system requirements, performance guides, game-ready builds, and general tech content. This repository (`nextjs-blog`) is a production-ready Next.js starter configured with Sanity CMS, multiple editor options, authentication, and SEO tooling.

---

## Project Overview

A polished, SEO-first Next.js blog template tailored for publishing high-quality long-form articles, system requirement guides, performance testing write-ups, and general technology content. The project prioritizes fast page loads, a streamlined editor experience, and structured content management via Sanity. 

<p align="center">
  <img 
    src="https://ik.imagekit.io/2zeqzsn1n/image_2025-10-04_134448863.png?updatedAt=1759565612989" 
    alt="Event Storming Big Picture" 
    style="border-radius: 16px; max-width: 100%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);" 
  />
</p>

  
---

## Tech Stack

* **Framework:** Next.js (App Router)
* **UI:** React 19, Tailwind CSS
* **CMS:** Sanity (optional; repository includes Sanity integrations)
* **Editors:** Toast UI, React markdown editors (multiple options included)
* **Auth:** NextAuth.js
* **ORM / Data:** (Optional) Prisma / PostgreSQL (not bundled by default)
* **Utilities:** Sentry (error reporting), next-sitemap, sanitize-html

---

## Getting Started

Requirements:

* Node.js >= 18
* npm (tested with npm@10.5.2)

Clone and install:

```bash
git clone https://github.com/ronisarkar-official/nextjs-blog.git
cd nextjs-blog
npm install
```

Start development (Turbopack):

```bash
npm run dev
```

Open `http://localhost:3000` to view the app.

---

## Environment Variables

Create a `.env` file in project root. Minimum recommended variables:

```env
# -- Auth (NextAuth) ----------------------------------------------------
AUTH_SECRET="change-me-to-a-secure-random-value"
NEXTAUTH_URL="http://localhost:3000"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# -- Sanity CMS ---------------------------------------------------------
NEXT_PUBLIC_SANITY_PROJECT_ID="your-sanity-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2025-01-01"
SANITY_WRITE_TOKEN="your-sanity-write-token"

# -- Site metadata (public) --------------------------------------------
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Spechype"
NEXT_PUBLIC_SITE_TAGLINE="Explore game system requirements and tech insights"
NEXT_PUBLIC_SOCIAL_GITHUB="https://github.com/username"
NEXT_PUBLIC_SOCIAL_TWITTER="https://twitter.com/username"
NEXT_PUBLIC_SOCIAL_LINKEDIN="https://www.linkedin.com/in/username/"
NEXT_PUBLIC_SOCIAL_INSTAGRAM="https://www.instagram.com/username/"
NEXT_PUBLIC_SOCIAL_YOUTUBE="https://www.youtube.com/@username"
NEXT_PUBLIC_CONTACT_EMAIL="contact@yoursite.com"

```


✅ **Notes:**
- Uses fenced code block with `env` syntax highlighting (GitHub supports it).  
- Each field has a realistic placeholder you can later replace.  
- Safe for public README — no sensitive info included.



---

## Sanity & Type Generation

This repository includes Sanity tooling. The `typegen` script extracts the Sanity schema and generates TypeScript types. Ensure a `sanity/` directory with a valid Sanity project is present before running:

```bash
npm run typegen
```

If you are not using Sanity, remove or adapt the `typegen` steps and any Sanity imports.

---

## Scripts

* `dev` — `next dev --turbopack` (development)
* `build` — `next build --turbopack` (production build)
* `start` — `next start` (serve production)
* `lint` — run ESLint
* `typegen` — extract Sanity schema and generate types
* `predev` / `prebuild` — run `typegen` before dev/build
* `postbuild` — run `next-sitemap` after build

---

## Editors & Recommendations

Multiple editor packages are included. To keep the project maintainable and reduce bundle size, choose one editor and remove the rest. Recommendations:

* **Toast UI Editor** — excellent for markdown-heavy blogs, built-in code blocks and plugins.
* **@uiw / react-md-editor** — lightweight markdown editing with simpler UX.
* **TipTap** (not included by default) — if you need structured ProseMirror editing and collaboration later.

---

## Deployment

* **Vercel**: Recommended for seamless Next.js deployment. Add environment variables in the Vercel dashboard and deploy from the GitHub repo.
* Ensure `NEXTAUTH_SECRET` and any Sanity/Cloudinary/Stripe keys are configured in production.

---

## Development Best Practices

* Restrict canary versions for `next` / `react` in production or pin to stable releases if required.
* Strip unused editor dependencies to minimize install size and surface area.
* Run `npm run lint` before pushing PRs.
* Add CI (GitHub Actions) to run linting and build checks.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make changes; keep commits small and focused
4. Run linters and tests: `npm run lint`
5. Open a PR with a description of changes and screenshots if applicable

---

## License

This project is provided under the **MIT License**.

---

