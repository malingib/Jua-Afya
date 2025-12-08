
import { supabase } from '../lib/supabaseClient';
import { Patient, InventoryItem, Appointment, Visit, Supplier, InventoryLog } from '../types';
import { MOCK_PATIENTS, MOCK_INVENTORY, MOCK_APPOINTMENTS, MOCK_VISITS, MOCK_SUPPLIERS } from '../constants';

export const db = {
    // --- Patients ---
    getPatients: async (): Promise<Patient[]> => {
        try {
            const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
            if (error || !data || data.length === 0) {
                console.warn("Using Mock Patients (DB Empty or Error)");
                return MOCK_PATIENTS; 
            }
            return data.map((p: any) => ({
                id: p.id,
                name: p.name,
                phone: p.phone,
                age: p.age,
                gender: p.gender,
                notes: p.notes,
                lastVisit: p.last_visit || new Date().toISOString().split('T')[0],
                history: p.history || [],
                vitals: p.vitals || {}
            }));
        } catch (e) {
            return MOCK_PATIENTS;
        }
    },
    
    createPatient: async (patient: Patient) => {
        // Remove ID if it's a temp ID to let DB generate UUID, or keep it if needed.
        // For simplicity, we drop ID and let DB create UUID.
        const { id, ...payload } = patient;
        const { error } = await supabase.from('patients').insert({
            name: payload.name,
            phone: payload.phone,
            age: payload.age,
            gender: payload.gender,
            notes: payload.notes,
            history: payload.history,
            vitals: payload.vitals,
            last_visit: payload.lastVisit
        });
        if (error) throw error;
    },

    updatePatient: async (patient: Patient) => {
        const { error } = await supabase.from('patients').update({
            name: patient.name,
            phone: patient.phone,
            age: patient.age,
            gender: patient.gender,
            notes: patient.notes,
            history: patient.history,
            vitals: patient.vitals,
            last_visit: patient.lastVisit
        }).eq('id', patient.id);
        if (error) throw error;
    },

    deletePatient: async (id: string) => {
        const { error } = await supabase.from('patients').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Inventory ---
    getInventory: async (): Promise<InventoryItem[]> => {
        try {
            const { data, error } = await supabase.from('inventory').select('*').order('name');
            if (error || !data || data.length === 0) return MOCK_INVENTORY;
            return data.map((i: any) => ({
                id: i.id,
                name: i.name,
                category: i.category,
                stock: i.stock,
                minStockLevel: i.min_stock_level,
                unit: i.unit,
                price: i.price,
                batchNumber: i.batch_number,
                expiryDate: i.expiry_date,
                supplierId: i.supplier_id
            }));
        } catch (e) {
            return MOCK_INVENTORY;
        }
    },

    createInventoryItem: async (item: InventoryItem) => {
        const { error } = await supabase.from('inventory').insert({
            name: item.name,
            category: item.category,
            stock: item.stock,
            min_stock_level: item.minStockLevel,
            unit: item.unit,
            price: item.price,
            batch_number: item.batchNumber,
            expiry_date: item.expiryDate,
            supplier_id: item.supplierId
        });
        if (error) throw error;
    },

    updateInventoryItem: async (item: InventoryItem) => {
        const { error } = await supabase.from('inventory').update({
            name: item.name,
            category: item.category,
            stock: item.stock,
            min_stock_level: item.minStockLevel,
            unit: item.unit,
            price: item.price,
            batch_number: item.batchNumber,
            expiry_date: item.expiryDate,
            supplier_id: item.supplierId
        }).eq('id', item.id);
        if (error) throw error;
    },

    deleteInventoryItem: async (id: string) => {
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Appointments ---
    getAppointments: async (): Promise<Appointment[]> => {
        try {
            const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: true });
            if (error || !data || data.length === 0) return MOCK_APPOINTMENTS;
            return data.map((a: any) => ({
                id: a.id,
                patientId: a.patient_id,
                patientName: a.patient_name,
                date: a.date,
                time: a.time,
                reason: a.reason,
                status: a.status
            }));
        } catch (e) {
            return MOCK_APPOINTMENTS;
        }
    },

    createAppointment: async (appt: Appointment) => {
        const { error } = await supabase.from('appointments').insert({
            patient_id: appt.patientId,
            patient_name: appt.patientName,
            date: appt.date,
            time: appt.time,
            reason: appt.reason,
            status: appt.status
        });
        if (error) throw error;
    },

    updateAppointment: async (appt: Appointment) => {
        const { error } = await supabase.from('appointments').update({
            date: appt.date,
            time: appt.time,
            reason: appt.reason,
            status: appt.status
        }).eq('id', appt.id);
        if (error) throw error;
    },

    // --- Visits ---
    getVisits: async (): Promise<Visit[]> => {
        try {
            const { data, error } = await supabase.from('visits').select('*').neq('stage', 'Completed');
            if (error || !data || data.length === 0) return MOCK_VISITS;
            return data.map((v: any) => ({
                id: v.id,
                patientId: v.patient_id,
                patientName: v.patient_name,
                stage: v.stage,
                stageStartTime: v.stage_start_time,
                startTime: v.start_time,
                queueNumber: v.queue_number,
                priority: v.priority,
                vitals: v.vitals,
                labOrders: v.lab_orders,
                prescription: v.prescription,
                medicationsDispensed: v.medications_dispensed,
                consultationFee: v.consultation_fee,
                totalBill: v.total_bill,
                paymentStatus: v.payment_status
            }));
        } catch (e) {
            return MOCK_VISITS;
        }
    },

    createVisit: async (visit: Visit) => {
        // Use insert without ID to auto-generate UUID if using UUIDs, or pass ID if app controls it.
        // For app stability with MOCK data mix, we'll try to insert. If it fails due to UUID constraint (e.g. client sent 'V100'),
        // we might need to omit ID.
        // Strategy: Omit ID.
        const { id, ...payload } = visit;
        const { error } = await supabase.from('visits').insert({
            patient_id: payload.patientId,
            patient_name: payload.patientName,
            stage: payload.stage,
            stage_start_time: payload.stageStartTime,
            start_time: payload.startTime,
            queue_number: payload.queueNumber,
            priority: payload.priority,
            vitals: payload.vitals,
            lab_orders: payload.labOrders,
            prescription: payload.prescription,
            medications_dispensed: payload.medicationsDispensed,
            consultation_fee: payload.consultationFee,
            total_bill: payload.totalBill,
            payment_status: payload.paymentStatus
        });
        if (error) throw error;
    },

    updateVisit: async (visit: Visit) => {
        const { error } = await supabase.from('visits').update({
            stage: visit.stage,
            stage_start_time: visit.stageStartTime,
            vitals: visit.vitals,
            lab_orders: visit.labOrders,
            prescription: visit.prescription,
            medications_dispensed: visit.medicationsDispensed,
            total_bill: visit.totalBill,
            payment_status: visit.paymentStatus,
        }).eq('id', visit.id);
        
        if (error) {
            console.warn("DB Update failed (likely ID format mismatch for demo data)", error);
        }
    },

    // --- Suppliers ---
    getSuppliers: async (): Promise<Supplier[]> => {
        try {
            const { data, error } = await supabase.from('suppliers').select('*');
            if (error || !data || data.length === 0) return MOCK_SUPPLIERS;
            return data.map((s: any) => ({
                id: s.id,
                name: s.name,
                contactPerson: s.contact_person,
                phone: s.phone,
                email: s.email
            }));
        } catch (e) {
            return MOCK_SUPPLIERS;
        }
    },

    createSupplier: async (supplier: Supplier) => {
        const { error } = await supabase.from('suppliers').insert({
            name: supplier.name,
            contact_person: supplier.contactPerson,
            phone: supplier.phone,
            email: supplier.email
        });
        if (error) throw error;
    }
};
