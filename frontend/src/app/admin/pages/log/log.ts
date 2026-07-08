import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuditLogModel } from '../../../core/models/audit-log.model';
import { AuditService } from '../../services/audit';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-log',
  imports: [
    LucideAngularModule,
    FormsModule,
  ],
  templateUrl: './log.html',
  styleUrl: './log.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Log implements OnInit {
  private auditService = inject(AuditService);
  private platformId = inject(PLATFORM_ID);

  logs = signal<AuditLogModel[]>([]);
  selectedLog = signal<AuditLogModel | null>(null);

  searchTerm = signal('');
  operationFilter = signal<'all' | 'INSERT' | 'UPDATE' | 'DELETE'>('all');
  tableFilter = signal('all');

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLogs();
    }
  }

  loadLogs() {
    this.auditService.getAuditLogs().subscribe(data => {
      this.logs.set(data);
    });
  }

  tables = computed(() => {
    const names = this.logs().map(log => log.table_name);
    return [...new Set(names)].sort();
  });

  filteredLogs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const operation = this.operationFilter();
    const table = this.tableFilter();

    return this.logs().filter(log => {
      const matchesSearch =
        !term ||
        log.table_name.toLowerCase().includes(term) ||
        log.record_uid.toLowerCase().includes(term) ||
        log.db_user.toLowerCase().includes(term) ||
        (log.app_user?.toLowerCase().includes(term) ?? false);

      const matchesOperation =
        operation === 'all' || log.operation === operation;

      const matchesTable =
        table === 'all' || log.table_name === table;

      return matchesSearch && matchesOperation && matchesTable;
    });
  });

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  formatJson(data?: Record<string, unknown> | null): string {
    if (!data) return '—';
    return JSON.stringify(data, null, 2);
  }

  operationLabel(operation: AuditLogModel['operation']): string {
    switch (operation) {
      case 'INSERT':
        return 'Création';
      case 'UPDATE':
        return 'Modification';
      case 'DELETE':
        return 'Suppression';
    }
  }

  openDetails(log: AuditLogModel) {
    this.selectedLog.set(log);
  }

  closeModal() {
    this.selectedLog.set(null);
  }
}
