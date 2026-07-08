export class AdminModel {
  uid?: string;
  firstname!: string;
  lastname!: string;
  email!: string;
  role!: 'admin' | 'superadmin';
  createdAt?: string;
}
