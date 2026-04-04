# TuloPots V2 Security And Rollout Guide

This guide covers the parts of V2 that still need an operational switch-on after the code changes are deployed.

## 1. Apply The Database Schema

The V2 release adds:

- user roles, including `DELIVERY_ADMIN`
- security event logs
- login attempt tracking
- admin audit logs
- automation jobs
- notification attempts
- support threads, messages, and summaries
- deletion requests
- `deliveredAt` on orders
- `lastSeenAt` on auth sessions

Run this against the production database that Vercel uses:

```bash
npx prisma db push
```

If your team uses migrations instead of `db push`, generate and apply the migration in your normal deployment flow before enabling the new admin and support tooling.

## 2. Set Required Environment Variables

Add these in Vercel:

```text
OPERATIONS_AUTOMATION_SECRET=generate-a-long-random-secret
```

Recommended later:

```text
RESEND_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=...
TWILIO_SMS_FROM=...
TWILIO_VOICE_FROM=...
```

The current V2 release will work without the messaging provider keys because notifications run in internal mock mode and are logged in `NotificationAttempt`.

## 3. Turn On Vercel Protection

In the Vercel project dashboard:

1. Open `Settings`
2. Open `Security`
3. Turn on `Bot Protection`
4. Turn on `Attack Challenge Mode` for high-risk routes if needed
5. Add WAF or rate-limit rules for:
   - `/api/auth/*`
   - `/api/contact`
   - `/api/studio`
   - `/api/chat`
   - `/api/newsletter`
   - `/api/payments/*`
   - `/api/admin/*`

Recommended first-pass rules:

- stricter rate limits on login, signup, and payment-start routes
- bot filtering for admin and auth routes
- challenge suspicious traffic hitting admin or payment endpoints repeatedly

## 4. Admin Role Model

The admin system now supports:

- `SUPER_ADMIN`
- `OPERATIONS_ADMIN`
- `DELIVERY_ADMIN`
- `CONTENT_ADMIN`
- `SUPPORT_ADMIN`
- `ANALYST`

Suggested use:

- `SUPER_ADMIN`: credentials, roles, security, exports, payment review
- `OPERATIONS_ADMIN`: orders, fulfillment, delivery tracking, automation
- `DELIVERY_ADMIN`: pending deliveries, delivered orders, locations, customer handoff follow-up
- `CONTENT_ADMIN`: products, CMS, journal, newsletter
- `SUPPORT_ADMIN`: contact, studio, escalations, order support
- `ANALYST`: read-only dashboards and reporting

Existing admin users are treated as `SUPER_ADMIN` by the compatibility layer.

## 5. Delivery Policy Now Enforced

Current website policy:

- delivery to `Nairobi CBD` is `KES 350`
- orders above `KES 7,000` get free delivery within `Nairobi CBD`
- further Nairobi and upcountry locations may cost extra after routing review

The delivery role can now see:

- pending delivery stops
- delivered orders
- delivery locations

When an order is marked as delivered:

- the customer gets an automatic follow-up
- operations and delivery admins get a success notification

## 6. Automation Runner

The website now uses durable internal jobs for operations.

Current jobs include:

- `ORDER_ADVANCE`
- `DELIVERY_CHECKIN`
- `REVIEW_REQUEST`
- `LOW_STOCK_ALERT`
- `FAILED_PAYMENT_FOLLOWUP`
- `SUPPORT_ESCALATION_NOTIFY`
- `SUPPORT_DIGEST`
- `EMAIL_FOLLOWUP`
- `WHATSAPP_FOLLOWUP`
- `SMS_FALLBACK`
- `VOICE_CALLBACK_REQUEST`
- `DELIVERY_SUCCESS_CONFIRMATION`

To trigger the operations pass manually:

- use the admin automation panel, or
- call:

```text
POST /api/admin/automation
Authorization: Bearer <OPERATIONS_AUTOMATION_SECRET>
```

## 7. What Is Already Protected In Code

Sensitive routes now have:

- request validation
- sanitization
- rate limiting
- safer error responses
- security event logging
- permission checks

Uploads now have:

- MIME restrictions
- size restrictions
- metadata stripping
- randomized file names

## 8. Recommended Next Phase

After this V2 foundation is live, the next clean additions are:

1. connect real delivery providers for email, WhatsApp, SMS, and voice
2. add role-management UI for changing admin roles safely
3. add deletion/export request handling in admin
4. add a dedicated support inbox screen for support threads
5. move image uploads from data URLs to managed object storage
