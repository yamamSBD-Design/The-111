
export enum GamePhase {
  BOOT = 'BOOT',
  HUB = 'HUB',
  SCAN = 'SCAN',
  PUZZLE = 'PUZZLE',
  CATCH = 'CATCH',
  CODEX = 'CODEX',
  PROFILE = 'PROFILE',
  LAB = 'LAB',
  TOOLS = 'TOOLS'
}

export enum Rarity {
  COMMON = 'COMMON', // Stable
  UNCOMMON = 'UNCOMMON', // Volatile
  RARE = 'RARE', // Corrupted
  LEGENDARY = 'LEGENDARY' // Pure Entropy
}

export interface Creature {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  fragmentData: string; // The "word" or concept
  scanTimestamp: number;
  // Evolution & Breeding Data
  level: number; // Version number (e.g., 1.0)
  traits: string[]; // e.g., "Glitch-Resistant", "High-Bandwidth"
  generation: number; // 0 for wild, +1 for bred
  parents?: string[]; // IDs of parents
  visualKey: string; // Now maps to CREATURE_VISUALS keys (e.g., NEON_WRAITH)
  imageUrl?: string; // Optional legacy override
}

export interface PuzzleData {
  targetWord: string;
  clue: string;
  context: string;
  difficulty: number;
  detectedObject: string;
}

export interface ToolState {
  id: string;
  level: number;
}

export interface BuffStats {
  puzzleTimeBonus: number; // Seconds
  rewardMultiplier: number; // 0.05 = 5%
  catchStabilityBonus: number; // Flat stability amount
}

export interface PlayerState {
  rank: string; // Title
  rankIndex: number; // 0-4
  xp: number;
  gems: number;
  networkStability: number; // 0-100
  inventory: string[];
  caughtCreatures: Creature[];
  tools: Record<string, number>; // Tool ID -> Level (0 = locked)
  badges?: string[];
  masteryMode?: boolean;
  lastActive?: number;
  activeBuffs: BuffStats;
}

export interface ScanResult {
  puzzle: PuzzleData;
  visualContext: string; // Base64 image
}
