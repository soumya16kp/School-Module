import React, { useState, useEffect } from 'react';
import { partnerService } from '../services/api';
import { History, Calendar, School, Heart, IndianRupee, Tag, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DonationHistory: React.FC = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const data = await partnerService.getDonations();
        setDonations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>Loading donation history...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>
          Contribution <span style={{ color: 'var(--primary)' }}>Track Record</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Review all your past sponsorships and their impact on schools.</p>
      </div>

      {donations.length === 0 ? (
        <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center', background: 'white', border: '2px dashed #e2e8f0' }}>
          <History size={60} color="#cbd5e1" style={{ margin: '0 auto 1.5rem auto' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>No Contributions Yet</h3>
          <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>You haven't made any donations yet. Start by exploring schools in need!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {donations.map((donation, index) => (
            <motion.div
              key={donation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card"
              style={{ padding: '1.75rem', background: 'white', display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr auto', gap: '2rem', alignItems: 'center', border: '1px solid #f1f5f9' }}
            >
              <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={24} color="var(--primary)" fill="var(--primary)" />
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Beneficiary</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1e293b' }}>
                  <School size={16} color="#64748b" /> {donation.school.schoolName}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Date</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.95rem' }}>
                  <Calendar size={16} color="#64748b" /> {new Date(donation.date).toLocaleDateString()}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Type</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.95rem' }}>
                  <Tag size={16} color="#64748b" /> {donation.type} {donation.event ? `(${donation.event.title})` : ''}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Amount</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                  <IndianRupee size={18} /> {donation.amount.toLocaleString()}
                </div>
              </div>

              <div style={{ paddingLeft: '1rem' }}>
                 <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Completed
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationHistory;
