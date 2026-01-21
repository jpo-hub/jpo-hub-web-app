import {Atelier} from './atelier.model';

export class CandidatModel {
  uid?: string;
  firstname!: string;
  lastname!: string;
  email!: string;
  ageRange!: string;
  consentement!: boolean;
  filieres!: Record<string, number>;
  appointment!: boolean;
  ateliers?: Atelier[];
}
