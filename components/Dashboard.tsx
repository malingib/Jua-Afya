
import React, { useState, useMemo, useEffect } from 'react';
import { Appointment, InventoryItem, Patient, ViewState } from '../types';
import { Users, Calendar, Activity, Search, Bell, ChevronDown, MoreHorizontal, Sparkles, LogOut, Settings, User, CheckCircle, AlertTriangle, Download, FileText, Share2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { generateDailyBriefing } from '../services/geminiService';

interface DashboardProps {
  appointments: Appointment[];
  inventory: InventoryItem[];
  patients: Patient[];
  setView: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appointments, patients, inventory, setView }) => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Dropdown States
  const [timeRange, setTimeRange] = useState('Month');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Notification Logic
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);
  
  useEffect(() => {
      const msgs = [];
      
      // Check Low Stock
      const lowStockItems = inventory.filter(i => i.stock < 10);
      if (lowStockItems.length > 0) {
          msgs.push({
              id: 'stock-alert',
              text: `Low stock alert: ${lowStockItems.length} items below threshold`,
              type: 'alert',
              time: 'Now',
              read: false
          });
      }

      // Add mock notifications for demo
      msgs.push(
          { id: 'mock-1', text: 'New appointment: John Doe', type: 'info', time: '1h ago', read: false },
          { id: 'mock-2', text: 'Daily report ready', type: 'success', time: '2h ago', read: true }
      );

      setSystemNotifications(msgs);
  }, [inventory]);

  const unreadCount = systemNotifications.filter(n => !n.read).length;

  // Calendar State
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Dynamic Data Generators based on TimeRange
  const getStatsByRange = (range: string) => {
    switch(range) {
        case 'Daily': return { 
            total: 12, old: 4, new: 8, appt: 12, 
            chartData: [{name: '8am', val: 2}, {name: '10am', val: 5}, {name: '12pm', val: 3}, {name: '2pm', val: 8}, {name: '4pm', val: 4}] 
        };
        case 'Weekly': return { 
            total: 145, old: 40, new: 105, appt: 80,
            chartData: [{name: 'Mon', val: 20}, {name: 'Tue', val: 45}, {name: 'Wed', val: 30}, {name: 'Thu', val: 50}, {name: 'Fri', val: 35}, {name: 'Sat', val: 25}]
        };
        case 'Yearly': return { 
            total: 15420, old: 4200, new: 11220, appt: 9500,
            chartData: [{name: 'Jan', val: 400}, {name: 'Apr', val: 650}, {name: 'Jul', val: 900}, {name: 'Oct', val: 1200}]
        };
        case 'Month': default: return { 
            total: 1644, old: 300, new: 100, appt: 355,
            chartData: [{name: 'Week 1', val: 150}, {name: 'Week 2', val: 230}, {name: 'Week 3', val: 180}, {name: 'Week 4', val: 290}]
        };
    }
  };

  const currentStats = useMemo(() => getStatsByRange(timeRange), [timeRange]);

  const dailyBarStats = [
    { name: 'Sat', val: 20 },
    { name: 'Sun', val: 15 },
    { name: 'Mon', val: 35 },
    { name: 'Tue', val: 45 },
    { name: 'Wed', val: 30 },
    { name: 'Thu', val: 40 },
    { name: 'Fri', val: 25 },
  ];

  const pieData = [
    { name: 'Child', value: 8, color: '#F59E0B' }, // Amber
    { name: 'Adult', value: 10, color: '#10B981' }, // Emerald
    { name: 'Teen', value: 40, color: '#0F766E' }, // Teal
    { name: 'Older', value: 12, color: '#EC4899' }, // Pink
  ];

  // Logic
  const handleGetBriefing = async () => {
    setLoadingBriefing(true);
    const lowStock = inventory.filter(i => i.stock < 10).length;
    const text = await generateDailyBriefing(appointments.length, lowStock, 'KSh 45k');
    setBriefing(text);
    setLoadingBriefing(false);
  };

  const handleLogout = () => {
      window.location.reload();
  };

  const markAllRead = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSystemNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredPatients = patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle Context Menus
  const toggleMenu = (e: React.MouseEvent, menuId: string) => {
      e.stopPropagation();
      setActiveMenuId(activeMenuId === menuId ? null : menuId);
      setIsTimeDropdownOpen(false);
      setIsNotifOpen(false);
      setIsProfileOpen(false);
  };

  // Calendar Generator
  const generateCalendarDays = () => {
      const today = new Date();
      const days = [];
      for (let i = -2; i < 3; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          days.push({
              date: d.getDate(),
              day: d.toLocaleString('default', { weekday: 'short' }),
              fullDate: d.toISOString().split('T')[0] // YYYY-MM-DD
          });
      }
      return days;
  };

  const calendarDays = generateCalendarDays();

  // Filter appointments based on selected day
  const filteredAppointments = appointments.filter(appt => {
      return appt.date === selectedDate; 
  });

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-[1600px] mx-auto bg-gray-100 dark:bg-slate-900 min-h-screen transition-colors duration-200" onClick={() => {
        setIsTimeDropdownOpen(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
        setActiveMenuId(null);
    }}>
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-20">
        <div>
           <h2 className="text-xl text-slate-500 dark:text-slate-400 font-medium">Welcome back</h2>
           <div className="flex items-center gap-2">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dr. Andrew 👋</h1>
             <button 
                onClick={(e) => { e.stopPropagation(); handleGetBriefing(); }}
                disabled={loadingBriefing}
                className="ml-2 p-2 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 rounded-full text-brand-600 dark:text-brand-400 transition-colors"
                title="Generate AI Briefing"
             >
                {loadingBriefing ? <Activity className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
             </button>
           </div>
           {briefing && (
             <div className="mt-2 p-3 bg-white dark:bg-slate-800 border border-brand-100 dark:border-brand-900 rounded-xl shadow-sm max-w-xl text-sm text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2">
                <Sparkles className="w-3 h-3 text-brand-500 inline mr-2" />
                {briefing}
             </div>
           )}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search recent patients..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-transparent focus:border-brand-200 dark:focus:border-brand-800 rounded-xl shadow-sm focus:ring-4 focus:ring-brand-500/10 dark:text-white text-sm placeholder-slate-400 outline-none transition-all" 
                />
             </div>
             
             {/* Time Range Dropdown */}
             <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsTimeDropdownOpen(!isTimeDropdownOpen); setIsNotifOpen(false); setIsProfileOpen(false); setActiveMenuId(null); }}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all"
                >
                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    {timeRange}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isTimeDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                        {['Daily', 'Weekly', 'Month', 'Yearly'].map((item) => (
                            <button
                                key={item}
                                onClick={() => { setTimeRange(item); setIsTimeDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${timeRange === item ? 'text-brand-600 font-medium bg-brand-50 dark:bg-brand-900/10' : 'text-slate-600 dark:text-slate-300'}`}
                            >
                                {item}
                                {timeRange === item && <CheckCircle className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>
                )}
             </div>

             {/* Notifications */}
             <div className="relative">
                 <button 
                    onClick={(e) => { e.stopPropagation(); setIsNotifOpen(!isNotifOpen); setIsTimeDropdownOpen(false); setIsProfileOpen(false); setActiveMenuId(null); }}
                    className={`p-2.5 rounded-full shadow-sm relative transition-all border border-slate-100 dark:border-slate-700 ${isNotifOpen ? 'bg-brand-50 text-brand-600 dark:bg-slate-700 dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>}
                 </button>

                 {isNotifOpen && (
                     <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Mark all read</button>}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {systemNotifications.length > 0 ? systemNotifications.map((notif) => (
                                <div key={notif.id} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex gap-3 ${!notif.read ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}>
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.type === 'alert' ? 'bg-red-500' : notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{notif.text}</p>
                                        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                            )}
                        </div>
                        <div className="p-2 text-center bg-slate-50 dark:bg-slate-700/30">
                            <button className="text-xs font-medium text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">View All</button>
                        </div>
                     </div>
                 )}
             </div>

             {/* Profile Dropdown */}
             <div className="relative">
                 <button 
                    onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); setIsTimeDropdownOpen(false); setIsNotifOpen(false); setActiveMenuId(null); }}
                    className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
                >
                    <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
                </button>

                 {isProfileOpen && (
                     <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                         <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                             <p className="font-bold text-slate-900 dark:text-white text-sm">Dr. Andrew</p>
                             <p className="text-xs text-slate-500 dark:text-slate-400">andrew@juaafya.com</p>
                         </div>
                         <div className="p-2">
                             <button 
                                onClick={() => { setView('profile'); setIsProfileOpen(false); }}
                                className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                 <User className="w-4 h-4" /> My Profile
                             </button>
                             <button 
                                onClick={() => { setView('settings'); setIsProfileOpen(false); }}
                                className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                 <Settings className="w-4 h-4" /> Settings
                             </button>
                             <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                             <button 
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                 <LogOut className="w-4 h-4" /> Sign Out
                             </button>
                         </div>
                     </div>
                 )}
             </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        
        {/* Left Column (Stats & Main Charts) */}
        <div className="lg:col-span-3 space-y-6">
            
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Total Patients */}
                <div className="bg-pastel-blue dark:bg-blue-900/40 p-6 rounded-3xl flex flex-col justify-between h-40 relative overflow-hidden group border border-transparent dark:border-blue-900/50 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                     <div className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-white/10 rounded-full backdrop-blur-sm">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                             <div className="p-2 bg-white/60 dark:bg-white/10 rounded-xl">
                                <Users className="w-5 h-5 text-slate-700 dark:text-blue-100" />
                             </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-sm mt-4">Total Patients</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white animate-in slide-in-from-bottom-2 fade-in">{currentStats.total}+</h3>
                            <span className="text-xs font-semibold bg-white/50 dark:bg-white/10 px-1.5 py-0.5 rounded text-green-700 dark:text-green-300 mb-1">↗ 10%</span>
                        </div>
                     </div>
                </div>

                {/* Card 2: Old Patients */}
                <div className="bg-pastel-pink dark:bg-pink-900/40 p-6 rounded-3xl flex flex-col justify-between h-40 relative overflow-hidden border border-transparent dark:border-pink-900/50 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                     <div className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-white/10 rounded-full backdrop-blur-sm">
                        <Users className="w-5 h-5 text-pink-600 dark:text-pink-300" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                             <div className="p-2 bg-white/60 dark:bg-white/10 rounded-xl">
                                <Users className="w-5 h-5 text-slate-700 dark:text-pink-100" />
                             </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-sm mt-4">Old Patients</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white animate-in slide-in-from-bottom-2 fade-in">{currentStats.old}+</h3>
                            <span className="text-xs font-semibold bg-white/50 dark:bg-white/10 px-1.5 py-0.5 rounded text-red-600 dark:text-red-300 mb-1">↘ 15%</span>
                        </div>
                     </div>
                </div>

                {/* Card 3: New Patients */}
                <div className="bg-pastel-green dark:bg-emerald-900/40 p-6 rounded-3xl flex flex-col justify-between h-40 relative overflow-hidden border border-transparent dark:border-emerald-900/50 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                     <div className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-white/10 rounded-full backdrop-blur-sm">
                        <Users className="w-5 h-5 text-green-600 dark:text-green-300" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                             <div className="p-2 bg-white/60 dark:bg-white/10 rounded-xl">
                                <Users className="w-5 h-5 text-slate-700 dark:text-green-100" />
                             </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-sm mt-4">New Patients</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white animate-in slide-in-from-bottom-2 fade-in">{currentStats.new}+</h3>
                            <span className="text-xs font-semibold bg-white/50 dark:bg-white/10 px-1.5 py-0.5 rounded text-green-700 dark:text-green-300 mb-1">↗ 24%</span>
                        </div>
                     </div>
                </div>

                {/* Card 4: Appointments */}
                <div className="bg-pastel-orange dark:bg-orange-900/40 p-6 rounded-3xl flex flex-col justify-between h-40 relative overflow-hidden border border-transparent dark:border-orange-900/50 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                     <div className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-white/10 rounded-full backdrop-blur-sm">
                        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                             <div className="p-2 bg-white/60 dark:bg-white/10 rounded-xl">
                                <Calendar className="w-5 h-5 text-slate-700 dark:text-orange-100" />
                             </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-sm mt-4">Appointments</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white animate-in slide-in-from-bottom-2 fade-in">{currentStats.appt}+</h3>
                            <span className="text-xs font-semibold bg-white/50 dark:bg-white/10 px-1.5 py-0.5 rounded text-green-700 dark:text-green-300 mb-1">↗ 10%</span>
                        </div>
                     </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Daily Appointment Stats */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 dark:text-white">Daily Appointment Stats</h3>
                        <div className="relative">
                            <MoreHorizontal 
                                onClick={(e) => toggleMenu(e, 'dailyStats')}
                                className="text-slate-400 w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" 
                            />
                            {activeMenuId === 'dailyStats' && (
                                <div className="absolute right-0 top-6 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-30 animate-in fade-in zoom-in-95 duration-100">
                                    <button className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><Download className="w-3 h-3"/> Download</button>
                                    <button className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><FileText className="w-3 h-3"/> View Report</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyBarStats} barSize={12}>
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.1} strokeDasharray="4 4" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}} 
                                    contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}}
                                    itemStyle={{color: '#fff'}}
                                />
                                <Bar dataKey="val" fill="#0d9488" radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Appointment Stats (Curve) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 dark:text-white">Appointment Stats</h3>
                        <div className="relative">
                            <MoreHorizontal 
                                onClick={(e) => toggleMenu(e, 'curveStats')}
                                className="text-slate-400 w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" 
                            />
                            {activeMenuId === 'curveStats' && (
                                <div className="absolute right-0 top-6 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-30 animate-in fade-in zoom-in-95 duration-100">
                                    <button className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><Share2 className="w-3 h-3"/> Share</button>
                                    <button className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><Download className="w-3 h-3"/> Download</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={currentStats.chartData}>
                                <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.1} strokeDasharray="4 4" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}} 
                                    itemStyle={{color: '#fff'}}
                                />
                                <Area type="monotone" dataKey="val" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Patients Table Preview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white">Recent Patients</h3>
                    <div className="flex gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <span className={`cursor-pointer transition-colors ${timeRange === 'Daily' ? 'text-white bg-teal-600 px-3 py-1 rounded-lg' : 'hover:text-teal-600'}`} onClick={() => setTimeRange('Daily')}>Daily</span>
                        <span className={`cursor-pointer transition-colors ${timeRange === 'Weekly' ? 'text-white bg-teal-600 px-3 py-1 rounded-lg' : 'hover:text-teal-600'}`} onClick={() => setTimeRange('Weekly')}>Weekly</span>
                        <span className={`cursor-pointer transition-colors ${timeRange === 'Month' ? 'text-white bg-teal-600 px-3 py-1 rounded-lg' : 'hover:text-teal-600'}`} onClick={() => setTimeRange('Month')}>Monthly</span>
                    </div>
                </div>
                
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase text-slate-400 font-semibold">
                            <tr>
                                <th className="px-4 py-3 rounded-l-xl">Name</th>
                                <th className="px-4 py-3">Age</th>
                                <th className="px-4 py-3">Date & Time</th>
                                <th className="px-4 py-3">Appointed For</th>
                                <th className="px-4 py-3">Report</th>
                                <th className="px-4 py-3 rounded-r-xl">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredPatients.slice(0, 5).map((patient, idx) => (
                                <tr key={patient.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                                                {/* Simulated Avatar */}
                                                <img src={`https://i.pravatar.cc/150?u=${patient.id}`} alt="avatar" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{patient.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{patient.age} years</td>
                                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{patient.lastVisit}</td>
                                    <td className="px-4 py-4">
                                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                                            Checkup
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Activity className="w-4 h-4 text-red-400" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <button 
                                            onClick={() => setView('patients')}
                                            className="text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPatients.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No patients found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        {/* Right Column (Side Widgets) */}
        <div className="space-y-6">
            
            {/* Patient Overview Donut */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Patient Overview</h3>
                     <div className="relative">
                        <MoreHorizontal 
                            onClick={(e) => toggleMenu(e, 'donutStats')}
                            className="text-slate-400 w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" 
                        />
                        {activeMenuId === 'donutStats' && (
                            <div className="absolute right-0 top-6 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-30 animate-in fade-in zoom-in-95 duration-100">
                                <button className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><Share2 className="w-3 h-3"/> Share</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="h-48 relative w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                cornerRadius={5}
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-2xl font-bold text-slate-800 dark:text-white">70</span>
                         <span className="text-xs text-slate-400 uppercase">Total</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                     {pieData.map(d => (
                         <div key={d.name} className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                             <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{d.name}</div>
                         </div>
                     ))}
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm h-auto border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white">Upcoming</h3>
                    <ChevronDown className="text-slate-400 w-4 h-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" />
                </div>
                
                {/* Simulated Calendar Strip */}
                <div className="flex justify-between mb-6 bg-slate-50 dark:bg-slate-700 p-2 rounded-xl">
                    {calendarDays.map((d, index) => (
                        <button 
                            key={index}
                            onClick={() => setSelectedDate(d.fullDate)}
                            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                                selectedDate === d.fullDate 
                                ? 'bg-teal-600 text-white shadow-md transform scale-105' 
                                : 'text-slate-400 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 hover:shadow-sm'
                            }`}
                        >
                            <span className="text-xs font-bold">{d.date}</span>
                            <span className="text-[10px] uppercase">{d.day}</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {filteredAppointments.length > 0 ? filteredAppointments.map(appt => (
                         <div key={appt.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer group">
                             <img src={`https://i.pravatar.cc/150?u=${appt.patientId}`} className="w-10 h-10 rounded-full bg-slate-200" alt="patient" />
                             <div className="flex-1">
                                 <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{appt.patientName}</h4>
                                 <p className="text-xs text-slate-400">{appt.time}</p>
                             </div>
                             <span className="text-[10px] font-bold text-slate-300 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 px-2 py-1 rounded">Offline</span>
                         </div>
                    )) : (
                         <div className="text-center py-4 text-slate-400 text-xs">No appointments for this day.</div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
