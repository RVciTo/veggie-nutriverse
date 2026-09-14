# Nutriverse

Interactive 3D visualization of 43 vegetarian and vegan protein sources. Explore how foods compare across protein content, calorie density, and cost — all in a single orbiting scatter plot.

**Live:** [veggie-nutriverse.vercel.app](https://veggie-nutriverse.vercel.app)

## Status

| Owner | Stack | Version | Stage | Live | Last commit | Branch |
|---|---|---|---|---|---|---|
| Pitsana / Heva Pulse side project | Next.js 15 (static export), React Three Fiber, Three.js, Tailwind | 0.1.0 | Production (finished side project) | Yes, veggie-nutriverse.vercel.app (confirmed responding) | 2026-06-07 | master |

### Production readiness: 76%

Assessed 2026-09-14.

| Stage | Weight | Score | State |
|---|---|---|---|
| Spec and feasibility | 5 | 5 | Small, well-scoped visualization concept, fully realized. |
| Scaffold | 10 | 10 | Clean Next.js static export structure, R3F scene, typed data model. |
| Working prototype | 15 | 15 | 3D scatter plot, filters, detail panel all functional. |
| First real use | 10 | 10 | Deployed and reachable; used as intended by the owner. |
| MVP complete | 15 | 12 | Complete for its narrow scope (43 foods, 3 axes); no further feature roadmap defined. |
| Validated by users | 10 | 5 | No evidence of external user validation; a personal/portfolio side project. |
| Hardening | 20 | 4 | No analytics, no error tracking, no legal pages; static data site so security surface is minimal. |
| Production | 15 | 15 | Live and serving on the production Vercel domain, confirmed by direct fetch. |

### Left to finish

1. Add lightweight analytics if the goal is to learn from real visitors.
2. Confirm SEO basics (meta description, OG image) are set for sharing.
3. Decide if the dataset (43 foods) should grow, or if the project is considered complete as-is.

## What it shows

Each food is a glowing sphere positioned in 3D space:

| Axis | Metric |
|------|--------|
| **X** | Protein (g per 100g) |
| **Y** | Calories (per 100g) |
| **Z** | Cost (EUR per 100g) |
| **Size** | Protein efficiency (g protein per 100 kcal) |

Color encodes one of 17 food groups (legumes, dairy, nuts, grains, soy products, etc.).

## Features

- Auto-rotating camera with orbit controls (drag to explore)
- Filter by diet (All / Vegan / Vegetarian) and food category
- Click any sphere for a detailed stat breakdown with animated bars
- Responsive: collapsible filter drawer and bottom-sheet detail panel on mobile
- Starfield background, fog depth, breathing sphere animations

## Dataset

43 foods across 17 groups. 34 vegan, 43 vegetarian. Each entry includes:

- Protein, calories, cost per 100g
- Derived efficiency metrics (protein per 100 kcal, cost per gram of protein, calories per gram of protein)
- Diet tags and food group classification

Data lives in `public/data.json`.

## Tech stack

- **Next.js 15** (App Router, static export)
- **React Three Fiber 9** + **drei 10** (React 19 compatible)
- **Three.js 0.183**
- **Framer Motion 11** (UI animations)
- **Tailwind CSS 3.4** (glassmorphic panels, responsive layout)
- **TypeScript 5.7**

## Run locally

```bash
npm install
npm run dev
```

Opens at [localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    page.tsx                  # Main UI: filters, detail panel, responsive layout
    layout.tsx                # Root layout (Syne + Space Mono fonts)
    globals.css               # Tailwind + glassmorphic styles
    components/
      Scene.tsx               # R3F canvas, food spheres, axes, lighting
      food-data.ts            # Shared types and group color constants
public/
  data.json                   # 43-food dataset
```

## Deploy

Hosted on Vercel. Push to `master` or run:

```bash
npx vercel --prod
```

## License

MIT

---

A [Heva Pulse](https://pitsana.com/heva-pulse) side project by [Pitsana](https://pitsana.com).
