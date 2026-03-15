import React, { useState, useEffect } from 'react';
import { childService, cardService, dashboardService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, Plus, Phone, GraduationCap, CheckCircle2, Clock, XCircle, ChevronRight, User, CreditCard, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ChildRecords: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [children, setChildren] = useState<any[]>([]);
  const userStr = localStorage.getItem('school_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || '';
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Class Teacher: lock to assigned class/section only
  const isClassTeacher = role === 'CLASS_TEACHER';
  const assignedClass = user?.assignedClass != null ? String(user.assignedClass) : '';
  const assignedSection = user?.assignedSection ?? '';
  const [filterClass, setFilterClass] = useState(isClassTeacher ? assignedClass : '');
  const [filterSection, setFilterSection] = useState(isClassTeacher ? assignedSection : '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkCardModal, setShowBulkCardModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [bulkCardLoading, setBulkCardLoading] = useState(false);
  const [bulkCardFilters, setBulkCardFilters] = useState({ class: '' as string, section: '' });
  const [exportFilters, setExportFilters] = useState({ format: 'csv' as 'csv' | 'pdf', academicYear: '2024-2025', class: '' as string, section: '', domain: 'all' });
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
    } catch (err: any) {
      console.error(err);
      toast(err.response?.data?.message || err.message || 'Failed to load students', 'error');
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
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error adding child record';
      toast(errorMsg, 'error');
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

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await dashboardService.exportReport({
        format: exportFilters.format,
        academicYear: exportFilters.academicYear || undefined,
        class: isClassTeacher && assignedClass ? parseInt(assignedClass) : (exportFilters.class ? parseInt(exportFilters.class) : undefined),
        section: isClassTeacher ? (assignedSection || undefined) : (exportFilters.section || undefined),
        domain: exportFilters.domain !== 'all' ? exportFilters.domain : undefined,
      });
      setShowExportModal(false);
      toast('Report downloaded', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || err.message || 'Export failed', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleBulkIdCards = async () => {
    setBulkCardLoading(true);
    try {
      await cardService.exportBulk({
        class: bulkCardFilters.class ? parseInt(bulkCardFilters.class) : undefined,
        section: bulkCardFilters.section || undefined,
      });
      setShowBulkCardModal(false);
      toast('ID cards downloaded', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || err.message || 'Failed to download ID cards', 'error');
    } finally {
      setBulkCardLoading(false);
    }
  };

  const uniqueClasses = Array.from(new Set(children.map((c: any) => c.class))).sort((a, b) => a - b);
  const uniqueSections = Array.from(new Set(children.map((c: any) => c.section))).sort();

  const filteredChildren = children.filter((c: any) => {
    const matchClass = !filterClass || String(c.class) === filterClass;
    const matchSection = !filterSection || c.section === filterSection;
    return matchClass && matchSection;
  });

  const openIdCard = async (e: React.MouseEvent, childId: number) => {
    e.stopPropagation();
    try {
      const token = await cardService.ensureToken(childId);
      const url = `${window.location.origin}/card/${token}`;
      window.open(url, '_blank', 'noopener');
    } catch (err: any) {
      console.error(err);
      toast(err.response?.data?.message || err.message || 'Failed to generate ID card', 'error');
    }
  };

  const StatusBadge = ({ status, onClick }: { status: string, onClick?: (e: any) => void }) => {
    let bg = '#fef3c7', color = '#92400e', Icon = Clock;
    if (status === 'Done') { bg = '#dcfce7'; color = '#166534'; Icon = CheckCircle2; }
    else if (status === 'Absent') { bg = '#fee2e2'; color = '#991b1b'; Icon = XCircle; }
    
    return (
      <span 
        onClick={onClick}
        style={{ background: bg, color: color, padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', border: `1px solid ${color}30` }}
      >
        <Icon size={14}/> {status}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, var(--primary) 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Student Directory</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage and monitor student health profiles and registrations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['SCHOOL_ADMIN', 'PRINCIPAL'].includes(role) && (
            <>
              <button 
                onClick={() => setShowBulkCardModal(true)}
                disabled={children.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', color: 'var(--primary)', fontWeight: 600, cursor: children.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                <CreditCard size={20} /> Download All ID Cards
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
              >
                <Download size={20} /> Export Report
              </button>
              <button 
                onClick={() => setShowAddModal(true)} 
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 4px 15px var(--primary-light)' }}
              >
                <Plus size={20} /> Add New Student
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', background: 'white', padding: '1rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search 
              size={20} 
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} 
            />
            <input 
              type="text" 
              placeholder="Search by student name, class, section, or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '3rem', paddingRight: '1rem', height: '50px', background: '#f8fafc', border: 'none', borderRadius: '12px', width: '100%', fontSize: '1rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              disabled={isClassTeacher}
              title={isClassTeacher ? 'You can only view your assigned class' : ''}
              style={{ height: '50px', padding: '0 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: isClassTeacher ? '#f1f5f9' : '#f8fafc', fontSize: '0.95rem', minWidth: '100px', opacity: isClassTeacher ? 0.9 : 1 }}
            >
              <option value="">All classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={String(cls)}>Class {cls}</option>
              ))}
            </select>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              disabled={isClassTeacher}
              title={isClassTeacher ? 'You can only view your assigned section' : ''}
              style={{ height: '50px', padding: '0 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: isClassTeacher ? '#f1f5f9' : '#f8fafc', fontSize: '0.95rem', minWidth: '100px', opacity: isClassTeacher ? 0.9 : 1 }}
            >
              <option value="">All sections</option>
              {uniqueSections.map((sec) => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '50px', padding: '0 2rem', borderRadius: '12px' }}>
            Search
          </button>
        </form>
        {(filterClass || filterSection) && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isClassTeacher ? (
              <>Showing your class: {filteredChildren.length} students</>
            ) : (
              <>
                Showing {filteredChildren.length} of {children.length} students
                <button
                  onClick={() => { setFilterClass(''); setFilterSection(''); }}
                  style={{ marginLeft: '0.5rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Records Table */}
      {/* Records List View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div className="glass-card" style={{ padding: '4rem', background: 'white' }}>
            <LoadingSpinner label="Loading student records..." />
          </div>
        ) : filteredChildren.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', background: 'white', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
             <User size={60} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
             <h3>
               {isClassTeacher && !assignedClass
                 ? 'No class assigned'
                 : children.length === 0
                   ? 'No Students Found'
                   : 'No matches for filters'}
             </h3>
             <p>
               {isClassTeacher && !assignedClass
                 ? 'Your account is not assigned to a class. Contact school admin.'
                 : children.length === 0
                   ? 'Register a new student to see them listed here.'
                   : 'Try different class or section filters.'}
             </p>
          </div>
        ) : (
          filteredChildren.map((child, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={child.id}
              className="glass-card record-card"
              onClick={() => navigate(`/child/${child.id}`)}
              style={{ 
                background: 'white', 
                padding: '1.5rem', 
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) 1.5fr 1fr 1.5fr 40px',
                gap: '1.5rem',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(236, 72, 153, 0.1)';
                e.currentTarget.style.borderColor = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* Profile Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}>
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{child.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', background: '#fdf2f8', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--primary-light)' }}>
                      {child.registrationNo}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>| {child.gender}</span>
                  </div>
                </div>
              </div>

              {/* Class Info */}
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>CLASS & SECTION</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)' }}>
                  <GraduationCap size={16} color="var(--primary)" /> Class {child.class}-{child.section}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>CONTACT</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="var(--primary)" /> {child.mobile}
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => openIdCard(e, child.id)}
                    title="View ID Card"
                    style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    <CreditCard size={16} /> ID Card
                  </button>
                  {['SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF'].includes(role) && (
                    <select 
                      value={child.status}
                      onChange={(e) => updateStatus(child.id, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '8px 12px', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <option value="Pending">🕒 Pending</option>
                      <option value="Done">✅ Done</option>
                      <option value="Absent">❌ Absent</option>
                    </select>
                  )}
                  <StatusBadge status={child.status} />
              </div>

              <div style={{ color: 'var(--text-muted)', display: 'flex', justifyContent: 'flex-end' }}>
                 <ChevronRight size={20} />
              </div>

            </motion.div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card" 
              style={{ background: 'white', width: '100%', maxWidth: '800px', padding: '0', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, white 100%)', padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Register New Student</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Enter the complete details of the student for registration.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <XCircle size={18} color="var(--text-muted)" />
                </button>
              </div>

              <div style={{ padding: '2rem', overflowY: 'auto' }}>
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk ID Card Modal */}
      <AnimatePresence>
        {showBulkCardModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }} onClick={() => setShowBulkCardModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card" 
              style={{ background: 'white', width: '100%', maxWidth: '400px', padding: '0', borderRadius: '16px', overflow: 'hidden' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Download ID Cards</h3>
                <button onClick={() => setShowBulkCardModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <XCircle size={20} color="var(--text-muted)" />
                </button>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                  Download a PDF with one ID card per page. Optionally filter by class or section.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Class (optional)</label>
                    <select 
                      value={bulkCardFilters.class}
                      onChange={(e) => setBulkCardFilters({ ...bulkCardFilters, class: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    >
                      <option value="">All classes</option>
                      {uniqueClasses.map((c: number) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Section (optional)</label>
                    <select 
                      value={bulkCardFilters.section}
                      onChange={(e) => setBulkCardFilters({ ...bulkCardFilters, section: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem' }}
                    >
                      <option value="">All sections</option>
                      {uniqueSections.map((s: string) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={handleBulkIdCards} disabled={bulkCardLoading} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <CreditCard size={18} /> {bulkCardLoading ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button onClick={() => setShowBulkCardModal(false)} className="btn" style={{ background: '#f1f5f9' }}>Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }} onClick={() => setShowExportModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card" 
              style={{ background: 'white', width: '100%', maxWidth: '420px', padding: '0', borderRadius: '16px', overflow: 'hidden' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Export Health Report</h3>
                <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <XCircle size={20} color="var(--text-muted)" />
                </button>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Format</label>
                  <select 
                    value={exportFilters.format} 
                    onChange={(e) => setExportFilters({ ...exportFilters, format: e.target.value as 'csv' | 'pdf' })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem' }}
                  >
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Academic Year (optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2024-2025"
                    value={exportFilters.academicYear}
                    onChange={(e) => setExportFilters({ ...exportFilters, academicYear: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Leave blank for all years</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Class</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 10"
                      value={isClassTeacher ? assignedClass : exportFilters.class}
                      onChange={(e) => !isClassTeacher && setExportFilters({ ...exportFilters, class: e.target.value })}
                      disabled={isClassTeacher}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem', opacity: isClassTeacher ? 0.9 : 1 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Section</label>
                    <input 
                      type="text" 
                      placeholder="e.g. A"
                      value={isClassTeacher ? assignedSection : exportFilters.section}
                      onChange={(e) => !isClassTeacher && setExportFilters({ ...exportFilters, section: e.target.value })}
                      disabled={isClassTeacher}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem', opacity: isClassTeacher ? 0.9 : 1 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Health Domain</label>
                  <select 
                    value={exportFilters.domain} 
                    onChange={(e) => setExportFilters({ ...exportFilters, domain: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem' }}
                  >
                    <option value="all">All domains</option>
                    <option value="bmi">BMI only</option>
                    <option value="dental">Dental only</option>
                    <option value="vision">Vision only</option>
                    <option value="immunization">Immunization only</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={handleExport} disabled={exportLoading} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Download size={18} /> {exportLoading ? 'Exporting...' : 'Download'}
                  </button>
                  <button onClick={() => setShowExportModal(false)} className="btn" style={{ background: '#f1f5f9' }}>Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChildRecords;
