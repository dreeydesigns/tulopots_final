// ─── TuloPots Payment Library ─────────────────────────────────────────────────
// Stripe: charges in USD (KES not supported by Stripe).
//   - KES amounts stored internally as integer shillings
//   - Converted to USD cents at checkout using a fixed exchange rate
//   - Rate is overrideable via STRIPE_KES_TO_USD_RATE env var
//
// M-Pesa: charges in KES natively via Safaricom Daraja STK Push
// ─────────────────────────────────────────────────────────────────────────────

type StripeCheckoutInput = {
  orderId: string;
  orderNumber: string;
  amountKES: number; // Amount in KES shillings
  customerEmail: string;
};

type MpesaStkInput = {
  orderId: string;
  orderNumber: string;
  amount: number; // KES shillings
  phone: string;
  accountReference?: string;
};

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

function basicAuth(clientKey: string, clientSecret: string) {
  return Buffer.from(`${clientKey}:${clientSecret}`).toString('base64');
}

/**
 * Convert KES shillings → USD cents for Stripe.
 * Rate default: 1 USD = 130 KES  (update STRIPE_KES_TO_USD_RATE in Railway env vars)
 */
function kesToUsdCents(kes: number): number {
  const rate = parseFloat(process.env.STRIPE_KES_TO_USD_RATE || '130');
  const usd = kes / rate;
  return Math.max(50, Math.round(usd * 100)); // Stripe minimum is 50 cents
}

// ── Stripe ────────────────────────────────────────────────────────────────────

export async function createStripeCheckoutSession(input: StripeCheckoutInput) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY. Add it in Railway → Variables.'
    );
  }

  const usdCents = kesToUsdCents(input.amountKES);

  const body = new URLSearchParams();
  body.append('mode', 'payment');
  body.append(
    'success_url',
    `${getBaseUrl()}/order-confirmation?order=${input.orderId}&payment=success`
  );
  body.append(
    'cancel_url',
    `${getBaseUrl()}/cart?payment=cancelled&order=${input.orderId}`
  );
  body.append('customer_email', input.customerEmail);
  body.append('metadata[orderId]', input.orderId);
  body.append('metadata[orderNumber]', input.orderNumber);
  // USD is required — KES is not supported by Stripe
  body.append('line_items[0][price_data][currency]', 'usd');
  body.append(
    'line_items[0][price_data][product_data][name]',
    `TuloPots Order ${input.orderNumber}`
  );
  body.append(
    'line_items[0][price_data][product_data][description]',
    `Handcrafted terracotta from Nairobi · KES ${input.amountKES.toLocaleString()}`
  );
  body.append(
    'line_items[0][price_data][unit_amount]',
    String(usdCents)
  );
  body.append('line_items[0][quantity]', '1');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to create Stripe session');
  }

  return {
    id: data.id as string,
    url: data.url as string,
    usdCents,
    raw: data,
  };
}

// ── M-Pesa ────────────────────────────────────────────────────────────────────

export async function initiateMpesaStkPush(input: MpesaStkInput) {
  const baseUrl = process.env.MPESA_BASE_URL;
  const clientKey = process.env.MPESA_CONSUMER_KEY;
  const clientSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    `${getBaseUrl()}/api/payments/mpesa/callback`;

  // ── Demo / sandbox mode if env vars are missing ──────────────────────────
  if (!baseUrl || !clientKey || !clientSecret || !shortcode || !passkey) {
    return {
      ok: true,
      requestId: `mock-${Date.now()}`,
      response: {
        message:
          'M-Pesa env vars not set — returning mock STK response. Configure MPESA_* variables in Railway to go live.',
      },
      mocked: true,
    };
  }

  // ── Get OAuth token ───────────────────────────────────────────────────────
  const authRes = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${basicAuth(clientKey, clientSecret)}`,
      },
    }
  );

  const authData = await authRes.json();
  if (!authRes.ok || !authData.access_token) {
    throw new Error('Failed to authenticate with M-Pesa API');
  }

  // ── Build STK Push payload ────────────────────────────────────────────────
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);

  const password = Buffer.from(
    `${shortcode}${passkey}${timestamp}`
  ).toString('base64');

  // Normalise phone: strip leading 0 and ensure 254 prefix
  const rawPhone = input.phone.replace(/\s+/g, '').replace(/^\+/, '');
  const normPhone = rawPhone.startsWith('0')
    ? `254${rawPhone.slice(1)}`
    : rawPhone;

  const stkPayload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(input.amount), // M-Pesa requires whole KES
    PartyA: normPhone,
    PartyB: shortcode,
    PhoneNumber: normPhone,
    CallBackURL: callbackUrl,
    AccountReference: input.accountReference || input.orderNumber,
    TransactionDesc: `TuloPots ${input.orderNumber}`,
  };

  const stkRes = await fetch(
    `${baseUrl}/mpesa/stkpush/v1/processrequest`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPayload),
    }
  );

  const stkData = await stkRes.json();
  if (!stkRes.ok) {
    throw new Error(
      stkData?.errorMessage || 'Failed to initiate M-Pesa STK push'
    );
  }

  return {
    ok: true,
    requestId:
      stkData.CheckoutRequestID ||
      stkData.MerchantRequestID ||
      `stk-${Date.now()}`,
    response: stkData,
    mocked: false,
  };
}
