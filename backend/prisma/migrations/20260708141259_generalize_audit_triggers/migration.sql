-- ============================================================
-- C1.10 — Généralisation de l'audit à toutes les tables métier
-- Une seule fonction générique remplace audit_admin_changes :
-- TG_TABLE_NAME identifie la table, le mot de passe reste exclu
-- (l'opérateur "- 'password'" est sans effet sur les tables
-- qui n'ont pas cette colonne).
-- Les tables de statistiques (Stats, GlobalStats, StatsSnapshot)
-- et les tables de liaison sont volontairement exclues : données
-- dérivées à forte volumétrie, sans enjeu de sécurité.
-- ============================================================

DROP TRIGGER IF EXISTS "admin_audit" ON "Admin";
DROP FUNCTION IF EXISTS audit_admin_changes();

CREATE OR REPLACE FUNCTION audit_row_changes()
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
  FOR EACH ROW EXECUTE FUNCTION audit_row_changes();

CREATE TRIGGER "candidat_audit"
  AFTER INSERT OR UPDATE OR DELETE ON "Candidat"
  FOR EACH ROW EXECUTE FUNCTION audit_row_changes();

CREATE TRIGGER "atelier_audit"
  AFTER INSERT OR UPDATE OR DELETE ON "Atelier"
  FOR EACH ROW EXECUTE FUNCTION audit_row_changes();

CREATE TRIGGER "question_audit"
  AFTER INSERT OR UPDATE OR DELETE ON "Question"
  FOR EACH ROW EXECUTE FUNCTION audit_row_changes();

CREATE TRIGGER "response_audit"
  AFTER INSERT OR UPDATE OR DELETE ON "Response"
  FOR EACH ROW EXECUTE FUNCTION audit_row_changes();

CREATE TRIGGER "filiere_audit"
  AFTER INSERT OR UPDATE OR DELETE ON "Filiere"
  FOR EACH ROW EXECUTE FUNCTION audit_row_changes();
