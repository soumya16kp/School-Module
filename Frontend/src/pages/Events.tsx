import React, { useState, useEffect } from 'react';
import { eventService, schoolService, ambassadorService, eventRequestService, childService, healthService } from '../services/api';
import { useSchoolData } from '../context/SchoolDataContext';
import { 
  XCircle, Info, LayoutList, Calendar as CalendarIconUI, 
  ShieldCheck, Search, Users, Lock, CheckCircle, ClipboardCheck, 
  Trash2, Image as ImageIcon, HeartPulse, Brain, Salad, 
  Flame, Plus, Syringe, Sparkles, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarView from '../components/CalendarView';
import Carousel from '../components/Carousel';

const PREDEFINED_PROGRAMS = [
  { type: 'GENERAL_CHECKUP', title: 'Annual Health Check-up', description: 'Comprehensive health screening for all students.' },
  { type: 'MENTAL_WELLNESS', title: 'Mental Wellness Session', description: 'Interactive workshop on emotional health and resilience.' },
  { type: 'NUTRITION_SESSION', title: 'Nutrition & Dietetics', description: 'Guidance on healthy eating habits and balanced diet.' },
  { type: 'FIRE_DRILL', title: 'Fire Safety Drill', description: 'Emergency evacuation practice and fire safety training.' },
  { type: 'CPR_FIRST_AID_TRAINING', title: 'CPR & First Aid Training', description: 'Life-saving techniques and emergency response skills for students.' },
  { type: 'HYGIENE_WELLNESS', title: 'Hygiene & Wellness', description: 'Promoting personal cleanliness and healthy daily habits.' },
  { type: 'IMMUNIZATION_DEWORMING', title: 'Immunization & Deworming', description: 'Comprehensive vaccination and parasite prevention outreach.' }
];

const getProgramIcon = (type: string) => {
  switch (type) {
    case 'GENERAL_CHECKUP': return <HeartPulse size={20} />;
    case 'MENTAL_WELLNESS': return <Brain size={20} />;
    case 'NUTRITION_SESSION': return <Salad size={20} />;
    case 'FIRE_DRILL': return <Flame size={20} />;
    case 'CPR_FIRST_AID_TRAINING': return <ShieldCheck size={20} />;
    case 'HYGIENE_WELLNESS': return <Sparkles size={20} />;
    case 'IMMUNIZATION_DEWORMING': return <Syringe size={20} />;
    default: return <CalendarIconUI size={20} />;
  }
};

const Events: React.FC = () => {
  const { 
    events, 
    school, 
    loading,
    refreshEvents,
    refreshAll 
  } = useSchoolData();

  const [academicYear] = useState('2024-2025');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showScheduleModal, setShowScheduleModal] = useState<any>(null);
  const [selectedAmbassadorId, setSelectedAmbassadorId] = useState('');
  const [personName, setPersonName] = useState('');
  const [personContact, setPersonContact] = useState('');
  const [personDetails, setPersonDetails] = useState('');
  const [ambassadors, setAmbassadors] = useState<any[]>([]);

  // Attendance states
  const [attendanceModalEvent, setAttendanceModalEvent] = useState<any>(null);
  const [attSearch, setAttSearch] = useState('');
  const [attFilterClass, setAttFilterClass] = useState('');
  const [studentStatuses, setStudentStatuses] = useState<Record<string, any>>({});
  const [attendanceForm, setAttendanceForm] = useState({ notes: '' });

  const [uploadingForEvent, setUploadingForEvent] = useState<number | null>(null);
  const [listSearch, setListSearch] = useState('');
  const [listFilter, setListFilter] = useState<'all' | 'upcoming' | 'ready' | 'finalized'>('all');
  const [expandedEvents, setExpandedEvents] = useState<Record<number, boolean>>({});
  const [children, setChildren] = useState<any[]>([]);
  const [qrLink, setQrLink] = useState<string | null>((school as any)?.parentRegistrationToken ? `${window.location.origin}/join/${(school as any).parentRegistrationToken}` : null);
  const [generatingQR, setGeneratingQR] = useState(false);

  const userStr = localStorage.getItem('school_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isManagement = user?.role === 'SCHOOL_ADMIN' || user?.role === 'PRINCIPAL';

  useEffect(() => {
    ambassadorService.getAll().then(setAmbassadors);
    childService.getAll().then((data: any[]) => setChildren(data || []));
  }, []);

  const totalCollected = school?.donations?.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0) || 0;
  const creditGoal = school?.annualCreditGoal || 50000;
  const isQRMode = (school as any)?.registrationMode === 'QR_LINK';
  const isUnlocked = isQRMode || totalCollected >= creditGoal;

  const handleAssignProgram = async (prog: any, scheduledAt: string) => {
    try {
      const evt = await eventService.create({
        type: prog.type,
        title: prog.title,
        description: prog.description,
        academicYear,
        scheduledAt: new Date(scheduledAt).toISOString(),
        ambassadorId: selectedAmbassadorId ? parseInt(selectedAmbassadorId) : undefined
      });

      // Create a companion request for WOMBTO18
      await eventRequestService.create({
        eventId: evt.id,
        schoolId: school!.id,
        personName,
        personContact,
        personDetails
      });

      setShowScheduleModal(null);
      setSelectedAmbassadorId('');
      setPersonName('');
      setPersonContact('');
      setPersonDetails('');
      refreshEvents(academicYear);
    } catch (error) {
      console.error(error);
      alert('Error scheduling program and creating request');
    }
  };

  const [paying, setPaying] = useState(false);
  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayGap = async () => {
    if (!school) return;
    const gap = Math.max(0, creditGoal - totalCollected);
    if (gap <= 0) return;

    setPaying(true);
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load");
      setPaying(false);
      return;
    }

    try {
      const order = await schoolService.createOrder(gap);
      const options = {
        key: order.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: "EduCentral",
        description: "School Program Unlock",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await schoolService.recordUnlockPayment(gap, response.razorpay_payment_id, response.razorpay_order_id);
          } catch (err) {
            console.error('Failed to record unlock payment:', err);
          }
          refreshAll(academicYear);
          setPaying(false);
        },
        prefill: {
          name: school.principalName,
          email: school.schoolEmail,
          contact: school.principalContact
        },
        theme: { color: "#db2777" },
        modal: { ondismiss: () => setPaying(false) }
      };
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment');
      setPaying(false);
    }
  };

  const handleGenerateQR = async () => {
    setGeneratingQR(true);
    try {
      const res = await schoolService.generateRegistrationLink();
      setQrLink(res.url);
      refreshAll(academicYear);
    } catch (err) {
      console.error(err);
      alert('Failed to generate registration link');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleMarkComplete = async (ev: any) => {
    if (!confirm(`Mark "${ev.title}" as complete?`)) return;
    try {
      await eventService.update(ev.id, { completedAt: new Date().toISOString() });
      refreshEvents(academicYear);
    } catch (error) {
      alert('Error marking complete');
    }
  };

  const handleImageUpload = async (eventId: number, file: File) => {
    setUploadingForEvent(eventId);
    try {
      const { url } = await schoolService.uploadImage(file);
      const ev = events.find(e => e.id === eventId);
      const currentImages = Array.isArray(ev?.images) ? ev.images : [];
      await eventService.update(eventId, { images: [...currentImages, url] });
      refreshEvents(academicYear);
    } catch (error) {
       alert('Error uploading image');
    } finally {
      setUploadingForEvent(null);
    }
  };

  const openAttendanceModal = (ev: any) => {
    setAttendanceModalEvent(ev);
    const existing = ev.attendanceJson?.studentStatuses || {};
    setStudentStatuses(existing); 
    setAttendanceForm({ notes: ev.attendanceJson?.notes || '' });
  };

  const updateStudentDetail = (childId: number, field: string, value: any) => {
    setStudentStatuses(prev => {
      const current = typeof prev[childId] === 'object' ? prev[childId] : { status: prev[childId] ?? 'Present' };
      return { ...prev, [childId]: { ...current, [field]: value } };
    });
  };

  const toggleStudentStatus = (childId: number) => {
    setStudentStatuses(prev => {
      const current = typeof prev[childId] === 'object' ? prev[childId] : { status: prev[childId] ?? 'Present' };
      const newStatus = current.status === 'Present' ? 'Absent' : 'Present';
      return { ...prev, [childId]: { ...current, status: newStatus } };
    });
  };

  const handleAttendanceSubmit = async () => {
    if (!attendanceModalEvent) return;
    
    const studentEntries = Object.values(studentStatuses);
    const presentCount = studentEntries.filter((s: any) => (typeof s === 'string' ? s !== 'Absent' : s.status !== 'Absent')).length;

    try {
      // 1. Update the event attendance
      await eventService.update(attendanceModalEvent.id, {
        completedAt: new Date().toISOString(),
        attendanceJson: {
          totalPresent: presentCount,
          totalExpected: filteredChildren.length,
          notes: attendanceForm.notes,
          studentStatuses
        }
      });

      // 2. Sync with HealthRecords if it's a primary screening
      const academicYear = attendanceModalEvent.academicYear || '2024-2025';
      const isBmiEvent = attendanceModalEvent.type === 'BMI_ASSESSMENT';
      const isEyeEvent = attendanceModalEvent.type === 'VISION_SCREENING';
      const isDentalEvent = attendanceModalEvent.type === 'DENTAL_SCREENING';
      const isGeneral = attendanceModalEvent.type === 'GENERAL_CHECKUP';

      if (isBmiEvent || isEyeEvent || isDentalEvent || isGeneral) {
        for (const child of filteredChildren) {
          const detail: any = typeof studentStatuses[child.id] === 'object' 
            ? studentStatuses[child.id] 
            : { status: studentStatuses[child.id] || 'Present' };

          const healthPayload: any = {
            academicYear,
            checkupDate: new Date().toISOString(),
          };

          if (isBmiEvent) {
            healthPayload.bmiStatus = detail.status;
            if (detail.status === 'Present') {
              healthPayload.height = detail.height ?? '';
              healthPayload.weight = detail.weight ?? '';
            }
          }
          if (isEyeEvent) {
            healthPayload.eyeStatus = detail.status;
            if (detail.status === 'Present') {
              healthPayload.eyeCheckup = detail.status === 'Present' ? 'Done' : 'Pending';
              healthPayload.eyeVisionLeft = detail.eyeVisionLeft ?? '6/6';
              healthPayload.eyeVisionRight = detail.eyeVisionRight ?? '6/6';
            }
          }
          if (isDentalEvent) {
            healthPayload.dentalStatus = detail.status;
            if (detail.status === 'Present') {
              healthPayload.dentalCheckup = detail.status === 'Present' ? 'Done' : 'Pending';
              healthPayload.dentalCariesIndex = detail.dentalCariesIndex ?? 0;
              healthPayload.dentalOverallHealth = detail.dentalOverallHealth ?? 'Healthy';
            }
          }
          
          try {
             const existingRecords = await healthService.getRecords(child.id);
             const thisYear = existingRecords.find((r: any) => r.academicYear === academicYear);
             if (thisYear) {
               await healthService.updateRecord(child.id, thisYear.id, healthPayload);
             } else {
               await healthService.addRecord(child.id, healthPayload);
             }
          } catch (e) { console.error(`Failed to sync health for child ${child.id}`, e); }
        }
      }

      setAttendanceModalEvent(null);
      refreshEvents(attendanceModalEvent.academicYear || '2024-2025');
    } catch (error) {
      alert('Error saving attendance and health records');
    }
  };

  const toggleEventExpansion = (id: number) => {
    setExpandedEvents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(listSearch.toLowerCase()) || 
                          ev.type.toLowerCase().includes(listSearch.toLowerCase());
    
    let matchesStatus = true;
    if (listFilter === 'upcoming') matchesStatus = !ev.completedAt;
    else if (listFilter === 'ready') matchesStatus = !!ev.completedAt && !ev.loggingCompletedAt;
    else if (listFilter === 'finalized') matchesStatus = !!ev.loggingCompletedAt;

    return matchesSearch && matchesStatus;
  });

  const handleFinalizeLogging = async (ev: any) => {
    if (!confirm('This will finalize all attendance, metrics and lock further changes. Proceed?')) return;
    try {
      await eventService.update(ev.id, { loggingCompletedAt: new Date().toISOString() });
      refreshEvents(academicYear);
    } catch (error) {
      alert('Error finalizing logs');
    }
  };

  const uniqueClasses = Array.from(new Set(children.map((c: any) => c.class).filter((v: any) => v !== undefined && v !== null))).sort() as any[];

  const filteredChildren = children.filter((child: any) => {
    const matchesSearch = child.name.toLowerCase().includes(attSearch.toLowerCase()) || 
                          child.registrationNo.toLowerCase().includes(attSearch.toLowerCase());
    const matchesClass = !attFilterClass || String(child.class) === attFilterClass;
    return matchesSearch && matchesClass;
  });

  if (loading) return <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div className="page-container">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.2; }
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Annual Programs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Plan and manage your institution's health & safety calendar for {academicYear}.</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ 
            background: isUnlocked ? '#f0fdf4' : '#fff7ed', 
            padding: '12px 24px', 
            borderRadius: '20px', 
            border: `1px solid ${isUnlocked ? '#dcfce7' : '#ffedd5'}`,
            width: '320px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '0.7rem', color: isUnlocked ? '#166534' : '#9a3412', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Annual Credit Pool
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isUnlocked ? '#15803d' : '#c2410c' }}>
                {Math.round((totalCollected / creditGoal) * 100)}%
              </div>
            </div>
            <div style={{ width: '100%', height: '8px', background: isUnlocked ? '#dcfce7' : '#ffedd5', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalCollected / creditGoal) * 100)}%` }}
                style={{ height: '100%', background: isUnlocked ? '#22c55e' : 'linear-gradient(90deg, #f97316, #ea580c)', borderRadius: '10px' }}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: isUnlocked ? '#166534' : '#9a3412', fontWeight: 600, textAlign: 'center' }}>
              ₹{totalCollected.toLocaleString()} / ₹{creditGoal.toLocaleString()}
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '6px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            display: 'flex', 
            gap: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <button 
              onClick={() => setViewMode('list')}
              style={{ 
                padding: '10px 24px', 
                borderRadius: '12px', 
                border: 'none', 
                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <LayoutList size={18} /> List View
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              style={{ 
                padding: '10px 24px', 
                borderRadius: '12px', 
                border: 'none', 
                background: viewMode === 'calendar' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'calendar' ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <CalendarIconUI size={18} /> Calendar
            </button>
          </div>
        </div>
      </div>

      {isUnlocked ? (
        <>
          {viewMode === 'calendar' ? (
            <CalendarView 
              events={events} 
              onEventClick={(ev: any) => {
                if (ev.loggingCompletedAt) {
                  alert(`Logging for "${ev.title}" is already finalized.`);
                  return;
                }
                openAttendanceModal(ev);
              }} 
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {PREDEFINED_PROGRAMS.map(prog => {
                  const alreadyAssigned = events.some(e => e.type === prog.type);
                  return (
                    <motion.div 
                      key={prog.type} 
                      whileHover={alreadyAssigned ? {} : { y: -5 }}
                      className="glass-card" 
                      style={{ 
                        padding: '1.5rem', 
                        background: 'white', 
                        border: alreadyAssigned ? '1px solid #f1f5f9' : '1px solid #e2e8f0', 
                        opacity: alreadyAssigned ? 0.6 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: alreadyAssigned ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                       <div style={{ 
                         width: '48px', 
                         height: '48px', 
                         borderRadius: '14px', 
                         background: 'var(--primary-light)', 
                         color: 'var(--primary)', 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         marginBottom: '1.25rem'
                       }}>
                         {getProgramIcon(prog.type)}
                       </div>
                       <h4 style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: 700 }}>{prog.title}</h4>
                       <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', minHeight: '44px', lineHeight: 1.6 }}>{prog.description}</p>
                       <button 
                        onClick={() => setShowScheduleModal(prog)}
                        disabled={alreadyAssigned}
                        className={`btn ${alreadyAssigned ? 'btn-outline' : 'btn-primary'}`}
                        style={{ width: '100%', fontSize: '0.95rem', marginTop: 'auto', padding: '14px', borderRadius: '14px' }}
                       >
                         {alreadyAssigned ? 'Already Assigned' : (
                           <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                             <Plus size={18} /> Schedule Session
                           </span>
                         )}
                       </button>
                    </motion.div>
                  );
                })}
              </div>

              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Scheduled Programs</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>{filteredEvents.length} programs matching your filters</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '650px', justifyContent: 'flex-end' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Search by title or type..." 
                        value={listSearch}
                        onChange={(e) => setListSearch(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                      />
                    </div>
                    <select 
                      value={listFilter} 
                      onChange={(e: any) => setListFilter(e.target.value)}
                      style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                      <option value="all">All Status</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ready">Ready to Log</option>
                      <option value="finalized">Finalized</option>
                    </select>
                  </div>
                </div>

                {filteredEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                    <CalendarIconUI size={56} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>No programs found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Try adjusting your search query or status filter.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {filteredEvents.map((ev) => {
                      const isExpanded = expandedEvents[ev.id];
                      return (
                        <motion.div 
                          key={ev.id} 
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-card" 
                          style={{ 
                            background: 'white', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            position: 'relative',
                            border: '1px solid #e2e8f0',
                            borderRadius: '28px',
                            boxShadow: '0 4px 25px -5px rgba(0,0,0,0.04)',
                            overflow: 'hidden'
                          }}
                        >
                          <div 
                            onClick={() => toggleEventExpansion(ev.id)}
                            style={{ padding: '1.75rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                              <div style={{ 
                                width: '64px', 
                                height: '64px', 
                                borderRadius: '18px', 
                                background: ev.completedAt ? '#f0fdf4' : '#f8fafc', 
                                color: ev.completedAt ? '#16a34a' : 'var(--text-muted)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                border: '1px solid #f1f5f9',
                                flexShrink: 0
                              }}>
                                {getProgramIcon(ev.type)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  {ev.title}
                                  {ev.completedAt && (
                                    <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontWeight: 800, textTransform: 'uppercase' }}>
                                      {ev.loggingCompletedAt ? 'Finalized' : 'Completed'}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '8px' }}>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CalendarIconUI size={16} color="var(--primary)" />
                                    {new Date(ev.scheduledAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                  </div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={16} color="var(--primary)" />
                                    {new Date(ev.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  {ev.ambassador && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                                      <Users size={16} /> {ev.ambassador.name}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); if(confirm('Delete this event?')) { eventService.delete(ev.id).then(() => refreshEvents(academicYear)); } }} 
                                style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              >
                                <Trash2 size={20} />
                              </button>
                              <div style={{ color: 'var(--text-muted)', background: '#f8fafc', padding: '10px', borderRadius: '12px' }}>
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{ padding: '0 1.75rem 2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '1.5rem',
                                    background: '#f8fafc',
                                    borderRadius: '24px',
                                    border: '1px solid #f1f5f9'
                                  }}>
                                    <div style={{ display: 'flex', gap: '3rem' }}>
                                      {ev.completedAt && ev.attendanceJson?.totalPresent !== undefined ? (
                                        <div style={{ display: 'flex', gap: '3rem' }}>
                                          <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '4px' }}>Participation</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                              <Users size={20} color="var(--primary)" /> {ev.attendanceJson.totalPresent} / {ev.attendanceJson.totalExpected || '-'}
                                            </div>
                                          </div>
                                          <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '4px' }}>Coverage</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                                              {ev.attendanceJson.totalExpected ? Math.round((ev.attendanceJson.totalPresent / ev.attendanceJson.totalExpected) * 100) : 0}%
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '4px' }}>Session Status</div>
                                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: ev.completedAt ? '#10b981' : '#f59e0b' }} />
                                            {ev.completedAt ? 'Logging Active' : 'Upcoming Session'}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                      {!ev.completedAt ? (
                                        <button 
                                          onClick={() => handleMarkComplete(ev)} 
                                          className="btn btn-primary" 
                                          style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, padding: '14px 28px', borderRadius: '16px' }}
                                        >
                                          <CheckCircle size={20} /> Complete Session
                                        </button>
                                      ) : (
                                        <>
                                          {!ev.loggingCompletedAt ? (
                                            <>
                                              <button 
                                                onClick={() => openAttendanceModal(ev)} 
                                                className="btn btn-outline"
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, background: 'white', padding: '14px 28px', borderRadius: '16px' }}
                                              >
                                                <ClipboardCheck size={20} /> Attendence Log
                                              </button>
                                              <button 
                                                onClick={() => handleFinalizeLogging(ev)} 
                                                className="btn btn-primary" 
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, padding: '14px 28px', borderRadius: '16px' }}
                                              >
                                                <ShieldCheck size={20} /> Finalize Records
                                              </button>
                                            </>
                                          ) : (
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '14px 32px', borderRadius: '18px', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                              <CheckCircle size={24} /> Records Vaulted
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {(() => {
                                    const imgs = typeof ev.images === 'string' ? JSON.parse(ev.images) : ev.images;
                                    if (Array.isArray(imgs) && imgs.length > 0) {
                                      return (
                                        <div style={{ width: '100%', borderRadius: '24px', overflow: 'hidden', marginTop: '1.5rem', marginBottom: '1rem' }}>
                                          <Carousel images={imgs} height="400px" borderRadius="24px" />
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}

                                  {isManagement && ev.completedAt && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                      <label 
                                        style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '24px', padding: '2rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', color: 'var(--primary)', width: '100%', justifyContent: 'center', transition: 'all 0.2s' }}
                                      >
                                        {uploadingForEvent === ev.id ? (
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div className="animate-spin" style={{ width: '22px', height: '22px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                            Uploading Highlights...
                                          </span>
                                        ) : (
                                          <>
                                            <ImageIcon size={24} />
                                            {Array.isArray(ev.images) && ev.images.length > 0 ? 'Add More Highlights' : 'Upload Session Highlights'}
                                          </>
                                        )}
                                        <input 
                                          type="file" 
                                          hidden 
                                          accept="image/*" 
                                          disabled={uploadingForEvent === ev.id}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(ev.id, file);
                                          }} 
                                        />
                                      </label>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '4rem 2rem', background: 'white', borderRadius: '40px', border: '1px solid #e2e8f0' }}
        >
          {/* Lock header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2rem auto' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--primary-light)', borderRadius: '50%', opacity: 0.2 }} />
              <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--primary-light)' }}>
                <ShieldCheck size={48} color="var(--primary)" />
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#ef4444', color: 'white', borderRadius: '50%', padding: '7px', border: '3px solid white' }}>
                <Lock size={16} />
              </div>
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Activate Health Programs</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7, fontSize: '1.05rem' }}>
              Choose how your school would like to unlock the annual health calendar.
            </p>
          </div>

          {/* Two options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>

            {/* Option 1 — Direct Payment */}
            <div style={{ padding: '2.5rem', borderRadius: '28px', border: '2px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={26} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e293b', marginBottom: '6px' }}>Direct Payment</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  School pays the full annual program fee of <strong>₹{creditGoal.toLocaleString()}</strong> in one go. Events unlock immediately after payment.
                </p>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <div style={{ marginBottom: '12px', fontSize: '0.82rem', color: '#94a3b8', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Info size={13} /> ₹{totalCollected.toLocaleString()} of ₹{creditGoal.toLocaleString()} collected
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (totalCollected / creditGoal) * 100)}%`, background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: '10px' }} />
                </div>
                <button
                  onClick={handlePayGap}
                  disabled={paying}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '14px', fontWeight: 700 }}
                >
                  {paying ? 'Processing...' : `Pay ₹${(creditGoal - totalCollected).toLocaleString()}`}
                </button>
              </div>
            </div>

            {/* Option 2 — QR / Link */}
            <div style={{ padding: '2.5rem', borderRadius: '28px', border: '2px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={26} color="#16a34a" />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e293b', marginBottom: '6px' }}>Parent Self-Registration</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Generate a QR code &amp; shareable link. Parents register individually — no annual pool payment required. Events unlock immediately.
                </p>
              </div>
              <div style={{ marginTop: 'auto' }}>
                {qrLink ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', fontSize: '0.78rem', color: '#166534', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {qrLink}
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(qrLink); alert('Link copied!'); }}
                      className="btn"
                      style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '14px', fontWeight: 700, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
                    >
                      Copy Link
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateQR}
                    disabled={generatingQR}
                    className="btn"
                    style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '14px', fontWeight: 700, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
                  >
                    {generatingQR ? 'Generating...' : 'Generate QR & Link'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showScheduleModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass-card" style={{ background: 'white', width: '100%', maxWidth: '450px', padding: '2.5rem', borderRadius: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Schedule Program</h3>
                <button onClick={() => setShowScheduleModal(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '12px' }}>
                  <XCircle size={24} color="var(--text-muted)" />
                </button>
              </div>
              <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { 
                e.preventDefault(); 
                const form = e.currentTarget;
                const scheduledAt = (form.elements.namedItem('scheduledAt') as HTMLInputElement).value;
                handleAssignProgram(showScheduleModal, scheduledAt); 
              }}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Date & Time</label>
                  <input name="scheduledAt" type="datetime-local" required className="form-control" style={{ borderRadius: '12px', padding: '12px', height: 'auto' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Recommend Official / Person (Optional)</label>
                  <input 
                    placeholder="Name of professional"
                    className="form-control" 
                    style={{ borderRadius: '12px', padding: '12px', height: 'auto', marginBottom: '8px' }}
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input 
                      placeholder="Contact No"
                      className="form-control" 
                      style={{ borderRadius: '12px', padding: '12px', height: 'auto' }}
                      value={personContact}
                      onChange={(e) => setPersonContact(e.target.value)}
                    />
                    <input 
                      placeholder="Details/Reg No"
                      className="form-control" 
                      style={{ borderRadius: '12px', padding: '12px', height: 'auto' }}
                      value={personDetails}
                      onChange={(e) => setPersonDetails(e.target.value)}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                    * This person will be reviewed by WOMBTO18 officials for approval.
                  </p>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Or Select from Global Ambassadors</label>
                  <select 
                    value={selectedAmbassadorId} 
                    onChange={(e) => setSelectedAmbassadorId(e.target.value)}
                    className="form-control"
                    style={{ borderRadius: '12px', padding: '12px', height: 'auto' }}
                  >
                    <option value="">No Ambassador Assigned</option>
                    {ambassadors.map(a => (
                      <option key={a.id} value={String(a.id)}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 800 }}>Schedule & Request Approval</button>
              </form>
            </motion.div>
          </div>
        )}

        {attendanceModalEvent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="glass-card" style={{ background: 'white', width: '100%', maxWidth: '700px', padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '32px', overflow: 'hidden' }}>
              <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Log Attendance</h3>
                <button onClick={() => setAttendanceModalEvent(null)} style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '10px', borderRadius: '14px' }}>
                  <XCircle size={26} color="var(--text-muted)" />
                </button>
              </div>

              <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Filter Students..." 
                  value={attSearch}
                  onChange={(e) => setAttSearch(e.target.value)}
                  style={{ flex: 1, minWidth: '200px', padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}
                />
                <select value={attFilterClass} onChange={(e) => setAttFilterClass(e.target.value)} style={{ padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <option value="">Classes</option>
                  {uniqueClasses.map(c => <option key={c} value={String(c)}>Class {c}</option>)}
                </select>
              </div>

              <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {filteredChildren.map((child: any) => {
                    const detail = studentStatuses[child.id] as any || { status: 'Present' };
                    const isAbsent = (typeof detail === 'string' ? detail === 'Absent' : detail.status === 'Absent');
                    const evType = attendanceModalEvent.type;

                    return (
                      <div 
                        key={child.id}
                        className="glass-card"
                        style={{ padding: '1.25rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem', background: isAbsent ? '#fffafb' : 'white', transition: 'all 0.2s' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{child.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cls {child.class}-{child.section} | {child.registrationNo}</div>
                          </div>
                          <button 
                            onClick={() => toggleStudentStatus(child.id)}
                            style={{ padding: '6px 16px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, background: isAbsent ? '#ef4444' : '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}
                          >
                            {isAbsent ? 'ABSENT' : 'PRESENT'}
                          </button>
                        </div>

                        {!isAbsent && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '16px' }}>
                             {evType === 'BMI_ASSESSMENT' && (
                               <>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                   <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Height (cm)</label>
                                   <input type="number" value={detail.height || ''} onChange={e => updateStudentDetail(child.id, 'height', e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }} />
                                 </div>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                   <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Weight (kg)</label>
                                   <input type="number" value={detail.weight || ''} onChange={e => updateStudentDetail(child.id, 'weight', e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }} />
                                 </div>
                               </>
                             )}
                             {evType === 'DENTAL_SCREENING' && (
                               <>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                   <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Cavities</label>
                                   <input type="number" value={detail.dentalCariesIndex || ''} onChange={e => updateStudentDetail(child.id, 'dentalCariesIndex', e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }} />
                                 </div>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                   <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Health</label>
                                   <select value={detail.dentalOverallHealth || 'Healthy'} onChange={e => updateStudentDetail(child.id, 'dentalOverallHealth', e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.8rem' }}>
                                      <option>Healthy</option><option>Good</option><option>Fair</option><option>Poor</option>
                                   </select>
                                 </div>
                               </>
                             )}
                             {evType === 'VISION_SCREENING' && (
                               <>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                   <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Left Eye</label>
                                   <input type="text" value={detail.eyeVisionLeft || '6/6'} onChange={e => updateStudentDetail(child.id, 'eyeVisionLeft', e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }} />
                                 </div>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                   <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Right Eye</label>
                                   <input type="text" value={detail.eyeVisionRight || '6/6'} onChange={e => updateStudentDetail(child.id, 'eyeVisionRight', e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }} />
                                 </div>
                               </>
                             )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: '2rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <textarea 
                  value={attendanceForm.notes} 
                  onChange={(e) => setAttendanceForm({ notes: e.target.value })} 
                  style={{ width: '100%', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1rem', marginBottom: '1.5rem', resize: 'none' }}
                  placeholder="Session notes..."
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleAttendanceSubmit} className="btn btn-primary" style={{ flex: 1, height: '54px', borderRadius: '16px', fontWeight: 800 }}>Save Records</button>
                  <button onClick={() => setAttendanceModalEvent(null)} className="btn btn-outline" style={{ background: 'white', borderRadius: '16px' }}>Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
