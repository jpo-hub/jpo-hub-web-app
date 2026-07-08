-- ============================================================
-- Démonstration C1.10 : triggers + contraintes CHECK + audit
-- Usage :
--   docker exec -i backend-jpo-hub-db psql -U jpo-hub -d jpo-hub-db < prisma/demo_c1_10.sql
-- Script ré-exécutable : nettoie ses propres données de test au début.
-- ============================================================
\set ECHO queries

-- (nettoyage des exécutions précédentes)
DELETE FROM "Candidat" WHERE "email" = 'jean.dupont@example.com';
DELETE FROM "Admin" WHERE "uid" = '11111111-1111-1111-1111-111111111111';

-- 0) Attribution applicative : en production, le backend NestJS transmet
--    l'email de l'admin authentifié (JWT) via cette variable de session ;
--    le trigger d'audit la recopie dans audit_log.app_user
SELECT set_config('app.current_user', 'demo.jury@ynov.com', false);

-- 1) Trigger de normalisation : email saisi en MAJUSCULES avec espaces
INSERT INTO "Candidat" ("uid", "firstname", "lastname", "email", "ageRange", "appointment", "consentement", "updatedAt")
VALUES (gen_random_uuid(), 'Jean', 'DUPONT', '  Jean.DUPONT@Example.COM  ', '15-17', false, true, now());

SELECT "firstname", "email" FROM "Candidat" WHERE "lastname" = 'DUPONT';

-- 2) Contrainte CHECK : email invalide -> rejet (anomalie bloquée)
INSERT INTO "Candidat" ("uid", "firstname", "lastname", "email", "ageRange", "appointment", "consentement", "updatedAt")
VALUES (gen_random_uuid(), 'Test', 'INVALIDE', 'pas-un-email', '15-17', false, true, now());

-- 3) Contrainte CHECK : score négatif -> rejet (anomalie bloquée)
UPDATE "Candidat_Filiere" SET "score" = -5 WHERE true;

-- 4) Contrainte CHECK : rôle inconnu -> rejet (anomalie bloquée)
INSERT INTO "Admin" ("uid", "firstname", "lastname", "password", "role", "email", "updatedAt")
VALUES (gen_random_uuid(), 'Pirate', 'TEST', 'x', 'hacker', 'pirate@test.fr', now());

-- 5) Trigger d'audit : création puis modification d'un admin
INSERT INTO "Admin" ("uid", "firstname", "lastname", "password", "role", "email", "updatedAt")
VALUES ('11111111-1111-1111-1111-111111111111', 'Alice', 'MARTIN', '$2b$10$hash...', 'admin', 'Alice.MARTIN@ynov.com', now());

UPDATE "Admin" SET "role" = 'superadmin' WHERE "uid" = '11111111-1111-1111-1111-111111111111';

-- 6) Journal d'audit : opérations tracées, acteur identifié, mot de passe exclu
SELECT "table_name", "operation", coalesce("app_user", '(public)') AS acteur,
       "logged_at",
       "new_data"->>'email' AS email,
       "old_data"->>'role'  AS ancien_role,
       "new_data"->>'role'  AS nouveau_role
FROM "audit_log" ORDER BY "logged_at" DESC LIMIT 8;
