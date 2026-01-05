
import React from 'react';
import { User } from '../types';
import { Bell, Search, Shield, Menu, Cpu, Fingerprint } from 'lucide-react';
import { NAV_ITEMS } from '../constants';

interface HeaderProps {
  user: User;
  activeTab: string;
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeTab, toggleSidebar }) => {
  const currentTitle = NAV_ITEMS.find(item => item.id === activeTab)?.label || 'Dashboard';
  const teacherName = "Olimjonov Anvarjon";

  return (
    <header className="h-24 bg-[#05070a]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:px-12 shrink-0 z-40">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar}
          className="p-3 text-slate-400 md:hidden hover:bg-white/5 rounded-2xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Boshqaruv Markazi</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">{currentTitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative hidden lg:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Agentlar, Loglar, Audit..." 
            className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/30 w-80 outline-none transition-all font-bold placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-6 pl-8 border-l border-white/5">
          <button className="relative p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-cyan-500 rounded-full border-2 border-[#05070a]"></span>
          </button>

          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="flex flex-col items-end hidden sm:flex">
              <p className="text-sm font-black text-white tracking-tight">{teacherName}</p>
              <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Kiber-Instruktor</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-cyan-400 border border-white/5 shadow-2xl group-hover:scale-105 transition-transform">
              <Fingerprint size={28} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
