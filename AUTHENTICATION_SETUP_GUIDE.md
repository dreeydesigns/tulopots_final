# TuloPots Authentication Setup Guide
## Simple step-by-step setup for every platform

This guide is written for the current TuloPots setup as it exists in code today.

Use this guide if:
- you have not bought `tulopots.com` yet
- you are using a live Vercel URL for now
- you want the exact values that match the current app

---

## 1. Start Here

Before you open any dashboard, keep these four things written down in one note:

1. Your live website URL
2. The Gmail account you control and will use for Google setup
3. Your Vercel project name
4. Your current production database connection string

For the current app, use this live host everywhere in the setup:

```text
https://tulopots-final.vercel.app
```

---

## 2. Current TuloPots Values From The Code

These values are already fixed by the app and should not be guessed.

### Google callback
```text
https://tulopots-final.vercel.app/api/auth/oauth/callback/google
```

### Apple callback
```text
https://tulopots-final.vercel.app/api/auth/oauth/callback/apple
```

### Stripe webhook
```text
https://tulopots-final.vercel.app/api/payments/stripe/webhook
```

### M-Pesa callback
```text
https://tulopots-final.vercel.app/api/payments/mpesa/callback
```

### Search Console verification token env var
```text
GOOGLE_SITE_VERIFICATION
```

---

## 3. Vercel First

Everything else depends on one stable live website URL.

### What to do

1. Open Vercel.
2. Open the TuloPots project.
3. Click `Settings`.
4. Click `Domains` or confirm the project production URL.
5. Open the live site in a browser.
6. Make sure the homepage loads.

### What success looks like

You can open the website in a browser using one stable address.

---

## 4. Add The Core Vercel Environment Variables

Do this once before setting up the providers.

### Where to click

1. Open Vercel.
2. Open the TuloPots project.
3. Click `Settings`.
4. Click `Environment Variables`.

### Add these keys

```text
DATABASE_URL
NEXT_PUBLIC_SITE_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
GOOGLE_SITE_VERIFICATION
APPLE_CLIENT_ID
APPLE_TEAM_ID
APPLE_KEY_ID
APPLE_PRIVATE_KEY
APPLE_REDIRECT_URI
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_KES_TO_USD_RATE
MPESA_BASE_URL
MPESA_CONSUMER_KEY
MPESA_CONSUMER_SECRET
MPESA_SHORTCODE
MPESA_PASSKEY
MPESA_CALLBACK_URL
NEXT_PUBLIC_GA_MEASUREMENT_ID
NEXT_PUBLIC_GOOGLE_ADS_ID
OPERATIONS_AUTOMATION_SECRET
```

### Add these values now

```text
NEXT_PUBLIC_SITE_URL=https://tulopots-final.vercel.app
GOOGLE_REDIRECT_URI=https://tulopots-final.vercel.app/api/auth/oauth/callback/google
APPLE_REDIRECT_URI=https://tulopots-final.vercel.app/api/auth/oauth/callback/apple
MPESA_CALLBACK_URL=https://tulopots-final.vercel.app/api/payments/mpesa/callback
STRIPE_KES_TO_USD_RATE=130
```

If you do not have the other values yet, leave them until the relevant step below.

### What success looks like

The environment variable screen is ready and you know where each new key will go.

---

## 5. Google Sign-In

This is the best first real login to set up.

Because you do not own `tulopots.com` yet, keep Google in `Testing` mode for now.

### Step 5.1: Create the Google project

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project switcher at the top.
3. Click `New Project`.
4. Name it `TuloPots`.
5. Click `Create`.

### Step 5.2: Open Google Auth Platform

1. In the left menu, open `Google Auth Platform`.
2. Open `Branding`.

### Step 5.3: Fill the Branding page

Use these values:

```text
App name: TuloPots
User support email: the Gmail you control
Developer contact information: the Gmail you control
```

### Important note about the "Missing domain" error

If Google shows:

```text
Missing domain: tulopots-final.vercel.app
```

do this:

1. Remove the `Application home page`
2. Remove the `Privacy policy`
3. Remove the `Terms of service`
4. Leave `Authorized domains` empty
5. Save

This is the correct temporary approach while the app is still in Testing mode and still using a shared Vercel subdomain.

### Step 5.4: Set the audience

1. Open `Audience`.
2. Choose `External`.
3. Keep the app in `Testing`.
4. Add your Gmail as a `Test user`.

### Step 5.5: Create the Google web client

1. Open `Clients`.
2. Click `Create client`.
3. Choose `Web application`.

Use these exact values:

```text
Name: TuloPots Web
Authorized JavaScript origins: https://tulopots-final.vercel.app
Authorized redirect URIs: https://tulopots-final.vercel.app/api/auth/oauth/callback/google
```

