
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
import { ViewState, Patient, Appointment, InventoryItem, ClinicSettings, Notification, Supplier, InventoryLog, Visit, VisitPriority, TeamMember } from './types';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_INVENTORY, MOCK_SUPPLIERS, MOCK_LOGS, MOCK_VISITS } from './constants';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

// Dedicated System Owner User (Not part of any clinic)
const SYSTEM_ADMIN: TeamMember = {
  id: 'sys-owner',
  name: 'System Owner',
  email: 'admin@juaafya-saas.com',
  role: 'SuperAdmin',
  status: 'Active',
  lastActive: 'Now',
  avatar: 'https://ui-avatars.com/api/?name=System+Owner&background=312e81&color=fff'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
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

  // -- Data Persistence Helper --
  const usePersistedState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage`, error);
        }
    }, [key, state]);

    return [state, setState];
  };

  // -- App Data --
  const [patients, setPatients] = usePersistedState<Patient[]>('patients', MOCK_PATIENTS);
  const [appointments, setAppointments] = usePersistedState<Appointment[]>('appointments', MOCK_APPOINTMENTS);
  const [inventory, setInventory] = usePersistedState<InventoryItem[]>('inventory', MOCK_INVENTORY);
  const [suppliers, setSuppliers] = usePersistedState<Supplier[]>('suppliers', MOCK_SUPPLIERS);
  const [inventoryLogs, setInventoryLogs] = usePersistedState<InventoryLog[]>('inventoryLogs', MOCK_LOGS);
  const [visits, setVisits] = usePersistedState<Visit[]>('visits', MOCK_VISITS);
  
  const [settings, setSettings] = usePersistedState<ClinicSettings>('clinicSettings', {
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
        { id: '1', name: 'Dr. Andrew Kimani', email: 'andrew@juaafya.com', role: 'Admin', status: 'Active', lastActive: 'Now', avatar: 'https://i.pravatar.cc/150?img=11' },
        { id: '2', name: 'Sarah Wanjiku', email: 'sarah@juaafya.com', role: 'Nurse', status: 'Active', lastActive: '2h ago', avatar: 'https://i.pravatar.cc/150?img=5' },
        { id: '3', name: 'John Omondi', email: 'john@juaafya.com', role: 'Doctor', status: 'Active', lastActive: '5m ago', avatar: 'https://i.pravatar.cc/150?img=12' },
        { id: '4', name: 'Grace M.', email: 'grace@juaafya.com', role: 'Receptionist', status: 'Active', lastActive: 'Now', avatar: 'https://i.pravatar.cc/150?img=9' },
        { id: '5', name: 'Peter K.', email: 'peter@juaafya.com', role: 'Lab Tech', status: 'Active', lastActive: '10m ago', avatar: 'https://i.pravatar.cc/150?img=8' }
      ]
  });

  // -- User Session State (Simulated) --
  const [currentUser, setCurrentUser] = useState<TeamMember>(settings.team[0]);

  const switchUser = (member: TeamMember) => {
      setCurrentUser(member);
      // Determine default view based on role
      if (member.role === 'SuperAdmin') setCurrentView('sa-overview');
      else if (member.role === 'Doctor') setCurrentView('consultation');
      else if (member.role === 'Nurse') setCurrentView('triage');
      else if (member.role === 'Receptionist') setCurrentView('reception');
      else setCurrentView('dashboard');
      
      showToast(`Switched to ${member.name} (${member.role})`);
  };

  // Calculate Global Low Stock Count (using minStockLevel from item)
  const lowStockCount = inventory.filter(i => i.stock <= i.minStockLevel).length;

  // -- Toast Notification System --
  const [toasts, setToasts] = useState<Notification[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
  };

  // -- Handlers --

  const addPatient = (patient: Patient) => {
    setPatients(prev => [patient, ...prev]);
    showToast(`Patient ${patient.name} added successfully!`);
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    showToast(`Patient record updated.`);
  };

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    showToast(`Patient deleted.`, 'info');
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
          user: currentUser.name // Use actual logged in user
      };
      setInventoryLogs(prev => [log, ...prev]);
  };

  const addInventoryItem = (item: InventoryItem) => {
    setInventory(prev => [item, ...prev]);
    logInventoryAction(item, 'Created', item.stock, 'Initial stock entry');
    showToast(`${item.name} added to inventory.`);
  };

  const updateInventoryItem = (updatedItem: InventoryItem, reason = 'Updated details') => {
      setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
      
      // Calculate diff for logging if it's a stock change
      const oldItem = inventory.find(i => i.id === updatedItem.id);
      const stockDiff = updatedItem.stock - (oldItem?.stock || 0);
      
      if (stockDiff !== 0) {
          logInventoryAction(updatedItem, stockDiff > 0 ? 'Restocked' : 'Dispensed', stockDiff, reason);
      } else {
          logInventoryAction(updatedItem, 'Updated', 0, reason);
      }
      
      showToast(`${updatedItem.name} updated.`);
  };

  const deleteInventoryItem = (id: string) => {
      const item = inventory.find(i => i.id === id);
      if (item) {
          logInventoryAction(item, 'Deleted', -item.stock, 'Item removed from system');
      }
      setInventory(prev => prev.filter(i => i.id !== id));
      showToast(`Item removed from inventory.`, 'info');
  };

  // -- Supplier Handlers --
  const addSupplier = (supplier: Supplier) => {
      setSuppliers(prev => [...prev, supplier]);
      showToast('Supplier added successfully.');
  };

  const updateSupplier = (updated: Supplier) => {
      setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast('Supplier updated.');
  };

  const deleteSupplier = (id: string) => {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      // Also clear supplierId from items linked to this supplier
      setInventory(prev => prev.map(item => item.supplierId === id ? { ...item, supplierId: undefined } : item));
      showToast('Supplier removed.', 'info');
  };

  const addAppointment = (newAppt: Appointment) => {
    setAppointments(prev => [...prev, newAppt]);
    showToast(`Appointment scheduled for ${newAppt.patientName}.`);
  };

  const updateAppointment = (updatedAppt: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updatedAppt.id ? updatedAppt : a));
  };

  const updateSettings = (newSettings: ClinicSettings) => {
      setSettings(newSettings);
      showToast('Settings saved successfully!');
  };

  // -- Visit/Queue Handlers --
  const addVisit = (patientId: string, priority: VisitPriority = 'Normal', insurance?: any, skipVitals: boolean = false) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newVisit: Visit = {
      id: `V${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      stage: skipVitals ? 'Consultation' : 'Vitals', // Skip Vitals logic
      stageStartTime: new Date().toISOString(),
      startTime: new Date().toISOString(),
      queueNumber: visits.filter(v => v.stage !== 'Completed').length + 1,
      priority: priority,
      insuranceDetails: insurance,
      labOrders: [],
      prescription: [],
      medicationsDispensed: false,
      consultationFee: 500, // Default fee
      totalBill: 500,
      paymentStatus: 'Pending'
    };
    
    setVisits(prev => [...prev, newVisit]);
    showToast(`${patient.name} checked in (Priority: ${priority}).`);
  };

  const updateVisit = (updatedVisit: Visit) => {
    setVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
  };

  const dispensePrescription = (visit: Visit) => {
      // 1. Update inventory
      const updatedInventory = [...inventory];
      visit.prescription.forEach(med => {
          const itemIndex = updatedInventory.findIndex(i => i.id === med.inventoryId);
          if (itemIndex > -1) {
              const item = updatedInventory[itemIndex];
              const newStock = Math.max(0, item.stock - med.quantity);
              updatedInventory[itemIndex] = { ...item, stock: newStock };
              
              // Log it
              logInventoryAction(item, 'Dispensed', -med.quantity, `Prescription for ${visit.patientName}`);
          }
      });
      setInventory(updatedInventory);

      // 2. Move visit to Clearance (Patient has already paid in Billing)
      updateVisit({ ...visit, medicationsDispensed: true, stage: 'Clearance', stageStartTime: new Date().toISOString() });
      showToast('Medications dispensed. Sent to Clearance.');
  };

  const renderContent = () => {
    // Shared Props
    const queueProps = {
        visits,
        patients,
        inventory,
        addVisit,
        updateVisit
    };

    switch (currentView) {
      case 'dashboard':
        return <Dashboard appointments={appointments} inventory={inventory} patients={patients} setView={setCurrentView} />;
      
      // -- DEPARTMENTAL VIEWS (Dashboard-to-Dashboard workflow) --
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
      
      // -- SUPER ADMIN VIEWS --
      case 'sa-overview':
      case 'sa-clinics':
      case 'sa-approvals':
      case 'sa-payments':
      case 'sa-settings':
        const tab = currentView.replace('sa-', '') as any;
        return <SuperAdminDashboard currentUser={currentUser} switchUser={switchUser} team={settings.team} activeTab={tab} />;

      // -- GENERAL MANAGEMENT --
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
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings isDarkMode={darkMode} toggleTheme={toggleTheme} settings={settings} updateSettings={updateSettings} />;
      case 'profile':
        return <Profile />;
      default:
        // Default catch-all (Admin Queue view)
        return <PatientQueue {...queueProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-200 font-sans">
      {/* Navigation */}
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        lowStockCount={lowStockCount} 
        currentUser={currentUser}
        switchUser={switchUser}
        team={settings.team}
        systemAdmin={SYSTEM_ADMIN}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 lg:ml-72 w-full transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-10 flex items-center justify-between no-print">
           <h1 className="font-bold text-lg text-slate-800 dark:text-white">Jua<span className="text-brand-500">Afya</span></h1>
           <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
              {currentUser.name.substring(0,2)}
           </div>
        </div>

        {/* Dynamic Content */}
        {renderContent()}
      </main>

      {/* Global AI Chatbot */}
      <div className="no-print">
        <ChatBot />
      </div>

      {/* Toast Notifications */}
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
