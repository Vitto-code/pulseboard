import { buildDemoSeed } from './demo-data';
import { createMemoryRepository } from './memory-repository';
import { createPrismaRepository } from './prisma-repository';
import type { Repository } from './types';

/**
 * Seleciona a implementacao de persistencia pelo ambiente:
 *  - DB_DRIVER=memory -> repositorio em memoria com dados demo, sem banco
 *  - padrao           -> Prisma/PostgreSQL
 *
 * Singleton por processo para o hot-reload do Next dev nao perder o
 * estado em memoria.
 */
const globalForRepo = globalThis as unknown as { repository?: Repository };

export function getRepository(): Repository {
  if (!globalForRepo.repository) {
    globalForRepo.repository =
      process.env.DB_DRIVER === 'memory'
        ? createMemoryRepository(buildDemoSeed())
        : createPrismaRepository();
  }
  return globalForRepo.repository;
}
