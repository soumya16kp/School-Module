import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolService } from '../services/api';
import {
  ArrowLeft, Download, Edit, Save, Plus, Trash2,
  School, Heart, Users, CheckCircle2, Upload, FileText, TreePine
} from 'lucide-react';

type MedicalTeamMember = {
  doctorName: string;
  specialisation: string;
  organization: string;
  contactNumber: string;
};

type HealthCheckup = {
  conducted: boolean | null;
  studentsChecked: string;
  referrals: string;
};

type ReportData = {
  schoolName: string;
  udiseCode: string;
  district: string;
  state: string;
  schoolCategory: string;
  affiliationBoard: string;
  classRangeCovered: string[];
  healthCheckups: Record<string, HealthCheckup>;
  medicalTeam: MedicalTeamMember[];
  followUp: { parentsInformed: boolean; referralsIssued: boolean; healthCardsDistributed: boolean; treePlantingCompleted: boolean };
  attachments: { healthReportExcel: boolean; photos: boolean; referralSlips: boolean };
  declaration: { principalName: string; date: string };
};

const HEALTH_PARAMS = [
  { key: 'generalMedical', label: 'General Medical Check-up' },
  { key: 'eyeVision', label: 'Eye / Vision Screening' },
  { key: 'dental', label: 'Dental Check-up' },
  { key: 'bmi', label: 'BMI Assessment (Height/Weight)' },
  { key: 'menstrualWellness', label: 'Menstrual Wellness Session (Girls 10+)' },
  { key: 'firstAidKit', label: 'First-Aid Kit Availability on Campus' },
];

const CLASS_RANGES = ['Pre-KG', 'Primary', 'Upper Primary', 'Secondary', 'Sr. Secondary'];

const mapSchoolCategory = (type?: string) => {
  if (!type) return '';
  const t = type.toLowerCase();
  if (t === 'government') return 'Government';
  if (t === 'private' || t === 'international') return 'Private';
  if (t === 'aided') return 'Aided';
  if (t === 'unaided') return 'Unaided';
  return '';
};

const mapBoard = (board?: string) => {
  if (!board) return '';
  const b = board.toLowerCase();
  if (b.includes('cbse')) return 'CBSE';
  if (b.includes('icse')) return 'ICSE';
  if (b.includes('state')) return 'State';
  if (b.includes('ib')) return 'IB';
  return 'Other';
};

const emptyCheckups = (): Record<string, HealthCheckup> =>
  Object.fromEntries(HEALTH_PARAMS.map(p => [p.key, { conducted: null, studentsChecked: '', referrals: '' }]));

