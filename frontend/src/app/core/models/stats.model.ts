export class Stats {
  filieres!: Record<string, number>;
  ateliersActifs!: number;
  appointment!: number;
  candidats!: number;
  topAteliers!: Atelier[];
}

class Atelier {
  uid!: string;
  label!: string;
  candidatsCount!: number;
}

export class LastStats {
  uid!: string;
  label!: string;
  data!: Stats
  timestamp!: string;
}
