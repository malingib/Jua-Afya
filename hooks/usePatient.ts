import { useContext } from 'react';
import { PatientContext } from '../context/PatientContext';

/**
 * usePatient Hook
 * Provides access to patient data and operations from PatientContext
 * Must be used within PatientProvider
 */
export const usePatient = () => {
  const context = useContext(PatientContext);

  if (!context) {
    throw new Error('usePatient must be used within PatientProvider');
  }

  return context;
};

export default usePatient;
