-- ============================================================
-- C1.10 — Attribution applicative des opérations auditées
-- L'application se connecte avec un unique compte PostgreSQL :
-- current_user ne dit pas QUEL admin a agi. Le backend transmet
-- l'email de l'admin (issu du JWT) via une variable de session
-- locale à la transaction : set_config('app.current_user', ..., TRUE).
-- Le trigger la lit ici. NULL = action publique (ex : inscription
-- d'un candidat) ou interne, sans admin authentifié.
-- ============================================================

ALTER TABLE "audit_log" ADD COLUMN "app_user" TEXT;

CREATE OR REPLACE FUNCTION audit_row_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_app_user TEXT := NULLIF(current_setting('app.current_user', TRUE), '');
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO "audit_log" ("table_name", "operation", "record_uid", "old_data", "app_user")
    VALUES (TG_TABLE_NAME, TG_OP, OLD."uid", to_jsonb(OLD) - 'password', v_app_user);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO "audit_log" ("table_name", "operation", "record_uid", "old_data", "new_data", "app_user")
    VALUES (TG_TABLE_NAME, TG_OP, NEW."uid", to_jsonb(OLD) - 'password', to_jsonb(NEW) - 'password', v_app_user);
    RETURN NEW;
  ELSE
    INSERT INTO "audit_log" ("table_name", "operation", "record_uid", "new_data", "app_user")
    VALUES (TG_TABLE_NAME, TG_OP, NEW."uid", to_jsonb(NEW) - 'password', v_app_user);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;
