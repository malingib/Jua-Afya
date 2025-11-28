
import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Users, Calendar, Pill, Settings, LogOut, HelpCircle, Activity, MessageSquare } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  lowStockCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, lowStockCount = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient', icon: Users },
    { id: 'appointments', label: 'Appointment', icon: Calendar },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
    { id: 'bulk-sms', label: 'Broadcast', icon: MessageSquare },
    { id: 'reports', label: 'Report', icon: Activity },
    { id: 'settings', label: 'Setting', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar - Floating with rounded corners */}
      <div className="hidden md:flex flex-col w-64 bg-sidebar text-white fixed left-4 top-4 bottom-4 rounded-3xl z-20 shadow-2xl overflow-hidden no-print">
        {/* Logo Area */}
        <div className="p-8 flex items-center space-x-3 mb-2">
            <div className="relative">
                 <Activity className="w-8 h-8 text-white" />
                 <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-none">JuaAfya</h1>
            </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`group flex items-center justify-start w-full px-6 py-4 rounded-xl transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-sidebar-hover text-white font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-4 transition-colors ${currentView === item.id ? 'text-green-400' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="text-base">{item.label}</span>
              
              {/* Active Indicator */}
              {currentView === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400"></div>
              )}

              {/* Low Stock Badge for Pharmacy */}
              {item.id === 'pharmacy' && lowStockCount > 0 && currentView !== 'pharmacy' && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {lowStockCount}
                  </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-6 space-y-2 mt-auto">
           <button
              className="flex items-center w-full px-6 py-3 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            >
            <HelpCircle className="w-5 h-5 mr-4" />
            <span className="text-base">Help & Center</span>
          </button>
           <button
              className="flex items-center w-full px-6 py-3 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            >
            <LogOut className="w-5 h-5 mr-4" />
            <span className="text-base">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-30 px-6 py-3 flex justify-between items-center shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.05)] safe-area-pb transition-colors no-print">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${
              currentView === item.id ? 'text-brand-600 dark:text-brand-400 scale-105' : 'text-slate-400'
            }`}
          >
            <item.icon className={`w-6 h-6 ${currentView === item.id ? 'fill-brand-100 dark:fill-brand-900' : ''}`} strokeWidth={currentView === item.id ? 2.5 : 2} />
            {item.id === 'pharmacy' && lowStockCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            )}
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;