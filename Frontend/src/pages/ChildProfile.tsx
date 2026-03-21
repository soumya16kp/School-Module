import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHealthContext } from '../context/HealthContext';
import { cardService } from '../services/api';
import {
  User,
  CheckCircle2,
  Info,
  Calendar,
  ArrowLeft,
  Phone,
  Mail,
  GraduationCap,
  Stethoscope,
  Droplets,
  Apple,
  BrainCircuit,
  Syringe,
  Eye,
  CreditCard,
  Edit,
  Activity,
  HeartPulse,
  Download,
  Plus,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Shield,
  BarChart3,
  Heart,
  Award,
  ShieldCheck as ShieldCheckIcon,
  Activity as ActivityIcon,
  LineChart as LineChartIcon,
  ChevronRight,
} from 'lucide-react';
import { getEventTypesForClass } from '../config/ageBands';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== PREMIUM COMPONENTS ====================

const AnimatedGradientBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-purple-50/40" />
    <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-0 -right-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-cyan-300/10 rounded-full blur-3xl" />
  </div>
);

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; glow?: boolean }> = ({ 
  children, className = '', glow = false 
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`
      relative overflow-hidden rounded-2xl backdrop-blur-xl
      bg-white/90 border border-white/50 shadow-xl
      ${glow ? 'shadow-[0_0_40px_-15px_rgba(139,92,246,0.4)]' : 'shadow-lg'}
      ${className}
    `}
  >
    <div className="absolute inset-0 bg-linear-to-br from-white/40 to-transparent pointer-events-none" />
    {children}
  </motion.div>
);

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color?: string;
  subtitle?: string;
}> = ({ title, value, icon: Icon, trend, color = 'purple', subtitle }) => {
  const trendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
  const trendColor = trend && trend > 0 ? 'text-emerald-500' : trend && trend < 0 ? 'text-rose-500' : 'text-gray-400';
  
  const colorMap: Record<string, string> = {
    purple: 'from-purple-500/10 to-purple-500/5 text-purple-600',
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-600',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
    >
      <div className={`absolute inset-0 bg-linear-to-br ${colorMap[color].split(' ')[0]} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-linear-to-br ${colorMap[color]} shadow-sm`}>
          <Icon size={22} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-4">
          {React.createElement(trendIcon, { size: 12, className: trendColor })}
          <span className={`text-xs font-medium ${trendColor}`}>{Math.abs(trend)}%</span>
          <span className="text-xs text-gray-400">vs last year</span>
        </div>
      )}
    </motion.div>
  );
};

const ProfileDetail: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ 
  icon: Icon, label, value 
}) => (
  <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 group cursor-pointer">
    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-purple-100 to-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  </motion.div>
);

