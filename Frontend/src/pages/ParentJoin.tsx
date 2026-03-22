import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { schoolService } from '../services/api';
import { GraduationCap, MapPin, User, CheckCircle, ArrowRight, Loader } from 'lucide-react';

const ParentJoin: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    schoolService.getSchoolByJoinToken(token)
      .then(setSchool)
      .catch(() => setError('This registration link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader size={32} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (error || !school) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <GraduationCap size={32} color="#ef4444" />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.75rem' }}>Invalid Link</h2>
        <p style={{ color: '#64748b', lineHeight: 1.6 }}>{error || 'This registration link is invalid or has expired. Please contact your school.'}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* School Card */}
        <div style={{ background: 'white', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <GraduationCap size={30} color="white" />
            </div>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#1e3a8a', margin: 0, lineHeight: 1.2 }}>{school.schoolName}</h1>
              <p style={{ color: '#64748b', fontSize: '0.83rem', margin: '4px 0 0' }}>
                {[school.schoolType, school.boardAffiliation].filter(Boolean).join(' • ')}
              </p>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '2rem' }}>
            {school.principalName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <User size={16} color="#64748b" />
                <span style={{ fontSize: '0.88rem', color: '#475569' }}>Principal: <strong style={{ color: '#1e293b' }}>{school.principalName}</strong></span>
              </div>
            )}
            {(school.city || school.state) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <MapPin size={16} color="#64748b" />
                <span style={{ fontSize: '0.88rem', color: '#475569' }}>{[school.address, school.city, school.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {school.udiseCode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <CheckCircle size={16} color="#16a34a" />
                <span style={{ fontSize: '0.88rem', color: '#475569' }}>UDISE Code: <strong style={{ color: '#1e293b' }}>{school.udiseCode}</strong></span>
              </div>
            )}
          </div>

          {/* Info box */}
          <div style={{ padding: '1rem 1.25rem', background: '#eff6ff', borderRadius: '14px', border: '1px solid #bfdbfe', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.6, margin: 0 }}>
              <strong>Welcome!</strong> Your school has invited you to register on the <strong>WombTo18 Parent Portal</strong>. Use your registered mobile number to access your child's health records and school programs.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/parent-login')}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              fontWeight: 800,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 20px -5px rgba(99,102,241,0.4)',
            }}
          >
            Register / Login via OTP <ArrowRight size={20} />
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
          Powered by WombTo18 · Your child's health, secured.
        </p>
      </div>
    </div>
  );
};

export default ParentJoin;
