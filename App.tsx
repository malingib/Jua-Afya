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
import { ViewState, Patient, Appointment, InventoryItem } from './types';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_INVENTORY } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // Theme State
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

  // App State (Simulated Database)
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);

  const addPatient = (patient: Patient) => {
    setPatients([...patients, patient]);
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const deletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  const addInventoryItem = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard appointments={appointments} inventory={inventory} patients={patients} setView={setCurrentView} />;
      case 'patients':
        return <PatientList patients={patients} addPatient={addPatient} updatePatient={updatePatient} deletePatient={deletePatient} />;
      case 'appointments':
        return <Appointments appointments={appointments} />;
      case 'pharmacy':
        return <Pharmacy inventory={inventory} addInventoryItem={addInventoryItem} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings isDarkMode={darkMode} toggleTheme={toggleTheme} />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard appointments={appointments} inventory={inventory} patients={patients} setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-200">
      {/* Navigation */}
      <Sidebar currentView={currentView} setView={setCurrentView} />

      {/* Main Content Area - Adjusted margin for floating sidebar (16rem width + 1rem margin + gap) */}
      <main className="flex-1 md:ml-72 w-full transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-10 flex items-center justify-between">
           <h1 className="font-bold text-lg text-slate-800 dark:text-white">Jua<span className="text-brand-500">Afya</span></h1>
           <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
              DK
           </div>
        </div>

        {/* Dynamic Content */}
        {renderContent()}
      </main>

      {/* Global AI Chatbot */}
      <ChatBot />
    </div>
  );
};

export default App;