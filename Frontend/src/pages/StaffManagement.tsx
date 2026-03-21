import React, { useState, useEffect } from 'react';
import { staffService } from '../services/api';
import { Users, UserPlus, Trash2, Pencil, Phone, Mail, GraduationCap, Shield, UserCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', role: 'CLASS_TEACHER', assignedClass: '', assignedSection: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CLASS_TEACHER',
    assignedClass: '',
    assignedSection: '',
    password: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffService.list();
      setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await staffService.add(formData);
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', role: 'CLASS_TEACHER', assignedClass: '', assignedSection: '', password: '' });
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error adding staff member');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await staffService.remove(id);
      fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (member: any) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name ?? '',
      phone: member.phone ?? '',
      role: member.role ?? 'CLASS_TEACHER',
      assignedClass: member.assignedClass != null ? String(member.assignedClass) : '',
      assignedSection: member.assignedSection ?? ''
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      await staffService.update(editingMember.id, {
        name: editFormData.name,
        phone: editFormData.phone,
        role: editFormData.role,
        assignedClass: editFormData.role === 'CLASS_TEACHER' ? editFormData.assignedClass : undefined,
        assignedSection: editFormData.role === 'CLASS_TEACHER' ? editFormData.assignedSection : undefined
      });
      setEditingMember(null);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error updating staff member');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800, color: '#0f172a' }}>
            Faculty & Staff Directory
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage logins and class assignments for teachers and staff.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}>
          <UserPlus size={18} /> Add New Member
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <Users size={32} />
          </motion.div>
          <p>Syncing staff records...</p>
        </div>
      ) : (
        <div className="glass-card" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name & Role</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Details</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assignment</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member, index) => (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '12px', 
                          background: member.role === 'CLASS_TEACHER' ? '#eff6ff' : 
                                     ['SCHOOL_ADMIN', 'PRINCIPAL'].includes(member.role) ? '#fef2f2' :
                                     member.role === 'NURSE_COUNSELLOR' ? '#f0fdf4' : '#f8fafc', 
                          color: member.role === 'CLASS_TEACHER' ? '#2563eb' : 
                                 ['SCHOOL_ADMIN', 'PRINCIPAL'].includes(member.role) ? '#ef4444' :
                                 member.role === 'NURSE_COUNSELLOR' ? '#16a34a' : '#64748b', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          {member.role === 'CLASS_TEACHER' ? <UserCheck size={20} /> : 
                           ['SCHOOL_ADMIN', 'PRINCIPAL'].includes(member.role) ? <Shield size={20} /> :
                           member.role === 'NURSE_COUNSELLOR' ? <Activity size={20} /> : <Users size={20} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{member.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{member.role.replace(/_/g, ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                          <Mail size={14} style={{ color: '#94a3b8' }} /> {member.email}
                        </div>
                        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                          <Phone size={14} style={{ color: '#94a3b8' }} /> {member.phone || 'No phone'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {member.role === 'CLASS_TEACHER' ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                          <GraduationCap size={16} /> Class {member.assignedClass ?? '—'}-{member.assignedSection ?? '—'}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Full School Access</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => openEdit(member)}
                          style={{ padding: '8px', borderRadius: '10px', color: 'var(--primary)', border: '1px solid var(--primary-light)', background: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-light)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          style={{ padding: '8px', borderRadius: '10px', color: '#ef4444', border: '1px solid #fee2e2', background: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
                          title="Remove"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {staff.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
              <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No staff members found. Add your first member to get started.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {editingMember && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card"
              style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Edit Member</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Update role and class assignment for {editingMember.email}</p>
              </div>

              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input required value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} type="text" placeholder="e.g. John Doe" />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} type="tel" placeholder="10 digit number" />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select value={editFormData.role} onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}>
                    <option value="CLASS_TEACHER">Class Teacher</option>
                    <option value="SCHOOL_ADMIN">School Admin</option>
                    <option value="PRINCIPAL">Principal</option>
                    <option value="NURSE_COUNSELLOR">Nurse / Counsellor</option>
                    <option value="DISTRICT_VIEWER">District Viewer</option>
                    <option value="STAFF">General Staff</option>
                  </select>
                </div>

                {editFormData.role === 'CLASS_TEACHER' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid-2" 
                    style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}
                  >
                    <div className="form-group">
                      <label>Assigned Class</label>
                      <input required type="number" value={editFormData.assignedClass} onChange={e => setEditFormData({ ...editFormData, assignedClass: e.target.value })} placeholder="e.g. 5" />
                    </div>
                    <div className="form-group">
                      <label>Assigned Section</label>
                      <input required type="text" value={editFormData.assignedSection} onChange={e => setEditFormData({ ...editFormData, assignedSection: e.target.value.toUpperCase() })} placeholder="e.g. A" />
                    </div>
                  </motion.div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: '12px', height: '48px', fontWeight: 700 }}>Save Changes</button>
                  <button type="button" onClick={() => setEditingMember(null)} className="btn" style={{ background: '#f1f5f9', color: '#475569', borderRadius: '12px', height: '48px' }}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card"
              style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Add New Member</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Create a new login for your faculty or staff.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g. John Doe" />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Email (Login ID)</label>
                    <input required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" placeholder="email@school.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="10 digit number" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="CLASS_TEACHER">Class Teacher</option>
                    <option value="SCHOOL_ADMIN">School Admin</option>
                    <option value="PRINCIPAL">Principal</option>
                    <option value="NURSE_COUNSELLOR">Nurse / Counsellor</option>
                    <option value="DISTRICT_VIEWER">District Viewer</option>
                    <option value="STAFF">General Staff</option>
                  </select>
                </div>

                {formData.role === 'CLASS_TEACHER' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid-2" 
                    style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}
                  >
                    <div className="form-group">
                      <label>Assigned Class</label>
                      <input required type="number" value={formData.assignedClass} onChange={e => setFormData({...formData, assignedClass: e.target.value})} placeholder="e.g. 5" />
                    </div>
                    <div className="form-group">
                      <label>Assigned Section</label>
                      <input required type="text" value={formData.assignedSection} onChange={e => setFormData({...formData, assignedSection: e.target.value.toUpperCase()})} placeholder="e.g. A" />
                    </div>
                  </motion.div>
                )}

                <div className="form-group">
                  <label>Initial Password</label>
                  <input required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} type="password" placeholder="Min 6 characters" />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: '12px', height: '48px', fontWeight: 700 }}>Register Member</button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn" style={{ background: '#f1f5f9', color: '#475569', borderRadius: '12px', height: '48px' }}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffManagement;
