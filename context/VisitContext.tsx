import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Visit, VisitStage } from '../types';
import { MOCK_VISITS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface VisitContextType {
  visits: Visit[];
  loading: boolean;
  error: string | null;
  addVisit: (visit: Visit) => void;
  updateVisit: (visit: Visit) => void;
  deleteVisit: (id: string) => void;
  getVisitById: (id: string) => Visit | undefined;
  getVisitsByStage: (stage: VisitStage) => Visit[];
  getVisitsByPatientId: (patientId: string) => Visit[];
  moveVisitToStage: (visitId: string, stage: VisitStage) => void;
  getQueueStats: () => Record<VisitStage, number>;
}

export const VisitContext = createContext<VisitContextType | undefined>(undefined);

export const VisitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visits, setVisits] = useLocalStorage<Visit[]>('visits', MOCK_VISITS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addVisit = useCallback((visit: Visit) => {
    try {
      setVisits(prev => [...prev, visit]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add visit';
      setError(errorMessage);
    }
  }, [setVisits]);

  const updateVisit = useCallback((updatedVisit: Visit) => {
    try {
      setVisits(prev =>
        prev.map(v => v.id === updatedVisit.id ? updatedVisit : v)
      );
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update visit';
      setError(errorMessage);
    }
  }, [setVisits]);

  const deleteVisit = useCallback((id: string) => {
    try {
      setVisits(prev => prev.filter(v => v.id !== id));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete visit';
      setError(errorMessage);
    }
  }, [setVisits]);

  const getVisitById = useCallback((id: string) => {
    return visits.find(v => v.id === id);
  }, [visits]);

  const getVisitsByStage = useCallback((stage: VisitStage) => {
    return visits.filter(v => v.stage === stage);
  }, [visits]);

  const getVisitsByPatientId = useCallback((patientId: string) => {
    return visits.filter(v => v.patientId === patientId);
  }, [visits]);

  const moveVisitToStage = useCallback((visitId: string, stage: VisitStage) => {
    try {
      setVisits(prev =>
        prev.map(v =>
          v.id === visitId
            ? { ...v, stage, stageStartTime: new Date().toISOString() }
            : v
        )
      );
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move visit';
      setError(errorMessage);
    }
  }, [setVisits]);

  const getQueueStats = useCallback(() => {
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

    return stages.reduce((stats, stage) => {
      stats[stage] = visits.filter(v => v.stage === stage).length;
      return stats;
    }, {} as Record<VisitStage, number>);
  }, [visits]);

  const value: VisitContextType = {
    visits,
    loading,
    error,
    addVisit,
    updateVisit,
    deleteVisit,
    getVisitById,
    getVisitsByStage,
    getVisitsByPatientId,
    moveVisitToStage,
    getQueueStats,
  };

  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );
};

export default VisitContext;
