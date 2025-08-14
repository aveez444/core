import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

const UserStatsWidget = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadUserStatistics();
  }, []);

  const loadUserStatistics = async () => {
    try {
      setLoading(true);
      // Fetch from our database, not external services - PRIVACY COMPLIANT
      const data = await apiService.getUserStatistics();
      setStats(data);
    } catch (error) {
      console.error('CallGenie: Failed to load user stats:', error);
      toast.error('Unable to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleDataSync = async () => {
    try {
      setSyncing(true);
      await apiService.syncUserData();
      toast.success('CallGenie: User data sync initiated');
      
      // Reload stats after a brief delay
      setTimeout(() => {
        loadUserStatistics();
      }, 3000);
    } catch (error) {
      toast.error('CallGenie: Unable to sync user data');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📊 CallGenie Usage Statistics
        </h3>
        <button
          onClick={handleDataSync}
          disabled={syncing}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {syncing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Syncing...
            </>
          ) : (
            <>
              🔄 Sync Latest Data
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">
            {stats?.call_statistics?.total_calls || 0}
          </div>
          <div className="text-sm text-blue-600">Total Calls Made</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">
            {stats?.call_statistics?.successful_calls || 0}
          </div>
          <div className="text-sm text-green-600">Successful Calls</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-700">
            {stats?.call_statistics?.failed_calls || 0}
          </div>
          <div className="text-sm text-red-600">Failed Calls</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-700">
            {stats?.call_statistics?.characters_used || 0}
          </div>
          <div className="text-sm text-purple-600">Voice Characters Used</div>
        </div>
      </div>

      {stats?.voice_profile && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">🎤 Voice Profile</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Preferred Voice: <span className="font-medium">{stats.voice_profile.preferred_voice}</span></div>
            <div>Voice Usage: <span className="font-medium">{stats.voice_profile.voice_usage_count} times</span></div>
            <div>Last Updated: <span className="font-medium">
              {stats.voice_profile.last_updated ? new Date(stats.voice_profile.last_updated).toLocaleDateString() : 'Never'}
            </span></div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
        <span>
          📊 Data from CallGenie Database
          {stats?.call_statistics?.last_updated && (
            <> • Last updated: {new Date(stats.call_statistics.last_updated).toLocaleString()}</>
          )}
        </span>
        <span className="text-indigo-600">
          {stats?.service_info?.provider || 'CallGenie Premium AI Platform'}
        </span>
      </div>
    </div>
  );
};

export default UserStatsWidget;
