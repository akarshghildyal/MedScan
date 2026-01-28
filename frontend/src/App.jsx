import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import HospitalDashboard from './pages/HospitalDashboard';
import PatientDashboard from './pages/PatientDashboard';

function ProtectedRoute({ children, allowedRole }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'hospital' ? '/hospital' : '/patient'} replace />;
  }

  return children;
}

function App() {
  const { token, user } = useSelector((state) => state.auth);

  const getHomeRedirect = () => {
    if (!token) return '/login';
    return user?.role === 'hospital' ? '/hospital' : '/patient';
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/hospital"
          element={
            <ProtectedRoute allowedRole="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />
        <Route path="*" element={<Navigate to={getHomeRedirect()} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
