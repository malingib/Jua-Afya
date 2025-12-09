
import create from 'zustand';
import { Patient, Appointment, InventoryItem, ClinicSettings, Notification, Supplier, InventoryLog, Visit, TeamMember } from './types';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_INVENTORY, MOCK_SUPPLIERS, MOCK_LOGS, MOCK_VISITS } from './constants';
import { db } from './services/db';
import { supabase } from './lib/supabaseClient';

interface AppState {
  currentView: string;
  isAppLoading: boolean;
  isDemoMode: boolean;
  darkMode: boolean;
  patients: Patient[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  inventoryLogs: InventoryLog[];
  visits: Visit[];
  settings: ClinicSettings;
  currentUser: TeamMember | null;
  toasts: Notification[];
  actions: {
    setCurrentView: (view: string) => void;
    setIsAppLoading: (isLoading: boolean) => void;
    setIsDemoMode: (isDemo: boolean) => void;
    toggleTheme: () => void;
    fetchData: () => Promise<void>;
    loadMockData: () => void;
    login: (user: TeamMember) => void;
    logout: () => void;
    switchUser: (user: TeamMember) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    addPatient: (patient: Patient) => Promise<void>;
    updatePatient: (patient: Patient) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    addInventoryItem: (item: InventoryItem) => Promise<void>;
    updateInventoryItem: (item: InventoryItem, reason?: string) => Promise<void>;
    deleteInventoryItem: (id: string) => Promise<void>;
    addSupplier: (supplier: Supplier) => Promise<void>;
    updateSupplier: (supplier: Supplier) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;
    addAppointment: (appointment: Appointment) => Promise<void>;
    updateAppointment: (appointment: Appointment) => Promise<void>;
    updateSettings: (settings: ClinicSettings) => void;
    addVisit: (patientId: string) => Promise<void>;
    updateVisit: (visit: Visit) => Promise<void>;
    dispensePrescription: (visit: Visit) => Promise<void>;
    completeVisit: (visit: Visit) => Promise<void>;
  };
}

const useStore = create<AppState>((set, get) => ({
  currentView: 'dashboard',
  isAppLoading: true,
  isDemoMode: false,
  darkMode: localStorage.getItem('theme') === 'dark',
  patients: [],
  appointments: [],
  inventory: [],
  suppliers: [],
  inventoryLogs: MOCK_LOGS,
  visits: [],
  settings: (() => {
    const saved = localStorage.getItem('juaafya_settings');
    const defaults: ClinicSettings = {
        name: 'JuaAfya Medical Centre',
        phone: '+254 712 345 678',
        email: 'admin@juaafya.com',
        location: 'Nairobi, Kenya',
        currency: 'KSh',
        language: 'English',
        timezone: 'EAT (GMT+3)',
        smsEnabled: true,
        logo: '',
        smsConfig: {
            apiKey: '',
            senderId: 'MOBIWAVE',
        },
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
    };

    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return { ...defaults, ...parsed };
        } catch(e) { return defaults; }
    }
    return defaults;
  })(),
  currentUser: null,
  toasts: [],
  actions: {
    setCurrentView: (view) => set({ currentView: view }),
    setIsAppLoading: (isLoading) => set({ isAppLoading: isLoading }),
    setIsDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
    toggleTheme: () => {
      const darkMode = !get().darkMode;
      set({ darkMode });
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    },
    fetchData: async () => {
      const connected = await db.checkConnection();
      if (connected) {
        set({ isDemoMode: false });
        try {
          const [patients, inventory, appointments, visits, suppliers] = await Promise.all([
            db.getPatients(),
            db.getInventory(),
            db.getAppointments(),
            db.getVisits(),
            db.getSuppliers(),
          ]);
          set({ patients, inventory, appointments, visits, suppliers });
        } catch (e) {
          console.error('Data fetch failed despite connection check.', e);
          get().actions.loadMockData();
        }
      } else {
        console.warn('Database unavailable. Loading Demo Data.');
        get().actions.loadMockData();
      }
    },
    loadMockData: () => {
      set({
        isDemoMode: true,
        patients: MOCK_PATIENTS,
        inventory: MOCK_INVENTORY,
        appointments: MOCK_APPOINTMENTS,
        visits: MOCK_VISITS,
        suppliers: MOCK_SUPPLIERS,
      });
      get().actions.showToast('Offline Mode: Using local demo data.', 'info');
    },
    login: (user) => {
      set({ currentUser: user });
      localStorage.setItem('juaafya_demo_user', JSON.stringify(user));
      get().actions.fetchData();
      if (user.role === 'SuperAdmin') {
        set({ currentView: 'sa-overview' });
      } else if (user.role === 'Doctor') {
        set({ currentView: 'consultation' });
      } else if (user.role === 'Nurse') {
        set({ currentView: 'triage' });
      } else if (user.role === 'Receptionist') {
        set({ currentView: 'reception' });
      } else {
        set({ currentView: 'dashboard' });
      }
      get().actions.showToast(`Welcome back, ${user.name.split(' ')[0]}!`);
    },
    logout: async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('juaafya_demo_user');
      set({ currentUser: null, patients: [] });
      get().actions.showToast('You have been logged out.', 'info');
    },
    switchUser: (user) => {
      set({ currentUser: user });
      localStorage.setItem('juaafya_demo_user', JSON.stringify(user));
      if (user.role === 'SuperAdmin') {
        set({ currentView: 'sa-overview' });
      } else {
        set({ currentView: 'dashboard' });
      }
      get().actions.showToast(`Switched to ${user.name} (${user.role})`);
    },
    showToast: (message, type = 'success') => {
      const id = Date.now().toString();
      set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, 3000);
    },
    addPatient: async (patient) => {
      try {
        let newPatient = patient;
        if (!get().isDemoMode) {
          const saved = await db.createPatient(patient);
          if (saved) newPatient = saved;
        }
        set((state) => ({ patients: [newPatient, ...state.patients] }));
        get().actions.showToast(`Patient ${newPatient.name} added successfully!`);
      } catch (e) {
        get().actions.showToast('Error adding patient to database.', 'error');
        if (get().isDemoMode) {
          set((state) => ({ patients: [patient, ...state.patients] }));
        }
      }
    },
    updatePatient: async (updatedPatient) => {
      try {
        if (!get().isDemoMode) await db.updatePatient(updatedPatient);
        set((state) => ({
          patients: state.patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)),
        }));
        get().actions.showToast(`Patient record updated.`);
      } catch (e) {
        get().actions.showToast('Error updating patient', 'error');
      }
    },
    deletePatient: async (id) => {
      try {
        if (!get().isDemoMode) await db.deletePatient(id);
        set((state) => ({ patients: state.patients.filter((p) => p.id !== id) }));
        get().actions.showToast(`Patient deleted.`, 'info');
      } catch (e) {
        get().actions.showToast('Error deleting patient', 'error');
      }
    },
    addInventoryItem: async (item) => {
      try {
        let newItem = item;
        if (!get().isDemoMode) {
          const saved = await db.createInventoryItem(item);
          if (saved) newItem = saved;
        }
        set((state) => ({ inventory: [newItem, ...state.inventory] }));
        // logInventoryAction(newItem, 'Created', newItem.stock, 'Initial stock entry');
        get().actions.showToast(`${newItem.name} added to inventory.`);
      } catch (e) {
        get().actions.showToast('Error creating item', 'error');
      }
    },
    updateInventoryItem: async (updatedItem, reason = 'Updated details') => {
      try {
        if (!get().isDemoMode) await db.updateInventoryItem(updatedItem);
        // const oldItem = get().inventory.find((i) => i.id === updatedItem.id);
        // const stockDiff = updatedItem.stock - (oldItem?.stock || 0);
        // if (stockDiff !== 0) {
        //   logInventoryAction(updatedItem, stockDiff > 0 ? 'Restocked' : 'Dispensed', stockDiff, reason);
        // } else {
        //   logInventoryAction(updatedItem, 'Updated', 0, reason);
        // }
        set((state) => ({
          inventory: state.inventory.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
        }));
        get().actions.showToast(`${updatedItem.name} updated.`);
      } catch (e) {
        get().actions.showToast('Error updating item', 'error');
      }
    },
    deleteInventoryItem: async (id) => {
      try {
        if (!get().isDemoMode) await db.deleteInventoryItem(id);
        // const item = get().inventory.find((i) => i.id === id);
        // if (item) logInventoryAction(item, 'Deleted', -item.stock, 'Item removed');
        set((state) => ({ inventory: state.inventory.filter((i) => i.id !== id) }));
        get().actions.showToast(`Item removed.`, 'info');
      } catch (e) {
        get().actions.showToast('Error deleting item', 'error');
      }
    },
    addSupplier: async (supplier) => {
      try {
        let newSupplier = supplier;
        if (!get().isDemoMode) {
          const saved = await db.createSupplier(supplier);
          if (saved) newSupplier = saved;
        }
        set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
        get().actions.showToast('Supplier added successfully.');
      } catch (e) {
        get().actions.showToast('Error adding supplier', 'error');
      }
    },
    updateSupplier: async (updated) => {
      try {
        if (!get().isDemoMode) await db.updateSupplier(updated);
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === updated.id ? updated : s)),
        }));
        get().actions.showToast('Supplier updated.');
      } catch (e) {
        get().actions.showToast('Error updating supplier', 'error');
      }
    },
    deleteSupplier: async (id) => {
      try {
        if (!get().isDemoMode) await db.deleteSupplier(id);
        set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) }));
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.supplierId === id ? { ...item, supplierId: undefined } : item
          ),
        }));
        get().actions.showToast('Supplier removed.', 'info');
      } catch (e) {
        get().actions.showToast('Error deleting supplier', 'error');
      }
    },
    addAppointment: async (newAppt) => {
      try {
        let createdAppt = newAppt;
        if (!get().isDemoMode) {
          const saved = await db.createAppointment(newAppt);
          if (saved) createdAppt = saved;
        }
        set((state) => ({ appointments: [...state.appointments, createdAppt] }));
        get().actions.showToast(`Appointment scheduled for ${createdAppt.patientName}.`);
      } catch (e) {
        get().actions.showToast('Error scheduling appointment', 'error');
      }
    },
    updateAppointment: async (updatedAppt) => {
      try {
        if (!get().isDemoMode) await db.updateAppointment(updatedAppt);
        set((state) => ({
          appointments: state.appointments.map((a) => (a.id === updatedAppt.id ? updatedAppt : a)),
        }));
      } catch (e) {
        get().actions.showToast('Error updating appointment', 'error');
      }
    },
    updateSettings: (newSettings) => {
      set({ settings: newSettings });
      localStorage.setItem('juaafya_settings', JSON.stringify(newSettings));
      get().actions.showToast('Settings saved successfully!');
    },
    addVisit: async (patientId) => {
        const patient = get().patients.find((p) => p.id === patientId);
        if (!patient) return;

        const newVisit: Visit = {
            id: `V${Date.now()}`, // Temp ID
            patientId: patient.id,
            patientName: patient.name,
            stage: 'Vitals',
            stageStartTime: new Date().toISOString(),
            startTime: new Date().toISOString(),
            queueNumber: get().visits.filter((v) => v.stage !== 'Completed').length + 1,
            priority: 'Normal',
            labOrders: [],
            prescription: [],
            medicationsDispensed: false,
            consultationFee: 500,
            totalBill: 500,
            paymentStatus: 'Pending',
        };

        try {
            let createdVisit = newVisit;
            if (!get().isDemoMode) {
                const saved = await db.createVisit(newVisit);
                if (saved) createdVisit = saved;
            }
            set((state) => ({ visits: [...state.visits, createdVisit] }));
            get().actions.showToast(`${patient.name} checked in.`);
        } catch (e) {
            get().actions.showToast('Error checking in patient', 'error');
        }
    },
    updateVisit: async (updatedVisit) => {
        try {
            if (!get().isDemoMode) await db.updateVisit(updatedVisit);
            set((state) => ({
                visits: state.visits.map((v) => (v.id === updatedVisit.id ? updatedVisit : v)),
            }));
        } catch (e) {
            get().actions.showToast('Error updating visit', 'error');
        }
    },
    dispensePrescription: async (visit) => {
        const updatedInventory = [...get().inventory];
        visit.prescription.forEach((med) => {
            const itemIndex = updatedInventory.findIndex((i) => i.id === med.inventoryId);
            if (itemIndex > -1) {
                const item = updatedInventory[itemIndex];
                const newStock = Math.max(0, item.stock - med.quantity);
                updatedInventory[itemIndex] = { ...item, stock: newStock };

                // logInventoryAction(item, 'Dispensed', -med.quantity, `Prescription for ${visit.patientName}`);
                if (!get().isDemoMode) db.updateInventoryItem(updatedInventory[itemIndex]); // Async update
            }
        });
        set({ inventory: updatedInventory });

        const nextVisitState: Visit = { ...visit, medicationsDispensed: true, stage: 'Clearance', stageStartTime: new Date().toISOString() };
        await get().actions.updateVisit(nextVisitState);
        get().actions.showToast('Medications dispensed. Sent to Clearance.');
    },
    completeVisit: async (visit) => {
        const diagnosisText = visit.diagnosis ? `Dx: ${visit.diagnosis}` : 'No Diagnosis';
        const notesText = visit.doctorNotes ? `Notes: ${visit.doctorNotes}` : '';
        const summary = `[${visit.startTime.split('T')[0]}] ${diagnosisText}. ${notesText}`.trim();

        const patient = get().patients.find((p) => p.id === visit.patientId);
        if (patient) {
            const updatedPatient = {
                ...patient,
                lastVisit: new Date().toISOString().split('T')[0],
                history: [summary, ...patient.history],
            };
            await get().actions.updatePatient(updatedPatient);
        }

        await get().actions.updateVisit({ ...visit, stage: 'Completed' });
        get().actions.showToast('Visit finalized.', 'success');
    },
  },
}));

export default useStore;
