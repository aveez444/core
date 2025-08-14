import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Phone, 
  Clock, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Calendar,
  Target,
  ChevronRight,
  Sparkles,
  Heart,
  Zap,
  PieChart,
  FileText,
  Mic,
  Plus,
  Download,
  Settings,
  TrendingDown,
  Filter,
  Eye,
  Workflow
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, getSubscription } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [showDetailedView, setShowDetailedView] = useState(null); // 'calls', 'contacts', 'agents', null
  const [refreshing, setRefreshing] = useState(false);

  const subscription = getSubscription();

  // Helper function to get plan limits based on plan name
  const getPlanLimits = (planName) => {
    const name = planName?.toLowerCase();
    if (name?.includes('starter')) {
      return { agents_limit: 2, contacts_limit: 500, calls_limit: 300 };
    }
    if (name?.includes('business')) {
      return { agents_limit: 4, contacts_limit: 1000, calls_limit: 800 };
    }
    if (name?.includes('enterprise')) {
      return { agents_limit: 10, contacts_limit: 5000, calls_limit: 1200 };
    }
    // Default to basic/starter if no plan or unknown
    return { agents_limit: 2, contacts_limit: 500, calls_limit: 300 };
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getDashboardStats();
      setAnalytics(response);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  // Handle detailed view clicks
  const handleDetailedView = (viewType) => {
    setShowDetailedView(viewType);
  };

  // Handle quick action clicks
  const handleQuickAction = (action) => {
    switch (action) {
      case 'calls':
        navigate('/app/make-calls');
        break;
      case 'schedule':
        navigate('/app/schedule-calls');
        break;
      case 'agents':
        navigate('/app/agents');
        break;
      case 'contacts':
        navigate('/app/make-calls#contact-upload'); // Navigate to upload section with hash
        break;
      default:
        break;
    }
  };

  // Beautiful metric card component with real data
  const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle, clickable = false, onClick }) => {
    const handleClick = (e) => {
      if (clickable && onClick) {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }
    };

    return (
      <div 
        className={`group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
          clickable ? 'cursor-pointer hover:border-indigo-200' : ''
        }`}
        onMouseUp={handleClick}
        style={{ pointerEvents: 'auto', zIndex: 1 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className={`text-3xl font-bold ${color} mb-2`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${
              trend.direction === 'up' ? 'text-green-600' : 
              trend.direction === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {trend.direction === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> :
               trend.direction === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-br ${color.includes('blue') ? 'from-blue-50 to-indigo-50' :
          color.includes('green') ? 'from-green-50 to-emerald-50' :
          color.includes('purple') ? 'from-purple-50 to-violet-50' :
          color.includes('orange') ? 'from-orange-50 to-red-50' :
          'from-gray-50 to-slate-50'
        } group-hover:shadow-md transition-shadow`}>
          <Icon className={`w-6 h-6 ${color.replace('text-', 'text-')}`} />
        </div>
      </div>
      {clickable && (
        <div className="flex items-center text-xs text-gray-400 group-hover:text-indigo-500 transition-colors pt-2 border-t border-gray-100">
          <Eye className="w-3 h-3 mr-1" />
          <span>Click for detailed view</span>
          <ChevronRight className="w-3 h-3 ml-auto" />
        </div>
      )}
    </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-2xl"></div>
                <div>
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-2 w-64"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </div>
            
            {/* Metrics skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-3 w-20"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2 w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
                <div className="h-6 bg-gray-200 rounded mb-8 w-32"></div>
                <div className="space-y-6">
                  {[1,2,3].map(i => (
                    <div key={i}>
                      <div className="h-4 bg-gray-200 rounded mb-3 w-28"></div>
                      <div className="h-3 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="h-6 bg-gray-200 rounded mb-6 w-32"></div>
                <div className="space-y-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Dashboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchAnalyticsData}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Detailed view component
  const DetailedView = ({ type, onClose }) => {
    const getViewData = () => {
      switch (type) {
        case 'calls':
          return {
            title: 'Call Analytics',
            icon: Phone,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            data: [
              { label: 'Total Calls', value: analytics?.calls?.total || 0 },
              { label: 'Successful Calls', value: analytics?.calls?.successful || 0 },
              { label: 'Failed Calls', value: analytics?.calls?.failed || 0 },
              { label: 'Success Rate', value: `${analytics?.calls?.success_rate || 0}%` },
              { label: 'Calls Today', value: analytics?.calls?.today || 0 },
              { label: 'Calls This Week', value: analytics?.calls?.this_week || 0 },
              { label: 'Calls This Month', value: analytics?.calls?.this_month || 0 },
            ]
          };
        case 'contacts':
          return {
            title: 'Contact Analytics',
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            data: [
              { label: 'Total Contacts', value: analytics?.contacts?.total || 0 },
              { label: 'Contact Files', value: analytics?.contacts?.total_files || 0 },
              { label: 'Manual Groups', value: analytics?.contacts?.manual_files || 0 },
              { label: 'CSV Uploads', value: analytics?.contacts?.csv_uploads || 0 },
              { label: 'Added This Week', value: analytics?.contacts?.this_week || 0 },
              { label: 'Growth Rate', value: `${analytics?.contacts?.growth_rate || 0}%` },
            ]
          };
        case 'agents':
          return {
            title: 'AI Agent Analytics',
            icon: Mic,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            data: [
              { label: 'Total Agents', value: analytics?.agents?.total || 0 },
              { label: 'Active Agents', value: analytics?.agents?.active || 0 },
              { label: 'Inactive Agents', value: analytics?.agents?.inactive || 0 },
              { label: 'AI Agents', value: analytics?.agents?.ai || 0 },
              { label: 'Local Agents', value: analytics?.agents?.local || 0 },
            ]
          };
        default:
          return null;
      }
    };

    const viewData = getViewData();
    if (!viewData) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${viewData.bgColor}`}>
                <viewData.icon className={`w-6 h-6 ${viewData.color}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{viewData.title}</h1>
                <p className="text-gray-600">Detailed analytics and insights</p>
              </div>
            </div>
          </div>

          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viewData.data.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500 mb-2">{item.label}</p>
                  <p className={`text-3xl font-bold ${viewData.color} mb-2`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Features */}
          <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Advanced Features Coming Soon</h3>
              <p className="text-gray-600">Charts, filters, export options, and more detailed insights are on the way!</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If showing detailed view, render it
  if (showDetailedView) {
    return <DetailedView type={showDetailedView} onClose={() => setShowDetailedView(null)} />;
  }

  // If no analytics data yet, show placeholder
  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your dashboard...</h2>
            <p className="text-gray-600">Getting your analytics ready</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Beautiful Header with Actions */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {greeting}, {user?.first_name || user?.username || 'there'}!
                </h1>
                <p className="text-gray-600 text-lg">Here's your CallGenie analytics dashboard</p>
                {analytics?.last_updated && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last updated: {new Date(analytics.last_updated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Activity className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button 
                onClick={() => handleQuickAction('agents')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Agent
              </button>
            </div>
          </div>
        </div>

        {/* Beautiful Metrics with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            title="Total Calls"
            value={analytics.calls?.total?.toLocaleString() || '0'}
            subtitle={`Success rate: ${analytics.calls?.success_rate || 0}%`}
            icon={Phone}
            color="text-blue-600"
            trend={analytics.calls?.total > 0 ? {
              direction: analytics.calls.successful > analytics.calls.failed ? 'up' : 'down',
              value: `${analytics.calls.successful} successful`
            } : null}
            clickable
            onClick={() => handleDetailedView('calls')}
          />
          <MetricCard
            title="Total Contacts"
            value={analytics.contacts?.total?.toLocaleString() || '0'}
            subtitle={`${analytics.contacts?.total_files || 0} contact files`}
            icon={Users}
            color="text-green-600"
            trend={analytics.contacts?.growth_rate ? {
              direction: analytics.contacts.growth_rate > 0 ? 'up' : analytics.contacts.growth_rate < 0 ? 'down' : 'neutral',
              value: `${analytics.contacts.growth_rate > 0 ? '+' : ''}${analytics.contacts.growth_rate}% this week`
            } : null}
            clickable
            onClick={() => handleDetailedView('contacts')}
          />
          <MetricCard
            title="AI Agents"
            value={analytics.agents?.total?.toLocaleString() || '0'}
            subtitle={`${analytics.agents?.active || 0} active agents`}
            icon={Mic}
            color="text-purple-600"
            trend={analytics.agents?.total > 0 ? {
              direction: 'up',
              value: `${analytics.agents.active || 0} AI agents`
            } : null}
            clickable
            onClick={() => handleDetailedView('agents')}
          />
          <MetricCard
            title="This Week"
            value={analytics.calls?.this_week?.toLocaleString() || '0'}
            subtitle="Calls made this week"
            icon={Zap}
            color="text-orange-600"
            trend={analytics.calls?.this_week > 0 ? {
              direction: 'up',
              value: `${analytics.calls.today || 0} today`
            } : null}
            clickable
            onClick={() => handleDetailedView('calls')}
          />
        </div>

        {/* Usage & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Usage Overview with Real Subscription Data */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Usage Overview</h3>
                  {analytics.subscription?.plan_name && (
                    <p className="text-sm text-gray-500">{analytics.subscription.plan_name} Plan</p>
                  )}
                </div>
              </div>
              {analytics.subscription?.days_remaining && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Plan expires in</p>
                  <p className="text-lg font-bold text-indigo-600">{analytics.subscription.days_remaining} days</p>
                </div>
              )}
            </div>
            
            <div className="space-y-8">
              {/* Calls Progress with Real Data */}
              {analytics.subscription && (
                <div className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700">Monthly Calls</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {analytics.subscription.calls_used?.toLocaleString() || 0}/{analytics.subscription.calls_limit?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${Math.min(
                          analytics.subscription.calls_limit > 0 
                            ? (analytics.subscription.calls_used / analytics.subscription.calls_limit) * 100 
                            : 0, 
                          100
                        )}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {analytics.subscription.calls_remaining || 0} calls remaining this month
                  </div>
                </div>
              )}
              
              {/* Contacts Progress with Real Data */}
              <div className="relative">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">Contacts Managed</span>
                  <span className="text-sm font-bold text-green-600">
                    {analytics.contacts?.total?.toLocaleString() || 0}/{(analytics.subscription?.contacts_limit || getPlanLimits(analytics.subscription?.plan_name).contacts_limit)?.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${Math.min(
                        (analytics.contacts?.total || 0) / (analytics.subscription?.contacts_limit || getPlanLimits(analytics.subscription?.plan_name).contacts_limit) * 100, 
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {((analytics.contacts?.total || 0) / (analytics.subscription?.contacts_limit || getPlanLimits(analytics.subscription?.plan_name).contacts_limit) * 100).toFixed(1)}% of contact limit
                </div>
              </div>

              {/* Success Rate with Real Data */}
              {analytics.calls?.total > 0 && (
                <div className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700">Call Success Rate</span>
                    <span className="text-sm font-bold text-purple-600">
                      {analytics.calls.success_rate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-violet-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${analytics.calls.success_rate}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {analytics.calls.successful} successful out of {analytics.calls.total} total calls
                  </div>
                </div>
              )}
              
              {/* Agent Utilization */}
              {analytics.agents?.total > 0 && (
                <div className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700">Agent Slots</span>
                    <span className="text-sm font-bold text-orange-600">
                      {analytics.agents.total}/{analytics.subscription?.agents_limit || getPlanLimits(analytics.subscription?.plan_name).agents_limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${Math.min(
                          analytics.agents.total / (analytics.subscription?.agents_limit || getPlanLimits(analytics.subscription?.plan_name).agents_limit) * 100, 
                          100
                        )}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {analytics.agents.active} active, {analytics.agents.inactive || 0} inactive agents
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity with Real Data */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Recent Activity
              </h3>
              <span className="text-xs text-gray-400">
                {analytics.recent_activities?.length || 0} recent items
              </span>
            </div>
            
            {analytics.recent_activities && analytics.recent_activities.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {analytics.recent_activities.slice(0, 8).map((activity, index) => {
                  const getActivityIcon = (type) => {
                    switch (type) {
                      case 'call': return Phone;
                      case 'agent': return Mic;
                      case 'contact_file': return FileText;
                      default: return Activity;
                    }
                  };
                  
                  const getActivityColor = (status) => {
                    switch (status?.toLowerCase()) {
                      case 'completed':
                      case 'success':
                        return 'text-green-600 bg-green-50';
                      case 'failed':
                      case 'rejected':
                        return 'text-red-600 bg-red-50';
                      case 'active':
                        return 'text-blue-600 bg-blue-50';
                      default:
                        return 'text-gray-600 bg-gray-50';
                    }
                  };
                  
                  const IconComponent = getActivityIcon(activity.type);
                  const colorClass = getActivityColor(activity.status);
                  
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`p-2 rounded-full ${colorClass}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {activity.details}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                        {activity.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent activity</p>
                <p className="text-gray-400 text-xs">Activity will appear here as you use CallGenie</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Beautiful and Functional */}
        <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                <Workflow className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
            </div>
            <p className="text-sm text-gray-500">Get started with common tasks</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => handleQuickAction('calls')}
              className="group flex flex-col items-center gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:shadow-lg transition-shadow">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 mb-1">Make Call</p>
                <p className="text-sm text-gray-500">Start calling with your agents</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('schedule')}
              className="group flex flex-col items-center gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white group-hover:shadow-lg transition-shadow">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 mb-1">Schedule Call</p>
                <p className="text-sm text-gray-500">Schedule calls for later</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('contacts')}
              className="group flex flex-col items-center gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white group-hover:shadow-lg transition-shadow">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 mb-1">Upload CSV</p>
                <p className="text-sm text-gray-500">Import contact lists</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
