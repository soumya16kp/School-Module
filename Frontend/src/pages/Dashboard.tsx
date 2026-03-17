import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { schoolService, authService, dashboardService, partnerService } from '../services/api';
import { LayoutDashboard, LogOut, School, ShieldCheck, Mail, Phone, Calendar, ClipboardList, CalendarPlus, Users, Award, Heart, Globe, Activity, Eye, Smile, Pencil, UserCircle, UserCog } from 'lucide-react';

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
    case 'ambassadors':
      return ['SCHOOL_ADMIN', 'PRINCIPAL', 'WOMBTO18_OPS'].includes(role);
    case 'certifications':
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

const LeadershipSection = ({ title, form, setForm, prefix }: any) => (
  <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#f8fafc' }}>
    <p style={{ fontWeight: 800, fontSize: '0.7rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>{title}</p>
    <div style={{ display: 'grid', gap: '1rem' }}>
      <input 
        placeholder="Full Name" 
        value={form[`${prefix}Name`] || ''} 
        onChange={e => setForm({...form, [`${prefix}Name`]: e.target.value})}
        className="form-control"
        style={{ padding: '0.75rem', fontSize: '0.9rem' }}
      />
      <input 
        placeholder="Contact Info (Email/Phone)" 
        value={form[`${prefix}Contact`] || ''} 
        onChange={e => setForm({...form, [`${prefix}Contact`]: e.target.value})}
        className="form-control"
        style={{ padding: '0.75rem', fontSize: '0.9rem' }}
      />
      <input 
        placeholder="Avatar Image URL" 
        value={form[`${prefix}Image`] || ''} 
        onChange={e => setForm({...form, [`${prefix}Image`]: e.target.value})}
        className="form-control"
        style={{ padding: '0.75rem', fontSize: '0.9rem' }}
      />
    </div>
  </div>
);
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ChildRecords from './ChildRecords';
import Events from './Events';
import Ambassadors from './Ambassadors';
import Certifications from './Certifications';
import PartnerDashboard from './PartnerDashboard';
import StaffManagement from './StaffManagement';
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
    const tabs: TabId[] = ['dashboard', 'school-details', 'events', 'ambassadors', 'certifications', 'records', 'staff', 'available-schools', 'my-donations'];
    return tabs.filter((t) => canSeeTab(role, t));
  }, [role]);

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
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
        .getOverview(ay)
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
        nurseCounsellorName: school.nurseCounsellorName || '',
        nurseCounsellorContact: school.nurseCounsellorContact || '',
        nurseCounsellorImage: school.nurseCounsellorImage || '',
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
          ) : activeTab === 'school-details' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
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
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  {/* Principal */}
                  <div style={{ padding: '2rem', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                      {school.principalImage ? (
                        <img src={school.principalImage} alt="Principal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <UserCircle size={50} color="#3b82f6" />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.025em' }}>Principal</p>
                      <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b', marginBottom: '4px' }}>{school.principalName}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>{school.principalContact}</p>
                    </div>
                  </div>

                  {/* Vice Principal */}
                  <div style={{ padding: '2rem', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                      {school.vicePrincipalImage ? (
                        <img src={school.vicePrincipalImage} alt="Vice Principal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <UserCircle size={50} color="#8b5cf6" />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.025em' }}>Vice Principal</p>
                      <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b', marginBottom: '4px' }}>{school.vicePrincipalName || 'Not Assigned'}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>{school.vicePrincipalContact || '—'}</p>
                    </div>
                  </div>

                  {/* Nurse / Counsellor */}
                  <div style={{ padding: '2rem', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                      {school.nurseCounsellorImage ? (
                        <img src={school.nurseCounsellorImage} alt="Nurse" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <UserCircle size={50} color="#10b981" />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.025em' }}>Nurse / Counsellor</p>
                      <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b', marginBottom: '4px' }}>{school.nurseCounsellorName || 'Not Assigned'}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>{school.nurseCounsellorContact || '—'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

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
          ) : activeTab === 'ambassadors' ? (
            <Ambassadors />
          ) : activeTab === 'certifications' ? (
            <Certifications />
          ) : activeTab === 'staff' ? (
            <StaffManagement />
          ) : activeTab === 'dashboard' ? (
            <div>
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
                    {/* Dental Card */}
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
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{overview.prevalence.dentalHealthy}</span> out of {overview.prevalence.screened} students screened have no major issues.
                      </p>
                    </div>

                    {/* Vision Card */}
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
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{overview.prevalence.visionNormal}</span> out of {overview.prevalence.screened} students screened have 6/6 or normal vision.
                      </p>
                    </div>

                    {/* BMI Card */}
                    <div className="glass-card" style={{ padding: '1.5rem', background: 'white', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Activity size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>Body Mass Index</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{overview.prevalence.bmiNormalPercent}%</span>
                            <span style={{ fontSize: '0.85rem', color: '#db2777', fontWeight: 600 }}>Correct BMI</span>
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
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{overview.prevalence.bmiNormal}</span> out of {overview.prevalence.screened} students screened are in the healthy BMI range.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              {/* School Details */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card" 
                style={{ padding: '2.5rem', background: 'white' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem' }}>{school.schoolName}</h2>
                  <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                    {school.registrationNo}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Affiliation</p>
                    <p style={{ fontWeight: '500' }}>{school.boardAffiliation} ({school.schoolType})</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Principal</p>
                    <p style={{ fontWeight: '500' }}>{school.principalName}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Contact Email</p>
                    <p style={{ fontWeight: '500' }}>{school.schoolEmail}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Strength</p>
                    <p style={{ fontWeight: '500' }}>{school.studentStrength.toLocaleString()} Students</p>
                  </div>
                </div>
                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>INSTITUTION ADDRESS</p>
                  <p style={{ lineHeight: '1.6' }}>{school.address}, {school.city}, {school.state} - {school.pincode}</p>
                </div>
              </motion.div>
              {/* Quick Actions / Status */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card" 
                style={{ padding: '2rem', height: 'fit-content' }}
              >
                <h3 style={{ marginBottom: '1.5rem' }}>Quick Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={18} color="var(--text-muted)" />
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered On</p>
                      <p style={{ fontWeight: '500' }}>{new Date(school.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mail size={18} color="var(--text-muted)" />
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official Email</p>
                      <p style={{ fontWeight: '500' }}>{school.schoolEmail}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Phone size={18} color="var(--text-muted)" />
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact No</p>
                      <p style={{ fontWeight: '500' }}>{school.principalContact}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            </div>
          ) : activeTab === 'records' ? (
            <ChildRecords />
          ) : (
            <ChildRecords />
          )

        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '24px', border: '2px dashed var(--border)' }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <School size={60} color="var(--text-muted)" style={{ opacity: 0.3 }} />
            </div>
            <h2 style={{ marginBottom: '1rem' }}>No School Linked Yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please complete your institutional registration to access the dashboard features.</p>
            <button onClick={() => window.location.href = '/register-school'} className="btn btn-primary">
              Register Institution Now
            </button>
          </motion.div>
        )}

        {/* Edit Leadership Modal */}
        {showEditLeadership && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="glass-card" 
              style={{ padding: '2.5rem', background: 'white', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Update Leadership</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Modify the medical and administrative heads of the institution.</p>
              </div>
              
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <LeadershipSection 
                  title="Principal" 
                  form={leadershipForm} 
                  setForm={setLeadershipForm} 
                  prefix="principal" 
                />
                <LeadershipSection 
                  title="Vice Principal" 
                  form={leadershipForm} 
                  setForm={setLeadershipForm} 
                  prefix="vicePrincipal" 
                />
                <LeadershipSection 
                  title="Nurse / Counsellor" 
                  form={leadershipForm} 
                  setForm={setLeadershipForm} 
                  prefix="nurseCounsellor" 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  onClick={() => setShowEditLeadership(false)}
                  className="btn btn-outline" 
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateLeadership}
                  className="btn btn-primary" 
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
