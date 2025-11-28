
import React, { useState, useEffect } from 'react';
import { PuzzleData } from '../types';
import { BrutalButton, Panel } from './UIComponents';
import { BrainCircuit, Timer, Zap } from 'lucide-react';

interface PuzzleModuleProps {
  data: PuzzleData;
  tools: Record<string, number>;
  onSuccess: () => void;
  onFailure: () => void;
  passiveBonusTime?: number; // New prop for passive buffs
}

const PuzzleModule: React.FC<PuzzleModuleProps> = ({ data, tools, onSuccess, onFailure, passiveBonusTime = 0 }) => {
  const [guess, setGuess] = useState('');
  const [scrambled, setScrambled] = useState<string[]>([]);
  
  // Stabilizer Tool Logic
  const stabilizerLevel = tools['STABILIZER'] || 0;
  const toolBonusTime = stabilizerLevel * 5; 
  
  // Total Time = Base (30) + Tool Bonus + Passive Family Bonus
  const [timeLeft, setTimeLeft] = useState(30 + toolBonusTime + passiveBonusTime);
  const [stabilizerUsed, setStabilizerUsed] = useState(false);

  useEffect(() => {
    // Simple scramble of the target word + random chars
    const chars = data.targetWord.toUpperCase().split('');
    const extra = "X7Z9Q".split(''); // Distractors
    const combined = [...chars, ...extra.slice(0, 3)].sort(() => Math.random() - 0.5);
    setScrambled(combined);
  }, [data]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFailure();
      return;
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFailure]);

  const handleCharClick = (char: string) => {
    if (guess.length < data.targetWord.length) {
      setGuess(prev => prev + char);
    }
  };

  const handleBackspace = () => {
    setGuess(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (guess === data.targetWord.toUpperCase()) {
      onSuccess();
    } else {
      setGuess('');
    }
  };

  const handleStabilize = () => {
    if (!stabilizerUsed && stabilizerLevel > 0) {
      setTimeLeft(p => p + 10); // Emergency boost
      setStabilizerUsed(true);
    }
  };

  // Visual Instability Calculation
  const urgency = timeLeft < 10 ? 'high' : timeLeft < 20 ? 'med' : 'low';
  const glitchClass = urgency === 'high' ? 'animate-pulse text-red-500' : urgency === 'med' ? 'text-yellow-400' : 'text-cyan-400';
  const containerDistortion = urgency === 'high' ? 'glitch-text' : '';

  return (
    <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-6">
      
      {/* Visual Noise Overlay */}
      {urgency === 'high' && (
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover mix-blend-screen" />
      )}

      <Panel title={`DECRYPTING: ${data.detectedObject.toUpperCase()}`} className={`w-full max-w-md transition-all duration-300 ${containerDistortion}`}>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <BrainCircuit size={18} />
            <span className="font-mono text-sm">SECURITY LEVEL: {data.difficulty}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={16} className={glitchClass} />
            <span className={`font-mono text-xl ${glitchClass}`}>
              00:{Math.floor(timeLeft).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <p className="font-mono text-xs text-slate-500 mb-1">SYSTEM LOG:</p>
          <p className="text-sm italic text-slate-300 border-l-2 border-cyan-800 pl-3 py-1">
            "{data.clue}"
          </p>
        </div>

        {/* Input Display */}
        <div className="flex justify-center gap-2 mb-8 h-12">
          {Array.from({ length: data.targetWord.length }).map((_, i) => (
            <div key={i} className={`w-10 h-12 border-b-2 ${urgency === 'high' ? 'border-red-500' : 'border-cyan-500'} flex items-center justify-center text-xl font-bold font-mono transition-colors`}>
              {guess[i] || ''}
            </div>
          ))}
        </div>

        {/* Keyboard / Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6 relative z-10">
          {scrambled.map((char, i) => (
            <button
              key={i}
              onClick={() => handleCharClick(char)}
              className="h-12 border border-slate-700 bg-slate-900/50 hover:bg-cyan-900/50 text-cyan-400 font-mono text-lg font-bold active:scale-95 transition-transform"
            >
              {char}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <BrutalButton variant="secondary" onClick={handleBackspace} className="flex-1">DEL</BrutalButton>
          <BrutalButton variant="primary" onClick={handleSubmit} className="flex-1">EXECUTE</BrutalButton>
        </div>

        {/* Stabilizer Tool Button */}
        {stabilizerLevel > 0 && !stabilizerUsed && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button 
              onClick={handleStabilize}
              className="w-full flex items-center justify-center gap-2 text-xs font-mono text-yellow-400 border border-yellow-900/50 bg-yellow-900/10 py-2 hover:bg-yellow-900/30 transition-colors"
            >
              <Zap size={12} /> ACTIVATE STABILIZER (+10s)
            </button>
          </div>
        )}

      </Panel>
    </div>
  );
};

export default PuzzleModule;
