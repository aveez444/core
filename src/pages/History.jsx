import { useState, useEffect } from "react";
import { PhoneCall, Calendar, ArrowLeft, Users, Loader2, Phone } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MakeCallsHistory from '../components/history/MakeCallsHistory';
import ScheduleCallsHistory from '../components/history/ScheduleCallsHistory';
import { apiService } from '../services/apiService';
import { formatDate, formatDateTime as formatDateTimeDDMM } from '../utils/dateUtils';

const History = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedHistoryType, setSelectedHistoryType] = useState(null);
  const [agents, setAgents] = useState([]);
  const [scheduledCalls, setScheduledCalls] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [scheduledLoading, setScheduledLoading] = useState(true);

  // Fetch user's agents
  const fetchAgents = async () => {
    try {
      setAgentsLoading(true);
      const agentsData = await apiService.getAgents();
      
      if (agentsData && agentsData.agents && Array.isArray(agentsData.agents)) {
        setAgents(agentsData.agents);
      } else if (Array.isArray(agentsData)) {
        setAgents(agentsData);
      } else {
        setAgents([]);
      }
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      toast.error("Failed to load agents");
      setAgents([]);
    } finally {
      setAgentsLoading(false);
    }
  };

  // Fetch scheduled calls
  const fetchScheduledCalls = async () => {
    try {
      setScheduledLoading(true);
      const data = await apiService.listScheduledCalls();
      setScheduledCalls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch scheduled calls:", err);
      toast.error("Failed to load scheduled calls");
      setScheduledCalls([]);
    } finally {
      setScheduledLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchScheduledCalls();
  }, []);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
  };

  const handleBackToMain = () => {
    setSelectedAgent(null);
    setSelectedHistoryType(null);
  };

  const handleScheduledCallsView = () => {
    setSelectedHistoryType('scheduled');
    setSelectedAgent(null);
  };

  // If scheduled calls is selected, show scheduled calls history
  if (selectedHistoryType === 'scheduled') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4 md:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToMain}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to History
              </button>
              <div className="flex items-center space-x-2">
                <Calendar size={24} className="text-green-600" />
                <h1 className="text-2xl font-bold text-gray-800">Scheduled Calls History</h1>
              </div>
            </div>
          </div>
        </div>
        <ScheduleCallsHistory />
      </div>
    );
  }

  // If an agent is selected, show agent's call history
  if (selectedAgent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4 md:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToMain}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to History
              </button>
              <div className="flex items-center space-x-2">
                <PhoneCall size={24} className="text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">
                  {selectedAgent.name} - Call History
                </h1>
              </div>
            </div>
          </div>
        </div>
        <MakeCallsHistory 
          selectedAgent={selectedAgent}
          onAgentSelect={handleAgentSelect}
          onBackToAgentList={handleBackToMain}
        />
      </div>
    );
  }

  // Using the formatDateTime from dateUtils for consistent DD/MM/YYYY format
  const formatDateTime = (dateString) => {
    return formatDateTimeDDMM(dateString);
  };

  // Main history page - show agents and scheduled calls side by side
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">📞 Call History</h1>
          <p className="text-gray-600">
            Select an agent to view manual call history, or click on scheduled calls.
          </p>
        </div>

        {/* Side by side layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Manual Calls Section - Left Side */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <PhoneCall size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Manual Calls</h2>
                  <p className="text-sm text-gray-500">Select an agent to view their call history</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {agentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin mr-3" size={24} />
                  <span className="text-gray-600">Loading agents...</span>
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Agents Found</h3>
                  <p className="text-gray-500">Create an agent first to view call history.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div
                      key={agent.agent_id}
                      onClick={() => handleAgentSelect(agent)}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Phone size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{agent.name}</h3>
                          <p className="text-sm text-gray-500">Click to view call history</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scheduled Calls Section - Right Side */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Calendar size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Scheduled Calls</h2>
                  <p className="text-sm text-gray-500">Recent scheduled call batches</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {scheduledLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin mr-3" size={24} />
                  <span className="text-gray-600">Loading scheduled calls...</span>
                </div>
              ) : scheduledCalls.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Scheduled Calls</h3>
                  <p className="text-gray-500">No scheduled calls found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledCalls.slice(0, 8).map((call) => (
                    <div
                      key={call.schedule_id}
                      onClick={handleScheduledCallsView}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="p-2 bg-green-100 rounded-lg mr-3">
                            <Calendar size={16} className="text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {formatDateTime(call.scheduled_datetime)}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {call.agent_name} • {call.total_contacts || 0} contacts
                            </p>
                          </div>
                        </div>
                        <div className="ml-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            call.status === 'completed' ? 'bg-green-100 text-green-800' :
                            call.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            call.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {call.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* View All Button */}
                  {scheduledCalls.length > 8 && (
                    <div
                      onClick={handleScheduledCallsView}
                      className="bg-green-50 rounded-lg p-4 border border-green-200 hover:border-green-300 hover:bg-green-100 cursor-pointer transition-all duration-200 text-center"
                    >
                      <p className="text-green-700 font-medium">View All Scheduled Calls ({scheduledCalls.length})</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
