import { useEffect, useState } from "react";
import { Calendar, Loader2, FileSpreadsheet, RefreshCw, Eye, EyeOff, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import { apiService } from '../../services/apiService';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full flex items-center";
    case "executing":
    case "scheduled":
      return "text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full flex items-center";
    case "pending":
      return "text-yellow-600 font-semibold bg-yellow-50 px-3 py-1 rounded-full flex items-center";
    case "failed":
    case "cancelled":
      return "text-red-600 font-semibold bg-red-50 px-3 py-1 rounded-full flex items-center";
    default:
      return "text-gray-600 font-semibold bg-gray-50 px-3 py-1 rounded-full flex items-center";
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return <CheckCircle size={16} className="mr-1" />;
    case "executing":
    case "scheduled":
      return <Clock size={16} className="mr-1" />;
    case "pending":
      return <AlertCircle size={16} className="mr-1" />;
    case "failed":
    case "cancelled":
      return <XCircle size={16} className="mr-1" />;
    default:
      return <AlertCircle size={16} className="mr-1" />;
  }
};

// Using formatDateTime from dateUtils for consistent DD/MM/YYYY format
const formatDateTimeLocal = (dateString) => {
  return formatDateTime(dateString);
};

const ScheduleCallsHistory = () => {
  const [scheduledCalls, setScheduledCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch scheduled calls history
  const fetchScheduledCalls = async () => {
    try {
      setLoading(true);
      const data = await apiService.listScheduledCalls();
      setScheduledCalls(Array.isArray(data) ? data : []);
      
      if (data.length === 0) {
        toast.info("No scheduled calls found");
      }
    } catch (err) {
      console.error("Failed to fetch scheduled calls:", err);
      toast.error("Failed to load scheduled calls history");
      setScheduledCalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledCalls();
  }, []);

  const toggleDetails = (idx) => {
    setExpandedRows((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const exportToExcel = () => {
    if (!scheduledCalls || scheduledCalls.length === 0) {
      toast.error("No data to export");
      return;
    }

    const wb = XLSX.utils.book_new();
    
    const exportData = scheduledCalls.map(call => ({
      'Schedule ID': call.schedule_id,
      'Agent Name': call.agent_name || 'Unknown',
      'Contact File': call.contact_file_name || 'Unknown',
      'Scheduled Date': formatDateTime(call.scheduled_datetime),
      'Status': call.status,
      'Total Contacts': call.total_contacts,
      'Calls Completed': call.calls_completed,
      'Calls Failed': call.calls_failed,
      'Success Rate': call.total_contacts > 0 ? `${((call.calls_completed / call.total_contacts) * 100).toFixed(1)}%` : '0%',
      'Created Date': formatDateTime(call.created_at),
      'Executed Date': call.executed_at ? formatDateTime(call.executed_at) : 'Not executed',
      'Notes': call.notes || 'No notes'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    const colWidths = [
      { wch: 25 }, // Schedule ID
      { wch: 20 }, // Agent Name
      { wch: 20 }, // Contact File
      { wch: 20 }, // Scheduled Date
      { wch: 12 }, // Status
      { wch: 15 }, // Total Contacts
      { wch: 15 }, // Calls Completed
      { wch: 15 }, // Calls Failed
      { wch: 12 }, // Success Rate
      { wch: 20 }, // Created Date
      { wch: 20 }, // Executed Date
      { wch: 30 }  // Notes
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Scheduled Calls History");
    
    const now = new Date();
    const filename = `scheduled_calls_history_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    toast.success(`Data exported successfully to ${filename}`);
  };

  const refreshHistory = () => {
    fetchScheduledCalls();
  };

  const filteredCalls = scheduledCalls.filter((call) =>
    Object.values(call).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Scheduled Calls History</h2>
              <p className="text-gray-600">Track your scheduled call batches and execution results</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                disabled={scheduledCalls.length === 0}
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
          
          <input
            type="text"
            placeholder="🔍 Search scheduled calls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Scheduled Calls Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin mr-3" size={24} />
              <span className="text-gray-600">Loading scheduled calls history...</span>
            </div>
          ) : scheduledCalls.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Scheduled Calls Found</h3>
              <p className="text-gray-500">You haven't scheduled any calls yet. Create your first scheduled call batch!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-3 py-3 border w-24">Schedule ID</th>
                    <th className="px-4 py-3 border">Agent</th>
                    <th className="px-4 py-3 border">Contact File</th>
                    <th className="px-3 py-3 border w-36">Scheduled Date</th>
                    <th className="px-2 py-3 border w-24">Status</th>
                    <th className="px-3 py-3 border w-20">Progress</th>
                    <th className="px-2 py-3 border w-20">Success Rate</th>
                    <th className="px-2 py-3 border w-16">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.map((call, idx) => (
                    <tr
                      key={call.schedule_id}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors duration-150`}
                    >
                      <td className="px-3 py-3 border">
                        <div className="font-mono text-xs text-gray-600">
                          {call.schedule_id?.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-4 py-3 border font-medium">
                        {call.agent_name || 'Unknown Agent'}
                      </td>
                      <td className="px-4 py-3 border">
                        <div className="flex items-center">
                          <Users size={14} className="mr-2 text-gray-400" />
                          <span className="text-sm">{call.contact_file_name || 'Unknown File'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 border">
                        <div className="text-xs">
                          <Clock size={12} className="inline mr-1 text-gray-400" />
                          <span className="block">{formatDateTime(call.scheduled_datetime).split(',')[0]}</span>
                          <span className="text-gray-500">{formatDateTime(call.scheduled_datetime).split(',')[1]}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 border">
                        <span className={getStatusClass(call.status)}>
                          {getStatusIcon(call.status)}
                          <span className="text-xs">{call.status}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 border">
                        <div className="text-center">
                          <div className="text-xs font-medium">
                            {call.calls_completed || 0} / {call.total_contacts || 0}
                          </div>
                          {call.total_contacts > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <div
                                className="bg-blue-600 h-1 rounded-full"
                                style={{
                                  width: `${Math.min(100, (call.calls_completed / call.total_contacts) * 100)}%`
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3 border">
                        <div className="text-center">
                          {call.total_contacts > 0 ? (
                            <span className={`text-xs font-semibold ${
                              (call.calls_completed / call.total_contacts) >= 0.8 
                                ? 'text-green-600' 
                                : (call.calls_completed / call.total_contacts) >= 0.5 
                                  ? 'text-yellow-600' 
                                  : 'text-red-600'
                            }`}>
                              {((call.calls_completed / call.total_contacts) * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3 border">
                        <button
                          onClick={() => toggleDetails(idx)}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Expanded Details Rows */}
              {expandedRows.map(idx => {
                const call = filteredCalls[idx];
                if (!call) return null;
                
                return (
                  <div key={`details-${idx}`} className="bg-blue-50 border-l-4 border-blue-500 p-6 mx-4 mb-4 rounded">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Execution Details</h4>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">Created:</span> {formatDateTime(call.created_at)}</div>
                          <div><span className="font-medium">Executed:</span> {call.executed_at ? formatDateTime(call.executed_at) : 'Not executed'}</div>
                          <div><span className="font-medium">Timezone:</span> {call.timezone_name || 'UTC'}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Call Statistics</h4>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">Total Contacts:</span> {call.total_contacts || 0}</div>
                          <div><span className="font-medium">Successful Calls:</span> <span className="text-green-600">{call.calls_completed || 0}</span></div>
                          <div><span className="font-medium">Failed Calls:</span> <span className="text-red-600">{call.calls_failed || 0}</span></div>
                          <div><span className="font-medium">Batch ID:</span> {call.batch_id || 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Notes & Comments</h4>
                        <div className="text-sm bg-white p-3 rounded border">
                          {call.notes || 'No notes available'}
                        </div>
                        {call.execution_log && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">Execution Log</summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 max-h-32 overflow-auto">
                              {call.execution_log}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Summary Statistics */}
        {!loading && scheduledCalls.length > 0 && (
          <div className="mt-6 grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Calendar size={24} className="text-blue-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">{scheduledCalls.length}</div>
                  <div className="text-sm text-gray-600">Total Schedules</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <CheckCircle size={24} className="text-green-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {scheduledCalls.filter(call => call.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Clock size={24} className="text-yellow-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {scheduledCalls.filter(call => ['pending', 'scheduled'].includes(call.status)).length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Users size={24} className="text-purple-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {scheduledCalls.reduce((sum, call) => sum + (call.total_contacts || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Contacts</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCallsHistory;
