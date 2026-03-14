import React, { useState, useEffect } from 'react';
import { ambassadorService } from '../services/api';
import { Users, Plus, XCircle, Phone, Mail, Heart, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AMBASSADOR_TYPES = ['FIRE_DEPT', 'POLICE', 'NDRF', 'CPR_TRAINER', 'FIRST_AID_TRAINER', 'HEALTH_PARTNER', 'OTHER'];

const formatType = (t: string) => t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const Ambassadors: React.FC = () => {
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    type: 'FIRE_DEPT',
    name: '',
    organization: '',
    phone: '',
    email: '',
    serviceArea: '',
    notes: ''
  });

  useEffect(() => {
    fetchAmbassadors();
  }, [filterType]);

  const fetchAmbassadors = async () => {
    try {
      setLoading(true);
      const data = await ambassadorService.getAll(filterType || undefined);
      console.log('Ambassadors Data:', data);
      setAmbassadors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ambassadorService.create(formData);
      setShowAddModal(false);
      setFormData({ type: 'FIRE_DEPT', name: '', organization: '', phone: '', email: '', serviceArea: '', notes: '' });
      fetchAmbassadors();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error adding ambassador');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this ambassador from the directory?')) return;
    try {
      await ambassadorService.delete(id);
      fetchAmbassadors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, var(--primary) 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Ambassador Directory
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Fire, police, NDRF, CPR/first-aid trainers, and health partners.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> Add Ambassador
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', background: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label style={{ fontWeight: 600 }}>Filter by type</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
        >
          <option value="">All</option>
          {AMBASSADOR_TYPES.map((t) => (
            <option key={t} value={t}>{formatType(t)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>Loading ambassadors...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Institutional Benefactors Section - Only shows general school donations */}
          {(() => {
            const schoolDonationsRaw = ambassadors.find(a => a.school?.donations)?.school?.donations?.filter((d: any) => !d.eventId) || [];
            if (schoolDonationsRaw.length === 0) return null;

            // Group by partner name to show total and consolidated messages
            const groupedDonations = schoolDonationsRaw.reduce((acc: any, d: any) => {
              const name = d.user?.name || 'Anonymous';
              if (!acc[name]) {
                acc[name] = { name, total: 0, descriptions: [] };
              }
              acc[name].total += d.amount;
              if (d.description && d.description.trim()) {
                acc[name].descriptions.push(d.description);
              }
              return acc;
            }, {});

            const benefactors = Object.values(groupedDonations);

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  background: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)', 
                  padding: '2.5rem', 
                  borderRadius: '32px', 
                  color: '#1e293b',
                  boxShadow: '0 10px 40px -15px rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0'
                }}
              >
                {/* Background Decoration */}
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', opacity: 0.05, filter: 'blur(50px)' }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                    <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.15)' }}>
                      <Award size={28} color="#d97706" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>Institutional Benefactors</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>The visionary partners fueling our safety mission</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {benefactors.map((b: any, idx: number) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -5, boxShadow: '0 12px 20px -8px rgba(0,0,0,0.05)' }}
                        style={{ 
                          background: 'white', 
                          padding: '1.75rem', 
                          borderRadius: '24px', 
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>{b.name}</div>
                          <div style={{ 
                            background: '#fffbeb', 
                            color: '#d97706', 
                            padding: '6px 12px', 
                            borderRadius: '12px', 
                            fontWeight: 900, 
                            fontSize: '1rem',
                            border: '1px solid #fef3c7'
                          }}>
                            ₹{b.total.toLocaleString()}
                          </div>
                        </div>
                        
                        {b.descriptions.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '3px solid #fde68a', paddingLeft: '12px', marginTop: '4px' }}>
                            {b.descriptions.map((desc: string, i: number) => (
                              <p key={i} style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>
                                "{desc}"
                              </p>
                            ))}
                          </div>
                        )}
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          <Heart size={10} color="#e11d48" fill="#e11d48" /> Platinum Supporter
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Ambassador List */}
          {ambassadors.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', background: 'white', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
              <Users size={60} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
              <h3>No Ambassadors Available</h3>
              <p>Add fire department, police, or training partners to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ambassadors.map((a, index) => {
                const TypeIcon = a.type === 'FIRE_DEPT' ? Heart : a.type === 'POLICE' ? Award : Users;
                return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)' }}
                  transition={{ delay: index * 0.05 }}
                  style={{ 
                    background: 'white', 
                    padding: '2rem', 
                    borderRadius: '28px', 
                    display: 'grid', 
                    gridTemplateColumns: '1.5fr 1.5fr 0.5fr', 
                    gap: '2.5rem', 
                    alignItems: 'center', 
                    border: '1px solid #f1f5f9',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '20px', 
                      background: 'var(--primary-light)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <TypeIcon size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.01em' }}>{a.name}</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 800, 
                          textTransform: 'uppercase', 
                          color: 'var(--primary)', 
                          background: 'white', 
                          padding: '4px 12px', 
                          borderRadius: '12px',
                          border: '1px solid var(--primary-light)',
                          letterSpacing: '0.02em'
                        }}>
                          {formatType(a.type)}
                        </span>
                        {a.organization && (
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>• {a.organization}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #f1f5f9' }}>
                    {a.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', fontSize: '0.95rem', fontWeight: 600 }}>
                        <div style={{ background: 'white', padding: '6px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}><Phone size={14} color="var(--primary)" /></div>
                        {a.phone}
                      </div>
                    )}
                    {a.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', fontSize: '0.95rem', fontWeight: 600 }}>
                        <div style={{ background: 'white', padding: '6px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}><Mail size={14} color="var(--primary)" /></div>
                        {a.email}
                      </div>
                    )}
                    {a.serviceArea && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                        <Users size={14} color="#94a3b8" /> {a.serviceArea}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(a.id)}
                      style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '14px', 
                        background: '#fff1f2', 
                        color: '#e11d48', 
                        border: '1px solid #ffe4e6', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginLeft: 'auto',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#e11d48';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#fff1f2';
                        e.currentTarget.style.color = '#e11d48';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                      }}
                      title="Remove from directory"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card"
              style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Add Ambassador</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <XCircle size={22} color="var(--text-muted)" />
                </button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                  >
                    {AMBASSADOR_TYPES.map((t) => (
                      <option key={t} value={t}>{formatType(t)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mumbai Fire Brigade Ward X"
                  />
                </div>
                <div className="form-group">
                  <label>Organization (optional)</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Fire Department"
                  />
                </div>
                <div className="form-group">
                  <label>Phone (optional)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91..."
                  />
                </div>
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Service area (optional)</label>
                  <input
                    type="text"
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    placeholder="e.g. District X, Ward Y"
                  />
                </div>
                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Add Ambassador</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ambassadors;
