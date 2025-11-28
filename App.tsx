
import React, { useState, useEffect } from 'react';
import { GamePhase, PlayerState, Creature, Rarity, PuzzleData, BuffStats } from './types';
import { generateContextualPuzzle } from './services/geminiService';
import { BrutalButton, Panel, DataRow } from './components/UIComponents';
import Scanner from './components/Scanner';
import PuzzleModule from './components/PuzzleModule';
import CatchModule from './components/CatchModule';
import NetworkGraph from './components/NetworkGraph';
import LabModule from './components/LabModule';
import ToolsModule from './components/ToolsModule';
import CreatureAvatar from './components/CreatureAvatar';
import LoreModule from './components/LoreModule';
import { Activity, Archive, MapPin, FlaskConical, Wrench, Shield, AlertTriangle, Layers } from 'lucide-react';
import { THEME, MAX_STABILITY, AVAILABLE_TRAITS, SYNTHESIS_COST, EVOLUTION_COST_BASE, GAME_IMAGES, RANKS, TOOLS_CONFIG, XP_PER_CATCH, GEMS_PER_CATCH, MASTERY_MULTIPLIER, BADGES, FAMILY_CONFIG } from './constants';
import { CREATURE_FAMILIES } from './components/CreatureVisuals';

// Feedback Item Interface
interface VisualFeedback {
  id: number;
  text: string;
  color: string; // Tailwind class
}

