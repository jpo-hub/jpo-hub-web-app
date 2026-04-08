export class Atelier {
  uid?: string;
  label!: string;
  createAt?: string;
  updateAt?: string;
  draft!: boolean;
  description!: string;
  imageUrl!: string;
  dockerfilelink!: string;
  filiere!: Record<string, number>;
}
