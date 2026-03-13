import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHealthContext } from '../context/HealthContext';
import { Activity, HeartPulse, ShieldCheck, Calendar, ArrowLeft, Phone, Mail, GraduationCap, Stethoscope, Droplets, Apple, BrainCircuit, Syringe, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const ChildProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { child, healthRecords, loading, fetchChildData, addHealthRecord } = useHealthContext();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  
  const uniqueYears = Array.from(new Set(healthRecords.map(r => r.academicYear))).sort().reverse();
  
  useEffect(() => {
    if (healthRecords.length > 0 && !selectedYear) {
      setSelectedYear(healthRecords[healthRecords.length - 1].academicYear);
    }
  }, [healthRecords]);

  const currentRecord = healthRecords.find(r => r.academicYear === selectedYear) || healthRecords[healthRecords.length - 1];

  const [formData, setFormData] = useState({
    academicYear: '2024-2025',
    checkupDate: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    dentalCheckup: 'Pending',
    dentalCavities: '',
    dentalOverallHealth: 'Healthy',
    eyeCheckup: 'Pending',
    eyeVisionLeft: '6/6',
    eyeVisionRight: '6/6',
    immunization: false,
    mentalWellness: false,
    nutrition: false,
    menstrualHygiene: false
  });

  useEffect(() => {
    if (id) {
      fetchChildData(parseInt(id));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Calculate BMI
    const h = parseFloat(formData.height) / 100; // cm to m
    const w = parseFloat(formData.weight);
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
      await addHealthRecord(parseInt(id), fd);
      setShowAddForm(false);
      setReportFile(null);
      // Reset form
      setFormData({
        academicYear: '2024-2025',
        checkupDate: new Date().toISOString().split('T')[0],
        height: '',
        weight: '',
        dentalCheckup: 'Pending',
        dentalCavities: '',
        dentalOverallHealth: 'Healthy',
        eyeCheckup: 'Pending',
        eyeVisionLeft: '6/6',
        eyeVisionRight: '6/6',
        immunization: false,
        mentalWellness: false,
        nutrition: false,
        menstrualHygiene: false
      });
    } catch (error) {
       console.error(error);
       alert("Failed to add record");
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--primary)' }}>Loading Profile...</div>;
  if (!child) return <div style={{ padding: '3rem', textAlign: 'center' }}>Child not found</div>;

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

          {/* Header & Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '2rem' }}>Health Dashboard</h1>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {showAddForm ? 'Cancel Entry' : '+ New Health Entry'}
            </button>
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
                    <input type="number" step="0.1" required value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="e.g. 145" />
                  </div>
                  <div className="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" step="0.1" required value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 40" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                   <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Dental Metrics</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <select value={formData.dentalCheckup} onChange={e => setFormData({...formData, dentalCheckup: e.target.value})}>
                          <option value="Done">Status: Done</option>
                          <option value="Pending">Status: Pending</option>
                          <option value="Requires Attention">Status: Attention Required</option>
                        </select>
                        <input type="number" placeholder="Cavities Count" value={formData.dentalCavities} onChange={e => setFormData({...formData, dentalCavities: e.target.value})} />
                        <select value={formData.dentalOverallHealth} onChange={e => setFormData({...formData, dentalOverallHealth: e.target.value})}>
                          <option value="Healthy">Overall: Healthy</option>
                          <option value="Needs Cleaning">Overall: Needs Cleaning</option>
                          <option value="Infection Detected">Overall: Infection Detected</option>
                        </select>
                      </div>
                   </div>
                   <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Eye Metrics</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <select value={formData.eyeCheckup} onChange={e => setFormData({...formData, eyeCheckup: e.target.value})}>
                          <option value="Done">Status: Done</option>
                          <option value="Pending">Status: Pending</option>
                          <option value="Issue Detected">Status: Issue Detected</option>
                        </select>
                        <input type="text" placeholder="L-Eye Vision (e.g. 6/6)" value={formData.eyeVisionLeft} onChange={e => setFormData({...formData, eyeVisionLeft: e.target.value})} />
                        <input type="text" placeholder="R-Eye Vision (e.g. 6/6)" value={formData.eyeVisionRight} onChange={e => setFormData({...formData, eyeVisionRight: e.target.value})} />
                      </div>
                   </div>
                   <div className="form-group">
                      <label>Immunization Attended</label>
                      <select value={String(formData.immunization)} onChange={e => setFormData({...formData, immunization: e.target.value === 'true'})}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                   </div>
                   <div className="form-group">
                      <label>Mental Wellness Attended</label>
                      <select value={String(formData.mentalWellness)} onChange={e => setFormData({...formData, mentalWellness: e.target.value === 'true'})}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                   </div>
                   <div className="form-group">
                      <label>Nutrition Attended</label>
                      <select value={String(formData.nutrition)} onChange={e => setFormData({...formData, nutrition: e.target.value === 'true'})}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                   </div>
                   <div className="form-group">
                      <label>Menstrual Hygiene Attended</label>
                      <select value={String(formData.menstrualHygiene)} onChange={e => setFormData({...formData, menstrualHygiene: e.target.value === 'true'})}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
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
          {healthRecords.length > 0 ? (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card" 
                style={{ padding: '2rem', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}
              >
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <HeartPulse size={22} color="var(--primary)" /> BMI & Growth Tracking
                </h3>
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
              </motion.div>

              {/* Dental & Eye Row */}
              {currentRecord && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  {[
                    { 
                      title: "Dental Health", 
                      icon: <Stethoscope size={24} color="#0ea5e9" />,
                      val: currentRecord.dentalCheckup, 
                      sub: `Cavities: ${currentRecord.dentalCavities || 0} | ${currentRecord.dentalOverallHealth || 'N/A'}`,
                      year: currentRecord.academicYear,
                      date: currentRecord.checkupDate ? new Date(currentRecord.checkupDate).toLocaleDateString() : 'N/A',
                      delay: 0.2
                    },
                    { 
                      title: "Eye Vision", 
                      icon: <Eye size={24} color="#8b5cf6" />,
                      val: currentRecord.eyeCheckup, 
                      sub: `L: ${currentRecord.eyeVisionLeft || 'N/A'} | R: ${currentRecord.eyeVisionRight || 'N/A'}`,
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

              {/* Others Row (4 columns) */}
              {currentRecord && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                  {[
                    { title: "Immunization", val: currentRecord.immunization, icon: <Syringe size={20} color="#f59e0b" />, delay: 0.4 },
                    { title: "Mental Wellness", val: currentRecord.mentalWellness, icon: <BrainCircuit size={20} color="#8b5cf6" />, delay: 0.45 },
                    { title: "Nutrition", val: currentRecord.nutrition, icon: <Apple size={20} color="#10b981" />, delay: 0.5 },
                    { title: "Hygiene", val: currentRecord.menstrualHygiene, icon: <Droplets size={20} color="#0ea5e9" />, delay: 0.55 }
                  ].map((stat, idx) => (
                    <motion.div 
                       key={idx} 
                       initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stat.delay }}
                       whileHover={{ y: -3, boxShadow: '0 8px 15px rgba(236, 72, 153, 0.1)', borderColor: 'var(--primary-light)' }}
                       className="glass-card" 
                       style={{ padding: '1.25rem', background: 'white', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                    >
                       <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                          {stat.icon}
                       </div>
                       <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>{stat.title}</div>
                       <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {currentRecord.academicYear} • {currentRecord.checkupDate ? new Date(currentRecord.checkupDate).toLocaleDateString() : 'N/A'}
                       </div>
                       <div style={{ fontSize: '0.85rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: stat.val ? '#dcfce7' : '#fee2e2', color: stat.val ? '#166534' : '#991b1b', border: `1px solid ${stat.val ? '#10b98130' : '#ef444430'}` }}>
                        {stat.val ? 'Attended' : 'Not Attended'}
                       </div>
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
            </>
          ) : (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
               className="glass-card" 
               style={{ padding: '4rem', textAlign: 'center', background: 'white', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}
             >
                <Activity size={60} style={{ opacity: 0.2, margin: '0 auto 1rem auto', color: 'var(--primary)' }} />
                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Health Records Found</h3>
                <p>Click "+ New Health Entry" to start monitoring this student's health profile.</p>
             </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default ChildProfile;
