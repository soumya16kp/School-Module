import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  percentage: number;
  pendingPercentage?: number;
  extraPercentage?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  pendingColor?: string;
  extraColor?: string;
  subLabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  pendingPercentage = 0,
  extraPercentage = 0,
  size = 180,
  strokeWidth = 16,
  color = '#10b981', // Emerald 500 for Done/Finalized
  pendingColor = '#f59e0b', // Amber 500 for Ready/Pending Finalization
  extraColor = '#3b82f6', // Blue 500 for Scheduled/Upcoming
  subLabel
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semi-circle circumference
  
  // Weights for stacking:
  // Level 1: Done (percentage)
  // Level 2: Ready (pendingPercentage)
  // Level 3: Scheduled (extraPercentage)
  
  return (
    <div style={{ position: 'relative', width: size, height: size / 2 + 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width={size} height={size / 2 + strokeWidth} style={{ position: 'absolute', bottom: 0 }}>
        {/* Background Arc */}
        <path
          d={`M ${strokeWidth/2},${size/2} A ${radius},${radius} 0 0,1 ${size - strokeWidth/2},${size/2}`}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Level 3: Scheduled (drawn if total exists) */}
        {(percentage + pendingPercentage + extraPercentage) > 0 && (
          <motion.path
            d={`M ${strokeWidth/2},${size/2} A ${radius},${radius} 0 0,1 ${size - strokeWidth/2},${size/2}`}
            fill="none"
            stroke={extraColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - ((percentage + pendingPercentage + extraPercentage) / 100) * circumference }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        )}

        {/* Level 2: Ready */}
        {(percentage + pendingPercentage) > 0 && (
          <motion.path
            d={`M ${strokeWidth/2},${size/2} A ${radius},${radius} 0 0,1 ${size - strokeWidth/2},${size/2}`}
            fill="none"
            stroke={pendingColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - ((percentage + pendingPercentage) / 100) * circumference }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        )}
 
        {/* Level 1: Done/Finalized */}
        {percentage > 0 && (
          <motion.path
            d={`M ${strokeWidth/2},${size/2} A ${radius},${radius} 0 0,1 ${size - strokeWidth/2},${size/2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1, marginBottom: '0px' }}>
        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', lineHeight: 1 }}>
          {percentage}%
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {subLabel || 'COMPLETED'}
        </p>
      </div>
    </div>
  );
};
