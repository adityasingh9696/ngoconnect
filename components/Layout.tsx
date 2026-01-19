import React from 'react';
import { UserRole } from '../types';
import { useAuth } from '../App';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 font-inter text-slate-100">
      <header className="fixed w-full z-50 transition-all duration-300 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">N</div>
              <span className="text-xl font-bold text-white tracking-tight">NgoConnect</span>
            </div>

            <div className="flex items-center gap-6">
              {isAuthenticated && user ? (
                <>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{user.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <span className="text-sm font-medium text-slate-400">Making Impact Simple</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {children}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm mb-4">© {new Date().getFullYear()} NgoConnect. Empowering Change.</p>
          <div className="flex justify-center gap-6 text-slate-400 text-sm">
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
