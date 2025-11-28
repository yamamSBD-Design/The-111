
import React, { useState } from 'react';
import { Creature, PlayerState, Rarity } from '../types';
import { BrutalButton, Panel, DataRow } from './UIComponents';
import { Dna, Cpu, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { EVOLUTION_COST_BASE, SYNTHESIS_COST, RARITY_COLORS } from '../constants';
import CreatureAvatar from './CreatureAvatar';
import { getTier } from './CreatureVisuals';

interface LabModuleProps {
  player: PlayerState;
  onSynthesize: (parentA: string, parentB: string) => void;
  onEvolve: (creatureId: string) => void;
}

const LabModule: React.FC<LabModuleProps> = ({ player, onSynthesize, onEvolve }) => {
  const [activeTab, setActiveTab] = useState<'SYNTHESIS' | 'COMPILATION'>('SYNTHESIS');
  
  // Synthesis State
  const [parentA, setParentA] = useState<string | null>(null);
  const [parentB, setParentB] = useState<string | null>(null);

  // Compilation State
  const [targetSubject, setTargetSubject] = useState<string | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);

  const handleSelectParent = (id: string) => {
    if (parentA === id) {
      setParentA(null);
    } else if (parentB === id) {
      setParentB(null);
    } else if (!parentA) {
      setParentA(id);
    } else if (!parentB) {
      setParentB(id);
    }
  };

  const executeSynthesis = () => {
    if (parentA && parentB) {
      onSynthesize(parentA, parentB);
      setParentA(null);
      setParentB(null);
    }
  };

  const executeEvolution = () => {
    if (targetSubject) {
      setIsEvolving(true);
      setTimeout(() => {
        onEvolve(targetSubject);
        setIsEvolving(false);
      }, 1500); // Extended delay for effect
    }
  };

  // Helper to render creature mini card
  const CreatureCard = ({ creature, isSelected, onClick, disabled }: any) => (
    <div 
      onClick={() => !disabled && onClick(creature.id)}
      className={`
        border p-2 cursor-pointer transition-all relative overflow-hidden group flex flex-col items-center gap-2
        ${isSelected ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-800 bg-slate-900/40'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-slate-600'}
      `}
    >
      <CreatureAvatar creature={creature} size="sm" />
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className={`font-bold text-xs truncate ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
            {creature.name}
          </span>
          <span className="text-[8px] px-1 border border-slate-700 text-slate-500">v{creature.level.toFixed(1)}</span>
        </div>
        <div className="text-[8px] text-slate-500 font-mono flex gap-1 justify-center">
          <span style={{ color: RARITY_COLORS[creature.rarity] }}>{creature.rarity.slice(0, 3)}</span>
          <span>{getTier(creature.level).toUpperCase()}</span>
        </div>
      </div>
      {isSelected && <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400" />}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black/90 pb-24 relative">
      
      {/* Evolution Overlay Effect */}
      {isEvolving && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="relative flex flex-col items-center">
             <div className="absolute inset-0 bg-cyan-400 rounded-full blur-[100px] opacity-20 animate-pulse" />
             <div className="relative">
               <RefreshCw size={64} className="text-white animate-spin mb-4" />
               <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full animate-ping" />
             </div>
             
             <div className="text-cyan-400 font-bold tracking-widest whitespace-nowrap animate-pulse font-mono text-xl">
               RECOMPILING DNA...
             </div>
             <div className="w-64 h-1 bg-slate-800 mt-4 overflow-hidden">
               <div className="h-full bg-cyan-400 animate-[scan_1.5s_linear_infinite]" />
             </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-cyan-900">
        <button 
          onClick={() => setActiveTab('SYNTHESIS')}
          className={`flex-1 p-4 font-mono text-sm tracking-widest flex items-center justify-center gap-2
            ${activeTab === 'SYNTHESIS' ? 'bg-cyan-900/30 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
        >
          <Dna size={16} /> SYNTHESIS
        </button>
        <button 
          onClick={() => setActiveTab('COMPILATION')}
          className={`flex-1 p-4 font-mono text-sm tracking-widest flex items-center justify-center gap-2
            ${activeTab === 'COMPILATION' ? 'bg-cyan-900/30 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
        >
          <Cpu size={16} /> COMPILATION
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        
        {/* --- SYNTHESIS VIEW --- */}
        {activeTab === 'SYNTHESIS' && (
          <div className="flex flex-col gap-6">
            <Panel title="GENETIC MERGE PROTOCOL" className="mb-2">
              <div className="flex items-center justify-between mb-4 px-4 h-24">
                {/* Slot A */}
                <div className={`w-20 h-20 border-2 border-dashed flex items-center justify-center ${parentA ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-700'}`}>
                   {parentA ? (
                     <CreatureAvatar creature={player.caughtCreatures.find(c => c.id === parentA)!} size="sm" />
                   ) : <span className="text-slate-700 text-xs">A</span>}
                </div>
                
                <ArrowRight className="text-slate-600 animate-pulse" />
                
                {/* Slot B */}
                <div className={`w-20 h-20 border-2 border-dashed flex items-center justify-center ${parentB ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-700'}`}>
                   {parentB ? (
                     <CreatureAvatar creature={player.caughtCreatures.find(c => c.id === parentB)!} size="sm" />
                   ) : <span className="text-slate-700 text-xs">B</span>}
                </div>
              </div>

              <div className="text-center mb-2">
                <span className="text-xs font-mono text-slate-500">COST: </span>
                <span className={`text-sm font-bold ${player.gems >= SYNTHESIS_COST ? 'text-cyan-400' : 'text-red-500'}`}>
                  {SYNTHESIS_COST} GEMS
                </span>
              </div>

              <BrutalButton 
                className="w-full" 
                disabled={!parentA || !parentB || player.gems < SYNTHESIS_COST}
                onClick={executeSynthesis}
              >
                INITIATE MERGE
              </BrutalButton>
            </Panel>

            <div className="grid grid-cols-2 gap-3">
              {player.caughtCreatures.map(c => (
                <CreatureCard 
                  key={c.id} 
                  creature={c} 
                  isSelected={parentA === c.id || parentB === c.id}
                  disabled={parentA === c.id || parentB === c.id ? false : (parentA && parentB)}
                  onClick={handleSelectParent}
                />
              ))}
            </div>
          </div>
        )}

        {/* --- COMPILATION VIEW --- */}
        {activeTab === 'COMPILATION' && (
          <div className="flex flex-col gap-6">
            <Panel title="SYSTEM UPGRADE" className="mb-2">
               {targetSubject ? (
                 <div className="text-center flex flex-col items-center">
                   
                   {/* Preview Evolution */}
                   <div className="flex items-center gap-6 mb-4">
                      <div className="opacity-50 scale-75 grayscale">
                        <CreatureAvatar creature={player.caughtCreatures.find(c => c.id === targetSubject)!} size="md" />
                        <div className="text-center text-[10px] mt-1 text-slate-500">CURRENT</div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <ArrowRight className="text-cyan-400 animate-pulse" />
                        <span className="text-[9px] text-cyan-500 font-mono mt-1">EVOLVE</span>
                      </div>

                      <div className="scale-110 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                        {/* We use the forceNextTier prop to visually simulate the evolution */}
                        <CreatureAvatar 
                          creature={player.caughtCreatures.find(c => c.id === targetSubject)!} 
                          size="md" 
                          forceNextTier={true}
                        />
                         <div className="text-center text-[10px] mt-1 text-cyan-400 font-bold">NEXT GEN</div>
                      </div>
                   </div>

                   <h3 className="text-xl text-white font-bold mb-1">
                     {player.caughtCreatures.find(c => c.id === targetSubject)?.name}
                   </h3>
                   <div className="flex justify-center items-center gap-4 text-xs font-mono mb-4 text-slate-400">
                     <span>v{player.caughtCreatures.find(c => c.id === targetSubject)?.level.toFixed(1)}</span>
                     <ArrowRight size={12} />
                     <span className="text-cyan-400">v{(player.caughtCreatures.find(c => c.id === targetSubject)?.level || 0 + 1.0).toFixed(1)}</span>
                   </div>
                   
                   <div className="mb-4">
                     <span className="text-xs font-mono text-slate-500 block">REQ:</span>
                     <span className={`text-sm font-bold ${player.gems >= EVOLUTION_COST_BASE ? 'text-cyan-400' : 'text-red-500'}`}>
                       {EVOLUTION_COST_BASE} GEMS
                     </span>
                   </div>

                   <BrutalButton 
                     className="w-full"
                     disabled={player.gems < EVOLUTION_COST_BASE}
                     onClick={executeEvolution}
                   >
                     COMPILE UPDATE
                   </BrutalButton>
                 </div>
               ) : (
                 <div className="h-32 flex items-center justify-center text-slate-600 font-mono text-xs">
                   SELECT A SUBJECT TO UPGRADE
                 </div>
               )}
            </Panel>

            <div className="grid grid-cols-2 gap-3">
              {player.caughtCreatures.map(c => (
                <CreatureCard 
                  key={c.id} 
                  creature={c} 
                  isSelected={targetSubject === c.id}
                  onClick={setTargetSubject}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LabModule;
