import React, { useState, useEffect } from 'react';
import { ambassadorService } from '../services/api';
import { Users, Plus, XCircle, Phone, Mail, MapPin } from 'lucide-react';
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
      ) : ambassadors.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', background: 'white', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
          <Users size={60} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
          <h3>No Ambassadors Yet</h3>
          <p>Add fire department, police, NDRF, or training partners for drills.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ambassadors.map((a, index) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card"
              style={{ background: 'white', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1.5rem', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{a.name}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '20px' }}>
                  {formatType(a.type)}
                </span>
                {a.organization && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.organization}</div>
                )}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {a.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><Phone size={14} /> {a.phone}</div>}
                {a.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {a.email}</div>}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {a.serviceArea && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {a.serviceArea}</div>}
              </div>
              <div>
                <button
                  onClick={() => handleDelete(a.id)}
                  style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
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
