
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
import { ViewState, Patient, Appointment, InventoryItem, ClinicSettings, Notification } from './types';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_INVENTORY } from './constants';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

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
      ]
  });

  // Calculate Global Low Stock Count
  const lowStockCount = inventory.filter(i => i.stock < 10).length;

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

  const addInventoryItem = (item: InventoryItem) => {
    setInventory(prev => [item, ...prev]);
    showToast(`${item.name} added to inventory.`);
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
      setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
      showToast(`${updatedItem.name} updated.`);
  };

  const deleteInventoryItem = (id: string) => {
      setInventory(prev => prev.filter(i => i.id !== id));
      showToast(`Item removed from inventory.`, 'info');
  };

  const addAppointment = (newAppt: Appointment) => {
    setAppointments(prev => [...prev, newAppt]);
    showToast(`Appointment scheduled for ${newAppt.patientName}.`);
  };

  const updateAppointment = (updatedAppt: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updatedAppt.id ? updatedAppt : a));
    // Don't show toast for every status change if you prefer, but good for feedback
    // showToast(`Appointment updated.`); 
  };

  const updateSettings = (newSettings: ClinicSettings) => {
      setSettings(newSettings);
      showToast('Settings saved successfully!');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard appointments={appointments} inventory={inventory} patients={patients} setView={setCurrentView} />;
      case 'patients':
        return <PatientList patients={patients} addPatient={addPatient} updatePatient={updatePatient} deletePatient={deletePatient} />;
      case 'appointments':
        return <Appointments appointments={appointments} patients={patients} addAppointment={addAppointment} updateAppointment={updateAppointment} showToast={showToast} />;
      case 'pharmacy':
        return <Pharmacy inventory={inventory} addInventoryItem={addInventoryItem} updateInventoryItem={updateInventoryItem} deleteInventoryItem={deleteInventoryItem} />;
      case 'bulk-sms':
        return <BulkSMS patients={patients} showToast={showToast} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings isDarkMode={darkMode} toggleTheme={toggleTheme} settings={settings} updateSettings={updateSettings} />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard appointments={appointments} inventory={inventory} patients={patients} setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-200 font-sans">
      {/* Navigation */}
      <Sidebar currentView={currentView} setView={setCurrentView} lowStockCount={lowStockCount} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 w-full transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-10 flex items-center justify-between no-print">
           <h1 className="font-bold text-lg text-slate-800 dark:text-white">Jua<span className="text-brand-500">Afya</span></h1>
           <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
              DK
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