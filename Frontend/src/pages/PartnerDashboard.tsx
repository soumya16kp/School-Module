import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe, Heart, TrendingUp, Gift, School, LogOut, ArrowRight, User } from 'lucide-react';
import { partnerService, authService } from '../services/api';
import PartnerSchools from '../components/PartnerSchools';
import DonationHistory from '../components/DonationHistory';

type PartnerTab = 'home' | 'browse-schools' | 'my-donations';

const PartnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PartnerTab>('home');
  const [stats, setStats] = useState({ totalAmount: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('school_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'PARTNER') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    partnerService.getDonations()
      .then((data: any[]) => {
        const total = data.reduce((sum, d) => sum + d.amount, 0);
        setStats({ totalAmount: total, count: data.length });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  const impactLevel =
    stats.totalAmount > 50000 ? 'Platinum' :
    stats.totalAmount > 10000 ? 'Gold' : 'Silver';

  const impactColor =
    impactLevel === 'Platinum' ? '#7c3aed' :
    impactLevel === 'Gold' ? '#b45309' : '#374151';

  const navItem = (tab: PartnerTab, icon: React.ReactNode, label: string) => (
    <div
      onClick={() => setActiveTab(tab)}
      style={{
        background: activeTab === tab ? 'linear-gradient(135deg, var(--primary) 20%, #db2777 100%)' : 'transparent',
        color: activeTab === tab ? 'white' : '#64748b',
        padding: '0.85rem 1.25rem',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: activeTab === tab ? '0 10px 15px -3px rgba(219, 39, 119, 0.2)' : 'none',
      }}
      className="group"
    >
      <div style={{ transition: 'transform 0.2s' }} className={activeTab === tab ? '' : 'group-hover:scale-110'}>
        {icon}
      </div>
      {label}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', background: 'white', borderRight: '1px solid #f1f5f9', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '3rem', padding: '0 0.75rem' }}>
          <div style={{ padding: '10px', background: 'linear-gradient(135deg, var(--primary) 0%, #be185d 100%)', borderRadius: '14px', boxShadow: '0 4px 12px rgba(219, 39, 119, 0.25)' }}>
            <School color="white" size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e293b', letterSpacing: '-0.02em' }}>WombTo18</h2>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Partner Network</p>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {navItem('home', <TrendingUp size={20} />, 'Impact Overview')}
          {navItem('browse-schools', <Globe size={20} />, 'Discover Schools')}
          {navItem('my-donations', <Heart size={20} />, 'Transaction History')}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          {/* User Profile Summary */}
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
              {user?.name?.charAt(0) || 'P'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{impactLevel} Member</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="group"
            style={{ 
              background: '#fff1f2', 
              color: '#e11d48', 
              width: '100%', 
              padding: '0.85rem', 
              borderRadius: '12px', 
              border: '1px solid #ffe4e6',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        {activeTab === 'browse-schools' ? (
          <PartnerSchools />
        ) : activeTab === 'my-donations' ? (
          <DonationHistory />
        ) : (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Dashboard</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                  Welcome back, <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{user?.name}</span>. Track your philanthropic journey.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right', background: 'white', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                   <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Current Rank</p>
                   <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: impactColor }}>{impactLevel} Contributor</p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            {loading ? (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
                  <p style={{ color: '#64748b', fontWeight: 600 }}>Analyzing impact data...</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3.5rem' }}>
                {/* Total Contributions */}
                <div className="glass-card" style={{ padding: '2.25rem', background: 'white', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)', borderRadius: '0 0 0 100%' }}></div>
                  <div style={{ background: '#ecfdf5', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <TrendingUp size={24} color="#10b981" />
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>Total Contributions</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                      ₹{stats.totalAmount.toLocaleString()}
                    </h3>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#059669', fontWeight: 700, background: '#dcfce7', padding: '4px 10px', borderRadius: '20px', width: 'fit-content' }}>
                    {stats.count} Successful Orders
                  </div>
                </div>

                {/* Impact Level */}
                <div className="glass-card" style={{ padding: '2.25rem', background: 'white', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `linear-gradient(135deg, ${impactColor}10 0%, transparent 100%)`, borderRadius: '0 0 0 100%' }}></div>
                    <div style={{ background: `${impactColor}15`, width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Gift size={24} color={impactColor} />
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>Impact Standing</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: impactColor, margin: 0 }}>
                      {impactLevel}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: impactColor }}></span>
                      Community Caretaker
                    </p>
                </div>

                {/* Next milestone */}
                <div className="glass-card" style={{ padding: '2.25rem', background: 'white', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, rgba(219, 39, 119, 0.05) 0%, transparent 100%)', borderRadius: '0 0 0 100%' }}></div>
                  <div style={{ background: 'var(--primary-light)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <TrendingUp size={24} color="var(--primary)" />
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>Progression</p>
                  
                  {impactLevel === 'Silver' && (
                    <>
                      <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                        ₹{(10000 - stats.totalAmount).toLocaleString()}
                      </h3>
                      <div style={{ marginTop: '0.75rem', width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                         <div style={{ width: `${(stats.totalAmount / 10000) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px' }}></div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>Amount to reach <strong>Gold</strong></p>
                    </>
                  )}
                  {impactLevel === 'Gold' && (
                    <>
                      <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                        ₹{(50000 - stats.totalAmount).toLocaleString()}
                      </h3>
                      <div style={{ marginTop: '0.75rem', width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                         <div style={{ width: `${(stats.totalAmount / 50000) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px' }}></div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>Amount to reach <strong>Platinum</strong></p>
                    </>
                  )}
                  {impactLevel === 'Platinum' && (
                    <>
                      <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>Top 1%</h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '10px' }}>You've reached the highest impact tier!</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Quick Action Cards */}
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card"
                style={{ padding: '2rem', cursor: 'pointer', background: 'white' }}
                onClick={() => setActiveTab('browse-schools')}
              >
                <div style={{ background: 'var(--primary-light)', display: 'inline-flex', padding: '12px', borderRadius: '12px', marginBottom: '1rem' }}>
                  <Globe size={28} color="var(--primary)" />
                </div>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Find Schools</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Browse registered institutions and sponsor events or health checkups.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card"
                style={{ padding: '2rem', cursor: 'pointer', background: 'white' }}
                onClick={() => setActiveTab('my-donations')}
              >
                <div style={{ background: '#fdf2f8', display: 'inline-flex', padding: '12px', borderRadius: '12px', marginBottom: '1rem' }}>
                  <Heart size={28} color="#ec4899" />
                </div>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>My Impact</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  View your full donation history and track where your contributions go.
                </p>
              </motion.div>
            </div>

            {/* Impact Story (Visual) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginTop: '2.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '32px', padding: '3rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.3 }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Transforming Education through Wellness</h3>
                  <p style={{ opacity: 0.8, lineHeight: 1.7, maxWidth: '500px', fontSize: '1.05rem', marginBottom: '2rem' }}>
                    Your partnership extends beyond financial support. By sponsoring health programs, you're directly reducing student absenteeism and fostering a healthier learning environment for thousands of children.
                  </p>
                  <button 
                    onClick={() => setActiveTab('browse-schools')}
                    style={{ background: 'white', color: '#0f172a', border: 'none', padding: '1rem 2rem', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    Continue Supporting <ArrowRight size={20} />
                  </button>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Partner Progress</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { label: 'Schools Sponsored', value: '4', icon: <School size={18} color="var(--primary)" />, bg: 'var(--primary-light)' },
                    { label: 'Students Impacted', value: '1,240', icon: <User size={18} color="#0ea5e9" />, bg: '#e0f2fe' },
                    { label: 'Events Funded', value: '12', icon: <Gift size={18} color="#8b5cf6" />, bg: '#f3e8ff' }
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.icon}
                        </div>
                        <span style={{ fontWeight: 600, color: '#64748b' }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '20px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Active for <strong>142 days</strong></p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default PartnerDashboard;
