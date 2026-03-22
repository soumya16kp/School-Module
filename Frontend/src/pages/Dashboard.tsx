import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService, schoolService, partnerService } from '../services/api';
import { useSchoolData } from '../context/SchoolDataContext';
import { 
  LayoutDashboard, LogOut, School, ShieldCheck, Mail, Phone, 
  ClipboardList, CalendarPlus, Award, Heart, Globe, Activity, 
  Eye, Smile, Pencil, UserCircle, UserCog, Upload, X, Shield, 
  ChevronRight, HeartPulse, Flame, HardHat, Stethoscope, Baby, 
  Users, AlertTriangle, Clock, CheckCircle2, Bell 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// PRD §4.1: Tab visibility by role
const formatRole = (role: string) =>
  role ? role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';

const canSeeTab = (role: string, tab: string): boolean => {
  if (tab === 'dashboard') return true;
  if (!role) return false;
  switch (tab) {
    case 'school-details':
      return ['SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'DISTRICT_VIEWER'].includes(role);
    case 'events':
      return ['SCHOOL_ADMIN', 'PRINCIPAL', 'WOMBTO18_OPS'].includes(role);
    case 'certifications':
      return ['SCHOOL_ADMIN', 'PRINCIPAL', 'WOMBTO18_OPS'].includes(role);
    case 'ambassadors':
      return ['SCHOOL_ADMIN', 'PRINCIPAL', 'WOMBTO18_OPS'].includes(role);
    case 'records':
      return ['SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'NURSE_COUNSELLOR', 'WOMBTO18_OPS'].includes(role);
    case 'staff':
      return ['SCHOOL_ADMIN', 'PRINCIPAL'].includes(role);
    case 'available-schools':
      return ['PARTNER', 'WOMBTO18_OPS'].includes(role);
    case 'my-donations':
      return ['PARTNER'].includes(role);
    case 'requests':
      return ['WOMBTO18_OPS'].includes(role);
    default:
      return false;
  }
}

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{label}</p>
    <p style={{ fontWeight: 500 }}>{value ?? '—'}</p>
  </div>
);

const ProfessionalEditField = ({ title, form, setForm, prefix, color }: any) => {
  const [uploading, setUploading] = React.useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await schoolService.uploadAvatar(file);
      setForm({ ...form, [`${prefix}Image`]: res.url });
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', borderRadius: '24px', background: 'white', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontWeight: 800, fontSize: '0.75rem', color: color || 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{title}</p>
        {uploading && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>Uploading...</span>}
      </div>
      
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: '#f8fafc', overflow: 'hidden', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {form[`${prefix}Image`] ? (
              <img src={form[`${prefix}Image`]} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ background: `${color}10`, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <UserCircle size={40} color={color || "#cbd5e1"} />
              </div>
            )}
          </div>
          <label style={{ 
            position: 'absolute', 
            bottom: '-6px', 
            right: '-6px', 
            width: '32px', 
            height: '32px', 
            background: 'white', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
            border: '1px solid #e2e8f0', 
            cursor: 'pointer' 
          }}>
            <Upload size={16} color={color || "var(--primary)"} />
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
             <input 
              placeholder="Full Name" 
              value={form[`${prefix}Name`] || ''} 
              onChange={e => setForm({...form, [`${prefix}Name`]: e.target.value})}
              className="form-control"
              style={{ padding: '0.7rem 1rem', fontSize: '0.9rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
             <input 
              placeholder="Contact (Phone/Email)" 
              value={form[`${prefix}Contact`] || ''} 
              onChange={e => setForm({...form, [`${prefix}Contact`]: e.target.value})}
              className="form-control"
              style={{ padding: '0.7rem 1rem', fontSize: '0.9rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfessionalSlot = ({ title, name, contact, image, icon: Icon, color, onAssign, canEdit }: any) => (
  <div style={{ 
    padding: '1.25rem', 
    borderRadius: '24px', 
    background: 'white', 
    border: '1px solid #f1f5f9', 
    display: 'flex', 
    alignItems: 'center',
    gap: '1.25rem',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
    cursor: name ? 'default' : 'pointer'
  }}
  onClick={!name ? onAssign : undefined}
  >
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ 
        width: '100px', 
        height: '100px', 
        borderRadius: '28px', 
        background: '#f8fafc', 
        overflow: 'hidden', 
        border: '4px solid white', 
        boxShadow: `0 12px 20px -5px ${color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {image ? (
          <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ background: `${color}10`, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCircle size={56} color={color} style={{ opacity: 0.5 }} />
          </div>
        )}
      </div>
      <div style={{ 
        position: 'absolute', 
        top: '-12px', 
        right: '-12px', 
        width: '40px', 
        height: '40px', 
        borderRadius: '16px', 
        background: 'white', 
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        border: '1px solid #f1f5f9',
        fontSize: '1.25rem'
      }}>
        <Icon size={20} />
      </div>
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{title}</p>
      {name ? (
        <>
          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Phone size={12} color={color} />
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{contact || 'No contact'}</p>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Unassigned Slot</p>
          {canEdit && <Pencil size={12} />}
        </div>
      )}
    </div>
    
    {name && canEdit && (
      <button 
        onClick={onAssign}
        style={{ 
          padding: '8px', 
          borderRadius: '12px', 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          color: '#64748b',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <Pencil size={14} />
      </button>
    )}
  </div>
);

import { motion } from 'framer-motion';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ChildRecords from './ChildRecords';
import Events from './Events';
import Certifications from './Certifications';
import StaffManagement from './StaffManagement';
import Ambassadors from './Ambassadors';
import PartnerDashboard from './PartnerDashboard';
import { CircularProgress } from '../components/CircularProgress';
import EventRequests from './EventRequests';

type TabId = 'dashboard' | 'school-details' | 'events' | 'ambassadors' | 'certifications' | 'records' | 'staff' | 'available-schools' | 'my-donations' | 'requests';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userStr = localStorage.getItem('school_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role ?? '';

  const { 
    school, 
    overview, 
    districtOverview, 
    loading,
    refreshOverview,
    refreshAll
  } = useSchoolData();

  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [selectedSection, setSelectedSection] = useState<string | 'all'>('all');
  const [actionPanelTab, setActionPanelTab] = useState<'tasks' | 'events'>('tasks');
  const [showAllEvents, setShowAllEvents] = useState(false);

  const [showEditLeadership, setShowEditLeadership] = useState(false);
  const [leadershipForm, setLeadershipForm] = useState<any>({});

  const visibleTabs = useMemo(() => {
    const tabs: TabId[] = ['dashboard', 'school-details', 'events', 'certifications', 'ambassadors', 'records', 'staff', 'available-schools', 'my-donations'];
    return tabs.filter((t) => canSeeTab(role, t));
  }, [role]);

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Handle tab from URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as TabId;
    if (tabParam && visibleTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search, visibleTabs]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      const classNum = selectedClass === 'all' ? undefined : Number(selectedClass);
      const section = selectedSection === 'all' ? undefined : selectedSection;
      refreshOverview('2024-2025', classNum, section);
    }
  }, [selectedClass, selectedSection, activeTab, refreshOverview]);

  const dentalPieData = useMemo(() => {
    if (!overview?.prevalence) return [];
    const { dentalHealthy, dentalIssues, dentalScreened } = overview.prevalence;
    return [
      { name: 'Healthy', value: dentalHealthy, color: '#10b981' },
      { name: 'Issues', value: dentalIssues, color: '#f59e0b' },
      { name: 'Pending', value: Math.max(0, overview.totalStudents - dentalScreened), color: '#e2e8f0' }
    ];
  }, [overview]);

  const visionPieData = useMemo(() => {
    if (!overview?.prevalence) return [];
    const { visionNormal, visionIssues, visionScreened } = overview.prevalence;
    return [
      { name: 'Normal', value: visionNormal, color: '#3b82f6' },
      { name: 'Issues', value: visionIssues, color: '#ef4444' },
      { name: 'Pending', value: Math.max(0, overview.totalStudents - visionScreened), color: '#e2e8f0' }
    ];
  }, [overview]);

  const bmiPieData = useMemo(() => {
    if (!overview?.prevalence) return [];
    const { bmiNormal, bmiRiskTotal, bmiUnderweight, bmiScreened } = overview.prevalence;
    return [
      { name: 'Normal', value: bmiNormal, color: '#ec4899' },
      { name: 'At Risk', value: bmiRiskTotal, color: '#f97316' },
      { name: 'Underweight', value: bmiUnderweight, color: '#06b6d4' },
      { name: 'Pending', value: Math.max(0, overview.totalStudents - bmiScreened), color: '#e2e8f0' }
    ];
  }, [overview]);
  const [modalTab, setModalTab] = useState<'leaders' | 'emergency' | 'health'>('leaders');
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { fromChild403?: boolean; message?: string } | undefined;
    if (state?.fromChild403 && state?.message) {
      setAccessDeniedMessage(state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!visibleTabs.length) return;
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [visibleTabs, activeTab]);
  // No need to fetch here, context handles it. 
  // We can trigger a refresh if needed, but on mount refreshAll in context runs.
  useEffect(() => {
    if (role === 'PARTNER' && activeTab === 'dashboard') {
      partnerService.getDonations().then(() => {
        // Stats are for non-partner roles; partners see PartnerDashboard
      }).catch(() => {});
    }
  }, [role, activeTab]);

  useEffect(() => {
    if (school) {
      setLeadershipForm({
        principalName: school.principalName || '',
        principalContact: school.principalContact || '',
        principalImage: school.principalImage || '',
        vicePrincipalName: school.vicePrincipalName || '',
        vicePrincipalContact: school.vicePrincipalContact || '',
        vicePrincipalImage: school.vicePrincipalImage || '',
        
        // New Emergency Fields
        fireDeptName: school.fireDeptName || '',
        fireDeptContact: school.fireDeptContact || '',
        fireDeptImage: school.fireDeptImage || '',
        policeName: school.policeName || '',
        policeContact: school.policeContact || '',
        policeImage: school.policeImage || '',
        ndrfName: school.ndrfName || '',
        ndrfContact: school.ndrfContact || '',
        ndrfImage: school.ndrfImage || '',

        // New Health Fields
        nurseName: school.nurseName || '',
        nurseContact: school.nurseContact || '',
        nurseImage: school.nurseImage || '',
        gynecologistName: school.gynecologistName || '',
        gynecologistContact: school.gynecologistContact || '',
        gynecologistImage: school.gynecologistImage || '',
        pediatricianName: school.pediatricianName || '',
        pediatricianContact: school.pediatricianContact || '',
        pediatricianImage: school.pediatricianImage || '',
      });
    }
  }, [school]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  const handleUpdateLeadership = async () => {
    try {
      if (!school) return;
      await schoolService.update(school.id, leadershipForm);
      refreshAll();
      setShowEditLeadership(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update leadership details');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <LoadingSpinner label="Loading Dashboard..." />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', padding: '2rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '3rem' }}>
          <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '12px' }}>
            <School color="var(--primary)" size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem' }}>EduCentral</h2>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {canSeeTab(role, 'dashboard') && (
          <div 
            onClick={() => setActiveTab('dashboard')}
            style={{ 
              background: activeTab === 'dashboard' ? 'var(--primary-light)' : 'transparent', 
              color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <LayoutDashboard size={20} /> Dashboard
          </div>
          )}
          {canSeeTab(role, 'school-details') && (
          <div 
            onClick={() => setActiveTab('school-details')}
            style={{ 
              background: activeTab === 'school-details' ? 'var(--primary-light)' : 'transparent', 
              color: activeTab === 'school-details' ? 'var(--primary)' : 'var(--text-muted)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <School size={20} /> School Details
          </div>
          )}
          {canSeeTab(role, 'events') && (
          <div 
            onClick={() => setActiveTab('events')}
            style={{ 
              background: activeTab === 'events' ? 'var(--primary-light)' : 'transparent', 
              color: activeTab === 'events' ? 'var(--primary)' : 'var(--text-muted)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <CalendarPlus size={20} /> Events
          </div>
          )}
          {canSeeTab(role, 'certifications') && (
          <div 
            onClick={() => setActiveTab('certifications')}
            style={{ 
              background: activeTab === 'certifications' ? 'var(--primary-light)' : 'transparent', 
              color: activeTab === 'certifications' ? 'var(--primary)' : 'var(--text-muted)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Award size={20} /> Certifications
          </div>
          )}
          {canSeeTab(role, 'ambassadors') && (
          <div 
            onClick={() => setActiveTab('ambassadors')}
            style={{ 
              background: activeTab === 'ambassadors' ? 'var(--primary-light)' : 'transparent', 
              color: activeTab === 'ambassadors' ? 'var(--primary)' : 'var(--text-muted)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Users size={20} /> Ambassadors
          </div>
          )}
          {canSeeTab(role, 'records') && (
          <div 
            onClick={() => setActiveTab('records')}
            style={{ 
              background: activeTab === 'records' ? 'var(--primary-light)' : 'transparent', 
              color: activeTab === 'records' ? 'var(--primary)' : 'var(--text-muted)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ClipboardList size={20} /> Records
          </div>
          )}
          {canSeeTab(role, 'staff') && (
          <div 
            onClick={() => setActiveTab('staff')}
            style={{ 
              background: activeTab === 'staff' ? 'var(--primary-light)' : 'transparent', 
              color: activeTab === 'staff' ? 'var(--primary)' : 'var(--text-muted)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <UserCog size={20} /> Staff
          </div>
          )}
          {canSeeTab(role, 'available-schools') && (
          <div 
            onClick={() => setActiveTab('available-schools')}
            style={{ 
              background: activeTab === 'available-schools' ? 'var(--primary-light)' : 'transparent', 
              color: activeTab === 'available-schools' ? 'var(--primary)' : 'var(--text-muted)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Globe size={20} /> Browse Schools
          </div>
          )}
          {canSeeTab(role, 'my-donations') && (
          <div 
            onClick={() => setActiveTab('my-donations')}
            style={{ 
              background: activeTab === 'my-donations' ? 'var(--primary-light)' : 'transparent', 
              color: activeTab === 'my-donations' ? 'var(--primary)' : 'var(--text-muted)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Heart size={20} /> My Donations
          </div>
          )}
          {canSeeTab(role, 'requests') && (
          <div 
            onClick={() => setActiveTab('requests')}
            style={{ 
              background: activeTab === 'requests' ? 'var(--primary-light)' : 'transparent', 
              color: activeTab === 'requests' ? 'var(--primary)' : 'var(--text-muted)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Bell size={20} /> Event Requests
          </div>
          )}
        </nav>

        <button onClick={handleLogout} className="btn" style={{ background: '#fee2e2', color: '#dc2626', width: '100%' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem' }}>
        {accessDeniedMessage && (
          <div
            role="alert"
            style={{
              marginBottom: '1.5rem',
              padding: '1rem 1.25rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <span>{accessDeniedMessage}</span>
            <button
              type="button"
              onClick={() => setAccessDeniedMessage(null)}
              style={{ background: 'transparent', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '1.25rem', padding: '0 4px' }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome, {user?.name}</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Institution Administration Panel {role && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>· {formatRole(role)}</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
             {role && (
               <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)' }}>
                 <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{formatRole(role)}</span>
               </div>
             )}
             <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#10b981" />
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{school ? 'Registered Institution' : 'Registration Pending'}</span>
             </div>
          </div>
        </div>


        {school ? (

          !canSeeTab(role, activeTab) ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              You don&apos;t have access to this section.
            </div>
          ) : activeTab === 'dashboard' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Header with Filters */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1.5rem', 
                  background: 'white', 
                  padding: '2rem', 
                  borderRadius: '24px', 
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>School Performance Dashboard</h2>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Cohort analytics and high-risk health metrics</p>
                  </div>
                  
                  {/* Dashboard Filters — hidden for CLASS_TEACHER (backend enforces their class) */}
                  {role === 'CLASS_TEACHER' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '0.5rem 1.25rem', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', fontWeight: 700, color: '#1e40af', fontSize: '0.9rem' }}>
                        Class {user?.assignedClass ?? '—'}{user?.assignedSection ? ` – Section ${user.assignedSection}` : ''}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Your assigned class</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Select Class</label>
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                          className="glass-effect"
                          style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 600, color: '#475569', cursor: 'pointer', minWidth: '140px' }}
                        >
                          <option value="all">All Classes</option>
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>Class {n}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Section</label>
                        <select
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                          className="glass-effect"
                          style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 600, color: '#475569', cursor: 'pointer', minWidth: '100px' }}
                        >
                          <option value="all">All</option>
                          {['A','B','C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                      </div>
                      <button
                        onClick={() => { setSelectedClass('all'); setSelectedSection('all'); }}
                        style={{ height: '42px', alignSelf: 'flex-end', padding: '0 1rem', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fff1f1', color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {role === 'DISTRICT_VIEWER' && districtOverview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card"
                  style={{ padding: '2rem', background: 'white', marginBottom: '2rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.4rem' }}>District Overview ({districtOverview.academicYear})</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Showing schools with ≥ 10 students
                    </p>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '0.5rem' }}>School</th>
                          <th style={{ padding: '0.5rem' }}>Location</th>
                          <th style={{ padding: '0.5rem' }}>Students</th>
                          <th style={{ padding: '0.5rem' }}>Coverage</th>
                          <th style={{ padding: '0.5rem' }}>Drill Completion</th>
                          <th style={{ padding: '0.5rem' }}>High‑risk flags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {districtOverview.schools.map((s: any) => (
                          <tr key={s.schoolId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '0.5rem', fontWeight: 600 }}>{s.schoolName}</td>
                            <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                              {s.city}, {s.state}
                            </td>
                            <td style={{ padding: '0.5rem' }}>{s.totalStudents}</td>
                            <td style={{ padding: '0.5rem' }}>
                              {s.coveragePercent}% ({s.studentsWithCheckup}/{s.totalStudents})
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              {s.drillPercent}% ({s.drillCompleted}/{s.drillRequired})
                            </td>
                            <td style={{ padding: '0.5rem', maxWidth: '260px' }}>
                              {s.highRiskFlags && s.highRiskFlags.length > 0 ? (
                                <span style={{ fontSize: '0.8rem', color: '#991b1b' }}>
                                  {s.highRiskFlags.join('; ')}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>No major flags</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
              {role !== 'DISTRICT_VIEWER' && overview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}
                >
                  <div className="glass-card" style={{ padding: '2rem 1.5rem 1.5rem 1.5rem', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem' }}>Checkup Coverage</p>
                    <CircularProgress 
                      percentage={overview.coveragePercent} 
                      pendingPercentage={overview.pendingPercent}
                      size={180} 
                      color="#10b981" 
                    />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center', width: '100%', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{overview.studentsWithCheckup} Done</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{overview.studentsPending} Pending</span>
                      </div>
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '2rem 1.5rem 1.5rem 1.5rem', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem' }}>Events Overview</p>
                    <CircularProgress 
                      percentage={Math.round(((overview.eventsFinalized || 0) / Math.max(1, (overview.eventsTarget || 9))) * 100)} 
                      pendingPercentage={Math.round(((overview.eventsReady || 0) / Math.max(1, (overview.eventsTarget || 9))) * 100)}
                      extraPercentage={Math.round(((overview.eventsScheduled || 0) / Math.max(1, (overview.eventsTarget || 9))) * 100)}
                      size={180} 
                      color="#10b981" 
                      pendingColor="#f59e0b"
                      extraColor="#3b82f6"
                      subLabel="OF TARGET"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem', width: '100%', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{overview.eventsFinalized} Finalized</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{overview.eventsReady} Completed</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{overview.eventsScheduled} Scheduled</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e2e8f0' }} />
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{overview.eventsPending} Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Panel - Moved here */}
                  <div className="glass-card" style={{ padding: '1.5rem', background: 'white', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={16} color="var(--primary)" /> Action Panel
                      </h3>
                      <div style={{ display: 'flex', background: '#f8fafc', padding: '2px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <button 
                          onClick={() => setActionPanelTab('tasks')}
                          style={{ padding: '4px 8px', borderRadius: '8px', border: 'none', background: actionPanelTab === 'tasks' ? 'white' : 'transparent', color: actionPanelTab === 'tasks' ? '#0f172a' : '#64748b', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', boxShadow: actionPanelTab === 'tasks' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                        >
                          Tasks
                        </button>
                        <button 
                          onClick={() => setActionPanelTab('events')}
                          style={{ padding: '4px 8px', borderRadius: '8px', border: 'none', background: actionPanelTab === 'events' ? 'white' : 'transparent', color: actionPanelTab === 'events' ? '#0f172a' : '#64748b', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', boxShadow: actionPanelTab === 'events' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                        >
                          Events
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {actionPanelTab === 'tasks' ? (
                        <>
                          {overview.studentsPending > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                              <AlertTriangle size={14} color="#d97706" />
                              <span style={{ fontSize: '0.75rem', color: '#92400e' }}><strong>{overview.studentsPending}</strong> missing records</span>
                            </div>
                          )}
                          {overview.certificationPending > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                              <AlertTriangle size={14} color="#2563eb" />
                              <span style={{ fontSize: '0.75rem', color: '#1e40af' }}><strong>{overview.certificationPending}</strong> certs pending</span>
                            </div>
                          )}
                          {!overview.studentsPending && !overview.certificationPending && (
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '1rem' }}>No pending tasks</p>
                          )}
                        </>
                      ) : (
                        <>
                          {overview.upcomingEvents?.slice(0, showAllEvents ? 8 : 3).map((ev: any) => (
                            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem', borderRadius: '8px', background: '#faf5ff', border: '1px solid #e9d5ff', transition: 'all 0.2s' }}>
                              <Clock size={14} color="var(--primary)" />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#581c87', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                                {showAllEvents && ev.scheduledAt && (
                                  <p style={{ fontSize: '0.65rem', color: '#7c3aed', margin: 0 }}>{new Date(ev.scheduledAt).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {overview.upcomingEvents && overview.upcomingEvents.length > 3 && (
                            <button 
                              onClick={() => setShowAllEvents(!showAllEvents)}
                              style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'var(--primary)', 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                cursor: 'pointer', 
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                marginTop: '4px'
                              }}
                            >
                              {showAllEvents ? 'Show Less' : `Show More (+${overview.upcomingEvents.length - 3})`}
                            </button>
                          )}
                          {(!overview.upcomingEvents || overview.upcomingEvents.length === 0) && (
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '1rem' }}>No upcoming events</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {overview && overview.prevalence && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: '2rem' }}
                >
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HeartPulse size={22} className="text-purple-500" /> Screening Attendance Overview
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {/* Dental Card */}
                    <div className="glass-card hover-lift" style={{ padding: '1.75rem', background: 'white', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Smile size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px', fontWeight: 700, textTransform: 'uppercase' }}>Dental Screening</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{Math.round((overview.prevalence.dentalScreened / (overview.totalStudents || 1)) * 100)}%</span>
                            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>Attended</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((overview.prevalence.dentalScreened / (overview.totalStudents || 1)) * 100)}%` }} style={{ height: '100%', background: '#16a34a' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        <span>Presence Rate</span>
                        <span style={{ color: '#0f172a' }}>{overview.prevalence.dentalScreened} / {overview.totalStudents}</span>
                      </div>
                    </div>

                    {/* Eye Card */}
                    <div className="glass-card hover-lift" style={{ padding: '1.75rem', background: 'white', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Eye size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px', fontWeight: 700, textTransform: 'uppercase' }}>Eye Screening</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{Math.round((overview.prevalence.visionScreened / (overview.totalStudents || 1)) * 100)}%</span>
                            <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>Attended</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((overview.prevalence.visionScreened / (overview.totalStudents || 1)) * 100)}%` }} style={{ height: '100%', background: '#2563eb' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        <span>Presence Rate</span>
                        <span style={{ color: '#0f172a' }}>{overview.prevalence.visionScreened} / {overview.totalStudents}</span>
                      </div>
                    </div>

                    {/* BMI Card */}
                    <div className="glass-card hover-lift" style={{ padding: '1.75rem', background: 'white', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Activity size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px', fontWeight: 700, textTransform: 'uppercase' }}>BMI Screening</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{Math.round((overview.prevalence.bmiScreened / (overview.totalStudents || 1)) * 100)}%</span>
                            <span style={{ fontSize: '0.8rem', color: '#db2777', fontWeight: 700 }}>Attended</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((overview.prevalence.bmiScreened / (overview.totalStudents || 1)) * 100)}%` }} style={{ height: '100%', background: '#db2777' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        <span>Presence Rate</span>
                        <span style={{ color: '#0f172a' }}>{overview.prevalence.bmiScreened} / {overview.totalStudents}</span>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {overview && overview.totalStudents > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="delay-200"
                  style={{ marginBottom: '2.5rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderLeft: '4px solid #8b5cf6', paddingLeft: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Cohort Health Analytics</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', background: '#f5f3ff', padding: '2px 8px', borderRadius: '4px' }}>DISTRIBUTION VIEW</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
                    {/* Dental PIE */}
                    <div className="glass-card hover-lift" style={{ padding: '2.5rem', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Smile size={20} />
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Dental Wellness</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2rem' }}>Overall oral health distribution</p>
                      
                      <div style={{ height: '280px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={dentalPieData} dataKey="value" nameKey="name" 
                              cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8}
                              stroke="none"
                            >
                              {dentalPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', padding: '12px' }}
                              itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                            />
                            <Legend verticalAlign="bottom" height={40} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Vision PIE */}
                    <div className="glass-card hover-lift" style={{ padding: '2.5rem', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Eye size={20} />
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Vision Status</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2rem' }}>Sight acuity & screening coverage</p>
                      
                      <div style={{ height: '280px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={visionPieData} dataKey="value" nameKey="name" 
                              cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8}
                              stroke="none"
                            >
                              {visionPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', padding: '12px' }}
                              itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                            />
                            <Legend verticalAlign="bottom" height={40} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* BMI PIE */}
                    <div className="glass-card hover-lift" style={{ padding: '2.5rem', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Activity size={20} />
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Growth & BMI</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2rem' }}>Weight category distribution</p>
                      
                      <div style={{ height: '280px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={bmiPieData} dataKey="value" nameKey="name" 
                              cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8}
                              stroke="none"
                            >
                              {bmiPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', padding: '12px' }}
                              itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                            />
                            <Legend verticalAlign="bottom" height={40} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {overview && overview.classAttendance && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: '2rem' }}
                >
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#0f172a' }}>Completion Status by Class</h3>
                  <div className="glass-card" style={{ padding: '2rem', background: 'white', border: '1px solid #f1f5f9' }}>
                    <div style={{ height: '350px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overview.classAttendance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="class" 
                            label={{ value: 'Class', position: 'insideBottom', offset: -5 }} 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            allowDecimals={false}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: '#f8fafc' }}
                          />
                          <Legend iconType="circle" />
                          <Bar dataKey="bmiPresent" name="BMI Present" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="eyePresent" name="Eye Present" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="dentalPresent" name="Dental Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : activeTab === 'school-details' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
              {/* Leadership Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '2.5rem', background: 'white' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Institutional Leadership</h2>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Assigned medical and administrative heads</p>
                  </div>
                  {['SCHOOL_ADMIN', 'PRINCIPAL'].includes(role) && (
                    <button 
                      onClick={() => setShowEditLeadership(true)}
                      className="btn btn-primary" 
                      style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', gap: '10px', borderRadius: '14px' }}
                    >
                      <Pencil size={18} /> Update Details
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  {/* Principal */}
                  <div style={{ padding: '2rem', borderRadius: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center', transition: 'transform 0.2s' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                      {school.principalImage ? (
                        <img src={school.principalImage} alt="Principal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <UserCircle size={50} color="#3b82f6" />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Principal</p>
                      <h4 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1e293b', marginBottom: '4px' }}>{school.principalName}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>{school.principalContact}</p>
                    </div>
                  </div>

                  {/* Vice Principal */}
                  <div style={{ padding: '2rem', borderRadius: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center', transition: 'transform 0.2s' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                      {school.vicePrincipalImage ? (
                        <img src={school.vicePrincipalImage} alt="Vice Principal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <UserCircle size={50} color="#8b5cf6" />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Vice Principal</p>
                      <h4 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1e293b', marginBottom: '4px' }}>{school.vicePrincipalName || 'Not Assigned'}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>{school.vicePrincipalContact || '—'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Emergency & Health Sections */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Emergency Responders */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={20} color="#ef4444" /> Emergency Responders
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ProfessionalSlot 
                      title="Fire Department"
                      name={school.fireDeptName}
                      contact={school.fireDeptContact}
                      image={school.fireDeptImage}
                      icon={Flame}
                      color="#f97316"
                      onAssign={() => setShowEditLeadership(true)}
                      canEdit={['SCHOOL_ADMIN', 'PRINCIPAL'].includes(role)}
                    />
                    <ProfessionalSlot 
                      title="Police Station"
                      name={school.policeName}
                      contact={school.policeContact}
                      image={school.policeImage}
                      icon={Shield}
                      color="#3b82f6"
                      onAssign={() => setShowEditLeadership(true)}
                      canEdit={['SCHOOL_ADMIN', 'PRINCIPAL'].includes(role)}
                    />
                    <ProfessionalSlot 
                      title="NDRF Trainer"
                      name={school.ndrfName}
                      contact={school.ndrfContact}
                      image={school.ndrfImage}
                      icon={HardHat}
                      color="#16a34a"
                      onAssign={() => setShowEditLeadership(true)}
                      canEdit={['SCHOOL_ADMIN', 'PRINCIPAL'].includes(role)}
                    />
                  </div>
                </motion.div>

                {/* Health Experts */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HeartPulse size={20} color="#10b981" /> Health Experts
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ProfessionalSlot 
                      title="School Nurse"
                      name={school.nurseName}
                      contact={school.nurseContact}
                      image={school.nurseImage}
                      icon={Stethoscope}
                      color="#10b981"
                      onAssign={() => setShowEditLeadership(true)}
                      canEdit={['SCHOOL_ADMIN', 'PRINCIPAL'].includes(role)}
                    />
                    <ProfessionalSlot 
                      title="Gynecologist"
                      name={school.gynecologistName}
                      contact={school.gynecologistContact}
                      image={school.gynecologistImage}
                      icon={Baby}
                      color="#ec4899"
                      onAssign={() => setShowEditLeadership(true)}
                      canEdit={['SCHOOL_ADMIN', 'PRINCIPAL'].includes(role)}
                    />
                    <ProfessionalSlot 
                      title="Pediatrician"
                      name={school.pediatricianName}
                      contact={school.pediatricianContact}
                      image={school.pediatricianImage}
                      icon={Baby}
                      color="#8b5cf6"
                      onAssign={() => setShowEditLeadership(true)}
                      canEdit={['SCHOOL_ADMIN', 'PRINCIPAL'].includes(role)}
                    />
                  </div>
                </motion.div>
              </div>

              {/* School Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card"
                style={{ padding: '2.5rem', background: 'white' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>School Profile</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Official institutional registration data</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                      {school.registrationNo}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                  <DetailRow label="School Name" value={school.schoolName} />
                  <DetailRow label="UDISE+ Code" value={school.udiseCode} />
                  <DetailRow label="Board" value={school.boardAffiliation} />
                  <DetailRow label="Type" value={school.schoolType} />
                  <DetailRow label="Academic Year" value={school.academicYear} />
                  <DetailRow label="Total Strength" value={school.studentStrength?.toLocaleString()} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', padding: '2rem', background: '#f8fafc', borderRadius: '20px' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Contact Information</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Mail size={16} color="var(--primary)" />
                        <span style={{ fontSize: '0.9rem' }}>{school.schoolEmail}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Phone size={16} color="var(--primary)" />
                        <span style={{ fontSize: '0.9rem' }}>{school.principalContact}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Institution Address</p>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#334155' }}>
                      {school.address}, {school.city}, {school.state} - {school.pincode}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : activeTab === 'events' ? (
            <Events />
          ) : activeTab === 'certifications' ? (
            <Certifications />
          ) : activeTab === 'ambassadors' ? (
            <Ambassadors />
          ) : activeTab === 'requests' ? (
            <EventRequests />
          ) : activeTab === 'staff' ? (
            <StaffManagement />
          ) : activeTab === 'available-schools' ? (
            <PartnerDashboard />
          ) : activeTab === 'my-donations' ? (
            <PartnerDashboard />
          ) : (
            <ChildRecords />
          )
        ) : (
          <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '32px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <School size={40} color="#cbd5e1" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Institution Not Linked</h2>
            {['CLASS_TEACHER', 'STAFF', 'NURSE_COUNSELLOR'].includes(role) ? (
              <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '450px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                Your account isn&apos;t connected to a school yet. Please contact your school administrator to link your account.
              </p>
            ) : (
              <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '450px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                Your account isn&apos;t connected to an institution yet, or the session data is stale.
                Try refreshing below — if the problem persists, please register your institution.
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => refreshAll()}
                className="btn"
                style={{ padding: '1rem 2rem', borderRadius: '18px', fontWeight: 700, fontSize: '1rem', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}
              >
                🔄 Retry Loading
              </button>
              {!['CLASS_TEACHER', 'STAFF', 'NURSE_COUNSELLOR'].includes(role) && (
                <button
                  onClick={() => navigate('/register-school')}
                  className="btn btn-primary"
                  style={{ padding: '1rem 2.5rem', borderRadius: '18px', fontWeight: 800, fontSize: '1rem' }}
                >
                  Complete Registration
                </button>
              )}
            </div>
          </div>
        )}

        {/* Edit Leadership Modal */}
        {showEditLeadership && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card" 
              style={{ padding: 0, background: 'white', maxWidth: '850px', width: '100%', maxHeight: '85vh', display: 'flex', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', borderRadius: '32px' }}
            >
              {/* Sidebar for Modal */}
              <div style={{ width: '240px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2rem', color: '#0f172a' }}>Update Institution</h2>
                
                {[
                  { id: 'leaders', label: 'Core Leadership', icon: UserCog, color: '#3b82f6' },
                  { id: 'emergency', label: 'Emergency Responders', icon: Shield, color: '#ef4444' },
                  { id: 'health', label: 'Medical Experts', icon: HeartPulse, color: '#10b981' }
                ].map((t: any) => (
                  <button
                    key={t.id}
                    onClick={() => setModalTab(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '0.85rem 1rem',
                      borderRadius: '16px',
                      background: modalTab === t.id ? 'white' : 'transparent',
                      color: modalTab === t.id ? t.color : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      boxShadow: modalTab === t.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <t.icon size={18} /> {t.label} 
                    {modalTab === t.id && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                  </button>
                ))}
                
                <div style={{ marginTop: 'auto', padding: '1rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>Changes will be saved once you click 'Save Changes' at the bottom.</p>
                </div>
              </div>

              {/* Main Modal Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '2.5rem', flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{
                        modalTab === 'leaders' ? 'Institutional Leadership' : 
                        modalTab === 'emergency' ? 'Emergency Support' : 'Medical Support'
                      }</h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Assign and update official profiles for your institution.</p>
                    </div>
                    <button onClick={() => setShowEditLeadership(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                      <X size={20} />
                    </button>
                  </div>

                  {modalTab === 'leaders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <ProfessionalEditField title="Principal" form={leadershipForm} setForm={setLeadershipForm} prefix="principal" color="#3b82f6" />
                      <ProfessionalEditField title="Vice Principal" form={leadershipForm} setForm={setLeadershipForm} prefix="vicePrincipal" color="#8b5cf6" />
                    </div>
                  )}

                  {modalTab === 'emergency' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <ProfessionalEditField title="Fire Department" form={leadershipForm} setForm={setLeadershipForm} prefix="fireDept" color="#f97316" />
                      <ProfessionalEditField title="Police Station" form={leadershipForm} setForm={setLeadershipForm} prefix="police" color="#3b82f6" />
                      <ProfessionalEditField title="NDRF Trainer" form={leadershipForm} setForm={setLeadershipForm} prefix="ndrf" color="#16a34a" />
                    </div>
                  )}

                  {modalTab === 'health' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <ProfessionalEditField title="School Nurse" form={leadershipForm} setForm={setLeadershipForm} prefix="nurse" color="#10b981" />
                      <ProfessionalEditField title="Gynecologist" form={leadershipForm} setForm={setLeadershipForm} prefix="gynecologist" color="#ec4899" />
                      <ProfessionalEditField title="Pediatrician" form={leadershipForm} setForm={setLeadershipForm} prefix="pediatrician" color="#8b5cf6" />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1.5rem 2.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button onClick={() => setShowEditLeadership(false)} className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, borderRadius: '14px', padding: '0.75rem 1.5rem' }}>
                    Cancel
                  </button>
                  <button onClick={handleUpdateLeadership} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 700, borderRadius: '14px', boxShadow: '0 10px 15px -3px rgba(var(--primary-rgb), 0.3)' }}>
                    Save All Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
