import { createContext, useContext, useState, type ReactNode } from 'react';
import { healthService, childService } from '../services/api';

interface HealthContextType {
  child: any;
  healthRecords: any[];
  loading: boolean;
  fetchChildData: (childId: number) => Promise<void>;
  addHealthRecord: (childId: number, data: any) => Promise<void>;
  updateHealthRecord: (childId: number, recordId: number, data: any) => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider = ({ children }: { children: ReactNode }) => {
  const [child, setChild] = useState<any>(null);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildData = async (childId: number) => {
    try {
      setLoading(true);
      const childData = await childService.getById(childId);
      setChild(childData);
      const records = await healthService.getRecords(childId);
      setHealthRecords(records);
    } catch (error) {
      console.error('Error fetching child and health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHealthRecord = async (childId: number, data: any) => {
    try {
      await healthService.addRecord(childId, data);
      await fetchChildData(childId); // Refresh records
    } catch (error) {
      console.error('Error adding health record:', error);
      throw error;
    }
  };

  const updateHealthRecord = async (childId: number, recordId: number, data: any) => {
    try {
      await healthService.updateRecord(childId, recordId, data);
      await fetchChildData(childId); // Refresh records
    } catch (error) {
      console.error('Error updating health record:', error);
      throw error;
    }
  };

  return (
    <HealthContext.Provider value={{ child, healthRecords, loading, fetchChildData, addHealthRecord, updateHealthRecord }}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealthContext = () => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealthContext must be used within a HealthProvider');
  }
  return context;
};
