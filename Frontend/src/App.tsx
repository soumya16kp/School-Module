import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterUser from './pages/RegisterUser';
import RegisterSchool from './pages/RegisterSchool';
import Dashboard from './pages/Dashboard';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
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
      </Routes>
    </Router>
  );
}

export default App;
