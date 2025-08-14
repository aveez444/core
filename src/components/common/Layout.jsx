import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, FileText, LayoutDashboard, X, Bell, Settings, ChevronDown, Phone, Activity, Bot, Shield, Clock, BarChart3, Crown, ExternalLink, Check, Calendar, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useUpgradeModal } from '../../contexts/UpgradeModalContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../ui/LoadingSpinner';
import NotificationDropdown from './NotificationDropdown';
import logo from '../../assets/logo.png';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sessionWarningShown, setSessionWarningShown] = useState(false);
  
  const { 
    user, 
    logout, 
    isLoading,
    getSubscription,
    canAccessFeature,
    sessionTimeRemaining,
    updateLastActivity
  } = useAuth();
  
  const { unreadCount } = useNotifications();
  const { openUpgradeModal } = useUpgradeModal();

  // Session timeout warning
  useEffect(() => {
    const checkSessionTimeout = () => {
      const timeLeft = sessionTimeRemaining();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      if (timeLeft > 0 && timeLeft <= fiveMinutes && !sessionWarningShown) {
        setSessionWarningShown(true);
        toast.warning(
          `Your session will expire in ${Math.ceil(timeLeft / 60000)} minutes. Please save your work.`,
          {
            autoClose: 10000,
            onClose: () => setSessionWarningShown(false)
          }
        );
      }
    };
    
    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [sessionTimeRemaining, sessionWarningShown]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  const subscription = getSubscription();
  const displayName = user?.first_name || user?.username || 'User';
  const userEmail = user?.email || 'user@example.com';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="px-6 py-3 border-b border-indigo-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center justify-center w-full">
              <img src={logo} alt="CallGenie" className="w-32 h-32 rounded-lg mx-auto" />
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-indigo-800 text-indigo-300 hover:text-white transition-colors absolute right-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="pt-1 px-4 pb-4 space-y-1">
          <div className="mb-4">
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-3">Main Menu</p>
            
            <Link
              to="/app"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-1 rounded-lg transition-all duration-200 group ${
                currentPath === '/app' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                  : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
              {currentPath === '/app' && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
            <Link
              to="/app/make-calls"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                currentPath === '/app/make-calls' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                  : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <Phone className="w-5 h-5" />
              <span className="font-medium">Make Calls</span>
              {currentPath === '/app/make-calls' && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
            <Link
              to="/app/schedule-calls"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                currentPath === '/app/schedule-calls' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                  : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Schedule Calls</span>
              {currentPath === '/app/schedule-calls' && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
            <Link
              to="/app/history"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                currentPath === '/app/history' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                  : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Call History</span>
              {currentPath === '/app/history' && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          </div>
          
          <div className="border-t border-indigo-800 pt-4">
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-3">Settings</p>
            <div className="space-y-1">
              <Link
                to="/app/agents"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  currentPath === '/app/agents' 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">Agents</span>
                {currentPath === '/app/agents' && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
              <Link
                to="/app/buy-numbers"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  currentPath === '/app/buy-numbers' 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">Buy Numbers</span>
                {currentPath === '/app/buy-numbers' && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
              <Link
                to="/app/notifications"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  currentPath === '/app/notifications' 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {currentPath === '/app/notifications' && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            </div>
          </div>
          
              {/* Subscription Info */}
              {subscription && (
                <div className="border-t border-indigo-800 pt-6 mt-6">
                  {/* Subscription Details */}
                  <div className="mx-4 mb-4">
                    <div className="bg-indigo-800/50 rounded-lg p-4 border border-indigo-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-white capitalize">
                          {subscription.plan_type} Plan
                        </span>
                        <Shield className="w-5 h-5 text-indigo-300" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-indigo-200">Status:</span>
                          <span className={subscription.days_remaining > 0 ? 'text-green-300' : 'text-red-300'}>
                            {subscription.days_remaining > 0 ? `${subscription.days_remaining} days left` : 'Expired'}
                          </span>
                        </div>
                        {subscription.calls_remaining !== undefined && (
                          <div className="flex justify-between text-xs">
                            <span className="text-indigo-200">Calls:</span>
                            <span className="text-indigo-300">{subscription.calls_remaining} remaining</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Golden Upgrade Button */}
                  <div className="mx-4 mb-4">
                    <button 
                      onClick={openUpgradeModal}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <Crown className="w-5 h-5" />
                      <span>Upgrade Plan</span>
                    </button>
                    <div className="mt-2 text-xs text-center text-indigo-300">
                      Pro & Custom packages available
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </aside>


      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Good morning, {displayName}!</h1>
                  <p className="text-sm text-gray-500">Here's what's happening with your calls today</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationDropdown />
              
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{displayName}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                        {subscription && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                              {subscription.plan_type}
                            </span>
                            {subscription.days_remaining <= 7 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Clock className="w-3 h-3 mr-1" />
                                {subscription.days_remaining}d left
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/app/profile');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" /> Profile
                      </button>
                      {subscription && (
                        <button 
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            navigate('/app/subscription');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4" /> Subscription
                        </button>
                      )}
                      <hr className="my-1" />
                      <button 
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Routed Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
