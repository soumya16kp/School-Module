import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PartnerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.sendLoginOtp(email, password);
      if (res.devOtp) setDevOtp(res.devOtp);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.verifyLoginOtp(email, otp);
      if (response.user.role === 'PARTNER') {
        navigate('/partner/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = step === 'credentials' ? handleSendOtp : handleVerifyOtp;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      
      {/* Left Panel - Branding/Hero */}
      <div className="hidden md:flex flex-col" style={{ flex: 1, padding: '4rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(219, 39, 119, 0.1)', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(60px)' }}></div>
        
        <div style={{ flex: 1, zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '30px', backdropFilter: 'blur(10px)', marginBottom: '2rem' }}>
               <Heart size={24} color="var(--primary)" />
               <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>WombTo18 Partner Network</span>
            </div>
            
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              Building <br/>Healthier <br/>Futures together.
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '450px', lineHeight: 1.6 }}>
              Join our network of institutional benefactors and corporate partners dedicated to improving student wellness across the nation.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: '#fdf2f8', borderRadius: '16px', marginBottom: '1rem' }}>
               <ShieldCheck size={32} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Partner Login</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>Access your impact dashboard and institutional records.</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 500 }}>
              <div style={{ background: '#fee2e2', padding: '4px', borderRadius: '50%' }}><Lock size={14} /></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {step === 'credentials' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Corporate Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input
                      type="email"
                      placeholder="philanthropy@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '14px 14px 14px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '14px 14px 14px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontSize: '1.05rem', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  {loading ? 'Sending OTP...' : 'Continue'} {!loading && <ArrowRight size={18} />}
                </button>
              </>
            ) : (
              <>
                <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.9rem', color: '#166534' }}>
                  OTP sent to <strong>{email}</strong>. Check your email or backend console.
                  {devOtp && <div style={{ marginTop: '8px', fontWeight: 700, fontSize: '1rem' }}>Dev OTP: <span style={{ letterSpacing: '0.2em' }}>{devOtp}</span></div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Enter OTP</label>
                  <input
                    type="text"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1.2rem', letterSpacing: '0.3em', textAlign: 'center', outline: 'none' }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontSize: '1.05rem', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  {loading ? 'Verifying...' : 'Sign In to Portal'} {!loading && <ArrowRight size={18} />}
                </button>
                <button type="button" onClick={() => { setStep('credentials'); setError(''); setOtp(''); }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'center' }}>
                  ← Back
                </button>
              </>
            )}
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Interested in becoming a partner?{' '}
              <span 
                style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Contact our support
              </span>
            </p>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase' }}>Return to</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          </div>
          
          <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/')} 
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'border-color 0.2s' }}
            >
              School Administration Portal
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default PartnerLogin;
