# JuaAfya Architecture Documentation

## Overview

This document describes the refactored architecture of the JuaAfya clinic management system after Phase 1 & 2 implementation.

## Directory Structure

```
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Modal.tsx
│   │   ├── FormInput.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Alert.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── index.ts
│   ├── ErrorBoundary.tsx   # Global error boundary
│   ├── Sidebar.tsx
│   ├── Dashboard.tsx
│   ├── PatientList.tsx
│   ├── PatientQueue.tsx
│   ├── Appointments.tsx
│   ├── Pharmacy.tsx
│   ├── BulkSMS.tsx
│   ├── ChatBot.tsx
│   ├── Profile.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   └── SuperAdminDashboard.tsx
│
├── context/                 # Global state management
│   ├── PatientContext.tsx
│   ├── InventoryContext.tsx
│   ├── VisitContext.tsx
│   └── index.ts
│
├── hooks/                   # Custom React hooks
│   ├── useAsync.ts         # Async state management
│   ├── useAsyncFn.ts       # Async function wrapper
│   ├── useLocalStorage.ts  # Persisted state
│   ├── useDebounce.ts      # Debounce values
│   ├── useAuth.tsx         # Authentication (Supabase)
│   ├── usePatient.ts       # Patient context access
│   ├── useInventory.ts     # Inventory context access
│   ├── useVisit.ts         # Visit context access
│   └── index.ts
│
├── services/
│   ├── geminiService.ts    # Google Gemini AI integration
│   ├── smsService.ts       # Mobiwave SMS integration
│   └── index.ts
│
├── utils/
│   ├── validators.ts       # Input validation utilities
│   ├── errorHandler.ts     # Centralized error handling
│   ├── supabase.ts         # Supabase client
│   └── index.ts
│
├── types.ts                 # TypeScript type definitions
├── constants.ts             # Mock data and constants
├── App.tsx                  # Main app component
├── index.tsx                # App entry point
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
└── README.md                # Project documentation
```

## State Management

### Global State (Context + Custom Hooks)

The app uses React Context API for global state management instead of prop drilling:

```typescript
// Access patient data anywhere in the component tree
import { usePatient } from '@/hooks/usePatient';

function MyComponent() {
  const { patients, addPatient, updatePatient } = usePatient();
  // ...
}
```

**Available Contexts:**

1. **PatientContext** - Patient CRUD operations and search
2. **InventoryContext** - Inventory items and audit logs
3. **VisitContext** - Patient visit/queue management

### Local Component State

For form data and UI-specific state, use built-in hooks:

```typescript
import { useAsync } from '@/hooks/useAsync';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDebounce } from '@/hooks/useDebounce';

function SearchPatients() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);
  
  const { execute, isLoading, data: results } = useAsync(
    () => api.searchPatients(debouncedQuery),
    false,
    [debouncedQuery]
  );
}
```

## Component Architecture

### Smart Components (Containers)

Smart components:
- Access context data via custom hooks
- Handle complex logic and state
- Compose dumb components
- Examples: Dashboard, PatientList, Pharmacy

```typescript
function PatientList() {
  const { patients, addPatient } = usePatient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <PatientTable patients={patients} />
      <PatientModal isOpen={isModalOpen} onAdd={addPatient} />
    </div>
  );
}
```

### Dumb Components (Presentational)

Dumb components:
- Receive all data via props
- Handle only presentation logic
- No context or state access
- Highly reusable
- Examples: Modal, FormInput, Button, Card, Alert

```typescript
interface PatientTableProps {
  patients: Patient[];
  onEdit?: (patient: Patient) => void;
  onDelete?: (id: string) => void;
}

function PatientTable({ patients, onEdit, onDelete }: PatientTableProps) {
  // Pure presentation logic
  return <table>{/* ... */}</table>;
}
```

## Error Handling

### Global Error Boundary

The `ErrorBoundary` component wraps the entire app and catches all React rendering errors:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Service-Level Error Handling

Use the `errorHandler` utility for API and async operation errors:

```typescript
import { retryWithBackoff, handleApiError, logError } from '@/utils/errorHandler';

async function fetchPatients() {
  try {
    const response = await retryWithBackoff(
      () => fetch('/api/patients'),
      3,
      1000
    );
    
    if (!response.ok) {
      throw handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    const appError = parseError(error);
    logError(appError, 'fetchPatients');
    throw error;
  }
}
```

### Validation

Use built-in validators for user input:

```typescript
import { validatePatientForm, validateEmail, validatePhoneNumber } from '@/utils/validators';

const validation = validatePatientForm({
  name: 'John Doe',
  phone: '+254712345678',
  age: 30,
  gender: 'Male',
});

if (!validation.valid) {
  console.error(validation.errors);
}
```

## Authentication

### Supabase Integration

Authentication is managed via Supabase:

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { signIn, signUp, error, loading } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(email, password);
    }}>
      {error && <Alert type="error">{error}</Alert>}
      {/* ... */}
    </form>
  );
}
```

## Best Practices

### 1. Use Context for Shared State

✅ **Good**
```typescript
function PatientListPage() {
  const { patients, addPatient } = usePatient();
}
```

❌ **Avoid**
```typescript
function PatientListPage({ patients, addPatient }) {
  // Prop drilling from App -> Layout -> Page -> Component
}
```

### 2. Compose Components

✅ **Good**
```typescript
function Dashboard() {
  return (
    <>
      <Card header="Statistics">
        <StatisticsContent />
      </Card>
      <Card header="Recent Patients">
        <PatientTable patients={patients} />
      </Card>
    </>
  );
}
```

❌ **Avoid**
```typescript
function Dashboard() {
  // 1000 lines of HTML and logic
}
```

### 3. Use Hooks for Side Effects

✅ **Good**
```typescript
const { data, isLoading, error } = useAsync(
  () => fetchPatients(),
  true, // execute immediately
  [] // dependencies
);
```

❌ **Avoid**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  // Repeated logic across components
}, []);
```

### 4. Type Everything

✅ **Good**
```typescript
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

function PatientCard(patient: Patient) {
  return <div>{patient.name}</div>;
}
```

❌ **Avoid**
```typescript
function PatientCard(patient: any) {
  return <div>{patient.name}</div>;
}
```

### 5. Handle Errors Gracefully

✅ **Good**
```typescript
try {
  await addPatient(patientData);
  showToast('Patient added successfully', 'success');
} catch (error) {
  const appError = parseError(error);
  showToast(appError.userMessage, 'error');
  logError(appError, 'addPatient');
}
```

❌ **Avoid**
```typescript
async function addPatient() {
  const result = await fetch(...);
  // Silent failure, no error handling
}
```

## Next Steps

### Phase 3: Testing
- Set up Jest and React Testing Library
- Write unit tests for services and utilities
- Write integration tests for critical workflows
- Set up CI/CD pipeline

### Phase 4: Performance
- Implement React.lazy() for code splitting
- Add loading states to all async operations
- Optimize re-renders with React.memo() and useMemo()
- Add pagination to large lists

### Phase 5: Compliance
- Add ARIA labels for accessibility
- Complete auth system integration
- Update documentation
- Set up error monitoring (Sentry)

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
