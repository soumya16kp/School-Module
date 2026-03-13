import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cardService } from '../services/api';
import QRCode from 'react-qr-code';
import { Phone, Mail, GraduationCap, HeartPulse, Droplets, ShieldCheck } from 'lucide-react';

const CardView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardUrl = token ? `${window.location.origin}/card/${token}` : '';

  useEffect(() => {
    if (!token) {
      setError('Invalid card link');
      setLoading(false);
      return;
    }
    cardService.getByToken(token)
      .then(setData)
      .catch(() => setError('Card not found'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Loading...</span>
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', gap: '1rem' }}>
      <span style={{ color: '#991b1b', fontWeight: 600 }}>{error || 'Card not found'}</span>
      <span style={{ fontSize: '0.9rem', color: '#64748b' }}>This link may be expired or invalid.</span>
    </div>
  );

  return (
    <div className="card-view-print" style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div
        style={{
          maxWidth: '420px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>WombTo18</div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>Health ID Card</div>
        </div>

        {/* Photo placeholder & name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 700,
            }}
          >
            {data.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#1e293b' }}>{data.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              {data.registrationNo} • Class {data.class}-{data.section}
            </div>
            {data.school?.schoolName && (
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {data.school.schoolName}
                {data.school.city && `, ${data.school.city}`}
              </div>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div style={{ padding: '1rem 1.5rem', display: 'grid', gap: '0.75rem' }}>
          {data.bloodGroup && (
            <Row icon={<Droplets size={16} />} label="Blood Group" value={data.bloodGroup} />
          )}
          {data.allergicTo && (
            <Row icon={<ShieldCheck size={16} />} label="Allergies" value={data.allergicTo} />
          )}
          <Row icon={<Phone size={16} />} label="Primary" value={data.mobile} />
          {data.fatherNumber && <Row icon={<Phone size={16} />} label="Father" value={data.fatherNumber} />}
          {data.motherNumber && <Row icon={<Phone size={16} />} label="Mother" value={data.motherNumber} />}
        </div>

        {/* Health summary */}
        {(data.bmiCategory || data.immunization != null || data.dentalStatus || data.visionStatus || data.lastCheckupDate) && (
          <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              <HeartPulse size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Latest Health Summary
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.bmiCategory && <Chip label="BMI" value={data.bmiCategory} />}
              {data.immunization != null && <Chip label="Immunization" value={data.immunization ? 'Yes' : 'No'} />}
              {data.dentalStatus && <Chip label="Dental" value={data.dentalStatus} />}
              {data.visionStatus && <Chip label="Vision" value={data.visionStatus} />}
              {data.lastCheckupDate && (
                <Chip label="Last checkup" value={new Date(data.lastCheckupDate).toLocaleDateString()} />
              )}
            </div>
          </div>
        )}

        {/* QR */}
        <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #e2e8f0', background: 'white' }}>
          <div style={{ padding: '12px', background: 'white', borderRadius: '12px', display: 'inline-block' }}>
            <QRCode value={cardUrl} size={120} level="M" />
          </div>
          <div style={{ marginLeft: '1rem', fontSize: '0.75rem', color: '#64748b', maxWidth: '140px' }}>
            Scan to view full health card
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '10px 24px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Print ID Card
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .card-view-print, .card-view-print * { visibility: visible; }
          .card-view-print { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 0; }
          .card-view-print button { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ color: '#8b5cf6' }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{value}</div>
    </div>
  </div>
);

const Chip = ({ label, value }: { label: string; value: string }) => (
  <span
    style={{
      padding: '4px 10px',
      borderRadius: '8px',
      background: '#e0e7ff',
      color: '#4338ca',
      fontSize: '0.75rem',
      fontWeight: 600,
    }}
  >
    {label}: {value}
  </span>
);

export default CardView;
