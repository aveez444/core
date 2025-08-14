import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UpgradeModalProvider } from './contexts/UpgradeModalContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import MakeCalls from './pages/MakeCalls';
import ScheduleCalls from './pages/ScheduleCalls';
import History from './pages/History';
import Agents from './pages/Agents';
import BuyNumbers from './pages/BuyNumbers';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Notifications from './pages/Notifications';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <UpgradeModalProvider>
            <Router>
            <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route 
                path="/app" 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="make-calls" element={<MakeCalls />} />
                <Route path="schedule-calls" element={<ScheduleCalls />} />
                <Route path="history" element={<History />} />
                <Route path="agents" element={<Agents />} />
                <Route path="buy-numbers" element={<BuyNumbers />} />
                <Route path="profile" element={<Profile />} />
                <Route path="subscription" element={<Subscription />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Global toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              className="toast-container"
              toastClassName="toast-message"
            />
            </div>
            </Router>
          </UpgradeModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
