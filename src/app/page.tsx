"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { FoodItem } from "./components/food-data";
import { GROUP_COLORS } from "./components/food-data";

const NutriScene = dynamic(() => import("./components/Scene"), { ssr: false });

// ---------------------------------------------------------------------------
// Category groupings for filter UI
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { key: "legumes", groups: ["legume", "legume_nut"], label: "Legumes", color: "#4ade80" },
  { key: "dairy", groups: ["dairy"], label: "Dairy", color: "#60a5fa" },
  { key: "eggs", groups: ["eggs"], label: "Eggs", color: "#fbbf24" },
  { key: "nuts_seeds", groups: ["nut", "seed"], label: "Nuts & Seeds", color: "#fb923c" },
  { key: "grains", groups: ["grain", "pseudograin", "bread", "pasta"], label: "Grains & Pasta", color: "#818cf8" },
  { key: "soy_plant", groups: ["soy_product", "plant_milk", "wheat_protein", "meat_alternative"], label: "Soy & Plant", color: "#2dd4bf" },
  { key: "vegetables", groups: ["vegetable", "tuber"], label: "Vegetables", color: "#22d3ee" },
  { key: "other", groups: ["yeast"], label: "Other", color: "#facc15" },
];

// ---------------------------------------------------------------------------
// Hook: responsive breakpoint
// ---------------------------------------------------------------------------

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ---------------------------------------------------------------------------
// Stat bar component
// ---------------------------------------------------------------------------

function StatBar({
  label,
  value,
  max,
  unit,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  delay?: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {value.toFixed(value < 1 ? 2 : 1)}
          <span className="ml-1 text-[10px] font-normal text-slate-500">{unit}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail panel — desktop: right sidebar, mobile: bottom sheet
// ---------------------------------------------------------------------------

function DetailPanel({
  food,
  onClose,
  isMobile,
}: {
  food: FoodItem;
  onClose: () => void;
  isMobile: boolean;
}) {
  const groupColor = GROUP_COLORS[food.food_group] ?? "#94a3b8";
  const groupLabel = food.food_group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const mobileMotion = {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { type: "spring" as const, damping: 30, stiffness: 350 },
  };

  const desktopMotion = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 40, opacity: 0 },
    transition: { type: "spring" as const, damping: 25, stiffness: 300 },
  };

  const motionProps = isMobile ? mobileMotion : desktopMotion;

  return (
    <motion.div
      {...motionProps}
      className={
        isMobile
          ? "glass pointer-events-auto fixed inset-x-0 bottom-0 z-30 max-h-[70vh] overflow-y-auto rounded-t-2xl"
          : "glass pointer-events-auto w-72 overflow-hidden rounded-2xl"
      }
      style={isMobile ? { borderTop: `3px solid ${groupColor}` } : { borderLeft: `3px solid ${groupColor}` }}
    >
      {/* Mobile drag handle */}
      {isMobile && (
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>
      )}

      {/* Header */}
      <div className="relative px-5 pb-3 pt-4">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <h2 className="pr-8 font-display text-lg font-bold leading-tight tracking-tight text-white">
          {food.food_item}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{
              background: `${groupColor}15`,
              color: groupColor,
              border: `1px solid ${groupColor}30`,
            }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: groupColor }} />
            {groupLabel}
          </span>
          {food.is_vegan && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
              Vegan
            </span>
          )}
          {!food.is_vegan && food.is_vegetarian && (
            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400 ring-1 ring-sky-500/20">
              Vegetarian
            </span>
          )}
        </div>
      </div>

      <div className="mx-5 h-px bg-white/[0.06]" />

      {/* Stats — on mobile use 2-col grid for compactness */}
      <div className={isMobile ? "grid grid-cols-2 gap-x-5 gap-y-3 px-5 py-4" : "space-y-3 px-5 py-4"}>
        {!isMobile && (
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Per 100g</p>
        )}
        <StatBar label="Protein" value={food.protein_g_per_100g} max={50} unit="g" color="#818cf8" delay={0.05} />
        <StatBar label="Calories" value={food.calories_per_100g} max={660} unit="kcal" color="#fb923c" delay={0.1} />
        <StatBar label="Cost" value={food.cost_eur_per_100g} max={6} unit="EUR" color="#4ade80" delay={0.15} />
        <StatBar label="Prot/100kcal" value={food.protein_per_100kcal_g} max={22.5} unit="g" color="#22d3ee" delay={0.2} />
        <StatBar label="Cost/g prot" value={food.cost_per_g_protein_eur} max={0.4} unit="EUR" color="#e879f9" delay={0.25} />
        <StatBar label="Cal/g prot" value={food.calories_per_g_protein} max={44} unit="kcal" color="#fbbf24" delay={0.3} />
      </div>

      {/* Desktop shows section headers */}
      {!isMobile && (
        <>
          <div className="mx-5 h-px bg-white/[0.06]" />
          <div className="px-5 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Efficiency</p>
          </div>
        </>
      )}

      {/* Safe area spacing on mobile */}
      {isMobile && <div className="h-6" />}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Mobile filter drawer
