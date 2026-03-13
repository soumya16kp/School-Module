import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentService } from '../services/api';
import { motion } from 'framer-motion';
import { Users, ChevronRight, GraduationCap } from 'lucide-react';

const ChildSelection: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await parentService.getChildren();
        setChildren(data);
        if (data.length === 0) navigate('/parent-login');
      } catch (err) {
        navigate('/parent-login');
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, [navigate]);

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: '#dbeafe', borderRadius: '20px', color: '#2563eb', marginBottom: '1rem' }}>
            <Users size={40} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e3a8a' }}>Select Your Child</h1>
          <p style={{ color: '#64748b' }}>Multiple records found for your phone number</p>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {children.map((child, index) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/parent/dashboard/${child.id}`)}
              style={{
                background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
              whileHover={{ scale: 1.02, borderColor: '#2563eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>{child.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{child.schoolName} • Class {child.class}-{child.section}</p>
                </div>
              </div>
              <ChevronRight size={24} color="#94a3b8" />
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={() => navigate('/parent-login')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>
             Log in with a different number
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildSelection;
