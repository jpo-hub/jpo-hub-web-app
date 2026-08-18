export class AuditLogModel {
  uid!: string;
  table_name!: string;
  operation!: 'INSERT' | 'UPDATE' | 'DELETE';
  record_uid!: string;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  db_user!: string;
  app_user?: string | null;
  logged_at!: string;
}
