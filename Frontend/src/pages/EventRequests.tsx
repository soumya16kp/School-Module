import React, { useState, useEffect } from 'react';
import { eventRequestService } from '../services/api';
import { Bell, CheckCircle2, XCircle, User, Phone, Info, Clock, School } from 'lucide-react';
import { motion } from 'framer-motion';

const EventRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [officialNotes, setOfficialNotes] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await eventRequestService.list();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      setProcessingId(id);
      await eventRequestService.updateStatus(id, status, officialNotes);
      setOfficialNotes('');
      fetchRequests();
    } catch (err) {
      console.error('Action failed:', err);
      alert('Failed to update request status');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading requests...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Event Approval Requests
        </h2>
        <p style={{ color: '#64748b' }}>WOMBTO18 Officials monitor these requests to assign or approve event personnel.</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {requests.map((request) => (
          <motion.div 
            key={request.id} 
            className="glass-card" 
            style={{ 
              background: 'white', 
              padding: '2rem', 
              borderLeft: `6px solid ${
                request.status === 'APPROVED' ? '#10b981' : 
                request.status === 'REJECTED' ? '#ef4444' : '#8b5cf6'
              }` 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '8px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    background: '#f1f5f9', 
                    color: '#475569' 
                  }}>
                    {request.event?.type?.replace('_', ' ')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem' }}>
                    <Clock size={14} /> {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                  {request.event?.title}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>School Information</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <School size={16} />
                      </div>
                      <p style={{ fontWeight: 600, color: '#334155' }}>{request.school?.schoolName}</p>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Proposed Personnel</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                        <User size={16} color="#8b5cf6" />
                        <span style={{ fontWeight: 600 }}>{request.personName || 'No Specific Recommendation'}</span>
                      </div>
                      {request.personContact && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '0.9rem' }}>
                          <Phone size={14} /> {request.personContact}
                        </div>
                      )}
                      {request.personDetails && (
                        <div style={{ display: 'flex', alignItems: 'start', gap: '10px', color: '#64748b', fontSize: '0.9rem' }}>
                          <Info size={14} style={{ marginTop: '2px' }} /> {request.personDetails}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ width: '250px', paddingLeft: '2rem', borderLeft: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Status: {request.status}</p>
                
                {request.status === 'PENDING' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea 
                      placeholder="Add official notes..."
                      value={processingId === request.id ? officialNotes : ''}
                      onChange={(e) => setOfficialNotes(e.target.value)}
                      style={{ fontSize: '0.85rem', height: '80px', resize: 'none', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleAction(request.id, 'APPROVED')}
                        disabled={processingId === request.id}
                        className="btn btn-primary" 
                        style={{ flex: 1, padding: '0.5rem', background: '#10b981', boxShadow: 'none' }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleAction(request.id, 'REJECTED')}
                        disabled={processingId === request.id}
                        className="btn" 
                        style={{ flex: 1, padding: '0.5rem', background: '#fee2e2', color: '#ef4444' }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: request.status === 'APPROVED' ? '#10b981' : '#ef4444' }}>
                    {request.status === 'APPROVED' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    <span style={{ fontWeight: 800 }}>{request.status}</span>
                  </div>
                )}
                {request.officialNotes && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', color: '#475569' }}>
                    <strong>Note:</strong> {request.officialNotes}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {requests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
            <Bell size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p>No event requests pending your approval.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRequests;
