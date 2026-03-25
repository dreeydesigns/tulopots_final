# TuloPots — Railway Deployment Guide
## For Andrew: step-by-step, no tech knowledge required

---

## STEP 1 — Create a free Railway account
1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with your GitHub account (free)

---

## STEP 2 — Upload TuloPots to GitHub
1. Go to **https://github.com** and create a free account
2. Click **"New Repository"** → name it `tulopots` → click **Create**
3. Download and install **GitHub Desktop**: https://desktop.github.com
4. Open GitHub Desktop → **Add Existing Repository** → select your Tulo project folder
5. Click **Publish Repository** → choose the `tulopots` repo you just created

---

## STEP 3 — Deploy on Railway
1. In Railway, click **"New Project"** → **"Deploy from GitHub Repo"**
2. Select your `tulopots` repository
3. Railway will auto-detect it as a Next.js app and start building

---

## STEP 4 — Add a PostgreSQL Database
1. In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway creates the database and auto-fills `DATABASE_URL` for you
3. In `prisma/schema.prisma`, change line 10 from:
   ```
   provider = "sqlite"
   ```
   to:
   ```
   provider = "postgresql"
   ```
4. Commit and push that change via GitHub Desktop

---

## STEP 5 — Add Environment Variables
In Railway → your app → **Variables** tab, add each of these:

| Variable | Value | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your Railway domain (e.g. `https://tulopots.up.railway.app`) | Railway → Settings → Domains |
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | See Step 6 below |
| `STRIPE_KES_TO_USD_RATE` | `130` | Update if exchange rate changes |
| `MPESA_BASE_URL` | `https://sandbox.safaricom.co.ke` (test) or `https://api.safaricom.co.ke` (live) | — |
| `MPESA_CONSUMER_KEY` | Your key | https://developer.safaricom.co.ke |
| `MPESA_CONSUMER_SECRET` | Your secret | https://developer.safaricom.co.ke |
| `MPESA_SHORTCODE` | Your till/paybill number | Safaricom |
| `MPESA_PASSKEY` | Your passkey | Safaricom |
| `MPESA_CALLBACK_URL` | `https://YOUR_DOMAIN/api/payments/mpesa/callback` | Use your Railway domain |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | https://console.anthropic.com |
| `WHATSAPP_NUMBER` | `254700000000` | Your business WhatsApp number |

---

## STEP 6 — Set Up Stripe Webhooks
1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. URL: `https://YOUR_RAILWAY_DOMAIN/api/payments/stripe/webhook`
4. Events to listen for: `checkout.session.completed` and `checkout.session.expired`
5. Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET` in Railway Variables

---

## STEP 7 — Set Up M-Pesa Callback
1. Log into https://developer.safaricom.co.ke
2. Go to your app → **STK Push** settings
3. Set **Callback URL** to: `https://YOUR_RAILWAY_DOMAIN/api/payments/mpesa/callback`

---

## STEP 8 — Get Your Custom Domain (optional, free on Railway)
1. Railway → Settings → **Domains**
2. Click **"Generate Domain"** — gives you a free `*.up.railway.app` URL
3. Or click **"Custom Domain"** to use your own domain (e.g. tulopots.co.ke)

---

## How Payments Work

### M-Pesa (Kenyan customers)
- Customer clicks **Pay via M-Pesa**
- An STK Push is sent to their phone
- They enter their M-Pesa PIN
- Safaricom calls your callback URL → order is marked PAID
- Customer is redirected to `/order-confirmation`

### Card / Stripe (international or card customers)
- Customer clicks **Pay by Card**
- They are redirected to Stripe's secure checkout page
- They pay in USD (automatically converted from KES at the rate you set)
- Stripe calls your webhook → order is marked PAID
- Customer lands on `/order-confirmation`

---

## Admin Access
- Sign in with email: `admin@tulopots.com` or any email containing `admin`
- Or your own email: `andrew@tulopots.com`
- Admin Dashboard: `/admin`

---

## Getting Help
If anything breaks, open WhatsApp and describe what page you are on and what error you see.
The error message is usually shown in red on screen — screenshot it and share it.

Railway free plan includes:
- $5/month of free usage (enough for a small store)
- 1 PostgreSQL database
- Automatic HTTPS
- Auto-deploys every time you push to GitHub
