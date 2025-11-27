import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Download, Calendar } from 'lucide-react';

const Reports: React.FC = () => {
  const revenueData = [
    { name: 'Jan', revenue: 45000, expenses: 32000 },
    { name: 'Feb', revenue: 52000, expenses: 34000 },
    { name: 'Mar', revenue: 48000, expenses: 30000 },
    { name: 'Apr', revenue: 61000, expenses: 35000 },
    { name: 'May', revenue: 55000, expenses: 33000 },
    { name: 'Jun', revenue: 67000, expenses: 38000 },
  ];

  const diseaseData = [
    { name: 'Malaria', count: 120 },
    { name: 'Flu', count: 98 },
    { name: 'Typhoid', count: 45 },
    { name: 'Infection', count: 30 },
    { name: 'Injury', count: 25 },
  ];

  return (
    <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Clinic Reports</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Financial and operational analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
             <button className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                <Calendar className="w-4 h-4" />
                Last 6 Months
             </button>
             <button className="bg-teal-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 dark:shadow-none text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                Export PDF
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Revenue vs Expenses</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.1} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff'}} 
                            itemStyle={{color: '#fff'}}
                        />
                        <Legend iconType="circle" />
                        <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Top Diagnoses */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Top Diagnoses</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diseaseData} layout="vertical">
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} />
                         <Tooltip 
                            cursor={{fill: 'transparent'}} 
                            contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}} 
                            itemStyle={{color: '#fff'}}
                        />
                         <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-teal-900 dark:bg-teal-950 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden transition-colors">
             <div className="absolute top-0 right-0 w-32 h-32 bg-teal-800 dark:bg-teal-900 rounded-full translate-x-10 -translate-y-10 blur-2xl"></div>
             <h3 className="relative z-10 text-teal-200 text-sm font-medium uppercase tracking-wider mb-2">Net Profit</h3>
             <div className="relative z-10 text-4xl font-bold">KSh 125k</div>
             <div className="relative z-10 mt-4 text-teal-300 text-sm">+12% from last month</div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 transition-colors">
             <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Avg. Wait Time</h3>
             <div className="text-4xl font-bold text-slate-900 dark:text-white">18 <span className="text-lg font-normal text-slate-400">min</span></div>
             <div className="mt-4 text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                 <span className="bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-xs font-bold">↓ 5%</span> 
                 Faster than avg
             </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 transition-colors">
             <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Patient Satisfaction</h3>
             <div className="text-4xl font-bold text-slate-900 dark:text-white">4.8 <span className="text-lg font-normal text-slate-400">/ 5</span></div>
             <div className="mt-4 text-slate-400 text-sm">Based on 124 reviews</div>
         </div>
      </div>
    </div>
  );
};

export default Reports;