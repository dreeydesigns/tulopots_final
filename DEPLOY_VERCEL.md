# TuloPots — Vercel Migration Guide
## Phase 1: move app hosting to Vercel, keep PostgreSQL on Railway

This migration keeps the current Railway PostgreSQL database in place and only moves
the web app hosting to Vercel. That is the safest first cutover because it avoids a
database migration, keeps Prisma stable, and lets payments/auth switch hosts with less risk.

---

## Step 1 — Create the Vercel project
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **Add New...** -> **Project**
4. Import the repository: `dreeydesigns/tulopots_final`
5. Keep the framework as **Next.js**

---

## Step 2 — Add environment variables in Vercel
Open the Vercel project -> **Settings** -> **Environment Variables**

Add these keys:

### Required now
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`

### Required for card payments
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_KES_TO_USD_RATE`

### Required for M-Pesa
- `MPESA_BASE_URL`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`

### Required for sign-in providers
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `APPLE_CLIENT_ID`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`
- `APPLE_REDIRECT_URI`

### Optional but recommended
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_ID`
- `WHATSAPP_NUMBER`
- `ANTHROPIC_API_KEY`

Notes:
- Use the current Railway PostgreSQL connection string for `DATABASE_URL`.
- Set `NEXT_PUBLIC_SITE_URL` to the Vercel production URL, for example
  `https://your-project.vercel.app`.
- Set `MPESA_CALLBACK_URL` to
  `https://your-project.vercel.app/api/payments/mpesa/callback`
- Set `GOOGLE_REDIRECT_URI` to
  `https://your-project.vercel.app/api/auth/oauth/callback/google`
- Set `APPLE_REDIRECT_URI` to
  `https://your-project.vercel.app/api/auth/oauth/callback/apple`

---

## Step 3 — Deploy
1. In Vercel, click **Deploy**
2. Wait for the production deployment to finish
3. Open the generated `*.vercel.app` URL

---

## Step 4 — Reconnect live callbacks

### Stripe
In Stripe Dashboard -> **Developers** -> **Webhooks**
- add endpoint:
  `https://your-project.vercel.app/api/payments/stripe/webhook`
- subscribe to:
  - `checkout.session.completed`
  - `checkout.session.expired`
- copy the signing secret into `STRIPE_WEBHOOK_SECRET`

### M-Pesa
In the Safaricom Daraja app settings:
- update callback URL to:
  `https://your-project.vercel.app/api/payments/mpesa/callback`

### Google OAuth
In Google Cloud Console:
- authorized JavaScript origin:
  `https://your-project.vercel.app`
- authorized redirect URI:
  `https://your-project.vercel.app/api/auth/oauth/callback/google`

### Apple Sign-In
In Apple Sign-In configuration:
- callback URL:
  `https://your-project.vercel.app/api/auth/oauth/callback/apple`

---

## Step 5 — Smoke test after deploy
Check these in order:
1. Homepage loads
2. Product page loads
3. Admin sign-in works
4. Normal sign-in works
5. Cart -> checkout creates an order
6. Stripe redirect works
7. M-Pesa request returns successfully
8. Contact form submits
9. Studio submit works
10. Product image upload in admin still works

---

## Step 6 — Buy domain later
When `tulopots.com` is ready:
1. Add the domain in Vercel
2. Point DNS to Vercel
3. Change:
   - `NEXT_PUBLIC_SITE_URL`
   - `MPESA_CALLBACK_URL`
   - `GOOGLE_REDIRECT_URI`
   - `APPLE_REDIRECT_URI`
   - Stripe webhook endpoint

---

## Important
- Do not move the database in the same step as the hosting migration unless we decide to do a dedicated database cutover.
- The app is already compatible with Vercel serverless hosting because the upload handlers process images in memory instead of writing to local disk.
