import { useEffect, useState } from "react";
import { Users, Loader2, Download, FileSpreadsheet, RefreshCw, Eye, EyeOff, Copy, Phone, Clock, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import { apiService } from '../../services/apiService';

const API = import.meta.env.VITE_API_BASE_URL;

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "finished":
    case "done":
      return "text-green-600 font-semibold bg-green-50 px-2 py-1 rounded";
    case "initiated":
    case "in_progress":
      return "text-yellow-600 font-semibold bg-yellow-50 px-2 py-1 rounded";
    case "failed":
    case "error":
    case "rejected":
      return "text-red-600 font-semibold bg-red-50 px-2 py-1 rounded";
    default:
      return "text-gray-600 font-semibold bg-gray-50 px-2 py-1 rounded";
  }
};

const MakeCallsHistory = ({ selectedAgent: propSelectedAgent, onAgentSelect, onBackToAgentList }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(propSelectedAgent);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Fetch user's agents
  const fetchAgents = async () => {
    try {
      setAgentsLoading(true);
      console.log('📡 Fetching agents from API...');
      const agentsData = await apiService.getAgents();
      console.log('📊 Agents API response:', agentsData);
      console.log('📊 Response type:', typeof agentsData);
      console.log('📊 Is array?', Array.isArray(agentsData));
      
      // Handle the API response structure
      if (agentsData && agentsData.agents && Array.isArray(agentsData.agents)) {
        console.log('✅ Using agentsData.agents (nested structure)');
        console.log('📊 Agents array:', agentsData.agents);
        console.log('📊 Agents count:', agentsData.agents.length);
        setAgents(agentsData.agents);
        console.log('📊 State should be updated with agents');
      } else if (Array.isArray(agentsData)) {
        console.log('✅ Using agentsData directly (array structure)');
        setAgents(agentsData);
      } else {
        console.warn('⚠️ Unexpected agents response format:', agentsData);
        setAgents([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch agents:", err);
      toast.error("Failed to load agents");
      setAgents([]);
    } finally {
      setAgentsLoading(false);
    }
  };

  // Fetch conversations for selected agent from CallGenie voice platform
  const fetchAgentHistory = async (agentId, isBackgroundRefresh = false) => {
    try {
      console.log('🚀 fetchAgentHistory called with agentId:', agentId);
      console.log('🔄 Is background refresh:', isBackgroundRefresh);
      console.log('🌐 API Base URL:', API);
      console.log('📡 Full API endpoint will be:', `${API}/api/agent-history/${agentId}/`);
      
      // Only show loading screen for initial loads, not background refreshes
      if (!isBackgroundRefresh) {
        setLoading(true);
        setConversations([]);
      } else {
        setIsAutoRefreshing(true);
      }
      
      // Call backend to fetch CallGenie conversation history
      console.log('🔐 Making authenticated request with credentials');
      console.log('🔐 Current document.cookie:', document.cookie);
      
      const response = await fetch(`${API}/api/agent-history/${agentId}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // Add CSRF token if available
          ...(document.cookie.includes('csrftoken') ? {
            'X-CSRFToken': document.cookie
              .split('; ')
              .find(row => row.startsWith('csrftoken='))
              ?.split('=')[1] || ''
          } : {})
        }
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`Failed to fetch history: ${response.status} - ${errorText}`);
      }
      
      const historyData = await response.json();
      console.log('📊 Raw history data from API:', historyData);
      console.log('📊 History data type:', typeof historyData);
      console.log('📊 History data keys:', Object.keys(historyData));
      console.log('📊 Conversations array:', historyData.conversations);
      console.log('📊 Conversations length:', historyData.conversations?.length || 'undefined');
      
      // Add detailed debugging for the API response
      if (historyData.error) {
        console.error('❌ API returned error:', historyData.error);
        toast.error(`API Error: ${historyData.error}`);
      }
      
      if (historyData.service_info) {
        console.log('🔧 Service info:', historyData.service_info);
      }
      
      // Transform conversation data to our format
      const transformedConversations = (historyData.conversations || []).map((conv, index) => {
        console.log(`🔄 Processing conversation ${index}:`, conv);
        
        // Enhanced phone number extraction with multiple fallbacks
        let phone_number = 'Unknown';
        const phoneFields = [
          'customer_phone_number',
          'phone_number', 
          'to_number',
          'caller_phone',
          'contact_phone',
          'destination_phone_number'
        ];
        
        for (const field of phoneFields) {
          if (conv[field] && conv[field] !== 'Unknown' && conv[field].trim() !== '') {
            phone_number = conv[field];
            console.log(`📞 Found phone in field '${field}': ${phone_number}`);
            break;
          }
        }
        
        return {
          id: conv.conversation_id || `conv_${index}`,
          conversation_id: conv.conversation_id,
          timestamp: conv.start_time ? new Date(conv.start_time * 1000).toLocaleString() : 'Unknown',
          contact_name: conv.customer_name || 'Unknown Contact',
          phone_number: phone_number,
          status: conv.status || 'unknown',
          duration: conv.duration || conv.call_duration_secs || 0,
          transcript: conv.transcript || 'No transcript available',
          agent_name: selectedAgent?.name || 'Unknown Agent'
        };
      });
      
      console.log('✨ Transformed conversations:', transformedConversations);
      console.log('✨ Transformed conversations length:', transformedConversations.length);
      
      setConversations(transformedConversations);
      console.log('💾 Conversations state updated');
      
      // Only show toast notifications for initial loads, not background refreshes
      if (!isBackgroundRefresh) {
        if (transformedConversations.length === 0) {
          console.log('ℹ️ No conversations found, showing info toast');
          toast.info(`No call history found for agent "${selectedAgent?.name}"`);
        } else {
          console.log('✅ Found conversations, showing success toast');
          toast.success(`Found ${transformedConversations.length} calls for agent "${selectedAgent?.name}"`);
        }
      } else {
        console.log(`🔄 Background refresh completed: ${transformedConversations.length} conversations for agent "${selectedAgent?.name}"`);
      }
      
    } catch (err) {
      console.error("❌ Failed to fetch agent history:", err);
      console.error("❌ Error details:", err.message);
      console.error("❌ Error stack:", err.stack);
      toast.error("Failed to fetch call history from CallGenie voice platform");
      setConversations([]);
    } finally {
      console.log('🏁 fetchAgentHistory finished, setting loading states to false');
      if (!isBackgroundRefresh) {
        setLoading(false);
      } else {
        setIsAutoRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Sync with parent's selectedAgent prop
  useEffect(() => {
    if (propSelectedAgent && propSelectedAgent !== selectedAgent) {
      setSelectedAgent(propSelectedAgent);
      fetchAgentHistory(propSelectedAgent.agent_id);
    }
  }, [propSelectedAgent]);

  // Auto-refresh history every 5 seconds when an agent is selected
  useEffect(() => {
    let intervalId = null;
    
    if (selectedAgent) {
      // Set up interval to refresh every 5 seconds
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing history for agent:', selectedAgent.name);
        fetchAgentHistory(selectedAgent.agent_id, true); // true = background refresh
      }, 5000);
      
      console.log('⏰ Auto-refresh interval started for agent:', selectedAgent.name);
    }
    
    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('🛑 Auto-refresh interval cleared');
      }
    };
  }, [selectedAgent]); // Re-run when selectedAgent changes

  const handleAgentSelect = (agent) => {
    console.log('🎯 handleAgentSelect called with agent:', agent);
    console.log('🔑 Agent ID:', agent.agent_id);
    console.log('📛 Agent Name:', agent.name);
    
    setSelectedAgent(agent);
    console.log('✅ Selected agent state updated');
    
    setSearchTerm("");
    setExpandedRows([]);
    
    console.log('📞 About to call fetchAgentHistory with agent_id:', agent.agent_id);
    fetchAgentHistory(agent.agent_id);
    
    // Notify parent component
    if (onAgentSelect) {
      onAgentSelect(agent);
    }
  };

  const handleBackToAgents = () => {
    setSelectedAgent(null);
    setConversations([]);
    setSearchTerm("");
    setExpandedRows([]);
    
    // Notify parent component
    if (onBackToAgentList) {
      onBackToAgentList();
    }
  };

  const toggleTranscript = (idx) => {
    setExpandedRows((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const downloadAudio = async (conversationId) => {
    try {
      setDownloadingId(conversationId);
      const response = await fetch(`${API}/api/download-audio/${conversationId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        toast.error("Audio not found or failed to download");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${conversationId}.mp3`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Agent audio download started (customer voice not available)");
    } catch (err) {
      console.error("Error downloading audio:", err);
      toast.error("Error downloading audio");
    } finally {
      setDownloadingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Conversation ID copied!");
  };

  const exportToExcel = () => {
    if (!conversations || conversations.length === 0) {
      toast.error("No data to export");
      return;
    }

    const wb = XLSX.utils.book_new();
    
    const exportData = conversations.map(conv => ({
      'Agent': conv.agent_name,
      'Timestamp': conv.timestamp,
      'Contact Name': conv.contact_name,
      'Phone': conv.phone_number,
      'Status': conv.status,
      'Duration (seconds)': conv.duration,
      'Transcript': conv.transcript,
      'Conversation ID': conv.conversation_id
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    const colWidths = [
      { wch: 20 }, // Agent
      { wch: 20 }, // Timestamp
      { wch: 20 }, // Contact Name
      { wch: 15 }, // Phone
      { wch: 12 }, // Status
      { wch: 15 }, // Duration
      { wch: 50 }, // Transcript
      { wch: 25 }  // Conversation ID
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Make Calls History");
    
    const now = new Date();
    const filename = `make_calls_history_${selectedAgent?.name || 'agent'}_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    toast.success(`Data exported successfully to ${filename}`);
  };

  const refreshHistory = () => {
    if (selectedAgent) {
      fetchAgentHistory(selectedAgent.agent_id);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    Object.values(conv).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Show agent selection if no agent is selected
  if (!selectedAgent) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Select an Agent</h2>
                <p className="text-gray-600">Choose an agent to view their call history from CallGenie</p>
              </div>
              <Users size={32} className="text-blue-500" />
            </div>

            {agentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin mr-3" size={24} />
                <span className="text-gray-600">Loading your agents...</span>
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Agents Found</h3>
                <p className="text-gray-500">You need to create an agent first before viewing call history.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {agents.map((agent) => (
                  <div
                    key={agent.agent_id}
                    onClick={() => handleAgentSelect(agent)}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Phone size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{agent.name}</h3>
                        <p className="text-sm text-gray-500">View call history</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show conversation history for selected agent
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with controls only */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex gap-2 mb-4 sm:mb-0">
              <input
                type="text"
                placeholder="🔍 Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                disabled={conversations.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FileSpreadsheet size={16} />
                Export Excel
              </button>
              <button
                onClick={refreshHistory}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Conversation History Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin mr-3" size={24} />
              <span className="text-gray-600">Loading call history from CallGenie voice platform...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Call History Found</h3>
              <p className="text-gray-500">This agent hasn't made any calls yet, or the calls haven't been synced from CallGenie voice platform.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-2 py-3 border w-32">Timestamp</th>
                    <th className="px-4 py-3 border">Contact</th>
                    <th className="px-3 py-3 border w-28">Phone</th>
                    <th className="px-2 py-3 border w-20">Status</th>
                    <th className="px-2 py-3 border w-16">Duration</th>
                    <th className="px-4 py-3 border">Transcript</th>
                    <th className="px-2 py-3 border w-16">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConversations.map((conv, idx) => (
                    <tr
                      key={conv.id}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors duration-150`}
                    >
                      <td className="px-2 py-3 border">
                        <div className="text-s">
                          <Clock size={12} className="inline mr-1 text-gray-400" />
                          <span className="block">{conv.timestamp.split(',')[0]}</span>
                          <span className="text-gray-500">{conv.timestamp.split(',')[1]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border font-medium">{conv.contact_name}</td>
                      <td className="px-3 py-3 border">
                        <div className="text-xs font-mono">
                          {conv.phone_number !== 'Unknown' ? conv.phone_number : <span className="text-gray-400 italic">No phone</span>}
                        </div>
                      </td>
                      <td className="px-2 py-3 border">
                        <span className={getStatusClass(conv.status)}>
                          {conv.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 border text-center">
                        <span className="text-xs">{conv.duration}s</span>
                      </td>
                      <td className="px-4 py-3 border max-w-xs">
                        {(() => {
                          // Handle different transcript formats from API
                          let transcriptText = '';
                          
                          if (conv.transcript) {
                            if (typeof conv.transcript === 'string') {
                              transcriptText = conv.transcript;
                            } else if (Array.isArray(conv.transcript)) {
                              // If transcript is an array of message objects, extract text
                              transcriptText = conv.transcript
                                .map(msg => {
                                  if (typeof msg === 'string') {
                                    return msg;
                                  } else if (msg && typeof msg === 'object') {
                                    // Try common message object properties
                                    return msg.text || msg.message || msg.content || msg.transcript || JSON.stringify(msg);
                                  }
                                  return String(msg || '');
                                })
                                .filter(text => text && text.trim() !== '')
                                .join('\n\n');
                            } else if (typeof conv.transcript === 'object') {
                              // If transcript is an object, try to extract text
                              transcriptText = conv.transcript.text || conv.transcript.content || JSON.stringify(conv.transcript);
                            } else {
                              transcriptText = String(conv.transcript);
                            }
                          }
                          
                          const hasValidTranscript = transcriptText && 
                            transcriptText !== 'No transcript available' && 
                            transcriptText.trim() !== '' &&
                            transcriptText.toLowerCase() !== 'null' &&
                            transcriptText.toLowerCase() !== 'undefined';
                          
                          return hasValidTranscript ? (
                            <>
                              <button
                                onClick={() => toggleTranscript(idx)}
                                className="flex items-center text-blue-500 underline hover:text-blue-700"
                              >
                                {expandedRows.includes(idx) ? (
                                  <>
                                    <EyeOff size={14} className="mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye size={14} className="mr-1" />
                                    View
                                  </>
                                )}
                              </button>
                              {expandedRows.includes(idx) && (
                                <pre className="mt-2 text-xs whitespace-pre-wrap max-h-32 overflow-auto bg-gray-50 p-2 rounded border">
                                  {transcriptText}
                                </pre>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-500 italic">Not available</span>
                          );
                        })()}
                      </td>
                      <td className="px-2 py-3 border text-center">
                        <button
                          onClick={() => downloadAudio(conv.conversation_id)}
                          className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          disabled={downloadingId === conv.conversation_id}
                          title="Download agent voice audio only (customer voice not included)"
                        >
                          {downloadingId === conv.conversation_id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakeCallsHistory;
