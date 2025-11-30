import { useContext } from 'react';
import { VisitContext } from '../context/VisitContext';

/**
 * useVisit Hook
 * Provides access to visit data and operations from VisitContext
 * Must be used within VisitProvider
 */
export const useVisit = () => {
  const context = useContext(VisitContext);

  if (!context) {
    throw new Error('useVisit must be used within VisitProvider');
  }

  return context;
};

export default useVisit;
