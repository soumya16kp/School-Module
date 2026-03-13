import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterUser: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register(formData);
      alert('Account created! Please login.');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eef2ff 0%, #fdf2f8 100%)', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Admin Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Start your school registration process</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><User size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Full Name</label>
            <input name="name" placeholder="John Doe" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label><Mail size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Email Address</label>
            <input type="email" name="email" placeholder="admin@school.com" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label><Lock size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Password</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'} <CheckCircle2 size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate('/')}>Login Here</span>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterUser;
