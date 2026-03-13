import React, { useState, useEffect } from 'react';
import { eventService } from '../services/api';
import { CalendarPlus, Plus, XCircle, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EVENT_TYPES = [
  'GENERAL_CHECKUP', 'DENTAL_SCREENING', 'VISION_SCREENING', 'BMI_ASSESSMENT',
  'NUTRITION_SESSION', 'HPV_AWARENESS', 'EXPERT_SESSION',
  'FIRE_DRILL', 'BLACKOUT_DRILL', 'BUNKER_DRILL', 'CPR_TRAINING', 'FIRST_AID_TRAINING', 'OTHER'
];

const formatEventType = (t: string) => t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [academicYear, setAcademicYear] = useState('2024-2025');
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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, var(--primary) 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Events
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Schedule checkups, screenings, drills, and expert sessions.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> Add Event
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', background: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>Loading events...</div>
      ) : events.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', background: 'white', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
          <CalendarPlus size={60} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
          <h3>No Events Yet</h3>
          <p>Add a checkup, screening, or drill to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((ev, index) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card"
              style={{ background: 'white', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1.5rem', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{ev.title}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '20px' }}>
                  {formatEventType(ev.type)}
                </span>
                {ev.ambassador && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} /> {ev.ambassador.name}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Calendar size={16} />
                {ev.scheduledAt ? new Date(ev.scheduledAt).toLocaleDateString() : '—'}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{ev.academicYear}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
      </AnimatePresence>
    </div>
  );
};

export default Events;
