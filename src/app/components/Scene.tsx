"use client";

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Line, Html } from "@react-three/drei";
import { useRef, useMemo, useState, useCallback } from "react";
import {
  Mesh,
  Group,
  SphereGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  AmbientLight,
  PointLight,
  Fog,
  Color,
  GridHelper,
  MathUtils,
} from "three";
import { GROUP_COLORS } from "./food-data";
import type { FoodItem } from "./food-data";

// R3F v9 requires manual registration of Three.js classes
extend({
  Mesh,
  Group,
  SphereGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  AmbientLight,
  PointLight,
  Fog,
  Color,
  GridHelper,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SceneProps {
  data: FoodItem[];
  selected: FoodItem | null;
  onSelect: (food: FoodItem | null) => void;
  onHover: (food: FoodItem | null) => void;
  visibleGroups: Set<string>;
  dietFilter: "all" | "vegan" | "vegetarian";
  isMobile?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AXIS_LEN = 6;

const DATA_RANGES = {
  protein: { min: 2, max: 50 },
  calories: { min: 20, max: 660 },
  cost: { min: 0.1, max: 6.1 },
  efficiency: { min: 2.2, max: 22.5 },
};

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function norm(v: number, min: number, max: number): number {
  return ((v - min) / (max - min)) * 2 - 1; // -1..1
}

function getColor(group: string): string {
  return GROUP_COLORS[group] ?? "#94a3b8";
}

function isItemVisible(
  food: FoodItem,
  visibleGroups: Set<string>,
  dietFilter: "all" | "vegan" | "vegetarian"
): boolean {
  if (!visibleGroups.has(food.food_group)) return false;
  if (dietFilter === "vegan" && !food.is_vegan) return false;
  if (dietFilter === "vegetarian" && !food.is_vegetarian) return false;
  return true;
}

// ---------------------------------------------------------------------------
// FoodSphere
// ---------------------------------------------------------------------------

function FoodSphere({
  food,
  isSelected,
  isVisible,
  anyHovered,
  onSelect,
  onHover,
}: {
  food: FoodItem;
  isSelected: boolean;
  isVisible: boolean;
  anyHovered: boolean;
  onSelect: (f: FoodItem) => void;
  onHover: (f: FoodItem | null) => void;
}) {
  const ref = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const phase = useMemo(() => food.id * 0.7, [food.id]);

  const position = useMemo<[number, number, number]>(
    () => [
      norm(food.protein_g_per_100g, DATA_RANGES.protein.min, DATA_RANGES.protein.max) * AXIS_LEN,
      norm(food.calories_per_100g, DATA_RANGES.calories.min, DATA_RANGES.calories.max) * AXIS_LEN,
      norm(food.cost_eur_per_100g, DATA_RANGES.cost.min, DATA_RANGES.cost.max) * AXIS_LEN,
    ],
    [food]
  );

  const radius = useMemo(() => {
    const t = norm(food.protein_per_100kcal_g, DATA_RANGES.efficiency.min, DATA_RANGES.efficiency.max);
    return 0.12 + (t + 1) * 0.5 * 0.38; // 0.12..0.50
  }, [food]);

  const color = useMemo(() => getColor(food.food_group), [food.food_group]);
  const colorObj = useMemo(() => new Color(color), [color]);

  const targetScale = useRef(1);
  const targetOpacity = useRef(0.88);
  const targetEmissive = useRef(0.25);
  const currentOpacity = useRef(0.88);
  const currentEmissive = useRef(0.25);

  useFrame((state, delta) => {
    if (!ref.current) return;

    // Determine targets
    targetScale.current = !isVisible
      ? 0.01
      : hovered
        ? 1.5
        : isSelected
          ? 1.3
          : 1;
    targetOpacity.current = !isVisible
      ? 0.02
      : anyHovered && !hovered
        ? 0.35
        : 0.88;
    targetEmissive.current = hovered ? 1.0 : isSelected ? 0.7 : 0.25;

    // Lerp scale with breathing
    const s = ref.current.scale.x;
    const breath = Math.sin(state.clock.elapsedTime * 0.6 + phase) * 0.015;
    const newScale = MathUtils.lerp(s, targetScale.current * (1 + breath), 6 * delta);
    ref.current.scale.setScalar(newScale);

    // Lerp material
    const mat = ref.current.material as MeshStandardMaterial;
    currentOpacity.current = MathUtils.lerp(currentOpacity.current, targetOpacity.current, 5 * delta);
    currentEmissive.current = MathUtils.lerp(currentEmissive.current, targetEmissive.current, 5 * delta);
    mat.opacity = currentOpacity.current;
    mat.emissiveIntensity = currentEmissive.current;
  });

  const handleOver = useCallback(() => {
    setHovered(true);
    onHover(food);
    document.body.style.cursor = "pointer";
  }, [food, onHover]);

  const handleOut = useCallback(() => {
    setHovered(false);
    onHover(null);
    document.body.style.cursor = "auto";
  }, [onHover]);

  const handleClick = useCallback(() => {
    onSelect(food);
  }, [food, onSelect]);

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={colorObj}
        emissive={colorObj}
        emissiveIntensity={0.25}
        metalness={0.15}
        roughness={0.25}
        transparent
        opacity={0.88}
        depthWrite={false}
      />
      {hovered && (
        <Html distanceFactor={18} style={{ pointerEvents: "none" }}>
          <div className="tooltip-3d">
            <span className="font-mono text-xs font-bold" style={{ color }}>
              {food.protein_g_per_100g}g
            </span>{" "}
            {food.food_item}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Axis system
// ---------------------------------------------------------------------------

function AxisSystem() {
  const axisColor = "#334155";
  const tickColor = "#1e293b";

  const axes: { dir: [number, number, number]; label: string; color: string }[] = [
    { dir: [1, 0, 0], label: "PROTEIN (g/100g)", color: "#818cf8" },
    { dir: [0, 1, 0], label: "CALORIES (/100g)", color: "#fb923c" },
    { dir: [0, 0, 1], label: "COST (EUR/100g)", color: "#4ade80" },
  ];

  return (
    <group>
      {/* Ground grid */}
      <gridHelper
        args={[AXIS_LEN * 2, 12, tickColor, tickColor]}
        position={[0, -AXIS_LEN, 0]}
      />

      {/* Axis lines */}
      {axes.map(({ dir, label, color }, i) => {
        const start: [number, number, number] = [
          -dir[0] * AXIS_LEN,
          -dir[1] * AXIS_LEN,
          -dir[2] * AXIS_LEN,
        ];
        const end: [number, number, number] = [
          dir[0] * AXIS_LEN,
          dir[1] * AXIS_LEN,
          dir[2] * AXIS_LEN,
        ];
        const labelPos: [number, number, number] = [
          dir[0] * (AXIS_LEN + 0.8),
          dir[1] * (AXIS_LEN + 0.8),
          dir[2] * (AXIS_LEN + 0.8),
        ];

        return (
          <group key={i}>
            <Line
              points={[start, end]}
              color={axisColor}
              lineWidth={1}
              dashed
              dashSize={0.3}
              gapSize={0.15}
            />
            <Text
              position={labelPos}
              fontSize={0.32}
              color={color}
              anchorX="center"
              anchorY="middle"
              font={undefined}
            >
              {label}
            </Text>
          </group>
        );
      })}

      {/* Origin marker */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#475569" />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Scene content (inside Canvas)
// ---------------------------------------------------------------------------

function SceneContent({
  data,
  selected,
  onSelect,
  onHover,
  visibleGroups,
  dietFilter,
}: SceneProps) {
  const [hoveredFood, setHoveredFood] = useState<FoodItem | null>(null);

  const handleHover = useCallback(
    (food: FoodItem | null) => {
      setHoveredFood(food);
      onHover(food);
    },
    [onHover]
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <pointLight position={[10, 15, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-8, -10, -8]} intensity={0.25} color="#4060ff" />
      <pointLight position={[0, 10, -10]} intensity={0.15} color="#60a5fa" />

      {/* Fog for depth */}
      <fog attach="fog" args={["#050510", 22, 50]} />
      <color attach="background" args={["#050510"]} />

      {/* Stars background */}
      <Stars
        radius={80}
        depth={60}
        count={2500}
        factor={3}
        saturation={0.1}
        fade
        speed={0.4}
      />

      {/* Controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.06}
        minDistance={6}
        maxDistance={32}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 + 0.3}
      />

      {/* Axes */}
      <AxisSystem />

      {/* Food spheres */}
      {data.map((food) => (
        <FoodSphere
          key={food.id}
          food={food}
          isSelected={selected?.id === food.id}
          isVisible={isItemVisible(food, visibleGroups, dietFilter)}
          anyHovered={hoveredFood !== null}
          onSelect={onSelect}
          onHover={handleHover}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Exported Canvas wrapper
// ---------------------------------------------------------------------------

export default function NutriScene(props: SceneProps) {
  const { isMobile } = props;
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{
          position: isMobile ? [16, 11, 16] : [12, 8, 12],
          fov: isMobile ? 56 : 48,
        }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, isMobile ? 1.5 : 2]}
      >
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
}
