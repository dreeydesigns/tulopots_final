import { promises as fs } from 'node:fs';
import path from 'node:path';

export type ProgressTask = {
  label: string;
  done: boolean;
};

export type ProgressPhase = {
  id: string;
  label: string;
  status: 'not_started' | 'in_progress' | 'complete';
  percent: number;
  tasks: ProgressTask[];
};

export type ProgressPayload = {
  lastUpdated: string;
  phases: ProgressPhase[];
};

const progressFile = path.join(process.cwd(), 'data', 'progress.json');

export async function readProgress(): Promise<ProgressPayload> {
  const raw = await fs.readFile(progressFile, 'utf8');
  return JSON.parse(raw) as ProgressPayload;
}

export async function writeProgress(payload: ProgressPayload) {
  const nextPayload = {
    ...payload,
    lastUpdated: new Date().toISOString(),
  };

  await fs.writeFile(progressFile, JSON.stringify(nextPayload, null, 2) + '\n', 'utf8');
  return nextPayload;
}

export async function updateProgressPhase(
  phaseId: string,
  updater: (phase: ProgressPhase) => ProgressPhase
) {
  const payload = await readProgress();
  const phases = payload.phases.map((phase) =>
    phase.id === phaseId ? updater(phase) : phase
  );
  return writeProgress({ ...payload, phases });
}
