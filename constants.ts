import { Patient, Appointment, InventoryItem, Gender } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P001',
    name: 'Wanjiku Kamau',
    phone: '+254 712 345 678',
    age: 34,
    gender: Gender.Female,
    lastVisit: '2023-10-15',
    notes: 'Patient complains of persistent headache and mild fever. Blood pressure elevated (140/90). Prescribed painkillers and rest.',
    history: ['Malaria treatment (Aug 2023)', 'Routine Checkup (Jan 2023)'],
    vitals: {
      bp: '140/90',
      heartRate: '88',
      temp: '37.8',
      weight: '68'
    }
  },
  {
    id: 'P002',
    name: 'Juma Ochieng',
    phone: '+254 722 987 654',
    age: 45,
    gender: Gender.Male,
    lastVisit: '2023-10-20',
    notes: 'Follow up on fractured arm. Healing well. Cast removal scheduled next week.',
    history: ['Fracture treatment (Sep 2023)'],
    vitals: {
      bp: '120/80',
      heartRate: '72',
      temp: '36.5',
      weight: '75'
    }
  },
  {
    id: 'P003',
    name: 'Amina Mohamed',
    phone: '+254 733 111 222',
    age: 28,
    gender: Gender.Female,
    lastVisit: '2023-10-22',
    notes: 'Prenatal visit. 2nd trimester. Vitals stable. Iron supplements refilled.',
    history: ['Prenatal Visit 1 (Sep 2023)'],
    vitals: {
      bp: '110/70',
      heartRate: '75',
      temp: '36.8',
      weight: '62'
    }
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'A001', patientId: 'P001', patientName: 'Wanjiku Kamau', date: '2023-10-27', time: '09:00', reason: 'BP Checkup', status: 'Scheduled' },
  { id: 'A002', patientId: 'P003', patientName: 'Amina Mohamed', date: '2023-10-27', time: '10:30', reason: 'Prenatal Review', status: 'Scheduled' },
  { id: 'A003', patientId: 'P002', patientName: 'Juma Ochieng', date: '2023-10-28', time: '14:00', reason: 'Cast Removal', status: 'Scheduled' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'I001', name: 'Paracetamol 500mg', stock: 1500, unit: 'Tablets', category: 'Medicine', price: 5 },
  { id: 'I002', name: 'Amoxicillin 250mg', stock: 400, unit: 'Tablets', category: 'Medicine', price: 15 },
  { id: 'I003', name: 'Cotton Wool', stock: 12, unit: 'Rolls', category: 'Supply', price: 150 },
  { id: 'I004', name: 'Malaria Test Kit', stock: 45, unit: 'Kits', category: 'Lab', price: 200 },
  { id: 'I005', name: 'Cough Syrup', stock: 8, unit: 'Bottles', category: 'Medicine', price: 350 }, // Low stock
];