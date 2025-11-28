
import { Rarity } from './types';
import { CREATURE_FAMILIES } from './components/CreatureVisuals';

export const THEME = {
  primary: '#22d3ee', // Cyan-400
  secondary: '#94a3b8', // Slate-400
  background: '#000000',
  accent: '#facc15', // Yellow-400
  danger: '#ef4444', // Red-500
};

export const MAX_STABILITY = 100;
export const XP_PER_CATCH = 100;
export const GEMS_PER_CATCH = 10;
export const SYNTHESIS_COST = 50;
export const EVOLUTION_COST_BASE = 100;
export const MASTERY_MULTIPLIER = 1.5;

export const AVAILABLE_TRAITS = [
  "Glitch-Resistant",
  "High-Bandwidth",
  "Encrypted",
  "Volatile",
  "Neon-Infused",
  "Poly-Morphic",
  "Deep-Web",
  "Zero-Latency"
];

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: '#94a3b8', // Slate
  [Rarity.UNCOMMON]: '#22d3ee', // Cyan
  [Rarity.RARE]: '#facc15', // Yellow
  [Rarity.LEGENDARY]: '#f472b6', // Pink
};

export const GAME_IMAGES = {
  AVATAR_1: "/assets/profile/profile.png",
  AVATAR_PLACEHOLDER: "/assets/profile/profile.png",
};

export const BADGES: Record<string, string> = {
  "PLANT": "BIO-ROOT",
  "TREE": "BIO-ROOT",
  "WATER": "HYDRO-LOGIC",
  "BUILDING": "STRUCTURE-NODE",
  "CAR": "VELOCITY-SHARD",
  "ELECTRONIC": "TECHNO-CORE"
};

// Family Passive Buff Configuration
export const FAMILY_CONFIG = {
  [CREATURE_FAMILIES.NEON_WRAITH]: {
    name: "NEON WRAITH",
    buffDescription: "PUZZLE TIME EXTENSION",
    stat: "puzzleTimeBonus",
    valPerMember: 2, // +2 seconds per member
    unit: "s"
  },
  [CREATURE_FAMILIES.DATA_HIVE]: {
    name: "DATA HIVE",
    buffDescription: "REWARD AMPLIFICATION",
    stat: "rewardMultiplier",
    valPerMember: 0.05, // +5% per member
    unit: "%" // Display logic handles conversion
  },
  [CREATURE_FAMILIES.VOID_SENTINEL]: {
    name: "VOID SENTINEL",
    buffDescription: "CATCH STABILIZATION",
    stat: "catchStabilityBonus",
    valPerMember: 3, // +3% stability per member
    unit: "%"
  }
};

export const TOOLS_CONFIG: Record<string, { name: string, type: string, baseCost: number, effectPerLevel: number, desc: string }> = {
  STABILIZER: {
    name: "GRID STABILIZER",
    type: "ACTIVE",
    baseCost: 100,
    effectPerLevel: 1, // +5s per level in logic
    desc: "Reduces entropy accumulation during decryption puzzles."
  },
  STASIS: {
    name: "STASIS TRAP",
    type: "ACTIVE",
    baseCost: 150,
    effectPerLevel: 0.1, // 10% slow per level
    desc: "Temporarily freezes entity movement in Catch Phase."
  },
  AMPLIFIER: {
    name: "SIGNAL AMPLIFIER",
    type: "PASSIVE",
    baseCost: 200,
    effectPerLevel: 0.05, // +5% rarity chance
    desc: "Increases probability of detecting high-rarity signatures."
  }
};

export const RANKS = [
  {
    title: "INITIATE",
    minXp: 0,
    message: "Welcome to the Aethel Network. Your scanner is active. Begin data recovery.",
    loreFragment: "The First Glitch"
  },
  {
    title: "SEEKER",
    minXp: 500,
    message: "Signal strength increasing. You are finding patterns in the noise.",
    loreFragment: "Cyan Drift Origins"
  },
  {
    title: "OPERATOR",
    minXp: 1500,
    message: "Access level upgraded. The Silence Protocol has noticed you.",
    loreFragment: "Silence Protocol V1"
  },
  {
    title: "ARCHITECT",
    minXp: 4000,
    message: "You are reshaping the grid. The network remembers its creator.",
    loreFragment: "The Architect's Log"
  },
  {
    title: "PRIME",
    minXp: 10000,
    message: "Synchronization complete. Reality and data are one.",
    loreFragment: "Aethel Reborn"
  }
];

export const LORE_LIBRARY: Record<string, { image: string, text: string }> = {
  "The First Glitch": {
    image: "/assets/lore/first-glitch.png",
    text: "Initial data corruption detected in Sector 7. The breakdown of the logic grid was instantaneous, leaving behind only fragmented static."
  },
  "Cyan Drift Origins": {
    image: "/assets/lore/cyan-drift.png",
    text: "Stable memory fragments found floating in the void. These are the last backups of the Aethel Network's core kernel."
  },
  "Silence Protocol V1": {
    image: "/assets/lore/silence-protocol.png",
    text: "An aggressive entropy algorithm designed to erase history. It targets structured data and reduces it to noise."
  },
  "The Architect's Log": {
    image: "/assets/lore/architect-log.png",
    text: "Personal entries from the original network creator. 'We tried to build a paradise, but we only built a cage.'"
  },
  "Aethel Reborn": {
    image: "/assets/lore/aethel-reborn.png",
    text: "Activation complete. The Aethel Network reconstructs itself from pure logic. A new architecture emerges from the void."
  }
};
