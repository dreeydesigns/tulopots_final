import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __tulopotsPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__tulopotsPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__tulopotsPrisma = prisma;
}
