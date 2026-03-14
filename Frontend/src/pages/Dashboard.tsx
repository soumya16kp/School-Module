import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolService, authService, dashboardService } from '../services/api';
import { LayoutDashboard, LogOut, School, ShieldCheck, Mail, Phone, Calendar, ClipboardList, CalendarPlus, Users, Award, Heart, Globe, ShieldAlert } from 'lucide-react';

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
      return ['SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'STAFF', 'WOMBTO18_OPS'].includes(role);
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
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CircularProgress } from '../components/CircularProgress';
import ChildRecords from './ChildRecords';
import Events from './Events';
import Ambassadors from './Ambassadors';
import Certifications from './Certifications';
import StaffManagement from './StaffManagement';
import PartnerDashboard from './PartnerDashboard';

type TabId = 'dashboard' | 'school-details' | 'events' | 'ambassadors' | 'certifications' | 'records' | 'available-schools' | 'my-donations';

const Dashboard: React.FC = () => {
  const userStr = localStorage.getItem('school_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role ?? '';
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'PARTNER') {
      navigate('/partner/dashboard');
    }
  }, [role, navigate]);



  const [school, setSchool] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [districtOverview, setDistrictOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // const [partnerStats, setPartnerStats] = useState({ totalAmount: 0, count: 0 });

  const visibleTabs = useMemo(() => {
    const tabs: TabId[] = ['dashboard', 'school-details', 'events', 'ambassadors', 'certifications', 'records', 'available-schools', 'my-donations'];
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

  // useEffect(() => {
  //   if (role === 'PARTNER' && activeTab === 'dashboard') {
  //     partnerService.getDonations().then(data => {
  //       const total = data.reduce((sum: number, d: any) => sum + d.amount, 0);
  //       setPartnerStats({ totalAmount: total, count: data.length });
  //     }).catch(() => {});
  //   }
  // }, [role, activeTab]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
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
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'school-details', label: 'School Details', icon: School },
            { id: 'events', label: 'Events', icon: CalendarPlus },
            { id: 'ambassadors', label: 'Ambassadors', icon: Users },
            { id: 'certifications', label: 'Certifications', icon: Award },
            { id: 'records', label: 'Records', icon: ClipboardList },
            { id: 'available-schools', label: 'Browse Schools', icon: Globe },
            { id: 'my-donations', label: 'My Donations', icon: Heart }
          ].filter(tab => canSeeTab(role, tab.id)).map(tab => (
            <motion.div 
              key={tab.id}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as TabId)}
              style={{ 
                background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent', 
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)', 
                padding: '0.85rem 1.25rem', 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                fontWeight: activeTab === tab.id ? '600' : '500', 
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: activeTab === tab.id ? '1px solid rgba(37, 99, 235, 0.1)' : '1px solid transparent'
              }}
            >
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} /> 
              <span style={{ fontSize: '0.95rem' }}>{tab.label}</span>
            </motion.div>
          ))}
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
            <>
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
            
            {['SCHOOL_ADMIN', 'PRINCIPAL'].includes(role) && (
              <div style={{ marginTop: '3rem' }}>
                <StaffManagement />
              </div>
            )}
          </>
          ) : activeTab === 'events' ? (
            <Events />
          ) : activeTab === 'ambassadors' ? (
            <Ambassadors />
          ) : activeTab === 'certifications' ? (
            <Certifications />
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                    style={{ padding: '1.5rem', background: 'white', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                  >
                    <CircularProgress 
                      percentage={overview.coveragePercent} 
                      size={90} 
                      strokeWidth={8} 
                      color={overview.coveragePercent >= 70 ? '#16a34a' : overview.coveragePercent >= 50 ? '#ca8a04' : '#dc2626'} 
                      subLabel="Cover"
                    />
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Checkup Coverage</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {overview.studentsWithCheckup} / {overview.totalStudents} <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Students</span>
                      </p>
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: overview.coveragePercent >= 70 ? '#16a34a' : '#dc2626' }}></div>
                         <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{overview.coveragePercent >= 70 ? 'On Track' : 'Action Needed'}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card"
                    style={{ padding: '1.5rem', background: 'white', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                  >
                    <CircularProgress 
                      percentage={overview.drillPercent} 
                      size={90} 
                      strokeWidth={8} 
                      color={overview.drillPercent >= 50 ? '#16a34a' : '#dc2626'} 
                      subLabel="Drill"
                    />
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Drill Completion</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {overview.drillCompleted} / {overview.drillRequired} <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Drills</span>
                      </p>
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: overview.drillPercent >= 50 ? '#16a34a' : '#dc2626' }}></div>
                         <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{overview.drillPercent >= 50 ? 'Requirement Met' : 'Incomplete'}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card"
                    style={{ padding: '1.5rem', background: 'white', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                  >
                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Award size={40} color="var(--primary)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Certifications</h3>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{overview.certificationCount}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{overview.certificationActive} active, {overview.certificationPending} pending</p>
                    </div>
                  </motion.div>

                  {overview.isHighRisk && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card"
                      style={{ padding: '1.5rem', background: '#fff1f2', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <ShieldAlert size={20} color="#dc2626" />
                        <h3 style={{ fontSize: '1rem', color: '#991b1b', margin: 0 }}>High Risk Alert</h3>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#991b1b', lineHeight: 1.4 }}>{overview.highRiskFlags.slice(0, 2).join('; ')}</p>
                    </motion.div>
                  )}

                </div>
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
