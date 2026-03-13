import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterUser from './pages/RegisterUser';
import RegisterSchool from './pages/RegisterSchool';
import Dashboard from './pages/Dashboard';
import ChildProfile from './pages/ChildProfile';
import { HealthProvider } from './context/HealthContext';
import type { ReactNode } from 'react';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('school_token');
  return token ? children : <Navigate to="/" />;
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
      </Routes>
    </Router>
  );
}

export default App;
