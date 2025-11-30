import { useContext } from 'react';
import { InventoryContext } from '../context/InventoryContext';

/**
 * useInventory Hook
 * Provides access to inventory data and operations from InventoryContext
 * Must be used within InventoryProvider
 */
export const useInventory = () => {
  const context = useContext(InventoryContext);

  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }

  return context;
};

export default useInventory;
