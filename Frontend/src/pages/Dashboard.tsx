import React, { useEffect, useState, useMemo } from 'react';
import { schoolService, authService, dashboardService } from '../services/api';
import { LayoutDashboard, LogOut, School, ShieldCheck, Mail, Phone, Calendar, ClipboardList, CalendarPlus, Users, Award } from 'lucide-react';

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
import { motion } from 'framer-motion';
import ChildRecords from './ChildRecords';
import Events from './Events';
import Ambassadors from './Ambassadors';
import Certifications from './Certifications';

type TabId = 'dashboard' | 'school-details' | 'events' | 'ambassadors' | 'certifications' | 'records';

const Dashboard: React.FC = () => {
  const [school, setSchool] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userStr = localStorage.getItem('school_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role ?? '';

  const visibleTabs = useMemo(() => {
    const tabs: TabId[] = ['dashboard', 'school-details', 'events', 'ambassadors', 'certifications', 'records'];
    return tabs.filter((t) => canSeeTab(role, t));
  }, [role]);

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  useEffect(() => {
    if (!visibleTabs.length) return;
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [visibleTabs, activeTab]);

  useEffect(() => {
    const fetchSchool = async () => {
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
    if (school && activeTab === 'dashboard') {
      const ay = school.academicYear || '2024-2025';
      dashboardService.getOverview(ay).then(setOverview).catch(() => setOverview(null));
    }
  }, [school, activeTab]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: 'var(--primary)' }}>Loading Dashboard...</div>;

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
        </nav>

        <button onClick={handleLogout} className="btn" style={{ background: '#fee2e2', color: '#dc2626', width: '100%' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem' }}>
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ padding: '2.5rem', background: 'white', maxWidth: '800px' }}
            >
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>School Profile</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Read-only view of registration details</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem 3rem' }}>
                <DetailRow label="School name" value={school.schoolName} />
                <DetailRow label="UDISE+ Code" value={school.udiseCode} />
                <DetailRow label="Registration number" value={school.registrationNo} />
                <DetailRow label="School type" value={school.schoolType} />
                <DetailRow label="Board affiliation" value={school.boardAffiliation} />
                <DetailRow label="Academic year" value={school.academicYear} />
                <DetailRow label="Channel" value={school.channel} />
                <DetailRow label="Principal name" value={school.principalName} />
                <DetailRow label="Principal contact" value={school.principalContact} />
                <DetailRow label="School email" value={school.schoolEmail} />
                <DetailRow label="Total student strength" value={school.studentStrength?.toLocaleString()} />
              </div>
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Full address</p>
                <p style={{ lineHeight: 1.6 }}>{school.address}, {school.city}, {school.state} – {school.pincode}</p>
              </div>
              {(school.pocName || school.pocMobile || school.pocEmail) && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Point of contact (if different)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <DetailRow label="Name" value={school.pocName} />
                    <DetailRow label="Designation" value={school.pocDesignation} />
                    <DetailRow label="Mobile" value={school.pocMobile} />
                    <DetailRow label="Email" value={school.pocEmail} />
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'events' ? (
            <Events />
          ) : activeTab === 'ambassadors' ? (
            <Ambassadors />
          ) : activeTab === 'certifications' ? (
            <Certifications />
          ) : activeTab === 'dashboard' ? (
            <div>
              {overview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}
                >
                  <div className="glass-card" style={{ padding: '1.25rem', background: 'white' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Checkup Coverage</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: overview.coveragePercent >= 70 ? '#166534' : overview.coveragePercent >= 50 ? '#92400e' : '#991b1b' }}>{overview.coveragePercent}%</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{overview.studentsWithCheckup} / {overview.totalStudents} students</p>
                  </div>
                  <div className="glass-card" style={{ padding: '1.25rem', background: 'white' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Drill Completion</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: overview.drillPercent >= 50 ? '#166534' : '#991b1b' }}>{overview.drillPercent}%</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{overview.drillCompleted} / {overview.drillRequired} drills</p>
                  </div>
                  <div className="glass-card" style={{ padding: '1.25rem', background: 'white' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Certifications</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{overview.certificationCount}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{overview.certificationActive} active, {overview.certificationPending} pending</p>
                  </div>
                  {overview.isHighRisk && (
                    <div className="glass-card" style={{ padding: '1.25rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <p style={{ fontSize: '0.8rem', color: '#991b1b', marginBottom: '4px', fontWeight: 600 }}>High Risk</p>
                      <p style={{ fontSize: '0.85rem', color: '#991b1b' }}>{overview.highRiskFlags.slice(0, 2).join('; ')}</p>
                    </div>
                  )}
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
      </main>
    </div>
  );
};

export default Dashboard;
