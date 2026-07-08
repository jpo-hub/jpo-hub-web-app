import { AsyncLocalStorage } from 'node:async_hooks';
import { NextFunction, Request, Response } from 'express';

export interface AuditStore {
  email?: string;
}

// Contexte par requête HTTP : la stratégie JWT y dépose l'email de
// l'admin authentifié, PrismaService le transmet à PostgreSQL pour
// que le trigger d'audit renseigne la colonne app_user
export const auditContext = new AsyncLocalStorage<AuditStore>();

export function auditContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  auditContext.run({}, () => next());
}

// À appeler en tête des transactions interactives : propage l'identité
// de l'admin courant sur la connexion de la transaction (set_config est
// local à la transaction, aucune fuite entre requêtes malgré le pool)
export async function tagAuditUser(tx: {
  $executeRaw: (
    query: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<number>;
}): Promise<void> {
  const email = auditContext.getStore()?.email;
  if (email) {
    await tx.$executeRaw`SELECT set_config('app.current_user', ${email}, TRUE)`;
  }
}