const App: React.FC = () => {
  
  // Helper: Calculate Buffs based on collection
  const calculateBuffs = (creatures: Creature[]): BuffStats => {
    const stats: BuffStats = {
      puzzleTimeBonus: 0,
      rewardMultiplier: 1.0,
      catchStabilityBonus: 0
    };

    // Count members per family
    const counts: Record<string, number> = {};
    creatures.forEach(c => {
      const key = c.visualKey || 'UNKNOWN';
      counts[key] = (counts[key] || 0) + 1;
    });

    // Apply configuration
    Object.keys(FAMILY_CONFIG).forEach(key => {
      const config = FAMILY_CONFIG[key as keyof typeof FAMILY_CONFIG];
      const count = counts[key] || 0;
      
      if (config.stat === 'puzzleTimeBonus') {
        stats.puzzleTimeBonus += count * config.valPerMember;
      }
      if (config.stat === 'rewardMultiplier') {
        stats.rewardMultiplier += count * config.valPerMember;
      }
      if (config.stat === 'catchStabilityBonus') {
        stats.catchStabilityBonus += count * config.valPerMember;
      }
    });

    return stats;
  };

  // State
  const [phase, setPhase] = useState<GamePhase>(GamePhase.BOOT);
  const [player, setPlayer] = useState<PlayerState>(() => {
    // Load from local storage
    const saved = localStorage.getItem('AETHEL_PLAYER');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Offline evolution check
      const now = Date.now();
      const diff = now - (parsed.lastActive || now);
      const hoursOffline = diff / (1000 * 60 * 60);
      
      let stabilityChange = 0;
      if (hoursOffline > 1) {
        stabilityChange = -Math.floor(hoursOffline * 5); // Decay 5% per hour
      }

      // DATA MIGRATION: Heal legacy creatures missing visualKeys
      const families = Object.values(CREATURE_FAMILIES);
      const healedCreatures = (parsed.caughtCreatures || []).map((c: any) => ({
        ...c,
        // If visualKey is missing, assign a random one so the PNG assets work
        visualKey: c.visualKey || families[Math.floor(Math.random() * families.length)]
      }));

      return {
        ...parsed,
        caughtCreatures: healedCreatures,
        networkStability: Math.max(0, Math.min(100, parsed.networkStability + stabilityChange)),
        lastActive: now,
        // Recalculate buffs on load to ensure sync
        activeBuffs: calculateBuffs(healedCreatures)
      };
    }
    return {
      rank: RANKS[0].title,
      rankIndex: 0,
      xp: 0,
      gems: 250,
      networkStability: 45,
      inventory: [],
      caughtCreatures: [],
      tools: { 'STABILIZER': 0, 'STASIS': 0, 'AMPLIFIER': 0 },
      badges: [],
      masteryMode: false,
      lastActive: Date.now(),
      activeBuffs: { puzzleTimeBonus: 0, rewardMultiplier: 1.0, catchStabilityBonus: 0 }
    };
  });
  
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<PuzzleData | null>(null);
  
  // Temporary state to hold the creature we are currently catching
  const [pendingCreature, setPendingCreature] = useState<Partial<Creature> | null>(null);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRankModal, setShowRankModal] = useState<boolean>(false);
  
  // Visual Feedback Queue
  const [feedbacks, setFeedbacks] = useState<VisualFeedback[]>([]);

  // Helper to trigger floating text
  const triggerFeedback = (text: string, color: string = 'text-cyan-400') => {
    const id = Date.now() + Math.random();
    setFeedbacks(prev => [...prev, { id, text, color }]);
    
    // Auto remove after animation
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, 2000);
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem('AETHEL_PLAYER', JSON.stringify({
      ...player,
      lastActive: Date.now()
    }));
  }, [player]);

  // Boot Sequence
  useEffect(() => {
    if (phase === GamePhase.BOOT) {
      setTimeout(() => setPhase(GamePhase.HUB), 2500);
    }
  }, [phase]);

  // Rank Check Logic
  useEffect(() => {
    const nextRankIndex = player.rankIndex + 1;
    if (nextRankIndex < RANKS.length && player.xp >= RANKS[nextRankIndex].minXp) {
      setPlayer(p => ({ 
        ...p, 
        rank: RANKS[nextRankIndex].title, 
        rankIndex: nextRankIndex 
      }));
      setShowRankModal(true); // Trigger Narrative
      triggerFeedback("RANK PROMOTION", "text-yellow-400");
    }
  }, [player.xp, player.rankIndex]);

  // Handlers
  const handleScanComplete = async (image: string) => {
    setActiveImage(image);
    try {
      const puzzle = await generateContextualPuzzle(image);
      setActivePuzzle(puzzle);

      // Check Badges
      const obj = puzzle.detectedObject.toUpperCase();
      let newBadges = [...(player.badges || [])];
      let unlockedBadge = null;

      Object.entries(BADGES).forEach(([keyword, badgeName]) => {
        if (obj.includes(keyword) && !newBadges.includes(badgeName)) {
           newBadges.push(badgeName);
           unlockedBadge = badgeName;
        }
      });

      if (unlockedBadge) {
        setPlayer(p => ({ ...p, badges: newBadges }));
        triggerFeedback(`BADGE UNLOCKED: ${unlockedBadge}`, "text-pink-500");
      }

      setPhase(GamePhase.PUZZLE);
    } catch (e) {
      setErrorMsg("ANALYSIS FAILED");
      setPhase(GamePhase.HUB);
    }
  };

  const handlePuzzleSuccess = () => {
    if (!activePuzzle) return;

    // Pre-calculate creature stats for the Catch Phase so we can see what we are chasing
    const ampLevel = player.tools['AMPLIFIER'] || 0;
    const rarityBonus = ampLevel * TOOLS_CONFIG['AMPLIFIER'].effectPerLevel;

    // Use 'as Rarity' to prevent TS narrowing issues
    let finalRarity = (activePuzzle.difficulty > 3 ? Rarity.RARE : Rarity.COMMON) as Rarity;
    
    // Mastery Mode Bonus
    if (player.masteryMode && Math.random() > 0.5) {
       if (finalRarity === Rarity.COMMON) finalRarity = Rarity.UNCOMMON;
    }

    if (Math.random() < rarityBonus) {
      // Upgrade rarity if passive triggers
      if (finalRarity === Rarity.COMMON) finalRarity = Rarity.UNCOMMON;
      else if (finalRarity === Rarity.UNCOMMON) finalRarity = Rarity.RARE;
      else if (finalRarity === Rarity.RARE) finalRarity = Rarity.LEGENDARY;
    }

    const randomTrait = AVAILABLE_TRAITS[Math.floor(Math.random() * AVAILABLE_TRAITS.length)];
    
    // Select one of the new visual families
    const families = Object.values(CREATURE_FAMILIES);
    const randomFamily = families[Math.floor(Math.random() * families.length)];

    setPendingCreature({
      rarity: finalRarity,
      traits: [randomTrait],
      visualKey: randomFamily,
      // imageUrl is no longer strictly needed as CreatureAvatar handles mapping, 
      // but we leave it undefined to let the component use the mapping logic.
    });

    setPhase(GamePhase.CATCH);
  };

  const handlePuzzleFailure = () => {
    setPlayer(p => ({ ...p, networkStability: Math.max(0, p.networkStability - 5) }));
    setErrorMsg("DECRYPTION FAILED - ENTROPY INCREASED");
    setPhase(GamePhase.HUB);
  };

  const handleCatchSuccess = () => {
    if (!activePuzzle || !pendingCreature) return;
    
    // Ensure visualKey is populated even if pendingCreature was partial
    const vKey = pendingCreature.visualKey || 'NEON_WRAITH';

    const newCreature: Creature = {
      id: Math.random().toString(36).substr(2, 9),
      name: activePuzzle.targetWord, 
      description: activePuzzle.context,
      rarity: pendingCreature.rarity as Rarity,
      fragmentData: activePuzzle.clue,
      scanTimestamp: Date.now(),
      level: 1.0,
      traits: pendingCreature.traits || [],
      generation: 0,
      visualKey: vKey,
      imageUrl: pendingCreature.imageUrl
    };

    const masteryMult = player.masteryMode ? MASTERY_MULTIPLIER : 1;
    // Apply Family Rewards Buff
    const familyMult = player.activeBuffs.rewardMultiplier;
    
    const xpGain = Math.floor(XP_PER_CATCH * masteryMult * familyMult);
    const gemGain = Math.floor((newCreature.rarity === Rarity.RARE ? 25 : GEMS_PER_CATCH) * masteryMult * familyMult);

    const updatedCreatures = [newCreature, ...player.caughtCreatures];

    setPlayer(p => ({
      ...p,
      xp: p.xp + xpGain,
      gems: p.gems + gemGain,
      networkStability: Math.min(MAX_STABILITY, p.networkStability + 5),
      caughtCreatures: updatedCreatures,
      activeBuffs: calculateBuffs(updatedCreatures) // Recalculate buffs
    }));
    
    // Trigger Feedback
    triggerFeedback(`+${xpGain} XP`, "text-cyan-400");
    triggerFeedback(`+${gemGain} GEMS`, "text-yellow-400");
    if (familyMult > 1.0) triggerFeedback("FAMILY BONUS APPLIED", "text-purple-400");
    triggerFeedback("PROTOCOL RESTORED", "text-green-500");

    setPendingCreature(null);
    setPhase(GamePhase.HUB);
    setActivePuzzle(null);
    setActiveImage(null);
  };

  const handleToolUpgrade = (toolId: string) => {
    const currentLevel = player.tools[toolId] || 0;
    const cost = TOOLS_CONFIG[toolId].baseCost * (currentLevel + 1);
    
    if (player.gems >= cost) {
      setPlayer(p => ({
        ...p,
        gems: p.gems - cost,
        tools: {
          ...p.tools,
          [toolId]: currentLevel + 1
        }
      }));
      triggerFeedback(`TOOL UPGRADED`, "text-cyan-400");
    }
  };

  // --- LAB LOGIC ---

  const handleSynthesis = (parentAId: string, parentBId: string) => {
    const parentA = player.caughtCreatures.find(c => c.id === parentAId);
    const parentB = player.caughtCreatures.find(c => c.id === parentBId);

    if (!parentA || !parentB || player.gems < SYNTHESIS_COST) return;

    const partA = parentA.name.slice(0, Math.ceil(parentA.name.length / 2));
    const partB = parentB.name.slice(Math.ceil(parentB.name.length / 2));
    const newName = (partA + partB).toUpperCase();

    const combinedTraits = Array.from(new Set([...parentA.traits, ...parentB.traits]));
    if (Math.random() > 0.8) combinedTraits.push(AVAILABLE_TRAITS[Math.floor(Math.random() * AVAILABLE_TRAITS.length)]);

    let newRarity = parentA.rarity;
    if (parentA.rarity === parentB.rarity && Math.random() > 0.5) {
      if (parentA.rarity === Rarity.COMMON) newRarity = Rarity.UNCOMMON;
      else if (parentA.rarity === Rarity.UNCOMMON) newRarity = Rarity.RARE;
    }

    const offspring: Creature = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      description: `Synthesized entity derived from ${parentA.name} and ${parentB.name}.`,
      rarity: newRarity,
      fragmentData: "SYNTHETIC_DATA_PACKET",
      scanTimestamp: Date.now(),
      level: 1.0,
      traits: combinedTraits.slice(0, 3), 
      generation: Math.max(parentA.generation, parentB.generation) + 1,
      parents: [parentAId, parentBId],
      visualKey: Math.random() > 0.5 ? parentA.visualKey : parentB.visualKey,
      imageUrl: Math.random() > 0.5 ? parentA.imageUrl : parentB.imageUrl
    };

    const updatedCreatures = [offspring, ...player.caughtCreatures];

    setPlayer(p => ({
      ...p,
      gems: p.gems - SYNTHESIS_COST,
      xp: p.xp + 50, // Synthesis grants XP
      caughtCreatures: updatedCreatures,
      activeBuffs: calculateBuffs(updatedCreatures)
    }));

    triggerFeedback("+50 XP", "text-cyan-400");
    triggerFeedback("SYNTHESIS COMPLETE", "text-purple-400");
  };

  const handleEvolution = (creatureId: string) => {
    const creatureIndex = player.caughtCreatures.findIndex(c => c.id === creatureId);
    if (creatureIndex === -1 || player.gems < EVOLUTION_COST_BASE) return;

    const creature = player.caughtCreatures[creatureIndex];
    // Big jump in level for faster demo of tiers
    const newLevel = creature.level + 4.0; 
    
    let newRarity = creature.rarity;
    if (Math.floor(newLevel) % 5 === 0) {
      if (creature.rarity === Rarity.COMMON) newRarity = Rarity.UNCOMMON;
      else if (creature.rarity === Rarity.UNCOMMON) newRarity = Rarity.RARE;
      else if (creature.rarity === Rarity.RARE) newRarity = Rarity.LEGENDARY;
    }

    const updatedCreature = {
      ...creature,
      level: newLevel,
      rarity: newRarity
    };

    const newCreatures = [...player.caughtCreatures];
    newCreatures[creatureIndex] = updatedCreature;

    setPlayer(p => ({
      ...p,
      gems: p.gems - EVOLUTION_COST_BASE,
      xp: p.xp + 25,
      caughtCreatures: newCreatures,
      activeBuffs: calculateBuffs(newCreatures) // Buffs might rely on rarity or levels in future, best to recalc
    }));

    triggerFeedback("+25 XP", "text-cyan-400");
    triggerFeedback("COMPILATION SUCCESS", "text-cyan-400");
  };

  // Rendering
  if (phase === GamePhase.BOOT) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-cyan-400 font-mono">
        <Shield size={48} className="animate-pulse mb-4" />
        <h1 className="text-2xl tracking-[0.3em] font-bold">AETHEL NETWORK</h1>
        <p className="mt-2 text-xs animate-pulse">ESTABLISHING SECURE CONNECTION...</p>
        <div className="w-48 h-1 bg-slate-900 mt-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500 animate-[scan_2s_linear_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black z-0 pointer-events-none" />

      {/* --- FLOATING VISUAL FEEDBACK --- */}
      <div className="absolute top-1/2 left-0 right-0 z-[200] flex flex-col items-center justify-center pointer-events-none">
        {feedbacks.map((item) => (
          <div 
            key={item.id}
            className={`font-mono font-bold text-2xl tracking-widest drop-shadow-[0_0_10px_rgba(0,0,0,1)] animate-float mb-2 ${item.color}`}
          >
            {item.text}
          </div>
        ))}
      </div>

      {/* --- Narrative Modal (Rank Up) --- */}
      {showRankModal && (
        <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
           <Panel className="w-full max-w-md border-cyan-400">
             <div className="flex items-center gap-4 mb-4 text-cyan-400">
               <AlertTriangle size={32} className="animate-pulse" />
               <h2 className="text-xl font-bold tracking-widest">INCOMING TRANSMISSION</h2>
             </div>
             <p className="font-mono text-white text-lg mb-2">
               PROMOTION: {player.rank}
             </p>
             <div className="h-px bg-cyan-900 w-full mb-4" />
             <p className="font-mono text-sm text-slate-300 italic mb-6 border-l-2 border-cyan-500 pl-4">
               "{RANKS[player.rankIndex].message}"
             </p>
             <BrutalButton onClick={() => setShowRankModal(false)} className="w-full">
               ACKNOWLEDGE PROTOCOL
             </BrutalButton>
           </Panel>
        </div>
      )}

      {/* --- Main Content Area --- */}
      <main className="flex-1 relative z-10 flex flex-col">
        
        {phase === GamePhase.HUB && (
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto pb-24">
            {/* Header / ID Card */}
            <div className="flex items-start justify-between border-b border-cyan-900 pb-4">
              <div className="flex items-center gap-3">
                 <img 
                   src={GAME_IMAGES.AVATAR_1} 
                   onError={(e) => e.currentTarget.src = GAME_IMAGES.AVATAR_PLACEHOLDER}
                   className="w-12 h-12 rounded border border-cyan-500 object-cover bg-slate-900" 
                   alt="Architect"
                 />
                 <div>
                   <h2 className="text-[10px] font-mono text-slate-500">ARCHITECT ID</h2>
                   <h1 className="text-sm font-bold text-white tracking-wider">{player.rank}</h1>
                   {/* XP Bar */}
                   <div className="w-32 h-1 bg-slate-800 mt-1 relative">
                     <div 
                       className="absolute h-full bg-cyan-500 transition-all duration-500" 
                       style={{ width: `${Math.min(100, (player.xp / (RANKS[player.rankIndex + 1]?.minXp || 10000)) * 100)}%` }} 
                     />
                   </div>
                   <div className="text-[8px] text-cyan-400 mt-0.5">
                     XP: {player.xp} / {RANKS[player.rankIndex + 1]?.minXp || 'MAX'}
                   </div>
                 </div>
              </div>
              <div className="text-right">
                <h2 className="text-[10px] font-mono text-slate-500">GEMS</h2>
                <span className="text-xl font-bold text-cyan-400">{player.gems}</span>
              </div>
            </div>

            <Panel title="AETHEL STATUS">
              <NetworkGraph stability={player.networkStability} />
            </Panel>

            <div className="grid grid-cols-2 gap-4">
               <BrutalButton variant="secondary" onClick={() => setPhase(GamePhase.TOOLS)} className="flex flex-col items-center gap-1 py-4">
                 <Wrench size={20} />
                 <span>TOOLS</span>
               </BrutalButton>
               <BrutalButton variant="secondary" onClick={() => setPhase(GamePhase.LAB)} className="flex flex-col items-center gap-1 py-4">
                 <FlaskConical size={20} />
                 <span>LAB</span>
               </BrutalButton>
            </div>

            {player.rankIndex >= 1 && (
               <div className="flex items-center justify-between bg-slate-900/50 p-2 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400">MASTERY MODE</span>
                  <button 
                    onClick={() => setPlayer(p => ({ ...p, masteryMode: !p.masteryMode }))}
                    className={`w-10 h-5 rounded-full relative transition-colors ${player.masteryMode ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${player.masteryMode ? 'left-6' : 'left-1'}`} />
                  </button>
               </div>
            )}

            <LoreModule currentFragmentKey={RANKS[player.rankIndex].loreFragment} />
            
            {errorMsg && (
              <div className="p-3 border border-red-500 bg-red-900/20 text-red-400 text-xs font-mono mb-4">
                ERROR: {errorMsg}
                <button onClick={() => setErrorMsg(null)} className="ml-2 underline">ACKNOWLEDGE</button>
              </div>
            )}
          </div>
        )}

        {phase === GamePhase.SCAN && (
          <Scanner 
            onScanComplete={handleScanComplete}
            onCancel={() => setPhase(GamePhase.HUB)}
          />
        )}

        {phase === GamePhase.PUZZLE && activePuzzle && (
          <>
            <div className="absolute inset-0 z-0 opacity-30">
              <img src={activeImage || ''} className="w-full h-full object-cover blur-sm" alt="context" />
            </div>
            {/* Pass passive time bonus to Puzzle Module */}
            <PuzzleModule 
              data={activePuzzle} 
              tools={player.tools}
              onSuccess={handlePuzzleSuccess}
              onFailure={handlePuzzleFailure}
              passiveBonusTime={player.activeBuffs.puzzleTimeBonus}
            />
          </>
        )}

        {phase === GamePhase.CATCH && (
          <>
            <div className="absolute inset-0 z-0">
               <img src={activeImage || ''} className="w-full h-full object-cover" alt="context" />
            </div>
            {/* Pass passive stability bonus to Catch Module */}
            <CatchModule 
              difficulty={activePuzzle?.difficulty || 1} 
              tools={player.tools}
              imageUrl={pendingCreature?.imageUrl} 
              onCaught={handleCatchSuccess}
              passiveStabilityBonus={player.activeBuffs.catchStabilityBonus}
            />
          </>
        )}

        {phase === GamePhase.LAB && (
          <LabModule 
            player={player}
            onSynthesize={handleSynthesis}
            onEvolve={handleEvolution}
          />
        )}

        {phase === GamePhase.TOOLS && (
          <ToolsModule 
            player={player}
            onUpgrade={handleToolUpgrade}
            onBack={() => setPhase(GamePhase.HUB)}
          />
        )}

        {phase === GamePhase.CODEX && (
          <div className="flex-1 p-6 overflow-y-auto pb-24">
             <h2 className="text-2xl font-bold text-cyan-400 mb-6 tracking-widest">DATA ARCHIVE</h2>
             
             {/* Badge Row */}
             {player.badges && player.badges.length > 0 && (
               <div className="flex gap-2 mb-6 overflow-x-auto">
                 {player.badges.map(b => (
                   <div key={b} className="px-2 py-1 bg-cyan-900/30 border border-cyan-500/50 text-[10px] text-cyan-200 rounded whitespace-nowrap">
                     {b}
                   </div>
                 ))}
               </div>
             )}

             {/* Family Synergy Panel */}
             <Panel title="FAMILY SYNERGY" className="mb-6">
               <div className="flex flex-col gap-4">
                 {Object.keys(FAMILY_CONFIG).map(key => {
                   const config = FAMILY_CONFIG[key as keyof typeof FAMILY_CONFIG];
                   const count = player.caughtCreatures.filter(c => c.visualKey === key).length;
                   // Calculate current bonus for display
                   const currentBonus = (count * config.valPerMember).toFixed(config.stat === 'rewardMultiplier' ? 2 : 0);
                   const displayBonus = config.stat === 'rewardMultiplier' 
                     ? `+${Math.round((parseFloat(currentBonus)) * 100)}%` 
                     : `+${currentBonus}${config.unit}`;

                   return (
                     <div key={key} className="border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-xs font-mono text-cyan-200">{config.name}</span>
                         <span className="text-xs font-mono font-bold text-yellow-400">{displayBonus}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Layers size={12} className="text-slate-500" />
                         <span className="text-[9px] text-slate-400 uppercase tracking-wide">{config.buffDescription}</span>
                         <span className="ml-auto text-[9px] text-slate-500">{count} UNITS</span>
                       </div>
                       {/* Mini progress bar for visual flair */}
                       <div className="h-1 bg-slate-900 mt-1 w-full relative">
                         <div 
                           className="absolute top-0 left-0 h-full bg-cyan-700 transition-all" 
                           style={{ width: `${Math.min(100, count * 5)}%` }} // Cap at 20 units for visual
                         />
                       </div>
                     </div>
                   );
                 })}
               </div>
             </Panel>

             <div className="grid grid-cols-2 gap-4">
               {player.caughtCreatures.map(c => (
                 <Panel key={c.id} className="min-h-[140px] flex flex-col">
                   <div className="flex justify-center mb-4">
                     {/* The CreatureAvatar component now correctly resolves PNGs based on visualKey and Level */}
                     <CreatureAvatar creature={c} size="md" />
                   </div>
                   <h3 className="text-white font-bold text-center text-xs truncate">{c.name}</h3>
                   <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-800">
                     <span className="text-[9px] text-cyan-600 font-mono border border-cyan-900 px-1 rounded">
                       {c.rarity}
                     </span>
                     <span className="text-[9px] text-slate-500 font-mono">v{c.level.toFixed(1)}</span>
                   </div>
                   <div className="text-[8px] text-slate-600 font-mono text-center mt-1 uppercase">
                     {c.visualKey?.replace('_', ' ') || 'UNKNOWN CLASS'}
                   </div>
                 </Panel>
               ))}
               {player.caughtCreatures.length === 0 && (
                 <p className="text-slate-600 col-span-2 text-center py-10 font-mono">ARCHIVE EMPTY</p>
               )}
             </div>
          </div>
        )}

      </main>

      {/* --- Bottom Navigation --- */}
      {[GamePhase.HUB, GamePhase.CODEX, GamePhase.PROFILE, GamePhase.LAB, GamePhase.TOOLS].includes(phase) && (
        <nav className="h-20 border-t border-cyan-900 bg-black z-50 flex items-center justify-around px-2 relative">
           <div className="absolute -top-6 left-1/2 -translate-x-1/2">
             <button 
               onClick={() => setPhase(GamePhase.SCAN)}
               className="w-16 h-16 bg-black border-2 border-cyan-400 rotate-45 flex items-center justify-center hover:bg-cyan-900 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.3)]"
             >
               <div className="-rotate-45">
                 <MapPin className="text-white" size={24} />
               </div>
             </button>
           </div>

           <button 
             onClick={() => setPhase(GamePhase.HUB)}
             className={`flex flex-col items-center gap-1 ${phase === GamePhase.HUB ? 'text-cyan-400' : 'text-slate-600'}`}
           >
             <Activity size={20} />
             <span className="text-[10px] tracking-widest">STATUS</span>
           </button>
           
           <div className="w-12"></div> 

           <button 
             onClick={() => setPhase(GamePhase.CODEX)}
             className={`flex flex-col items-center gap-1 ${phase === GamePhase.CODEX ? 'text-cyan-400' : 'text-slate-600'}`}
           >
             <Archive size={20} />
             <span className="text-[10px] tracking-widest">CODEX</span>
           </button>
        </nav>
      )}
    </div>
  );
};

export default App;
