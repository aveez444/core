import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Bot, FileText, Plus, Eye, Trash2, Play, Square, AlertCircle, CheckCircle, Timer, Loader2, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';

const ScheduleCalls = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  
  // Form state for scheduling
  const [formData, setFormData] = useState({
    contact_file_id: '',
    agent_id: '',
    phone_number_id: '',
    scheduled_date: '',
    scheduled_time: '',
    timezone: 'UTC',
    notes: ''
  });
  
  // Data lists
  const [contactFiles, setContactFiles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [scheduledCalls, setScheduledCalls] = useState([]);
  
  // Selected file preview
  const [selectedFilePreview, setSelectedFilePreview] = useState([]);
  
  // Load initial data
  useEffect(() => {
    // Set default date and time (current time + 5 minutes)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const defaultDate = now.toISOString().split('T')[0];
    const defaultTime = now.toTimeString().slice(0, 5);
    
    // Auto-detect timezone with Indian fallback
    let detectedTimezone = 'Asia/Kolkata'; // Default to Indian timezone
    try {
      // Try to detect user's timezone
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (browserTimezone) {
        detectedTimezone = browserTimezone;
        console.log('Auto-detected timezone:', browserTimezone);
      } else {
        console.log('Could not detect timezone, using Indian timezone as fallback');
      }
    } catch (error) {
      console.log('Timezone detection failed, using Indian timezone as fallback:', error);
    }
    
    setFormData(prev => ({
      ...prev,
      scheduled_date: defaultDate,
      scheduled_time: defaultTime,
      timezone: detectedTimezone
    }));
    
    loadContactFiles();
    loadAgents();
    loadPhoneNumbers();
    loadScheduledCalls();
  }, []);

  const loadContactFiles = async () => {
    try {
      const response = await apiService.listContactFiles();
      const files = response.contact_files || [];
      setContactFiles(files);
      
      // Auto-select the most recent contact file by creation date
      if (files.length > 0 && !formData.contact_file_id) {
        // Sort files by created_at timestamp to find the most recent
        const sortedFiles = [...files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const mostRecentFile = sortedFiles[0];
        
        console.log('Auto-selecting most recent contact file:', mostRecentFile.name);
        
        // Update form data and load preview
        setFormData(prev => ({ ...prev, contact_file_id: mostRecentFile.file_id }));
        
        // Load preview for the auto-selected file
        try {
          const previewResponse = await apiService.getContactsByFile(mostRecentFile.file_id);
          setSelectedFilePreview(previewResponse.contacts ? previewResponse.contacts.slice(0, 5) : []);
        } catch (previewError) {
          console.error('Error loading auto-selected file preview:', previewError);
          setSelectedFilePreview([]);
        }
      }
    } catch (error) {
      console.error('Error loading contact files:', error);
      toast.error('Failed to load contact files');
    }
  };

  const loadAgents = async () => {
    try {
      const response = await apiService.getAgents();
      const agentsList = response.agents || [];
      setAgents(agentsList);
      
      // Auto-select the first available agent if none is selected
      if (agentsList.length > 0 && !formData.agent_id) {
        const firstAgent = agentsList[0];
        console.log('Auto-selecting first agent:', firstAgent.name);
        setFormData(prev => ({ ...prev, agent_id: firstAgent.agent_id }));
      }
    } catch (error) {
      console.error('Error loading agents:', error);
      toast.error('Failed to load agents');
    }
  };

  const loadPhoneNumbers = async () => {
    try {
      const response = await apiService.getPhoneNumbers();
      const phoneNumbersList = response.phone_numbers || [];
      setPhoneNumbers(phoneNumbersList);
      
      // Auto-select the first available phone number if none is selected
      if (phoneNumbersList.length > 0 && !formData.phone_number_id) {
        const firstPhoneNumber = phoneNumbersList[0];
        console.log('Auto-selecting first phone number:', firstPhoneNumber.number);
        setFormData(prev => ({ ...prev, phone_number_id: firstPhoneNumber.id }));
      }
    } catch (error) {
      console.error('Error loading phone numbers:', error);
      toast.error('Failed to load phone numbers');
    }
  };

  const loadScheduledCalls = async () => {
    try {
      const response = await apiService.listScheduledCalls();
      setScheduledCalls(response.scheduled_calls || []);
    } catch (error) {
      console.error('Error loading scheduled calls:', error);
      toast.error('Failed to load scheduled calls');
    }
  };

  const handleContactFileChange = async (fileId) => {
    setFormData({ ...formData, contact_file_id: fileId });
    
    if (fileId) {
      try {
        const response = await apiService.getContactsByFile(fileId);
        setSelectedFilePreview(response.contacts ? response.contacts.slice(0, 5) : []);
      } catch (error) {
        console.error('Error loading file preview:', error);
        setSelectedFilePreview([]);
      }
    } else {
      setSelectedFilePreview([]);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.contact_file_id || !formData.agent_id || !formData.phone_number_id || !formData.scheduled_date || !formData.scheduled_time) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Combine date and time
      const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
      
      // Check if scheduled time is in the future
      const scheduledDate = new Date(scheduledDateTime);
      if (scheduledDate <= new Date()) {
        toast.error('Scheduled time must be in the future');
        setLoading(false);
        return;
      }

      const scheduleData = {
        contact_file_id: formData.contact_file_id,
        agent_id: formData.agent_id,
        phone_number_id: formData.phone_number_id,
        scheduled_datetime: scheduledDateTime,
        timezone: formData.timezone,
        notes: formData.notes
      };

      // Show a more informative loading message
      toast.info('Processing your batch schedule request. This may take a moment for large contact lists...');

      const response = await apiService.scheduleCall(scheduleData);
      
      if (response.success) {
        toast.success('Calls scheduled successfully!');
        
        // Reset form but keep detected timezone
        const detectedTimezone = formData.timezone || 'Asia/Kolkata';
        setFormData({
          contact_file_id: '',
          agent_id: '',
          phone_number_id: '',
          scheduled_date: '',
          scheduled_time: '',
          timezone: detectedTimezone,
          notes: ''
        });
        setSelectedFilePreview([]);
        
        // Refresh scheduled calls list
        loadScheduledCalls();
        
        // Switch to management tab
        setActiveTab('manage');
      } else {
        toast.error(response.error || 'Failed to schedule calls');
      }
    } catch (error) {
      // Handle specific timeout and network errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error('Scheduling is taking longer than expected. Please check the scheduled calls list in a few moments to see if your batch was processed.', {
          autoClose: 8000, // Show longer for important message
        });
        // Still refresh the list in case it worked
        setTimeout(() => {
          loadScheduledCalls();
        }, 5000);
      } else if (error.message && error.message.includes('Scheduling is taking longer than expected')) {
        // This is our custom timeout message from apiService
        toast.warning(error.message, {
          autoClose: 8000,
        });
        // Refresh the list after a delay
        setTimeout(() => {
          loadScheduledCalls();
        }, 5000);
      } else {
        // Handle other errors normally
        const errorMessage = error.response?.data?.error || error.message || 'Failed to schedule calls';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelScheduledCall = async (scheduleId) => {
    if (!confirm('Are you sure you want to cancel this scheduled call?')) {
      return;
    }

    try {
      const response = await apiService.cancelScheduledCall(scheduleId);
      if (response.success) {
        toast.success('Scheduled call cancelled successfully');
        loadScheduledCalls();
      } else {
        toast.error(response.error || 'Failed to cancel scheduled call');
      }
    } catch (error) {
      console.error('Error cancelling scheduled call:', error);
      toast.error('Failed to cancel scheduled call');
    }
  };

  const handleExecuteScheduledCall = async (scheduleId) => {
    if (!confirm('Are you sure you want to execute this scheduled call immediately?')) {
      return;
    }

    try {
      const response = await apiService.executeScheduledCall(scheduleId);
      if (response.success) {
        toast.success(`Scheduled call executed! ${response.calls_completed} calls completed, ${response.calls_failed} failed`);
        loadScheduledCalls();
      } else {
        toast.error(response.error || 'Failed to execute scheduled call');
      }
    } catch (error) {
      console.error('Error executing scheduled call:', error);
      toast.error('Failed to execute scheduled call');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      executing: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || statusStyles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDateTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeString;
    }
  };

  // Get minimum date/time for scheduling (current time + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5)
    };
  };

  const minDateTime = getMinDateTime();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-indigo-600" />
            Schedule Calls
          </h1>
          <p className="text-gray-600">Schedule calls for future execution - even when you're offline</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'schedule'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Schedule New
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'manage'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Manage Scheduled ({scheduledCalls.length})
          </button>
        </div>

        {/* Schedule New Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Schedule New Call Batch</h2>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              {/* Contact File Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Select Contact File *
                  </label>
                  <select
                    value={formData.contact_file_id}
                    onChange={(e) => handleContactFileChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a contact file...</option>
                    {contactFiles.map((file) => (
                      <option key={file.file_id} value={file.file_id}>
                        {file.name} ({file.contact_count} contacts)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Agent Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Bot className="w-4 h-4 inline mr-2" />
                    Select Agent *
                  </label>
                  <select
                    value={formData.agent_id}
                    onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose an agent...</option>
                    {agents.map((agent) => (
                      <option key={agent.agent_id} value={agent.agent_id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Number Selection */}
              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Select Phone Number *
                  </label>
                  <select
                    value={formData.phone_number_id}
                    onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a phone number...</option>
                    {phoneNumbers.map((phone) => (
                      <option key={phone.id} value={phone.id}>
                        {phone.number}
                      </option>
                    ))}
                  </select>
                  {phoneNumbers.length === 0 && (
                    <p className="text-sm text-amber-600 mt-1">
                      ⚠️ No phone numbers available. Please check your phone service configuration.
                    </p>
                  )}
                </div>
              </div>

              {/* Date and Time Selection */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    min={minDateTime.date}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Scheduled Time *
                  </label>
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    min={formData.scheduled_date === minDateTime.date ? minDateTime.time : undefined}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London Time</option>
                    <option value="Asia/Kolkata">India Time</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add any notes about this scheduled call batch..."
                />
              </div>

              {/* Contact Preview */}
              {selectedFilePreview.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Contact Preview (First 5):</h3>
                  <div className="space-y-1">
                    {selectedFilePreview.map((contact, index) => (
                      <div key={index} className="text-sm text-blue-700">
                        {contact.name} - {contact.phone_number}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Schedule Calls
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manage Scheduled Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            {scheduledCalls.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Scheduled Calls</h3>
                <p className="text-gray-500 mb-4">You haven't scheduled any calls yet.</p>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Schedule Your First Call
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {scheduledCalls.map((call) => (
                  <div key={call.schedule_id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Call Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{call.contact_file_name}</h3>
                          {getStatusBadge(call.status)}
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4" />
                            <span>{call.agent_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{call.total_contacts} contacts</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatDateTime(call.scheduled_datetime)}</span>
                          </div>
                          {call.time_remaining && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Timer className="w-4 h-4" />
                              <span>{call.time_remaining} remaining</span>
                            </div>
                          )}
                        </div>

                        {/* Progress for completed calls */}
                        {call.status === 'completed' && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Success Rate: {call.success_rate.toFixed(1)}%</span>
                              <span>{call.calls_completed}/{call.total_contacts}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${call.success_rate}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {call.notes && (
                          <div className="mt-2 text-sm text-gray-500 italic">
                            "{call.notes}"
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {call.can_be_cancelled && (
                          <>
                            <button
                              onClick={() => handleExecuteScheduledCall(call.schedule_id)}
                              className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                              title="Execute now"
                            >
                              <Play className="w-4 h-4" />
                              Execute
                            </button>
                            <button
                              onClick={() => handleCancelScheduledCall(call.schedule_id)}
                              className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                              title="Cancel"
                            >
                              <Trash2 className="w-4 h-4" />
                              Cancel
                            </button>
                          </>
                        )}
                        {call.status === 'completed' && (
                          <div className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </div>
                        )}
                        {call.status === 'failed' && (
                          <div className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Failed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCalls;
