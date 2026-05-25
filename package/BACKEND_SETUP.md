# Backend Integration Setup (Template Buyers)

This guide covers how to set up the caregiver invite backend and optional email functionality after downloading the template.

## What's Been Implemented

### API Routes
- **POST /api/invites** - Create a new caregiver invite
  - Accepts: `name`, `email`, `relationship`, `access`
  - Stores invite in `.data/invites.json`
  - Sends email via Resend
  - Returns created invite with ID and status

- **GET /api/invites** - Retrieve all pending invites
  - Returns array of invites from storage

### File-Based Storage
Invites are stored in `.data/invites.json` for MVP persistence. To scale, migrate to a database like Neon PostgreSQL.

### Email Service
The app uses **Resend** (https://resend.com) to send caregiver invitations. 

## Setting Up Email Sending

### 1. Create a Resend Account
1. Go to https://resend.com
2. Sign up for a free account (no credit card required initially)
3. Navigate to API Keys section

### 2. Get Your API Key
1. Create a new API key
2. Copy the key (it starts with `re_`)

### 3. Configure Environment Variable
1. Open `.env.local` in the project root
2. Replace the placeholder with your actual Resend API key:
   ```
   RESEND_API_KEY=re_your_actual_key_here
   ```
3. Restart the dev server (`npm run dev`)

### 4. Update Email From Address
Currently, emails are sent from `noreply@survivingmymultiples.com`. For Resend:
- Free tier allows sending from `onboarding@resend.dev` by default
- To use a custom domain, verify your domain in Resend dashboard
- Update the `from` field in `app/api/invites/route.ts`

## Testing the Flow

1. Navigate to `/settings`
2. Fill out the invite form (name, email, relationship, access level)
3. Click "Send Invite"
4. Check your email for the invitation (may be in spam)
5. If no API key is configured:
   - Invite will still be created and stored
   - Email sending will silently fail with a warning in console
   - This allows testing the UI without email setup

## Database Migration (Future)

When ready to move from file storage to a real database:

1. **Recommended**: Use Neon PostgreSQL with Prisma ORM
2. Replace `lib/invites.ts` with database queries
3. Update API routes to use database instead of file storage
4. Benefits:
   - Persistent across server restarts
   - Support for concurrent operations
   - Scalability for production

## Troubleshooting

**Emails not sending:**
- Check that `RESEND_API_KEY` is set in `.env.local`
- Check browser console and server logs for errors
- Verify email address is valid
- Check spam/junk folder

**Invites not persisting across page reloads:**
- Check that `.data/invites.json` file exists
- Verify file permissions allow write access
- Check server logs for file system errors

**"Cannot find module 'resend'":**
- Run `npm install resend` to install the package
