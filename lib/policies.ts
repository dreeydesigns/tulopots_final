export const CURRENT_POLICY_VERSION = '2026-03-30';
export const POLICY_EFFECTIVE_LABEL = '30 March 2026';

export const LEGAL_ROUTES = {
  terms: '/terms',
  privacy: '/privacy-policy',
  cookies: '/cookie-policy',
  delivery: '/delivery-returns',
} as const;

type PolicyShape = {
  acceptedTermsAt?: string | Date | null;
  acceptedPrivacyAt?: string | Date | null;
  acceptedPolicyVersion?: string | null;
};

export function hasAcceptedPolicies(policy?: PolicyShape | null) {
  if (!policy) {
    return false;
  }

  return Boolean(
    policy.acceptedTermsAt &&
      policy.acceptedPrivacyAt &&
      policy.acceptedPolicyVersion === CURRENT_POLICY_VERSION
  );
}

export function getPolicyVersionLabel(version?: string | null) {
  return version || CURRENT_POLICY_VERSION;
}
