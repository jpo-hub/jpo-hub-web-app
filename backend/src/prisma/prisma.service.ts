import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { auditContext } from '../common/audit/audit-context';

const WRITE_OPERATIONS = new Set([
  'create',
  'createMany',
  'createManyAndReturn',
  'update',
  'updateMany',
  'updateManyAndReturn',
  'upsert',
  'delete',
  'deleteMany',
]);

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });

    // Chaque écriture d'un admin authentifié est exécutée dans une
    // transaction qui transmet d'abord son email à PostgreSQL
    // (set_config local à la transaction) : le trigger d'audit
    // renseigne ainsi la colonne app_user. Les opérations déjà dans
    // une transaction sont couvertes par tagAuditUser() en tête de
    // celle-ci.
    return this.$extends({
      query: {
        $allModels: {
          $allOperations: ({ operation, args, query, ...rest }) => {
            const email = auditContext.getStore()?.email;
            const inTransaction = (
              rest as { __internalParams?: { transaction?: unknown } }
            ).__internalParams?.transaction;

            if (!email || inTransaction || !WRITE_OPERATIONS.has(operation)) {
              return query(args);
            }

            return this.$transaction([
              this
                .$executeRaw`SELECT set_config('app.current_user', ${email}, TRUE)`,
              query(args) as unknown as Prisma.PrismaPromise<unknown>,
            ]).then(([, result]) => result);
          },
        },
      },
    }) as unknown as this;
  }
}
