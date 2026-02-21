# Technology Stack

**Analysis Date:** 2026-02-22

## Languages

**Primary:**
- TypeScript 5 - All source code, configuration files
- JavaScript - Post-CSS configuration (`postcss.config.mjs`), ESLint configuration (`eslint.config.mjs`)

**Secondary:**
- CSS - Tailwind CSS with custom theme variables defined in `app/globals.css`

## Runtime

**Environment:**
- Node.js - Server-side runtime (version not pinned in package.json)

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router and Server Components
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering

**UI & Component:**
- shadcn/ui (latest) - Accessible component library with new-york style preset
- Radix UI 1.4.3 - Headless component primitives (used by shadcn/ui)
- Tailwind CSS 4 - Utility-first CSS framework with PostCSS v4
- Lucide React 0.563.0 - Icon library

**Charting:**
- Recharts 3.7.0 - React charting library for KPI visualizations

**Authentication:**
- NextAuth.js 5.0.0-beta.30 - Authentication and session management with OAuth and Credentials providers

**Theme Management:**
- next-themes 0.4.6 - Dark mode toggle and theme provider

**Testing:**
- Not detected

**Build/Dev:**
- TypeScript 5 - Static type checking
- ESLint 9 - Code quality and linting
  - `eslint-config-next/core-web-vitals` - Next.js Core Web Vitals linting rules
  - `eslint-config-next/typescript` - TypeScript-specific ESLint rules
- Tailwind CSS PostCSS plugin 4 - CSS processing and Tailwind compilation
- tw-animate-css 1.4.0 - Animation utilities for Tailwind CSS
- shadcn CLI 3.8.4 - Component scaffolding and management tool

## Key Dependencies

**Critical:**
- googleapis 171.4.0 - Google Sheets API v4 client for data fetching
- class-variance-authority 0.7.1 - Type-safe CSS class composition (used by shadcn/ui)
- clsx 2.1.1 - Class name utility (conditional CSS classes)
- tailwind-merge 3.4.0 - Merge conflicting Tailwind CSS classes

**Infrastructure:**
- next-auth@beta 5.0.0-beta.30 - OAuth 2.0 with Google Provider and custom Credentials Provider support
- googleapis 171.4.0 - Service account authentication for Google Sheets API

## Configuration

**Environment:**
- Configuration via `.env.local` (not committed)
- Environment template: `.env.example`
- Critical variables:
  - `AUTH_SECRET` - NextAuth session encryption key (openssl rand -base64 32)
  - `AUTH_GOOGLE_ID` - Google OAuth client ID (optional, enables Google Provider)
  - `AUTH_GOOGLE_SECRET` - Google OAuth client secret (optional, enables Google Provider)
  - `ALLOWED_EMAILS` - Comma-separated email whitelist for login authorization
  - `GOOGLE_SHEETS_ID` - Spreadsheet ID for data fetching (optional, enables live Sheets)
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email for Sheets API authentication
  - `GOOGLE_PRIVATE_KEY` - Service account private key (newline escaping: `\\n` converted to actual newlines in code)

**Build:**
- TypeScript configuration: `tsconfig.json`
  - Target: ES2017
  - Module: esnext
  - Strict mode enabled
  - Path alias: `@/*` maps to project root
  - Next.js plugin enabled for type generation
- ESLint configuration: `eslint.config.mjs` (flat config format)
- PostCSS configuration: `postcss.config.mjs`
- Next.js configuration: `next.config.ts`
  - Image remote patterns: `lh3.googleusercontent.com` (Google profile images)

## Platform Requirements

**Development:**
- Node.js (no specific version enforced, defaults to system Node)
- npm 6+
- TypeScript 5
- Modern browser with CSS custom properties support

**Production:**
- Deployment target: Node.js server (Next.js)
- Vercel (recommended, optimized for Next.js) or self-hosted Node.js environment
- Requires environment variables for authentication and optional Google Sheets integration
- Image optimization via Next.js Image API with Google CDN support

---

*Stack analysis: 2026-02-22*
