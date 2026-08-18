import { Type } from '@nestjs/common';

export const SwaggerResponses = {
  ErrorServer: {
    status: 500,
    description: 'Erreur interne du serveur.',
  },
  Unauthorized: {
    status: 401,
    description: "L'utilisateur doit être authentifié.",
  },
  Forbidden: {
    status: 403,
    description: 'Accès interdit.',
  },

  NotFound: (entity: string, message?: string) => ({
    status: 404,
    description:
      message || `Impossible de trouver la ressource ${entity} spécifiée.`,
  }),
  Found: (
    entity: string,
    type: Type<unknown> | [Type<unknown>],
    message?: string,
  ) => ({
    status: 200,
    description: message || `${entity} trouvé avec succès.`,
    type,
  }),
  Created: (
    entity: string,
    type: Type<unknown> | [Type<unknown>],
    message?: string,
  ) => ({
    status: 201,
    description: message || `${entity} crée avec succès.`,
    type,
  }),
  Updated: (
    entity: string,
    type: Type<unknown> | [Type<unknown>],
    message?: string,
  ) => ({
    status: 200,
    description: message || `${entity} modifié avec succès.`,
    type,
  }),
  Deleted: (entity: string, message?: string) => ({
    status: 200,
    description: message || `${entity} supprimé avec succès.`,
  }),

  Register: {
    description: 'Nouvel utilisateur enregistré avec succès.',
    schema: {
      example: {
        message: 'Utilisateur enregistré.',
      },
    },
  },
};
