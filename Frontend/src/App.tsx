import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterUser from './pages/RegisterUser';
import RegisterSchool from './pages/RegisterSchool';
import RegisterSchoolThankYou from './pages/RegisterSchoolThankYou';
import Dashboard from './pages/Dashboard';
import ChildProfile from './pages/ChildProfile';
import ParentLogin from './pages/ParentLogin';
import PartnerLogin from './pages/PartnerLogin';
import ChildSelection from './pages/ChildSelection';
import ParentDashboard from './pages/ParentDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import EmergencyAccess from './pages/EmergencyAccess';
import CardView from './pages/CardView';
import UDISEReport from './pages/UDISEReport';
import { HealthProvider } from './context/HealthContext';
import { ToastProvider } from './context/ToastContext';
import { SchoolDataProvider } from './context/SchoolDataContext';
import type { ReactNode } from 'react';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('school_token');
  return token ? children : <Navigate to="/" />;
};

const ParentPrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('parent_token');
  return token ? children : <Navigate to="/parent-login" />;
};

function App() {
  return (
    <ToastProvider>
    <SchoolDataProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route 
          path="/register-school" 
          element={
            <PrivateRoute>
              <RegisterSchool />
            </PrivateRoute>
          } 
        />
        <Route path="/register-school/thank-you" element={<RegisterSchoolThankYou />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/child/:id" 
          element={
            <PrivateRoute>
              <HealthProvider>
                <ChildProfile />
              </HealthProvider>
            </PrivateRoute>
          } 
        />
        
        <Route
          path="/dashboard/udise-report"
          element={
            <PrivateRoute>
              <UDISEReport />
            </PrivateRoute>
          }
        />

        {/* Parent Portal Routes */}
        <Route path="/parent-login" element={<ParentLogin />} />
        <Route 
          path="/parent/children" 
          element={
            <ParentPrivateRoute>
              <ChildSelection />
            </ParentPrivateRoute>
          } 
        />
        <Route 
          path="/parent/dashboard/:id" 
          element={
            <ParentPrivateRoute>
              <ParentDashboard />
            </ParentPrivateRoute>
          } 
        />

        {/* Public Emergency Access Route (no auth - parent approves via QR) */}
        <Route path="/emergency-access/:childId" element={<EmergencyAccess />} />

        {/* Public Health ID Card (no auth - scan QR opens this) */}
        <Route path="/card/:token" element={<CardView />} />

        {/* Partner Portal Routes */}
        <Route path="/partner-login" element={<PartnerLogin />} />
        <Route 
          path="/partner/dashboard" 
          element={
            <PrivateRoute>
              <PartnerDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
    </SchoolDataProvider>
    </ToastProvider>
  );
}

export default App;
