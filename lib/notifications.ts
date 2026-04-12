import type { NotificationChannel, Prisma } from '@prisma/client';
import { recordNotificationAttempt } from '@/lib/automation';

type NotificationPayload = {
  title: string;
  body: string;
  meta?: Prisma.InputJsonObject;
};

type DispatchInput = {
  jobId?: string | null;
  userId?: string | null;
  templateKey?: string | null;
  channel: NotificationChannel;
  destination: string;
  payload: NotificationPayload;
};

function getEmailProviderConfig() {
  const apiKey =
    process.env.RESEND_API_KEY?.trim() ||
    process.env.EMAIL_PROVIDER_API_KEY?.trim() ||
    null;
  const from =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.MAIL_FROM?.trim() ||
    process.env.FROM_EMAIL?.trim() ||
    null;

  return {
    apiKey,
    from,
    enabled: Boolean(apiKey && from),
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml(payload: NotificationPayload) {
  const title = escapeHtml(payload.title);
  const bodyParagraphs = payload.body
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map(
      (chunk) =>
        `<p style="margin:0 0 16px;color:#4a3427;font-size:15px;line-height:1.7;">${escapeHtml(
          chunk
        ).replace(/\n/g, '<br />')}</p>`
    )
    .join('');

  return `
    <div style="background:#f7f2ea;padding:32px 20px;font-family:Georgia,'Times New Roman',serif;">
      <div style="max-width:600px;margin:0 auto;background:#fffaf4;border:1px solid rgba(182,106,60,0.18);border-radius:24px;padding:32px;">
        <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#b66a3c;font-weight:700;">TuloPots</div>
        <h1 style="margin:18px 0 20px;color:#3b2419;font-size:34px;line-height:1.05;font-weight:500;">${title}</h1>
        ${bodyParagraphs}
      </div>
    </div>
  `;
}

async function dispatchEmailNotification(input: DispatchInput) {
  const emailProvider = getEmailProviderConfig();

  if (!emailProvider.enabled || !emailProvider.apiKey || !emailProvider.from) {
    return recordNotificationAttempt({
      jobId: input.jobId || null,
      userId: input.userId || null,
      templateKey: input.templateKey || null,
      channel: 'EMAIL',
      destination: input.destination,
      provider: 'mock',
      status: 'MOCKED',
      payloadJson: input.payload,
      providerResponseJson: {
        mocked: true,
        reason: 'email_provider_not_configured',
        deliveredBy: 'internal-notification-adapter',
      },
      sentAt: new Date(),
    });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${emailProvider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailProvider.from,
        to: [input.destination],
        subject: input.payload.title,
        text: input.payload.body,
        html: buildEmailHtml(input.payload),
      }),
      cache: 'no-store',
    });

    const providerResponseJson = (await response.json().catch(() => null)) as
      | Record<string, unknown>
      | null;
    const providerResponsePayload = providerResponseJson
      ? (providerResponseJson as Prisma.InputJsonValue)
      : undefined;

    if (!response.ok) {
      return recordNotificationAttempt({
        jobId: input.jobId || null,
        userId: input.userId || null,
        templateKey: input.templateKey || null,
        channel: 'EMAIL',
        destination: input.destination,
        provider: 'resend',
        status: 'FAILED',
        payloadJson: input.payload,
        providerResponseJson: providerResponsePayload,
        error:
          String(providerResponseJson?.message || providerResponseJson?.error || '').trim() ||
          'Email delivery failed.',
      });
    }

    return recordNotificationAttempt({
      jobId: input.jobId || null,
      userId: input.userId || null,
      templateKey: input.templateKey || null,
      channel: 'EMAIL',
      destination: input.destination,
      provider: 'resend',
      status: 'SENT',
      payloadJson: input.payload,
      providerResponseJson: providerResponsePayload,
      sentAt: new Date(),
    });
  } catch (error) {
    return recordNotificationAttempt({
      jobId: input.jobId || null,
      userId: input.userId || null,
      templateKey: input.templateKey || null,
      channel: 'EMAIL',
      destination: input.destination,
      provider: 'resend',
      status: 'FAILED',
      payloadJson: input.payload,
      error: (error as Error)?.message || 'Email delivery failed.',
    });
  }
}

export async function dispatchNotification(input: DispatchInput) {
  if (input.channel === 'EMAIL') {
    return dispatchEmailNotification(input);
  }

  return recordNotificationAttempt({
    jobId: input.jobId || null,
    userId: input.userId || null,
    templateKey: input.templateKey || null,
    channel: input.channel,
    destination: input.destination,
    provider: 'mock',
    status: 'MOCKED',
    payloadJson: input.payload,
    providerResponseJson: {
      mocked: true,
      deliveredBy: 'internal-notification-adapter',
    },
    sentAt: new Date(),
  });
}

export async function dispatchCustomerFollowUps(input: {
  jobId?: string | null;
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  title: string;
  body: string;
  includeWhatsApp?: boolean;
  includeSmsFallback?: boolean;
}) {
  const attempts = [];

  if (input.email) {
    attempts.push(
      dispatchNotification({
        jobId: input.jobId,
        userId: input.userId,
        templateKey: 'customer-email-followup',
        channel: 'EMAIL',
        destination: input.email,
        payload: {
          title: input.title,
          body: input.body,
        },
      })
    );
  }

  if (input.phone && input.includeWhatsApp) {
    attempts.push(
      dispatchNotification({
        jobId: input.jobId,
        userId: input.userId,
        templateKey: 'customer-whatsapp-followup',
        channel: 'WHATSAPP',
        destination: input.phone,
        payload: {
          title: input.title,
          body: input.body,
        },
      })
    );
  }

  if (input.phone && input.includeSmsFallback) {
    attempts.push(
      dispatchNotification({
        jobId: input.jobId,
        userId: input.userId,
        templateKey: 'customer-sms-fallback',
        channel: 'SMS',
        destination: input.phone,
        payload: {
          title: 'TuloPots update',
          body: 'Check WhatsApp for your latest TuloPots update.',
        },
      })
    );
  }

  return Promise.all(attempts);
}
