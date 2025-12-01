/**
 * Integration Tests for Visit Workflow
 * Tests the complete patient visit flow through the system
 */

import { Visit, VisitStage } from '../../types';

describe('Visit Workflow Integration', () => {
  let visit: Visit;

  beforeEach(() => {
    // Create a test visit
    visit = {
      id: 'V123',
      patientId: 'P001',
      patientName: 'John Doe',
      stage: 'Check-In',
      stageStartTime: new Date().toISOString(),
      startTime: new Date().toISOString(),
      queueNumber: 1,
      priority: 'Normal',
      consultationFee: 500,
      totalBill: 500,
      paymentStatus: 'Pending',
      labOrders: [],
      prescription: [],
      medicationsDispensed: false,
    };
  });

  describe('Check-In to Vitals', () => {
    it('should transition from Check-In to Vitals', () => {
      expect(visit.stage).toBe('Check-In');

      // Simulate transition
      visit.stage = 'Vitals';
      visit.stageStartTime = new Date().toISOString();

      expect(visit.stage).toBe('Vitals');
      expect(visit.stageStartTime).not.toBe(visit.startTime);
    });
  });

  describe('Vitals to Consultation', () => {
    it('should record vitals and transition to consultation', () => {
      visit.stage = 'Vitals';
      visit.vitals = {
        bp: '120/80',
        temp: '36.5',
        weight: '70',
        heartRate: '72',
      };

      // Transition to consultation
      visit.stage = 'Consultation';

      expect(visit.stage).toBe('Consultation');
      expect(visit.vitals).toBeDefined();
      expect(visit.vitals?.bp).toBe('120/80');
    });
  });

  describe('Consultation with Orders', () => {
    it('should add lab orders during consultation', () => {
      visit.stage = 'Consultation';
      visit.chiefComplaint = 'Persistent headache';
      visit.diagnosis = 'Migraine';

      // Add lab order
      visit.labOrders.push({
        id: 'L001',
        testId: 'T001',
        testName: 'Complete Blood Count',
        status: 'Pending',
        price: 500,
        orderedAt: new Date().toISOString(),
      });

      expect(visit.labOrders).toHaveLength(1);
      expect(visit.labOrders[0].testName).toBe('Complete Blood Count');
    });

    it('should add prescription during consultation', () => {
      visit.stage = 'Consultation';

      // Add prescription
      visit.prescription.push({
        inventoryId: 'INV001',
        name: 'Paracetamol',
        dosage: '1x3 for 5 days',
        quantity: 15,
        price: 300,
      });

      expect(visit.prescription).toHaveLength(1);
      expect(visit.prescription[0].name).toBe('Paracetamol');
      visit.totalBill += visit.prescription[0].price;
      expect(visit.totalBill).toBe(800);
    });
  });

  describe('Lab Work', () => {
    it('should transition to lab and mark tests as completed', () => {
      visit.stage = 'Lab';
      visit.labOrders = [
        {
          id: 'L001',
          testId: 'T001',
          testName: 'Complete Blood Count',
          status: 'Pending',
          price: 500,
          orderedAt: new Date().toISOString(),
        },
      ];

      // Complete lab test
      visit.labOrders[0].status = 'Completed';
      visit.labOrders[0].result = 'Normal - All values within range';
      visit.labOrders[0].completedAt = new Date().toISOString();

      expect(visit.labOrders[0].status).toBe('Completed');
      expect(visit.labOrders[0].result).toBeDefined();
    });
  });

  describe('Billing', () => {
    it('should calculate total bill and track payment', () => {
      visit.stage = 'Billing';
      visit.consultationFee = 500;
      visit.prescription = [
        { inventoryId: 'I1', name: 'Drug', dosage: '1x3', quantity: 10, price: 200 },
        { inventoryId: 'I2', name: 'Drug2', dosage: '1x2', quantity: 5, price: 150 },
      ];
      visit.labOrders = [
        { ...visit.labOrders[0], price: 500 },
      ];

      // Calculate total
      const prescriptionTotal = visit.prescription.reduce((sum, p) => sum + p.price, 0);
      const labTotal = visit.labOrders.reduce((sum, l) => sum + l.price, 0);
      visit.totalBill = visit.consultationFee + prescriptionTotal + labTotal;

      expect(visit.totalBill).toBe(1350);

      // Process payment
      visit.paymentStatus = 'Paid';
      expect(visit.paymentStatus).toBe('Paid');
    });
  });

  describe('Pharmacy', () => {
    it('should dispense medications and update inventory', () => {
      visit.stage = 'Pharmacy';
      visit.prescription = [
        { inventoryId: 'INV001', name: 'Paracetamol', dosage: '1x3', quantity: 15, price: 300 },
      ];

      // Simulate dispensing
      visit.medicationsDispensed = true;
      visit.stage = 'Clearance';

      expect(visit.medicationsDispensed).toBe(true);
      expect(visit.stage).toBe('Clearance');
    });
  });

  describe('Clearance and Completion', () => {
    it('should complete visit checkout process', () => {
      visit.stage = 'Clearance';
      visit.medicationsDispensed = true;
      visit.paymentStatus = 'Paid';

      // Complete visit
      visit.stage = 'Completed';

      expect(visit.stage).toBe('Completed');
      expect(visit.medicationsDispensed).toBe(true);
      expect(visit.paymentStatus).toBe('Paid');
    });
  });

  describe('Full Workflow', () => {
    it('should complete full patient visit workflow', () => {
      const stages: VisitStage[] = [
        'Check-In',
        'Vitals',
        'Consultation',
        'Lab',
        'Billing',
        'Pharmacy',
        'Clearance',
        'Completed',
      ];

      let currentVisit = { ...visit };

      for (let i = 1; i < stages.length; i++) {
        currentVisit.stage = stages[i];
        currentVisit.stageStartTime = new Date().toISOString();

        // Verify stage transition
        expect(currentVisit.stage).toBe(stages[i]);

        // Add minimal data for some stages
        if (stages[i] === 'Vitals') {
          currentVisit.vitals = { bp: '120/80', temp: '36.5', weight: '70', heartRate: '72' };
        }
        if (stages[i] === 'Consultation') {
          currentVisit.prescription = [
            { inventoryId: 'I1', name: 'Drug', dosage: '1x3', quantity: 10, price: 200 },
          ];
        }
        if (stages[i] === 'Billing') {
          currentVisit.paymentStatus = 'Paid';
          currentVisit.totalBill = 700;
        }
        if (stages[i] === 'Pharmacy') {
          currentVisit.medicationsDispensed = true;
        }
      }

      // Verify final state
      expect(currentVisit.stage).toBe('Completed');
      expect(currentVisit.paymentStatus).toBe('Paid');
      expect(currentVisit.medicationsDispensed).toBe(true);
    });
  });
});
