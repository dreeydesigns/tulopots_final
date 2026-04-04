import type {
  Prisma,
  SupportChannel,
  SupportMessageRole,
  SupportPriority,
  SupportSource,
  SupportThreadStatus,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { queueAutomationJob } from '@/lib/automation';

function inferPriority(input: {
  source: SupportSource;
  subject?: string | null;
  body?: string | null;
}) {
  const text = `${input.subject || ''} ${input.body || ''}`.toLowerCase();

  if (/failed|urgent|asap|fraud|wrong credentials|payment|delivery/i.test(text)) {
    return 'HIGH' as SupportPriority;
  }

  if (input.source === 'CHATBOT' && /human|agent|help/i.test(text)) {
    return 'HIGH' as SupportPriority;
  }

  return 'NORMAL' as SupportPriority;
}

export async function createSupportThread(input: {
  source: SupportSource;
  status?: SupportThreadStatus;
  priority?: SupportPriority;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  userId?: string | null;
  orderId?: string | null;
  legacyContactMessageId?: string | null;
  legacyStudioBriefId?: string | null;
  summary?: string | null;
  tagsJson?: Prisma.InputJsonValue;
}) {
  return prisma.supportThread.create({
    data: {
      source: input.source,
      status: input.status || 'OPEN',
      priority: input.priority || inferPriority({ source: input.source, body: input.summary }),
      customerName: input.customerName || null,
      customerEmail: input.customerEmail || null,
      customerPhone: input.customerPhone || null,
      userId: input.userId || null,
      orderId: input.orderId || null,
      legacyContactMessageId: input.legacyContactMessageId || null,
      legacyStudioBriefId: input.legacyStudioBriefId || null,
      summary: input.summary || null,
      tagsJson: input.tagsJson ?? undefined,
      lastCustomerMessageAt: new Date(),
    },
  });
}

export async function addSupportMessage(input: {
  threadId: string;
  role: SupportMessageRole;
  channel: SupportChannel;
  body: string;
  metaJson?: Prisma.InputJsonValue;
}) {
  const created = await prisma.supportMessage.create({
    data: {
      threadId: input.threadId,
      role: input.role,
      channel: input.channel,
      body: input.body,
      metaJson: input.metaJson ?? undefined,
    },
  });

  await prisma.supportThread.update({
    where: { id: input.threadId },
    data: {
      lastCustomerMessageAt: input.role === 'CUSTOMER' ? created.createdAt : undefined,
      lastAdminMessageAt: input.role === 'ADMIN' ? created.createdAt : undefined,
      updatedAt: new Date(),
    },
  });

  return created;
}

export async function addSupportSummary(input: {
  threadId: string;
  intent: string;
  shortSummary: string;
  confidence?: number | null;
  suggestedNextStep?: string | null;
}) {
  return prisma.supportSummary.create({
    data: {
      threadId: input.threadId,
      intent: input.intent,
      shortSummary: input.shortSummary,
      confidence: input.confidence ?? null,
      suggestedNextStep: input.suggestedNextStep || null,
    },
  });
}

export async function queueSupportFollowUps(input: {
  threadId: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  summary: string;
  needsHuman?: boolean;
}) {
  const jobs = [];

  if (input.customerEmail) {
    jobs.push(
      queueAutomationJob({
        type: 'EMAIL_FOLLOWUP',
        dedupeKey: `support-email:${input.threadId}:${input.customerEmail}`,
        payloadJson: {
          threadId: input.threadId,
          email: input.customerEmail,
          summary: input.summary,
        },
      })
    );
  }

  if (input.customerPhone && input.needsHuman) {
    jobs.push(
      queueAutomationJob({
        type: 'WHATSAPP_FOLLOWUP',
        dedupeKey: `support-whatsapp:${input.threadId}:${input.customerPhone}`,
        payloadJson: {
          threadId: input.threadId,
          phone: input.customerPhone,
          summary: input.summary,
        },
      }),
      queueAutomationJob({
        type: 'SMS_FALLBACK',
        dedupeKey: `support-sms:${input.threadId}:${input.customerPhone}`,
        payloadJson: {
          threadId: input.threadId,
          phone: input.customerPhone,
          summary: 'Check WhatsApp for your latest TuloPots update.',
        },
      })
    );
  }

  if (input.needsHuman) {
    jobs.push(
      queueAutomationJob({
        type: 'SUPPORT_ESCALATION_NOTIFY',
        dedupeKey: `support-escalation:${input.threadId}`,
        payloadJson: {
          threadId: input.threadId,
          summary: input.summary,
        },
      })
    );
  }

  return Promise.all(jobs);
}
