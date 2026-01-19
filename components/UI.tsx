import React from 'react';
import { Link } from 'react-router-dom';

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  // Changed defaulting to dark mode styles. Note: We put className at the end, but if conflicts occur, we prefer the dark defaults for this app version.
  // Using bg-slate-800 as base for cards in dark mode.
  <div className={`bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-700/50 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ${className}`}>
    {children}
  </div>
);

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'glass';
  isLoading?: boolean;
}
export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', isLoading, className = '', disabled, ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95";

  const variants = {
    primary: "border-transparent text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-500/25",
    // Scoped for Dark Mode: Darker background for secondary, lighter text
    secondary: "border-transparent text-indigo-300 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-500/20",
    danger: "border-transparent text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:shadow-red-500/25",
    // Outline: Slate-600 border, light text
    outline: "border-2 border-slate-600 text-slate-300 bg-transparent hover:border-indigo-500 hover:text-indigo-400",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

// --- BADGE ---
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    // Dark mode compatible badges: darker bg, lighter text
    SUCCESS: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
    PENDING: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
    FAILED: 'bg-rose-900/60 text-rose-300 border-rose-700/50',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
      {status}
    </span>
  );
};

// --- INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  rightElement?: React.ReactNode;
}
export const Input: React.FC<InputProps> = ({ label, className = '', rightElement, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
    <div className="relative">
      <input
        // Dark mode: Dark bg, light text, dark border
        className={`appearance-none block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-slate-900 transition-all duration-200 sm:text-sm ${rightElement ? 'pr-12' : ''} ${className}`}
        {...props}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);
