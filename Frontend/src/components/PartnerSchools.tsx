import React, { useState, useEffect } from 'react';
import { partnerService } from '../services/api';
import { School, Heart, ShieldCheck, Calendar, Info, XCircle, CreditCard, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PartnerSchools: React.FC = () => {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [sponsorData, setSponsorData] = useState({
    type: 'GENERAL',
    amount: 5000,
    description: '',
    eventId: undefined as number | undefined
  });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getSchools();
      setSchools(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSponsorClick = (school: any) => {
    setSelectedSchool(school);
    setShowSponsorModal(true);
    setSponsorData({
       type: 'GENERAL',
       amount: 5000,
       description: '',
       eventId: undefined
    });
  };

  const handleProceedToCheckout = () => {
    setShowCheckout(true);
    setShowSponsorModal(false);
  };

  const handlePayment = async () => {
    setPaymentStatus('processing');
    // Simulate payment processing
    setTimeout(async () => {
      try {
        await partnerService.sponsor({
          schoolId: selectedSchool.id,
          ...sponsorData
        });
        setPaymentStatus('success');
        setTimeout(() => {
          setShowCheckout(false);
          setPaymentStatus('idle');
          setSelectedSchool(null);
        }, 2000);
      } catch (err) {
        alert('Payment failed');
        setPaymentStatus('idle');
      }
    }, 1500);
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>Loading available schools...</div>;

  return (
    <div className="animate-fade-in text-slate-800">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>
          Support an <span style={{ color: 'var(--primary)' }}>Institution</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Browse schools and sponsor their health programs, events, or general welfare.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {schools.map((school, index) => (
          <motion.div
            key={school.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card"
            style={{ 
              background: 'white', 
              padding: '1.75rem', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '12px' }}>
                <School size={24} color="var(--primary)" />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px', border: '1px solid #d1fae5' }}>
                Verified Partner
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>{school.schoolName}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                <ShieldCheck size={16} /> {school.boardAffiliation} Board
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                <Info size={16} /> {school.studentStrength.toLocaleString()} Students
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                <Calendar size={16} /> {school.academicYear} Academic Year
              </div>
            </div>

            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => handleSponsorClick(school)}
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, #ec4899 100%)', border: 'none' }}
              >
                <Heart size={18} fill="currentColor" /> Sponsor Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sponsor Modal */}
      <AnimatePresence>
        {showSponsorModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card"
              style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Sponsorship Details</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Supporting {selectedSchool?.schoolName}</p>
                </div>
                <button onClick={() => setShowSponsorModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <XCircle size={28} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#475569' }}>Category</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {['GENERAL', 'EVENT', 'CHECKUP'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSponsorData({ ...sponsorData, type: cat })}
                        style={{
                          padding: '12px 8px',
                          borderRadius: '10px',
                          border: '2px solid',
                          borderColor: sponsorData.type === cat ? 'var(--primary)' : '#e2e8f0',
                          background: sponsorData.type === cat ? 'var(--primary-light)' : 'transparent',
                          color: sponsorData.type === cat ? 'var(--primary)' : '#64748b',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {sponsorData.type === 'EVENT' && selectedSchool?.events && (
                   <div className="form-group">
                     <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#475569' }}>Select Event</label>
                     <select
                       value={sponsorData.eventId}
                       onChange={(e) => setSponsorData({ ...sponsorData, eventId: Number(e.target.value) })}
                       style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                     >
                       <option value="">Select an event...</option>
                       {selectedSchool.events.map((ev: any) => (
                         <option key={ev.id} value={ev.id}>{ev.title}</option>
                       ))}
                     </select>
                   </div>
                )}

                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#475569' }}>Contribution Amount (₹)</label>
                  <input
                    type="number"
                    value={sponsorData.amount}
                    onChange={(e) => setSponsorData({ ...sponsorData, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1.1rem', fontWeight: 600 }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#475569' }}>Message (Optional)</label>
                  <textarea
                    rows={3}
                    value={sponsorData.description}
                    onChange={(e) => setSponsorData({ ...sponsorData, description: e.target.value })}
                    placeholder="Wishes or specific instructions..."
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', resize: 'none' }}
                  />
                </div>

                <button 
                  onClick={handleProceedToCheckout} 
                  className="btn btn-primary" 
                  style={{ marginTop: '0.5rem', padding: '1rem', fontSize: '1rem', fontWeight: 700 }}
                >
                  Proceed to Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dummy Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '1.5rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card"
              style={{ background: 'white', width: '100%', maxWidth: '450px', padding: '2.5rem', position: 'relative' }}
            >
              {paymentStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    style={{ marginBottom: '1.5rem', color: '#10b981' }}
                  >
                    <CheckCircle2 size={80} style={{ margin: '0 auto' }} />
                  </motion.div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Payment Successful!</h3>
                  <p style={{ color: '#64748b' }}>Thank you for your generous contribution.</p>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setShowCheckout(false)} 
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    <XCircle size={24} />
                  </button>
                  
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                      <CreditCard size={30} color="#64748b" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Secure Checkout</h3>
                    <p style={{ color: '#64748b' }}>Enter your payment details (Mock)</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>Total Amount</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>₹{sponsorData.amount.toLocaleString()}</span>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Card Number</label>
                      <input disabled type="text" value="**** **** **** 4242" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Expiry</label>
                        <input disabled type="text" value="12/28" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>CVV</label>
                        <input disabled type="password" value="***" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                      </div>
                    </div>

                    <button 
                      onClick={handlePayment}
                      disabled={paymentStatus === 'processing'}
                      className="btn btn-primary" 
                      style={{ marginTop: '1rem', padding: '1.1rem', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                      {paymentStatus === 'processing' ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ border: '3px solid white', borderTop: '3px solid transparent', borderRadius: '50%', width: '20px', height: '20px' }} />
                          Processing...
                        </>
                      ) : (
                        `Pay ₹${sponsorData.amount.toLocaleString()}`
                      )}
                    </button>
                    
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                      🔒 Secured by SSL Encryption
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerSchools;
