# TuloPots — Vercel Deployment Guide
## Vercel is now the primary hosting platform

This guide assumes TuloPots is deployed on Vercel and that all public callbacks,
auth redirects, and platform links should point to the live Vercel production URL
or your custom domain once that is ready.

---

## Step 1 — Open the Vercel project

1. Go to [Vercel](https://vercel.com).
2. Sign in.
3. Open the TuloPots project.
4. Confirm the production URL is correct.

Example:

```text
https://your-project.vercel.app
```

---

## Step 2 — Add environment variables

Open:

`Project -> Settings -> Environment Variables`

Add these keys:

### Required now
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`

### Sign-in providers
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_SITE_VERIFICATION`
- `APPLE_CLIENT_ID`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`
- `APPLE_REDIRECT_URI`

### Payments
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_KES_TO_USD_RATE`
- `MPESA_BASE_URL`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`

### Recommended
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_ID`
- `ADMIN_EMAILS`
- `WHATSAPP_NUMBER`
- `ANTHROPIC_API_KEY`
- `OPERATIONS_AUTOMATION_SECRET`

Set these values immediately:

```text
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
GOOGLE_REDIRECT_URI=https://your-project.vercel.app/api/auth/oauth/callback/google
APPLE_REDIRECT_URI=https://your-project.vercel.app/api/auth/oauth/callback/apple
MPESA_CALLBACK_URL=https://your-project.vercel.app/api/payments/mpesa/callback
STRIPE_KES_TO_USD_RATE=130
```

---

## Step 3 — Deploy or redeploy

1. Open `Deployments`.
2. Trigger a production deployment or redeploy the latest one.
3. Wait for the deployment to finish.
4. Open the live site.

---

## Step 4 — Point all external platforms to Vercel

### Google Sign-In

Use:

```text
Authorized JavaScript origin:
https://your-project.vercel.app

Authorized redirect URI:
https://your-project.vercel.app/api/auth/oauth/callback/google
```

### Apple Sign In

Use:

```text
Return URL:
https://your-project.vercel.app/api/auth/oauth/callback/apple
```

### Stripe webhook

Use:

```text
https://your-project.vercel.app/api/payments/stripe/webhook
```

### M-Pesa callback

Use:

```text
https://your-project.vercel.app/api/payments/mpesa/callback
```

### Search Console

Use the Vercel production URL as the property:

```text
https://your-project.vercel.app/
```

---

## Step 5 — Smoke test after deploy

Check these in order:

1. Homepage loads
2. Product page loads
3. Sign in opens
4. Admin sign-in works
5. Cart creates an order
6. Card checkout redirects properly
7. M-Pesa request starts
8. Contact form submits
9. Studio brief submits
10. Order tracking loads

---

## Step 6 — When the custom domain is ready

When `tulopots.com` is live:

1. Add it in `Vercel -> Settings -> Domains`
2. Update DNS
3. Replace the Vercel URL in:
   - `NEXT_PUBLIC_SITE_URL`
   - `GOOGLE_REDIRECT_URI`
   - `APPLE_REDIRECT_URI`
   - `MPESA_CALLBACK_URL`
   - Stripe webhook endpoint
   - Google Sign-In origin
   - Google Search Console property

---

## Important

- Keep Vercel as the public source of truth for all callbacks and redirect URLs.
- If you see a database reachability warning during a local build, that comes from the `DATABASE_URL` host, not from Vercel hosting itself.
- If your database has also moved, update `DATABASE_URL` locally and in Vercel before rebuilding.
