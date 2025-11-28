
// This acts as the central registry for the asset pipeline.
// Maps Visual Keys -> Evolution Tiers -> Asset Paths

export type EvolutionTier = 'tier1' | 'tier2' | 'tier3';

export const CREATURE_FAMILIES = {
  NEON_WRAITH: 'NEON_WRAITH',
  DATA_HIVE: 'DATA_HIVE',
  VOID_SENTINEL: 'VOID_SENTINEL',
} as const;

export type VisualKey = keyof typeof CREATURE_FAMILIES;

// The mapping now enforces the clean folder structure:
// /assets/creatures/{VISUAL_KEY}/{tier}.png
export const CREATURE_VISUALS: Record<string, Record<EvolutionTier, string>> = {
  [CREATURE_FAMILIES.NEON_WRAITH]: {
    tier1: "/assets/creatures/NEON_WRAITH/tier1.png",
    tier2: "/assets/creatures/NEON_WRAITH/tier2.png",
    tier3: "/assets/creatures/NEON_WRAITH/tier3.png",
  },
  [CREATURE_FAMILIES.DATA_HIVE]: {
    tier1: "/assets/creatures/DATA_HIVE/tier1.png",
    tier2: "/assets/creatures/DATA_HIVE/tier2.png",
    tier3: "/assets/creatures/DATA_HIVE/tier3.png",
  },
  [CREATURE_FAMILIES.VOID_SENTINEL]: {
    tier1: "/assets/creatures/VOID_SENTINEL/tier1.png",
    tier2: "/assets/creatures/VOID_SENTINEL/tier2.png",
    tier3: "/assets/creatures/VOID_SENTINEL/tier3.png",
  }
};

// Helper to determine tier from level
export const getTier = (level: number): EvolutionTier => {
  if (level < 5) return 'tier1';
  if (level < 10) return 'tier2';
  return 'tier3';
};

// Helper to get image source safely
export const getCreatureImage = (visualKey: string, level: number): string => {
  const tier = getTier(level);
  
  // Try to find the mapped path
  const family = CREATURE_VISUALS[visualKey];
  if (family && family[tier]) {
    return family[tier];
  }
  
  // Fallback: If visual key exists but not mapped in object (e.g. dynamic key), try standardized path
  if (visualKey) {
    return `/assets/creatures/${visualKey}/${tier}.png`;
  }

  // Final Fallback
  return "/assets/creatures/placeholder.png";
};
