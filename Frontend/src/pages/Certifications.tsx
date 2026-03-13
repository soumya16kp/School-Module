import React, { useState, useEffect } from 'react';
import { certificationService } from '../services/api';
import { Award, Plus, XCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CERT_TYPES = ['UDISE_COMPLIANCE', 'FIRE_SAFETY_DRILL', 'ANNUAL_SAFETY', 'HEALTH_PROGRAM', 'OTHER'];
const CERT_STATUSES = ['PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED'];

const formatType = (t: string) => t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const StatusBadge = ({ status }: { status: string }) => {
  let bg = '#fef3c7', color = '#92400e';
  if (status === 'ACTIVE') { bg = '#dcfce7'; color = '#166534'; }
  else if (status === 'EXPIRED') { bg = '#fee2e2'; color = '#991b1b'; }
  else if (status === 'REVOKED') { bg = '#f3f4f6'; color = '#6b7280'; }
  return (
    <span style={{ background: bg, color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
      {status}
    </span>
  );
};

const Certifications: React.FC = () => {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [formData, setFormData] = useState({
    type: 'UDISE_COMPLIANCE',
    status: 'PENDING',
    academicYear: '2024-2025',
    issuedAt: '',
    validUntil: ''
  });

  useEffect(() => {
    fetchCerts();
  }, [academicYear]);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const data = await certificationService.getAll(academicYear);
      setCerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await certificationService.create({
        ...formData,
        issuedAt: formData.issuedAt ? new Date(formData.issuedAt).toISOString() : undefined,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined
      });
      setShowAddModal(false);
      setFormData({ type: 'UDISE_COMPLIANCE', status: 'PENDING', academicYear: '2024-2025', issuedAt: '', validUntil: '' });
      fetchCerts();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error creating certification');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this certification record?')) return;
    try {
      await certificationService.delete(id);
      fetchCerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, var(--primary) 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Certifications
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>UDISE compliance, safety drills, and program certifications.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> Add Certification
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', background: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label style={{ fontWeight: 600 }}>Academic year</label>
        <select
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
        >
          <option value="2023-2024">2023-2024</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2025-2026">2025-2026</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>Loading certifications...</div>
      ) : certs.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', background: 'white', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
          <Award size={60} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
          <h3>No Certifications Yet</h3>
          <p>Add UDISE, safety, or program certifications for your school.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {certs.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card"
              style={{ background: 'white', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '1.5rem', alignItems: 'center' }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '20px' }}>
                  {formatType(c.type)}
                </span>
                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{c.academicYear}</div>
              </div>
              <div>
                <StatusBadge status={c.status} />
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {c.issuedAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Calendar size={14} /> Issued: {new Date(c.issuedAt).toLocaleDateString()}
                  </div>
                )}
                {c.validUntil && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} /> Valid until: {new Date(c.validUntil).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div />
              <div>
                <button
                  onClick={() => handleDelete(c.id)}
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
              style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '2rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Add Certification</h3>
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
                    {CERT_TYPES.map((t) => (
                      <option key={t} value={t}>{formatType(t)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                  >
                    {CERT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Academic year</label>
                  <input
                    required
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="e.g. 2024-2025"
                  />
                </div>
                <div className="form-group">
                  <label>Issued date (optional)</label>
                  <input
                    type="date"
                    value={formData.issuedAt}
                    onChange={(e) => setFormData({ ...formData, issuedAt: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Valid until (optional)</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Add Certification</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Certifications;