const UDISEReport: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(true);
  const [report, setReport] = useState<ReportData>({
    schoolName: '', udiseCode: '', district: '', state: '',
    schoolCategory: '', affiliationBoard: '', classRangeCovered: [],
    healthCheckups: emptyCheckups(),
    medicalTeam: [{ doctorName: '', specialisation: '', organization: '', contactNumber: '' }],
    followUp: { parentsInformed: false, referralsIssued: false, healthCardsDistributed: false, treePlantingCompleted: false },
    attachments: { healthReportExcel: false, photos: false, referralSlips: false },
    declaration: { principalName: '', date: '' },
  });

  useEffect(() => {
    schoolService.getMySchool().then((res: any) => {
      const s = res?.school || res;
      if (!s || typeof s !== 'object') return;
      setReport(prev => ({
        ...prev,
        schoolName: s.schoolName || prev.schoolName,
        udiseCode: s.udiseCode || prev.udiseCode,
        district: s.city || prev.district,
        state: s.state || prev.state,
        schoolCategory: mapSchoolCategory(s.schoolType) || prev.schoolCategory,
        affiliationBoard: mapBoard(s.boardAffiliation) || prev.affiliationBoard,
        medicalTeam: prev.medicalTeam.map((m, i) =>
          i === 0 ? { ...m, organization: m.organization || s.schoolName || '' } : m
        ),
        declaration: { ...prev.declaration, principalName: prev.declaration.principalName || s.principalName || '', date: prev.declaration.date || new Date().toISOString().split('T')[0] },
      }));
    }).catch(() => {});
  }, []);

  const setCheckup = (key: string, field: keyof HealthCheckup, value: any) =>
    setReport(prev => ({
      ...prev,
      healthCheckups: { ...prev.healthCheckups, [key]: { ...prev.healthCheckups[key], [field]: value } },
    }));

  const setMedical = (idx: number, field: keyof MedicalTeamMember, value: string) =>
    setReport(prev => ({
      ...prev,
      medicalTeam: prev.medicalTeam.map((m, i) => i === idx ? { ...m, [field]: value } : m),
    }));

  const addMedical = () =>
    setReport(prev => ({
      ...prev,
      medicalTeam: [...prev.medicalTeam, { doctorName: '', specialisation: '', organization: prev.medicalTeam[0]?.organization || '', contactNumber: '' }],
    }));

  const removeMedical = (idx: number) =>
    setReport(prev => ({ ...prev, medicalTeam: prev.medicalTeam.filter((_, i) => i !== idx) }));

  const toggleClassRange = (cls: string) =>
    setReport(prev => ({
      ...prev,
      classRangeCovered: prev.classRangeCovered.includes(cls)
        ? prev.classRangeCovered.filter(c => c !== cls)
        : [...prev.classRangeCovered, cls],
    }));

  const s: React.CSSProperties = {};

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header controls */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '10px', border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                <Save size={16} /> Save Report
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}
              >
                <Edit size={16} /> Edit Report
              </button>
            )}
            <button
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '10px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        {/* Report card */}
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>

          {/* Report header */}
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', padding: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <School size={28} />
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>WombTo18 School Medical Check-up Report</h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>UDISE+ Aligned Format</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', opacity: 0.75 }}>For submission and upload as supporting UDISE+ documentation</p>
          </div>

          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* Section 1: School Information */}
            <section>
              <SectionHeader icon={<School size={18} color="#7c3aed" />} title="School Information" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <Field label="School Name *" value={report.schoolName} disabled={!isEditing}
                  onChange={v => setReport(p => ({ ...p, schoolName: v }))} placeholder="Enter school name" />
                <Field label="UDISE Code (11-digit) *" value={report.udiseCode} disabled={!isEditing}
                  onChange={v => setReport(p => ({ ...p, udiseCode: v }))} placeholder="Enter 11-digit code" maxLength={11} />
                <Field label="District *" value={report.district} disabled={!isEditing}
                  onChange={v => setReport(p => ({ ...p, district: v }))} placeholder="Enter district" />
                <Field label="State *" value={report.state} disabled={!isEditing}
                  onChange={v => setReport(p => ({ ...p, state: v }))} placeholder="Enter state" />
                <div>
                  <label style={labelStyle}>School Category</label>
                  <select value={report.schoolCategory} disabled={!isEditing}
                    onChange={e => setReport(p => ({ ...p, schoolCategory: e.target.value }))}
                    style={inputStyle(isEditing)}>
                    <option value="">Select category</option>
                    {['Government', 'Private', 'Aided', 'Unaided'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Affiliation Board</label>
                  <select value={report.affiliationBoard} disabled={!isEditing}
                    onChange={e => setReport(p => ({ ...p, affiliationBoard: e.target.value }))}
                    style={inputStyle(isEditing)}>
                    <option value="">Select board</option>
                    {['CBSE', 'ICSE', 'State', 'IB', 'Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>Class Range Covered</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {CLASS_RANGES.map(cls => (
                    <label key={cls} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: isEditing ? 'pointer' : 'default', fontSize: '0.85rem', color: '#374151' }}>
                      <input type="checkbox" checked={report.classRangeCovered.includes(cls)}
                        onChange={() => isEditing && toggleClassRange(cls)} disabled={!isEditing} />
                      {cls}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 2: Health Check-up Summary */}
            <section>
              <SectionHeader icon={<Heart size={18} color="#dc2626" />} title="Health Check-up Summary" />
              <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={th}>Parameter</th>
                      <th style={{ ...th, textAlign: 'center' }}>Conducted?</th>
                      <th style={{ ...th, textAlign: 'center' }}>Students Checked</th>
                      <th style={{ ...th, textAlign: 'center' }}>Referrals Made</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HEALTH_PARAMS.map(({ key, label }) => {
                      const row = report.healthCheckups[key];
                      const isNA = key === 'firstAidKit';
                      return (
                        <tr key={key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ ...td, fontWeight: 500 }}>{label}</td>
                          <td style={{ ...td, textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                              {[true, false].map(val => (
                                <label key={String(val)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: isEditing ? 'pointer' : 'default', fontSize: '0.8rem' }}>
                                  <input type="radio" name={`${key}-conducted`} checked={row.conducted === val}
                                    onChange={() => isEditing && setCheckup(key, 'conducted', val)} disabled={!isEditing} />
                                  {val ? 'Yes' : 'No'}
                                </label>
                              ))}
                            </div>
                          </td>
                          <td style={td}>
                            <input type="number" value={row.studentsChecked} disabled={!isEditing || isNA}
                              onChange={e => setCheckup(key, 'studentsChecked', e.target.value)}
                              placeholder={isNA ? 'N/A' : '0'}
                              style={{ ...inputStyle(isEditing && !isNA), width: '80px', textAlign: 'center' }} />
                          </td>
                          <td style={td}>
                            <input type="number" value={row.referrals} disabled={!isEditing || isNA}
                              onChange={e => setCheckup(key, 'referrals', e.target.value)}
                              placeholder={isNA ? 'N/A' : '0'}
                              style={{ ...inputStyle(isEditing && !isNA), width: '80px', textAlign: 'center' }} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Medical Team */}
            <section>
              <SectionHeader icon={<Users size={18} color="#2563eb" />} title="Medical Team Details" />
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>All medical teams are supported by WombTo18.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {report.medicalTeam.map((m, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>Team Member {idx + 1}</span>
                      {isEditing && report.medicalTeam.length > 1 && (
                        <button onClick={() => removeMedical(idx)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff1f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <Field label="Doctor Name" value={m.doctorName} disabled={!isEditing}
                        onChange={v => setMedical(idx, 'doctorName', v)} placeholder="Enter doctor name" />
                      <Field label="Specialisation" value={m.specialisation} disabled={!isEditing}
                        onChange={v => setMedical(idx, 'specialisation', v)} placeholder="e.g. Pediatrics" />
                      <Field label="Organization" value={m.organization} disabled={!isEditing}
                        onChange={v => setMedical(idx, 'organization', v)} placeholder="Enter organization" />
                      <Field label="Contact Number" value={m.contactNumber} disabled={!isEditing}
                        onChange={v => setMedical(idx, 'contactNumber', v)} placeholder="Enter contact" />
                    </div>
                  </div>
                ))}
              </div>
              {isEditing && (
                <button onClick={addMedical}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                  <Plus size={16} /> Add Medical Team Member
                </button>
              )}
            </section>

            {/* Section 4: Follow-up */}
            <section>
              <SectionHeader icon={<CheckCircle2 size={18} color="#16a34a" />} title="Follow-Up & Support" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                {[
                  { key: 'parentsInformed', label: 'Parents were informed of findings' },
                  { key: 'referralsIssued', label: 'Referrals to hospital/clinic issued where needed' },
                  { key: 'healthCardsDistributed', label: 'Health cards were distributed / uploaded to dashboard' },
                  { key: 'treePlantingCompleted', label: 'Tree planting as part of Green Cohort was completed' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1rem', background: '#f0fdf4', borderRadius: '10px', cursor: isEditing ? 'pointer' : 'default', fontSize: '0.85rem', color: '#374151' }}>
                    <input type="checkbox"
                      checked={report.followUp[key as keyof typeof report.followUp]}
                      onChange={() => isEditing && setReport(p => ({ ...p, followUp: { ...p.followUp, [key]: !p.followUp[key as keyof typeof p.followUp] } }))}
                      disabled={!isEditing} />
                    {key === 'treePlantingCompleted' && <TreePine size={14} color="#16a34a" />}
                    {label}
                  </label>
                ))}
              </div>
            </section>

            {/* Section 5: Attachments */}
            <section>
              <SectionHeader icon={<Upload size={18} color="#4f46e5" />} title="Attachments (Optional)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                {[
                  { key: 'healthReportExcel', label: 'Student Health Report (Excel/PDF)' },
                  { key: 'photos', label: 'Photos of Check-up Camp' },
                  { key: 'referralSlips', label: 'Referral Slips / Letters' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1rem', background: '#eef2ff', borderRadius: '10px', cursor: isEditing ? 'pointer' : 'default', fontSize: '0.85rem', color: '#374151' }}>
                    <input type="checkbox"
                      checked={report.attachments[key as keyof typeof report.attachments]}
                      onChange={() => isEditing && setReport(p => ({ ...p, attachments: { ...p.attachments, [key]: !p.attachments[key as keyof typeof p.attachments] } }))}
                      disabled={!isEditing} />
                    {label}
                  </label>
                ))}
              </div>
            </section>

            {/* Section 6: Declaration */}
            <section>
              <SectionHeader icon={<FileText size={18} color="#7c3aed" />} title="Declaration" />
              <div style={{ background: '#faf5ff', borderLeft: '4px solid #7c3aed', borderRadius: '0 12px 12px 0', padding: '1.25rem', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '1rem' }}>
                  We certify that the above details are true to the best of our knowledge. This medical check-up was conducted
                  as part of the <strong>WombTo18 School Wellness Program</strong>, aligned with <strong>NEP 2020</strong>,{' '}
                  <strong>SDG 3</strong>, and <strong>UDISE+ requirements</strong>.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Field label="Principal Name & Signature *" value={report.declaration.principalName} disabled={!isEditing}
                    onChange={v => setReport(p => ({ ...p, declaration: { ...p.declaration, principalName: v } }))}
                    placeholder="Enter principal name" />
                  <div>
                    <label style={labelStyle}>Date *</label>
                    <input type="date" value={report.declaration.date} disabled={!isEditing}
                      onChange={e => setReport(p => ({ ...p, declaration: { ...p.declaration, date: e.target.value } }))}
                      style={inputStyle(isEditing)} />
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label style={labelStyle}>School Stamp</label>
                  <div style={{ border: '2px dashed #c4b5fd', borderRadius: '10px', padding: '2.5rem', textAlign: 'center', marginTop: '0.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                    Space for School Stamp
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="no-print" style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.8rem' }}>
          <p>WombTo18 — Health &amp; Emergency Preparedness Promoting School Program</p>
          <p>Supporting UDISE+, NEP 2020, and SDG 3 Goals</p>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600,
  color: '#6b7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em',
};

const inputStyle = (editable: boolean): React.CSSProperties => ({
  width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px',
  border: '1px solid #e2e8f0', background: editable ? 'white' : '#f8fafc',
  fontSize: '0.875rem', color: '#111827', boxSizing: 'border-box',
  outline: 'none', cursor: editable ? 'text' : 'default',
});

const th: React.CSSProperties = {
  padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700,
  fontSize: '0.78rem', color: '#374151', border: '1px solid #e2e8f0',
};

const td: React.CSSProperties = {
  padding: '0.65rem 1rem', border: '1px solid #f1f5f9',
};

const Field = ({ label, value, onChange, disabled, placeholder, maxLength }: {
  label: string; value: string; onChange: (v: string) => void;
  disabled: boolean; placeholder?: string; maxLength?: number;
}) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      placeholder={placeholder} maxLength={maxLength} style={inputStyle(!disabled)} />
  </div>
);

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.6rem' }}>
    {icon}
    <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>{title}</h2>
  </div>
);

export default UDISEReport;
