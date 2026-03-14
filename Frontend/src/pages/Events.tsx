import React, { useState, useEffect } from 'react';
import { eventService } from '../services/api';
import { getBandLabelsForEventType } from '../config/ageBands';
import { CalendarPlus, Plus, XCircle, Calendar, User, CheckCircle2, Users, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EVENT_TYPES = [
  'GENERAL_CHECKUP', 'DENTAL_SCREENING', 'VISION_SCREENING', 'BMI_ASSESSMENT',
  'NUTRITION_SESSION', 'HPV_AWARENESS', 'EXPERT_SESSION',
  'FIRE_DRILL', 'BLACKOUT_DRILL', 'BUNKER_DRILL', 'CPR_TRAINING', 'FIRST_AID_TRAINING', 'OTHER'
];

const DRILL_TYPES = ['FIRE_DRILL', 'BLACKOUT_DRILL', 'BUNKER_DRILL', 'CPR_TRAINING', 'FIRST_AID_TRAINING'];

const formatEventType = (t: string) => t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const isDrill = (type: string) => DRILL_TYPES.includes(type);

const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [typeFilter, setTypeFilter] = useState<'all' | 'drills' | 'health'>('all');
  const [attendanceModalEvent, setAttendanceModalEvent] = useState<any>(null);
  const [attendanceForm, setAttendanceForm] = useState({ totalPresent: '', totalExpected: '', notes: '' });
  const [formData, setFormData] = useState({
    type: 'GENERAL_CHECKUP',
    title: '',
    description: '',
    academicYear: '2024-2025',
    scheduledAt: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [academicYear]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll(academicYear);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventService.create({
        ...formData,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined
      });
      setShowAddModal(false);
      setFormData({ type: 'GENERAL_CHECKUP', title: '', description: '', academicYear: '2024-2025', scheduledAt: '' });
      fetchEvents();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error creating event');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    try {
      await eventService.delete(id);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkComplete = async (id: number) => {
    try {
      await eventService.update(id, { completedAt: new Date().toISOString() });
      fetchEvents();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark as completed');
    }
  };

  const handleMarkIncomplete = async (id: number) => {
    try {
      await eventService.update(id, { completedAt: null, attendanceJson: null });
      fetchEvents();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark as incomplete');
    }
  };

  const openAttendanceModal = (ev: any) => {
    const att = ev.attendanceJson as { totalPresent?: number; totalExpected?: number; notes?: string } | null;
    setAttendanceModalEvent(ev);
    setAttendanceForm({
      totalPresent: att?.totalPresent?.toString() ?? '',
      totalExpected: att?.totalExpected?.toString() ?? '',
      notes: att?.notes ?? '',
    });
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceModalEvent) return;
    const present = parseInt(attendanceForm.totalPresent, 10);
    const expected = parseInt(attendanceForm.totalExpected, 10);
    if (isNaN(present) || isNaN(expected) || present < 0 || expected < 0) {
      alert('Please enter valid numbers for present and expected.');
      return;
    }
    if (present > expected) {
      alert('Present cannot exceed expected.');
      return;
    }
    try {
      await eventService.update(attendanceModalEvent.id, {
        attendanceJson: {
          totalPresent: present,
          totalExpected: expected,
          notes: attendanceForm.notes.trim() || undefined,
        },
      });
      setAttendanceModalEvent(null);
      setAttendanceForm({ totalPresent: '', totalExpected: '', notes: '' });
      fetchEvents();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save attendance');
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (typeFilter === 'drills') return isDrill(ev.type);
    if (typeFilter === 'health') return !isDrill(ev.type);
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, var(--primary) 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Events
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Schedule checkups, screenings, drills, and expert sessions.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '10px', fontSize: '0.8rem', color: '#166534', border: '1px solid #bbf7d0' }}>
            <Info size={16} />
            <span><strong>Age bands:</strong> K-5, 6-8, 9-12. HPV for 9-12; CPR/First-aid for 6-12.</span>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> Add Event
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', background: 'white', padding: '1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <label style={{ fontWeight: 600 }}>Academic year</label>
        <select
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
        >
          <option value="2023-2024">2023-2024</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2025-2026">2025-2026</option>
        </select>
        <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>|</span>
        <label style={{ fontWeight: 600, marginLeft: '0.5rem' }}>Filter</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'drills', 'health'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTypeFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: typeFilter === f ? 'var(--primary)' : 'var(--border)',
                background: typeFilter === f ? 'var(--primary)' : 'white',
                color: typeFilter === f ? 'white' : 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {f === 'all' ? 'All' : f === 'drills' ? 'Drills only' : 'Health only'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', background: 'white', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
          <CalendarPlus size={60} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
          <h3>No Events Yet</h3>
          <p>Add a checkup, screening, or drill to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEvents.map((ev, index) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card"
              style={{ background: 'white', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1.5rem', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ev.title}
                  {ev.completedAt && (
                    <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Completed
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '20px' }}>
                  {formatEventType(ev.type)}
                </span>
                {ev.ambassador && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} /> {ev.ambassador.name}
                  </div>
                )}
                {isDrill(ev.type) && ev.attendanceJson && (ev.attendanceJson as any).totalPresent != null && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} /> {(ev.attendanceJson as any).totalPresent} / {(ev.attendanceJson as any).totalExpected} attended
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Calendar size={16} />
                {ev.scheduledAt ? new Date(ev.scheduledAt).toLocaleDateString() : '—'}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{ev.academicYear}</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {isDrill(ev.type) && (
                  <>
                    {ev.completedAt && (
                      <button
                        onClick={() => openAttendanceModal(ev)}
                        style={{ padding: '6px 10px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        {ev.attendanceJson ? 'Edit attendance' : 'Log attendance'}
                      </button>
                    )}
                    {ev.completedAt ? (
                      <button
                        onClick={() => handleMarkIncomplete(ev.id)}
                        style={{ padding: '6px 10px', background: '#f1f5f9', color: 'var(--text-muted)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Mark incomplete
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkComplete(ev.id)}
                        style={{ padding: '6px 10px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        Mark completed
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => handleDelete(ev.id)}
                  style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card"
              style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '2rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Add Event</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <XCircle size={22} color="var(--text-muted)" />
                </button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>{formatEventType(t)}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14} />
                    Applies to grades: {getBandLabelsForEventType(formData.type).join(', ')}
                  </p>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Annual Health Checkup 2025"
                  />
                </div>
                <div className="form-group">
                  <label>Academic year</label>
                  <input
                    required
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="e.g. 2024-2025"
                  />
                </div>
                <div className="form-group">
                  <label>Scheduled date (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description"
                    rows={2}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Create Event</button>
              </form>
            </motion.div>
          </div>
        )}

        {attendanceModalEvent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card"
              style={{ background: 'white', width: '100%', maxWidth: '400px', padding: '2rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Log Attendance – {attendanceModalEvent.title}</h3>
                <button onClick={() => setAttendanceModalEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <XCircle size={22} color="var(--text-muted)" />
                </button>
              </div>
              <form onSubmit={handleAttendanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Total present</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={attendanceForm.totalPresent}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, totalPresent: e.target.value })}
                    placeholder="e.g. 145"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Total expected</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={attendanceForm.totalExpected}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, totalExpected: e.target.value })}
                    placeholder="e.g. 160"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={attendanceForm.notes}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                    placeholder="e.g. All classes participated"
                    rows={2}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Save attendance</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
