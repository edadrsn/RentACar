
import { PrismaClient } from '../src/generated/prisma/client';

export async function assertTestDatabase(prisma: PrismaClient) {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL tanımlanmamış.');
  }

  const databaseName = new URL(connectionString).pathname.slice(1);

  if (databaseName !== 'rentacar_test_db') {
    throw new Error(
      'GÜVENLİK HATASI: Testler yalnızca rentacar_test_db üzerinde çalışabilir.',
    );
  }

  const result = await prisma.$queryRaw<
    { current_database: string }[]
  >`SELECT current_database()`;

  if (result[0]?.current_database !== 'rentacar_test_db') {
    throw new Error(
      'GÜVENLİK HATASI: PostgreSQL bağlantısı yanlış veritabanına yönleniyor.',
    );
  }
}
