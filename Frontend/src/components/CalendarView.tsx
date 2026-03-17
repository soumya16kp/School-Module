import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  events: any[];
  onEventClick?: (event: any) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth(year, month) }, (_, i) => i);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    return events.filter(ev => {
      if (!ev.scheduledAt) return false;
      const d = new Date(ev.scheduledAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };


  return (
    <div className="glass-card" style={{ background: 'white', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{monthNames[month]} {year}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prevMonth} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ background: '#f8fafc', padding: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {d}
          </div>
        ))}
        {emptyDays.map(d => (
          <div key={`empty-${d}`} style={{ background: 'white', minHeight: '120px' }}></div>
        ))}
        {days.map(d => {
          const dayEvents = getEventsForDay(d);
          const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
          
          return (
            <div key={d} style={{ background: 'white', minHeight: '120px', padding: '8px', position: 'relative', border: isToday ? '2px solid var(--primary)' : 'none' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: isToday ? 'var(--primary)' : 'inherit' }}>{d}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dayEvents.map(ev => (
                  <motion.div
                    key={ev.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onEventClick?.(ev)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      background: ev.completedAt ? '#dcfce7' : 'var(--primary-light)',
                      color: ev.completedAt ? '#166534' : 'var(--primary)',
                      cursor: 'pointer',
                      borderLeft: `3px solid ${ev.completedAt ? '#16a34a' : 'var(--primary)'}`,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={ev.title}
                  >
                    {ev.title}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary-light)', borderLeft: '3px solid var(--primary)' }}></div>
          <span>Scheduled / Funded</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#dcfce7', borderLeft: '3px solid #16a34a' }}></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
