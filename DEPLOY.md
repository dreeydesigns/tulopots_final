# TuloPots — Deployment Guide
## Simple Vercel-first deployment steps

This project now treats Vercel as the primary hosting platform.

---

## 1. Open the project in Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign in
3. Open the TuloPots project
4. Confirm the production URL

Example:

```text
https://your-project.vercel.app
```

---

## 2. Add environment variables

Open:

`Settings -> Environment Variables`

Add:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_SITE_VERIFICATION`
- `APPLE_CLIENT_ID`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`
- `APPLE_REDIRECT_URI`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_KES_TO_USD_RATE`
- `MPESA_BASE_URL`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_ID`
- `ADMIN_EMAILS`
- `WHATSAPP_NUMBER`
- `ANTHROPIC_API_KEY`
- `OPERATIONS_AUTOMATION_SECRET`

---

## 3. Use these callback values

Replace `YOUR_HOST` with your live Vercel URL.

```text
NEXT_PUBLIC_SITE_URL=YOUR_HOST
GOOGLE_REDIRECT_URI=YOUR_HOST/api/auth/oauth/callback/google
APPLE_REDIRECT_URI=YOUR_HOST/api/auth/oauth/callback/apple
MPESA_CALLBACK_URL=YOUR_HOST/api/payments/mpesa/callback
Stripe webhook=YOUR_HOST/api/payments/stripe/webhook
```

---

## 4. Deploy

1. Open `Deployments`
2. Start a production deployment
3. Wait for it to finish
4. Open the site

---

## 5. Test the important flows

1. Homepage
2. Sign in
3. Admin
4. Cart
5. Card checkout
6. M-Pesa checkout
7. Contact form
8. Studio brief
9. Delivery tracking

---

## 6. Move to the custom domain later

Once `tulopots.com` is ready:

1. Add the domain in Vercel
2. Update DNS
3. Replace the Vercel URL in all callbacks and env vars

---

## Notes

- Vercel is the public host now.
- Callback URLs should always use the live Vercel production URL until the custom domain is live.
- Database warnings during local builds are tied to the database connection host in `DATABASE_URL`, not the Vercel frontend host.
