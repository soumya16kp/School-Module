import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHealthContext } from '../context/HealthContext';
import { cardService } from '../services/api';
import { User, CheckCircle2, Info, Calendar, ArrowLeft, Phone, Mail, GraduationCap, Stethoscope, Droplets, Apple, BrainCircuit, Syringe, Eye, CreditCard, Edit, Activity, HeartPulse, ShieldCheck, Clock } from 'lucide-react';
import { getEventTypesForClass } from '../config/ageBands';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const ChildProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { child, healthRecords, loading, fetchChildData, addHealthRecord, updateHealthRecord } = useHealthContext();
  
  const PREDEFINED_PROGRAMS = [
    { type: 'GENERAL_CHECKUP', title: 'Annual Health Check-up' },
    { type: 'MENTAL_WELLNESS', title: 'Mental Wellness Session' },
    { type: 'NUTRITION_SESSION', title: 'Nutrition & Dietetics' },
    { type: 'FIRE_DRILL', title: 'Fire Safety Drill' },
    { type: 'CPR_FIRST_AID_TRAINING', title: 'CPR & First Aid Training' },
    { type: 'HYGIENE_WELLNESS', title: 'Hygiene & Wellness' },
    { type: 'IMMUNIZATION_DEWORMING', title: 'Immunization & Deworming' }
  ];
  
  const userStr = localStorage.getItem('school_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || '';
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [idCardLoading, setIdCardLoading] = useState(false);
  
  const displayRecords = healthRecords.length > 0 ? healthRecords : [
    {
      id: -1,
      academicYear: '2024-2025',
      checkupDate: null,
      height: null,
      weight: null,
      bmi: null,
      bmiCategory: null,
      dentalCheckup: 'Pending',
      dentalCariesIndex: null,
      dentalOverallHealth: 'Pending',
      dentalReferralNeeded: false,
      dentalReferralReason: '',
      dentalNotes: '',
      eyeCheckup: 'Pending',
      eyeVisionLeft: 'Pending',
      eyeVisionRight: 'Pending',
      visionOverall: 'Pending',
      visionReferralNeeded: false,
      visionNotes: '',
    }
  ];

  const uniqueYears = Array.from(new Set(displayRecords.map(r => r.academicYear))).sort().reverse();
  
  useEffect(() => {
    if (displayRecords.length > 0 && !selectedYear) {
      setSelectedYear(displayRecords[displayRecords.length - 1].academicYear);
    }
  }, [displayRecords]);

  const currentRecord = displayRecords.find(r => r.academicYear === selectedYear) || displayRecords[displayRecords.length - 1];

  const deriveBmiAndCategory = (record: any) => {
    if (!record) return { bmiValue: null as number | null, bmiCategory: null as string | null };
    let bmiValue: number | null = record.bmi ?? null;
    if ((bmiValue === null || bmiValue === undefined) && record.height && record.weight) {
      const hMeters = record.height / 100;
      if (hMeters > 0) {
        const computed = record.weight / (hMeters * hMeters);
        bmiValue = Number.isFinite(computed) ? parseFloat(computed.toFixed(2)) : null;
      }
    }
    let bmiCategory: string | null = record.bmiCategory ?? null;
    if (!bmiCategory && bmiValue != null && Number.isFinite(bmiValue)) {
      if (bmiValue < 18.5) bmiCategory = 'UNDERWEIGHT';
      else if (bmiValue < 25) bmiCategory = 'NORMAL';
      else if (bmiValue < 30) bmiCategory = 'OVERWEIGHT';
      else bmiCategory = 'OBESE';
    }
    return { bmiValue, bmiCategory };
  };

  const { bmiValue, bmiCategory } = deriveBmiAndCategory(currentRecord);

  const emptyForm = {
    academicYear: '2024-2025',
    checkupDate: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    dentalCheckup: 'Pending',
    dentalCavities: '',
    dentalOverallHealth: 'Healthy',
    dentalReferralNeeded: false,
    dentalReferralReason: '',
    dentalNotes: '',
    eyeCheckup: 'Pending',
    eyeVisionLeft: '6/6',
    eyeVisionRight: '6/6',
    visionOverall: '',
    visionReferralNeeded: false,
    visionNotes: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!id) return;
    fetchChildData(parseInt(id)).catch((err: any) => {
      if (err?.response?.status === 403) {
        navigate('/dashboard', { state: { fromChild403: true, message: "You don't have access to this record." } });
      }
    });
  }, [id, navigate]);

  const openEditForm = () => {
    setFormData({
      academicYear: currentRecord.academicYear,
      checkupDate: currentRecord.checkupDate ? new Date(currentRecord.checkupDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      height: currentRecord.height || '',
      weight: currentRecord.weight || '',
      dentalCheckup: currentRecord.dentalCheckup || 'Pending',
      dentalCavities: currentRecord.dentalCavities ?? currentRecord.dentalCariesIndex ?? '',
      dentalOverallHealth: currentRecord.dentalOverallHealth || 'Healthy',
      dentalReferralNeeded: currentRecord.dentalReferralNeeded || false,
      dentalReferralReason: currentRecord.dentalReferralReason || '',
      dentalNotes: currentRecord.dentalNotes || '',
      eyeCheckup: currentRecord.eyeCheckup || 'Pending',
      eyeVisionLeft: currentRecord.eyeVisionLeft || '6/6',
      eyeVisionRight: currentRecord.eyeVisionRight || '6/6',
      visionOverall: currentRecord.visionOverall || '',
      visionReferralNeeded: currentRecord.visionReferralNeeded || false,
      visionNotes: currentRecord.visionNotes || '',
    });
    setReportFile(null);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const hNum = parseFloat(formData.height);
    const wNum = parseFloat(formData.weight);
    const cariesNum = formData.dentalCavities !== '' ? parseFloat(formData.dentalCavities) : null;

    if (!Number.isFinite(hNum) || hNum < 40 || hNum > 220) {
      alert('Please enter a valid height between 40 cm and 220 cm.');
      return;
    }
    if (!Number.isFinite(wNum) || wNum < 5 || wNum > 200) {
      alert('Please enter a valid weight between 5 kg and 200 kg.');
      return;
    }
    if (cariesNum !== null && (cariesNum < 0 || cariesNum > 32)) {
      alert('Dental caries index must be between 0 and 32.');
      return;
    }

    // Calculate BMI
    const h = hNum / 100; // cm to m
    const w = wNum;
    const bmi = h > 0 && w > 0 ? (w / (h * h)).toFixed(2) : null;

    const fd = new FormData();
    Object.keys(formData).forEach(key => {
      fd.append(key, (formData as any)[key]);
    });
    fd.append('bmi', bmi || '');
    if (reportFile) {  
      fd.append('reportFile', reportFile);
    }

    try {
      const isEditing = currentRecord && currentRecord.id !== -1 && currentRecord.academicYear === formData.academicYear;
      if (isEditing) {
        await updateHealthRecord(parseInt(id), currentRecord.id, fd);
      } else {
        await addHealthRecord(parseInt(id), fd);
      }
      setShowAddForm(false);
      setReportFile(null);
      // Reset form
      setFormData(emptyForm);
    } catch (error) {
       console.error(error);
       alert("Failed to save record");
    }
  };

  const openIdCard = async () => {
    if (!id) return;
    setIdCardLoading(true);
    try {
      const token = await cardService.ensureToken(parseInt(id));
      const url = `${window.location.origin}/card/${token}`;
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      console.error(err);
      alert('Failed to generate ID card');
    } finally {
      setIdCardLoading(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
      <LoadingSpinner label="Loading Profile..." />
    </div>
  );
  if (!child) return <div style={{ padding: '3rem', textAlign: 'center' }}>Child not found</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'var(--green-600)';
      case 'PENDING': return 'var(--yellow-600)';
      case 'NOT_APPLICABLE': return 'var(--gray-500)';
      default: return 'var(--gray-500)';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'var(--green-100)';
      case 'PENDING': return 'var(--yellow-100)';
      case 'NOT_APPLICABLE': return 'var(--gray-100)';
      default: return 'var(--gray-100)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={20} />;
      case 'PENDING': return <Clock size={20} />;
      case 'NOT_APPLICABLE': return <Info size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 500 }}
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column: Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card" 
          style={{ padding: '0', background: 'white', alignSelf: 'start', overflow: 'hidden' }}
        >
          <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #ec4899 100%)', height: '100px', width: '100%' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 2rem 2rem 2rem', marginTop: '-50px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', position: 'relative', padding: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
               <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700 }}>
                  {child.name.charAt(0).toUpperCase()}
               </div>
              <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                {child.status === 'Done' ? <ShieldCheck size={20} color="#10b981" /> : <Activity size={20} color="#f59e0b" />}
              </div>
            </div>
            
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{child.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', background: '#fdf2f8', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--primary-light)' }}>
                {child.registrationNo}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{child.gender}</span>
            </div>
            
            <button
              onClick={openIdCard}
              disabled={idCardLoading}
              style={{ marginBottom: '1rem', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--primary-light)', background: '#fdf2f8', color: 'var(--primary)', fontWeight: 600, cursor: idCardLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <CreditCard size={18} /> {idCardLoading ? 'Generating...' : 'View / Download ID Card'}
            </button>
            <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={18} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Class & Section</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{child.class} - {child.section}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Primary Contact</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{child.mobile}</div>
                </div>
              </div>
              {child.emailId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} /></div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Email</div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{child.emailId}</div>
                  </div>
                </div>
              )}
              {child.fatherName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} /></div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Father's Name</div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{child.fatherName}</div>
                  </div>
                </div>
              )}
              {child.motherName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} /></div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Mother's Name</div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{child.motherName}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Health Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          
          {/* Year Filter Card */}
          {healthRecords.length > 0 && (
            <div className="glass-card" style={{ padding: '1rem 1.5rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--primary-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Calendar size={20} color="var(--primary)" />
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Historical Records:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {uniqueYears.map(year => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: selectedYear === year ? 'var(--primary)' : 'var(--border)',
                        background: selectedYear === year ? 'var(--primary)' : 'white',
                        color: selectedYear === year ? 'white' : 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing data for <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedYear}</span> session
              </div>
            </div>
          )}

          {/* Recommended screenings (age-band protocol) */}
          {child && (
            <div style={{ padding: '0.75rem 1rem', background: '#eff6ff', borderRadius: '12px', fontSize: '0.85rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Info size={16} />
              <span>
                <strong>Class {child.class}-{child.section}:</strong> Recommended screenings – {getEventTypesForClass(child.class).slice(0, 6).map(t => t.replace(/_/g, ' ').toLowerCase()).join(', ')}{getEventTypesForClass(child.class).length > 6 ? '...' : ''}
              </span>
            </div>
          )}

          {/* Header & Actions */}
          {/* Wellness Status Row (4 cards) - Primary focus, dynamic from Events */}
          {child && child.wellnessStatus && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '0.5rem' }}>
              {[
                { title: "Immunization", status: child.wellnessStatus.immunization.status, icon: <Syringe size={22} />, color: "#f59e0b", delay: 0.1 },
                { title: "Mental Wellness", status: child.wellnessStatus.mental.status, icon: <BrainCircuit size={22} />, color: "#8b5cf6", delay: 0.15 },
                { title: "Nutrition", status: child.wellnessStatus.nutrition.status, icon: <Apple size={22} />, color: "#10b981", delay: 0.2 },
                { title: "Hygiene", status: child.wellnessStatus.hygiene.status, icon: <Droplets size={22} />, color: "#0ea5e9", delay: 0.25 }
              ].map((stat, idx) => {
                const isAttended = stat.status === 'Attended';
                const isScheduled = stat.status === 'Scheduled';
                const isMissed = stat.status === 'Not Attended';

                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: stat.delay }}
                    whileHover={{ y: -5, boxShadow: `0 12px 25px -5px ${stat.color}30` }}
                    className="glass-card" 
                    style={{ 
                      padding: '1.25rem', 
                      background: 'white', 
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      textAlign: 'center',
                      borderTop: `4px solid ${isAttended ? '#10b981' : isScheduled ? '#3b82f6' : isMissed ? '#ef4444' : '#f1f5f9'}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '14px', 
                      background: `${stat.color}15`, 
                      color: stat.color, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginBottom: '0.75rem',
                      boxShadow: `0 4px 12px ${stat.color}20`
                    }}>
                        {stat.icon}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.3px' }}>{stat.title}</div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      background: isAttended ? '#dcfce7' : isScheduled ? '#eff6ff' : isMissed ? '#fee2e2' : '#f8fafc', 
                      color: isAttended ? '#166534' : isScheduled ? '#1d4ed8' : isMissed ? '#b91c1c' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: `1px solid ${isAttended ? '#10b98130' : isScheduled ? '#3b82f630' : isMissed ? '#ef444430' : '#e2e8f0'}`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>
                      {isAttended && <CheckCircle2 size={12} />}
                      {isScheduled && <Clock size={12} />}
                      {stat.status}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 800 }}>Health Dashboard</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['SCHOOL_ADMIN', 'PRINCIPAL', 'WOMBTO18_OPS'].includes(role) && (
                <button onClick={openEditForm} className="btn" style={{ background: '#f8fafc', border: '1px solid var(--border)', color: 'var(--text-main)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Edit size={18} /> Edit Current Record
                </button>
              )}
              <button onClick={() => { setFormData(emptyForm); setShowAddForm(!showAddForm); }} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {showAddForm ? 'Cancel Entry' : '+ New Session Entry'}
              </button>
            </div>
          </div>

          {/* New Entry Form */}
          {showAddForm && (
            <div className="glass-card animate-fade-in" style={{ padding: '2rem', background: 'white', borderLeft: '4px solid var(--primary)' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--primary)" /> Add Annual Record
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Academic Year</label>
                    <select 
                      required 
                      value={formData.academicYear} 
                      onChange={e => setFormData({...formData, academicYear: e.target.value})}
                    >
                      <option value="2022-2023">2022-2023</option>
                      <option value="2023-2024">2023-2024</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2025-2026">2025-2026</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Checkup Date</label>
                    <input type="date" required value={formData.checkupDate} onChange={e => setFormData({...formData, checkupDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="40"
                      max="220"
                      required
                      value={formData.height}
                      onChange={e => setFormData({...formData, height: e.target.value})}
                      placeholder="e.g. 145"
                    />
                  </div>
                  <div className="form-group">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="5"
                      max="200"
                      required
                      value={formData.weight}
                      onChange={e => setFormData({...formData, weight: e.target.value})}
                      placeholder="e.g. 40"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                   <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Dental Metrics</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</label>
                          <select value={formData.dentalCheckup} onChange={e => setFormData({...formData, dentalCheckup: e.target.value})}>
                            <option value="Done">Done</option>
                            <option value="Pending">Pending</option>
                            <option value="Requires Attention">Attention Required</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Caries index (0–32)</label>
                          <input
                            type="number"
                            min="0"
                            max="32"
                            step="0.1"
                            placeholder="e.g. 2"
                            value={formData.dentalCavities}
                            onChange={e => setFormData({ ...formData, dentalCavities: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Overall assessment</label>
                          <select value={formData.dentalOverallHealth} onChange={e => setFormData({...formData, dentalOverallHealth: e.target.value})}>
                            <option value="Healthy">Healthy</option>
                            <option value="Needs Cleaning">Needs Cleaning</option>
                            <option value="Infection Detected">Infection Detected</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Referral needed</label>
                          <select
                            value={String(formData.dentalReferralNeeded)}
                            onChange={e => setFormData({ ...formData, dentalReferralNeeded: e.target.value === 'true' })}
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                          {formData.dentalReferralNeeded && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <select
                                value={formData.dentalReferralReason}
                                onChange={e => setFormData({ ...formData, dentalReferralReason: e.target.value })}
                              >
                                <option value="">Select reason</option>
                                <option value="MULTIPLE_CARIES">Multiple caries</option>
                                <option value="PAIN">Pain</option>
                                <option value="GINGIVITIS">Gingivitis</option>
                                <option value="MALOCCLUSION">Malocclusion</option>
                                <option value="OTHER">Other</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Referral notes (optional)"
                                value={formData.dentalNotes}
                                onChange={e => setFormData({ ...formData, dentalNotes: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                   </div>
                   <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Eye Metrics</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</label>
                          <select value={formData.eyeCheckup} onChange={e => setFormData({...formData, eyeCheckup: e.target.value})}>
                            <option value="Done">Done</option>
                            <option value="Pending">Pending</option>
                            <option value="Issue Detected">Issue Detected</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Left eye (e.g. 6/6)</label>
                          <input type="text" placeholder="6/6" value={formData.eyeVisionLeft} onChange={e => setFormData({...formData, eyeVisionLeft: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Right eye (e.g. 6/6)</label>
                          <input type="text" placeholder="6/6" value={formData.eyeVisionRight} onChange={e => setFormData({...formData, eyeVisionRight: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Referral & notes</label>
                          <select
                            value={String(formData.visionReferralNeeded)}
                            onChange={e => setFormData({ ...formData, visionReferralNeeded: e.target.value === 'true' })}
                          >
                            <option value="false">No referral</option>
                            <option value="true">Referral needed</option>
                          </select>
                          <select
                            style={{ marginTop: '0.4rem' }}
                            value={formData.visionOverall}
                            onChange={e => setFormData({ ...formData, visionOverall: e.target.value })}
                          >
                            <option value="">Overall vision status</option>
                            <option value="NORMAL">Normal</option>
                            <option value="REQUIRES_FURTHER_EVAL">Requires further evaluation</option>
                            <option value="UNDER_TREATMENT">Under treatment</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Vision notes (optional)"
                            style={{ marginTop: '0.4rem' }}
                            value={formData.visionNotes}
                            onChange={e => setFormData({ ...formData, visionNotes: e.target.value })}
                          />
                        </div>
                      </div>
                   </div>
                   <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Medical Report / Lab File (PDF/Image)</label>
                      <input 
                        type="file" 
                        onChange={(e) => setReportFile(e.target.files ? e.target.files[0] : null)}
                        style={{ padding: '8px' }}
                      />
                   </div>
                </div>
                <button type="submit" className="btn btn-primary">Save Health Record</button>
              </form>
            </div>
          )}

          {/* BMI Visualization */}
          {displayRecords.length > 0 ? (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card" 
                style={{ padding: '2rem', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <HeartPulse size={22} color="var(--primary)" /> BMI & Growth Tracking
                  </h3>
                  {bmiValue != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Latest BMI:
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: '#eef2ff', color: '#3730a3' }}>
                        {bmiValue.toFixed(2)}
                      </span>
                      {bmiCategory && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', textTransform: 'capitalize', background: bmiCategory === 'NORMAL' ? '#dcfce7' : '#fee2e2', color: bmiCategory === 'NORMAL' ? '#166534' : '#991b1b' }}>
                          {bmiCategory.toLowerCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {healthRecords.length > 0 ? (
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthRecords} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="academicYear" stroke="#94a3b8" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#6366f1" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#ec4899" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 600, padding: '12px' }} 
                          itemStyle={{ padding: '4px 0' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600 }} />
                        <Line yAxisId="left" type="monotone" dataKey="bmi" name="BMI Score" stroke="#6366f1" strokeWidth={3} dot={{ stroke: '#6366f1', strokeWidth: 2, r: 4, fill: 'white' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }} />
                        <Line yAxisId="right" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#ec4899" strokeWidth={3} dot={{ stroke: '#ec4899', strokeWidth: 2, r: 4, fill: 'white' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#ec4899' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    No historical growth data available
                  </div>
                )}
              </motion.div>

              {/* Dental & Eye Row */}
              {currentRecord && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  {[
                    { 
                      title: "Dental Health", 
                      icon: <Stethoscope size={24} color="#0ea5e9" />,
                      val: currentRecord.dentalCheckup, 
                      sub: `Caries index: ${currentRecord.dentalCavities ?? currentRecord.dentalCariesIndex ?? 0} | ${currentRecord.dentalOverallHealth || 'N/A'}${currentRecord.dentalReferralNeeded ? ' • Referral: ' + (currentRecord.dentalReferralReason || 'Yes') : ''}`,
                      year: currentRecord.academicYear,
                      date: currentRecord.checkupDate ? new Date(currentRecord.checkupDate).toLocaleDateString() : 'N/A',
                      delay: 0.2
                    },
                    { 
                      title: "Eye Vision", 
                      icon: <Eye size={24} color="#8b5cf6" />,
                      val: currentRecord.eyeCheckup, 
                      sub: `L: ${currentRecord.eyeVisionLeft || 'N/A'} | R: ${currentRecord.eyeVisionRight || 'N/A'}${currentRecord.visionReferralNeeded ? ' • Referral' : ''}${currentRecord.visionOverall ? ' • ' + currentRecord.visionOverall.replace(/_/g, ' ').toLowerCase() : ''}`,
                      year: currentRecord.academicYear,
                      date: currentRecord.checkupDate ? new Date(currentRecord.checkupDate).toLocaleDateString() : 'N/A',
                      delay: 0.3
                    }
                  ].map((stat, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stat.delay }}
                      whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(236, 72, 153, 0.15)', borderColor: 'var(--primary-light)' }}
                      className="glass-card" 
                      style={{ padding: '1.5rem', background: 'white', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }}
                    >
                      <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05, transform: 'scale(3)' }}>
                        {stat.icon}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>{stat.icon}</div>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{stat.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>{stat.year} <span style={{ color: 'var(--text-muted)' }}>({stat.date})</span></div>
                        </div>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', color: (stat.val || '').includes('Pending') || (stat.val || '').includes('Needs') || (stat.val || '').includes('Problem') || (stat.val || '').includes('Issue') ? '#ef4444' : '#10b981' }}>
                        {stat.val}
                      </div>
                      {stat.sub && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {stat.sub}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}



              {/* Download Report Capability */}
              {currentRecord?.reportFile && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ marginTop: '1rem' }}
                >
                  <a 
                    href={`http://localhost:5000/uploads/${currentRecord.reportFile}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ background: '#f8fafc', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)' }}
                  >
                   📄 Download Medical Report ({currentRecord.academicYear})
                  </a>
                </motion.div>
              )}

              {/* Program Participation History */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="glass-card" 
                style={{ padding: '2rem', background: 'white' }}
              >
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                  <Calendar size={22} color="var(--primary)" /> Program Participation History
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(() => {
                    const history = [...(child.activityHistory || [])];
                    const predefinedWellnessTypes = ['MENTAL_WELLNESS', 'IMMUNIZATION_DEWORMING', 'IMMUNIZATION', 'NUTRITION_SESSION', 'HYGIENE_WELLNESS'];
                    const nonWellnessPredefined = PREDEFINED_PROGRAMS.filter(p => !predefinedWellnessTypes.includes(p.type));
                    const predefined = nonWellnessPredefined.filter(p => !history.some(h => h.type === p.type));
                    
                    const combined = [
                      ...history,
                      ...predefined.map(p => ({ title: p.title, type: p.type, status: 'Not Scheduled', scheduledAt: null }))
                    ];

                    return combined.length > 0 ? (
                      combined.map((ev: any, idx: number) => {
                        const isCompleted = ev.status === 'Present' || ev.status === 'Done' || ev.status === 'Absent';
                        const isScheduled = ev.status === 'Scheduled';
                        const isNotScheduled = ev.status === 'Not Scheduled';

                        return (
                          <div key={idx} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '1.25rem', 
                            background: isNotScheduled ? '#fcfcfc' : 'white', 
                            borderRadius: '16px', 
                            border: '1px solid #f1f5f9',
                            boxShadow: isNotScheduled ? 'none' : '0 2px 4px rgba(0,0,0,0.02)',
                            opacity: isNotScheduled ? 0.7 : 1
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                               <div style={{ 
                                 width: '40px', 
                                 height: '40px', 
                                 borderRadius: '12px', 
                                 background: isCompleted ? '#f0fdf4' : isScheduled ? '#eff6ff' : '#f8fafc',
                                 color: isCompleted ? '#16a34a' : isScheduled ? '#3b82f6' : '#94a3b8',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center'
                               }}>
                                 {isCompleted ? <CheckCircle2 size={20} /> : isScheduled ? <Clock size={20} /> : <Calendar size={20} />}
                               </div>
                               <div>
                                 <div style={{ fontWeight: 700, fontSize: '1rem', color: isNotScheduled ? 'var(--text-muted)' : 'var(--text-main)' }}>{ev.title}</div>
                                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                   {ev.scheduledAt ? (
                                      <>
                                        <Calendar size={12} />
                                        {new Date(ev.scheduledAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                      </>
                                   ) : (
                                      'Awaiting school scheduler'
                                   )}
                                 </div>
                               </div>
                            </div>
                            <div style={{ 
                              padding: '6px 14px', 
                              borderRadius: '20px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              background: ev.status === 'Present' || ev.status === 'Done' ? '#dcfce7' : ev.status === 'Absent' ? '#fee2e2' : ev.status === 'Scheduled' ? '#e0e7ff' : '#f1f5f9',
                              color: ev.status === 'Present' || ev.status === 'Done' ? '#166534' : ev.status === 'Absent' ? '#991b1b' : ev.status === 'Scheduled' ? '#4338ca' : '#64748b',
                              border: '1px solid currentColor',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {ev.status === 'Done' ? 'Attended' : ev.status}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                         No participation records found for this student.
                      </div>
                    );
                  })()}
                </div>
              </motion.div>

              {currentRecord?.id === -1 && (
                <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                  <p>This is a blank summary. Please edit the current record to add actual student health data.</p>
                </div>
              )}
            </>
          ) : null}

        </motion.div>
      </div>
    </div>
  );
};

export default ChildProfile;
