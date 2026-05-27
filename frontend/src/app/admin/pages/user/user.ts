import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { AdminModel } from '../../../core/models/admin.model';
import { AdminService } from '../../services/admin';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonPrimary } from '../../../shared/components/button-primary/button-primary';
import { InputForm } from '../../../shared/components/input-form/input-form';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-user',
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonPrimary,
    InputForm,
    UpperCasePipe,
    TitleCasePipe,
  ],
  templateUrl: './user.html',
  styleUrl: './user.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class User implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(Auth);
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);

  admins = signal<AdminModel[]>([]);
  currentUser = signal<AdminModel | null>(null);
  modalDeleted = signal(false);
  modalCreate = signal(false);
  selectedAdmin = signal<AdminModel | null>(null);

  isSuperAdmin = computed(() => this.currentUser()?.role === 'superadmin');

  searchTerm = signal('');
  roleFilter = signal<'all' | 'admin' | 'superadmin'>('all');

  createForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~])/)]],
    role: ['admin' as 'admin' | 'superadmin', Validators.required],
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCurrentUser();
      this.loadAdmins();
    }
  }

  loadCurrentUser() {
    this.authService.checkToken().subscribe({
      next: (user) => this.currentUser.set(user as AdminModel),
    });
  }

  loadAdmins() {
    this.adminService.getAdmins().subscribe(data => {
      this.admins.set(data);
    });
  }

  filteredAdmins = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const filter = this.roleFilter();

    return this.admins().filter(a => {
      const matchesSearch =
        !term ||
        a.firstname?.toLowerCase().includes(term) ||
        a.lastname?.toLowerCase().includes(term) ||
        a.email?.toLowerCase().includes(term);

      const matchesFilter =
        filter === 'all' || a.role === filter;

      return matchesSearch && matchesFilter;
    });
  });

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  openCreateModal() {
    if (!this.isSuperAdmin()) return;
    this.createForm.reset({ role: 'admin' });
    this.modalCreate.set(true);
  }

  submitCreate() {
    if (this.createForm.invalid) return;

    const value = this.createForm.getRawValue() as {
      firstname: string;
      lastname: string;
      email: string;
      password: string;
      role: 'admin' | 'superadmin';
    };

    this.adminService.createAdmin(value).subscribe({
      next: () => {
        this.modalCreate.set(false);
        this.loadAdmins();
      }
    });
  }

  modalDeleteAdmin(admin: AdminModel) {
    if (!this.isSuperAdmin()) return;
    this.selectedAdmin.set(admin);
    this.modalDeleted.set(true);
  }

  deleteAdmin() {
    const admin = this.selectedAdmin();
    if (!admin) return;

    this.adminService.deleteAdmin(admin.uid).subscribe({
      next: () => {
        this.closeModal();
      }
    });
  }

  passwordHasMinLength(): boolean {
    const v = this.createForm.get('password')?.value ?? '';
    return v.length >= 6;
  }

  passwordHasUppercase(): boolean {
    return /[A-Z]/.test(this.createForm.get('password')?.value ?? '');
  }

  passwordHasDigit(): boolean {
    return /[0-9]/.test(this.createForm.get('password')?.value ?? '');
  }

  passwordHasSpecialChar(): boolean {
    return /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~]/.test(this.createForm.get('password')?.value ?? '');
  }

  closeModal() {
    this.modalDeleted.set(false);
    this.modalCreate.set(false);
    this.selectedAdmin.set(null);
    this.loadAdmins();
  }
}
