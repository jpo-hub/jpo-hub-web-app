-- ============================================================
-- C1.10 — Sécurisation de l'accès aux données
-- Contraintes d'intégrité (CHECK), déclencheurs (TRIGGER)
-- et journalisation des anomalies (table d'audit)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Contraintes CHECK : intégrité métier au niveau du SGBD
--    (défense en profondeur : même un accès direct à la base
--    ne peut pas insérer de données incohérentes)
-- ------------------------------------------------------------

-- Un score de pondération ne peut jamais être négatif
ALTER TABLE "Reponse_Filiere"
  ADD CONSTRAINT "reponse_filiere_score_positive" CHECK ("score" >= 0);

ALTER TABLE "Candidat_Filiere"
  ADD CONSTRAINT "candidat_filiere_score_positive" CHECK ("score" >= 0);

ALTER TABLE "Atelier_Filiere"
  ADD CONSTRAINT "atelier_filiere_score_positive" CHECK ("score" >= 0);

-- Le rôle d'un administrateur est limité aux valeurs autorisées
ALTER TABLE "Admin"
  ADD CONSTRAINT "admin_role_valid" CHECK ("role" IN ('admin', 'superadmin'));

-- Un email doit avoir une forme minimale valide (local@domaine.tld)
ALTER TABLE "Candidat"
  ADD CONSTRAINT "candidat_email_format" CHECK ("email" ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

ALTER TABLE "Admin"
  ADD CONSTRAINT "admin_email_format" CHECK ("email" ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- ------------------------------------------------------------
-- 2. Table d'audit : journal des opérations sensibles
-- ------------------------------------------------------------

CREATE TABLE "audit_log" (
  "uid"        UUID        NOT NULL DEFAULT gen_random_uuid(),
  "table_name" TEXT        NOT NULL,
  "operation"  TEXT        NOT NULL CHECK ("operation" IN ('INSERT', 'UPDATE', 'DELETE')),
  "record_uid" TEXT        NOT NULL,
  "old_data"   JSONB,
  "new_data"   JSONB,
  "db_user"    TEXT        NOT NULL DEFAULT current_user,
  "logged_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "audit_log_pkey" PRIMARY KEY ("uid")
);

CREATE INDEX "audit_log_table_operation_idx" ON "audit_log" ("table_name", "operation");
CREATE INDEX "audit_log_logged_at_idx" ON "audit_log" ("logged_at");

-- ------------------------------------------------------------
-- 3. Trigger de normalisation : les emails sont toujours
--    stockés en minuscules et sans espaces parasites,
--    quel que soit le client qui écrit dans la base
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION normalize_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW."email" := lower(trim(NEW."email"));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "candidat_normalize_email"
  BEFORE INSERT OR UPDATE OF "email" ON "Candidat"
  FOR EACH ROW
  EXECUTE FUNCTION normalize_email();

CREATE TRIGGER "admin_normalize_email"
  BEFORE INSERT OR UPDATE OF "email" ON "Admin"
  FOR EACH ROW
  EXECUTE FUNCTION normalize_email();

-- ------------------------------------------------------------
-- 4. Trigger d'audit sur la table Admin : toute création,
--    modification ou suppression d'un compte administrateur
--    est journalisée dans audit_log (mot de passe exclu)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION audit_admin_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO "audit_log" ("table_name", "operation", "record_uid", "old_data")
    VALUES (TG_TABLE_NAME, TG_OP, OLD."uid", to_jsonb(OLD) - 'password');
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO "audit_log" ("table_name", "operation", "record_uid", "old_data", "new_data")
    VALUES (TG_TABLE_NAME, TG_OP, NEW."uid", to_jsonb(OLD) - 'password', to_jsonb(NEW) - 'password');
    RETURN NEW;
  ELSE
    INSERT INTO "audit_log" ("table_name", "operation", "record_uid", "new_data")
    VALUES (TG_TABLE_NAME, TG_OP, NEW."uid", to_jsonb(NEW) - 'password');
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "admin_audit"
  AFTER INSERT OR UPDATE OR DELETE ON "Admin"
  FOR EACH ROW
  EXECUTE FUNCTION audit_admin_changes();
