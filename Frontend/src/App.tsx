import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterUser from './pages/RegisterUser';
import RegisterSchool from './pages/RegisterSchool';
import Dashboard from './pages/Dashboard';
import ChildProfile from './pages/ChildProfile';
import ParentLogin from './pages/ParentLogin';
import ChildSelection from './pages/ChildSelection';
import ParentDashboard from './pages/ParentDashboard';
import EmergencyAccess from './pages/EmergencyAccess';
import CardView from './pages/CardView';
import { HealthProvider } from './context/HealthContext';
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
      </Routes>
    </Router>
  );
}

export default App;
