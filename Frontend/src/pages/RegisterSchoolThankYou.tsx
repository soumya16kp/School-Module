import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, School, Key, Mail, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterSchoolThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  const registrationNo = searchParams.get('regNo') || 'N/A';
  const schoolName = searchParams.get('school') || 'N/A';
  const email = searchParams.get('email') || 'N/A';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ maxWidth: '680px', width: '100%', overflow: 'hidden', padding: 0 }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #9d174d))', padding: '2.5rem', textAlign: 'center', color: '#fff' }}>
          <CheckCircle size={72} style={{ margin: '0 auto 1rem', color: '#86efac' }} />
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Registration Successful!</h1>
          <p style={{ opacity: 0.85 }}>Welcome to the WombTo18 School Wellness Program</p>
        </div>

        <div style={{ padding: '2.5rem' }}>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Your school has been registered. Please save the details below.
          </p>

          {/* Registration Details */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1.25rem', fontSize: '1rem' }}>Registration Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <School size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>School Name</p>
                  <p style={{ fontWeight: 600 }}>{schoolName}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Key size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Registration Number</p>
                  <p style={{ fontWeight: 600, fontFamily: 'monospace' }}>{registrationNo}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Mail size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Login Email</p>
                  <p style={{ fontWeight: 600 }}>{email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Calendar size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Subscription Valid Until</p>
                  <p style={{ fontWeight: 600 }}>
                    {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#1e40af', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Next Steps</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                'Save your registration number for future reference',
                'Use your registered email to log in to the dashboard',
                'Add your students and staff from the dashboard',
                'A confirmation has been sent to your registered email',
              ].map((step) => (
                <li key={step} style={{ fontSize: '0.875rem', color: '#1e3a8a', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Redirect */}
          <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Redirecting to dashboard in <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>{countdown}</span> seconds...
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem', padding: '0.5rem 1.5rem' }}
            >
              Go to Dashboard Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterSchoolThankYou;
