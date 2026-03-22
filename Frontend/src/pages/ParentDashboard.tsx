import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { parentService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Calendar, FileText, History,
  LogOut, ShieldAlert, CheckCircle2, Award, HeartPulse,
  ChevronRight, ArrowLeft, Download, Info, Shield, Bell, X, Check, Link as LinkIcon, CreditCard, GraduationCap, MapPin, Phone, Mail, User
} from 'lucide-react';
import { CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';
import QRCode from 'react-qr-code';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const ParentDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('health');
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [accessHistory, setAccessHistory] = useState<{ id: number; action: string; actorType: string; description: string; createdAt: string }[]>([]);
  const [idCardLoading, setIdCardLoading] = useState(false);
  const navigate = useNavigate();

  const uploadsBase = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

  const openIdCard = async () => {
    if (!id) return;
    setIdCardLoading(true);
    try {
      const token = await parentService.getCardToken(parseInt(id));
      window.open(`${window.location.origin}/card/${token}`, '_blank', 'noopener');
    } catch (err) {
      console.error(err);
      alert('Failed to load ID card');
    } finally {
      setIdCardLoading(false);
    }
  };

  const fetchAccessRequests = async () => {
    const token = localStorage.getItem('parent_token');
    if (!token) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/access/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccessRequests(res.data);
    } catch (e) { /* ignore */ }
  };

  const handleApprove = async (reqId: number) => {
    const token = localStorage.getItem('parent_token');
    try {
      await axios.patch(`${BACKEND_URL}/access/requests/${reqId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccessRequests();
    } catch (e) { /* ignore */ }
  };

  const handleDeny = async (reqId: number) => {
    const token = localStorage.getItem('parent_token');
    try {
      await axios.patch(`${BACKEND_URL}/access/requests/${reqId}/deny`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccessRequests();
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardData = await parentService.getChildDashboard(parseInt(id!));
        setData(dashboardData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
        if (err.response?.status === 401) {
          navigate('/parent-login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [id, navigate]);

  useEffect(() => {
    if (activeTab === 'reports') fetchAccessRequests();
  }, [activeTab]);

  const fetchAccessHistory = async () => {
    if (!id) return;
    try {
      const entries = await parentService.getAccessHistory(parseInt(id));
      setAccessHistory(entries);
    } catch (e) { setAccessHistory([]); }
  };

  useEffect(() => {
    if (activeTab === 'access-history') fetchAccessHistory();
  }, [activeTab, id]);

  const handleLogout = () => {
    parentService.logout();
    navigate('/parent-login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ color: '#2563eb' }}>
        <Activity size={48} />
      </motion.div>
    </div>
  );

  if (error) return (
     <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#f8fafc' }}>
        <ShieldAlert size={64} color="#ef4444" />
        <h2 style={{ color: '#1e293b' }}>{error}</h2>
        <button onClick={() => navigate('/parent-login')} className="btn btn-primary">Go Back</button>
     </div>
  );

  const getBmiColor = (category: string) => {
    switch(category) {
      case 'NORMAL': return '#22c55e';
      case 'OVERWEIGHT':
      case 'OBESE': return '#ef4444';
      case 'UNDERWEIGHT': return '#f59e0b';
      default: return '#64748b';
    }
  };



  const healthRecords: any[] = data?.healthRecords || [];
  const currentRecord = healthRecords[0] || {};
  const notifications: any[] = data?.notifications || [];

  const bmiTrend = healthRecords.slice().reverse().map((r: any) => ({
    name: r.academicYear,
    bmi: r.bmi,
    weight: r.weight,
    height: r.height
  }));



  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', paddingBottom: '2rem' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/parent/children')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a' }}>{data?.child.name}</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Class {data?.child.class}-{data?.child.section} • {data?.child.registrationNo}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #fee2e2', color: '#ef4444', background: '#fff1f1', fontWeight: '600', cursor: 'pointer' }}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem', background: 'white', borderRadius: '16px', borderLeft: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Bell size={20} color="#2563eb" />
              <h4 style={{ fontWeight: '700', color: '#1e293b', margin: 0 }}>Notifications</h4>
              <span style={{ fontSize: '0.8rem', background: '#eff6ff', color: '#2563eb', padding: '2px 10px', borderRadius: '20px', fontWeight: '600' }}>
                {notifications.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: n.priority === 'high' ? '#fef2f2' : '#f8fafc',
                    border: `1px solid ${n.priority === 'high' ? '#fecaca' : '#e2e8f0'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: n.type === 'referral' ? '#fee2e2' : n.type === 'finding' ? '#fef3c7' : '#dbeafe',
                    color: n.type === 'referral' ? '#dc2626' : n.type === 'finding' ? '#d97706' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {n.type === 'upcoming' ? <Calendar size={18} /> : <ShieldAlert size={18} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '700', color: '#1e293b', margin: 0, fontSize: '0.95rem' }}>{n.title}</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>{n.message}</p>
                    {n.date && (
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                        {new Date(n.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { id: 'health', label: 'Health Status', icon: HeartPulse },
            { id: 'programs', label: 'Safety & Programs', icon: Calendar },
            { id: 'reports', label: 'Medical Reports', icon: FileText },
            { id: 'access-history', label: 'Access History', icon: History },
            { id: 'school', label: 'School Info', icon: GraduationCap },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 0.5rem', border: 'none',
                background: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: activeTab === tab.id ? '600' : '500',
                color: activeTab === tab.id ? '#1e3a8a' : '#64748b',
                borderBottom: activeTab === tab.id ? '3px solid #1e3a8a' : '3px solid transparent',
                marginBottom: '-2px', transition: 'all 0.2s'
              }}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'health' && (
            <motion.div key="health" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '0.9rem', color: '#1e40af' }}>
                <strong>Understanding your child's health data:</strong> BMI and screening results help track growth and wellness. If you see a referral recommendation or abnormal finding, please consult your child's doctor for follow-up. This dashboard is for informational purposes and does not replace medical advice.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Current Vitals</h3>
                    <CheckCircle2 size={24} color="#22c55e" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px' }}>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Height</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{currentRecord.height} cm</p>
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px' }}>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Weight</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{currentRecord.weight} kg</p>
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', gridColumn: 'span 2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>BMI Index</p>
                          <p style={{ fontSize: '1.5rem', fontWeight: '900', color: getBmiColor(currentRecord.bmiCategory) }}>{currentRecord.bmi} <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>({currentRecord.bmiCategory})</span></p>
                        </div>
                        <Activity size={32} color={getBmiColor(currentRecord.bmiCategory)} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Latest Screenings</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                        <CheckCircle2 size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Dental Screening</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Overall: {currentRecord.dentalOverallHealth || 'Normal'}</p>
                      </div>
                      <Award size={20} color="#fbbf24" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                        <CheckCircle2 size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Vision Screening</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Overall: {currentRecord.visionOverall || 'Normal'}</p>
                      </div>
                      <Award size={20} color="#fbbf24" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem', background: 'white', borderRadius: '16px', height: '400px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>BMI Progress Trend</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={bmiTrend}>
                    <defs>
                      <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} cursor={{ stroke: '#2563eb', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="bmi" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorBmi)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {activeTab === 'programs' && (
            <motion.div key="programs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                  <div className="glass-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Program Participation History</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Latest 10 activities</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {data?.attendanceHistory && data.attendanceHistory.length > 0 ? (
                        data.attendanceHistory.map((ev: any, idx: number) => (
                          <div 
                            key={idx} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '1.25rem', 
                              borderRadius: '16px', 
                              border: '1px solid #f1f5f9',
                              background: ev.status === 'Present' ? '#f0fdf4' : ev.status === 'Absent' ? '#fff1f2' : '#f8fafc',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '10px', 
                                background: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: ev.status === 'Present' ? '#16a34a' : ev.status === 'Absent' ? '#dc2626' : '#64748b',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                              }}>
                                {ev.type === 'IMMUNIZATION' ? <Activity size={20} /> : <Calendar size={20} />}
                              </div>
                              <div>
                                <p style={{ fontWeight: '700', color: '#1e293b', margin: 0 }}>{ev.title}</p>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                                  {new Date(ev.scheduledAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </p>
                              </div>
                            </div>
                            <div style={{ 
                              padding: '6px 14px', 
                              borderRadius: '20px', 
                              fontSize: '0.75rem', 
                              fontWeight: '700',
                              background: ev.status === 'Present' ? '#22c55e' : ev.status === 'Absent' ? '#ef4444' : '#64748b',
                              color: 'white',
                              minWidth: '85px',
                              textAlign: 'center'
                            }}>
                              {ev.status.toUpperCase()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8', border: '2px dashed #e2e8f0' }}>
                          No participation history found.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.5rem', background: '#1e3a8a', color: 'white', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Upcoming Activities</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {data?.upcomingEvents.length > 0 ? data.upcomingEvents.map((evt: any) => (
                        <div key={evt.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                            <Calendar size={20} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{evt.title}</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{new Date(evt.scheduledAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                      )) : (
                        <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>No activities scheduled.</p>
                      )}
                    </div>
                    <button style={{ width: '100%', marginTop: '2rem', padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      View Full Calendar <ChevronRight size={16} />
                    </button>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <div className="glass-card" style={{ padding: '2rem', background: 'white', borderRadius: '16px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>All Health Reports</h3>
                    <Info size={18} color="#94a3b8" />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {healthRecords.length > 0 ? healthRecords.map((rec: any) => (
                      <div key={rec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a' }}>
                            <FileText size={24} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '700', fontSize: '1rem' }}>Annual Health Checkup Report</p>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Academic Year: {rec.academicYear} • {rec.checkupDate ? new Date(rec.checkupDate).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                           {rec.reportFile ? (
                              <a 
                                href={`${uploadsBase}/uploads/${rec.reportFile}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}
                              >
                                <Download size={18} /> Download PDF
                              </a>
                           ) : (
                              <button disabled style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#94a3b8', fontWeight: '600', cursor: 'not-allowed' }}>
                                <Download size={18} /> No File
                              </button>
                           )}
                           <button style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', cursor: 'pointer' }}>
                             <ChevronRight size={20} />
                           </button>
                        </div>
                      </div>
                    )) : (
                      <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No reports available for this student.</p>
                    )}
                 </div>
               </div>

               {/* Digital Health ID Card + Emergency QR Access */}
               <div style={{ marginTop: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                 <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                   <div style={{ flex: 1 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
                       <Shield size={28} />
                       <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Emergency Health ID Card</h3>
                     </div>
                     <p style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                       Anyone who scans this QR can send a <strong>request</strong> to view vital health data. You must approve the request before it's shown.
                     </p>
                     <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                       <button 
                          onClick={() => {
                            const url = `${window.location.origin}/emergency-access/${id}`;
                            navigator.clipboard.writeText(url);
                            alert('Emergency link copied to clipboard!');
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                         <LinkIcon size={14} /> Copy Emergency Link
                       </button>
                       <button 
                          onClick={openIdCard}
                          disabled={idCardLoading}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: idCardLoading ? 'wait' : 'pointer', fontSize: '0.85rem' }}
                        >
                         <CreditCard size={14} /> {idCardLoading ? 'Opening...' : 'Download ID Card'}
                       </button>
                     </div>
                   </div>
                   <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                     <QRCode
                       value={`${window.location.origin}/emergency-access/${id}`}
                       size={130}
                       fgColor="#1e3a8a"
                       level="M"
                     />
                     <span style={{ fontSize: '0.7rem', color: '#1e3a8a', fontWeight: '900' }}>#{data?.child.registrationNo}</span>
                   </div>
                 </div>

                 <div style={{ padding: '1.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                     <Bell size={18} color="#1e3a8a" />
                     <h4 style={{ fontWeight: '700', color: '#1e293b' }}>Access Requests</h4>
                     <span style={{ fontSize: '0.8rem', background: '#eff6ff', color: '#2563eb', padding: '2px 10px', borderRadius: '20px', fontWeight: '600' }}>
                       {accessRequests.filter(r => r.status === 'PENDING').length} pending
                     </span>
                     <button onClick={fetchAccessRequests} style={{ marginLeft: 'auto', fontSize: '0.8rem', background: '#f1f5f9', border: 'none', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Refresh</button>
                   </div>

                   {accessRequests.length === 0 ? (
                     <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No requests yet. Share the QR code with authorized personnel.</p>
                   ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                       {accessRequests.map((req: any) => (
                         <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '12px', border: '1px solid', borderColor: req.status === 'PENDING' ? '#fde68a' : req.status === 'APPROVED' ? '#bbf7d0' : '#fecaca', background: req.status === 'PENDING' ? '#fffbeb' : req.status === 'APPROVED' ? '#f0fdf4' : '#fff1f2', flexWrap: 'wrap', gap: '0.75rem' }}>
                           <div style={{ flex: 1 }}>
                             <p style={{ fontWeight: '700', color: '#1e293b' }}>{req.requesterName} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>({req.requesterRole})</span></p>
                             <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>{req.reason}</p>
                             <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>📞 {req.requesterPhone} • {new Date(req.createdAt).toLocaleString()}</p>
                           </div>
                           <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                             {req.status === 'PENDING' ? (
                               <>
                                 <button onClick={() => handleApprove(req.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                                   <Check size={14} /> Approve
                                 </button>
                                 <button onClick={() => handleDeny(req.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #fca5a5', background: 'white', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                                   <X size={14} /> Deny
                                 </button>
                               </>
                             ) : (
                               <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', background: req.status === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: req.status === 'APPROVED' ? '#16a34a' : '#dc2626' }}>
                                 {req.status}
                               </span>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'access-history' && (
            <motion.div key="access-history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card" style={{ padding: '2rem', background: 'white', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                  <History size={22} color="#1e3a8a" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Who has accessed my child&apos;s data</h3>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  This log shows when emergency access was granted and when your child&apos;s emergency data was viewed by responders.
                </p>
                {accessHistory.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No access events recorded yet.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {accessHistory.map((entry) => (
                      <li
                        key={entry.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem 1.25rem',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                          <Shield size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>{entry.description}</p>
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                            {new Date(entry.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
          {activeTab === 'school' && (
            <motion.div key="school" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card" style={{ padding: '2rem', background: 'white', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                  <GraduationCap size={22} color="#1e3a8a" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>School Information</h3>
                </div>

                {!data?.child?.school ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>School details not available.</p>
                ) : (() => {
                  const school = data.child.school;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* School Name & Type */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '1.25rem', borderRadius: '14px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <GraduationCap size={26} color="white" />
                        </div>
                        <div>
                          <h4 style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '1.15rem', margin: 0 }}>{school.schoolName}</h4>
                          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>{school.schoolType} • {school.boardAffiliation}</p>
                          {school.udiseCode && (
                            <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '2px 0 0 0' }}>UDISE: {school.udiseCode}</p>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                        {/* Address */}
                        <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                            <MapPin size={16} color="#64748b" />
                            <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Address</span>
                          </div>
                          <p style={{ color: '#1e293b', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                            {school.address}<br />
                            {school.city}, {school.state} – {school.pincode}
                          </p>
                        </div>

                        {/* Principal */}
                        <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                            <User size={16} color="#64748b" />
                            <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Principal</span>
                          </div>
                          <p style={{ color: '#1e293b', fontSize: '0.9rem', margin: 0 }}>{school.principalName}</p>
                          {school.principalContact && (
                            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                              <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              {school.principalContact}
                            </p>
                          )}
                        </div>

                        {/* Contact */}
                        <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                            <Mail size={16} color="#64748b" />
                            <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Contact</span>
                          </div>
                          <p style={{ color: '#1e293b', fontSize: '0.9rem', margin: 0 }}>{school.schoolEmail}</p>
                          {school.pocMobile && (
                            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                              <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              {school.pocMobile}
                            </p>
                          )}
                        </div>

                        {/* Nurse / Counsellor */}
                        {(school.nurseCounsellorName || school.nurseName) && (
                          <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                              <HeartPulse size={16} color="#64748b" />
                              <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Nurse / Counsellor</span>
                            </div>
                            <p style={{ color: '#1e293b', fontSize: '0.9rem', margin: 0 }}>{school.nurseCounsellorName || school.nurseName}</p>
                            {(school.nurseCounsellorContact || school.nurseContact) && (
                              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                                <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                {school.nurseCounsellorContact || school.nurseContact}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reg Number */}
                      <div style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={15} color="#94a3b8" />
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Registration No: <strong style={{ color: '#1e293b' }}>{school.registrationNo}</strong></span>
                        {school.studentStrength && (
                          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b' }}>Total Students: <strong style={{ color: '#1e293b' }}>{school.studentStrength}</strong></span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ParentDashboard;
