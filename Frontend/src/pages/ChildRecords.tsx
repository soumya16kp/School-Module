import React, { useState, useEffect } from 'react';
import { childService, cardService, dashboardService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, Plus, Phone, GraduationCap, CheckCircle2, Clock, XCircle, ChevronRight, User, CreditCard, Download, Edit, Mail } from 'lucide-react';
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
  const [filterHealth, setFilterHealth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
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
    fatherName: '',
    motherName: '',
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
        fatherName: '',
        motherName: '',
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await childService.update(editFormData.id, editFormData);
      setShowEditModal(false);
      setEditFormData(null);
      fetchChildren();
      toast('Student details updated successfully', 'success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error updating child record';
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

  const getHealthStatus = (child: any) => {
    const latest = child.healthRecords?.[0];
    if (!latest) return { color: '#94a3b8', label: 'No Data', icon: Clock }; // Gray
    
    const bmiCat = latest.bmiCategory || '';
    let issues = 0;
    
    // Logic for health parameters
    if (latest.dentalOverallHealth?.includes('Problem') || latest.dentalOverallHealth?.includes('Infection') || latest.dentalReferralNeeded) issues++;
    if (latest.eyeCheckup?.includes('Issue') || latest.visionReferralNeeded) issues++;
    if (bmiCat === 'OBESE') issues += 2;
    if (bmiCat === 'UNDERWEIGHT' || bmiCat === 'OVERWEIGHT') issues++;

    if (issues >= 2) return { color: '#ef4444', label: 'Critical', icon: XCircle }; // Red
    if (issues === 1) return { color: '#f59e0b', label: 'Warning', icon: Clock }; // Yellow
    return { color: '#10b981', label: 'Healthy', icon: CheckCircle2 }; // Green
  };

  const filteredChildren = children.filter((c: any) => {
    const matchClass = !filterClass || String(c.class) === filterClass;
    const matchSection = !filterSection || c.section === filterSection;
    const health = getHealthStatus(c);
    const matchHealth = !filterHealth || health.label === filterHealth;
    const matchStatus = !filterStatus || c.status === filterStatus;
    
    return matchClass && matchSection && matchHealth && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredChildren.length / PAGE_SIZE));
  const pagedChildren = filteredChildren.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 whenever a filter changes
  const setFilterClassAndReset = (v: string) => { setFilterClass(v); setPage(1); };
  const setFilterSectionAndReset = (v: string) => { setFilterSection(v); setPage(1); };
  const setFilterHealthAndReset = (v: string) => { setFilterHealth(v); setPage(1); };
  const setFilterStatusAndReset = (v: string) => { setFilterStatus(v); setPage(1); };

  const uniqueClasses = Array.from(new Set(children.map((c: any) => c.class))).sort((a, b) => a - b);
  const uniqueSections = Array.from(new Set(children.map((c: any) => c.section))).sort();

  const StatusBadge = ({ status, onClick }: { status: string, onClick?: (e: any) => void }) => {
    let bg = '#fef3c7', color = '#92400e', Icon = Clock;
    if (status === 'Done') { bg = '#dcfce7'; color = '#166534'; Icon = CheckCircle2; }
    else if (status === 'Absent') { bg = '#fee2e2'; color = '#991b1b'; Icon = XCircle; }
    
    return (
      <span 
        onClick={onClick}
        style={{ background: bg, color: color, padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', border: `1px solid ${color}30` }}
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
      <div className="glass-card" style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Full-length Search Bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search 
              size={22} 
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} 
            />
            <input 
              type="text" 
              placeholder="Search by student name, class, section, or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                paddingLeft: '3.5rem', 
                paddingRight: '1rem', 
                height: '60px', 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '16px', 
                width: '100%', 
                fontSize: '1.1rem',
                transition: 'all 0.3s',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(236, 72, 153, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
              }}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ position: 'absolute', right: '8px', top: '8px', bottom: '8px', height: '44px', padding: '0 2rem', borderRadius: '12px', fontWeight: 700 }}
            >
              Search
            </button>
          </div>

          {/* Filters Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Class</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClassAndReset(e.target.value)}
                disabled={isClassTeacher}
                style={{ height: '48px', padding: '0 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: isClassTeacher ? '#f1f5f9' : '#f8fafc', fontSize: '0.95rem', width: '100%', fontWeight: 500 }}
              >
                <option value="">All Classes</option>
                {Array.from(new Set(children.map((c: any) => c.class))).sort((a, b) => a - b).map((cls) => (
                  <option key={cls} value={String(cls)}>Class {cls}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Section</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSectionAndReset(e.target.value)}
                disabled={isClassTeacher}
                style={{ height: '48px', padding: '0 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: isClassTeacher ? '#f1f5f9' : '#f8fafc', fontSize: '0.95rem', width: '100%', fontWeight: 500 }}
              >
                <option value="">All Sections</option>
                {Array.from(new Set(children.map((c: any) => c.section))).sort().map((sec) => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Health Status</label>
              <select
                value={filterHealth}
                onChange={(e) => setFilterHealthAndReset(e.target.value)}
                style={{ height: '48px', padding: '0 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '0.95rem', width: '100%', fontWeight: 500 }}
              >
                <option value="">All Status</option>
                <option value="Healthy">🟢 Healthy</option>
                <option value="Warning">🟡 Warning</option>
                <option value="Critical">🔴 Critical</option>
                <option value="No Data">⚪ No Data</option>
              </select>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Attendance</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatusAndReset(e.target.value)}
                style={{ height: '48px', padding: '0 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '0.95rem', width: '100%', fontWeight: 500 }}
              >
                <option value="">All Students</option>
                <option value="Done"> Present</option>
                <option value="Absent"> Absent</option>
                <option value="Pending"> Pending</option>
              </select>
            </div>
          </div>
        </form>

        {(filterClass || filterSection || filterHealth || filterStatus) && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{filteredChildren.length}</span> results
            </div>
            <button
              onClick={() => { setFilterClass(''); setFilterSection(''); setFilterHealth(''); setFilterStatus(''); setPage(1); }}
              style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, background: '#fdf2f8', border: '1px solid var(--primary-light)', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Reset Filters
            </button>
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
          pagedChildren.map((child, index) => (
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
                gridTemplateColumns: 'minmax(0, 2fr) 1.2fr 1.5fr 1fr 1.2fr 80px',
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
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 500, flexShrink: 0 }}>
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{child.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--primary)', background: '#fdf2f8', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--primary-light)' }}>
                      {child.registrationNo}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>| {child.gender}</span>
                  </div>
                </div>
              </div>

              {/* Class Info */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500, textTransform: 'uppercase' }}>Class & Section</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, color: 'var(--text-main)' }}>
                  <GraduationCap size={16} color="var(--primary)" /> Class {child.class}-{child.section}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500, textTransform: 'uppercase' }}>Contact Info</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="var(--primary)" /> {child.mobile || '—'}
                  </div>
                  {child.emailId && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
                      <Mail size={14} /> {child.emailId}
                    </div>
                  )}
                </div>
              </div>

              {/* Health Status Indicator */}
              <div style={{ padding: '4px 12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>HEALTH STATUS</div>
                {(() => {
                  const health = getHealthStatus(child);
                  const HealthIcon = health.icon;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: health.color, fontWeight: 500, fontSize: '0.9rem' }}>
                      <HealthIcon size={16} /> {health.label}
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: health.color }}></div>
                    </div>
                  );
                })()}
              </div>

              {/* Attendance/Checkup Selection */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                  {['SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF', 'CLASS_TEACHER'].includes(role) && (
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={child.status}
                        onChange={(e) => updateStatus(child.id, e.target.value)}
                        style={{ 
                          fontSize: '0.85rem', 
                          padding: '8px 32px 8px 12px', 
                          borderRadius: '10px', 
                          background: child.status === 'Done' ? '#dcfce7' : child.status === 'Absent' ? '#fee2e2' : '#f1f5f9', 
                          color: child.status === 'Done' ? '#166534' : child.status === 'Absent' ? '#991b1b' : 'var(--text-muted)',
                          border: 'none', 
                          cursor: 'pointer', 
                          fontWeight: 500,
                          appearance: 'none',
                          WebkitAppearance: 'none'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Done">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                      <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.6 }}>
                        {child.status === 'Done' ? <CheckCircle2 size={16} /> : child.status === 'Absent' ? <XCircle size={16} /> : <Clock size={16} />}
                      </div>
                    </div>
                  )}
                  {(!['SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF', 'CLASS_TEACHER'].includes(role)) && (
                    <StatusBadge status={child.status} />
                  )}
              </div>

              <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                 {['SCHOOL_ADMIN', 'PRINCIPAL', 'WOMBTO18_OPS'].includes(role) && (
                   <button
                     onClick={(e) => { e.stopPropagation(); setEditFormData(child); setShowEditModal(true); }}
                     style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '8px', borderRadius: '10px', transition: 'all 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.background = '#fce7f3'}
                     onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                     title="Edit Record"
                   >
                     <Edit size={18} />
                   </button>
                 )}
                 <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <ChevronRight size={20} />
                 </div>
              </div>

            </motion.div>
          ))
        )}
      </div>

      {/* Pagination Bar */}
      {!loading && filteredChildren.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', padding: '1rem 1.5rem', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredChildren.length)}</span> of <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{filteredChildren.length}</span> students
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: page === 1 ? '#f8fafc' : 'white', color: page === 1 ? '#cbd5e1' : 'var(--text-main)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s' }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid', borderColor: page === p ? 'var(--primary)' : 'var(--border)', background: page === p ? 'var(--primary)' : 'white', color: page === p ? 'white' : 'var(--text-main)', cursor: 'pointer', fontWeight: page === p ? 600 : 400, fontSize: '0.9rem', transition: 'all 0.2s' }}
                  >
                    {p}
                  </button>
                )
              )
            }
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: page === totalPages ? '#f8fafc' : 'white', color: page === totalPages ? '#cbd5e1' : 'var(--text-main)', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

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
                    <label>Father's Name</label>
                    <input 
                      type="text" 
                      value={formData.fatherName}
                      onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mother's Name</label>
                    <input 
                      type="text" 
                      value={formData.motherName}
                      onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                      placeholder="Full Name"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Father's number (for parent login)</label>
                    <input 
                      required 
                      type="tel" 
                      value={formData.fatherNumber}
                      onChange={(e) => setFormData({...formData, fatherNumber: e.target.value})}
                      placeholder="Guardian contact"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mother's number (for parent login)</label>
                    <input 
                      required 
                      type="tel" 
                      value={formData.motherNumber}
                      onChange={(e) => setFormData({...formData, motherNumber: e.target.value})}
                      placeholder="Guardian contact"
                    />
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                  Only the designated guardian should use these numbers for parent portal login. The school is responsible for ensuring these contacts belong to the legal guardian(s).
                </p>

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

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editFormData && (
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
                  <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Edit Student Record</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Update details for {editFormData.name}.</p>
                </div>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <XCircle size={18} color="var(--text-muted)" />
                </button>
              </div>

              <div style={{ padding: '2rem', overflowY: 'auto' }}>
                <form onSubmit={handleEditSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      required 
                      type="text" 
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Class (No.)</label>
                    <input 
                      required 
                      type="number" 
                      value={editFormData.class || ''}
                      onChange={(e) => setEditFormData({...editFormData, class: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <input 
                      required 
                      type="text" 
                      maxLength={1}
                      value={editFormData.section || ''}
                      onChange={(e) => setEditFormData({...editFormData, section: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Father's Name</label>
                    <input 
                      type="text" 
                      value={editFormData.fatherName || ''}
                      onChange={(e) => setEditFormData({...editFormData, fatherName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mother's Name</label>
                    <input 
                      type="text" 
                      value={editFormData.motherName || ''}
                      onChange={(e) => setEditFormData({...editFormData, motherName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Father's Contact No</label>
                    <input 
                      required 
                      type="tel" 
                      value={editFormData.fatherNumber || ''}
                      onChange={(e) => setEditFormData({...editFormData, fatherNumber: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mother's Contact No</label>
                    <input 
                      required 
                      type="tel" 
                      value={editFormData.motherNumber || ''}
                      onChange={(e) => setEditFormData({...editFormData, motherNumber: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Student Email (Optional)</label>
                    <input 
                      type="email" 
                      value={editFormData.emailId || ''}
                      onChange={(e) => setEditFormData({...editFormData, emailId: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Primary Mobile No</label>
                    <input 
                      required 
                      type="tel" 
                      value={editFormData.mobile || ''}
                      onChange={(e) => setEditFormData({...editFormData, mobile: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Gender</label>
                    <select 
                      value={editFormData.gender || 'Male'}
                      onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Other Parameters / Notes</label>
                  <textarea 
                    value={editFormData.notes || ''}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Update Record</button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="btn" style={{ background: '#f1f5f9' }}>Cancel</button>
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

