function readEnvValue(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function getRequiredEnv(name: string) {
  const value = readEnvValue(name);

  if (!value) {
    throw new Error(`Missing ${name}. Add it to the deployment environment first.`);
  }

  return value;
}

export function getOptionalEnv(name: string) {
  return readEnvValue(name);
}

export function hasConfiguredProvider(name: 'stripe' | 'mpesa' | 'hubspot' | 'google') {
  switch (name) {
    case 'stripe':
      return Boolean(
        readEnvValue(
          'STRIPE_SECRET_KEY',
          'STRIPE_API_KEY',
          'STRIPE_SECRET',
          'STRIPE_TEST_SECRET_KEY',
          'STRIPE_LIVE_SECRET_KEY',
          'STRIPE_TEST_API_KEY',
          'STRIPE_LIVE_API_KEY'
        ) &&
          readEnvValue('STRIPE_WEBHOOK_SECRET', 'STRIPE_WEBHOOK_SIGNING_SECRET')
      );
    case 'mpesa':
      return Boolean(
        readEnvValue('MPESA_BASE_URL', 'MPESA_URL', 'MPESA_API_BASE_URL') &&
          readEnvValue('MPESA_CONSUMER_KEY', 'DARAJA_CONSUMER_KEY', 'MPESA_KEY') &&
          readEnvValue(
            'MPESA_CONSUMER_SECRET',
            'DARAJA_CONSUMER_SECRET',
            'MPESA_SECRET'
          ) &&
          readEnvValue(
            'MPESA_SHORTCODE',
            'MPESA_SHORT_CODE',
            'MPESA_BUSINESS_SHORTCODE'
          ) &&
          readEnvValue(
            'MPESA_PASSKEY',
            'MPESA_STK_PASSKEY',
            'MPESA_EXPRESS_PASSKEY',
            'MPESA_LNMO_PASSKEY'
          )
      );
    case 'hubspot':
      return Boolean(readEnvValue('HUBSPOT_PRIVATE_APP_TOKEN'));
    case 'google':
      return Boolean(readEnvValue('GOOGLE_CLIENT_ID') && readEnvValue('GOOGLE_CLIENT_SECRET'));
    default:
      return false;
  }
}
