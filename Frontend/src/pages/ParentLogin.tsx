import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentService } from '../services/api';
import { Phone, ArrowRight, HeartPulse, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ParentLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await parentService.login(phone);
      if (response.children && response.children.length === 1) {
        navigate(`/parent/dashboard/${response.children[0].id}`);
      } else {
        navigate('/parent/children');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify your phone number.');
    } finally {
      setLoading(false);
    }
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

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
           <ShieldCheck size={18} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
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
            {loading ? 'Verifying...' : 'Access My Child\'s Records'} 
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: '#94a3b8' }}>
          <p>Links are verified against school registration data.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ParentLogin;
