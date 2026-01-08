export class CandidatModel {
  firstname!: string;
  lastname!: string;
  email!: string;
  dateBirth!: string;
  consentement!: boolean;
  filieres!: Record<string, number>;
  appointment!: boolean;
}
