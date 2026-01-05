
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Role } from '../types';
import { LogOut, Shield, X, Zap, Cpu } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  role: Role;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, role, isOpen, setIsOpen }) => {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0c10]/80 backdrop-blur-xl border-r border-white/5 flex flex-col h-full transition-transform duration-500 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0
    `}>
      <div className="p-8 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2.5 rounded-xl text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:rotate-12 transition-transform">
              <Shield size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">CYBER<span className="text-cyan-400">SHIELD</span></h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">IT School OS</p>
            </div>
          </div>
          <button onClick={() => setIsOpen?.(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Asosiy Menu</p>
        {NAV_ITEMS.filter(item => item.roles.includes(role)).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
              activeTab === item.id 
                ? 'bg-cyan-500/10 text-cyan-400' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee]"></div>
            )}
            <span className={`transition-colors duration-300 ${activeTab === item.id ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`}>
              {item.icon}
            </span>
            <span className="text-sm font-bold tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Cpu size={80} />
          </div>
          <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1">Tizim holati</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-white">Xavfsiz ulanish</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={16} /> Chiqish
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
