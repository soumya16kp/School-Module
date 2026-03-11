import React, { useEffect, useState } from 'react';
import { schoolService, authService } from '../services/api';
import { LayoutDashboard, LogOut, School, ShieldCheck, Mail, Phone, Calendar, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import ChildRecords from './ChildRecords';

const Dashboard: React.FC = () => {
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records'>('dashboard');
  const userStr = localStorage.getItem('school_user');
  const user = userStr ? JSON.parse(userStr) : null;

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
            <p style={{ color: 'var(--text-muted)' }}>Institution Administration Panel</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#10b981" />
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{school ? 'Registered Institution' : 'Registration Pending'}</span>
             </div>
          </div>
        </div>

        {school ? (
          activeTab === 'dashboard' ? (
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
