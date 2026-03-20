import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { eventService, ambassadorService, schoolService } from '../services/api';

interface SchoolDataState {
  events: any[];
  ambassadors: any[];
  benefactors: any[]; // grouped donations/partners
  school: any | null;
  loading: boolean;
  error: string | null;
}

interface SchoolDataContextType extends SchoolDataState {
  refreshEvents: (year?: string) => Promise<void>;
  refreshAmbassadors: () => Promise<void>;
  refreshBenefactors: () => Promise<void>;
  refreshSchool: () => Promise<void>;
  refreshAll: (year?: string) => Promise<void>;
}

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

export const SchoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SchoolDataState>({
    events: [],
    ambassadors: [],
    benefactors: [],
    school: null,
    loading: false,
    error: null,
  });

  const refreshEvents = useCallback(async (year: string = '2024-2025') => {
    try {
      const data = await eventService.getAll(year);
      setState(prev => ({ ...prev, events: data || [] }));
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
    }
  }, []);

  const refreshAmbassadors = useCallback(async () => {
    try {
      const data = await ambassadorService.getAll();
      setState(prev => ({ ...prev, ambassadors: data || [] }));
    } catch (err: any) {
      console.error('Failed to fetch ambassadors:', err);
    }
  }, []);

  const refreshBenefactors = useCallback(async () => {
    try {
      const data = await schoolService.getDonations();
      // Group by partner (user id or name) as done in Ambassadors.tsx
      const allDonations: any[] = data.donations || [];
      const grouped = allDonations.reduce((acc: any, d: any) => {
        const key = d.user?.id ?? 'anon';
        const name = d.user?.name || 'Anonymous';
        const email = d.user?.email || '';
        if (!acc[key]) acc[key] = { name, email, total: 0, transactions: [] };
        acc[key].total += (d.amount || 0);
        acc[key].transactions.push(d);
        return acc;
      }, {});
      
      const partners = Object.values(grouped).sort((a: any, b: any) => b.total - a.total);
      setState(prev => ({ ...prev, benefactors: partners }));
    } catch (err: any) {
      console.error('Failed to fetch benefactors:', err);
    }
  }, []);

  const refreshSchool = useCallback(async () => {
    try {
      const data = await schoolService.getMySchool();
      setState(prev => ({ ...prev, school: data }));
    } catch (err: any) {
      console.error('Failed to fetch school:', err);
    }
  }, []);

  const refreshAll = useCallback(async (year: string = '2024-2025') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [eventsData, schoolData, ambassadorsData, donationsData] = await Promise.all([
        eventService.getAll(year),
        schoolService.getMySchool(),
        ambassadorService.getAll(),
        schoolService.getDonations()
      ]);

      // Group donations
      const allDonations: any[] = donationsData.donations || [];
      const grouped = allDonations.reduce((acc: any, d: any) => {
        const key = d.user?.id ?? 'anon';
        const name = d.user?.name || 'Anonymous';
        const email = d.user?.email || '';
        if (!acc[key]) acc[key] = { name, email, total: 0, transactions: [] };
        acc[key].total += (d.amount || 0);
        acc[key].transactions.push(d);
        return acc;
      }, {});
      const partners = Object.values(grouped).sort((a: any, b: any) => b.total - a.total);

      setState({
        events: eventsData || [],
        school: schoolData,
        ambassadors: ambassadorsData || [],
        benefactors: partners,
        loading: false,
        error: null
      });
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err?.response?.data?.message || err.message || "Failed to load school data" 
      }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('school_token');
    if (token) {
      refreshAll();
    }
  }, [refreshAll]);

  const value = {
    ...state,
    refreshEvents,
    refreshAmbassadors,
    refreshBenefactors,
    refreshSchool,
    refreshAll,
  };

  return (
    <SchoolDataContext.Provider value={value}>
      {children}
    </SchoolDataContext.Provider>
  );
};

export const useSchoolData = () => {
  const context = useContext(SchoolDataContext);
  if (context === undefined) {
    throw new Error('useSchoolData must be used within a SchoolDataProvider');
  }
  return context;
};
