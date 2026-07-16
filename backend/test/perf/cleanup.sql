-- Nettoyage des données générées par le test de charge k6
-- (candidats dont l'email se termine par @loadtest.local)
-- Usage :
--   docker exec -i backend-jpo-hub-db psql -U jpo-hub -d jpo-hub-db < test/perf/cleanup.sql

DELETE FROM "Candidat_Filiere"
WHERE "candidatId" IN (SELECT "uid" FROM "Candidat" WHERE "email" LIKE '%@loadtest.local');

DELETE FROM "Atelier_Candidat"
WHERE "candidatId" IN (SELECT "uid" FROM "Candidat" WHERE "email" LIKE '%@loadtest.local');

DELETE FROM "Candidat" WHERE "email" LIKE '%@loadtest.local';

-- Entrées d'audit générées par le test (INSERT des candidats de charge)
DELETE FROM "audit_log"
WHERE "table_name" = 'Candidat'
  AND (
    "new_data"->>'email' LIKE '%@loadtest.local'
    OR "old_data"->>'email' LIKE '%@loadtest.local'
  );

SELECT count(*) AS candidats_restants FROM "Candidat";
