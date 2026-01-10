
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Role } from '../types';
import { X, Shield, ChevronRight, Power, LayoutGrid } from 'lucide-react';

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
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden" onClick={() => setIsOpen?.(false)}></div>
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-[#0f172a] border-r border-white/5 flex flex-col h-full transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Shield size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white italic">VELMOR<span className="text-blue-500 not-italic">OS</span></h1>
            </div>
            <button onClick={() => setIsOpen?.(false)} className="md:hidden text-slate-400 p-2 hover:bg-white/5 rounded-lg"><X size={20}/></button>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-xs text-blue-400">
                {role[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lavozim</p>
                <p className="text-xs font-bold text-white truncate">{role}</p>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.filter(item => item.roles.includes(role)).map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen?.(false); }}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={14} className="opacity-60" />}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <button
            onClick={onLogout}
            className="w-full py-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-rose-500/10"
          >
            <Power size={16} /> Chiqish
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
