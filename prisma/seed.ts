import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/server/auth/password';
import { buildDemoCustomers, DEMO_PASSWORD, DEMO_USER } from '../src/server/db/demo-data';

const prisma = new PrismaClient();

/**
 * Popula o banco com o usuario demo (demo@pulseboard.dev / demo1234) e
 * 60 clientes distribuidos em 12 meses. Idempotente: pula o que ja existe.
 */
async function main() {
  const existingUser = await prisma.user.findUnique({ where: { email: DEMO_USER.email } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        passwordHash: await hashPassword(DEMO_PASSWORD),
      },
    });
    console.log(`[seed] usuario demo criado: ${DEMO_USER.email}`);
  } else {
    console.log('[seed] usuario demo ja existe, pulando');
  }

  let created = 0;
  for (const customer of buildDemoCustomers()) {
    const exists = await prisma.customer.findUnique({ where: { email: customer.email } });
    if (!exists) {
      await prisma.customer.create({ data: customer });
      created += 1;
    }
  }
  console.log(`[seed] ${created} clientes criados (${60 - created} ja existiam)`);
}

main()
  .catch((error) => {
    console.error('[seed] falha:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
