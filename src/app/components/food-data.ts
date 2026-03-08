// Shared types and constants — safe to import from both server and client code
// (no Three.js / R3F dependencies)

export interface FoodItem {
  id: number;
  slug: string;
  food_item: string;
  protein_g_per_100g: number;
  cost_eur_per_100g: number;
  calories_per_100g: number;
  cost_per_g_protein_eur: number;
  calories_per_g_protein: number;
  protein_per_100kcal_g: number;
  is_vegan: boolean;
  is_vegetarian: boolean;
  food_group: string;
  diet_tags: string[];
}

export const GROUP_COLORS: Record<string, string> = {
  dairy: "#60a5fa",
  plant_milk: "#34d399",
  eggs: "#fbbf24",
  legume: "#4ade80",
  legume_nut: "#84cc16",
  nut: "#fb923c",
  seed: "#eab308",
  vegetable: "#22d3ee",
  tuber: "#a78bfa",
  grain: "#818cf8",
  pseudograin: "#c084fc",
  bread: "#d97706",
  pasta: "#f472b6",
  soy_product: "#2dd4bf",
  wheat_protein: "#e879f9",
  meat_alternative: "#fb7185",
  yeast: "#facc15",
};
