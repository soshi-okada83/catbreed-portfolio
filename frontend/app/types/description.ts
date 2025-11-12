export type BreedDescription = {
  breed: string;
  overview: string;
  key_facts: {
    origin: string;
    size: string;
    coat: string;
    colors: string[];
    lifespan_years: string;
    shedding: string;
    hypoallergenic: boolean;
  };
  temperament: string[];
  care: { grooming: string; exercise: string; training: string };
  health: { common_issues: string[]; notes: string };
  living_with: { good_with: string[]; cautions: string[] };
  fun_fact: string;
};
