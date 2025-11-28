
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  Download, Calendar, ChevronDown, TrendingUp, TrendingDown, 
  DollarSign, Users, Activity, FileText, Filter, Printer, 
  Loader2, Sparkles, Smartphone, CreditCard, ShieldCheck, Clock, X, Search,
  ChevronLeft, ChevronRight
} from 'lucide-react';

type TimeRange = '7D' | '30D' | '3M' | '1Y';
type ReportTab = 'financial' | 'clinical' | 'operational';

const COLORS = {
  primary: '#0d9488', // Teal 600
  secondary: '#f59e0b', // Amber 500
  danger: '#ef4444', // Red 500
  success: '#10b981', // Emerald 500
  mpesa: '#16a34a', // Green 600
  shif: '#6366f1', // Indigo 500
  cash: '#64748b', // Slate 500
  slate: '#94a3b8',
};

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('financial');
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');
  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // -- Filter State --
  const [tableSearch, setTableSearch] = useState('');
  const [drillDownFilter, setDrillDownFilter] = useState<{ category: string; value: string } | null>(null);

  // -- Pagination State --
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // -- Data Generation Logic --

  // Reset drilldown and pagination when tab or time range changes
  useEffect(() => {
    setDrillDownFilter(null);
    setTableSearch('');
    setCurrentPage(1);
  }, [activeTab, timeRange]);

  // Reset pagination when search or drilldown filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, drillDownFilter]);

  // Simulate data fetching delay
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [timeRange, activeTab]);

  const financialData = useMemo(() => {
    const points = timeRange === '7D' ? 7 : timeRange === '30D' ? 15 : timeRange === '3M' ? 12 : 12;
    const labels = timeRange === '1Y' 
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : Array.from({ length: points }, (_, i) => `Day ${i + 1}`);

    const multiplier = timeRange === '1Y' ? 10 : 1;

    return labels.slice(0, points).map(label => {
      const revenue = (Math.floor(Math.random() * 50000) + 20000) * multiplier;
      const expenses = Math.floor(revenue * (0.4 + Math.random() * 0.2));
      return {
        name: label,
        revenue,
        expenses,
        profit: revenue - expenses,
      };
    });
  }, [timeRange]);

  const paymentMethodData = useMemo(() => {
    // Dynamically shift percentages based on time range to simulate changing trends
    const mpesaBase = timeRange === '7D' ? 65 : 55;
    return [
      { name: 'M-Pesa', value: mpesaBase, color: COLORS.mpesa },
      { name: 'Cash', value: 90 - mpesaBase, color: COLORS.cash },
      { name: 'SHIF / Insurance', value: 10, color: COLORS.shif },
    ];
  }, [timeRange]);

  const diseaseData = useMemo(() => {
    const scale = timeRange === '1Y' ? 12 : timeRange === '3M' ? 3 : 1;
    return [
      { name: 'Malaria', count: Math.floor(185 * scale * (0.8 + Math.random()*0.4)), color: COLORS.secondary }, 
      { name: 'Typhoid', count: Math.floor(120 * scale * (0.8 + Math.random()*0.4)), color: COLORS.danger }, 
      { name: 'Respiratory', count: Math.floor(90 * scale * (0.8 + Math.random()*0.4)), color: COLORS.success }, 
      { name: 'Gastroenteritis', count: Math.floor(65 * scale * (0.8 + Math.random()*0.4)), color: COLORS.shif }, 
      { name: 'Hypertension', count: Math.floor(45 * scale * (0.8 + Math.random()*0.4)), color: COLORS.primary }, 
    ];
  }, [timeRange]);

  const operationalData = useMemo(() => {
     return [
        { name: 'Completed', value: Math.floor(Math.random() * 20) + 70, color: COLORS.success },
        { name: 'Cancelled', value: Math.floor(Math.random() * 10) + 5, color: COLORS.danger },
        { name: 'No Show', value: Math.floor(Math.random() * 10) + 5, color: COLORS.cash },
      ];
  }, [timeRange]);

  // Mock Table Data generator based on tab
  const tableData = useMemo(() => {
    const count = timeRange === '7D' ? 25 : 85; // Increased count for pagination demo
    const data = [];
    
    if (activeTab === 'financial') {
        const methods = ['M-Pesa', 'Cash', 'SHIF'];
        const types = ['Consultation', 'Lab Test', 'Pharmacy', 'Procedure'];
        for(let i=0; i<count; i++) {
            data.push({
                id: `TRX-${1000+i}`,
                col1: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString(),
                col2: types[Math.floor(Math.random()*types.length)],
                col3: methods[Math.floor(Math.random()*methods.length)],
                col4: (Math.floor(Math.random()*3000) + 500).toLocaleString(),
                status: 'Completed'
            });
        }
    } else if (activeTab === 'clinical') {
        const diseases = ['Malaria', 'Flu', 'Typhoid', 'Checkup', 'Hypertension'];
        for(let i=0; i<count; i++) {
            data.push({
                id: `VISIT-${2000+i}`,
                col1: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString(),
                col2: ['John Doe', 'Jane Smith', 'Michael O.', 'Sarah W.', 'David K.'][Math.floor(Math.random()*5)],
                col3: diseases[Math.floor(Math.random()*diseases.length)],
                col4: ['Dr. Kimani', 'Dr. Atieno'][Math.floor(Math.random()*2)],
                status: ['Discharged', 'Admitted', 'Follow-up'][Math.floor(Math.random()*3)]
            });
        }
    } else {
        const categories = ['Appointment', 'Inventory', 'System', 'Staff'];
        for(let i=0; i<count; i++) {
            data.push({
                id: `LOG-${3000+i}`,
                col1: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString(),
                col2: ['Dr. Kimani', 'Nurse Sarah', 'Receptionist', 'System'][Math.floor(Math.random()*4)],
                col3: categories[Math.floor(Math.random()*categories.length)],
                col4: ['High Activity', 'Login', 'Update', 'Error'][Math.floor(Math.random()*4)],
                status: 'Logged'
            });
        }
    }
    return data;
  }, [activeTab, timeRange]);

  // -- Filtered Data --
  const filteredTableData = useMemo(() => {
      let data = tableData;

      // Drill down filter
      if (drillDownFilter) {
          data = data.filter(row => {
              // Flexible matching: check if row values contain the drilldown value
              const vals = Object.values(row).map(v => String(v).toLowerCase());
              const target = drillDownFilter.value.toLowerCase();
              return vals.some(v => v.includes(target));
          });
      }

      // Search filter
      if (tableSearch) {
          const lower = tableSearch.toLowerCase();
          data = data.filter(row => 
              Object.values(row).some(val => 
                  String(val).toLowerCase().includes(lower)
              )
          );
      }
      return data;
  }, [tableData, drillDownFilter, tableSearch]);

  // -- Pagination Data --
  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage);
  const paginatedTableData = filteredTableData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // -- Actions --

  const handleChartClick = (data: any) => {
      if (data && data.name) {
          setDrillDownFilter({ category: 'Category', value: data.name });
          // Scroll to table
          const tableElement = document.getElementById('reports-table');
          if (tableElement) tableElement.scrollIntoView({ behavior: 'smooth' });
      }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    
    // Generate CSV Headers based on active tab
    let headers = [];
    if (activeTab === 'financial') headers = ['ID', 'Date', 'Description', 'Method', 'Amount', 'Status'];
    else if (activeTab === 'clinical') headers = ['Visit ID', 'Date', 'Patient', 'Diagnosis', 'Doctor', 'Status'];
    else headers = ['Log ID', 'Date', 'User', 'Category', 'Details', 'Status'];

    // Convert data to CSV string
    const rows = filteredTableData.map(row => Object.values(row).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
    
    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `juaafya_${activeTab}_report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsExporting(false), 800);
  };

  const getRangeLabel = () => {
    switch(timeRange) {
        case '7D': return 'Last 7 Days';
        case '30D': return 'Last 30 Days';
        case '3M': return 'Last 3 Months';
        case '1Y': return 'Year to Date';
    }
  };

  // -- Sub-components --

  const renderAIInsight = () => (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 no-print">
        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
        </div>
        <div>
            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">AI Smart Insight</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                {activeTab === 'financial' && `Revenue is trending ${timeRange === '7D' ? 'stable' : 'upwards'} compared to previous periods. M-Pesa remains the dominant payment channel (${paymentMethodData[0].value}%).`}
                {activeTab === 'clinical' && `Malaria cases account for approx ${(diseaseData[0].count / (diseaseData.reduce((a,b)=>a+b.count,0))) * 100 | 0}% of visits this period. Consider verifying stock of anti-malarials.`}
                {activeTab === 'operational' && `Appointment completion rate is at ${operationalData[0].value}%. No-shows are higher on Mondays.`}
            </p>
        </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
        {renderAIInsight()}
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            KSh {(financialData.reduce((acc, curr) => acc + curr.revenue, 0)).toLocaleString()}
                        </h3>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg"><TrendingUp className="w-5 h-5"/></div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600 font-medium"><span className="mr-1">↑ 12%</span> vs last period</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">M-Pesa Collections</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                             KSh {(financialData.reduce((acc, curr) => acc + curr.revenue, 0) * (paymentMethodData[0].value / 100) | 0).toLocaleString()}
                        </h3>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg"><Smartphone className="w-5 h-5"/></div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600 font-medium"><span className="mr-1">↑ {paymentMethodData[0].value > 60 ? 'High' : 'Avg'}</span> adoption</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending SHIF Claims</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">KSh 45,000</h3>
                    </div>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg"><ShieldCheck className="w-5 h-5"/></div>
                </div>
                <div className="mt-4 flex items-center text-sm text-amber-600 font-medium"><span className="mr-1">● 5</span> claims processing</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6">Revenue & Expense Trend</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={financialData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} strokeDasharray="4 4"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}} itemStyle={{color: '#fff'}}/>
                            <Legend verticalAlign="top" height={36}/>
                            <Area name="Revenue" type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={3} fill="url(#colorRev)" />
                            <Area name="Expenses" type="monotone" dataKey="expenses" stroke={COLORS.danger} strokeWidth={3} fill="url(#colorExp)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Payment Methods Donut */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                <div className="mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">Payment Mix</h3>
                    <p className="text-xs text-slate-500">Click segment to filter table</p>
                </div>
                
                <div className="h-52 w-full relative flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={paymentMethodData} 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                                onClick={handleChartClick}
                                cursor="pointer"
                            >
                                {paymentMethodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <Smartphone className="w-6 h-6 text-green-600 mb-1" />
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{paymentMethodData[0].value}%</span>
                        <span className="text-[10px] text-slate-500 uppercase">M-Pesa</span>
                    </div>
                </div>
                <div className="space-y-3 mt-4">
                    {paymentMethodData.map(item => (
                        <div key={item.name} className="flex justify-between items-center text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 rounded" onClick={() => handleChartClick(item)}>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                                <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );

  const renderClinicalTab = () => (
    <div className="space-y-6">
        {renderAIInsight()}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Diagnoses */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Top Diagnoses</h3>
                <p className="text-xs text-slate-500 mb-6">Click bar to filter table</p>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={diseaseData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} onClick={handleChartClick} cursor="pointer">
                                {diseaseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Patient Demographics Placeholder */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Patient Demographics</h3>
                <p className="text-xs text-slate-500 mb-6">Age and Gender distribution</p>
                <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium text-center">Demographic Data Visualization</p>
                    <p className="text-xs text-center mt-2 opacity-70">Requires larger dataset for accurate generation.</p>
                </div>
            </div>
        </div>
    </div>
  );

  const renderOperationalTab = () => (
    <div className="space-y-6">
        {renderAIInsight()}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg Wait Time</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">14 min</h3>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Clock className="w-5 h-5"/></div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600 font-medium"><span className="mr-1">↓ 2 min</span> vs last week</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Staff Utilization</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">85%</h3>
                    </div>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg"><Users className="w-5 h-5"/></div>
                </div>
                <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">Optimal range</div>
            </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">No-Show Rate</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">10%</h3>
                    </div>
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg"><Activity className="w-5 h-5"/></div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600 font-medium"><span className="mr-1">↓ 5%</span> improved</div>
            </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h3 className="font-bold text-slate-900 dark:text-white mb-2">Appointment Status Breakdown</h3>
             <p className="text-xs text-slate-500 mb-6">Click bar to filter logs</p>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={operationalData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} onClick={handleChartClick} cursor="pointer">
                             {operationalData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-200" onClick={() => setIsTimeMenuOpen(false)}>
      
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 no-print">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Enterprise insights for your clinic</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
             {/* Date Filter Dropdown */}
             <div className="relative z-20">
                 <button 
                    onClick={(e) => { e.stopPropagation(); setIsTimeMenuOpen(!isTimeMenuOpen); }}
                    className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors shadow-sm min-w-[160px] justify-between"
                 >
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {getRangeLabel()}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isTimeMenuOpen ? 'rotate-180' : ''}`} />
                 </button>
                 
                 {isTimeMenuOpen && (
                     <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 z-30">
                         {[
                             { id: '7D', label: 'Last 7 Days' },
                             { id: '30D', label: 'Last 30 Days' },
                             { id: '3M', label: 'Last 3 Months' },
                             { id: '1Y', label: 'Year to Date' }
                         ].map(opt => (
                             <button 
                                key={opt.id}
                                onClick={() => setTimeRange(opt.id as TimeRange)}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${timeRange === opt.id ? 'text-teal-600 font-bold bg-teal-50 dark:bg-teal-900/20' : 'text-slate-600 dark:text-slate-300'}`}
                              >
                                 {opt.label}
                             </button>
                         ))}
                     </div>
                 )}
             </div>

             <button 
                onClick={() => window.print()}
                className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors shadow-sm"
            >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
            </button>

             <button 
                onClick={handleExportCSV}
                disabled={isExporting}
                className="bg-teal-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 dark:shadow-none text-sm font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />}
                {isExporting ? 'Exporting...' : 'Export CSV'}
             </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-8 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit overflow-x-auto max-w-full no-print">
          {[
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'clinical', label: 'Clinical', icon: Activity },
              { id: 'operational', label: 'Operational', icon: FileText }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReportTab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
              </button>
          ))}
      </div>
      
      {/* Active Filter Banner */}
      {drillDownFilter && (
        <div className="mb-6 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 no-print">
            <div className="flex items-center gap-2 text-sm text-teal-800 dark:text-teal-300">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filtering by:</span>
                <span className="font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    {drillDownFilter.value}
                </span>
            </div>
            <button 
                onClick={() => setDrillDownFilter(null)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
                <X className="w-3 h-3" /> Clear Filter
            </button>
        </div>
      )}

      {/* Main Content */}
      <div className="relative min-h-[400px]">
          {isLoading ? (
              <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                  <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                      <p className="text-sm font-bold text-slate-500">Updating analytics...</p>
                  </div>
              </div>
          ) : null}

          {/* Tab Content */}
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              {activeTab === 'financial' && renderFinancialTab()}
              {activeTab === 'clinical' && renderClinicalTab()}
              {activeTab === 'operational' && renderOperationalTab()}
          </div>

          {/* Detailed Data Table (Common) */}
          <div id="reports-table" className="mt-8 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-400" />
                      {activeTab === 'financial' ? 'Transactions' : activeTab === 'clinical' ? 'Patient Visits' : 'Activity Logs'}
                  </h3>
                  <div className="flex items-center gap-3 no-print">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input 
                              placeholder="Search records..." 
                              value={tableSearch}
                              onChange={(e) => setTableSearch(e.target.value)}
                              className="pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64 dark:text-white" 
                          />
                          {tableSearch && (
                              <button onClick={() => setTableSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                  <X className="w-3.5 h-3.5" />
                              </button>
                          )}
                      </div>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                          <tr>
                              <th className="px-6 py-4">ID</th>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">
                                  {activeTab === 'financial' ? 'Description' : activeTab === 'clinical' ? 'Patient' : 'User'}
                              </th>
                              <th className="px-6 py-4">
                                  {activeTab === 'financial' ? 'Method' : activeTab === 'clinical' ? 'Diagnosis' : 'Category'}
                              </th>
                              <th className="px-6 py-4">
                                  {activeTab === 'financial' ? 'Amount' : activeTab === 'clinical' ? 'Doctor' : 'Details'}
                              </th>
                              <th className="px-6 py-4 text-center">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                          {paginatedTableData.length > 0 ? paginatedTableData.map((row: any, i) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{row.id}</td>
                                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.col1}</td>
                                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.col2}</td>
                                  <td className="px-6 py-4">
                                      {activeTab === 'financial' ? (
                                          <span className={`flex items-center gap-1.5 ${row.col3 === 'M-Pesa' ? 'text-green-600 font-bold' : row.col3 === 'Cash' ? 'text-slate-600' : 'text-indigo-600'}`}>
                                              {row.col3 === 'M-Pesa' && <Smartphone className="w-3.5 h-3.5" />}
                                              {row.col3}
                                          </span>
                                      ) : (
                                          <span className="text-slate-600 dark:text-slate-300">{row.col3}</span>
                                      )}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">
                                      {activeTab === 'financial' ? `KSh ${row.col4}` : row.col4}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md text-xs font-bold border border-green-100 dark:border-green-900/30">
                                          {row.status}
                                      </span>
                                  </td>
                              </tr>
                          )) : (
                              <tr>
                                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                      <p>No records found matching your filters.</p>
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                          Showing page {currentPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                          <button 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                          >
                              <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button 
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                          >
                              <ChevronRight className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Reports;
