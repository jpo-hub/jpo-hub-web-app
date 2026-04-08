export class Atelier {
  uid!: string;
  label!: string;
  date?: string;
  draft!: boolean;
  description!: string;
  imageUrl!: string;
  dockerfilelink!: string;
  filiere!: Record<string, number>;
}
