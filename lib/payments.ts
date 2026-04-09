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

type PaymentProvider = 'STRIPE' | 'MPESA';

type PaymentProviderErrorCode =
  | 'STRIPE_NOT_CONFIGURED'
  | 'STRIPE_INVALID_KEY'
  | 'STRIPE_API_VERSION'
  | 'STRIPE_TEMPORARY_UNAVAILABLE'
  | 'STRIPE_SESSION_INVALID'
  | 'STRIPE_SESSION_FAILED'
  | 'MPESA_NOT_CONFIGURED'
  | 'MPESA_INVALID_PHONE'
  | 'MPESA_AUTH_FAILED'
  | 'MPESA_WRONG_CREDENTIALS'
  | 'MPESA_REQUEST_FAILED';

const STRIPE_SECRET_ENV_KEYS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_API_KEY',
  'STRIPE_SECRET',
  'STRIPE_TEST_SECRET_KEY',
  'STRIPE_LIVE_SECRET_KEY',
  'STRIPE_TEST_API_KEY',
  'STRIPE_LIVE_API_KEY',
] as const;

const STRIPE_RATE_ENV_KEYS = [
  'STRIPE_KES_TO_USD_RATE',
  'STRIPE_RATE_KES_TO_USD',
] as const;

const MPESA_BASE_URL_ENV_KEYS = [
  'MPESA_BASE_URL',
  'MPESA_URL',
  'MPESA_API_BASE_URL',
] as const;

const MPESA_CONSUMER_KEY_ENV_KEYS = [
  'MPESA_CONSUMER_KEY',
  'DARAJA_CONSUMER_KEY',
  'MPESA_KEY',
] as const;

const MPESA_CONSUMER_SECRET_ENV_KEYS = [
  'MPESA_CONSUMER_SECRET',
  'DARAJA_CONSUMER_SECRET',
  'MPESA_SECRET',
] as const;

const MPESA_SHORTCODE_ENV_KEYS = [
  'MPESA_SHORTCODE',
  'MPESA_SHORT_CODE',
  'MPESA_BUSINESS_SHORTCODE',
] as const;

const MPESA_PASSKEY_ENV_KEYS = [
  'MPESA_PASSKEY',
  'MPESA_STK_PASSKEY',
  'MPESA_EXPRESS_PASSKEY',
  'MPESA_LNMO_PASSKEY',
] as const;

const MPESA_CALLBACK_ENV_KEYS = [
  'MPESA_CALLBACK_URL',
  'MPESA_CALLBACK',
  'MPESA_STK_CALLBACK_URL',
] as const;

export class PaymentProviderError extends Error {
  provider: PaymentProvider;
  code: PaymentProviderErrorCode;
  status: number;

  constructor(
    provider: PaymentProvider,
    code: PaymentProviderErrorCode,
    message: string,
    status = 500
  ) {
    super(message);
    this.name = 'PaymentProviderError';
    this.provider = provider;
    this.code = code;
    this.status = status;
  }
}

function basicAuth(clientKey: string, clientSecret: string) {
  return Buffer.from(`${clientKey}:${clientSecret}`).toString('base64');
}

function readEnvValue(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }

  return '';
}

function createPaymentProviderError(
  provider: PaymentProvider,
  code: PaymentProviderErrorCode,
  message: string,
  status = 500
) {
  return new PaymentProviderError(provider, code, message, status);
}

function buildErrorSignature(error: any) {
  return [
    String(error?.message || ''),
    String(error?.type || error?.name || ''),
    String(error?.code || ''),
    String(error?.raw?.code || ''),
    String(error?.cause?.code || ''),
    String(error?.cause?.message || ''),
  ]
    .join(' ')
    .toLowerCase();
}

function normalizeMpesaBaseUrl(baseUrl?: string) {
  if (!baseUrl) {
    return baseUrl;
  }

  try {
    const parsed = new URL(baseUrl);
    return parsed.origin.replace(/\/$/, '');
  } catch {
    return baseUrl.replace(/\/$/, '');
  }
}

