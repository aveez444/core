// src/pages/MakeCalls.jsx
import { useState, useEffect } from 'react';
import { Upload, Trash2, Eye, Phone, History, FileWarning, RefreshCcw, Pencil, PhoneCall, PhoneOff, PhoneIncoming, AlertCircle, CheckCircle, Clock, Edit, X, Bot, User } from 'lucide-react';
import { apiService } from '../services/apiService';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

const MakeCalls = () => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFileContent, setSelectedFileContent] = useState([]);
  const [status, setStatus] = useState('');
  const [callOutput, setCallOutput] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState(''); // New Call Status
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({ name: '', phone: '', language: 'en' });
  const [selectedFile, setSelectedFile] = useState(''); // Track which file to add data to
  const [selectedFileName, setSelectedFileName] = useState(''); // Track the file name for display
  const [editingRowIndex, setEditingRowIndex] = useState(null); // Track which row is being edited
  const [isDragging, setIsDragging] = useState(false); // Track drag state
  
  // New state for agents and phone numbers
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [phoneNumbersLoading, setPhoneNumbersLoading] = useState(false);
  
  // Real-time call status polling
  const [callSessionId, setCallSessionId] = useState(null);
  const [statusPollingInterval, setStatusPollingInterval] = useState(null);
  const [currentContact, setCurrentContact] = useState('');
  const [callProgress, setCallProgress] = useState({ current: 0, total: 0 });
  
  // Timeout counter
  const [pollingStartTime, setPollingStartTime] = useState(null);
  const [timeoutCounter, setTimeoutCounter] = useState(0);
  const [timeoutInterval, setTimeoutInterval] = useState(null);
  const MAX_POLLING_TIME = 300; // 5 minutes in seconds

  // Get call status styling
  const getCallStatusStyle = (status) => {
    switch (status) {
      case 'Connecting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ringing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'On Call':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Call Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Call Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Timeout - Check History':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get call status icon
  const getCallStatusIcon = (status) => {
    switch (status) {
      case 'Connecting':
        return <Phone className="w-5 h-5" />;
      case 'Ringing':
        return <PhoneIncoming className="w-5 h-5" />;
      case 'On Call':
        return <PhoneCall className="w-5 h-5" />;
      case 'Call Rejected':
        return <PhoneOff className="w-5 h-5" />;
      case 'Call Completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'Failed':
        return <AlertCircle className="w-5 h-5" />;
      case 'Processing':
        return <Clock className="w-5 h-5" />;
      default:
        return <Phone className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchAgents();
    fetchPhoneNumbers();
    
    // Scroll to upload section if hash is present
    if (window.location.hash === '#contact-upload') {
      setTimeout(() => {
        const uploadSection = document.getElementById('contact-upload-section');
        if (uploadSection) {
          uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // Small delay to ensure DOM is ready
    }
  }, []);

  const fetchFiles = async () => {
    try {
      const data = await apiService.listContactFiles();
      
      if (data && Array.isArray(data.contact_files)) {
        setFiles(data.contact_files);
      } else {
        setFiles([]);
      }
    } catch (err) {
      setFiles([]);
    }
  };

  const fetchAgents = async () => {
    try {
      setAgentsLoading(true);
      const data = await apiService.getAgents();
      
      if (data && Array.isArray(data.agents)) {
        setAgents(data.agents);
      } else {
        setAgents([]);
      }
    } catch (err) {
      setAgents([]);
    } finally {
      setAgentsLoading(false);
    }
  };

  const fetchPhoneNumbers = async () => {
    try {
      setPhoneNumbersLoading(true);
      const data = await apiService.getPhoneNumbers();
      
      if (data && Array.isArray(data.phone_numbers)) {
        setPhoneNumbers(data.phone_numbers);
      } else {
        setPhoneNumbers([]);
      }
    } catch (err) {
      setPhoneNumbers([]);
    } finally {
      setPhoneNumbersLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone completely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const csvFile = droppedFiles.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      setFile(csvFile);
      setStatus('CSV file ready to upload! Click "Upload CSV" to proceed.');
    } else {
      setStatus('Please drop a CSV file only.');
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file.');
    if (!file.name.endsWith('.csv')) return alert('File must be a CSV.');

    try {
      setStatus('Uploading...');
      
      // Use apiService which handles authentication automatically
      const response = await apiService.uploadCSV(file);
      
      setStatus(response.message || 'File uploaded successfully');
      fetchFiles(); // Refresh the file list
      setFile(null); // Clear the selected file
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Upload failed';
      setStatus(errorMessage);
    }
  };

  const handleFileSelect = async (fileId) => {
    try {
      // Use apiService to get contacts by file
      const data = await apiService.getContactsByFile(fileId);
      const contacts = data.contacts || [];
      
      setSelectedFileContent(contacts);
      setSelectedFile(fileId);
      
      // Find file name from the files array
      const selectedFileObj = files.find(f => f.file_id === fileId);
      if (selectedFileObj) {
        setSelectedFileName(selectedFileObj.name);
      }
    } catch (err) {
      setSelectedFileContent([]);
      setStatus(`❌ Error loading file: ${err.message}`);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await apiService.deleteContactFile(fileId);
      fetchFiles();
    } catch (err) {
      // Handle error silently or show user notification
    }
  };

  // Validate all phone numbers in selected file before making calls
  const validateAllPhoneNumbers = () => {
    if (!selectedFileContent || selectedFileContent.length === 0) {
      return {
        isValid: false,
        message: 'No contacts selected for calling',
        invalidNumbers: []
      };
    }
    
    const invalidNumbers = [];
    
    selectedFileContent.forEach((contact, index) => {
      const phone = contact.phone_number || contact.phone;
      if (phone) {
        const validation = validatePhoneNumber(phone);
        if (!validation.isValid) {
          invalidNumbers.push({
            index: index + 1,
            name: contact.name || 'Unknown',
            phone: phone,
            error: validation.message
          });
        }
      } else {
        invalidNumbers.push({
          index: index + 1,
          name: contact.name || 'Unknown',
          phone: 'No phone number',
          error: 'Missing phone number'
        });
      }
    });
    
    return {
      isValid: invalidNumbers.length === 0,
      message: invalidNumbers.length > 0 ? `${invalidNumbers.length} invalid phone numbers found` : 'All phone numbers are valid',
      invalidNumbers
    };
  };

  // Real-time status polling function
  const pollCallStatus = async (sessionId = null) => {
    const currentSessionId = sessionId || callSessionId;
    if (!currentSessionId) {
      return;
    }
    
    try {
      const statusData = await apiService.getCurrentCallStatus(currentSessionId);
      
      // Update current contact being called
      if (statusData.current_contact) {
        setCurrentContact(statusData.current_contact);
      }
      
      // Update call progress
      if (statusData.progress) {
        setCallProgress(statusData.progress);
      }
      
      // Update call status and output based on response
      if (statusData.status) {
        setCallStatus(statusData.status);
      }
      
      if (statusData.output) {
        setCallOutput(statusData.output);
      }
      
      // Check multiple completion conditions
      const isCompleted = statusData.completed === true || 
                         statusData.status === 'completed' ||
                         statusData.status === 'finished' ||
                         statusData.final_status === 'completed' ||
                         (statusData.progress && statusData.progress.current >= statusData.progress.total && statusData.progress.total > 0);
      
      if (isCompleted) {
        // Stop timeout counter
        stopTimeoutCounter();
        
        // Clear the polling interval
        if (statusPollingInterval) {
          clearInterval(statusPollingInterval);
          setStatusPollingInterval(null);
        }
        setIsCalling(false);
        setCallSessionId(null);
        
        // Set final status
        if (statusData.final_status) {
          setCallStatus(statusData.final_status);
        } else {
          setCallStatus('Call Completed');
        }
        
        setCallOutput(prev => prev + '\n\n🎉 All calls completed!');
      }
      
    } catch (err) {
      
      // Check if session is not found (404) - this means calls may have completed and session was cleaned up
      if (err.response?.status === 404 || err.message?.includes('not found')) {
        // Stop timeout counter
        stopTimeoutCounter();
        
        // Clear the polling interval
        if (statusPollingInterval) {
          clearInterval(statusPollingInterval);
          setStatusPollingInterval(null);
        }
        setIsCalling(false);
        setCallSessionId(null);
        setCallStatus('Call Completed');
        setCallOutput(prev => prev + '\n\n🎉 Calls completed successfully!');
        return;
      }
    }
  };
  
  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
      }
      if (timeoutInterval) {
        clearInterval(timeoutInterval);
      }
    };
  }, [statusPollingInterval, timeoutInterval]);

  // Start timeout counter when polling begins
  const startTimeoutCounter = () => {
    const startTime = Date.now();
    setPollingStartTime(startTime);
    setTimeoutCounter(0);
    
    const timeout = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeoutCounter(elapsed);
      
      // Check if we've exceeded the maximum polling time
      if (elapsed >= MAX_POLLING_TIME) {
        // Stop polling and show timeout message
        if (statusPollingInterval) {
          clearInterval(statusPollingInterval);
          setStatusPollingInterval(null);
        }
        clearInterval(timeout);
        setTimeoutInterval(null);
        
        setIsCalling(false);
        setCallStatus('Timeout - Check History');
        setCallOutput(prev => prev + '\n\n⏰ Call monitoring timed out after 5 minutes. Calls may still be in progress. Check call history for updates.');
        setCallSessionId(null);
      }
    }, 1000); // Update every second
    
    setTimeoutInterval(timeout);
  };
  
  // Stop timeout counter
  const stopTimeoutCounter = () => {
    if (timeoutInterval) {
      clearInterval(timeoutInterval);
      setTimeoutInterval(null);
    }
    setTimeoutCounter(0);
    setPollingStartTime(null);
  };

  const handleCallAll = async () => {
    // Check if all required selections are made
    if (!selectedFile) {
      setCallOutput('❌ Please select a contact file first');
      setCallStatus('Failed');
      return;
    }
    
    if (!selectedAgent) {
      setCallOutput('❌ Please select an agent first');
      setCallStatus('Failed');
      return;
    }
    
    if (!selectedPhoneNumber) {
      setCallOutput('❌ Please select a phone number first');
      setCallStatus('Failed');
      return;
    }
    
    // Validate all phone numbers before starting calls
    const phoneValidation = validateAllPhoneNumbers();
    
    if (!phoneValidation.isValid) {
      const errorDetails = phoneValidation.invalidNumbers.map(num => 
        `Row ${num.index}: ${num.name} - ${num.phone} (${num.error})`
      ).join('\n');
      
      setCallOutput(`❌ Cannot start calls due to invalid phone numbers:\n\n${errorDetails}\n\nPlease fix these numbers and try again.`);
      setCallStatus('Failed');
      return;
    }
    
    setIsCalling(true);
    setCallStatus('Connecting');
    setCallOutput('Validating phone numbers...\n✅ All phone numbers are valid\nStarting calls...');
    setCallProgress({ current: 0, total: selectedFileContent.length });
    
    try {
      // Start the calls (this returns immediately with a session ID)
      const response = await apiService.startCallsFromFile({
        file_id: selectedFile,
        agent_id: selectedAgent,
        phone_number_id: selectedPhoneNumber
      });
      
      if (response.call_session_id) {
        setCallSessionId(response.call_session_id);
        
        // Start timeout counter
        startTimeoutCounter();
        
        // Start polling for status updates every 5 seconds
        const interval = setInterval(() => {
          pollCallStatus(response.call_session_id);
        }, 5000);
        setStatusPollingInterval(interval);
        
        // Immediate first poll
        setTimeout(() => {
          pollCallStatus(response.call_session_id);
        }, 1000);
        
        // Initial status update
        setCallOutput(prev => prev + '\n🔄 Started real-time call monitoring...');
        setCallStatus('Processing');
      } else {
        throw new Error('No call session ID received from server');
      }
      
    } catch (err) {
      setCallOutput(`❌ Failed to start calls: ${err.message || 'Unknown error'}\nPlease check your connection and try again.`);
      setCallStatus('Failed');
      setIsCalling(false);
    }
  };
  
  // Stop calls function
  const handleStopCalls = async () => {
    // Stop polling interval
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval);
      setStatusPollingInterval(null);
    }
    
    // Stop timeout counter
    stopTimeoutCounter();
    
    // Call backend API to stop the call session if one exists
    if (callSessionId) {
      try {
        await apiService.stopCallSession(callSessionId);
        setCallOutput(prev => prev + '\n\n🛑 Call session stopped successfully.');
      } catch (err) {
        setCallOutput(prev => prev + '\n\n⚠️  Error stopping call session, but local monitoring stopped.');
      }
    }
    
    // Reset all call-related state
    setIsCalling(false);
    setCallStatus('');
    setCallOutput('');
    setCallSessionId(null);
    setCurrentContact('');
    setCallProgress({ current: 0, total: 0 });
  };


  const manualInputHandler = (fileId) => {
    setSelectedFile(fileId);
    setShowManualForm(true);
    setEditingRowIndex(null); // Reset editing index when adding new contact
    setManualData({ name: '', phone: '', language: 'en' }); // Reset form data
    
    // Find file name from the files array
    const selectedFileObj = files.find(f => f.file_id === fileId);
    if (selectedFileObj) {
      setSelectedFileName(selectedFileObj.name);
    }
  };

  const handleEditRow = (rowIndex) => {
    const rowData = selectedFileContent[rowIndex];
    
    // Pre-fill form with row data
    setManualData({
      name: rowData.name || '',
      phone: rowData.phone_number || '',
      language: rowData.language || 'en'
    });
    
    setEditingRowIndex(rowIndex);
    setShowManualForm(true);
  };

  const handleDeleteRow = async (contactId) => {
    
    if (!selectedFile) {
      setStatus('❌ No file selected');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    
    try {
      // Use apiService which handles authentication automatically
      const response = await apiService.deleteContact(contactId);
      
      setStatus(`✅ ${response.message || 'Contact deleted successfully'}`);
      
      // Refresh the file content to reflect the deletion
      handleFileSelect(selectedFile);
      
      setTimeout(() => setStatus(''), 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete contact';
      setStatus(`❌ ${errorMessage}`);
      
      setTimeout(() => setStatus(''), 5000);
    }
  };

  // Validate phone number with country code
  const validatePhoneNumber = (phone) => {
  if (!phone) {
    return {
      isValid: false,
      message: 'Missing phone number'
    };
  }

  // Strip all non-digit characters (e.g. +, -, space)
  const cleanPhone = String(phone).replace(/[^\d]/g, '');

  // Ensure it starts with a country code (not starting with 0) and has enough digits
  if (cleanPhone.length < 10) {
    return {
      isValid: false,
      message: 'Phone number too short. Must include country code'
    };
  }

  if (!/^[1-9]\d{9,}$/.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'Invalid phone number format. Include country code, e.g. 91XXXXXXXXXX'
    };
  }

  return { isValid: true, message: '' };
};


  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number format with country code
    const phoneValidation = validatePhoneNumber(manualData.phone);
    if (!phoneValidation.isValid) {
      setStatus(`❌ ${phoneValidation.message}`);
      return;
    }
    
    try {
      let data;
      
      if (editingRowIndex !== null) {
        // Edit existing contact
        data = await apiService.updateContact(selectedFileContent[editingRowIndex].id, {
          ...manualData,
          contact_id: selectedFileContent[editingRowIndex].id
        });
      } else {
        // Add new contact
        data = await apiService.addContactToFile(selectedFile, {
          name: manualData.name,
          phone: manualData.phone,
          language: manualData.language
        });
      }
      setStatus(`✅ ${data.message}`);
      setManualData({ name: '', phone: '', language: 'en' });
      setShowManualForm(false);
      setSelectedFile('');
      setSelectedFileName('');
      setEditingRowIndex(null);
      
      // Refresh file content
      fetchFiles();
      
      // Refresh the selected file content if it was the one being edited
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
      
      // Clear status after 3 seconds
      setTimeout(() => setStatus(''), 3000);
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to save contact';
      setStatus(`❌ ${errorMessage}`);
      
      // Clear error after 5 seconds
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div id="contact-upload-section" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Upload className="w-8 h-8" /> Upload CSV File
          </h1>

          <div 
            className={`border-2 border-dashed rounded-lg p-6 mb-6 transition-all duration-300 ${
              isDragging 
                ? 'border-purple-500 bg-purple-50 border-4 scale-105' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isDragging ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 animate-bounce">🔥</div>
                <h2 className="text-3xl font-bold text-purple-600 mb-2 animate-pulse">
                  Drop it like it's hot!
                </h2>
                <p className="text-lg text-purple-500 font-medium">
                  Your CSV is about to get lit! 🚀
                </p>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Sample CSV Format:</h3>
                <div className="bg-white p-3 rounded border overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">name</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">phone_number</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">language</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2">John Doe</td>
                        <td className="border border-gray-300 px-3 py-2">+1234567890</td>
                        <td className="border border-gray-300 px-3 py-2">en</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">Jane Smith</td>
                        <td className="border border-gray-300 px-3 py-2">+9876543210</td>
                        <td className="border border-gray-300 px-3 py-2">hi</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!isDragging && (
              <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-1">
                  <FileWarning className="w-4 h-4" /> Important Phone Number Format:
                </h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Phone numbers MUST include country code (e.g., +1234567890)</li>
                  <li>• Valid formats: +1234567890, +91-9876543210, +44 20 7946 0958</li>
                  <li>• Invalid formats: 1234567890, 234-567-8901 (missing country code)</li>
                  <li>• CSV column must be named "phone_number"</li>
                </ul>
              </div>
            )}
            {!isDragging && (
              <>
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Drag & drop your CSV file here or click to browse
                  </p>
                  <p className="text-xs text-gray-600">
                    Supported format: .csv files only
                  </p>
                </div>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button 
                  onClick={handleUpload} 
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  Upload CSV
                </button>
              </>
            )}
            {status && <p className="mt-4 text-sm text-green-600">{status}</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Uploaded CSV Files</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(files) && files.map((f) => (
              <div key={f.file_id} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-800">{f.name}</span>
                  <span className="text-xs text-gray-500">({f.contact_count} contacts)</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleFileSelect(f.file_id)} 
                    title="View" 
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button 
                    onClick={() => handleDelete(f.file_id)} 
                    title="Delete" 
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  <button 
                    onClick={() => manualInputHandler(f.file_id)} 
                    title="Add Data" 
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <Pencil className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedFileContent.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">File Preview</h3>
            <div className="overflow-auto max-h-64 border rounded-lg">
              <table className="min-w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left">name</th>
                  <th className="p-2 text-left">phone_number</th>
                  <th className="p-2 text-left">language</th>
                  <th className="p-2 text-left">Edit</th>
                  <th className="p-2 text-left">Delete</th>
                </tr>
              </thead>
              <tbody>
                {selectedFileContent.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.phone_number}</td>
                    <td className="p-2">{row.language}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleEditRow(idx)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Edit this contact"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        title="Delete this contact"
                      >
                        <X className="w-3 h-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Call Configuration</h3>
          
          {/* Selection Options Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* CSV File Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select CSV File</label>
              <select 
                onChange={(e) => e.target.value && handleFileSelect(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedFile}
              >
                <option value="">Choose CSV file...</option>
                {Array.isArray(files) && files.map((f) => (
                  <option key={f.file_id} value={f.file_id}>{f.name} ({f.contact_count} contacts)</option>
                ))}
              </select>
            </div>

            {/* Agent Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Bot className="w-4 h-4 inline mr-1" />
                Select Agent
              </label>
              {agentsLoading ? (
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Loading agents...
                </div>
              ) : (
                <select 
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.agent_id} value={agent.agent_id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Phone Number Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4 inline mr-1" />
                Select Phone Number
              </label>
              {phoneNumbersLoading ? (
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Loading phone numbers...
                </div>
              ) : (
                <select 
                  value={selectedPhoneNumber}
                  onChange={(e) => setSelectedPhoneNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose phone number...</option>
                  {phoneNumbers.map((phone) => (
                    <option key={phone.id} value={phone.id}>
                      {phone.number}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Call Status Display */}
          {callStatus && (
            <div className={`flex items-center gap-3 p-3 rounded-lg border mb-4 ${getCallStatusStyle(callStatus)}`}>
              {getCallStatusIcon(callStatus)}
              <div className="flex-1">
                <p className="font-semibold">Current Status: {callStatus}</p>
                <p className="text-sm opacity-80">
                  {callStatus === 'Connecting' && 'Connecting to call service...'}
                  {callStatus === 'Ringing' && 'Attempting to connect...'}
                  {callStatus === 'On Call' && 'Call in progress'}
                  {callStatus === 'Call Rejected' && 'Call was rejected by recipient'}
                  {callStatus === 'Call Completed' && 'Call finished successfully'}
                  {callStatus === 'Failed' && 'Call failed to connect'}
                  {callStatus === 'Processing' && 'Processing call...'}
                  {callStatus === 'Timeout - Check History' && 'Call monitoring timed out - check call history for actual status'}
                </p>
                
                {/* Current Contact and Progress */}
                {isCalling && (
                  <div className="mt-2">
                    {currentContact && (
                      <p className="text-xs font-medium">📞 Calling: {currentContact}</p>
                    )}
                    {callProgress.total > 0 && (
                      <div className="mt-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress: {callProgress.current} / {callProgress.total}</span>
                          <span>{Math.round((callProgress.current / callProgress.total) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(callProgress.current / callProgress.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCallAll}
              disabled={isCalling || !selectedFileContent || selectedFileContent.length === 0 || !selectedAgent || !selectedPhoneNumber}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
            >
              <Phone className="w-5 h-5" /> {isCalling ? 'Calling...' : 'Make Calls'}
            </button>
            {(!selectedFileContent || selectedFileContent.length === 0 || !selectedAgent || !selectedPhoneNumber) && (
              <div className="text-sm text-gray-500 flex items-center flex-col">
                <p>Please select:</p>
                <ul className="list-disc list-inside text-xs mt-1">
                  {!selectedFileContent && <li>CSV file with contacts</li>}
                  {!selectedAgent && <li>Agent to make calls</li>}
                  {!selectedPhoneNumber && <li>Phone number for calls</li>}
                </ul>
              </div>
            )}
            <button 
              onClick={handleStopCalls}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
            >
              <PhoneOff className="w-5 h-5" /> Stop Calls
            </button>
          </div>
        </div>

        {showManualForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              {editingRowIndex !== null ? 'Edit Contact in' : 'Add Contact to'} {selectedFileName || 'CSV File'}
            </h3>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={manualData.name}
                  onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={manualData.phone}
                  onChange={(e) => setManualData({ ...manualData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890 (must include country code)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +1 for US, +91 for India, +44 for UK)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={manualData.language}
                  onChange={(e) => setManualData({ ...manualData, language: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  {editingRowIndex !== null ? 'Update Contact' : 'Add Contact'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualForm(false);
                    setSelectedFile('');
                    setSelectedFileName('');
                    setManualData({ name: '', phone: '', language: 'en' });
                    setEditingRowIndex(null);
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {callOutput && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Call Output</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-64 overflow-auto font-mono text-sm">
              <pre>{callOutput}</pre>
            </div>
          </div>
        )}
        </div>
      </div> 
  );
};

export default MakeCalls;