// ---------------------------------------------------------------------------

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 4h14M5 9h8M7 14h4" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const isMobile = useIsMobile();
  const [data, setData] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [hovered, setHovered] = useState<FoodItem | null>(null);
  const [dietFilter, setDietFilter] = useState<"all" | "vegan" | "vegetarian">("all");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => new Set(CATEGORIES.map((c) => c.key))
  );
  const [loaded, setLoaded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Load data
  useEffect(() => {
    fetch("/data.json")
      .then((r) => r.json())
      .then((d: FoodItem[]) => {
        setData(d);
        setTimeout(() => setLoaded(true), 300);
      });
  }, []);

  // Close filters when selecting a food on mobile
  useEffect(() => {
    if (selected && isMobile) setFiltersOpen(false);
  }, [selected, isMobile]);

  // Compute visible food groups from active categories
  const visibleGroups = useMemo(() => {
    const groups = new Set<string>();
    for (const cat of CATEGORIES) {
      if (activeCategories.has(cat.key)) {
        cat.groups.forEach((g) => groups.add(g));
      }
    }
    return groups;
  }, [activeCategories]);

  const toggleCategory = useCallback((key: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setActiveCategories((prev) => {
      if (prev.size === CATEGORIES.length) return new Set();
      return new Set(CATEGORIES.map((c) => c.key));
    });
  }, []);

  const visibleCount = useMemo(() => {
    return data.filter((f) => {
      if (!visibleGroups.has(f.food_group)) return false;
      if (dietFilter === "vegan" && !f.is_vegan) return false;
      if (dietFilter === "vegetarian" && !f.is_vegetarian) return false;
      return true;
    }).length;
  }, [data, visibleGroups, dietFilter]);

  const handleSelect = useCallback((food: FoodItem | null) => {
    setSelected((prev) => (prev?.id === food?.id ? null : food));
  }, []);

  // Shared filter content (used in both desktop sidebar and mobile drawer)
  const filterContent = (
    <>
      {/* Diet filter */}
      <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-slate-500">Diet</p>
      <div className="flex gap-1">
        {(["all", "vegan", "vegetarian"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDietFilter(d)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              dietFilter === d
                ? "bg-white/[0.1] text-white shadow-sm"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
            }`}
          >
            {d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Category toggles */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Categories</p>
        <button
          onClick={toggleAll}
          className="text-[10px] text-slate-600 transition-colors hover:text-slate-400"
        >
          {activeCategories.size === CATEGORIES.length ? "None" : "All"}
        </button>
      </div>
      <div className={isMobile ? "mt-2 grid grid-cols-2 gap-1" : "mt-2 space-y-1"}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategories.has(cat.key);
          return (
            <button
              key={cat.key}
              onClick={() => toggleCategory(cat.key)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-all ${
                isActive
                  ? "bg-white/[0.04] text-slate-200"
                  : "text-slate-600 hover:bg-white/[0.02] hover:text-slate-400"
              }`}
            >
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full transition-opacity"
                style={{ background: cat.color, opacity: isActive ? 1 : 0.2 }}
              />
              {cat.label}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* 3D Scene */}
      {data.length > 0 && (
        <NutriScene
          data={data}
          selected={selected}
          onSelect={handleSelect}
          onHover={setHovered}
          visibleGroups={visibleGroups}
          dietFilter={dietFilter}
          isMobile={isMobile}
        />
      )}

      {/* UI Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10">

        {/* ── Title ── */}
        <motion.div
          className="absolute left-4 top-4 md:left-6 md:top-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="font-display text-2xl font-black tracking-tight md:text-3xl">
            <span className="text-gradient">NUTRIVERSE</span>
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 md:mt-1 md:text-sm">
            Veggie Protein Explorer
          </p>
          <p className="font-mono text-[10px] text-slate-600 md:mt-0.5 md:text-xs">
            {visibleCount}/{data.length} foods
          </p>
        </motion.div>

        {/* ── DESKTOP: Filter panel (left sidebar) ── */}
        {!isMobile && (
          <motion.div
            className="pointer-events-auto absolute bottom-6 left-6 top-28 flex flex-col"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="glass custom-scroll max-h-full overflow-y-auto rounded-2xl p-4">
              {filterContent}
            </div>
          </motion.div>
        )}

        {/* ── MOBILE: Filter toggle button ── */}
        {isMobile && (
          <motion.button
            className="pointer-events-auto absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl glass text-slate-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <FilterIcon />
            {activeCategories.size < CATEGORIES.length && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white">
                {activeCategories.size}
              </span>
            )}
          </motion.button>
        )}

        {/* ── MOBILE: Filter drawer (slides up from bottom) ── */}
        <AnimatePresence>
          {isMobile && filtersOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="pointer-events-auto fixed inset-0 z-20 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFiltersOpen(false)}
              />
              {/* Drawer */}
              <motion.div
                className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 max-h-[65vh] overflow-y-auto rounded-t-2xl glass p-5 pb-8"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-sm font-bold text-white">Filters</h2>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {filterContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Detail panel ── */}
        <div className={isMobile ? "" : "absolute right-6 top-6"}>
          <AnimatePresence>
            {selected && (
              <DetailPanel
                key={selected.id}
                food={selected}
                onClose={() => setSelected(null)}
                isMobile={isMobile}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Hovered info (bottom center) — desktop only ── */}
        {!isMobile && (
          <AnimatePresence>
            {hovered && !selected && (
              <motion.div
                className="pointer-events-none absolute bottom-20 left-1/2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ transform: "translateX(-50%)" }}
              >
                <div className="glass rounded-xl px-5 py-3 text-center">
                  <p className="font-display text-sm font-bold text-white">{hovered.food_item}</p>
                  <p className="mt-1 font-mono text-xs text-slate-400">
                    <span style={{ color: "#818cf8" }}>{hovered.protein_g_per_100g}g protein</span>
                    {" · "}
                    <span style={{ color: "#fb923c" }}>{hovered.calories_per_100g} kcal</span>
                    {" · "}
                    <span style={{ color: "#4ade80" }}>€{hovered.cost_eur_per_100g.toFixed(2)}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Axis legend — hidden on mobile ── */}
        {!isMobile && (
          <motion.div
            className="absolute bottom-6 right-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="glass pointer-events-auto rounded-xl px-4 py-3">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-600">
                Axes & Size
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
                <span>
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span className="text-slate-400">X</span>{" "}
                  <span className="text-slate-500">Protein</span>
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-orange-400" />
                  <span className="text-slate-400">Y</span>{" "}
                  <span className="text-slate-500">Calories</span>
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-400">Z</span>{" "}
                  <span className="text-slate-500">Cost</span>
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full border border-slate-600" />
                  <span className="text-slate-400">Size</span>{" "}
                  <span className="text-slate-500">Protein efficiency</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Loading screen */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-void"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center">
              <h1 className="font-display text-4xl font-black tracking-tight text-gradient">
                NUTRIVERSE
              </h1>
              <p className="mt-3 animate-pulse font-mono text-xs text-slate-600">
                Loading nutrition data...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
