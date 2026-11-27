export const dynamic = "force-static";

export function GET() {
  const body = `# Nutriverse

> Interactive 3D explorer that compares protein, cost and calories across 43 vegetarian and vegan foods.

- Home: https://veggie-nutriverse.vercel.app/
- Data: protein, cost (EUR) and calories per 100 g; vegan and vegetarian flags; food groups (legumes, dairy, eggs, nuts and seeds, grains, soy and plant-based, vegetables).
- Use: find plant-based protein alternatives and compare them by protein per euro or per calorie.
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
