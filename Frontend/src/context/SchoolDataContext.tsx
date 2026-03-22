import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { eventService, ambassadorService, schoolService, dashboardService } from '../services/api';

interface SchoolDataState {
  events: any[];
  ambassadors: any[];
  benefactors: any[]; // grouped donations/partners
  school: any | null;
  overview: any | null;
  districtOverview: any | null;
  loading: boolean;
  error: string | null;
}

interface SchoolDataContextType extends SchoolDataState {
  refreshEvents: (year?: string) => Promise<void>;
  refreshAmbassadors: () => Promise<void>;
  refreshBenefactors: () => Promise<void>;
  refreshSchool: () => Promise<void>;
  refreshOverview: (year?: string, classNum?: number, section?: string) => Promise<void>;
  refreshDistrictOverview: (year?: string) => Promise<void>;
  refreshAll: (year?: string) => Promise<void>;
}

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

export const SchoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SchoolDataState>({
    events: [],
    ambassadors: [],
    benefactors: [],
    school: null,
    overview: null,
    districtOverview: null,
    loading: false,
    error: null,
  });

  const refreshEvents = useCallback(async (year: string = '') => {
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

  const refreshOverview = useCallback(async (year: string = '', classNum?: number, section?: string) => {
    try {
      const data = await dashboardService.getOverview(year, classNum, section);
      setState(prev => ({ ...prev, overview: data }));
    } catch (err: any) {
      console.error('Failed to fetch overview:', err);
    }
  }, []);

  const refreshDistrictOverview = useCallback(async (year: string = '') => {
    try {
      const data = await dashboardService.getDistrictOverview(year);
      setState(prev => ({ ...prev, districtOverview: data }));
    } catch (err: any) {
      console.error('Failed to fetch district overview:', err);
    }
  }, []);

  const refreshAll = useCallback(async (year: string = '') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const userStr = localStorage.getItem('school_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const role = user?.role;

      const promises: any[] = [
        eventService.getAll(year),
        schoolService.getMySchool(),
        ambassadorService.getAll(),
        schoolService.getDonations(),
      ];

      if (role === 'DISTRICT_VIEWER') {
        promises.push(dashboardService.getDistrictOverview(year));
      } else if (role && role !== 'PARTNER') {
        promises.push(dashboardService.getOverview(year, user?.assignedClass, user?.assignedSection));
      }

      const results = await Promise.all(promises);
      const [eventsData, schoolData, ambassadorsData, donationsData, dashboardData] = results;

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
        overview: role === 'DISTRICT_VIEWER' ? null : (dashboardData || null),
        districtOverview: role === 'DISTRICT_VIEWER' ? (dashboardData || null) : null,
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
    refreshOverview,
    refreshDistrictOverview,
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
