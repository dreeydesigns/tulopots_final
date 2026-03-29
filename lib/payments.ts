import Stripe from 'stripe';
import { resolveBaseUrl } from '@/lib/request';

type StripeCheckoutInput = {
  orderId: string;
  orderNumber: string;
  amountKES: number;
  customerEmail: string;
  baseUrl?: string;
};

type MpesaStkInput = {
  orderId: string;
  orderNumber: string;
  amount: number;
  phone: string;
  accountReference?: string;
  baseUrl?: string;
};

function basicAuth(clientKey: string, clientSecret: string) {
  return Buffer.from(`${clientKey}:${clientSecret}`).toString('base64');
}

function kesToUsdCents(kes: number): number {
  const rate = parseFloat(process.env.STRIPE_KES_TO_USD_RATE || '130');
  const usd = kes / rate;
  return Math.max(50, Math.round(usd * 100));
}

function normalizeKenyanPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }

  if (digits.startsWith('254') && digits.length === 12) {
    return digits;
  }

  if (digits.length === 9 && digits.startsWith('7')) {
    return `254${digits}`;
  }

  return digits;
}

export async function createStripeCheckoutSession(input: StripeCheckoutInput) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY. Add it in Railway Variables before taking card payments live.'
    );
  }

  const baseUrl = resolveBaseUrl(input.baseUrl);
  const usdCents = kesToUsdCents(input.amountKES);
  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-02-25.clover' as any,
  });
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: input.orderId,
    success_url: `${baseUrl}/order-confirmation?order=${input.orderId}&payment=success`,
    cancel_url: `${baseUrl}/cart?payment=cancelled&order=${input.orderId}`,
    customer_email: input.customerEmail,
    metadata: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
    },
    payment_intent_data: {
      metadata: {
        orderId: input.orderId,
        orderNumber: input.orderNumber,
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: usdCents,
          product_data: {
            name: `TuloPots Order ${input.orderNumber}`,
            description: `Handcrafted terracotta from Nairobi · KES ${input.amountKES.toLocaleString()}`,
          },
        },
      },
    ],
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL.');
  }

  return {
    id: session.id,
    url: session.url,
    usdCents,
    raw: session,
  };
}

export async function initiateMpesaStkPush(input: MpesaStkInput) {
  const baseUrl = process.env.MPESA_BASE_URL;
  const clientKey = process.env.MPESA_CONSUMER_KEY;
  const clientSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    `${resolveBaseUrl(input.baseUrl)}/api/payments/mpesa/callback`;
  const missingConfig = [
    ['MPESA_BASE_URL', baseUrl],
    ['MPESA_CONSUMER_KEY', clientKey],
    ['MPESA_CONSUMER_SECRET', clientSecret],
    ['MPESA_SHORTCODE', shortcode],
    ['MPESA_PASSKEY', passkey],
  ].filter(([, value]) => !value);

  if (missingConfig.length > 0) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `M-Pesa is not configured. Missing ${missingConfig
          .map(([name]) => name)
          .join(', ')}.`
      );
    }

    return {
      ok: true,
      requestId: `mock-${Date.now()}`,
      response: {
        message:
          'M-Pesa credentials are not loaded in this environment, so a mock STK response was returned.',
      },
      mocked: true,
    };
  }

  const phoneNumber = normalizeKenyanPhone(input.phone);

  if (!/^254\d{9}$/.test(phoneNumber)) {
    throw new Error(
      'Enter a valid M-Pesa number in the format +2547XXXXXXXX.'
    );
  }

  const authRes = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${basicAuth(clientKey!, clientSecret!)}`,
      },
      cache: 'no-store',
    }
  );
  const authData = await authRes.json();

  if (!authRes.ok || !authData.access_token) {
    throw new Error(
      authData?.errorMessage || 'Failed to authenticate with the M-Pesa API.'
    );
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);
  const password = Buffer.from(
    `${shortcode}${passkey}${timestamp}`
  ).toString('base64');
  const stkPayload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(input.amount),
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackUrl,
    AccountReference: input.accountReference || input.orderNumber,
    TransactionDesc: `TuloPots ${input.orderNumber}`,
  };
  const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stkPayload),
  });
  const stkData = await stkRes.json();

  if (!stkRes.ok || stkData?.ResponseCode === '1') {
    throw new Error(
      stkData?.errorMessage ||
        stkData?.ResponseDescription ||
        'Failed to initiate M-Pesa STK push.'
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
