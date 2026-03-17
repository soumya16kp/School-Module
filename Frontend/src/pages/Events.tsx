import React, { useState, useEffect } from 'react';
import { eventService, schoolService, ambassadorService } from '../services/api';
import { XCircle, CheckCircle2, Info, LayoutList, Calendar as CalendarIconUI, ShieldCheck, Search, Users, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarView from '../components/CalendarView';

const PREDEFINED_PROGRAMS = [
  { type: 'GENERAL_CHECKUP', title: 'Annual Health Check-up', description: 'Comprehensive health screening for all students.' },
  { type: 'MENTAL_WELLNESS', title: 'Mental Wellness Session', description: 'Interactive workshop on emotional health and resilience.' },
  { type: 'NUTRITION_SESSION', title: 'Nutrition & Dietetics', description: 'Guidance on healthy eating habits and balanced diet.' },
  { type: 'FIRE_DRILL', title: 'Fire Safety Drill', description: 'Emergency evacuation practice and fire safety training.' }
];

const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [school, setSchool] = useState<any>(null);
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYear] = useState('2024-2025');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showScheduleModal, setShowScheduleModal] = useState<any>(null);
  const [selectedAmbassadorId, setSelectedAmbassadorId] = useState<string>('');
  const [attendanceModalEvent, setAttendanceModalEvent] = useState<any>(null);
  const [attendanceForm, setAttendanceForm] = useState({ totalPresent: '', totalExpected: '', notes: '' });
  const [paying, setPaying] = useState(false);

  const [children, setChildren] = useState<any[]>([]);
  const [attSearch, setAttSearch] = useState('');
  const [attFilterClass, setAttFilterClass] = useState('');
  const [attFilterSection, setAttFilterSection] = useState('');
  const [studentStatuses, setStudentStatuses] = useState<Record<number, 'Present' | 'Absent'>>({});

  useEffect(() => {
    fetchInitialData();
  }, [academicYear]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [eventsData, schoolData, ambassadorsData] = await Promise.all([
        eventService.getAll(academicYear),
        schoolService.getMySchool(),
        ambassadorService.getAll()
      ]);
      setEvents(eventsData);
      setSchool(schoolData);
      setAmbassadors(ambassadorsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    const data = await eventService.getAll(academicYear);
    setEvents(data);
  };

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
    const collected = school.donations?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0;
    const goal = school.annualCreditGoal || 50000;
    const gap = Math.max(0, goal - collected);

    if (gap <= 0) {
      alert("Credit pool is already fully funded!");
      return;
    }

    setPaying(true);
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load.");
      setPaying(false);
      return;
    }

    try {
      const order = await schoolService.createOrder(gap);
      if (!order || !order.id) throw new Error("Order creation failed");

      const options = {
        key: order.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: "EduCentral",
        description: "Annual Health & Safety Program Unlock",
        order_id: order.id,
        handler: async function (response: any) {
          try {
             const { partnerService } = await import('../services/api');
             await partnerService.sponsor({
                schoolId: school.id,
                amount: gap,
                type: 'GENERAL',
                description: `Institution credit pool bridge payment`,
                paymentId: response.razorpay_payment_id
             });
             alert('Payment Successful! Your annual program calendar is now unlocked.');
             window.location.reload();
          } catch (err) {
            console.error(err);
            alert('Failed to record payment. Please contact support.');
          } finally {
            setPaying(false);
          }
        },
        theme: { color: "#db2777" },
        modal: { ondismiss: () => setPaying(false) }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment.');
      setPaying(false);
    }
  };

  const handleAssignProgram = async (program: any, date: string) => {
    try {
      await eventService.create({
        type: program.type,
        title: program.title,
        description: program.description,
        academicYear,
        scheduledAt: new Date(date).toISOString(),
        ambassadorId: selectedAmbassadorId ? parseInt(selectedAmbassadorId) : undefined
      });
      setShowScheduleModal(null);
      setSelectedAmbassadorId('');
      fetchEvents();
      alert(`Program "${program.title}" assigned successfully.`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to assign program');
    }
  };

  const handleMarkComplete = async (ev: any) => {
    if (!ev.ambassadorId) {
      if (!confirm('No ambassador is assigned to this event. An invoice will NOT be generated. Continue anyway?')) {
        return;
      }
    }
    try {
      await eventService.update(ev.id, { completedAt: new Date().toISOString() });
      fetchEvents();
      alert(`Event "${ev.title}" marked as completed. ${ev.ambassadorId ? 'Invoice sent to ambassador.' : ''}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark as completed');
    }
  };

  const openAttendanceModal = async (ev: any) => {
    const att = ev.attendanceJson as any;
    setAttendanceModalEvent(ev);
    setAttendanceForm({
      totalPresent: att?.totalPresent?.toString() ?? '',
      totalExpected: att?.totalExpected?.toString() ?? '',
      notes: att?.notes ?? '',
    });
    setStudentStatuses(att?.studentStatuses ?? {});
    
    // Load children if not loaded
    if (children.length === 0) {
      try {
        const { childService } = await import('../services/api');
        const data = await childService.getAll();
        setChildren(data);
      } catch (err) {
        console.error('Failed to load children', err);
      }
    }
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceModalEvent) return;
    
    // Default un-marked students to Present or keep as is?
    // Let's assume unmarked are Present if not set.
    const presentCount = children.filter(c => studentStatuses[c.id] !== 'Absent').length;
    
    try {
      await eventService.update(attendanceModalEvent.id, {
        attendanceJson: {
          totalPresent: presentCount,
          totalExpected: children.length,
          notes: attendanceForm.notes.trim() || undefined,
          studentStatuses
        },
      });
      setAttendanceModalEvent(null);
      fetchEvents();
    } catch (err: any) {
      alert('Failed to save attendance');
    }
  };

  const toggleStudentStatus = (id: number) => {
    setStudentStatuses(prev => ({
      ...prev,
      [id]: prev[id] === 'Absent' ? 'Present' : 'Absent'
    }));
  };

  const uniqueClasses = Array.from(new Set(children.map((c: any) => c.class))).sort((a, b) => a - b);
  const uniqueSections = Array.from(new Set(children.map((c: any) => c.section))).sort();

  const filteredChildren = children.filter(c => {
    const s = attSearch.toLowerCase();
    const matchSearch = !s || c.name.toLowerCase().includes(s) || c.registrationNo.toLowerCase().includes(s);
    const matchClass = !attFilterClass || String(c.class) === attFilterClass;
    const matchSection = !attFilterSection || c.section === attFilterSection;
    return matchSearch && matchClass && matchSection;
  });

  const totalCollected = school?.donations?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0;
  const creditGoal = school?.annualCreditGoal || 50000;
  const isUnlocked = totalCollected >= creditGoal;
  const progressPercent = Math.min(100, (totalCollected / creditGoal) * 100);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)' }}>Loading Programs...</div>;

  return (
    <div className="animate-fade-in">
      {/* Credit Pool Header */}
      <div className="glass-card" style={{ background: 'white', padding: '2rem', marginBottom: '2.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Annual Program Credit Pool</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Universal funding pool from sponsors and institutional contributions.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{totalCollected.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)' }}> / ₹{creditGoal.toLocaleString()}</span>
          </div>
        </div>
        
        <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            style={{ width: `${progressPercent}%`, height: '100%', background: isUnlocked ? '#10b981' : 'linear-gradient(90deg, var(--primary) 0%, #ec4899 100%)', borderRadius: '10px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isUnlocked ? '#166534' : '#991b1b', fontSize: '0.9rem', fontWeight: 600 }}>
             {isUnlocked ? <CheckCircle2 size={18} /> : <Info size={18} />}
             {isUnlocked ? 'Program Access Unlocked' : `Bridge the ₹${(creditGoal - totalCollected).toLocaleString()} gap to unlock scheduling`}
          </div>
          {!isUnlocked && (
            <button onClick={handlePayGap} disabled={paying} className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.95rem' }}>
              {paying ? 'Processing...' : 'Pay Gap & Unlock Calendar'}
            </button>
          )}
        </div>
      </div>

      {isUnlocked ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.75rem' }}>Central Program Calendar</h3>
            <div style={{ display: 'flex', background: 'white', borderRadius: '10px', padding: '4px', border: '1px solid var(--border)' }}>
              <button onClick={() => setViewMode('list')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: viewMode === 'list' ? 'var(--primary-light)' : 'transparent', color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <LayoutList size={18} /> List
              </button>
              <button onClick={() => setViewMode('calendar')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: viewMode === 'calendar' ? 'var(--primary-light)' : 'transparent', color: viewMode === 'calendar' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <CalendarIconUI size={18} /> Calendar
              </button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <CalendarView events={events} onEventClick={(ev) => openAttendanceModal(ev)} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {PREDEFINED_PROGRAMS.map(prog => {
                  const alreadyAssigned = events.some(e => e.type === prog.type);
                  return (
                    <div key={prog.type} className="glass-card" style={{ padding: '1.25rem', background: 'white', border: '1px solid #f1f5f9', opacity: alreadyAssigned ? 0.6 : 1 }}>
                       <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>{prog.title}</h4>
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', minHeight: '40px' }}>{prog.description}</p>
                       <button 
                        onClick={() => setShowScheduleModal(prog)}
                        disabled={alreadyAssigned}
                        className="btn btn-outline" 
                        style={{ width: '100%', fontSize: '0.85rem' }}
                       >
                         {alreadyAssigned ? 'Already Assigned' : 'Assign to Calendar'}
                       </button>
                    </div>
                  );
                })}
              </div>

              <h4 style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '1rem' }}>Scheduled Programs</h4>
              {events.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No programs scheduled yet. Use the cards above to assign dates.</p>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="glass-card" style={{ padding: '1.25rem', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {ev.title}
                        {ev.completedAt && <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px' }}>Completed</span>}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <CalendarIconUI size={14} style={{ marginRight: '6px' }} />
                        {new Date(ev.scheduledAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </div>
                      {ev.ambassador && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 500 }}>
                          Ambassador: {ev.ambassador.name}
                        </div>
                      )}
                      {ev.completedAt && ev.attendanceJson?.totalPresent !== undefined && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={14} /> {ev.attendanceJson.totalPresent} Students Present
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!ev.completedAt ? (
                        <button onClick={() => handleMarkComplete(ev)} className="btn btn-sm" style={{ background: '#dcfce7', color: '#166534' }}>Complete</button>
                      ) : (
                        <button onClick={() => openAttendanceModal(ev)} className="btn btn-sm btn-outline">Log Attendance</button>
                      )}
                      <button onClick={() => eventService.delete(ev.id).then(fetchEvents)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            textAlign: 'center', 
            padding: '5rem 2rem', 
            background: 'white', 
            borderRadius: '32px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2rem auto' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--primary-light)', borderRadius: '50%', opacity: 0.2, animation: 'pulse 2s infinite' }}></div>
            <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary-light)' }}>
              <ShieldCheck size={48} color="var(--primary)" />
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#ef4444', color: 'white', borderRadius: '50%', padding: '6px', border: '3px solid white' }}>
              <Lock size={18} />
            </div>
          </div>

          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>Annual Program Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.8, fontSize: '1.1rem' }}>
            To ensure high-quality delivery of our specialized programs, access to the annual calendar is unlocked once the institutional credit goal of <strong>₹{creditGoal.toLocaleString()}</strong> is reached.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', maxWidth: '800px', margin: '0 auto 4rem auto' }}>
             {[
               { icon: <CheckCircle2 size={24} />, label: 'Health Checkups' },
               { icon: <Info size={24} />, label: 'Mental Wellness' },
               { icon: <LayoutList size={24} />, label: 'Nutrition Sessions' },
               { icon: <ShieldCheck size={24} />, label: 'Safety Drills' }
             ].map((item, i) => (
               <div key={i} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                  <div style={{ color: 'var(--primary)' }}>{item.icon}</div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
               </div>
             ))}
          </div>

          <div style={{ background: '#fff7ed', padding: '1.5rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '1rem', border: '1px solid #ffedd5', marginBottom: '2.5rem' }}>
            <div style={{ padding: '10px', background: '#fb923c', color: 'white', borderRadius: '12px' }}>
              <Info size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
               <div style={{ fontWeight: 700, color: '#9a3412', fontSize: '0.95rem' }}>Funding Gap identified</div>
               <div style={{ fontSize: '0.85rem', color: '#c2410c' }}>Current Pool: ₹{totalCollected.toLocaleString()} | Remaining: ₹{(creditGoal - totalCollected).toLocaleString()}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <button 
              onClick={handlePayGap} 
              disabled={paying}
              className="btn btn-primary" 
              style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(219, 39, 119, 0.3)' }}
            >
              {paying ? 'Setting up gateway...' : `Bridge ₹${(creditGoal - totalCollected).toLocaleString()} Gap`}
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showScheduleModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card" style={{ background: 'white', width: '100%', maxWidth: '400px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Assign {showScheduleModal.title}</h3>
                <button onClick={() => setShowScheduleModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <XCircle size={22} color="var(--text-muted)" />
                </button>
              </div>
              <form onSubmit={(e: any) => { e.preventDefault(); handleAssignProgram(showScheduleModal, e.target.scheduledAt.value); }}>
                <div className="form-group">
                  <label>Select Date & Time</label>
                  <input name="scheduledAt" type="datetime-local" required className="form-control" />
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Assign Ambassador (Optional)</label>
                  <select 
                    value={selectedAmbassadorId} 
                    onChange={(e) => setSelectedAmbassadorId(e.target.value)}
                    className="form-control"
                  >
                    <option value="">No Ambassador</option>
                    {ambassadors.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Note: Assignment generates a confirmation invoice for the ambassador upon event completion.
                  </p>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Assign to Calendar</button>
              </form>
            </motion.div>
          </div>
        )}

        {attendanceModalEvent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              className="glass-card" 
              style={{ background: 'white', width: '100%', maxWidth: '600px', padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Log Attendance</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{attendanceModalEvent.title}</p>
                </div>
                <button onClick={() => setAttendanceModalEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <XCircle size={24} color="var(--text-muted)" />
                </button>
              </div>

              {/* Modal Filters */}
              <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search student..." 
                    value={attSearch}
                    onChange={(e) => setAttSearch(e.target.value)}
                    style={{ width: '100%', height: '40px', paddingLeft: '2.5rem', paddingRight: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                  />
                </div>
                <select 
                  value={attFilterClass}
                  onChange={(e) => setAttFilterClass(e.target.value)}
                  style={{ height: '40px', padding: '0 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', minWidth: '90px' }}
                >
                  <option value="">All Cls</option>
                  {uniqueClasses.map(c => <option key={c} value={String(c)}>Cls {c}</option>)}
                </select>
                <select 
                  value={attFilterSection}
                  onChange={(e) => setAttFilterSection(e.target.value)}
                  style={{ height: '40px', padding: '0 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', minWidth: '90px' }}
                >
                  <option value="">All Sec</option>
                  {uniqueSections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                </select>
              </div>

              {/* Student List */}
              <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {filteredChildren.map(child => {
                    const isAbsent = studentStatuses[child.id] === 'Absent';
                    return (
                      <div 
                        key={child.id}
                        onClick={() => toggleStudentStatus(child.id)}
                        style={{ 
                          padding: '0.75rem 1rem', 
                          borderRadius: '12px', 
                          border: isAbsent ? '1px solid #fee2e2' : '1px solid #f1f5f9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          background: isAbsent ? '#fffafb' : '#f8fafc',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', border: '1px solid #e2e8f0' }}>
                            {child.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{child.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class {child.class}-{child.section} • {child.registrationNo}</div>
                          </div>
                        </div>
                        <div 
                          style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700,
                            background: isAbsent ? '#ef4444' : '#10b981',
                            color: 'white',
                            minWidth: '70px',
                            textAlign: 'center'
                          }}
                        >
                          {isAbsent ? 'Absent' : 'Present'}
                        </div>
                      </div>
                    );
                  })}
                  {filteredChildren.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No students found matching filters</div>
                  )}
                </div>
              </div>

              <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <div style={{ marginBottom: '1rem' }}>
                   <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Event Notes</label>
                   <textarea 
                    value={attendanceForm.notes} 
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })} 
                    style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.9rem', resize: 'none' }}
                    placeholder="Any specific observations or session notes?"
                    rows={2}
                   />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleAttendanceSubmit} className="btn btn-primary" style={{ flex: 1, height: '45px' }}>Save Attendance & Sync Statuses</button>
                  <button onClick={() => setAttendanceModalEvent(null)} className="btn btn-outline" style={{ background: 'white', border: '1px solid #e2e8f0', color: 'var(--text-main)', height: '45px' }}>Cancel</button>
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