const BMIGauge: React.FC<{ bmi: number; category: string }> = ({ bmi, category }) => {
  const getPosition = () => {
    const min = 15, max = 35;
    return Math.min(Math.max(((bmi - min) / (max - min)) * 100, 0), 100);
  };

  const getGradient = () => {
    if (bmi < 18.5) return 'from-blue-400 to-cyan-400';
    if (bmi < 25) return 'from-emerald-400 to-green-400';
    if (bmi < 30) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-rose-400';
  };

  return (
    <div className="relative pt-6">
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${getPosition()}%` }}
          transition={{ duration: 1 }}
          className={`h-full bg-linear-to-r ${getGradient()} rounded-full`}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
        <span>Obese</span>
      </div>
      <div className="mt-4 text-center">
        <span className={`text-sm font-semibold ${
          bmi < 18.5 ? 'text-blue-600' : bmi < 25 ? 'text-emerald-600' : bmi < 30 ? 'text-amber-600' : 'text-rose-600'
        }`}>
          {category} • BMI: {bmi.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  icon: React.ElementType;
  status: string;
  details: string;
  referral?: string | null;
  year: string;
  date: string;
  delay: number;
}> = ({ title, icon: Icon, status, details, referral, year, date, delay }) => {
  const isGood = status === 'Done' || status === 'Present' || status === 'Completed';
  const isAbsent = status === 'Absent';
  
  const getColors = () => {
    if (isGood) return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' };
    if (isAbsent) return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' };
    return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' };
  };

  const colors = getColors();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-md border border-gray-100 hover:shadow-xl transition-all"
    >
      <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${colors.iconBg} ${colors.iconColor}`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-400">{year} • {date}</p>
          </div>
        </div>
        <div className="mb-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-600">{details}</p>
        {referral && (
          <div className="mt-3 p-2 bg-rose-50 rounded-lg border border-rose-100">
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={12} /> {referral}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

// ==================== MAIN COMPONENT ====================

const ChildProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { child, healthRecords, loading, fetchChildData, addHealthRecord, updateHealthRecord, toggleAttendance } = useHealthContext();

  const PREDEFINED_PROGRAMS = [
    { type: 'GENERAL_CHECKUP', title: 'Physical Check-up', icon: Stethoscope },
    { type: 'MENTAL_WELLNESS', title: 'Mental Wellness', icon: BrainCircuit },
    { type: 'NUTRITION_SESSION', title: 'Nutrition Session', icon: Apple },
    { type: 'FIRE_DRILL', title: 'Fire Safety Drill', icon: Shield },
    { type: 'CPR_FIRST_AID_TRAINING', title: 'First Aid Training', icon: Heart },
    { type: 'HYGIENE_WELLNESS', title: 'Hygiene & Wellness', icon: Droplets },
    { type: 'IMMUNIZATION_DEWORMING', title: 'Immunization', icon: Syringe },
    { type: 'VISION_SCREENING', title: 'Vision Screening', icon: Eye },
    { type: 'DENTAL_SCREENING', title: 'Dental Screening', icon: Award },
    { type: 'BMI_ASSESSMENT', title: 'BMI Assessment', icon: Activity },
    { type: 'HPV_AWARENESS', title: 'HPV Awareness', icon: Sparkles },
  ];

  const userStr = localStorage.getItem('school_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || '';

  const [showAddForm, setShowAddForm] = useState(false);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [idCardLoading, setIdCardLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'history'>('overview');

  const displayRecords = healthRecords.length > 0
    ? healthRecords
    : [{
        id: -1,
        academicYear: '2024-2025',
        checkupDate: null,
        height: null,
        weight: null,
        bmi: null,
        bmiCategory: null,
        dentalCheckup: 'Pending',
        dentalCariesIndex: null,
        dentalOverallHealth: 'Pending',
        dentalReferralNeeded: false,
        dentalReferralReason: '',
        dentalNotes: '',
        eyeCheckup: 'Pending',
        eyeVisionLeft: 'Pending',
        eyeVisionRight: 'Pending',
        visionOverall: 'Pending',
        visionReferralNeeded: false,
        visionNotes: '',
      }];

  const uniqueYears = Array.from(new Set(displayRecords.map(r => r.academicYear))).sort().reverse();

  useEffect(() => {
    if (displayRecords.length > 0 && !selectedYear) {
      setSelectedYear(displayRecords[displayRecords.length - 1].academicYear);
    }
  }, [displayRecords]);

  const currentRecord = displayRecords.find(r => r.academicYear === selectedYear) || displayRecords[displayRecords.length - 1];

  const deriveBmiAndCategory = (record: any) => {
    if (!record) return { bmiValue: null, bmiCategory: null };
    let bmiValue: number | null = record.bmi ?? null;
    if ((bmiValue === null || bmiValue === undefined) && record.height && record.weight) {
      const hMeters = record.height / 100;
      if (hMeters > 0) {
        const computed = record.weight / (hMeters * hMeters);
        bmiValue = Number.isFinite(computed) ? parseFloat(computed.toFixed(2)) : null;
      }
    }
    let bmiCategory: string | null = record.bmiCategory ?? null;
    if (!bmiCategory && bmiValue != null && Number.isFinite(bmiValue)) {
      if (bmiValue < 18.5) bmiCategory = 'Underweight';
      else if (bmiValue < 25) bmiCategory = 'Normal';
      else if (bmiValue < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
    }
    return { bmiValue, bmiCategory };
  };

  const { bmiValue, bmiCategory } = deriveBmiAndCategory(currentRecord);

  const emptyForm = {
    academicYear: '2024-2025',
    checkupDate: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    bmiStatus: 'Absent',
    eyeStatus: 'Absent',
    dentalStatus: 'Absent',
    dentalCheckup: 'Pending',
    dentalCariesIndex: '',
    dentalOverallHealth: 'Healthy',
    dentalReferralNeeded: false,
    dentalReferralReason: '',
    dentalNotes: '',
    dentalHygieneScore: 'Good',
    eyeCheckup: 'Pending',
    eyeVisionLeft: '6/6',
    eyeVisionRight: '6/6',
    visionOverall: 'Normal',
    visionReferralNeeded: false,
    visionNotes: '',
    colorBlindness: false,
    eyeSquint: false,
    bmiPercentile: '',
    bloodPressure: '',
    pulse: '',
    temperature: '',
    respiratoryRate: '',
    pigeonChest: false,
    enlargedTonsils: false,
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!id) return;
    fetchChildData(parseInt(id)).catch((err: any) => {
      if (err?.response?.status === 403) {
        navigate('/dashboard', { state: { fromChild403: true, message: "You don't have access to this record." } });
      }
    });
  }, [id, navigate]);

  const openEditForm = () => {
    setFormData({
      academicYear: currentRecord.academicYear,
      checkupDate: currentRecord.checkupDate ? new Date(currentRecord.checkupDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      height: currentRecord.height || '',
      weight: currentRecord.weight || '',
      bmiStatus: currentRecord.bmiStatus || 'Absent',
      eyeStatus: currentRecord.eyeStatus || 'Absent',
      dentalStatus: currentRecord.dentalStatus || 'Absent',
      dentalCheckup: currentRecord.dentalCheckup || 'Pending',
      dentalCariesIndex: currentRecord.dentalCariesIndex || '',
      dentalOverallHealth: currentRecord.dentalOverallHealth || 'Healthy',
      dentalReferralNeeded: currentRecord.dentalReferralNeeded || false,
      dentalReferralReason: currentRecord.dentalReferralReason || '',
      dentalNotes: currentRecord.dentalNotes || '',
      dentalHygieneScore: currentRecord.dentalHygieneScore || 'Good',
      eyeCheckup: currentRecord.eyeCheckup || 'Pending',
      eyeVisionLeft: currentRecord.eyeVisionLeft || '6/6',
      eyeVisionRight: currentRecord.eyeVisionRight || '6/6',
      visionOverall: currentRecord.visionOverall || 'Normal',
      visionReferralNeeded: currentRecord.visionReferralNeeded || false,
      visionNotes: currentRecord.visionNotes || '',
      colorBlindness: currentRecord.colorBlindness || false,
      eyeSquint: currentRecord.eyeSquint || false,
      bmiPercentile: currentRecord.bmiPercentile || '',
      bloodPressure: currentRecord.bloodPressure || '',
      pulse: currentRecord.pulse || '',
      temperature: currentRecord.temperature || '',
      respiratoryRate: currentRecord.respiratoryRate || '',
      pigeonChest: currentRecord.pigeonChest || false,
      enlargedTonsils: currentRecord.enlargedTonsils || false,
    });
    setReportFile(null);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const hNum = parseFloat(formData.height);
    const wNum = parseFloat(formData.weight);

    let bmi = null;
    if (formData.bmiStatus === 'Present') {
      if (!Number.isFinite(hNum) || hNum < 40 || hNum > 220) {
        alert('Please enter a valid height between 40 cm and 220 cm.');
        return;
      }
      if (!Number.isFinite(wNum) || wNum < 5 || wNum > 200) {
        alert('Please enter a valid weight between 5 kg and 200 kg.');
        return;
      }
      const h = hNum / 100;
      bmi = (wNum / (h * h)).toFixed(2);
    }

    const fd = new FormData();
    Object.keys(formData).forEach(key => {
      fd.append(key, (formData as any)[key]);
    });
    if (bmi !== null) fd.append('bmi', bmi);
    if (reportFile) fd.append('reportFile', reportFile);

    try {
      const isEditing = currentRecord && currentRecord.id !== -1 && currentRecord.academicYear === formData.academicYear;
      if (isEditing) {
        await updateHealthRecord(parseInt(id), currentRecord.id, fd);
      } else {
        await addHealthRecord(parseInt(id), fd);
      }
      setShowAddForm(false);
      setReportFile(null);
      setFormData(emptyForm);
    } catch (error) {
      console.error(error);
      alert('Failed to save record');
    }
  };

  const openIdCard = async () => {
    if (!id) return;
    setIdCardLoading(true);
    try {
      const token = await cardService.ensureToken(parseInt(id));
      window.open(`${window.location.origin}/card/${token}`, '_blank');
    } catch (err) {
      alert('Failed to generate ID card');
    } finally {
      setIdCardLoading(false);
    }
  };

  const radarData = [
    { subject: 'BMI', value: bmiValue ? Math.min((bmiValue / 25) * 100, 100) : 0 },
    { subject: 'Dental', value: currentRecord.dentalOverallHealth === 'Healthy' ? 100 : currentRecord.dentalOverallHealth === 'Under Observed' ? 50 : 20 },
    { subject: 'Vision', value: currentRecord.visionOverall === 'Normal' ? 100 : currentRecord.visionOverall === 'Screening Needed' ? 50 : 20 },
    { subject: 'Hygiene', value: currentRecord.dentalHygieneScore === 'Good' ? 100 : currentRecord.dentalHygieneScore === 'Fair' ? 60 : 30 },
    { subject: 'Growth', value: 85 }, // Mock value as growth isn't calculated yet
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <LoadingSpinner label="Loading Profile..." />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">Child Not Found</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
          Back to Dashboard
        </button>
      </div>
    );
  }


  return (
    <>
      <AnimatedGradientBackground />
      <div className="relative min-h-screen pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => navigate('/dashboard')} className="group inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Health Profile
                </h1>
                <p className="text-gray-500 mt-2">Comprehensive health tracking and insights</p>
              </div>
              <div className="flex gap-3">
                {['SCHOOL_ADMIN', 'PRINCIPAL', 'WOMBTO18_OPS'].includes(role) && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                    onClick={() => {
                      const latestYear = uniqueYears[0] || '2024-2025';
                      if (currentRecord.academicYear !== latestYear) {
                         alert(`You can only edit records for the current session (${latestYear}).`);
                         return;
                      }
                      openEditForm();
                    }}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-700 font-semibold hover:border-purple-300 hover:bg-purple-50/50 transition-all flex items-center gap-2">
                    <Edit size={18} /> Edit
                  </motion.button>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { 
                    const latestYear = uniqueYears[0] || '2024-2025';
                    if (selectedYear !== latestYear) {
                      alert(`Please switch to current session (${latestYear}) to add/update this session's record.`);
                      return;
                    }
                    if (showAddForm) {
                      setShowAddForm(false);
                    } else {
                      setFormData({ ...emptyForm, academicYear: latestYear }); 
                      setShowAddForm(true); 
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all flex items-center gap-2">
                  {showAddForm ? <X size={18} /> : <Plus size={18} />}
                  {showAddForm ? 'Cancel' : 'New Session'}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Year Filter */}
          {healthRecords.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-purple-500" />
                <span className="text-sm font-medium text-gray-600">Academic Year:</span>
                <div className="flex gap-2">
                  {uniqueYears.map(year => (
                    <motion.button key={year} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedYear(year)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedYear === year
                          ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                          : 'bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}>
                      {year}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Sparkles size={12} /> Showing data for <span className="font-semibold text-purple-600">{selectedYear}</span>
              </div>
            </div>
          )}

          {/* Recommendations Banner */}
          <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-start gap-3">
            <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              <strong>Class {child.class}-{child.section}:</strong> Recommended screenings –{' '}
              {getEventTypesForClass(child.class).slice(0, 6).map(t => t.replace(/_/g, ' ').toLowerCase()).join(', ')}
              {getEventTypesForClass(child.class).length > 6 && '...'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: ActivityIcon },
              { id: 'metrics', label: 'Health Metrics', icon: BarChart3 },
              { id: 'history', label: 'History', icon: Calendar },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <div className="flex items-center gap-2">
                  <tab.icon size={16} /> {tab.label}
                </div>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-600 to-indigo-600" />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 xl:col-span-3">
              <GlassCard className="p-0 overflow-hidden sticky top-8">
                <div className="relative h-28 bg-linear-to-br from-purple-600 via-indigo-600 to-indigo-800">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-500">
                      <div className="w-full h-full rounded-2xl bg-linear-to-br from-purple-50 to-indigo-50 flex items-center justify-center border border-gray-100">
                        <span className="text-4xl font-black bg-linear-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          {child.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg">
                      <div className={`rounded-full p-1.5 ${child.status === 'Done' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                        {child.status === 'Done' ? <ShieldCheckIcon size={14} className="text-white" /> : <ActivityIcon size={14} className="text-white" />}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-14 pb-6 px-5 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{child.name}</h2>
                  <div className="flex flex-col items-center gap-1 mb-5">
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 uppercase tracking-wider">{child.registrationNo}</span>
                    <span className="text-xs text-gray-400 font-medium">{child.gender} • {selectedYear} Session</span>
                  </div>
                  <button onClick={openIdCard} disabled={idCardLoading}
                    className="w-full mb-6 py-2 pb-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 hover:border-purple-200 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <CreditCard size={16} /> {idCardLoading ? 'Generating...' : 'Identity Card'}
                  </button>
                  <div className="space-y-4 text-left border-t border-gray-100 pt-5">
                    <ProfileDetail icon={GraduationCap} label="Standard" value={`${child.class} - ${child.section}`} />
                    <ProfileDetail icon={Phone} label="Primary" value={child.mobile} />
                    {child.emailId && <ProfileDetail icon={Mail} label="Email Address" value={child.emailId} />}
                    {child.fatherName && <ProfileDetail icon={User} label="Father" value={child.fatherName} />}
                    {child.motherName && <ProfileDetail icon={User} label="Mother" value={child.motherName} />}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <StatCard title="BMI" value={bmiValue?.toFixed(1) || '--'} icon={Activity} trend={-3} color="blue" subtitle={bmiCategory?.toLowerCase() || 'N/A'} />
                      <StatCard title="Growth Rate" value="+2.3" icon={TrendingUp} trend={5} color="emerald" subtitle="cm/year" />
                    </div>

                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <ActivityIcon size={20} className="text-purple-500" /> Health Radar
                      </h3>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData} outerRadius="80%">
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Radar
                              name="Status"
                              dataKey="value"
                              stroke="#8b5cf6"
                              fill="#8b5cf6"
                              fillOpacity={0.4}
                              strokeWidth={3}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                padding: '12px'
                              }} 
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>

                    {/* ── Wellness Overview Cards ── */}
                    <div>
                      <h3 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-500" /> Wellness Overview
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                          {
                            key: 'immunization',
                            title: 'Immunization',
                            icon: Syringe,
                            eventType: 'IMMUNIZATION_DEWORMING',
                            gradient: 'from-violet-500 to-purple-600',
                            lightBg: 'from-violet-50 to-purple-50',
                            border: 'border-violet-100',
                            ring: 'ring-violet-200',
                            desc: 'Vaccines & deworming',
                          },
                          {
                            key: 'hygiene',
                            title: 'Hygiene & Wellness',
                            icon: Droplets,
                            eventType: 'HYGIENE_WELLNESS',
                            gradient: 'from-cyan-500 to-teal-600',
                            lightBg: 'from-cyan-50 to-teal-50',
                            border: 'border-cyan-100',
                            ring: 'ring-cyan-200',
                            desc: 'Personal hygiene sessions',
                          },
                          {
                            key: 'nutrition',
                            title: 'Nutrition',
                            icon: Apple,
                            eventType: 'NUTRITION_SESSION',
                            gradient: 'from-emerald-500 to-green-600',
                            lightBg: 'from-emerald-50 to-green-50',
                            border: 'border-emerald-100',
                            ring: 'ring-emerald-200',
                            desc: 'Diet & nutrition counseling',
                          },
                          {
                            key: 'mental',
                            title: 'Mental Wellness',
                            icon: BrainCircuit,
                            eventType: 'MENTAL_WELLNESS',
                            gradient: 'from-rose-500 to-pink-600',
                            lightBg: 'from-rose-50 to-pink-50',
                            border: 'border-rose-100',
                            ring: 'ring-rose-200',
                            desc: 'Emotional & mental health',
                          },
                        ].map((card, idx) => {
                          // Pull status from wellnessStatus OR activityHistory
                          const wsStatus: string = (child?.wellnessStatus as any)?.[card.key]?.status || '';
                          const historyEntry = (child as any)?.activityHistory?.find((h: any) => h.type === card.eventType);
                          const status = wsStatus || historyEntry?.status || 'Not Scheduled';
                          const lastDate: string | null = (child?.wellnessStatus as any)?.[card.key]?.lastDate
                            || historyEntry?.date
                            || null;

                          const isDone = ['Attended', 'Done', 'Present'].includes(status);
                          const isScheduled = status === 'Scheduled';
                          const isAbsent = ['Not Attended', 'Absent'].includes(status);

                          const statusLabel = isDone ? 'Attended' : isScheduled ? 'Scheduled' : isAbsent ? 'Absent' : 'Pending';
                          const statusColor = isDone
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : isScheduled
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : isAbsent
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200';
                          const fillPct = isDone ? 100 : isScheduled ? 60 : isAbsent ? 20 : 10;
                          const fillColor = isDone
                            ? 'bg-emerald-500'
                            : isScheduled
                            ? 'bg-blue-500'
                            : isAbsent
                            ? 'bg-rose-400'
                            : 'bg-amber-400';

                          const Icon = card.icon;

                          return (
                            <motion.div
                              key={card.key}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
                              whileHover={{ y: -4, scale: 1.02 }}
                              onClick={async () => {
                                if (!id) return;
                                try {
                                  await toggleAttendance(parseInt(id), card.eventType, status);
                                } catch (err) {
                                  alert('Failed to update attendance');
                                }
                              }}
                              className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${card.lightBg} border ${card.border} shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                            >
                              {/* Top gradient strip */}
                              <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${card.gradient} rounded-t-2xl`} />

                              <div className="p-5 pt-6">
                                {/* Icon + status row */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className={`p-3 rounded-xl bg-linear-to-br ${card.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                                    <Icon size={20} className="text-white" />
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor}`}>
                                      {statusLabel}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-medium">Click to toggle</span>
                                  </div>
                                </div>

                                {/* Title + description */}
                                <h4 className="text-sm font-bold text-gray-800 mb-0.5">{card.title}</h4>
                                <p className="text-[11px] text-gray-500 mb-4">{card.desc}</p>

                                {/* Last event date */}
                                <div className="flex items-center gap-1.5 mt-2">
                                  <Calendar size={11} className="text-gray-400" />
                                  <span className="text-[10px] text-gray-400">
                                    {lastDate ? `Last: ${new Date(lastDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'no attendance recorded yet'}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <HeartPulse size={20} className="text-purple-500" /> BMI Analysis
                      </h3>
                      {bmiValue ? <BMIGauge bmi={bmiValue} category={bmiCategory || 'Normal'} /> : <p className="text-gray-500">No BMI data available</p>}
                    </GlassCard>

                    {currentRecord && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MetricCard
                          title="Dental Health" icon={Stethoscope} status={currentRecord.dentalStatus || currentRecord.dentalCheckup || 'Pending'}
                          details={`Caries: ${currentRecord.dentalCariesIndex ?? 0} | Hygiene: ${currentRecord.dentalHygieneScore || 'N/A'} | ${currentRecord.dentalOverallHealth || 'N/A'} ${currentRecord.dentalNotes ? `| Notes: ${currentRecord.dentalNotes}` : ''}`}
                          referral={currentRecord.dentalReferralNeeded ? `Referral: ${currentRecord.dentalReferralReason || 'Yes'}` : null}
                          year={currentRecord.academicYear} date={currentRecord.checkupDate ? new Date(currentRecord.checkupDate).toLocaleDateString() : 'N/A'} delay={0.2}
                        />
                        <MetricCard
                          title="Eye Vision" icon={Eye} status={currentRecord.eyeStatus || currentRecord.eyeCheckup || 'Pending'}
                          details={`L: ${currentRecord.eyeVisionLeft || 'N/A'} | R: ${currentRecord.eyeVisionRight || 'N/A'} | ${currentRecord.visionOverall || 'N/A'} ${currentRecord.colorBlindness ? ' | [Color Blind]' : ''} ${currentRecord.eyeSquint ? ' | [Squint]' : ''}`}
                          referral={currentRecord.visionReferralNeeded ? 'Referral needed' : null}
                          year={currentRecord.academicYear} date={currentRecord.checkupDate ? new Date(currentRecord.checkupDate).toLocaleDateString() : 'N/A'} delay={0.3}
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'metrics' && (
                  <motion.div key="metrics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                    {healthRecords.length > 0 && (
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <LineChartIcon size={20} className="text-purple-500" /> Growth Trends
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="h-64">
                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase text-center">Height Progression (cm)</p>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={healthRecords}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="academicYear" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                                <Line type="monotone" dataKey="height" name="Height" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="h-64">
                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase text-center">Weight Progression (kg)</p>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={healthRecords}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="academicYear" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                                <Line type="monotone" dataKey="weight" name="Weight" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </GlassCard>
                    )}
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Calendar size={20} className="text-purple-500" /> Program Participation
                      </h3>
                      <p className="text-xs text-gray-400 mb-6">History of scheduled wellness & safety programs</p>
                      
                      <div className="space-y-3">
                        {(() => {
                          const history = [...(child.activityHistory || [])];
                          // 9 Specific Programs for history
                          const PROGRAM_LIST_9 = [
                            { type: 'BMI_ASSESSMENT', title: 'BMI Assessment', icon: Activity, desc: 'Growth & development tracking' },
                            { type: 'DENTAL_SCREENING', title: 'Dental Screening', icon: Award, desc: 'Oral health assessment' },
                            { type: 'VISION_SCREENING', title: 'Vision Screening', icon: Eye, desc: 'Visual acuity check' },
                            { type: 'GENERAL_CHECKUP', title: 'Physical Check-up', icon: Stethoscope, desc: 'Routine medical screening' },
                            { type: 'FIRE_DRILL', title: 'Fire Safety Drill', icon: Shield, desc: 'Emergency response practice' },
                            { type: 'MENTAL_WELLNESS', title: 'Mental Wellness', icon: BrainCircuit, desc: 'Emotional health status' },
                            { type: 'NUTRITION_SESSION', title: 'Nutrition Session', icon: Apple, desc: 'Dietary habits session' },
                            { type: 'HYGIENE_WELLNESS', title: 'Hygiene & Wellness', icon: Droplets, desc: 'Personal hygieneassessment' },
                            { type: 'IMMUNIZATION_DEWORMING', title: 'Immunization', icon: Syringe, desc: 'Vaccination records' },
                          ];
                          
                          const combined = PROGRAM_LIST_9.map(p => {
                            const found = history.find(h => h.type === p.type);
                            return found ? { ...p, ...found } : { ...p, status: 'Not Scheduled' };
                          });

                          return combined.map((ev: any, idx) => {
                            const isCompleted = ev.status === 'Present' || ev.status === 'Done' || ev.status === 'Attended';
                            const isScheduled = ev.status === 'Scheduled';
                            const isNotScheduled = ev.status === 'Not Scheduled';
                            
                            // Extract values for display
                            let detailsText = '';
                            if (isCompleted && currentRecord) {
                              if (ev.type === 'BMI_ASSESSMENT' && currentRecord.height && currentRecord.weight) {
                                detailsText = `${currentRecord.height}cm / ${currentRecord.weight}kg`;
                              } else if (ev.type === 'DENTAL_SCREENING') {
                                detailsText = `Cavities: ${currentRecord.dentalCariesIndex ?? 0}`;
                              } else if (ev.type === 'VISION_SCREENING') {
                                detailsText = `L: ${currentRecord.eyeVisionLeft || '6/6'} R: ${currentRecord.eyeVisionRight || '6/6'}`;
                              }
                            }

                            return (
                              <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors cursor-pointer group"
                                onClick={() => openEditForm()}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2.5 rounded-xl transition-colors ${
                                    isCompleted ? 'bg-emerald-100 text-emerald-600' : 
                                    isScheduled ? 'bg-blue-100 text-blue-600' : 
                                    'bg-gray-200 text-gray-500'
                                  }`}>
                                    {React.createElement(ev.icon || CheckCircle2, { size: 18 })}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-gray-800 text-sm group-hover:text-purple-600 transition-colors">{ev.title}</p>
                                      {detailsText && (
                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                          {detailsText}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">— {ev.desc}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                      {ev.scheduledAt ? new Date(ev.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (isNotScheduled ? 'Action required' : 'Date pending')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                    isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                    isScheduled ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                    'bg-gray-100 text-gray-600 border-gray-200'
                                  }`}>
                                    {isCompleted ? 'Attended' : ev.status}
                                  </span>
                                  <ChevronRight size={14} className="text-gray-300 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                                </div>
                              </motion.div>
                            );
                          });
                        })()}
                      </div>
                    </GlassCard>

                    {currentRecord?.reportFile && (
                      <div className="flex justify-end">
                        <a href={`http://localhost:5000/uploads/${currentRecord.reportFile}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                          <Download size={16} /> Download Report ({currentRecord.academicYear})
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add/Edit Form Modal */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Plus size={20} className="text-purple-600" /> Add Health Record</h3>
                        <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
                      </div>
                      <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="Academic Year">
                            <input type="text" value={formData.academicYear} disabled className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-gray-500 font-bold" />
                          </FormField>
                          <FormField label="Checkup Date">
                            <input type="date" value={formData.checkupDate} onChange={e => setFormData({ ...formData, checkupDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500" required />
                          </FormField>
                          <FormField label="Height (cm)">
                            <input type="number" step="0.1" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} placeholder="e.g., 145" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500" required />
                          </FormField>
                          <FormField label="Weight (kg)">
                            <input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="e.g., 40" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500" required={formData.bmiStatus === 'Present'} />
                          </FormField>
                          <FormField label="BMI Attendance">
                            <select value={formData.bmiStatus} onChange={e => setFormData({ ...formData, bmiStatus: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500">
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                            </select>
                          </FormField>
                          <FormField label="BMI Percentile">
                            <input type="number" step="0.1" value={formData.bmiPercentile} onChange={e => setFormData({ ...formData, bmiPercentile: e.target.value })} placeholder="e.g. 50" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500" />
                          </FormField>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="Eye Attendance">
                            <select value={formData.eyeStatus} onChange={e => setFormData({ ...formData, eyeStatus: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500">
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                            </select>
                          </FormField>
                          <FormField label="Dental Attendance">
                            <select value={formData.dentalStatus} onChange={e => setFormData({ ...formData, dentalStatus: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500">
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                            </select>
                          </FormField>
                        </div>
                        {formData.dentalStatus === 'Present' && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><Stethoscope size={16} className="text-purple-500" /> Dental Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField label="Dental Status">
                                <select value={formData.dentalCheckup} onChange={e => setFormData({ ...formData, dentalCheckup: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                  <option>Done</option><option>Pending</option><option>Requires Attention</option>
                                </select>
                              </FormField>
                              <FormField label="Overall Health">
                                <select value={formData.dentalOverallHealth} onChange={e => setFormData({ ...formData, dentalOverallHealth: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                  <option>Healthy</option><option>Good</option><option>Fair</option><option>Poor</option><option>Cavities Detected</option><option>Treatment Required</option>
                                </select>
                              </FormField>
                              <FormField label="Hygiene Score">
                                <select value={formData.dentalHygieneScore} onChange={e => setFormData({ ...formData, dentalHygieneScore: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                  <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
                                </select>
                              </FormField>
                              <FormField label="Cavities">
                                <input type="number" min="0" max="32" value={formData.dentalCariesIndex} onChange={e => setFormData({ ...formData, dentalCariesIndex: e.target.value })} placeholder="0" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                              </FormField>
                              <FormField label="Referral Needed?">
                                <select value={formData.dentalReferralNeeded ? 'Yes' : 'No'} onChange={e => setFormData({ ...formData, dentalReferralNeeded: e.target.value === 'Yes' })} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                  <option value="No">No</option><option value="Yes">Yes</option>
                                </select>
                              </FormField>
                            </div>
                            {formData.dentalReferralNeeded && (
                              <FormField label="Referral Reason">
                                <input type="text" value={formData.dentalReferralReason} onChange={e => setFormData({ ...formData, dentalReferralReason: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                              </FormField>
                            )}
                            <FormField label="Dental Notes">
                              <textarea value={formData.dentalNotes} onChange={e => setFormData({ ...formData, dentalNotes: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" rows={2}></textarea>
                            </FormField>
                          </div>
                        )}

                        {formData.eyeStatus === 'Present' && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><Eye size={16} className="text-purple-500" /> Vision Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField label="Eye Status">
                                <select value={formData.eyeCheckup} onChange={e => setFormData({ ...formData, eyeCheckup: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                  <option>Done</option><option>Pending</option><option>Issue Detected</option>
                                </select>
                              </FormField>
                              <FormField label="Overall Vision">
                                <select value={formData.visionOverall} onChange={e => setFormData({ ...formData, visionOverall: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                  <option>Normal</option><option>Good</option><option>Requires Further Eval</option><option>Under Treatment</option>
                                </select>
                              </FormField>
                              <FormField label="Vision Right">
                                <select value={formData.eyeVisionRight} onChange={e => setFormData({ ...formData, eyeVisionRight: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                  <option>6/6</option><option>6/9</option><option>6/12</option><option>6/18</option><option>6/24</option><option>6/36</option><option>6/60</option><option>No Vision</option>
                                </select>
                              </FormField>
                              <FormField label="Vision Left">
                                <select value={formData.eyeVisionLeft} onChange={e => setFormData({ ...formData, eyeVisionLeft: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                  <option>6/6</option><option>6/9</option><option>6/12</option><option>6/18</option><option>6/24</option><option>6/36</option><option>6/60</option><option>No Vision</option>
                                </select>
                              </FormField>
                              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                  <input type="checkbox" checked={formData.colorBlindness} onChange={e => setFormData({...formData, colorBlindness: e.target.checked})} className="rounded text-purple-600" />
                                  <span className="text-sm font-medium text-gray-700">Color Blindness</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                  <input type="checkbox" checked={formData.eyeSquint} onChange={e => setFormData({...formData, eyeSquint: e.target.checked})} className="rounded text-purple-600" />
                                  <span className="text-sm font-medium text-gray-700">Eye Squint</span>
                                </label>
                              </div>
                              <FormField label="Referral Needed?">
                                <select value={formData.visionReferralNeeded ? 'Yes' : 'No'} onChange={e => setFormData({ ...formData, visionReferralNeeded: e.target.value === 'Yes' })} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                  <option value="No">No</option><option value="Yes">Yes</option>
                                </select>
                              </FormField>
                            </div>
                            <FormField label="Vision Notes">
                              <textarea value={formData.visionNotes} onChange={e => setFormData({ ...formData, visionNotes: e.target.value })} placeholder="Any specific observations..." className="w-full rounded-lg border border-gray-300 px-3 py-2" rows={2}></textarea>
                            </FormField>
                          </div>
                        )}

                        {/* General Health Section */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2"><ActivityIcon size={16} className="text-purple-500" /> Vitals & Assessment</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Blood Pressure">
                              <input type="text" value={formData.bloodPressure} onChange={e => setFormData({ ...formData, bloodPressure: e.target.value })} placeholder="e.g. 120/80" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                            </FormField>
                            <FormField label="Pulse (bpm)">
                              <input type="number" value={formData.pulse} onChange={e => setFormData({ ...formData, pulse: e.target.value })} placeholder="e.g. 72" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                            </FormField>
                            <FormField label="Temperature (°F)">
                              <input type="number" step="0.1" value={formData.temperature} onChange={e => setFormData({ ...formData, temperature: e.target.value })} placeholder="e.g. 98.6" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                            </FormField>
                            <FormField label="Resp. Rate (bpm)">
                              <input type="number" value={formData.respiratoryRate} onChange={e => setFormData({ ...formData, respiratoryRate: e.target.value })} placeholder="e.g. 16" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                            </FormField>
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                <input type="checkbox" checked={formData.pigeonChest} onChange={e => setFormData({ ...formData, pigeonChest: e.target.checked })} className="rounded text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Pigeon Chest</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                <input type="checkbox" checked={formData.enlargedTonsils} onChange={e => setFormData({ ...formData, enlargedTonsils: e.target.checked })} className="rounded text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Enlarged Tonsils</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <FormField label="Medical Report">
                          <input type="file" onChange={e => setReportFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                        </FormField>
                        <div className="flex gap-3 pt-4">
                          <button type="submit" className="flex-1 py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all">Save Record</button>
                          <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChildProfile;