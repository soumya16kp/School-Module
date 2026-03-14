import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    {label && <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>{label}</span>}
  </div>
);
