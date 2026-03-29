import { PrismaClient, StudioBrief } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanUrl(value: unknown) {
  const url = cleanText(value);

  if (!url) return '';

  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return '';
  }
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

function createReferenceCode() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `STUDIO-${stamp}-${rand}`;
}

export async function GET() {
  try {
    const briefs = await prisma.studioBrief.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return Response.json(
      {
        ok: true,
        count: briefs.length,
        briefs: briefs.map((brief: StudioBrief) => ({
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
    console.error('Studio GET error:', error);

    return Response.json(
      {
        ok: false,
        error: 'Unable to load studio briefs right now.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = cleanText(body.message);
    const imageFileName = cleanText(body.imageFileName);
    const imagePreview = cleanText(body.imagePreview);
    const referenceLink = cleanUrl(body.referenceLink);
    const space = cleanText(body.space);
    const helpType = cleanText(body.helpType);
    const extraNote = cleanText(body.extraNote);

    const hasExpression = Boolean(message || imageFileName || referenceLink);

    if (!hasExpression) {
      return Response.json(
        {
          ok: false,
          error: 'Please share at least a thought, an image, or a reference link.',
        },
        { status: 400 }
      );
    }

    if (!space) {
      return Response.json(
        {
          ok: false,
          error: 'Please tell us where this lives.',
        },
        { status: 400 }
      );
    }

    if (!helpType) {
      return Response.json(
        {
          ok: false,
          error: 'Please tell us what you need help with.',
        },
        { status: 400 }
      );
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

    return Response.json(
      {
        ok: true,
        brief: {
          id: record.referenceCode,
          createdAt: record.createdAt,
          status: record.status,
          summary: record.summary,
        },
        message: 'Your studio brief has been received.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Studio POST error:', error);

    return Response.json(
      {
        ok: false,
        error: 'We could not save your studio brief right now.',
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