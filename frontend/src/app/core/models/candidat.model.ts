export class CandidatModel {
  firstname!: string;
  lastname!: string;
  email!: string;
  ageRange!: string;
  consentement!: boolean;
  filieres!: Record<string, number>;
  appointment!: boolean;
}
