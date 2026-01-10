
import React from 'react';
import { User as UserType } from '../types';
import { Menu, Bell, Search, Terminal, Activity, Wifi, Shield } from 'lucide-react';
import { NAV_ITEMS } from '../constants';

interface HeaderProps {
  user: UserType;
  activeTab: string;
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeTab, toggleSidebar }) => {
  const currentTitle = NAV_ITEMS.find(item => item.id === activeTab)?.label || 'COMMAND_CENTER';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;

  return (
    <header className="h-20 bg-[#0d1117] border-b border-cyan-500/10 flex items-center justify-between px-6 md:px-10 z-40 mono">
      <div className="flex items-center gap-6">
        <button onClick={toggleSidebar} className="p-2 text-cyan-500 md:hidden border border-cyan-500/20 rounded">
          <Menu size={18} />
        </button>
        <div className="flex flex-col">
           <h2 className="text-sm font-black text-white tracking-widest uppercase italic flex items-center gap-3">
              <Terminal size={14} className="text-cyan-500" />
              {currentTitle}
           </h2>
           <p className="text-[7px] font-black text-slate-600 tracking-[0.5em] uppercase">Tactical_Session_Encrypted</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 px-5 py-2 border border-white/5 bg-black/40 rounded">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#00ff9d]"></div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">NETWORK: SECURE</span>
           </div>
           <div className="w-[1px] h-3 bg-white/10"></div>
           <div className="flex items-center gap-2">
              <Shield size={10} className="text-cyan-500" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">FIREWALL: V4.5</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-white tracking-widest leading-none mb-1">{fullName.toUpperCase()}</p>
              <p className="text-[7px] text-cyan-500/50 font-black uppercase tracking-widest">AUTH_ID: {user.id.slice(-6).toUpperCase()}</p>
           </div>
           <div className="w-10 h-10 rounded border border-cyan-500/30 flex items-center justify-center text-cyan-400 bg-cyan-500/5 font-black">
              {fullName[0]}
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
