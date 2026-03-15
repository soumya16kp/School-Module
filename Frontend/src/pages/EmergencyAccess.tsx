import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, User, Phone, Briefcase, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const EmergencyAccess: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const [step, setStep] = useState<'form' | 'pending' | 'approved' | 'denied'>('form');
  const [requestId, setRequestId] = useState<number | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterPhone: '',
    requesterRole: 'Doctor',
    reason: ''
  });

  // Poll for approval status every 5 seconds when pending
  useEffect(() => {
    if (step !== 'pending' || !requestId) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/access/check/${requestId}`);
        if (res.data.status === 'APPROVED') {
          const viewRes = await axios.get(`${BACKEND_URL}/access/view/${res.data.accessToken}`);
          setHealthData(viewRes.data);
          setStep('approved');
          clearInterval(interval);
        } else if (res.data.status === 'DENIED') {
          setStep('denied');
          clearInterval(interval);
        }
      } catch (e) {
        // keep polling
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [step, requestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${BACKEND_URL}/access/request/${childId}`, formData);
      setRequestId(res.data.requestId);
      setStep('pending');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #fff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', width: '100%', maxWidth: '520px', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '2rem', color: 'white', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', marginBottom: '1rem' }}>
            <ShieldCheck size={40} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Emergency Health Access</h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>WombTo18 — Secure Parent-Approved Access</p>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* FORM STEP */}
          {step === 'form' && (
            <>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                You are requesting access to this student's health records. <strong>The parent will be notified and must approve</strong> before you can view any data.
              </p>
              {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '0.9rem' }}><User size={16} /> Your Full Name *</label>
                  <input required type="text" value={formData.requesterName} onChange={e => setFormData({...formData, requesterName: e.target.value})} placeholder="e.g. Dr. Rajan Mehta" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '0.9rem' }}><Phone size={16} /> Your Phone *</label>
                  <input required type="tel" value={formData.requesterPhone} onChange={e => setFormData({...formData, requesterPhone: e.target.value})} placeholder="e.g. 9876543210" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '0.9rem' }}><Briefcase size={16} /> Your Role *</label>
                  <select value={formData.requesterRole} onChange={e => setFormData({...formData, requesterRole: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', background: 'white' }}>
                    <option>Doctor</option>
                    <option>Nurse</option>
                    <option>Paramedic</option>
                    <option>School Teacher</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '0.9rem' }}><MessageSquare size={16} /> Reason for Access *</label>
                  <textarea required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Briefly explain why you need to access this student's health data..." rows={3} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical' }} />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                  {loading ? 'Submitting...' : 'Request Access'}
                </button>
              </form>
            </>
          )}

          {/* PENDING STEP */}
          {step === 'pending' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} style={{ display: 'inline-block', color: '#2563eb', marginBottom: '1.5rem' }}>
                <Clock size={60} />
              </motion.div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '0.75rem' }}>Waiting for Parent Approval</h2>
              <p style={{ color: '#64748b', lineHeight: '1.7' }}>Your request has been sent to the parent. This page will update automatically when they respond.</p>
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#eff6ff', borderRadius: '12px', fontSize: '0.9rem', color: '#1d4ed8' }}>
                🔔 The parent's phone will be notified of your request ID: <strong>#{requestId}</strong>
              </div>
            </div>
          )}

          {/* APPROVED STEP */}
          {step === 'approved' && healthData && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <CheckCircle2 size={56} color="#22c55e" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#166534' }}>Access Approved!</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Expires: {new Date(healthData.expiresAt).toLocaleString()}</p>
              </div>
              
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '700', color: '#1e3a8a', marginBottom: '1rem' }}>Student (emergency-relevant only)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div><span style={{ color: '#64748b' }}>Name:</span> <strong>{healthData.student.name}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Class:</span> <strong>{healthData.student.class}-{healthData.student.section}</strong></div>
                  <div><span style={{ color: '#64748b' }}>School:</span> <strong>{healthData.student.school}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Blood group:</span> <strong>{healthData.student.bloodGroup}</strong></div>
                  <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#64748b' }}>Allergies:</span> <strong>{healthData.student.allergies}</strong></div>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '1.5rem', border: '1px solid #dcfce7' }}>
                <h3 style={{ fontWeight: '700', color: '#166534', marginBottom: '0.75rem' }}>Emergency health info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div><span style={{ color: '#64748b' }}>Immunization up to date:</span> <strong>{healthData.immunizationUpToDate ? 'Yes' : 'No'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Last check-up summary:</span> <strong>{healthData.lastCheckupSummary}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* DENIED STEP */}
          {step === 'denied' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <AlertTriangle size={60} color="#ef4444" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#b91c1c' }}>Access Denied</h2>
              <p style={{ color: '#64748b', marginTop: '0.75rem' }}>The parent has declined this access request. Please contact the school or parent directly for assistance.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EmergencyAccess;
