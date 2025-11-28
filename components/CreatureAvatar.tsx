
import React, { useState } from 'react';
import { Rarity } from '../types';
import { RARITY_COLORS } from '../constants';
import { getCreatureImage, getTier, CREATURE_FAMILIES } from './CreatureVisuals';
import { ImageIcon } from 'lucide-react';

interface CreatureAvatarProps {
  creature: {
    level: number;
    rarity: Rarity;
    visualKey: string;
    imageUrl?: string; // Legacy override
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  forceNextTier?: boolean; // For Lab preview
}

const CreatureAvatar: React.FC<CreatureAvatarProps> = ({ creature, size = 'md', className = '', forceNextTier = false }) => {
  const [imgError, setImgError] = useState(false);

  // Calculate effective level for rendering (handle Lab preview)
  const effectiveLevel = forceNextTier ? Math.floor(creature.level) + 5 : creature.level;
  const tier = getTier(effectiveLevel);
  const tierIndex = tier === 'tier1' ? 1 : tier === 'tier2' ? 2 : 3;

  // Resolve Image
  let imageSrc = creature.imageUrl;
  
  // If no manual override, attempt to resolve via Visual Key Mapping
  if (!imageSrc) {
     // Defensive: fallback to NEON_WRAITH if visualKey is undefined/null
     const key = creature.visualKey || CREATURE_FAMILIES.NEON_WRAITH;
     imageSrc = getCreatureImage(key, effectiveLevel);
  }

  const baseColor = RARITY_COLORS[creature.rarity];

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-56 h-56'
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If the specific tier image fails, try to load the generic placeholder
    // This prevents infinite loops if placeholder is also missing
    if (e.currentTarget.src.includes('placeholder.png')) {
      setImgError(true);
    } else {
      e.currentTarget.src = "/assets/creatures/placeholder.png";
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      
      {/* --- BACKGROUND EFFECTS --- */}
      
      {/* Tier 3: Ascended Aura */}
      {tierIndex >= 3 && (
        <div className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse" style={{ backgroundColor: baseColor }} />
      )}

      {/* Tier 2: Stabilization Ring */}
      {tierIndex >= 2 && (
        <div 
          className="absolute inset-[-10%] border border-dashed rounded-full animate-[spin_10s_linear_infinite] opacity-60"
          style={{ borderColor: baseColor }}
        />
      )}

      {/* Tier 3: Data Orbit */}
      {tierIndex >= 3 && (
        <div 
          className="absolute inset-[-20%] border-t-2 border-b-2 rounded-full animate-[spin_4s_linear_infinite_reverse] opacity-40"
          style={{ borderColor: baseColor }}
        />
      )}

      {/* --- MAIN CONTAINER --- */}
      <div 
        className={`
          relative w-full h-full flex items-center justify-center overflow-hidden
          transition-all duration-500
          ${tierIndex === 1 ? 'rounded-lg border border-slate-700 bg-black/60' : ''}
          ${tierIndex === 2 ? 'rounded-full border-2 bg-black/80' : ''}
          ${tierIndex === 3 ? 'rounded-[20%] border-2 shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-black' : ''}
        `}
        style={{ borderColor: baseColor }}
      >
        
        {/* The Image Asset */}
        {!imgError ? (
          <img 
            src={imageSrc} 
            alt="Entity"
            onError={handleImageError}
            className={`
              w-[85%] h-[85%] object-contain relative z-10 filter
              ${tierIndex === 1 ? 'opacity-80 contrast-125' : ''}
              ${tierIndex === 2 ? 'opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]' : ''}
              ${tierIndex === 3 ? 'opacity-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] contrast-110' : ''}
            `}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
             <ImageIcon size={size === 'sm' ? 12 : 24} />
             {size !== 'sm' && <span className="text-[8px] font-mono mt-1">NO DATA</span>}
          </div>
        )}

        {/* --- FOREGROUND OVERLAYS --- */}

        {/* Holographic Scanlines */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_3px] opacity-30" />
        
        {/* Tier 3 Glitch Overlay */}
        {tierIndex >= 3 && (
          <div className="absolute inset-0 z-20 pointer-events-none mix-blend-color-dodge opacity-20 bg-cyan-400 animate-pulse" 
               style={{ clipPath: 'polygon(0 0, 100% 0, 100% 10%, 0 10%)', animation: 'glitch 2s infinite' }}
          />
        )}

      </div>

      {/* Tier 1: Corner Brackets */}
      {tierIndex === 1 && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-slate-500" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-slate-500" />
        </>
      )}

      {/* Tier Marker */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black border border-slate-800 px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-400 z-30">
        T{tierIndex}
      </div>

    </div>
  );
};

export default CreatureAvatar;
