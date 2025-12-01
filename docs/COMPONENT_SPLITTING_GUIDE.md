# Component Splitting Guide

This guide outlines how to refactor large components into smaller, more manageable pieces.

## Overview

Large components (1000+ lines) should be split into:
1. **Container Component** - Handles logic, state, and data fetching
2. **Presentational Components** - Pure render functions that receive props

## Example: Refactoring PatientQueue.tsx (1400 lines)

### Before (Monolithic)
```
PatientQueue.tsx (1400 lines)
├── Queue display logic (200 lines)
├── Check-in modal (200 lines)
├── Vitals modal (200 lines)
├── Consultation modal (200 lines)
├── Lab modal (150 lines)
├── Billing modal (150 lines)
├── Pharmacy modal (150 lines)
├── Clearance modal (150 lines)
```

### After (Modular)
```
PatientQueue/
├── index.tsx (100 lines) - Container component
├── PatientQueueView.tsx (200 lines) - Main view
├── CheckInModal.tsx (150 lines)
├── VitalsModal.tsx (150 lines)
├── ConsultationModal.tsx (200 lines)
├── LabModal.tsx (150 lines)
├── BillingModal.tsx (150 lines)
├── PharmacyModal.tsx (150 lines)
└── ClearanceModal.tsx (150 lines)
```

## Step-by-Step Refactoring

### Step 1: Identify Sections
Review the component and identify logical sections:
- Data management
- UI sections (modals, cards, tables)
- Helper functions

### Step 2: Extract Modals/Sections
Create separate files for each modal:

```typescript
// PatientQueue/CheckInModal.tsx
import React from 'react';
import { Modal, FormInput, Button } from '@/components/common';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckInData) => void;
  isLoading?: boolean;
  error?: string;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
}) => {
  const [formData, setFormData] = React.useState({
    patientId: '',
    priority: 'Normal',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check In Patient">
      {error && <Alert type="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Patient ID"
          value={formData.patientId}
          onChange={(e) =>
            setFormData({ ...formData, patientId: e.target.value })
          }
        />
        <Button type="submit" isLoading={isLoading}>
          Check In
        </Button>
      </form>
    </Modal>
  );
};
```

### Step 3: Create Container Component
Create index.tsx that orchestrates the modals:

```typescript
// PatientQueue/index.tsx
import React, { useState } from 'react';
import { useVisit } from '@/hooks/useVisit';
import { PatientQueueView } from './PatientQueueView';
import { CheckInModal } from './CheckInModal';
import { VitalsModal } from './VitalsModal';
// ... other modals

export const PatientQueue: React.FC = () => {
  const { visits, addVisit, updateVisit } = useVisit();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  const handleCheckIn = (data: CheckInData) => {
    addVisit(data.patientId, data.priority);
    setActiveModal(null);
  };

  const handleVitalsSave = (vitals: Vitals) => {
    if (selectedVisitId) {
      const visit = visits.find((v) => v.id === selectedVisitId);
      if (visit) {
        updateVisit({ ...visit, vitals, stage: 'Consultation' });
        setActiveModal(null);
      }
    }
  };

  return (
    <>
      <PatientQueueView
        visits={visits}
        onCheckInClick={() => setActiveModal('checkIn')}
        onVitalsClick={(visitId) => {
          setSelectedVisitId(visitId);
          setActiveModal('vitals');
        }}
      />

      <CheckInModal
        isOpen={activeModal === 'checkIn'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleCheckIn}
      />

      <VitalsModal
        isOpen={activeModal === 'vitals'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleVitalsSave}
        visit={
          selectedVisitId
            ? visits.find((v) => v.id === selectedVisitId)
            : undefined
        }
      />

      {/* Other modals... */}
    </>
  );
};

export default PatientQueue;
```

### Step 4: Create View Component
Create a presentational component for the main queue display:

```typescript
// PatientQueue/PatientQueueView.tsx
import React from 'react';
import { Visit } from '@/types';
import { Card } from '@/components/common';

interface PatientQueueViewProps {
  visits: Visit[];
  onCheckInClick: () => void;
  onVitalsClick: (visitId: string) => void;
  // ... other handlers
}

export const PatientQueueView: React.FC<PatientQueueViewProps> = ({
  visits,
  onCheckInClick,
  onVitalsClick,
}) => {
  const stages = ['Check-In', 'Vitals', 'Consultation', 'Lab', 'Billing', 'Pharmacy', 'Clearance'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Patient Queue</h1>

      <button onClick={onCheckInClick} className="mb-6">
        Check In Patient
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageVisits = visits.filter((v) => v.stage === stage);
          return (
            <Card key={stage} header={stage}>
              {stageVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-3 border rounded cursor-pointer hover:bg-slate-50"
                  onClick={() => {
                    if (stage === 'Vitals') onVitalsClick(visit.id);
                  }}
                >
                  {visit.patientName}
                  <div className="text-xs text-slate-500">#{visit.queueNumber}</div>
                </div>
              ))}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
```

## Best Practices

### 1. Single Responsibility
Each component should do ONE thing:
- Modal: Show/collect data
- View: Display data
- Container: Manage state and logic

### 2. Data Flow
```
Container (manages state)
    ↓
View (displays data)
    ↓
Modals (collect input)
    ↓
Container (handles submission)
```

### 3. Props Interface
Define clear prop interfaces:

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  error?: string;
  isLoading?: boolean;
}
```

### 4. Reusability
Extract common patterns into hooks:

```typescript
// hooks/useModalState.ts
export const useModalState = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return {
    activeModal,
    openModal: (name: string) => setActiveModal(name),
    closeModal: () => setActiveModal(null),
    isOpen: (name: string) => activeModal === name,
  };
};
```

## Testing Split Components

Smaller components are much easier to test:

```typescript
describe('CheckInModal', () => {
  it('should call onSubmit with form data', async () => {
    const handleSubmit = jest.fn();
    render(
      <CheckInModal
        isOpen={true}
        onClose={jest.fn()}
        onSubmit={handleSubmit}
      />
    );

    await userEvent.type(screen.getByLabelText('Patient ID'), 'P001');
    await userEvent.click(screen.getByText('Check In'));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ patientId: 'P001' })
    );
  });
});
```

## Component Structure Template

```typescript
// MyComponent/index.tsx - Container
import React, { useState } from 'react';
import { useCustomHook } from '@/hooks';
import { MyView } from './MyView';
import { MyModal } from './MyModal';

export const MyComponent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, actions } = useCustomHook();

  return (
    <>
      <MyView data={data} onAction={() => setIsModalOpen(true)} />
      <MyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
```

## Estimated Effort

| Component | Lines | Est. Time | Complexity |
|-----------|-------|-----------|-----------|
| PatientQueue | 1400 | 8 hours | High |
| SuperAdminDashboard | 1500 | 8 hours | High |
| Settings | 1200 | 6 hours | Medium |
| App | 400 | 4 hours | Medium |

## Tools

- Use find and replace to move blocks of code
- Use IDE refactoring: "Extract to file"
- Keep git history: commit after each extract
- Run tests frequently to ensure nothing breaks

## Next Steps

1. Choose one component to refactor
2. Create folder structure
3. Move code to separate files
4. Update imports
5. Test thoroughly
6. Update parent imports
7. Delete original code
8. Commit changes
