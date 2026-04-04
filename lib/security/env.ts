function readEnvValue(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
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
      return Boolean(readEnvValue('STRIPE_SECRET_KEY') && readEnvValue('STRIPE_WEBHOOK_SECRET'));
    case 'mpesa':
      return Boolean(
        readEnvValue('MPESA_BASE_URL') &&
          readEnvValue('MPESA_CONSUMER_KEY') &&
          readEnvValue('MPESA_CONSUMER_SECRET') &&
          readEnvValue('MPESA_SHORTCODE') &&
          readEnvValue('MPESA_PASSKEY')
      );
    case 'hubspot':
      return Boolean(readEnvValue('HUBSPOT_PRIVATE_APP_TOKEN'));
    case 'google':
      return Boolean(readEnvValue('GOOGLE_CLIENT_ID') && readEnvValue('GOOGLE_CLIENT_SECRET'));
    default:
      return false;
  }
}
