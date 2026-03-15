import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OTP_EXPIRY_SECS = 10 * 60; // 10 minutes

const Login: React.FC = () => {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(OTP_EXPIRY_SECS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 'otp') {
      setTimer(OTP_EXPIRY_SECS);
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.sendLoginOtp(email, password);
      if (res.devOtp) setDevOtp(res.devOtp);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timer === 0) { setError('Code has expired. Please go back and try again.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authService.verifyLoginOtp(email, otp);
      if (res.user?.role === 'PARTNER') {
        navigate('/partner/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setOtp('');
    setDevOtp(null);
    setLoading(true);
    try {
      const res = await authService.sendLoginOtp(email, password);
      if (res.devOtp) setDevOtp(res.devOtp);
      setStep('otp'); // resets timer via useEffect
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>

      {/* Left Panel */}
      <div className="hidden md:flex flex-col" style={{ flex: 1, padding: '4rem', background: 'linear-gradient(135deg, var(--primary) 0%, #db2777 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(60px)' }} />
        <div style={{ flex: 1, zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: '30px', backdropFilter: 'blur(10px)', marginBottom: '2rem' }}>
              <GraduationCap size={24} />
              <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>WombTo18</span>
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              Empowering <br />School Health <br />Management.
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '400px', lineHeight: 1.6 }}>
              A centralized platform for schools to monitor, manage, and improve student wellness and health records seamlessly.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <AnimatePresence mode="wait">

            {/* Step 1 – Credentials */}
            {step === 'credentials' && (
              <motion.div key="credentials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Welcome back</h2>
                  <p style={{ color: '#64748b', fontSize: '1.05rem' }}>Enter your credentials to receive a login code.</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 500 }}>
                    <div style={{ background: '#fee2e2', padding: '4px', borderRadius: '50%' }}><Lock size={14} /></div>
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                      <input type="email" placeholder="principal@school.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                        style={{ width: '100%', padding: '14px 14px 14px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', transition: 'all 0.2s', outline: 'none' }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-light)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Password</label>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                      <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                        style={{ width: '100%', padding: '14px 14px 14px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', transition: 'all 0.2s', outline: 'none' }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-light)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontSize: '1.05rem', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background 0.2s, transform 0.1s' }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {loading ? 'Sending code…' : 'Send Login Code'} {!loading && <ArrowRight size={18} />}
                  </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Don't have an account?{' '}
                    <span onClick={() => navigate('/register')} style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                      Register your school
                    </span>
                  </p>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase' }}>Other Portals</span>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>
                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button onClick={() => navigate('/parent-login')} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                    Parent Portal
                  </button>
                  <button onClick={() => navigate('/partner-login')} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                    Partner Portal
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2 – OTP */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #db2777)', marginBottom: '1rem' }}>
                    <ShieldCheck size={28} color="white" />
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Check your email</h2>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    We sent a 6-digit code to<br />
                    <strong style={{ color: '#1e293b' }}>{email}</strong>
                  </p>
                </div>

                {devOtp && (
                  <div style={{ background: '#fdf4ff', border: '1px solid #e879f9', color: '#a21caf', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem', textAlign: 'center' }}>
                    <strong>Dev mode:</strong> your code is <strong style={{ letterSpacing: '0.15em' }}>{devOtp}</strong>
                  </div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 500 }}>
                    <div style={{ background: '#fee2e2', padding: '4px', borderRadius: '50%' }}><Lock size={14} /></div>
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>6-Digit Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="_ _ _ _ _ _"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      autoFocus
                      style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.4em', textAlign: 'center', outline: 'none', transition: 'all 0.2s' }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-light)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: timer > 0 ? '#64748b' : '#ef4444' }}>
                    <span>{timer > 0 ? `Code expires in ${formatTimer(timer)}` : 'Code expired'}</span>
                    <button type="button" onClick={handleResend} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <RefreshCw size={14} /> Resend
                    </button>
                  </div>

                  <button type="submit" disabled={loading || otp.length !== 6}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: otp.length === 6 ? 'var(--primary)' : '#cbd5e1', color: 'white', fontSize: '1.05rem', fontWeight: 700, border: 'none', cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                  >
                    {loading ? 'Verifying…' : 'Verify & Sign In'} {!loading && <ArrowRight size={18} />}
                  </button>
                </form>

                <button onClick={() => { setStep('credentials'); setError(''); setOtp(''); setDevOtp(null); }} style={{ marginTop: '1.5rem', width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  ← Back to sign in
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