Click `Create`.

Google will show two values:

```text
Client ID
Client Secret
```

### Step 5.6: Put the Google values into Vercel

Go back to Vercel and add:

```text
GOOGLE_CLIENT_ID=the Client ID from Google
GOOGLE_CLIENT_SECRET=the Client Secret from Google
GOOGLE_REDIRECT_URI=https://tulopots-final.vercel.app/api/auth/oauth/callback/google
```

### Step 5.7: Redeploy

1. Open the Vercel project.
2. Open `Deployments`.
3. Redeploy the latest production deployment.

### Step 5.8: Test it

1. Open the website.
2. Open sign in.
3. Click `Sign in with Google`.
4. Log in with the Gmail you added as a test user.

### What success looks like

Google opens, you approve access, and you return to TuloPots already signed in.

---

## 6. Google Analytics

This gives you website traffic and behavior tracking.

### Step 6.1: Create the GA4 property

1. Open [Google Analytics](https://marketingplatform.google.com/about/analytics/).
2. Click `Start measuring`.
3. Create an account named `TuloPots`.
4. Create a property named `TuloPots`.
5. Choose your timezone and currency.

### Step 6.2: Create the web data stream

1. Choose `Web`.
2. Enter your website URL:

```text
https://tulopots-final.vercel.app
```

3. Stream name:

```text
TuloPots Web
```

4. Click `Create stream`.

Google will show a value that looks like this:

```text
G-XXXXXXXXXX
```

### Step 6.3: Put the value into Vercel

Add this in Vercel:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 6.4: Redeploy

Redeploy the site in Vercel.

### What success looks like

Analytics is live and the site loads without errors.

---

## 7. Google Search Console

This helps Google index the site properly.

Because you do not own `tulopots.com` yet, use `URL prefix`, not `Domain`.

### Step 7.1: Add the property

1. Open [Google Search Console](https://search.google.com/search-console/about).
2. Click `Start now`.
3. Click `Add property`.
4. Choose `URL prefix`.
5. Enter:

```text
https://tulopots-final.vercel.app/
```

### Step 7.2: Choose HTML tag verification

1. Choose `HTML tag`.
2. Google will show a meta tag.

It usually looks like this:

```html
<meta name="google-site-verification" content="TOKEN_HERE" />
```

### Step 7.3: Copy only the token

Copy only the value inside `content=""`.

Example:

```text
TOKEN_HERE
```

### Step 7.4: Put the token into Vercel

Add this in Vercel:

```text
GOOGLE_SITE_VERIFICATION=TOKEN_HERE
```

### Step 7.5: Redeploy

Redeploy the site in Vercel.

### Step 7.6: Verify in Search Console

Go back to Search Console and click `Verify`.

### What success looks like

Search Console says the property is verified.

---

## 8. Stripe Card Payments

Do this in two parts:
- test mode first
- live mode after that works

### Step 8.1: Create the Stripe account

1. Open [Stripe Dashboard](https://dashboard.stripe.com/).
2. Create an account or sign in.
3. Turn on `Test mode`.

### Step 8.2: Copy the test secret key

1. Open `Developers`.
2. Open `API keys`.
3. Copy the `Secret key`.

It usually starts with:

```text
sk_test_
```

### Step 8.3: Add the Stripe webhook

1. In Stripe, open `Developers`.
2. Open `Webhooks`.
3. Click `Add endpoint`.
4. Use this URL:

```text
https://tulopots-final.vercel.app/api/payments/stripe/webhook
```

5. Select these events:

```text
checkout.session.completed
checkout.session.expired
```

6. Save the endpoint.
7. Copy the signing secret.

It usually starts with:

```text
whsec_
```

### Step 8.4: Put the Stripe values into Vercel

Add these:

```text
STRIPE_SECRET_KEY=your Stripe secret key
STRIPE_WEBHOOK_SECRET=your Stripe webhook signing secret
STRIPE_KES_TO_USD_RATE=130
```

### Step 8.5: Redeploy

Redeploy the site.

### Step 8.6: Test the card flow

1. Add a product to cart.
2. Go to checkout.
3. Choose card payment.
4. Complete a test payment in Stripe Checkout.

### What success looks like

You are sent to Stripe Checkout, the payment completes, and the order updates correctly inside TuloPots.

### Live Stripe later

When you are ready for real payments:

1. Turn off `Test mode` in Stripe.
2. Copy the live secret key.
3. Create a new live webhook using the same endpoint.
4. Replace the Vercel values with the live values.
5. Redeploy.

---

## 9. M-Pesa

Do this in two parts:
- sandbox first
- live later

### Step 9.1: Create the Daraja app

1. Open [Safaricom Daraja](https://developer.safaricom.co.ke/).
2. Create an account or sign in.
3. Create a new app.
4. Copy:
   - Consumer Key
   - Consumer Secret

### Step 9.2: Set the base URL

For sandbox use:

```text
https://sandbox.safaricom.co.ke
```

### Step 9.3: Use the TuloPots callback

Use this callback:

```text
https://tulopots-final.vercel.app/api/payments/mpesa/callback
```

### Step 9.4: Put the M-Pesa values into Vercel

Add these:

```text
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CONSUMER_KEY=your consumer key
MPESA_CONSUMER_SECRET=your consumer secret
MPESA_SHORTCODE=your shortcode
MPESA_PASSKEY=your passkey
MPESA_CALLBACK_URL=https://tulopots-final.vercel.app/api/payments/mpesa/callback
```

### Step 9.5: Redeploy

Redeploy the site.

### Step 9.6: Test M-Pesa

1. Add a product to cart.
2. Choose M-Pesa.
3. Enter the phone number.
4. Start the STK push.

### What success looks like

The STK push starts and the callback returns to the website correctly.

### Live M-Pesa later

When you are ready for real payments:

1. Switch from sandbox to live Safaricom credentials.
2. Replace:

```text
MPESA_BASE_URL
MPESA_CONSUMER_KEY
MPESA_CONSUMER_SECRET
MPESA_SHORTCODE
MPESA_PASSKEY
MPESA_CALLBACK_URL
```

3. Redeploy the site.

---

## 10. Apple Sign In

Apple Sign In comes later because it needs an Apple Developer account.

### Step 10.1: Confirm you have Apple Developer access

You need:
- an Apple Developer account
- the Sign in with Apple capability for the web

### Step 10.2: Create the web configuration

Inside Apple Developer:

1. Create or open the right identifier setup.
2. Enable `Sign in with Apple`.
3. Configure it for the web.

Use:

```text
Domain: your live host without https://
Return URL: https://tulopots-final.vercel.app/api/auth/oauth/callback/apple
```

Example domain:

```text
tulopots-final.vercel.app
```

### Step 10.3: Create the Apple private key

Apple will give you:

```text
APPLE_CLIENT_ID
APPLE_TEAM_ID
APPLE_KEY_ID
APPLE_PRIVATE_KEY
```

### Step 10.4: Put the Apple values into Vercel

Add:

```text
APPLE_CLIENT_ID=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY=...
APPLE_REDIRECT_URI=https://tulopots-final.vercel.app/api/auth/oauth/callback/apple
```

### Step 10.5: Redeploy

Redeploy the site.

### Step 10.6: Test Apple Sign In

1. Open the TuloPots sign in flow.
2. Click Apple sign in.
3. Complete the Apple flow.

### What success looks like

You return to TuloPots signed in with Apple.

---

## 11. Google Ads Later

This is optional for now.

If you create Google Ads later, add:

```text
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
```

Then redeploy.

---

## 12. Operations Automation Secret

This is not a customer login.

It is a private secret for scheduled automation calls later.

### What it does

It protects this route:

```text
/api/admin/automation
```

### What to set

Create a long random value and add:

```text
OPERATIONS_AUTOMATION_SECRET=your_long_random_secret
```

You do not need this before Google, Stripe, or M-Pesa.

It is for the next automation phase.

---

## 13. When You Buy `tulopots.com`

After the custom domain is live, replace the current Vercel URL everywhere with:

```text
https://tulopots.com
```

Then update:

1. Google Sign-In redirect URI
2. Google Branding page URLs
3. Search Console property
4. Stripe webhook URL
5. M-Pesa callback URL
6. Apple return URL
7. `NEXT_PUBLIC_SITE_URL`
8. `GOOGLE_REDIRECT_URI`
9. `APPLE_REDIRECT_URI`
10. `MPESA_CALLBACK_URL`

---

## 14. Final Checklist

Use this quick checklist after every platform is done.

- Vercel site loads
- Google sign-in works
- Analytics value is added
- Search Console verifies
- Stripe test payment works
- M-Pesa sandbox works
- Apple sign-in works
- All new env vars are saved in Vercel
- The latest production deployment has been redeployed

---

## 15. Official Links

- [Google OAuth for web applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google OAuth consent setup](https://developers.google.com/workspace/guides/configure-oauth-consent)
- [Google OAuth brand verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification)
- [Google Analytics](https://marketingplatform.google.com/about/analytics/)
- [Google Search Console](https://search.google.com/search-console/about)
- [Stripe webhooks](https://docs.stripe.com/development/dashboard/webhooks)
- [Safaricom Daraja](https://developer.safaricom.co.ke/)
- [Apple Sign in with Apple for the web](https://developer.apple.com/help/account/configure-app-capabilities/configure-sign-in-with-apple-for-the-web)
