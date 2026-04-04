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

export async function dispatchNotification(input: DispatchInput) {
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
