import React, { useState } from 'react';
import { useSchoolData } from '../context/SchoolDataContext';
import { Award, Mail, ChevronDown, IndianRupee, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatDate = (d: string) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Ambassadors: React.FC = () => {
  const { benefactors: partners, loading } = useSchoolData();
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null);

  const grandTotal = partners.reduce((s: number, p: any) => s + p.total, 0);

  return (
    <div style={{ padding: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Institutional Benefactors</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '4px', fontWeight: 500 }}>Recognizing the partners who support our school safety & health programs</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>Loading benefactor data...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Donor Wall / Benefactors Section */}
          {(() => {
            if (!partners.length) {
              return (
                <div style={{ padding: '4rem', textAlign: 'center', background: 'white', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '32px' }}>
                  <Award size={60} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: '#1e293b', fontWeight: 800 }}>No Benefactors Yet</h3>
                  <p>Donations from your institutional partners will appear here.</p>
                </div>
              );
            }
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '32px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px -15px rgba(0,0,0,0.06)'
                }}
              >
                {/* Wall Header */}
                <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', padding: '14px', borderRadius: '18px', boxShadow: '0 4px 12px rgba(251,191,36,0.15)' }}>
                      <Award size={32} color="#d97706" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>Donor Wall</h3>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
                        {partners.length} active partner{partners.length !== 1 ? 's' : ''} • Helping us stay safe
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Raised</p>
                    <p style={{ margin: 0, fontSize: '2.4rem', fontWeight: 1000, color: '#d97706', letterSpacing: '-0.04em' }}>₹{grandTotal.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Partner Grid */}
                <div style={{ padding: '1.5rem 2.5rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {partners.map((partner: any, idx: number) => (
                    <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', background: 'white', transition: 'all 0.2s ease' }}>
                      {/* Partner Summary Row */}
                      <div
                        style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}
                        onClick={() => setExpandedPartner(expandedPartner === partner.name ? null : partner.name)}
                        onMouseEnter={(e) => (e.currentTarget.parentElement!.style.borderColor = '#fbbf24')}
                        onMouseLeave={(e) => (e.currentTarget.parentElement!.style.borderColor = '#e2e8f0')}
                      >
                        {/* Avatar Cell */}
                        <div style={{ 
                          width: '56px', 
                          height: '56px', 
                          borderRadius: '18px', 
                          background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 900, 
                          fontSize: '1.5rem', 
                          color: '#92400e', 
                          flexShrink: 0,
                          boxShadow: '0 4px 10px rgba(251,191,36,0.2)'
                        }}>
                          {partner.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info Cell */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{partner.name}</div>
                          {partner.email && (
                            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <Mail size={14} /> {partner.email}
                            </div>
                          )}
                        </div>

                        {/* Stats Cell */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ background: '#fffbeb', color: '#92400e', padding: '6px 16px', borderRadius: '12px', fontWeight: 900, fontSize: '1.1rem', border: '1px solid #fde68a' }}>
                            ₹{partner.total.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>{partner.transactions.length} contribution{partner.transactions.length !== 1 ? 's' : ''}</div>
                        </div>

                        {/* Chevron */}
                        <div style={{ color: '#cbd5e1', flexShrink: 0, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: expandedPartner === partner.name ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          <ChevronDown size={24} />
                        </div>
                      </div>

                      {/* Transaction Dropdown */}
                      <AnimatePresence>
                        {expandedPartner === partner.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            style={{ overflow: 'hidden', borderTop: '1px solid #f8fafc', background: '#fafafa' }}
                          >
                            <div style={{ padding: '1.5rem 2rem 2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>History</span>
                                <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }} />
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {partner.transactions.map((txn: any, ti: number) => (
                                  <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <IndianRupee size={18} color="#16a34a" strokeWidth={2.5} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>₹{(txn.amount || 0).toLocaleString('en-IN')}</div>
                                      {txn.description && (
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          "{txn.description}"
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                        <Clock size={12} /> {formatDate(txn.date)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Ambassadors;
