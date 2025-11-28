
import React from 'react';
import { PlayerState } from '../types';
import { BrutalButton, Panel } from './UIComponents';
import { TOOLS_CONFIG } from '../constants';
import { Wrench, Zap, ArrowUp, Lock } from 'lucide-react';

interface ToolsModuleProps {
  player: PlayerState;
  onUpgrade: (toolId: string) => void;
  onBack: () => void;
}

const ToolsModule: React.FC<ToolsModuleProps> = ({ player, onUpgrade, onBack }) => {
  return (
    <div className="h-full flex flex-col bg-black p-4 overflow-y-auto pb-24">
      <div className="flex justify-between items-center mb-6 border-b border-cyan-900 pb-4">
        <h2 className="text-2xl font-bold text-cyan-400 tracking-widest flex items-center gap-2">
          <Wrench size={24} /> ARCHITECT TOOLS
        </h2>
        <BrutalButton variant="secondary" onClick={onBack} className="px-3 py-1 text-xs">EXIT</BrutalButton>
      </div>

      <div className="mb-6 flex justify-between items-center bg-slate-900/50 p-4 border border-slate-800">
        <span className="font-mono text-slate-400">AVAILABLE GEMS</span>
        <span className="text-xl font-bold text-cyan-400 flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" fill="currentColor" />
          {player.gems}
        </span>
      </div>

      <div className="grid gap-6">
        {Object.entries(TOOLS_CONFIG).map(([id, config]) => {
          const currentLevel = player.tools[id] || 0;
          const nextLevel = currentLevel + 1;
          const cost = config.baseCost * nextLevel;
          const canAfford = player.gems >= cost;

          return (
            <Panel key={id} title={`${config.name} v${currentLevel}.0`}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-slate-400 text-sm font-mono h-10">{config.desc}</p>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase">Type</div>
                  <div className="text-cyan-200 font-bold">{config.type}</div>
                </div>
              </div>

              <div className="bg-black/40 p-3 mb-4 border border-slate-800 flex justify-between items-center">
                 <div className="text-xs font-mono text-slate-500">
                   EFFECT: {(currentLevel * config.effectPerLevel).toFixed(2)} -> <span className="text-cyan-400">{(nextLevel * config.effectPerLevel).toFixed(2)}</span>
                 </div>
                 <div className="text-xs font-mono text-slate-500">
                   LVL: {currentLevel} -> <span className="text-cyan-400">{nextLevel}</span>
                 </div>
              </div>

              <div className="flex gap-4">
                <BrutalButton 
                  className="flex-1" 
                  disabled={!canAfford}
                  onClick={() => onUpgrade(id)}
                >
                  {currentLevel === 0 ? 'UNLOCK' : 'UPGRADE'} - {cost} GEMS
                </BrutalButton>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
};

export default ToolsModule;
