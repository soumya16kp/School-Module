import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { schoolService, authService, dashboardService, partnerService } from '../services/api';
import { LayoutDashboard, LogOut, School, ShieldCheck, Mail, Phone, ClipboardList, CalendarPlus, Award, Heart, Globe, Activity, Eye, Smile, Pencil, UserCircle, UserCog, Upload, X, Shield, ChevronRight, HeartPulse, Flame, HardHat, Stethoscope, Baby, Users } from 'lucide-react';

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
    default:
      return false;
  }
};

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

type TabId = 'dashboard' | 'school-details' | 'events' | 'ambassadors' | 'certifications' | 'records' | 'staff' | 'available-schools' | 'my-donations';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userStr = localStorage.getItem('school_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role ?? '';

  const [school, setSchool] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [districtOverview, setDistrictOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [partnerStats, setPartnerStats] = useState({ totalAmount: 0, count: 0 });
  const [showEditLeadership, setShowEditLeadership] = useState(false);
  const [leadershipForm, setLeadershipForm] = useState<any>({});

  const visibleTabs = useMemo(() => {
    const tabs: TabId[] = ['dashboard', 'school-details', 'events', 'certifications', 'ambassadors', 'records', 'staff', 'available-schools', 'my-donations'];
    return tabs.filter((t) => canSeeTab(role, t));
  }, [role]);

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
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

  useEffect(() => {
    const fetchSchool = async () => {
      if (role === 'PARTNER') {
        setLoading(false);
        return;
      }
      try {
        const data = await schoolService.getMySchool();
        setSchool(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, []);

  useEffect(() => {
    const ay = school?.academicYear || '2024-2025';
    if (activeTab !== 'dashboard') return;

    if (role === 'DISTRICT_VIEWER') {
      dashboardService
        .getDistrictOverview(ay)
        .then(setDistrictOverview)
        .catch(() => setDistrictOverview(null));
    } else if (school) {
      dashboardService
        .getOverview(ay, user?.assignedClass ?? undefined, user?.assignedSection ?? undefined)
        .then(setOverview)
        .catch(() => setOverview(null));
    }
  }, [school, activeTab]);

  useEffect(() => {
    if (role === 'PARTNER' && activeTab === 'dashboard') {
      partnerService.getDonations().then(data => {
        const total = data.reduce((sum: number, d: any) => sum + d.amount, 0);
        setPartnerStats({ totalAmount: total, count: data.length });
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
      const updated = await schoolService.getMySchool();
      setSchool(updated);
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
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}
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
                      {overview.studentsAbsent > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f1f5f9' }} />
                          <span style={{ color: 'var(--text-muted)' }}>{overview.studentsAbsent} Absent</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '2rem 1.5rem 1.5rem 1.5rem', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem' }}>Drill Completion</p>
                    <CircularProgress 
                      percentage={overview.drillPercent} 
                      size={180} 
                      color="#3b82f6" 
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', fontWeight: 600 }}>{overview.drillCompleted} / {overview.drillRequired} drills</p>
                  </div>
                  <div className="glass-card" style={{ padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>Certifications</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>{overview.certificationCount}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{overview.certificationActive} active, {overview.certificationPending} pending</p>
                  </div>
                  {overview.isHighRisk && (
                    <div className="glass-card" style={{ padding: '1.25rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <p style={{ fontSize: '0.8rem', color: '#991b1b', marginBottom: '4px', fontWeight: 600 }}>High Risk</p>
                      <p style={{ fontSize: '0.85rem', color: '#991b1b' }}>{overview.highRiskFlags.slice(0, 2).join('; ')}</p>
                    </div>
                  )}
                </motion.div>
              )}
              {overview && overview.prevalence && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: '2rem' }}
                >
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#0f172a' }}>Health Prevalence Overview</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem', background: 'white', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Smile size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>Dental Health</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{overview.prevalence.dentalHealthyPercent}%</span>
                            <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>Healthy</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${overview.prevalence.dentalHealthyPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          style={{ height: '100%', background: '#16a34a', borderRadius: '10px' }} 
                        />
                      </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem', background: 'white', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Eye size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>Eye Vision</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{overview.prevalence.visionNormalPercent}%</span>
                            <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>Normal</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${overview.prevalence.visionNormalPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          style={{ height: '100%', background: '#2563eb', borderRadius: '10px' }} 
                        />
                      </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem', background: 'white', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Activity size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>BMI</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{overview.prevalence.bmiNormalPercent}%</span>
                            <span style={{ fontSize: '0.85rem', color: '#db2777', fontWeight: 600 }}>Correct</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${overview.prevalence.bmiNormalPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                          style={{ height: '100%', background: '#db2777', borderRadius: '10px' }} 
                        />
                      </div>
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
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '450px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              It seems your account hasn&apos;t been connected to an official institution yet. Please complete your registration.
            </p>
            <button 
              onClick={() => navigate('/register-school')}
              className="btn btn-primary" 
              style={{ padding: '1rem 2.5rem', borderRadius: '18px', fontWeight: 800, fontSize: '1rem' }}
            >
              Complete Registration
            </button>
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
