import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { InventoryItem, InventoryLog } from '../types';
import { MOCK_INVENTORY, MOCK_LOGS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface InventoryContextType {
  inventory: InventoryItem[];
  logs: InventoryLog[];
  loading: boolean;
  error: string | null;
  addItem: (item: InventoryItem) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => InventoryItem | undefined;
  getLowStockItems: () => InventoryItem[];
  logAction: (action: InventoryLog) => void;
  getLogsByItemId: (itemId: string) => InventoryLog[];
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', MOCK_INVENTORY);
  const [logs, setLogs] = useLocalStorage<InventoryLog[]>('inventoryLogs', MOCK_LOGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCallback((item: InventoryItem) => {
    try {
      setInventory(prev => [item, ...prev]);
      
      // Log the action
      const log: InventoryLog = {
        id: `LOG-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        action: 'Created',
        quantityChange: item.stock,
        notes: 'Initial stock entry',
        timestamp: new Date().toISOString(),
        user: 'System', // TODO: Get from auth context
      };
      
      setLogs(prev => [log, ...prev]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
    }
  }, [setInventory, setLogs]);

  const updateItem = useCallback((updatedItem: InventoryItem) => {
    try {
      // Find old item to calculate diff
      const oldItem = inventory.find(i => i.id === updatedItem.id);
      
      setInventory(prev =>
        prev.map(i => i.id === updatedItem.id ? updatedItem : i)
      );

      // Log the action if stock changed
      if (oldItem && oldItem.stock !== updatedItem.stock) {
        const stockDiff = updatedItem.stock - oldItem.stock;
        const action = stockDiff > 0 ? 'Restocked' : 'Dispensed';
        
        const log: InventoryLog = {
          id: `LOG-${Date.now()}`,
          itemId: updatedItem.id,
          itemName: updatedItem.name,
          action: action as any,
          quantityChange: stockDiff,
          notes: 'Stock adjustment',
          timestamp: new Date().toISOString(),
          user: 'System',
        };
        
        setLogs(prev => [log, ...prev]);
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
    }
  }, [inventory, setInventory, setLogs]);

  const deleteItem = useCallback((id: string) => {
    try {
      const item = inventory.find(i => i.id === id);
      
      setInventory(prev => prev.filter(i => i.id !== id));

      if (item) {
        const log: InventoryLog = {
          id: `LOG-${Date.now()}`,
          itemId: item.id,
          itemName: item.name,
          action: 'Deleted',
          quantityChange: -item.stock,
          notes: 'Item removed from system',
          timestamp: new Date().toISOString(),
          user: 'System',
        };
        
        setLogs(prev => [log, ...prev]);
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
    }
  }, [inventory, setInventory, setLogs]);

  const getItemById = useCallback((id: string) => {
    return inventory.find(i => i.id === id);
  }, [inventory]);

  const getLowStockItems = useCallback(() => {
    return inventory.filter(i => i.stock <= i.minStockLevel);
  }, [inventory]);

  const logAction = useCallback((log: InventoryLog) => {
    try {
      setLogs(prev => [log, ...prev]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log action';
      setError(errorMessage);
    }
  }, [setLogs]);

  const getLogsByItemId = useCallback((itemId: string) => {
    return logs.filter(log => log.itemId === itemId);
  }, [logs]);

  const value: InventoryContextType = {
    inventory,
    logs,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
    getLowStockItems,
    logAction,
    getLogsByItemId,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext;
