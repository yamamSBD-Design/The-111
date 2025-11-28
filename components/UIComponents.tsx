import React from 'react';
import { THEME } from '../constants';

export const BrutalButton = ({ onClick, children, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "uppercase font-bold tracking-widest px-6 py-3 border-2 transition-all duration-150 relative overflow-hidden group";
  
  const variants = {
    primary: `border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black`,
    secondary: `border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200`,
    danger: `border-red-500 text-red-500 hover:bg-red-500 hover:text-black`
  };

  const style = variants[variant as keyof typeof variants] || variants.primary;

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${style} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {!disabled && <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity" />}
    </button>
  );
};

export const Panel = ({ children, title, className = '' }: any) => (
  <div className={`border border-slate-800 bg-black/80 backdrop-blur-md p-4 relative ${className}`}>
    <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-500" />
    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-500" />
    {title && (
      <div className="mb-4 border-b border-slate-800 pb-2 flex justify-between items-center">
        <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-widest">{title}</h3>
        <div className="w-2 h-2 bg-cyan-500 animate-pulse" />
      </div>
    )}
    {children}
  </div>
);

export const DataRow: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-1 font-mono text-xs">
    <span className="text-slate-500 uppercase">{label}</span>
    <span className="text-cyan-100">{value}</span>
  </div>
);