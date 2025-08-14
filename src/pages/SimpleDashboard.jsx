import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  UserPlus, 
  Phone, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  Play,
  Upload,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SimpleDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {greeting}, {user?.username || user?.first_name || 'User'}! 👋
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Ready to make some calls today?
          </p>
        </div>

        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Phone className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">124</h3>
            <p className="text-gray-600">Calls Made</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">87</h3>
            <p className="text-gray-600">People Reached</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Clock className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">2:45</h3>
            <p className="text-gray-600">Avg Call Time</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            What would you like to do?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/app/make-calls')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Play className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Calling</h3>
              <p className="text-blue-100">Begin making calls right now</p>
            </button>
            
            <button
              onClick={() => navigate('/app/schedule-calls')}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Schedule Calls</h3>
              <p className="text-green-100">Plan your calls for later</p>
            </button>
            
            <button
              onClick={() => navigate('/app/history')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Users className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call History</h3>
              <p className="text-purple-100">Review your past calls</p>
            </button>
            
            <button
              onClick={() => navigate('/app/profile')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 group"
            >
              <div className="flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-2">My Profile</h3>
              <p className="text-orange-100">Update your settings</p>
            </button>
          </div>
        </div>

        {/* Simple Tips */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            💡 Quick Tip
          </h3>
          <p className="text-gray-600 text-center">
            Keep your calls short and friendly. People respond better to conversational approaches!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
