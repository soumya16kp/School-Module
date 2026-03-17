import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentService } from '../services/api';
import { Phone, ArrowRight, HeartPulse, ShieldCheck, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

const ParentLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCode('');
    setDevOtp(null);
    try {
      const res = await parentService.sendOtp(phone);
      if (res.devOtp) setDevOtp(res.devOtp);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Verify your phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await parentService.verifyOtp(phone, code);
      if (response.children && response.children.length === 1) {
        navigate(`/parent/dashboard/${response.children[0].id}`);
      } else {
        navigate('/parent/children');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setCode('');
    setError('');
    setDevOtp(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: '#dbeafe', borderRadius: '24px', marginBottom: '1.5rem', color: '#2563eb' }}>
            <HeartPulse size={48} />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>Parent Portal</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Securely access your child's health & safety records</p>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', fontSize: '0.9rem', color: '#0c4a6e', lineHeight: 1.5 }}>
          Use only the phone number registered with the school as <strong>father's or mother's contact</strong>. Do not use a shared number if you are not the designated guardian.
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
           <ShieldCheck size={18} /> {error}
          </motion.div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#475569', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                <Phone size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
                Registered Phone Number
              </label>
              <input 
                type="tel" 
                placeholder="e.g. 9876543210" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1.1rem', transition: 'all 0.2s' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }} 
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'} 
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '10px', fontSize: '0.9rem', color: '#166534' }}>
              OTP sent to <strong>{phone}</strong>
            </div>
            {devOtp && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '10px', fontSize: '0.85rem', color: '#92400e' }}>
                <strong>Dev mode:</strong> Your OTP is <code style={{ background: '#fff', padding: '2px 8px', borderRadius: '4px' }}>{devOtp}</code>
              </div>
            )}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#475569', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                <KeyRound size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
                Enter 6-digit OTP
              </label>
              <input 
                type="text" 
                inputMode="numeric" 
                maxLength={6}
                placeholder="000000" 
                value={code} 
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
                required 
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1.25rem', letterSpacing: '0.5em', textAlign: 'center', transition: 'all 0.2s' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }} 
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify & Access'} 
              {!loading && <ArrowRight size={20} />}
            </button>
            <button 
              type="button" 
              onClick={handleBack}
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ← Use different number
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: '#94a3b8' }}>
          <p>Links are verified against school registration data.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ParentLogin;
