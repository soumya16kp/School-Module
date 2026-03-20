import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolService } from '../services/api';
import { School, User, MapPin, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const REGISTRATION_FEE = 5000;

const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RegisterSchool: React.FC = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    udiseCode: '',
    schoolType: 'Private',
    boardAffiliation: 'CBSE',
    principalName: '',
    principalContact: '',
    schoolEmail: '',
    studentStrength: '',
    address: '',
    state: '',
    city: '',
    stateCode: 'WB',
    pincode: '',
    pocName: '',
    pocDesignation: '',
    pocMobile: '',
    pocEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Load Razorpay Script
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    try {
      // 2. Create order on backend
      const order = await schoolService.createOrder(REGISTRATION_FEE);
      
      if (!order || !order.id) {
        alert("Failed to create Razorpay Order. Please check your connection.");
        setLoading(false);
        return;
      }

      // 3. Initialize Razorpay Checkout
      const options = {
        key: order.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: "WombTo18",
        description: "School Registration Fee",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 4. Complete registration on backend
            await schoolService.register({
              ...formData,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
            alert('Registration Successful!');
            navigate('/dashboard');
          } catch (err: any) {
            console.error("Registration update failed", err);
            const msg = err.response?.data?.message || "Internal server error";
            alert(`Payment captured but failed to complete registration: ${msg}`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.principalName,
          email: formData.schoolEmail,
          contact: formData.principalContact,
        },
        theme: {
          color: "#db2777",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      console.error(err);
      alert('Failed to initiate payment. Please check your connection.');
      setLoading(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', marginTop: '1rem', borderBottom: '2px solid var(--primary-light)', paddingBottom: '8px' }}>
       <Icon size={20} color="var(--primary)" />
       <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{title}</h3>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ padding: '3rem' }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>School Registration</h1>
          <p style={{ color: 'var(--text-muted)' }}>Provide details to register your institution in the central database.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <SectionTitle icon={School} title="Basic Information" />
          <div className="grid-2">
            <div className="form-group">
              <label>School Name (as per records)</label>
              <input name="schoolName" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>UDISE+ Code (Optional)</label>
              <input name="udiseCode" onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>School Type</label>
              <select name="schoolType" onChange={handleChange}>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="International">International</option>
              </select>
            </div>
            <div className="form-group">
              <label>Board Affiliation</label>
              <input name="boardAffiliation" placeholder="CBSE, ICSE, State, etc." onChange={handleChange} required />
            </div>
          </div>

          <SectionTitle icon={User} title="Principal Details" />
          <div className="grid-2">
            <div className="form-group">
              <label>Principal's Full Name</label>
              <input name="principalName" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Principal's Contact</label>
              <input name="principalContact" onChange={handleChange} required />
            </div>
          </div>

          <SectionTitle icon={MapPin} title="Location & Capacity" />
          <div className="form-group">
            <label>Complete Address</label>
            <textarea name="address" style={{ minHeight: '80px', borderRadius: '10px' }} onChange={handleChange} required></textarea>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>State</label>
              <input name="state" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>City</label>
              <input name="city" onChange={handleChange} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>State Code (e.g., WB, DL)</label>
              <input name="stateCode" maxLength={2} placeholder="WB" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input name="pincode" onChange={handleChange} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Total Student Strength</label>
              <input type="number" name="studentStrength" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>School Email Address</label>
              <input type="email" name="schoolEmail" onChange={handleChange} required />
            </div>
          </div>

          <SectionTitle icon={FileText} title="Point of Contact (If not Principal)" />
          <div className="grid-2">
            <div className="form-group">
              <label>POC Name</label>
              <input name="pocName" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>POC Designation</label>
              <input name="pocDesignation" onChange={handleChange} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>POC Mobile</label>
              <input name="pocMobile" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>POC Email</label>
              <input name="pocEmail" onChange={handleChange} />
            </div>
          </div>

          <SectionTitle icon={User} title="Parent Portal POC / PTA Details" />
          <div className="grid-2">
            <div className="form-group">
              <label>Parent Rep / PTA Name</label>
              <input name="ptaName" placeholder="PTA President / Parent POC" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>PTA Designation</label>
              <input name="ptaDesignation" placeholder="e.g. PTA Member" onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Parent Rep Mobile</label>
            <input name="ptaMobile" onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%', height: '56px', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? 'Processing Payment...' : `Pay ₹${REGISTRATION_FEE} & Complete Registration`} <CheckCircle size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterSchool;
