# Surviving My Multiples - Downloadable Digital Product

This repository is now set up as a downloadable website template product that buyers can install, customize, and launch.

## Product Positioning

- Product type: Next.js + TypeScript template
- Audience: families with multiples, parenting creators, agencies, and no-code/low-code operators
- Delivery format: source code + docs + commercial usage terms

## What Buyers Receive

- Responsive landing page
- Family dashboard with schedule, sleep, feeding, cost, and support task visibility
- Onboarding flow with role selection (parent/caregiver/support)
- Settings page for plan, alerts, team access, and invite flow
- API routes for plan, onboarding, notifications, invites, team, and quick tips
- Integration notes for email invites with Resend

## Quick Start (Buyer)

From the workspace root, you can run a one-step dev command:

```bash
npm run dev
```

This command automatically checks dependencies and starts the app in `package/`.

From the workspace root, you can also run a one-step production preview command:

```bash
npm run start
```

This command checks dependencies, builds, and starts the production server in `package/`.

1. Install dependencies:

```bash
npm install
```

2. Run in development:

```bash
npm run dev
```

3. Open in browser:

```text
http://localhost:3000
```

4. Optional production check:

```bash
npm run start
```

## Mobile Setup Notes

If you only have a phone, use this workflow:

1. Fork or upload this repo to GitHub.
2. Open it in a browser-based dev environment (for example, GitHub Codespaces).
3. Run `npm install` and `npm run dev` in the cloud terminal.
4. Open the forwarded preview URL on your phone browser.
5. Make lightweight content/style edits, then commit and push.

Notes:

- Best for small updates, content edits, and responsive QA.
- Full customization and debugging are still easier on a laptop/desktop.
- You can also deploy first (Vercel/Netlify) and manage minor updates from mobile dashboards.

Quick example (Vercel mobile deployment checks):

1. Push your latest commit to GitHub.
2. In the Vercel mobile dashboard, open your project and wait for the deployment to show `Ready`.
3. Tap the deployment URL and test on your phone:
	- Home page layout and navigation
	- Dashboard page load and key cards
	- Onboarding and settings route access
4. If anything looks off, open the deployment logs in Vercel, fix in your cloud editor, and push again.

## Create the Downloadable Product Archive (Seller)

Use the scripts below to validate production build and package the product:

```bash
npm run product:prepare
npm run product:package
```

Or run both with one command:

```bash
npm run product:bundle
```

This generates a versioned `.tgz` package in the project root (for example, `surviving-my-multiples-0.1.0.tgz`) that can be uploaded to marketplaces or delivered directly.

## Included Product Docs

- `DIGITAL_PRODUCT.md`: setup, customization, and delivery checklist
- `BACKEND_SETUP.md`: invite API and Resend integration
- `LICENSE-DIGITAL-PRODUCT.md`: commercial usage terms for digital product sales
- `CHANGELOG.md`: versioned release notes for marketplace updates
- `marketplace/`: ready-to-paste listing assets (sales copy, features, FAQ, support policy)

## Tech Stack

- Next.js 16
- TypeScript
- React 19

## Suggested Product Roadmap

- Add authentication (Clerk, NextAuth, or custom)
- Replace file storage with PostgreSQL + Prisma
- Add Stripe billing for hosted/SaaS upsell version
- Add localization and white-label themes
