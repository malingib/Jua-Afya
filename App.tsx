
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import Appointments from './components/Appointments';
import Pharmacy from './components/Pharmacy';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Profile from './components/Profile';
import ChatBot from './components/ChatBot';
import BulkSMS from './components/BulkSMS';
import PatientQueue from './components/PatientQueue';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import WhatsAppAgent from './components/WhatsAppAgent';
import Login from './components/Login';
import { ViewState, Patient, Appointment, InventoryItem, ClinicSettings, Notification, Supplier, InventoryLog, Visit, VisitPriority, TeamMember } from './types';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_INVENTORY, MOCK_SUPPLIERS, MOCK_LOGS, MOCK_VISITS } from './constants';
import { CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { db } from './services/db';

// Dedicated System Owner User (Not part of any clinic)
const SYSTEM_ADMIN: TeamMember = {
  id: 'sys-owner',
  name: 'System Owner',
  email: 'admin@juaafya-saas.com',
  phone: '+254700000000',
  role: 'SuperAdmin',
  status: 'Active',
  lastActive: 'Now',
  avatar: 'https://ui-avatars.com/api/?name=System+Owner&background=312e81&color=fff'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // -- Theme Persistence --
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // -- App Data State --
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(MOCK_LOGS); // Keep local/mock for logs for now to save DB space
  const [visits, setVisits] = useState<Visit[]>([]);
  
  const [settings, setSettings] = useState<ClinicSettings>({
      name: 'JuaAfya Medical Centre',
      phone: '+254 712 345 678',
      email: 'admin@juaafya.com',
      location: 'Nairobi, Kenya',
      currency: 'KSh',
      language: 'English',
      timezone: 'EAT (GMT+3)',
      smsEnabled: true,
      logo: '',
      notifications: {
          appointmentReminders: true,
          lowStockAlerts: true,
          dailyReports: false,
          marketingEmails: false,
          alertEmail: 'admin@juaafya.com'
      },
      security: {
          twoFactorEnabled: false,
          lastPasswordChange: '2023-09-15'
      },
      billing: {
          plan: 'Pro',
          status: 'Active',
          nextBillingDate: '2023-11-01',
          paymentMethod: {
              type: 'Card',
              last4: '4242',
              brand: 'Visa',
              expiry: '12/25'
          }
      },
      team: [
        { id: '1', name: 'Dr. Andrew Kimani', email: 'andrew@juaafya.com', phone: '+254712345678', role: 'Admin', status: 'Active', lastActive: 'Now', avatar: 'https://i.pravatar.cc/150?img=11' },
        { id: '2', name: 'Sarah Wanjiku', email: 'sarah@juaafya.com', phone: '+254722987654', role: 'Nurse', status: 'Active', lastActive: '2h ago', avatar: 'https://i.pravatar.cc/150?img=5' },
        { id: '3', name: 'John Omondi', email: 'john@juaafya.com', phone: '+254733111222', role: 'Doctor', status: 'Active', lastActive: '5m ago', avatar: 'https://i.pravatar.cc/150?img=12' },
        { id: '4', name: 'Grace M.', email: 'grace@juaafya.com', phone: '+254700123456', role: 'Receptionist', status: 'Active', lastActive: 'Now', avatar: 'https://i.pravatar.cc/150?img=9' },
        { id: '5', name: 'Peter K.', email: 'peter@juaafya.com', phone: '+254799888777', role: 'Lab Tech', status: 'Active', lastActive: '10m ago', avatar: 'https://i.pravatar.cc/150?img=8' }
      ]
  });

  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);

  // -- Data Fetching --
  const fetchData = async () => {
      try {
          const [pts, inv, appts, vis, sups] = await Promise.all([
              db.getPatients(),
              db.getInventory(),
              db.getAppointments(),
              db.getVisits(),
              db.getSuppliers()
          ]);
          setPatients(pts);
          setInventory(inv);
          setAppointments(appts);
          setVisits(vis);
          setSuppliers(sups);
      } catch (e) {
          console.error("Failed to fetch initial data", e);
          showToast("Offline Mode: Using local/cached data", 'info');
          // Fallback handled in db service or use MOCK_CONSTANTS here if critical
      }
  };

  // -- Auth Listener --
  useEffect(() => {
      const initApp = async () => {
          setIsAppLoading(true);
          
          // 1. Check Supabase Session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
              const user: TeamMember = {
                  id: session.user.id,
                  name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  role: (session.user.user_metadata.role as any) || 'Admin',
                  status: 'Active',
                  lastActive: 'Now'
              };
              setCurrentUser(user);
              await fetchData();
          } else {
              // 2. Check Local Storage for Demo User
              const storedUser = localStorage.getItem('juaafya_demo_user');
              if (storedUser) {
                  try {
                      setCurrentUser(JSON.parse(storedUser));
                      await fetchData();
                  } catch (e) {
                      localStorage.removeItem('juaafya_demo_user');
                  }
              }
          }
          setIsAppLoading(false);
      };

      initApp();

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
               // Reload data on fresh login
               const user: TeamMember = {
                  id: session.user.id,
                  name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  role: (session.user.user_metadata.role as any) || 'Admin',
                  status: 'Active',
                  lastActive: 'Now'
              };
              setCurrentUser(user);
              await fetchData();
          } else if (event === 'SIGNED_OUT') {
              // Only clear if we are not in persistent demo mode (though handleLogout covers this mostly)
              // If signed out from Supabase, we should likely clear everything
              // But manual logout triggers this.
          }
      });

      return () => {
          authListener.subscription.unsubscribe();
      };
  }, []);

  const handleLogin = (member: TeamMember) => {
      setCurrentUser(member);
      // Persist demo user to avoid session loss on refresh
      localStorage.setItem('juaafya_demo_user', JSON.stringify(member));
      
      fetchData(); // Fetch data if simulated login
      
      // Determine default view based on role
      if (member.role === 'SuperAdmin') setCurrentView('sa-overview');
      else if (member.role === 'Doctor') setCurrentView('consultation');
      else if (member.role === 'Nurse') setCurrentView('triage');
      else if (member.role === 'Receptionist') setCurrentView('reception');
      else setCurrentView('dashboard');
      
      showToast(`Welcome back, ${member.name.split(' ')[0]}!`);
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('juaafya_demo_user');
      setCurrentUser(null);
      setPatients([]); // Clear sensitive data
      showToast('You have been logged out.', 'info');
  };

  const switchUser = (member: TeamMember) => {
      setCurrentUser(member);
      // Update persistent storage if switching demo users
      localStorage.setItem('juaafya_demo_user', JSON.stringify(member));
      
      if (member.role === 'SuperAdmin') setCurrentView('sa-overview');
      else setCurrentView('dashboard');
      showToast(`Switched to ${member.name} (${member.role})`);
  };

  const lowStockCount = inventory.filter(i => i.stock <= i.minStockLevel).length;

  const [toasts, setToasts] = useState<Notification[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
  };

  // -- CRUD Handlers (Connected to DB) --

  const addPatient = async (patient: Patient) => {
    try {
        await db.createPatient(patient);
        setPatients(prev => [patient, ...prev]);
        showToast(`Patient ${patient.name} added successfully!`);
    } catch (e) {
        showToast("Error adding patient", 'error');
    }
  };

  const updatePatient = async (updatedPatient: Patient) => {
    try {
        await db.updatePatient(updatedPatient);
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        showToast(`Patient record updated.`);
    } catch (e) {
        showToast("Error updating patient", 'error');
    }
  };

  const deletePatient = async (id: string) => {
    try {
        await db.deletePatient(id);
        setPatients(prev => prev.filter(p => p.id !== id));
        showToast(`Patient deleted.`, 'info');
    } catch (e) {
        showToast("Error deleting patient", 'error');
    }
  };

  // -- Inventory Handlers --
  const logInventoryAction = (item: InventoryItem, action: InventoryLog['action'], quantityChange: number, notes: string) => {
      const log: InventoryLog = {
          id: `LOG-${Date.now()}`,
          itemId: item.id,
          itemName: item.name,
          action,
          quantityChange,
          notes,
          timestamp: new Date().toISOString(),
          user: currentUser?.name || 'System'
      };
      setInventoryLogs(prev => [log, ...prev]);
  };

  const addInventoryItem = async (item: InventoryItem) => {
    try {
        await db.createInventoryItem(item);
        setInventory(prev => [item, ...prev]);
        logInventoryAction(item, 'Created', item.stock, 'Initial stock entry');
        showToast(`${item.name} added to inventory.`);
    } catch (e) {
        showToast('Error creating item', 'error');
    }
  };

  const updateInventoryItem = async (updatedItem: InventoryItem, reason = 'Updated details') => {
      try {
          await db.updateInventoryItem(updatedItem);
          const oldItem = inventory.find(i => i.id === updatedItem.id);
          const stockDiff = updatedItem.stock - (oldItem?.stock || 0);
          
          if (stockDiff !== 0) {
              logInventoryAction(updatedItem, stockDiff > 0 ? 'Restocked' : 'Dispensed', stockDiff, reason);
          } else {
              logInventoryAction(updatedItem, 'Updated', 0, reason);
          }
          
          setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
          showToast(`${updatedItem.name} updated.`);
      } catch (e) {
          showToast('Error updating item', 'error');
      }
  };

  const deleteInventoryItem = async (id: string) => {
      try {
          await db.deleteInventoryItem(id);
          const item = inventory.find(i => i.id === id);
          if (item) logInventoryAction(item, 'Deleted', -item.stock, 'Item removed');
          setInventory(prev => prev.filter(i => i.id !== id));
          showToast(`Item removed.`, 'info');
      } catch (e) {
          showToast('Error deleting item', 'error');
      }
  };

  // -- Supplier Handlers --
  const addSupplier = async (supplier: Supplier) => {
      try {
          await db.createSupplier(supplier);
          setSuppliers(prev => [...prev, supplier]);
          showToast('Supplier added successfully.');
      } catch (e) {
          showToast('Error adding supplier', 'error');
      }
  };

  const updateSupplier = (updated: Supplier) => {
      // DB update placeholder
      setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast('Supplier updated.');
  };

  const deleteSupplier = (id: string) => {
      // DB delete placeholder
      setSuppliers(prev => prev.filter(s => s.id !== id));
      setInventory(prev => prev.map(item => item.supplierId === id ? { ...item, supplierId: undefined } : item));
      showToast('Supplier removed.', 'info');
  };

  const addAppointment = async (newAppt: Appointment) => {
    try {
        await db.createAppointment(newAppt);
        setAppointments(prev => [...prev, newAppt]);
        showToast(`Appointment scheduled for ${newAppt.patientName}.`);
    } catch (e) {
        showToast('Error scheduling appointment', 'error');
    }
  };

  const updateAppointment = async (updatedAppt: Appointment) => {
    try {
        await db.updateAppointment(updatedAppt);
        setAppointments(prev => prev.map(a => a.id === updatedAppt.id ? updatedAppt : a));
    } catch (e) {
        showToast('Error updating appointment', 'error');
    }
  };

  const updateSettings = (newSettings: ClinicSettings) => {
      setSettings(newSettings);
      showToast('Settings saved successfully!');
  };

  // -- Visit Handlers --
  const addVisit = async (patientId: string, priority: VisitPriority = 'Normal', insurance?: any, skipVitals: boolean = false) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newVisit: Visit = {
      id: `V${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      stage: skipVitals ? 'Consultation' : 'Vitals',
      stageStartTime: new Date().toISOString(),
      startTime: new Date().toISOString(),
      queueNumber: visits.filter(v => v.stage !== 'Completed').length + 1,
      priority: priority,
      insuranceDetails: insurance,
      labOrders: [],
      prescription: [],
      medicationsDispensed: false,
      consultationFee: 500,
      totalBill: 500,
      paymentStatus: 'Pending'
    };
    
    try {
        await db.createVisit(newVisit);
        setVisits(prev => [...prev, newVisit]);
        showToast(`${patient.name} checked in.`);
    } catch (e) {
        showToast('Error checking in patient', 'error');
    }
  };

  const updateVisit = async (updatedVisit: Visit) => {
    try {
        await db.updateVisit(updatedVisit);
        setVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
    } catch (e) {
        showToast('Error updating visit', 'error');
    }
  };

  const dispensePrescription = async (visit: Visit) => {
      const updatedInventory = [...inventory];
      visit.prescription.forEach(med => {
          const itemIndex = updatedInventory.findIndex(i => i.id === med.inventoryId);
          if (itemIndex > -1) {
              const item = updatedInventory[itemIndex];
              const newStock = Math.max(0, item.stock - med.quantity);
              updatedInventory[itemIndex] = { ...item, stock: newStock };
              
              logInventoryAction(item, 'Dispensed', -med.quantity, `Prescription for ${visit.patientName}`);
              db.updateInventoryItem(updatedInventory[itemIndex]); // Async update
          }
      });
      setInventory(updatedInventory);

      const nextVisitState: Visit = { ...visit, medicationsDispensed: true, stage: 'Clearance', stageStartTime: new Date().toISOString() };
      await updateVisit(nextVisitState);
      showToast('Medications dispensed. Sent to Clearance.');
  };

  const completeVisit = async (visit: Visit) => {
      // Archive history
      const diagnosisText = visit.diagnosis ? `Dx: ${visit.diagnosis}` : 'No Diagnosis';
      const notesText = visit.doctorNotes ? `Notes: ${visit.doctorNotes}` : '';
      const summary = `[${visit.startTime.split('T')[0]}] ${diagnosisText}. ${notesText}`.trim();
      
      const patient = patients.find(p => p.id === visit.patientId);
      if (patient) {
          const updatedPatient = {
              ...patient,
              lastVisit: new Date().toISOString().split('T')[0],
              history: [summary, ...patient.history]
          };
          await updatePatient(updatedPatient);
      }

      await updateVisit({ ...visit, stage: 'Completed' });
      showToast('Visit finalized.', 'success');
  };

  const renderContent = () => {
    if (!currentUser) return null;

    const queueProps = {
        visits,
        patients,
        inventory,
        addVisit,
        updateVisit,
        onCompleteVisit: completeVisit
    };

    switch (currentView) {
      case 'dashboard':
        return <Dashboard appointments={appointments} inventory={inventory} patients={patients} setView={setCurrentView} onLogout={handleLogout} />;
      case 'reception':
        return <PatientQueue {...queueProps} restrictedStages={['Check-In', 'Clearance']} />;
      case 'triage':
        return <PatientQueue {...queueProps} restrictedStages={['Vitals']} />;
      case 'consultation':
        return <PatientQueue {...queueProps} restrictedStages={['Consultation']} />;
      case 'lab-work':
        return <PatientQueue {...queueProps} restrictedStages={['Lab']} />;
      case 'billing-desk':
        return <PatientQueue {...queueProps} restrictedStages={['Billing']} />;
      case 'sa-overview':
      case 'sa-clinics':
      case 'sa-approvals':
      case 'sa-payments':
      case 'sa-settings':
      case 'sa-support':
        const tab = currentView.replace('sa-', '') as any;
        return <SuperAdminDashboard currentUser={currentUser} switchUser={switchUser} team={settings.team} activeTab={tab} />;
      case 'patients':
        return <PatientList patients={patients} addPatient={addPatient} updatePatient={updatePatient} deletePatient={deletePatient} />;
      case 'appointments':
        return <Appointments appointments={appointments} patients={patients} addAppointment={addAppointment} updateAppointment={updateAppointment} showToast={showToast} />;
      case 'pharmacy':
        return (
            <Pharmacy 
                inventory={inventory} 
                suppliers={suppliers}
                logs={inventoryLogs}
                visits={visits}
                onDispense={dispensePrescription}
                addInventoryItem={addInventoryItem} 
                updateInventoryItem={updateInventoryItem} 
                deleteInventoryItem={deleteInventoryItem}
                addSupplier={addSupplier}
                updateSupplier={updateSupplier}
                deleteSupplier={deleteSupplier}
            />
        );
      case 'bulk-sms':
        return <BulkSMS patients={patients} showToast={showToast} />;
      case 'whatsapp-agent':
        return (
            <WhatsAppAgent 
                team={settings.team} 
                appointments={appointments} 
                inventory={inventory} 
                patients={patients} 
                settings={settings}
                addPatient={addPatient}
                updatePatient={updatePatient}
                deletePatient={deletePatient}
                addAppointment={addAppointment}
                updateAppointment={updateAppointment}
                updateInventoryItem={updateInventoryItem}
                deleteInventoryItem={deleteInventoryItem}
            />
        );
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings isDarkMode={darkMode} toggleTheme={toggleTheme} settings={settings} updateSettings={updateSettings} />;
      case 'profile':
        return <Profile />;
      default:
        return <PatientQueue {...queueProps} />;
    }
  };

  // Global Loading State
  if (isAppLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-brand-cream/50 dark:bg-brand-dark">
              <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-brand-dark dark:text-white font-bold animate-pulse">Initializing JuaAfya Cloud...</p>
              </div>
          </div>
      );
  }

  // Not Logged In
  if (!currentUser) {
      return (
          <>
            <Login onLogin={handleLogin} team={settings.team} systemAdmin={SYSTEM_ADMIN} />
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 no-print">
                {toasts.map(toast => (
                    <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
                        toast.type === 'success' ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400' :
                        toast.type === 'error' ? 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400' :
                        'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : toast.type === 'error' ? <X className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                ))}
            </div>
          </>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-200 font-sans">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        lowStockCount={lowStockCount} 
        currentUser={currentUser}
        switchUser={switchUser}
        team={settings.team}
        systemAdmin={SYSTEM_ADMIN}
        onLogout={handleLogout}
      />

      <main className="flex-1 md:ml-64 lg:ml-72 w-full transition-all duration-300">
        <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-10 flex items-center justify-between no-print">
           <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                        <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34" stroke="#EFE347" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="6" fill="#3462EE" />
                        <path d="M12 9V15M9 12H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <h1 className="font-bold text-lg text-slate-800 dark:text-white">JuaAfya</h1>
           </div>
           <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
              {currentUser.name.substring(0,2)}
           </div>
        </div>

        {renderContent()}
      </main>

      <div className="no-print">
        <ChatBot />
      </div>

      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 no-print">
          {toasts.map(toast => (
              <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
                  toast.type === 'success' ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400' :
                  toast.type === 'error' ? 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400' :
                  'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400'
              }`}>
                  {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : toast.type === 'error' ? <X className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="text-sm font-medium">{toast.message}</span>
              </div>
          ))}
      </div>
    </div>
  );
};

export default App;
