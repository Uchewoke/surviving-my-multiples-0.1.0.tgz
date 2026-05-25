# Digital Product Delivery Guide

This guide helps you sell and deliver this project as a downloadable template product.

## Product Format

- Type: Source-code website template
- Framework: Next.js + TypeScript
- Delivery file: versioned `.tgz` archive

## Seller Workflow

1. Validate production build:

```bash
npm run product:prepare
```

2. Create the downloadable archive:

```bash
npm run product:package
```

3. Deliver the generated `.tgz` file from the project root.

## Buyer Onboarding Checklist

1. Extract package contents.
2. Run `npm install`.
3. Create `.env.local` if invite emails will be used.
4. Run `npm run dev`.
5. Customize branding, copy, and routes.
6. Deploy to preferred host (Vercel, Netlify, or self-hosted Node).

## Customization Points

- Brand copy and hero messaging: `app/page.tsx`
- Shared shell and navigation: `components/AppShell.tsx`
- Dashboard content sections: `app/dashboard/page.tsx`
- Theme tokens and layout styling: `app/globals.css`
- Metadata and SEO title/description: `app/layout.tsx`

## Environment Variables

Optional:

- `RESEND_API_KEY`: required only for live invite emails

If the key is not set, invite creation still works in storage, and email sending is skipped.

## Recommended Marketplace Listing Notes

- "Built with Next.js 16 + TypeScript"
- "Responsive dashboard and onboarding flow"
- "API-ready structure with file-based MVP persistence"
- "Commercial use for one end product per license"

## Support Policy Template (Optional)

Use this as a starting point in your listing:

- 30 days of installation support
- Custom feature work billed separately
- No support for third-party hosting incidents outside template scope
