import React, { useState, useEffect } from 'react';
import { childService } from '../services/api';
import { Search, Plus, Phone, Mail, GraduationCap, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChildRecords: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    section: '',
    fatherNumber: '',
    motherNumber: '',
    emailId: '',
    mobile: '',
    gender: 'Male',
    stateCode: 'KA',
    status: 'Pending',
    notes: ''
  });

  const states = [
    { code: 'KA', name: 'Karnataka' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'DL', name: 'Delhi' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'WB', name: 'West Bengal' },
    { code: 'TS', name: 'Telangana' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'KL', name: 'Kerala' },
  ];

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async (query?: string) => {
    try {
      setLoading(true);
      const data = await childService.getAll(query);
      setChildren(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChildren(search);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await childService.create(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        class: '',
        section: '',
        fatherNumber: '',
        motherNumber: '',
        emailId: '',
        mobile: '',
        gender: 'Male',
        stateCode: 'KA',
        status: 'Pending',
        notes: ''
      });
      fetchChildren();
    } catch (err) {
      alert('Error adding child record');
      console.error(err);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await childService.updateStatus(id, status);
      fetchChildren();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done': return <CheckCircle2 size={18} color="#10b981" />;
      case 'Absent': return <XCircle size={18} color="#ef4444" />;
      default: return <Clock size={18} color="#f59e0b" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Child Records</h2>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="btn btn-primary"
        >
          <Plus size={18} /> Add New Student
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={18} 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
          />
          <input 
            type="text" 
            placeholder="Search by name, class, or mobile..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <button type="submit" className="btn" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
          Search
        </button>
      </form>

      {/* Records Table */}
      <div className="glass-card" style={{ overflow: 'hidden', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>REG ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>NAME & CLASS</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>CONTACT DETAILS</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>GENDER</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>STATUS</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</td></tr>
            ) : children.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No records found</td></tr>
            ) : children.map((child) => (
              <tr key={child.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                    {child.registrationNo}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600' }}>{child.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <GraduationCap size={14} /> Class {child.class} - {child.section}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="var(--text-muted)" /> {child.mobile}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> {child.emailId || 'N/A'}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.85rem' }}>{child.gender}</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '500' }}>
                    {getStatusIcon(child.status)}
                    {child.status}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={child.status}
                    onChange={(e) => updateStatus(child.id, e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '4px 8px', width: 'auto' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Done">Done</option>
                    <option value="Absent">Absent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card" 
              style={{ background: 'white', width: '100%', maxWidth: '700px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Register New Student</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter student name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Class (No.)</label>
                    <input 
                      required 
                      type="number" 
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <input 
                      required 
                      type="text" 
                      maxLength={1}
                      value={formData.section}
                      onChange={(e) => setFormData({...formData, section: e.target.value.toUpperCase()})}
                      placeholder="e.g. A"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Father's Contact No</label>
                    <input 
                      required 
                      type="tel" 
                      value={formData.fatherNumber}
                      onChange={(e) => setFormData({...formData, fatherNumber: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mother's Contact No</label>
                    <input 
                      required 
                      type="tel" 
                      value={formData.motherNumber}
                      onChange={(e) => setFormData({...formData, motherNumber: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Student Email (Optional)</label>
                    <input 
                      type="email" 
                      value={formData.emailId}
                      onChange={(e) => setFormData({...formData, emailId: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Primary Mobile No</label>
                    <input 
                      required 
                      type="tel" 
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>State (Migration ID Purpose)</label>
                    <select 
                      value={formData.stateCode}
                      onChange={(e) => setFormData({...formData, stateCode: e.target.value})}
                    >
                      {states.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Other Parameters / Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional information..."
                    rows={3}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register Record</button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn" style={{ background: '#f1f5f9' }}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChildRecords;
