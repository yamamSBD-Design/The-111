
import React, { useState, useEffect, useRef } from 'react';
import { Panel } from './UIComponents';
import { Zap, Snowflake } from 'lucide-react';

interface CatchModuleProps {
  difficulty: number;
  tools: Record<string, number>;
  imageUrl?: string;
  onCaught: () => void;
  passiveStabilityBonus?: number; // New prop
}

const CatchModule: React.FC<CatchModuleProps> = ({ difficulty, tools, imageUrl, onCaught, passiveStabilityBonus = 0 }) => {
  // Game state
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [stability, setStability] = useState(100 + passiveStabilityBonus); // Apply Passive Buff 
  const [energy, setEnergy] = useState(100);
  const [isJammed, setIsJammed] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  // Tool Stats
  const stasisLevel = tools['STASIS'] || 0;
  // Effect: Reduce speed. Base speed is high, divider increases with level
  const speedModifier = isFrozen ? 0.3 : 1.0; 
  const baseSpeedMult = 1.0 - (stasisLevel * 0.1); 

  const moveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Movement Logic
  useEffect(() => {
    let speed = Math.max(200, 1000 - (difficulty * 150));
    // Apply Tool passive slow if we implemented passive, but here we use active stasis
    if (stasisLevel > 0) speed = speed / baseSpeedMult; 
    
    // Apply Active Freeze
    if (isFrozen) speed = speed * 3; 

    const moveCreature = () => {
      const newX = Math.random() * 80 + 10; 
      const newY = Math.random() * 60 + 20;
      setPosition({ x: newX, y: newY });
    };

    if (moveTimer.current) clearInterval(moveTimer.current);
    moveTimer.current = setInterval(moveCreature, speed);

    return () => {
      if (moveTimer.current) clearInterval(moveTimer.current);
    };
  }, [difficulty, isFrozen, stasisLevel]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (energy <= 0 || isJammed) return;

    const damage = 15;
    const newStability = Math.max(0, stability - damage);
    setStability(newStability);
    setEnergy(p => Math.max(0, p - 5));

    if (newStability <= 0) {
      if (moveTimer.current) clearInterval(moveTimer.current);
      setTimeout(onCaught, 500);
    }
  };

  const activateStasis = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stasisLevel > 0 && !isFrozen) {
      setIsFrozen(true);
      setTimeout(() => setIsFrozen(false), 3000 + (stasisLevel * 500)); // 3s base + 0.5s per level
    }
  };

  // Recharge energy
  useEffect(() => {
    const recharge = setInterval(() => {
      setEnergy(p => Math.min(100, p + 2));
    }, 100);
    return () => clearInterval(recharge);
  }, []);

  return (
    <div className="absolute inset-0 z-40 bg-transparent overflow-hidden">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-end">
        <div className="w-1/2 pr-2">
          <div className="flex justify-between text-xs font-mono text-cyan-400 mb-1">
            <span>ENTITY STABILITY</span>
            <span>{Math.round(stability)}%</span>
          </div>
          <div className="h-2 bg-slate-800 w-full relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-cyan-400 transition-all duration-300" 
              style={{ width: `${Math.min(100, stability)}%` }}
            />
          </div>
        </div>
        <div className="w-1/3 pl-2">
          <div className="flex justify-between text-xs font-mono text-yellow-400 mb-1">
            <span>CHARGE</span>
            <span>{Math.round(energy)}%</span>
          </div>
          <div className="h-2 bg-slate-800 w-full relative">
            <div 
              className="absolute top-0 left-0 h-full bg-yellow-400 transition-all duration-300" 
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stasis Tool Button */}
      {stasisLevel > 0 && !isFrozen && (
        <div className="absolute top-20 right-4 z-50">
          <button 
            onClick={activateStasis}
            className="w-12 h-12 rounded-full border border-cyan-500 bg-cyan-900/50 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Snowflake size={20} className="text-cyan-200" />
          </button>
        </div>
      )}

      {/* The Creature */}
      <button
        onMouseDown={handleTap}
        onTouchStart={handleTap}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transition: isFrozen ? 'all 1s ease-out' : 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
        className={`absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 outline-none group ${isFrozen ? 'brightness-150 saturate-0' : ''}`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400 opacity-70 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-pink-500 opacity-50 animate-pulse" />
          
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Creature" 
              className="w-20 h-20 object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] z-10"
            />
          ) : (
            <Zap size={32} className="text-white drop-shadow-[0_0_10px_rgba(34,211,238,1)] z-10 group-active:scale-90" />
          )}
          
          <div className={`absolute -inset-4 border border-dashed border-cyan-500/30 rounded-full ${isFrozen ? '' : 'animate-[spin_4s_linear_infinite]'}`} />
        </div>
      </button>

      {/* Freeze Overlay */}
      {isFrozen && (
        <div className="absolute inset-0 pointer-events-none border-[20px] border-cyan-500/10 mix-blend-overlay" />
      )}

      <div className="absolute bottom-12 w-full text-center pointer-events-none">
        <p className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">
          {isFrozen ? 'ENTITY FROZEN - STABILIZE NOW' : 'TAP ENTITY TO STABILIZE'}
        </p>
      </div>
    </div>
  );
};

export default CatchModule;
