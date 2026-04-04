import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { recordSecurityEvent } from '@/lib/security/audit';
import { studioSchema, sanitizeMultilineText, sanitizeText, sanitizeUrl } from '@/lib/security/validation';
import { addSupportMessage, addSupportSummary, createSupportThread, queueSupportFollowUps } from '@/lib/support';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function createReferenceCode() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `STUDIO-${stamp}-${rand}`;
}

function buildSummary(input: {
  message: string;
  imageFileName: string;
  referenceLink: string;
  space: string;
  helpType: string;
  extraNote: string;
}) {
  const lines: string[] = [];

  if (input.message) lines.push(`What they shared: ${input.message}`);
  if (input.space) lines.push(`Space: ${input.space}`);
  if (input.helpType) lines.push(`Help needed: ${input.helpType}`);
  if (input.referenceLink) lines.push(`Reference link: ${input.referenceLink}`);
  if (input.imageFileName) lines.push(`Uploaded image: ${input.imageFileName}`);
  if (input.extraNote) lines.push(`Additional note: ${input.extraNote}`);

  return lines.join('\n');
}

export async function GET() {
  try {
    const briefs = await prisma.studioBrief.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return Response.json(
      {
        ok: true,
        count: briefs.length,
        briefs: briefs.map((brief) => ({
          id: brief.referenceCode,
          createdAt: brief.createdAt,
          status: brief.status,
          space: brief.space,
          helpType: brief.helpType,
          summary: brief.summary,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: getSafeErrorMessage(error, 'Unable to load studio briefs right now.'),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);

  try {
    const rateLimit = await enforceRateLimit({
      key: ip,
      route: '/api/studio',
      limit: 6,
      windowMs: 60 * 1000,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'Too many Studio submissions were sent from this connection. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const parsed = studioSchema.safeParse(await request.json());

    if (!parsed.success) {
      await recordSecurityEvent({
        type: 'INVALID_INPUT',
        severity: 'WARNING',
        route: '/api/studio',
        ip,
        metadata: {
          issues: parsed.error.flatten(),
        },
      });
      return jsonError('Please tell us the space and the kind of Studio help you need.', 400);
    }

    const message = sanitizeMultilineText(parsed.data.message, 3000);
    const imageFileName = sanitizeText(parsed.data.imageFileName, 180);
    const imagePreview = parsed.data.imagePreview.trim();
    const referenceLink = sanitizeUrl(parsed.data.referenceLink);
    const space = sanitizeText(parsed.data.space, 180);
    const helpType = sanitizeText(parsed.data.helpType, 180);
    const extraNote = sanitizeMultilineText(parsed.data.extraNote, 1200);

    const hasExpression = Boolean(message || imageFileName || referenceLink);
    if (!hasExpression) {
      return jsonError('Please share at least a thought, an image, or a reference link.', 400);
    }

    const referenceCode = createReferenceCode();
    const summary = buildSummary({
      message,
      imageFileName,
      referenceLink,
      space,
      helpType,
      extraNote,
    });

    const record = await prisma.studioBrief.create({
      data: {
        referenceCode,
        message,
        imageFileName: imageFileName || null,
        imagePreview: imagePreview || null,
        referenceLink: referenceLink || null,
        space,
        helpType,
        extraNote: extraNote || null,
        summary,
      },
    });

    const thread = await createSupportThread({
      source: 'STUDIO',
      legacyStudioBriefId: record.id,
      summary,
      tagsJson: {
        referenceCode,
        space,
        helpType,
      },
    });

    await addSupportMessage({
      threadId: thread.id,
      role: 'CUSTOMER',
      channel: 'STUDIO_FORM',
      body: summary,
      metaJson: {
        referenceCode,
        imagePreview: imagePreview || null,
        referenceLink,
      },
    });

    await addSupportSummary({
      threadId: thread.id,
      intent: 'studio_brief',
      shortSummary: `New Studio brief for ${space.toLowerCase()} with help type ${helpType.toLowerCase()}.`,
      suggestedNextStep: 'Review the Studio brief and respond with creative direction or delivery guidance.',
      confidence: 0.86,
    });

    await queueSupportFollowUps({
      threadId: thread.id,
      summary,
      needsHuman: true,
    });

    return Response.json(
      {
        ok: true,
        brief: {
          id: record.referenceCode,
          createdAt: record.createdAt,
          status: record.status,
          summary: record.summary,
        },
        supportThreadId: thread.id,
        message: 'Your studio brief has been received.',
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: getSafeErrorMessage(error, 'We could not save your studio brief right now.'),
      },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return Response.json(
    {
      ok: false,
      error: 'This route only supports viewing and creating studio briefs.',
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return Response.json(
    {
      ok: false,
      error: 'This route only supports viewing and creating studio briefs.',
    },
    { status: 405 }
  );
}
