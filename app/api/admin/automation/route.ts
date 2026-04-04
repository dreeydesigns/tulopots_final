import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import { runOperationsAutomation } from '@/lib/operations';

function hasValidAutomationSecret(request: NextRequest) {
  const configuredSecret = process.env.OPERATIONS_AUTOMATION_SECRET;

  if (!configuredSecret) {
    return false;
  }

  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return token === configuredSecret;
}

export async function POST(request: NextRequest) {
  const adminUser = await requireAdminUser('automation.manage');
  const secretIsValid = hasValidAutomationSecret(request);

  if (!adminUser && !secretIsValid) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await runOperationsAutomation();
    return NextResponse.json({ ok: true, summary });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to run the operations automation pass.',
      },
      { status: 500 }
    );
  }
}
