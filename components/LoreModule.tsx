
import React, { useState } from 'react';
import { Panel } from './UIComponents';
import { LORE_LIBRARY, GAME_IMAGES } from '../constants';
import { AlertTriangle, ImageIcon } from 'lucide-react';

interface LoreModuleProps {
  currentFragmentKey: string;
}

const LoreModule: React.FC<LoreModuleProps> = ({ currentFragmentKey }) => {
  const [imgError, setImgError] = useState(false);
  
  const loreData = LORE_LIBRARY[currentFragmentKey] || {
    image: null,
    text: "Encrypted Data Fragment. Upgrade Rank to Decrypt."
  };

  return (
    <Panel title="LORE FRAGMENTS">
      <div className="relative w-full h-32 bg-black overflow-hidden border border-slate-800 group">
        {loreData.image && !imgError ? (
          <img 
            src={loreData.image} 
            alt="Lore Visual"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
            <div className="text-center">
              <ImageIcon className="mx-auto text-slate-700 mb-2" size={24} />
              <span className="text-[10px] font-mono text-slate-500">VISUAL DATA CORRUPTED</span>
            </div>
          </div>
        )}
        
        {/* Overlay Text */}
        <div className="absolute bottom-0 w-full bg-black/80 backdrop-blur-sm p-3 border-t border-cyan-900/50">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
             <h4 className="text-xs font-bold text-cyan-400 font-mono uppercase truncate">
               {currentFragmentKey}
             </h4>
          </div>
          <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
            "{loreData.text}"
          </p>
        </div>
      </div>
      
      {!loreData.image && (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-yellow-600 font-mono">
          <AlertTriangle size={12} />
          <span>ARCHIVE LINK UNSTABLE</span>
        </div>
      )}
    </Panel>
  );
};

export default LoreModule;
