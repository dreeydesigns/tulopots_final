type NewsletterSyncInput = {
  email: string;
  name?: string;
  phone?: string | null;
  preferredChannel?: string;
  interests?: string[];
  source?: string;
};

type HubSpotContactResponse = {
  id: string;
  properties?: Record<string, string | null>;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function getHubSpotAppBaseUrl() {
  return trimTrailingSlash(
    process.env.HUBSPOT_APP_BASE_URL ||
      process.env.HUBSPOT_BASE_URL ||
      'https://app.hubspot.com'
  );
}

function getHubSpotAccessToken() {
  return (
    process.env.HUBSPOT_PRIVATE_APP_TOKEN ||
    process.env.HUBSPOT_ACCESS_TOKEN ||
    process.env.HUBSPOT_TOKEN ||
    ''
  );
}

function getHubSpotPortalId() {
  return (
    process.env.HUBSPOT_PORTAL_ID ||
    process.env.HUBSPOT_ACCOUNT_ID ||
    process.env.HUBSPOT_PORTAL ||
    ''
  );
}

function getHubSpotListId() {
  return (
    process.env.HUBSPOT_NEWSLETTER_LIST_ID ||
    process.env.HUBSPOT_LIST_ID ||
    process.env.HUBSPOT_NEWSLETTER_LIST ||
    ''
  );
}

export function getHubSpotConfig() {
  const accessToken = getHubSpotAccessToken();
  const portalId = getHubSpotPortalId();
  const listId = getHubSpotListId();

  return {
    provider: 'hubspot' as const,
    enabled: Boolean(accessToken),
    hasListId: Boolean(listId),
    portalId,
    listId,
    appBaseUrl: getHubSpotAppBaseUrl(),
    manageUrl: portalId
      ? `${getHubSpotAppBaseUrl()}/email/${portalId}/manage`
      : `${getHubSpotAppBaseUrl()}/email`,
    contactsUrl: portalId
      ? `${getHubSpotAppBaseUrl()}/contacts/${portalId}/contacts/list/view/all/`
      : `${getHubSpotAppBaseUrl()}/contacts`,
    listsUrl:
      portalId && listId
        ? `${getHubSpotAppBaseUrl()}/contacts/${portalId}/lists/view/${listId}/`
        : portalId
          ? `${getHubSpotAppBaseUrl()}/contacts/${portalId}/lists/view/all/`
          : `${getHubSpotAppBaseUrl()}/contacts`,
  };
}

function splitName(name?: string) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
}

function normalizeEmail(email: string) {
  return String(email).trim().toLowerCase();
}

async function hubSpotFetch<T>(path: string, init: RequestInit) {
  const token = getHubSpotAccessToken();

  if (!token) {
    throw new Error('HubSpot private app token is missing.');
  }

  const response = await fetch(`https://api.hubapi.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T & { message?: string }) : ({} as T);

  if (!response.ok) {
    const error = new Error(
      (data as { message?: string })?.message ||
        `HubSpot request failed with status ${response.status}.`
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return data;
}

async function getHubSpotContactByEmail(email: string) {
  try {
    return await hubSpotFetch<HubSpotContactResponse>(
      `/crm/v3/objects/contacts/${encodeURIComponent(
        email
      )}?idProperty=email&properties=email,firstname,lastname,phone,lifecyclestage`,
      {
        method: 'GET',
      }
    );
  } catch (error: any) {
    if (error?.status === 404) {
      return null;
    }

    throw error;
  }
}

function buildHubSpotProperties(input: NewsletterSyncInput) {
  const { firstName, lastName } = splitName(input.name);

  return {
    email: normalizeEmail(input.email),
    ...(firstName ? { firstname: firstName } : {}),
    ...(lastName ? { lastname: lastName } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    lifecyclestage: 'subscriber',
  };
}

async function createHubSpotContact(input: NewsletterSyncInput) {
  return hubSpotFetch<HubSpotContactResponse>('/crm/v3/objects/contacts', {
    method: 'POST',
    body: JSON.stringify({
      properties: buildHubSpotProperties(input),
    }),
  });
}

async function updateHubSpotContactById(contactId: string, input: NewsletterSyncInput) {
  return hubSpotFetch<HubSpotContactResponse>(`/crm/v3/objects/contacts/${contactId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: buildHubSpotProperties(input),
    }),
  });
}

async function addContactToHubSpotList(contactId: string, listId: string) {
  return hubSpotFetch<{ recordIds?: { added?: string[] } }>(
    `/crm/v3/lists/${listId}/memberships/add`,
    {
      method: 'PUT',
      body: JSON.stringify({
        recordIds: [contactId],
      }),
    }
  );
}

export async function syncNewsletterSubscriberToHubSpot(input: NewsletterSyncInput) {
  const config = getHubSpotConfig();

  if (!config.enabled) {
    return {
      provider: 'hubspot' as const,
      enabled: false,
      synced: false,
      addedToList: false,
      skipped: true,
    };
  }

  const email = normalizeEmail(input.email);
  const existing = await getHubSpotContactByEmail(email);
  const contact = existing
    ? await updateHubSpotContactById(existing.id, input)
    : await createHubSpotContact({
        ...input,
        email,
      });

  let addedToList = false;

  if (config.listId) {
    await addContactToHubSpotList(contact.id, config.listId);
    addedToList = true;
  }

  return {
    provider: 'hubspot' as const,
    enabled: true,
    synced: true,
    addedToList,
    contactId: contact.id,
  };
}
