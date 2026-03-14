import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { partnerService } from '../services/api';
import { School, Heart, ShieldCheck, Calendar, Info, XCircle, CreditCard, CheckCircle2, TrendingUp, Presentation, Search, Filter, MapPin, User, Hash, Globe, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsData, setStatsData] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [numStudents, setNumStudents] = useState<number>(1);
  const [sponsorAll, setSponsorAll] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBoard, setFilterBoard] = useState('');
  const COST_PER_STUDENT = 500;

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
    setNumStudents(1);
    setSponsorAll(false);
    setSponsorData({ type: 'GENERAL', amount: COST_PER_STUDENT, description: '', eventId: undefined });
  };

  const handleNumStudentsChange = (val: number, schoolCapacity: number) => {
    const checkedVal = Math.max(1, Math.min(val, schoolCapacity));
    setNumStudents(checkedVal);
    setSponsorAll(checkedVal === schoolCapacity);
    setSponsorData((prev) => ({ ...prev, amount: checkedVal * COST_PER_STUDENT }));
  };

  const handleSponsorAllChange = (checked: boolean, schoolCapacity: number) => {
    setSponsorAll(checked);
    if (checked) {
      setNumStudents(schoolCapacity);
      setSponsorData((prev) => ({ ...prev, amount: schoolCapacity * COST_PER_STUDENT }));
    } else {
      setNumStudents(1);
      setSponsorData((prev) => ({ ...prev, amount: COST_PER_STUDENT }));
    }
  };

  const handleViewStatsClick = async (school: any) => {
    setSelectedSchool(school);
    setShowStatsModal(true);
    setStatsLoading(true);
    try {
      const data = await partnerService.getSchoolStats(school.id);
      setStatsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    handlePayment();
  };

  const handlePayment = async () => {
    setPaymentStatus('processing');
    
    // Load Razorpay Script
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setPaymentStatus('idle');
      return;
    }

    try {
      // 1. Create order on backend
      const order = await partnerService.createOrder(sponsorData.amount);
      
      if (!order || !order.id) {
        console.error("Order creation failed, received:", order);
        alert("Failed to create Razorpay Order. Please check backend logs or your Key Secret. \nResponse: " + JSON.stringify(order));
        setPaymentStatus('idle');
        return;
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: order.razorpay_key_id, // Dynamically set from backend
        amount: order.amount,
        currency: order.currency,
        name: "WombTo18",
        description: "School Sponsorship Transaction",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Complete sponsorship on backend
            await partnerService.sponsor({
              schoolId: selectedSchool.id,
              ...sponsorData,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
            setPaymentStatus('success');
            fetchSchools(); // Refresh stats immediately
            
            // Show a quick success modal or just close
            setShowCheckout(true);
            setTimeout(() => {
              setShowCheckout(false);
              setPaymentStatus('idle');
              setSelectedSchool(null);
              setShowSponsorModal(false);
            }, 3000);
          } catch (err) {
            console.error("Sponsor update failed", err);
            alert("Payment captured but failed to update sponsorship record.");
          }
        },
        prefill: {
          name: "Sponsor Partner",
          email: "partner@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#ec4899",
        },
        modal: {
          ondismiss: function() {
            setPaymentStatus('idle');
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      console.error(err);
      const backendMsg = err.response?.data?.message || err.message;
      alert(`Failed to initiate payment: ${backendMsg}`);
      setPaymentStatus('idle');
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>Loading available schools...</div>;

  return (
    <div className="animate-fade-in text-slate-800">
      <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b', letterSpacing: '-0.025em' }}>
              Support an <span style={{ color: 'var(--primary)', position: 'relative' }}>
                Institution
                <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-4px', left: 0, color: 'var(--primary-light)' }}><path d="M0 4c20 0 20 4 40 4s20-4 40-4 20 4 40 4v4H0z" fill="var(--primary)" opacity="0.2"/></svg>
              </span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '650px', lineHeight: '1.6' }}>
              Transform futures by sponsoring comprehensive health programs, regular medical checkups, and nutritional support for partner schools. Your contribution directly impacts student wellbeing and helps build a healthier generation.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
               <input 
                 type="text" 
                 placeholder="Search by school name..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.95rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', outline: 'none', transition: 'border-color 0.2s' }}
                 onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                 onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
               />
               <Search style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} size={18} />
            </div>
            <div style={{ position: 'relative' }}>
              <select 
                value={filterBoard}
                onChange={e => setFilterBoard(e.target.value)}
                style={{ padding: '12px 36px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', appearance: 'none', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="">All Boards</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State">State Board</option>
                <option value="IB">IB</option>
              </select>
              <Filter style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8', pointerEvents: 'none' }} size={18} />
              <div style={{ position: 'absolute', right: '14px', top: '16px', pointerEvents: 'none', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #94a3b8' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '2.5rem' }}>
        {schools
          .filter(school => school.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()))
          .filter(school => filterBoard === '' || school.boardAffiliation === filterBoard)
          .map((school, index) => (
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
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '12px' }}>
                  <School size={24} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                      {school.schoolType || 'Co-ed'}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#6366f1', background: '#e0e7ff', padding: '2px 8px', borderRadius: '4px' }}>
                      {school.boardAffiliation}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', lineHeight: '1.2' }}>{school.schoolName}</h3>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px', border: '1px solid #d1fae5', whiteSpace: 'nowrap' }}>
                Verified Partner
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '1.75rem' }}>
              <div>
                <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                  Partnering with WombTo18 to ensure regular health monitoring and nutritional guidance for every student. Support their journey to a healthier future.
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                    <MapPin size={14} color="var(--primary)" /> {school.city}, {school.state}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                    <Info size={14} color="var(--primary)" /> {school.studentStrength.toLocaleString()} Students
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#6366f1', background: '#e0e7ff', padding: '6px 12px', borderRadius: '8px' }}>
                    <Sparkles size={14} color="#6366f1" /> {school.ambassadors?.length || 0} Ambassadors
                  </div>
                </div>

                {/* Sponsoring Partners Section */}
                {school.donations && school.donations.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={14} color="var(--primary)" /> Recent Impact Support
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {Array.from(new Set(school.donations.map((d: any) => d.user?.name))).slice(0, 3).map((partnerName: any, idx) => (
                        <div key={idx} style={{ padding: '4px 10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                           {partnerName}
                        </div>
                      ))}
                      {new Set(school.donations.map((d: any) => d.user?.name)).size > 3 && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, alignSelf: 'center' }}>
                          + {new Set(school.donations.map((d: any) => d.user?.name)).size - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Hash size={16} color="#94a3b8" />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>UDISE Code</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{school.udiseCode || 'N/A'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={16} color="#94a3b8" />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>POC / Principal</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{school.pocName || school.principalName}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Globe size={16} color="#94a3b8" />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Academic Cycle</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{school.academicYear}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Total Sponsored</p>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>₹{(school.totalSponsoredAmount || 0).toLocaleString()}</p>
                </div>
                <div style={{ width: '1px', height: '30px', background: '#e2e8f0', alignSelf: 'center' }}></div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Reg No.</p>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#475569' }}>{school.registrationNo}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleViewStatsClick(school)}
                  className="btn" 
                  style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', fontWeight: 700 }}
                >
                  <TrendingUp size={18} /> View Analysis
                </button>
                <button 
                  onClick={() => handleSponsorClick(school)}
                  className="btn btn-primary" 
                  style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, #ec4899 100%)', border: 'none', fontWeight: 700, boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)' }}
                >
                  <Heart size={18} fill="currentColor" /> Sponsor Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Modal */}
      {createPortal(
        <AnimatePresence>
          {showStatsModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card"
              style={{ background: 'white', width: '100%', maxWidth: '800px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Health Program Statistics</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedSchool?.schoolName}</p>
                </div>
                <button onClick={() => { setShowStatsModal(false); setSelectedSchool(null); setStatsData([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <XCircle size={28} />
                </button>
              </div>

              {statsLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading stats...</div>
              ) : statsData.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                  <Presentation size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                  <p>No health statistics recorded for this school yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {statsData.map((stat) => (
                    <div key={stat.year} style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <div style={{ padding: '1rem 1.5rem', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Academic Year: {stat.year}</h4>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', background: 'white', padding: '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                          Base Cohort: <strong>{stat.totalStudents}</strong>
                        </span>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                              <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600 }}>Parameter</th>
                              <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600 }}>Conducted</th>
                              <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600 }}>Students Checked</th>
                              <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600 }}>Referrals Made</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '1rem 1.5rem' }}>General Medical Check-up</td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {stat.generalCheckup.conducted ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#94a3b8" />}
                                  {stat.generalCheckup.conducted ? 'Yes' : 'No'}
                                </div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>{stat.generalCheckup.checked}</td>
                              <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>—</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '1rem 1.5rem' }}>Eye / Vision Screening</td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {stat.eyeScreening.conducted ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#94a3b8" />}
                                  {stat.eyeScreening.conducted ? 'Yes' : 'No'}
                                </div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>{stat.eyeScreening.checked}</td>
                              <td style={{ padding: '1rem 1.5rem', fontWeight: stat.eyeScreening.referrals > 0 ? 600 : 400, color: stat.eyeScreening.referrals > 0 ? '#ef4444' : 'inherit' }}>{stat.eyeScreening.referrals}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '1rem 1.5rem' }}>Dental Check-up</td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {stat.dentalCheckup.conducted ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#94a3b8" />}
                                  {stat.dentalCheckup.conducted ? 'Yes' : 'No'}
                                </div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>{stat.dentalCheckup.checked}</td>
                              <td style={{ padding: '1rem 1.5rem', fontWeight: stat.dentalCheckup.referrals > 0 ? 600 : 400, color: stat.dentalCheckup.referrals > 0 ? '#ef4444' : 'inherit' }}>{stat.dentalCheckup.referrals}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '1rem 1.5rem' }}>BMI Assessment</td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {stat.bmiAssessment.conducted ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#94a3b8" />}
                                  {stat.bmiAssessment.conducted ? 'Yes' : 'No'}
                                </div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>{stat.bmiAssessment.checked}</td>
                              <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>—</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '1rem 1.5rem' }}>Menstrual Wellness Session</td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {stat.menstrualWellness.conducted ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#94a3b8" />}
                                  {stat.menstrualWellness.conducted ? 'Yes' : 'No'}
                                </div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>{stat.menstrualWellness.checked}</td>
                              <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>—</td>
                            </tr>
                            <tr>
                              <td style={{ padding: '1rem 1.5rem' }}>Nutrition Session</td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {stat.nutrition.conducted ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#94a3b8" />}
                                  {stat.nutrition.conducted ? 'Yes' : 'No'}
                                </div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>{stat.nutrition.checked}</td>
                              <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>—</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Sponsor Modal */}
      {createPortal(
        <AnimatePresence>
          {showSponsorModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
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
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#475569' }}>Select Students to Sponsor</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="number"
                        min="1"
                        max={selectedSchool?.studentStrength || 1000}
                        value={numStudents}
                        onChange={(e) => handleNumStudentsChange(Number(e.target.value), selectedSchool?.studentStrength || 1000)}
                        disabled={sponsorAll}
                        style={{ width: '100px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', fontWeight: 600, background: sponsorAll ? '#f1f5f9' : 'white' }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#475569', fontWeight: 600, background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <input 
                          type="checkbox" 
                          checked={sponsorAll}
                          onChange={(e) => handleSponsorAllChange(e.target.checked, selectedSchool?.studentStrength || 1000)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                        Sponsor All ({selectedSchool?.studentStrength || '...'})
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#475569' }}>Message (Optional)</label>
                    <textarea
                      rows={2}
                      value={sponsorData.description}
                      onChange={(e) => setSponsorData({ ...sponsorData, description: e.target.value })}
                      placeholder="Wishes or specific instructions..."
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', resize: 'none' }}
                    />
                  </div>

                  <div style={{ background: 'var(--primary-light)', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{numStudents} Students × ₹{COST_PER_STUDENT}</p>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>₹{sponsorData.amount.toLocaleString()}</h3>
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
        </AnimatePresence>,
        document.body
      )}

      {/* Dummy Checkout Modal */}
      {createPortal(
        <AnimatePresence>
          {showCheckout && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1.5rem' }}>
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
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Payment initializing</h3>
                      <p style={{ color: '#64748b' }}>Please wait...</p>
                    </div>


                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default PartnerSchools;
