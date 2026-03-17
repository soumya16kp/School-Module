import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  percentage: number;
  pendingPercentage?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  subLabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  pendingPercentage = 0,
  size = 180,
  strokeWidth = 16,
  color = '#10b981', // Emerald 500 for Done
  subLabel
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semi-circle circumference
  
  // Offset calculation: circumference is the full arc length.
  // percentage / 100 * circumference is the length of the segment.
  const doneLength = (percentage / 100) * circumference;
  
  // To stack them:
  // Done starts from 0 (left)
  // Pending starts from Done end
  
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
        
        {/* Pending Arc (Drawn below Done or after depending on design) */}
        {/* We'll draw total progress (Done + Pending) in Amber, then Done in Emerald on top */}
        {(percentage + pendingPercentage) > 0 && (
          <motion.path
            d={`M ${strokeWidth/2},${size/2} A ${radius},${radius} 0 0,1 ${size - strokeWidth/2},${size/2}`}
            fill="none"
            stroke="#f59e0b" // Amber 500 for Pending
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - ((percentage + pendingPercentage) / 100) * circumference }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        )}

        {/* Done Arc */}
        {percentage > 0 && (
          <motion.path
            d={`M ${strokeWidth/2},${size/2} A ${radius},${radius} 0 0,1 ${size - strokeWidth/2},${size/2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - doneLength }}
            transition={{ duration: 1, ease: "easeOut" }}
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
