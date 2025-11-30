
import React, { useState, useMemo, useEffect } from 'react';
import { Clinic, ApprovalRequest, TeamMember, SaaSTransaction, SaaSPlatformSettings, SystemLog } from '../types';
import { MOCK_CLINICS, MOCK_REQUESTS, MOCK_SAAS_TRANSACTIONS, MOCK_SYSTEM_LOGS } from '../constants';
import { 
  Shield, Activity, DollarSign, Building2, CheckCircle, XCircle, MoreHorizontal, 
  Search, Filter, Smartphone, CreditCard, ChevronDown, Download, AlertTriangle, 
  Settings, ToggleLeft, ToggleRight, Trash2, Eye, Mail, Server, ArrowUpRight, Save,
  FileText, UserCheck, Ban, Check, X, KeyRound, Loader2, PieChart as PieIcon,
  Plus, MessageSquare, RefreshCw, Database, Undo2, Play, Calendar, Landmark, Receipt
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

interface SuperAdminDashboardProps {
    currentUser: TeamMember;
    switchUser: (member: TeamMember) => void;
    team: TeamMember[];
    activeTab: 'overview' | 'clinics' | 'approvals' | 'payments' | 'settings';
}

const COLORS = {
  primary: '#4f46e5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  neutral: '#94a3b8',
  dark: '#1e293b'
};

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ currentUser, switchUser, team, activeTab }) => {
  
  // -- Data State --
  const [clinics, setClinics] = useState<Clinic[]>(MOCK_CLINICS);
  const [requests, setRequests] = useState<ApprovalRequest[]>(MOCK_REQUESTS);
  const [transactions, setTransactions] = useState<SaaSTransaction[]>(MOCK_SAAS_TRANSACTIONS);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(MOCK_SYSTEM_LOGS);
  const [platformSettings, setPlatformSettings] = useState<SaaSPlatformSettings>({
      maintenanceMode: false,
      allowNewRegistrations: true,
      globalAnnouncement: '',
      pricing: { free: 0, pro: 5000, enterprise: 15000 }
  });

  // -- UI State --
  const [isProcessing, setIsProcessing] = useState<string | null>(null); // Stores ID of processing item or 'global'
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'pricing' | 'logs' | 'backups'>('general');
  const [paymentsSubTab, setPaymentsSubTab] = useState<'transactions' | 'subscriptions' | 'gateways'>('transactions');

  // -- Modal State --
  const [showAddClinic, setShowAddClinic] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // -- Forms --
  const [newClinicForm, setNewClinicForm] = useState({ name: '', owner: '', email: '', plan: 'Free' });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  
  // Payment Recording Form
  const [recordPaymentForm, setRecordPaymentForm] = useState({ 
      clinicId: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0], 
      method: 'Bank Transfer', 
      ref: '' 
  });

  // Gateway Config (Local Mock)
  const [gatewayConfig, setGatewayConfig] = useState({
      mpesa: { paybill: '522522', account: 'JUAAFYA', name: 'JuaAfya Ltd' },
      bank: { name: 'KCB Bank', branch: 'Head Office', account: '1100223344', swift: 'KCBLKENX' }
  });

  // -- Filter State --
  const [clinicSearch, setClinicSearch] = useState('');
  const [clinicStatusFilter, setClinicStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [clinicPlanFilter, setClinicPlanFilter] = useState<'All' | 'Free' | 'Pro' | 'Enterprise'>('All');
  
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<'All' | 'Success' | 'Pending' | 'Failed'>('All');

  const [approvalFilter, setApprovalFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // -- Toast Timer --
  useEffect(() => {
      if (toast) {
          const timer = setTimeout(() => setToast(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [toast]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ message, type });
  };

  const simulateAsyncAction = async (id: string, action: () => void) => {
      setIsProcessing(id);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
      action();
      setIsProcessing(null);
  };

  // -- Derived Stats --
  const stats = useMemo(() => ({
      totalClinics: clinics.length,
      activeClinics: clinics.filter(c => c.status === 'Active').length,
      pendingRequests: requests.filter(r => r.status === 'Pending').length,
      monthlyRevenue: transactions.filter(t => t.status === 'Success').reduce((acc, t) => acc + t.amount, 0),
      failedPayments: transactions.filter(t => t.status === 'Failed').length,
  }), [clinics, requests, transactions]);

  const planDistribution = useMemo(() => [
      { name: 'Free', value: clinics.filter(c => c.plan === 'Free').length, color: COLORS.neutral },
      { name: 'Pro', value: clinics.filter(c => c.plan === 'Pro').length, color: COLORS.primary },
      { name: 'Enterprise', value: clinics.filter(c => c.plan === 'Enterprise').length, color: COLORS.success }
  ], [clinics]);

  const recentRevenue = useMemo(() => {
      return transactions.slice(0, 5).map(t => ({
          name: t.date.split('-').slice(1).join('/'),
          amount: t.amount
      })).reverse();
  }, [transactions]);

  // -- Helpers --
  const exportToCSV = (data: any[], filename: string) => {
      if (!data.length) {
          showNotification('No data available to export', 'error');
          return;
      }
      const headers = Object.keys(data[0]);
      const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header])).join(','));
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Export started successfully', 'success');
  };

  // -- Handlers --

  const handleRecordPayment = () => {
      if (!recordPaymentForm.clinicId || !recordPaymentForm.amount) return;
      
      simulateAsyncAction('record-payment', () => {
          // 1. Create Transaction
          const clinic = clinics.find(c => c.id === recordPaymentForm.clinicId);
          if (!clinic) return;

          const newTx: SaaSTransaction = {
              id: `TX-${Date.now()}`,
              clinicName: clinic.name,
              amount: parseFloat(recordPaymentForm.amount),
              date: recordPaymentForm.date,
              status: 'Success',
              method: recordPaymentForm.method as any,
              plan: clinic.plan
          };
          setTransactions(prev => [newTx, ...prev]);

          // 2. Update Clinic Dates (Add 1 month to nextPaymentDate)
          const nextDate = new Date(clinic.nextPaymentDate !== '-' ? clinic.nextPaymentDate : new Date());
          nextDate.setMonth(nextDate.getMonth() + 1);
          
          setClinics(prev => prev.map(c => c.id === clinic.id ? {
              ...c,
              lastPaymentDate: recordPaymentForm.date,
              nextPaymentDate: nextDate.toISOString().split('T')[0],
              revenueYTD: c.revenueYTD + parseFloat(recordPaymentForm.amount)
          } : c));

          setShowRecordPayment(false);
          setRecordPaymentForm({ clinicId: '', amount: '', date: new Date().toISOString().split('T')[0], method: 'Bank Transfer', ref: '' });
          showNotification('Payment recorded & subscription extended', 'success');
      });
  };

  const handleSaveGateways = () => {
      simulateAsyncAction('save-gateways', () => {
          showNotification('Payment gateway settings updated', 'success');
      });
  };

  const handleApproveRequest = (id: string) => {
      const request = requests.find(r => r.id === id);
      simulateAsyncAction(id, () => {
          setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
          
          if (request?.type === 'New Clinic') {
              const newClinic: Clinic = {
                  id: `C${Date.now()}`,
                  name: request.clinicName,
                  ownerName: request.requesterName,
                  email: `admin@${request.clinicName.toLowerCase().replace(/\s/g, '')}.com`,
                  plan: 'Free',
                  status: 'Active',
                  joinedDate: new Date().toISOString().split('T')[0],
                  lastPaymentDate: '-',
                  nextPaymentDate: '-',
                  revenueYTD: 0
              };
              setClinics(prev => [newClinic, ...prev]);
              showNotification(`Clinic "${newClinic.name}" provisioned successfully`, 'success');
          } else {
              showNotification('Request processed successfully', 'success');
          }
      });
  };

  const handleRejectRequest = (id: string) => {
      simulateAsyncAction(id, () => {
          setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
          showNotification('Request rejected', 'info');
      });
  };

  const handleSuspendClinic = (id: string) => {
      simulateAsyncAction(id, () => {
          setClinics(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Suspended' ? 'Active' : 'Suspended' } : c));
          setActionMenuOpenId(null);
          showNotification('Clinic status updated', 'success');
      });
  };

  const handleDeleteClinic = (id: string) => {
      if(confirm('Are you sure? This deletes all tenant data and cannot be undone.')) {
          simulateAsyncAction(id, () => {
              setClinics(prev => prev.filter(c => c.id !== id));
              setActionMenuOpenId(null);
              showNotification('Clinic deleted permanently', 'info');
          });
      }
  };

  const handleProvisionNewClinic = () => {
      if (!newClinicForm.name || !newClinicForm.email) return;
      simulateAsyncAction('add-clinic', () => {
          const newClinic: Clinic = {
              id: `C${Date.now()}`,
              name: newClinicForm.name,
              ownerName: newClinicForm.owner,
              email: newClinicForm.email,
              plan: newClinicForm.plan as any,
              status: 'Active',
              joinedDate: new Date().toISOString().split('T')[0],
              lastPaymentDate: '-',
              nextPaymentDate: '-',
              revenueYTD: 0
          };
          setClinics(prev => [newClinic, ...prev]);
          setShowAddClinic(false);
          setNewClinicForm({ name: '', owner: '', email: '', plan: 'Free' });
          showNotification('New clinic onboarded successfully', 'success');
      });
  };

  const handleRefund = (txId: string) => {
      if (!confirm("Process refund for this transaction?")) return;
      simulateAsyncAction(txId, () => {
          setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'Failed' } : t)); 
          showNotification(`Refund processed for ${txId}`, 'success');
      });
  };

  const toggleSettings = (field: keyof SaaSPlatformSettings) => {
      setPlatformSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleBroadcast = () => {
      if (!broadcastMsg) return;
      simulateAsyncAction('broadcast', () => {
          setPlatformSettings(prev => ({ ...prev, globalAnnouncement: broadcastMsg }));
          setShowBroadcast(false);
          setBroadcastMsg('');
          showNotification('Global announcement updated', 'success');
      });
  };

  const handleImpersonate = (clinic: Clinic) => {
      const targetUser = team.find(t => t.email === clinic.email || t.name === clinic.ownerName);
      if (confirm(`Security Audit: You are about to sign in as an Admin for "${clinic.name}". All actions will be logged.`)) {
          simulateAsyncAction('impersonate', () => {
              if (targetUser) {
                  showNotification(`Impersonation active. Redirecting to ${clinic.name}...`, 'success');
                  setTimeout(() => switchUser(targetUser), 1000);
              } else {
                  showNotification(`Simulated login as ${clinic.ownerName}. (User not found in demo session)`, 'info');
              }
          });
      }
  };

  const handleResetPassword = (email: string) => {
      simulateAsyncAction('reset-pwd', () => {
          showNotification(`Password reset instructions sent to ${email}`, 'success');
      });
  };

  const handleEmailOwner = (email: string) => {
      window.location.href = `mailto:${email}`;
  };

  const handleSaveSettings = () => {
      simulateAsyncAction('save-settings', () => {
          showNotification('Platform configuration saved successfully.', 'success');
      });
  };

  const handleSavePricing = () => {
      simulateAsyncAction('save-pricing', () => {
          showNotification('Pricing tiers updated and published.', 'success');
      });
  };

  // -- Render Methods --

  const renderOverview = () => (
      <div className="space-y-6 animate-in fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Clinics</p>
                          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalClinics}</h3>
                      </div>
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><Building2 className="w-6 h-6"/></div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-indigo-600 font-medium"><span className="mr-1">↑ 2</span> new this month</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Recurring Revenue (MRR)</p>
                          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">KSh {stats.monthlyRevenue.toLocaleString()}</h3>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl"><DollarSign className="w-6 h-6"/></div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600 font-medium"><span className="mr-1">↑ 15%</span> vs last month</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Approvals</p>
                          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.pendingRequests}</h3>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl"><Activity className="w-6 h-6"/></div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">Requires attention</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">System Status</p>
                          <h3 className="text-xl font-bold text-green-600 mt-2 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5"/> {platformSettings.maintenanceMode ? 'Maintenance' : 'Operational'}
                          </h3>
                      </div>
                      <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-xl"><Server className="w-6 h-6"/></div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-green-500 w-[92%] h-full"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500">99.9% Uptime</span>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Quick Actions & Activity */}
               <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold text-slate-900 dark:text-white">Quick Actions</h3>
                       <button onClick={() => setShowBroadcast(true)} className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                           <MessageSquare className="w-4 h-4" /> Broadcast
                       </button>
                  </div>
                  <div className="flex-1 space-y-4">
                      {requests.slice(0, 3).map(req => (
                          <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                              <div>
                                  <p className="font-bold text-slate-900 dark:text-white text-sm">{req.clinicName}</p>
                                  <p className="text-xs text-slate-500">{req.type} • {req.requesterName}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  req.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                  req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                              }`}>{req.status}</span>
                          </div>
                      ))}
                      {requests.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No pending requests.</p>}
                  </div>
               </div>

               {/* Growth Chart */}
               <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                   <h3 className="font-bold text-slate-900 dark:text-white mb-6">Platform Growth (Active Clinics)</h3>
                   <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                {name: 'Jan', val: 12}, {name: 'Feb', val: 15}, {name: 'Mar', val: 22}, 
                                {name: 'Apr', val: 28}, {name: 'May', val: 35}, {name: 'Jun', val: 42}
                            ]}>
                                <defs>
                                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.3} strokeDasharray="4 4" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}} />
                                <Area type="monotone" dataKey="val" stroke={COLORS.primary} strokeWidth={3} fill="url(#colorGrowth)" />
                            </AreaChart>
                        </ResponsiveContainer>
                   </div>
               </div>
          </div>
      </div>
  );

  const renderApprovals = () => {
      const filteredRequests = requests.filter(r => approvalFilter === 'All' || r.status === approvalFilter);

      return (
          <div className="space-y-6 animate-in fade-in">
              {/* Stats & Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                      <button 
                          key={status}
                          onClick={() => setApprovalFilter(status as any)}
                          className={`p-4 rounded-xl border transition-all text-left ${
                              approvalFilter === status 
                              ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' 
                              : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-indigo-200'
                          }`}
                      >
                          <div className={`text-xs font-bold uppercase mb-1 ${
                              status === 'All' ? 'text-slate-500' : 
                              status === 'Pending' ? 'text-orange-500' :
                              status === 'Approved' ? 'text-green-500' : 'text-red-500'
                          }`}>{status} Requests</div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                              {status === 'All' ? requests.length : requests.filter(r => r.status === status).length}
                          </div>
                      </button>
                  ))}
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[400px]">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                          <tr>
                              <th className="px-6 py-4">Request Type</th>
                              <th className="px-6 py-4">Clinic & Requester</th>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Details</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                          {filteredRequests.map(req => (
                              <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{req.type}</td>
                                  <td className="px-6 py-4">
                                      <div className="font-medium text-slate-900 dark:text-white">{req.clinicName}</div>
                                      <div className="text-xs text-slate-500">{req.requesterName}</div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-500">{req.date}</td>
                                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={req.details}>{req.details}</td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                                          req.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                          req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                          'bg-red-100 text-red-700'
                                      }`}>
                                          {req.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      {req.status === 'Pending' && (
                                          <div className="flex justify-end gap-2">
                                              <button onClick={() => handleApproveRequest(req.id)} disabled={isProcessing === req.id} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50" title="Approve">
                                                  {isProcessing === req.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />}
                                              </button>
                                              <button onClick={() => handleRejectRequest(req.id)} disabled={isProcessing === req.id} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50" title="Reject">
                                                  {isProcessing === req.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <X className="w-4 h-4" />}
                                              </button>
                                          </div>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {filteredRequests.length === 0 && <div className="p-8 text-center text-slate-400">No requests found.</div>}
              </div>
          </div>
      );
  };

  const renderClinics = () => {
    const filteredClinics = clinics.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(clinicSearch.toLowerCase()) || c.email.toLowerCase().includes(clinicSearch.toLowerCase());
        const matchesStatus = clinicStatusFilter === 'All' || c.status === clinicStatusFilter;
        const matchesPlan = clinicPlanFilter === 'All' || c.plan === clinicPlanFilter;
        return matchesSearch && matchesStatus && matchesPlan;
    });

    return (
      <div className="space-y-6 animate-in fade-in">
          {/* Controls */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <div className="relative min-w-[240px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        placeholder="Search clinics by name or email..." 
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm outline-none dark:text-white"
                        value={clinicSearch}
                        onChange={(e) => setClinicSearch(e.target.value)}
                      />
                  </div>
                  <div className="relative">
                       <select 
                           value={clinicPlanFilter}
                           onChange={(e) => setClinicPlanFilter(e.target.value as any)}
                           className="appearance-none bg-slate-50 dark:bg-slate-700 px-4 py-2.5 pr-8 rounded-xl text-sm font-medium outline-none dark:text-white cursor-pointer"
                       >
                           <option value="All">All Plans</option>
                           <option value="Free">Free</option>
                           <option value="Pro">Pro</option>
                           <option value="Enterprise">Enterprise</option>
                       </select>
                       <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                   <div className="relative">
                       <select 
                           value={clinicStatusFilter}
                           onChange={(e) => setClinicStatusFilter(e.target.value as any)}
                           className="appearance-none bg-slate-50 dark:bg-slate-700 px-4 py-2.5 pr-8 rounded-xl text-sm font-medium outline-none dark:text-white cursor-pointer"
                       >
                           <option value="All">All Status</option>
                           <option value="Active">Active</option>
                           <option value="Suspended">Suspended</option>
                       </select>
                       <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
             </div>
             <div className="flex gap-3">
                 <button 
                    onClick={() => exportToCSV(filteredClinics, 'clinics_export')}
                    className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl"
                >
                     <Download className="w-4 h-4" /> Export
                 </button>
                 <button 
                    onClick={() => setShowAddClinic(true)}
                    className="flex items-center gap-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                     <Plus className="w-4 h-4" /> Add Clinic
                 </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-visible min-h-[400px]">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                          <tr>
                              <th className="px-6 py-4">Clinic Name</th>
                              <th className="px-6 py-4">Plan</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Revenue YTD</th>
                              <th className="px-6 py-4">Joined</th>
                              <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                          {filteredClinics.map(clinic => (
                              <tr key={clinic.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                  <td className="px-6 py-4">
                                      <div className="font-bold text-slate-900 dark:text-white">{clinic.name}</div>
                                      <div className="text-xs text-slate-500">{clinic.email}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                          clinic.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
                                          clinic.plan === 'Pro' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' :
                                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                      }`}>
                                          {clinic.plan}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold ${
                                          clinic.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 
                                          clinic.status === 'Suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' : 'bg-amber-100 text-amber-700'
                                      }`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${clinic.status === 'Active' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                          {clinic.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 font-mono font-medium">KSh {clinic.revenueYTD.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-slate-500">{clinic.joinedDate}</td>
                                  <td className="px-6 py-4 text-right relative">
                                      <button onClick={() => setActionMenuOpenId(actionMenuOpenId === clinic.id ? null : clinic.id)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                          <MoreHorizontal className="w-5 h-5"/>
                                      </button>
                                      
                                      {/* Dropdown Menu */}
                                      {actionMenuOpenId === clinic.id && (
                                          <div className="absolute right-8 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 animate-in zoom-in-95 origin-top-right">
                                              <div className="p-1">
                                                  <button onClick={() => { setSelectedClinic(clinic); setActionMenuOpenId(null); }} className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2">
                                                      <Eye className="w-4 h-4" /> View Details
                                                  </button>
                                                  <button onClick={() => handleEmailOwner(clinic.email)} className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2">
                                                      <Mail className="w-4 h-4" /> Email Owner
                                                  </button>
                                                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                                  <button onClick={() => handleSuspendClinic(clinic.id)} className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg flex items-center gap-2 font-medium">
                                                      <AlertTriangle className="w-4 h-4" /> {clinic.status === 'Active' ? 'Suspend' : 'Activate'}
                                                  </button>
                                                  <button onClick={() => handleDeleteClinic(clinic.id)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 font-medium">
                                                      <Trash2 className="w-4 h-4" /> Delete Clinic
                                                  </button>
                                              </div>
                                          </div>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {filteredClinics.length === 0 && <div className="p-8 text-center text-slate-400">No clinics found matching filters.</div>}
              </div>

              {/* Plan Distribution Chart */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-slate-400"/> Subscription Plans
                  </h4>
                  <div className="h-48 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie 
                                  data={planDistribution}
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {planDistribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                  ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}} />
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="font-bold text-slate-900 dark:text-white text-xl">{clinics.length}</span>
                      </div>
                  </div>
                  <div className="space-y-2 mt-2">
                      {planDistribution.map(p => (
                          <div key={p.name} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></span>
                                  {p.name}
                              </div>
                              <span className="font-bold">{p.value}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Clinic Detail Slide-over / Modal */}
          {selectedClinic && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-700/50">
                          <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedClinic.name}</h3>
                              <p className="text-sm text-slate-500">Tenant ID: {selectedClinic.id}</p>
                          </div>
                          <button onClick={() => setSelectedClinic(null)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button>
                      </div>
                      
                      <div className="p-6 space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                   <div className="text-xs font-bold text-slate-500 uppercase">Owner</div>
                                   <div className="font-bold text-slate-900 dark:text-white">{selectedClinic.ownerName}</div>
                                   <div className="text-sm text-slate-500">{selectedClinic.email}</div>
                               </div>
                               <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                   <div className="text-xs font-bold text-slate-500 uppercase">Subscription</div>
                                   <div className="font-bold text-indigo-600">{selectedClinic.plan}</div>
                                   <div className="text-sm text-slate-500">Next Bill: {selectedClinic.nextPaymentDate}</div>
                               </div>
                           </div>

                           <div>
                               <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">Revenue History (YTD)</h4>
                               <div className="h-48 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                   <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            {name: 'Q1', val: selectedClinic.revenueYTD * 0.2},
                                            {name: 'Q2', val: selectedClinic.revenueYTD * 0.3},
                                            {name: 'Q3', val: selectedClinic.revenueYTD * 0.4},
                                            {name: 'Q4', val: selectedClinic.revenueYTD * 0.1}, 
                                        ]}>
                                            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} strokeDasharray="3 3"/>
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff'}} />
                                            <Bar dataKey="val" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                   </ResponsiveContainer>
                               </div>
                           </div>
                           
                           <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                <button 
                                    onClick={() => handleResetPassword(selectedClinic.email)}
                                    disabled={isProcessing === 'reset-pwd'}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isProcessing === 'reset-pwd' ? <Loader2 className="w-4 h-4 animate-spin"/> : <KeyRound className="w-4 h-4"/>} 
                                    Reset Password
                                </button>
                                <button 
                                    onClick={() => handleImpersonate(selectedClinic)}
                                    disabled={isProcessing === 'impersonate'}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isProcessing === 'impersonate' ? <Loader2 className="w-4 h-4 animate-spin"/> : <ArrowUpRight className="w-4 h-4" />} 
                                    Login as Admin
                                </button>
                           </div>
                      </div>
                  </div>
              </div>
          )}
      </div>
    );
  };

  const renderPayments = () => {
      // -- Helper Renderers --
      const renderTransactions = () => {
          const filteredTransactions = transactions.filter(t => {
              const matchesSearch = t.id.toLowerCase().includes(transactionSearch.toLowerCase()) || t.clinicName.toLowerCase().includes(transactionSearch.toLowerCase());
              const matchesStatus = transactionStatusFilter === 'All' || t.status === transactionStatusFilter;
              return matchesSearch && matchesStatus;
          });

          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    placeholder="Search..." 
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm outline-none dark:text-white"
                                    value={transactionSearch}
                                    onChange={(e) => setTransactionSearch(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <select 
                                    value={transactionStatusFilter}
                                    onChange={(e) => setTransactionStatusFilter(e.target.value as any)}
                                    className="appearance-none bg-slate-50 dark:bg-slate-700 px-4 py-2 pr-8 rounded-xl text-sm font-medium outline-none dark:text-white cursor-pointer h-full"
                                >
                                    <option value="All">All</option>
                                    <option value="Success">Success</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Failed">Failed</option>
                                </select>
                                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                            </div>
                            <button 
                                onClick={() => exportToCSV(filteredTransactions, 'transactions_export')}
                                className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                title="Export CSV"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">ID / Date</th>
                                    <th className="px-6 py-4">Clinic</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                {filteredTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-slate-500 text-xs">{tx.id}</div>
                                            <div className="text-slate-900 dark:text-white text-xs">{tx.date}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 dark:text-white text-sm">{tx.clinicName}</div>
                                            <div className="text-xs text-slate-400">{tx.plan} Plan • {tx.method}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">KSh {tx.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                                tx.status === 'Success' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' : 
                                                tx.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900' : 
                                                'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-600" title="Download Invoice">
                                                    <FileText className="w-4 h-4"/>
                                                </button>
                                                {tx.status === 'Success' && (
                                                    <button onClick={() => handleRefund(tx.id)} disabled={isProcessing === tx.id} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500" title="Process Refund">
                                                        {isProcessing === tx.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Undo2 className="w-4 h-4"/>}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTransactions.length === 0 && <div className="p-8 text-center text-slate-400">No transactions found.</div>}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col h-full">
                    <div className="mb-6">
                        <h4 className="font-bold text-slate-900 dark:text-white">Revenue Trend</h4>
                        <p className="text-xs text-slate-500">6 Month Performance</p>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={recentRevenue}>
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} strokeDasharray="3 3"/>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px'}} />
                                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-500">Projected (Next Month)</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">~ KSh 45k</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 w-[75%] h-full rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
          );
      };

      const renderSubscriptions = () => {
          return (
              <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <RefreshCw className="w-5 h-5 text-slate-400" /> Active Subscriptions
                          </h3>
                          <button 
                            onClick={() => setShowRecordPayment(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                          >
                              <Plus className="w-4 h-4"/> Record Payment
                          </button>
                      </div>
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-400 font-semibold">
                              <tr>
                                  <th className="px-6 py-4">Clinic</th>
                                  <th className="px-6 py-4">Plan</th>
                                  <th className="px-6 py-4">Cost</th>
                                  <th className="px-6 py-4">Last Paid</th>
                                  <th className="px-6 py-4">Next Due</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                              {clinics.filter(c => c.plan !== 'Free').map(clinic => {
                                  const planCost = platformSettings.pricing[clinic.plan.toLowerCase() as keyof typeof platformSettings.pricing];
                                  const isOverdue = clinic.nextPaymentDate !== '-' && new Date(clinic.nextPaymentDate) < new Date();
                                  
                                  return (
                                      <tr key={clinic.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{clinic.name}</td>
                                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{clinic.plan}</td>
                                          <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">KSh {planCost.toLocaleString()}</td>
                                          <td className="px-6 py-4 text-slate-500 text-xs">{clinic.lastPaymentDate}</td>
                                          <td className="px-6 py-4 text-slate-500 text-xs">{clinic.nextPaymentDate}</td>
                                          <td className="px-6 py-4">
                                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                                  isOverdue 
                                                  ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900' 
                                                  : 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900'
                                              }`}>
                                                  {isOverdue ? 'Overdue' : 'Active'}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <div className="flex justify-end gap-2">
                                                  <button 
                                                    className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 hover:text-indigo-600 transition-colors" 
                                                    title="Generate Invoice"
                                                    onClick={() => showNotification('Invoice generated and sent to admin email.', 'success')}
                                                  >
                                                      <Receipt className="w-4 h-4"/>
                                                  </button>
                                                  <button 
                                                    onClick={() => {
                                                        setRecordPaymentForm({ ...recordPaymentForm, clinicId: clinic.id, amount: planCost.toString() });
                                                        setShowRecordPayment(true);
                                                    }}
                                                    className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 hover:bg-indigo-100 transition-colors" 
                                                    title="Pay"
                                                  >
                                                      <CreditCard className="w-4 h-4"/>
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  );
                              })}
                              {clinics.filter(c => c.plan !== 'Free').length === 0 && (
                                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No active paid subscriptions.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          );
      };

      const renderGateways = () => {
          return (
              <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* M-Pesa Config */}
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3 mb-6">
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
                                  <Smartphone className="w-6 h-6" />
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mobile Money (M-Pesa)</h3>
                          </div>
                          
                          <div className="space-y-4">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Paybill Number</label>
                                  <input 
                                    value={gatewayConfig.mpesa.paybill}
                                    onChange={(e) => setGatewayConfig({...gatewayConfig, mpesa: {...gatewayConfig.mpesa, paybill: e.target.value}})}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none font-mono dark:text-white" 
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Account Name</label>
                                  <input 
                                    value={gatewayConfig.mpesa.account}
                                    onChange={(e) => setGatewayConfig({...gatewayConfig, mpesa: {...gatewayConfig.mpesa, account: e.target.value}})}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white" 
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Business Name Display</label>
                                  <input 
                                    value={gatewayConfig.mpesa.name}
                                    onChange={(e) => setGatewayConfig({...gatewayConfig, mpesa: {...gatewayConfig.mpesa, name: e.target.value}})}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white" 
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Bank Config */}
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3 mb-6">
                              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                                  <Landmark className="w-6 h-6" />
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bank Transfer</h3>
                          </div>
                          
                          <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Bank Name</label>
                                      <input 
                                        value={gatewayConfig.bank.name}
                                        onChange={(e) => setGatewayConfig({...gatewayConfig, bank: {...gatewayConfig.bank, name: e.target.value}})}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white" 
                                      />
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Branch</label>
                                      <input 
                                        value={gatewayConfig.bank.branch}
                                        onChange={(e) => setGatewayConfig({...gatewayConfig, bank: {...gatewayConfig.bank, branch: e.target.value}})}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white" 
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Account Number</label>
                                  <input 
                                    value={gatewayConfig.bank.account}
                                    onChange={(e) => setGatewayConfig({...gatewayConfig, bank: {...gatewayConfig.bank, account: e.target.value}})}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none font-mono dark:text-white" 
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Swift Code</label>
                                  <input 
                                    value={gatewayConfig.bank.swift}
                                    onChange={(e) => setGatewayConfig({...gatewayConfig, bank: {...gatewayConfig.bank, swift: e.target.value}})}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none font-mono dark:text-white" 
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex justify-end">
                      <button 
                        onClick={handleSaveGateways}
                        disabled={isProcessing === 'save-gateways'}
                        className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                      >
                          {isProcessing === 'save-gateways' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                          Save Gateway Configuration
                      </button>
                  </div>
              </div>
          );
      };

      return (
        <div className="space-y-6">
            {/* Payment Sub Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto">
                <button onClick={() => setPaymentsSubTab('transactions')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${paymentsSubTab === 'transactions' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>Transactions</button>
                <button onClick={() => setPaymentsSubTab('subscriptions')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${paymentsSubTab === 'subscriptions' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>Subscriptions</button>
                <button onClick={() => setPaymentsSubTab('gateways')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${paymentsSubTab === 'gateways' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>Payment Settings</button>
            </div>

            {/* Stats Cards (Always Visible in Payments Tab) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Volume</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">KSh {transactions.reduce((a,b) => a+b.amount, 0).toLocaleString()}</h3>
                        <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
                            <span className="bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-xs">↑ 8.5%</span>
                            <span className="text-slate-400 font-normal ml-1">vs last month</span>
                        </div>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                        <CreditCard className="w-6 h-6"/>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Success Rate</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-1">
                            {Math.round((transactions.filter(t => t.status === 'Success').length / transactions.length) * 100)}%
                        </h3>
                        <p className="text-xs text-slate-400 mt-2">{transactions.filter(t => t.status === 'Success').length} completed</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
                        <CheckCircle className="w-6 h-6"/>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Failed / Pending</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{transactions.filter(t => t.status === 'Failed' || t.status === 'Pending').length}</h3>
                        <p className="text-xs text-red-500 font-medium mt-2">Action required</p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl">
                        <AlertTriangle className="w-6 h-6"/>
                    </div>
                </div>
            </div>

            {/* Content Switched by SubTab */}
            {paymentsSubTab === 'transactions' && renderTransactions()}
            {paymentsSubTab === 'subscriptions' && renderSubscriptions()}
            {paymentsSubTab === 'gateways' && renderGateways()}
        </div>
      );
  }

  const renderSettings = () => (
      <div className="space-y-6 animate-in fade-in">
          {/* Sub Navigation */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto">
                <button onClick={() => setSettingsSubTab('general')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${settingsSubTab === 'general' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>Configuration</button>
                <button onClick={() => setSettingsSubTab('pricing')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${settingsSubTab === 'pricing' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>Pricing Models</button>
                <button onClick={() => setSettingsSubTab('logs')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${settingsSubTab === 'logs' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>System Logs</button>
                <button onClick={() => setSettingsSubTab('backups')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${settingsSubTab === 'backups' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>Database & Backups</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* General SaaS Config */}
              {settingsSubTab === 'general' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit lg:col-span-2">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-slate-400" /> Platform Configuration
                    </h3>
                    
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">Maintenance Mode</div>
                                <div className="text-xs text-slate-500">Suspends all clinic access for updates.</div>
                            </div>
                            <button onClick={() => toggleSettings('maintenanceMode')} className={`text-2xl transition-colors ${platformSettings.maintenanceMode ? 'text-indigo-600' : 'text-slate-300'}`}>
                                {platformSettings.maintenanceMode ? <ToggleRight className="w-10 h-10"/> : <ToggleLeft className="w-10 h-10"/>}
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">Allow New Registrations</div>
                                <div className="text-xs text-slate-500">Public sign-up page visibility.</div>
                            </div>
                            <button onClick={() => toggleSettings('allowNewRegistrations')} className={`text-2xl transition-colors ${platformSettings.allowNewRegistrations ? 'text-indigo-600' : 'text-slate-300'}`}>
                                {platformSettings.allowNewRegistrations ? <ToggleRight className="w-10 h-10"/> : <ToggleLeft className="w-10 h-10"/>}
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Global Announcement</label>
                            <textarea 
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none text-sm dark:text-white"
                                rows={3}
                                placeholder="Message to display on all clinic dashboards..."
                                value={platformSettings.globalAnnouncement}
                                onChange={(e) => setPlatformSettings({...platformSettings, globalAnnouncement: e.target.value})}
                            />
                        </div>

                        <button 
                            onClick={handleSaveSettings}
                            disabled={isProcessing === 'save-settings'}
                            className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isProcessing === 'save-settings' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                            Save Configuration
                        </button>
                    </div>
                </div>
              )}

              {/* Pricing Config */}
              {settingsSubTab === 'pricing' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-slate-400" /> Pricing Tiers (KSh)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Free Tier</label>
                            <input type="number" value={platformSettings.pricing.free} disabled className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-500 cursor-not-allowed" />
                        </div>
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Pro Tier</label>
                            <input 
                                type="number" 
                                value={platformSettings.pricing.pro}
                                onChange={(e) => setPlatformSettings({...platformSettings, pricing: {...platformSettings.pricing, pro: parseInt(e.target.value)}})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" 
                            />
                        </div>
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Enterprise Tier</label>
                            <input 
                                type="number" 
                                value={platformSettings.pricing.enterprise}
                                onChange={(e) => setPlatformSettings({...platformSettings, pricing: {...platformSettings.pricing, enterprise: parseInt(e.target.value)}})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" 
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleSavePricing}
                        disabled={isProcessing === 'save-pricing'}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing === 'save-pricing' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                        Save Pricing Changes
                    </button>
                </div>
              )}

              {/* Logs */}
              {settingsSubTab === 'logs' && (
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-slate-400" /> System Audit Logs
                      </h3>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                                  <tr>
                                      <th className="px-6 py-4">Timestamp</th>
                                      <th className="px-6 py-4">Action</th>
                                      <th className="px-6 py-4">Initiated By</th>
                                      <th className="px-6 py-4">Target</th>
                                      <th className="px-6 py-4">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                  {systemLogs.map(log => (
                                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{log.action}</td>
                                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{log.admin}</td>
                                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{log.target}</td>
                                          <td className="px-6 py-4">
                                              <span className={`text-xs font-bold ${
                                                  log.status === 'Success' ? 'text-green-600' :
                                                  log.status === 'Warning' ? 'text-orange-600' : 'text-red-600'
                                              }`}>{log.status}</span>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* Backups */}
              {settingsSubTab === 'backups' && (
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Database className="w-5 h-5 text-slate-400" /> Database Snapshots
                          </h3>
                          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">Trigger Backup Now</button>
                      </div>
                      
                      <div className="space-y-4">
                          {[
                              { id: '1', date: 'Oct 28, 2023 02:00 AM', size: '2.4 GB', type: 'Automated' },
                              { id: '2', date: 'Oct 27, 2023 02:00 AM', size: '2.3 GB', type: 'Automated' },
                              { id: '3', date: 'Oct 26, 2023 04:15 PM', size: '2.3 GB', type: 'Manual' },
                          ].map(backup => (
                              <div key={backup.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                  <div className="flex items-center gap-4">
                                      <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500">
                                          <Database className="w-5 h-5"/>
                                      </div>
                                      <div>
                                          <div className="font-bold text-slate-900 dark:text-white text-sm">{backup.date}</div>
                                          <div className="text-xs text-slate-500">{backup.type} • {backup.size}</div>
                                      </div>
                                  </div>
                                  <button className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1">
                                      <RefreshCw className="w-3 h-3"/> Restore
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <Shield className="w-8 h-8 text-indigo-600"/> Super Admin Portal
                 </h2>
                 <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {activeTab === 'overview' && 'System Overview'}
                    {activeTab === 'clinics' && 'Tenant Management'}
                    {activeTab === 'approvals' && 'Pending Requests'}
                    {activeTab === 'payments' && 'Financial Transactions & Subscriptions'}
                    {activeTab === 'settings' && 'Global Configuration'}
                 </p>
            </div>
            
            {/* User Profile / Switcher */}
            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                    <div className="text-xs text-indigo-600 font-bold">System Owner</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-200 dark:shadow-none">SO</div>
            </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'clinics' && renderClinics()}
            {activeTab === 'approvals' && renderApprovals()} 
            {activeTab === 'payments' && renderPayments()}
            {activeTab === 'settings' && renderSettings()}
        </div>

        {/* --- MODALS --- */}

        {/* Record Payment Modal */}
        {showRecordPayment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-600" /> Record Offline Payment
                        </h3>
                        <button onClick={() => setShowRecordPayment(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Clinic</label>
                            <select 
                                value={recordPaymentForm.clinicId} 
                                onChange={(e) => {
                                    const cId = e.target.value;
                                    const c = clinics.find(c => c.id === cId);
                                    const planCost = c ? platformSettings.pricing[c.plan.toLowerCase() as keyof typeof platformSettings.pricing] : 0;
                                    setRecordPaymentForm({...recordPaymentForm, clinicId: cId, amount: planCost ? planCost.toString() : ''});
                                }}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            >
                                <option value="">-- Select Clinic --</option>
                                {clinics.filter(c => c.plan !== 'Free').map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.plan})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Amount (KSh)</label>
                            <input 
                                type="number"
                                value={recordPaymentForm.amount} 
                                onChange={(e) => setRecordPaymentForm({...recordPaymentForm, amount: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                placeholder="5000"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Payment Method</label>
                            <select 
                                value={recordPaymentForm.method} 
                                onChange={(e) => setRecordPaymentForm({...recordPaymentForm, method: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            >
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="Cheque">Cheque</option>
                                <option value="M-Pesa">M-Pesa (Manual)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Reference ID (Optional)</label>
                            <input 
                                value={recordPaymentForm.ref} 
                                onChange={(e) => setRecordPaymentForm({...recordPaymentForm, ref: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                placeholder="Transaction Ref"
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowRecordPayment(false)} className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                            <button 
                                onClick={handleRecordPayment}
                                disabled={isProcessing === 'record-payment' || !recordPaymentForm.clinicId || !recordPaymentForm.amount}
                                className="flex-1 py-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing === 'record-payment' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />} Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Add Clinic Modal */}
        {showAddClinic && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-600" /> Provision New Clinic
                        </h3>
                        <button onClick={() => setShowAddClinic(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Clinic Name</label>
                            <input 
                                value={newClinicForm.name} 
                                onChange={(e) => setNewClinicForm({...newClinicForm, name: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                placeholder="e.g. City Health Center"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Admin Owner Name</label>
                            <input 
                                value={newClinicForm.owner} 
                                onChange={(e) => setNewClinicForm({...newClinicForm, owner: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                placeholder="e.g. Dr. John Doe"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Admin Email</label>
                            <input 
                                value={newClinicForm.email} 
                                onChange={(e) => setNewClinicForm({...newClinicForm, email: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                placeholder="admin@clinic.com"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Initial Plan</label>
                            <select 
                                value={newClinicForm.plan}
                                onChange={(e) => setNewClinicForm({...newClinicForm, plan: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            >
                                <option value="Free">Free</option>
                                <option value="Pro">Pro</option>
                                <option value="Enterprise">Enterprise</option>
                            </select>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowAddClinic(false)} className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                            <button 
                                onClick={handleProvisionNewClinic}
                                disabled={isProcessing === 'add-clinic' || !newClinicForm.name}
                                className="flex-1 py-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing === 'add-clinic' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />} Create Clinic
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Broadcast Modal */}
        {showBroadcast && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-teal-600" /> Broadcast System Alert
                        </h3>
                        <button onClick={() => setShowBroadcast(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">This message will be visible on the dashboard of ALL clinics.</p>
                    <textarea 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none text-sm dark:text-white h-32"
                        placeholder="e.g., System maintenance scheduled for Saturday 2 AM..."
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        autoFocus
                    />
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowBroadcast(false)} className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                        <button 
                            onClick={handleBroadcast}
                            disabled={isProcessing === 'broadcast' || !broadcastMsg}
                            className="flex-1 py-3 font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isProcessing === 'broadcast' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4" />} Publish
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Toast Notification */}
        {toast && (
            <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 z-[60] ${
                toast.type === 'success' ? 'bg-white dark:bg-slate-800 border-green-500 text-green-600' :
                toast.type === 'error' ? 'bg-white dark:bg-slate-800 border-red-500 text-red-600' :
                'bg-white dark:bg-slate-800 border-indigo-500 text-indigo-600'
            }`}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
                 toast.type === 'error' ? <XCircle className="w-5 h-5" /> : 
                 <Activity className="w-5 h-5" />}
                <span className="font-bold text-sm">{toast.message}</span>
            </div>
        )}
    </div>
  );
};

export default SuperAdminDashboard;
