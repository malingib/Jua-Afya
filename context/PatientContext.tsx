import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Patient } from '../types';
import { MOCK_PATIENTS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PatientContextType {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  deletePatient: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];
}

export const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useLocalStorage<Patient[]>('patients', MOCK_PATIENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPatient = useCallback((patient: Patient) => {
    try {
      setPatients(prev => [patient, ...prev]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add patient';
      setError(errorMessage);
    }
  }, [setPatients]);

  const updatePatient = useCallback((updatedPatient: Patient) => {
    try {
      setPatients(prev =>
        prev.map(p => p.id === updatedPatient.id ? updatedPatient : p)
      );
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update patient';
      setError(errorMessage);
    }
  }, [setPatients]);

  const deletePatient = useCallback((id: string) => {
    try {
      setPatients(prev => prev.filter(p => p.id !== id));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete patient';
      setError(errorMessage);
    }
  }, [setPatients]);

  const getPatientById = useCallback((id: string) => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const searchPatients = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(query) ||
      p.id.includes(query)
    );
  }, [patients]);

  const value: PatientContextType = {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    searchPatients,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContext;
