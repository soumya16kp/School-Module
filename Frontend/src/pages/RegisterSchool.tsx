import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolService } from '../services/api';
import { School, User, MapPin, Phone, Mail, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterSchool: React.FC = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    udiseCode: '',
    schoolType: 'Private',
    boardAffiliation: 'CBSE',
    principalName: '',
    principalContact: '',
    schoolEmail: '',
    studentStrength: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    pocName: '',
    pocDesignation: '',
    pocMobile: '',
    pocEmail: '',
    stateCode: 'WB'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await schoolService.register(formData);
      alert('Registration Successful!');
      navigate('/dashboard');
    } catch (err) {
      alert('Registration Failed. Check all fields.');
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', marginTop: '1rem', borderBottom: '2px solid var(--primary-light)', paddingBottom: '8px' }}>
       <Icon size={20} color="var(--primary)" />
       <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{title}</h3>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ padding: '3rem' }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>School Registration</h1>
          <p style={{ color: 'var(--text-muted)' }}>Provide details to register your institution in the central database.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <SectionTitle icon={School} title="Basic Information" />
          <div className="grid-2">
            <div className="form-group">
              <label>School Name (as per records)</label>
              <input name="schoolName" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>UDISE+ Code (Optional)</label>
              <input name="udiseCode" onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>School Type</label>
              <select name="schoolType" onChange={handleChange}>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="International">International</option>
              </select>
            </div>
            <div className="form-group">
              <label>Board Affiliation</label>
              <input name="boardAffiliation" placeholder="CBSE, ICSE, State, etc." onChange={handleChange} required />
            </div>
          </div>

          <SectionTitle icon={User} title="Principal Details" />
          <div className="grid-2">
            <div className="form-group">
              <label>Principal's Full Name</label>
              <input name="principalName" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Principal's Contact</label>
              <input name="principalContact" onChange={handleChange} required />
            </div>
          </div>

          <SectionTitle icon={MapPin} title="Location & Capacity" />
          <div className="form-group">
            <label>Complete Address</label>
            <textarea name="address" style={{ minHeight: '80px', borderRadius: '10px' }} onChange={handleChange} required></textarea>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>State Code (e.g., WB, DL)</label>
              <input name="stateCode" maxLength={2} placeholder="WB" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input name="pincode" onChange={handleChange} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Total Student Strength</label>
              <input type="number" name="studentStrength" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>School Email Address</label>
              <input type="email" name="schoolEmail" onChange={handleChange} required />
            </div>
          </div>

          <SectionTitle icon={FileText} title="Point of Contact (If not Principal)" />
          <div className="grid-2">
            <div className="form-group">
              <label>POC Name</label>
              <input name="pocName" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>POC Designation</label>
              <input name="pocDesignation" onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%', height: '56px', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? 'Submitting Details...' : 'Complete Registration'} <CheckCircle size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterSchool;