function kesToUsdCents(kes: number): number {
  const rate = parseFloat(readEnvValue(...STRIPE_RATE_ENV_KEYS) || '130');
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
  const secretKey = readEnvValue(...STRIPE_SECRET_ENV_KEYS);

  if (!secretKey) {
    throw createPaymentProviderError(
      'STRIPE',
      'STRIPE_NOT_CONFIGURED',
      'Card payment setup is incomplete in this deployment. Add the Stripe key in Vercel and redeploy.'
    );
  }

  const baseUrl = resolveBaseUrl(input.baseUrl);
  const usdCents = kesToUsdCents(input.amountKES);
  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-02-25.clover' as any,
  });
  try {
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
      throw createPaymentProviderError(
        'STRIPE',
        'STRIPE_SESSION_INVALID',
        'Card checkout started, but Stripe did not return a checkout URL.'
      );
    }

    return {
      id: session.id,
      url: session.url,
      usdCents,
      raw: session,
    };
  } catch (error: any) {
    if (error instanceof PaymentProviderError) {
      throw error;
    }

    const signature = buildErrorSignature(error);

    if (
      signature.includes('api key') ||
      signature.includes('authentication') ||
      signature.includes('api_key')
    ) {
      throw createPaymentProviderError(
        'STRIPE',
        'STRIPE_INVALID_KEY',
        'Card payment setup is incomplete in this deployment. Check the Stripe key in Vercel and redeploy.'
      );
    }

    if (signature.includes('invalid api version')) {
      throw createPaymentProviderError(
        'STRIPE',
        'STRIPE_API_VERSION',
        'Stripe rejected the API version configured for this deployment. Update the Stripe setup and redeploy.'
      );
    }

    if (
      signature.includes('connection') ||
      signature.includes('fetch failed') ||
      signature.includes('socket') ||
      signature.includes('timeout') ||
      signature.includes('timed out') ||
      signature.includes('econn') ||
      signature.includes('tls') ||
      signature.includes('ssl') ||
      signature.includes('apierror') ||
      signature.includes('ratelimit')
    ) {
      throw createPaymentProviderError(
        'STRIPE',
        'STRIPE_TEMPORARY_UNAVAILABLE',
        'Card checkout is temporarily unavailable. Please try again in a moment or use M-Pesa.'
      );
    }

    throw createPaymentProviderError(
      'STRIPE',
      'STRIPE_SESSION_FAILED',
      'Card checkout could not start right now. Please try again or use M-Pesa.'
    );
  }
}

export async function initiateMpesaStkPush(input: MpesaStkInput) {
  const baseUrl = normalizeMpesaBaseUrl(readEnvValue(...MPESA_BASE_URL_ENV_KEYS));
  const clientKey = readEnvValue(...MPESA_CONSUMER_KEY_ENV_KEYS);
  const clientSecret = readEnvValue(...MPESA_CONSUMER_SECRET_ENV_KEYS);
  const shortcode = readEnvValue(...MPESA_SHORTCODE_ENV_KEYS);
  const passkey = readEnvValue(...MPESA_PASSKEY_ENV_KEYS);
  const callbackUrl =
    readEnvValue(...MPESA_CALLBACK_ENV_KEYS) ||
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
      throw createPaymentProviderError(
        'MPESA',
        'MPESA_NOT_CONFIGURED',
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
    throw createPaymentProviderError(
      'MPESA',
      'MPESA_INVALID_PHONE',
      'Enter a valid M-Pesa number in the format +2547XXXXXXXX.'
    );
  }

  let authRes: Response;
  try {
    authRes = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${basicAuth(clientKey!, clientSecret!)}`,
        },
        cache: 'no-store',
      }
    );
  } catch (error: any) {
    const signature = buildErrorSignature(error);
    throw createPaymentProviderError(
      'MPESA',
      'MPESA_REQUEST_FAILED',
      signature.includes('timeout') ||
        signature.includes('fetch failed') ||
        signature.includes('econn') ||
        signature.includes('socket')
        ? 'M-Pesa could not be reached right now. Please try again or use card checkout.'
        : 'Failed to authenticate with the M-Pesa API.'
    );
  }

  let authData: any = null;
  try {
    authData = await authRes.json();
  } catch {
    authData = null;
  }

  if (!authRes.ok || !authData.access_token) {
    throw createPaymentProviderError(
      'MPESA',
      'MPESA_AUTH_FAILED',
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
  let stkRes: Response;
  try {
    stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPayload),
    });
  } catch (error: any) {
    const signature = buildErrorSignature(error);
    throw createPaymentProviderError(
      'MPESA',
      'MPESA_REQUEST_FAILED',
      signature.includes('timeout') ||
        signature.includes('fetch failed') ||
        signature.includes('econn') ||
        signature.includes('socket')
        ? 'M-Pesa could not be reached right now. Please try again or use card checkout.'
        : 'Failed to initiate M-Pesa STK push.'
    );
  }

  let stkData: any = null;
  try {
    stkData = await stkRes.json();
  } catch {
    stkData = null;
  }

  if (!stkRes.ok || stkData?.ResponseCode === '1') {
    const credentialError =
      stkData?.errorMessage === 'Wrong credentials' ||
      stkData?.ResponseDescription === 'Wrong credentials';

    throw createPaymentProviderError(
      'MPESA',
      credentialError ? 'MPESA_WRONG_CREDENTIALS' : 'MPESA_REQUEST_FAILED',
      credentialError
        ? 'M-Pesa rejected the saved setup. For sandbox, use MPESA_BASE_URL=https://sandbox.safaricom.co.ke, MPESA_SHORTCODE=174379, and make sure the consumer key, consumer secret, and passkey all come from the same Daraja sandbox setup.'
        : stkData?.errorMessage ||
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
