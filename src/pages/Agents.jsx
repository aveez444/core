import { useState, useEffect } from 'react';
import { 
  Bot, 
  Save, 
  Loader2, 
  AlertTriangle, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Volume2, 
  Mic, 
  Star,
  Filter,
  Search,
  BookOpen,
  Sparkles,
  ChevronRight,
  Eye,
  Heart,
  Clock,
  TrendingUp,
  X,
  Check,
  Globe,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUpgradeModal } from '../contexts/UpgradeModalContext';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';

const Agents = () => {
  const { getSubscription, getAgentLimit } = useAuth();
  const { openUpgradeModal } = useUpgradeModal();
  const [loading, setLoading] = useState(false);
  const [currentAgentCount, setCurrentAgentCount] = useState(0);
  const [agents, setAgents] = useState([]);
  const [voices, setVoices] = useState([]);
  const [activeTab, setActiveTab] = useState('my-agents'); // 'my-agents', 'templates'
  
  // Template-related state
  const [templates, setTemplates] = useState([]);
  const [templateCategories, setTemplateCategories] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateFilters, setTemplateFilters] = useState({
    category: 'all',
    difficulty: 'all',
    search: '',
    featured: false
  });
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [formValues, setFormValues] = useState({
    name: '',
    prompt: '',
    description: '',
    first_message: '',
    language: 'en',
    voice_id: 'default'
  });
  const [status, setStatus] = useState('');

  const subscription = getSubscription();
  const agentLimit = getAgentLimit();
  const canCreateAgent = currentAgentCount < agentLimit;

  // Fetch data on component mount
  useEffect(() => {
    fetchAgents();
    fetchVoices();
    if (activeTab === 'templates') {
      fetchTemplates();
      fetchTemplateCategories();
    }
  }, [activeTab]);

  const fetchAgents = async () => {
    try {
      const response = await apiService.getAgents();
      if (response.agents) {
        setAgents(response.agents || []);
        setCurrentAgentCount(response.agents?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch current agents');
    }
  };

  const fetchVoices = async () => {
    try {
      const response = await apiService.getVoices();
      if (response.voices) {
        setVoices(response.voices);
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplateLoading(true);
      const params = {
        category: templateFilters.category !== 'all' ? templateFilters.category : undefined,
        difficulty: templateFilters.difficulty !== 'all' ? templateFilters.difficulty : undefined,
        search: templateFilters.search || undefined,
        featured: templateFilters.featured ? 'true' : undefined
      };
      
      const response = await apiService.listAgentTemplates(params);
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load agent templates');
    } finally {
      setTemplateLoading(false);
    }
  };

  const fetchTemplateCategories = async () => {
    try {
      const response = await apiService.getTemplateCategories();
      setTemplateCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching template categories:', error);
    }
  };

  // Update templates when filters change
  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    }
  }, [templateFilters]);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    
    if (!canCreateAgent) {
      toast.error(`You've reached your agent limit (${agentLimit}). Upgrade your plan to create more agents.`);
      return;
    }
    
    if (!canUseLanguage(formValues.language)) {
      toast.error(`${getLanguageName(formValues.language)} is not available with your current plan. Please upgrade to ${getUpgradeRequiredFor(formValues.language)} or select a different language.`);
      return;
    }

    // Validate voice access
    if (formValues.voice_id !== 'default' && !canUseVoice(formValues.voice_id)) {
      const voiceName = getVoiceName(formValues.voice_id);
      const requiredPlan = getVoiceUpgradeRequiredFor(formValues.voice_id);
      toast.error(`${voiceName} voice is not available with your current plan. Please upgrade to ${requiredPlan} or select a different voice.`);
      return;
    }

    setLoading(true);
    setStatus('Creating agent...');
    
    try {
      const agentData = {
        name: formValues.name,
        script: formValues.prompt,  // Send as 'script' to backend
        description: formValues.description,
        first_message: formValues.first_message,
        voice_id: formValues.voice_id,
        language: formValues.language,
        agent_type: 'premium'
      };
      
      const response = await apiService.createAgent(agentData);
      
      if (response.message || response.agent_id) {
        setStatus(`✅ Agent "${formValues.name}" created successfully!`);
        toast.success(`Agent "${formValues.name}" created successfully!`);
        
        resetForm();
        setShowCreateModal(false);
        fetchAgents();
      } else {
        throw new Error(response.error || 'Failed to create agent');
      }
    } catch (error) {
      console.error('❌ Error creating agent:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create agent';
      setStatus(`❌ ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgent = async (e) => {
    e.preventDefault();
    
    if (!canUseLanguage(formValues.language)) {
      toast.error(`${getLanguageName(formValues.language)} is not available with your current plan. Please upgrade to ${getUpgradeRequiredFor(formValues.language)} or select a different language.`);
      return;
    }

    // Validate voice access
    if (formValues.voice_id !== 'default' && !canUseVoice(formValues.voice_id)) {
      const voiceName = getVoiceName(formValues.voice_id);
      const requiredPlan = getVoiceUpgradeRequiredFor(formValues.voice_id);
      toast.error(`${voiceName} voice is not available with your current plan. Please upgrade to ${requiredPlan} or select a different voice.`);
      return;
    }
    
    setLoading(true);
    
    try {
      const agentData = {
        name: formValues.name,
        script: formValues.prompt,  // Send as 'script' to backend
        description: formValues.description,
        first_message: formValues.first_message,
        voice_id: formValues.voice_id,
        language: formValues.language
      };
      
      const response = await apiService.updateAgent(selectedAgent.agent_id, agentData);
      
      if (response.message || response.success) {
        toast.success('Agent updated successfully!');
        resetForm();
        setShowEditModal(false);
        setSelectedAgent(null);
        fetchAgents();
      } else {
        throw new Error(response.error || 'Failed to update agent');
      }
    } catch (error) {
      console.error('❌ Error updating agent:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update agent';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId, agentName) => {
    if (!window.confirm(`Are you sure you want to delete agent "${agentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiService.deleteAgent(agentId);
      if (response.message) {
        toast.success('Agent deleted successfully!');
        fetchAgents();
      } else {
        throw new Error(response.error || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('❌ Error deleting agent:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to delete agent';
      toast.error(errorMsg);
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      setLoading(true);
      const response = await apiService.createAgentFromTemplate(template.template_id);
      
      if (response.success) {
        toast.success(response.message);
        setShowTemplateModal(false);
        setSelectedTemplate(null);
        fetchAgents();
        setActiveTab('my-agents');
      } else {
        throw new Error(response.error || 'Failed to create agent from template');
      }
    } catch (error) {
      console.error('Error using template:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create agent from template';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    if (!canCreateAgent) {
      toast.error(`You've reached your agent limit (${agentLimit}). Upgrade your plan to create more agents.`);
      return;
    }
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (agent) => {
    setSelectedAgent(agent);
    setFormValues({
      name: agent.name || '',
      prompt: agent.conversation_config?.agent?.prompt?.prompt || agent.script || agent.system_prompt || '',
      description: agent.description || '',
      first_message: agent.conversation_config?.agent?.first_message || agent.first_message || '',
      language: agent.language || 'en',
      voice_id: agent.voice_id || 'default'
    });
    setShowEditModal(true);
  };

  const openTemplateModal = (template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      prompt: '',
      description: '',
      first_message: '',
      language: 'en',
      voice_id: 'default'
    });
    setStatus('');
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowTemplateModal(false);
    setSelectedAgent(null);
    setSelectedTemplate(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({...formValues, [name]: value});
  };

  const handleTemplateFilterChange = (key, value) => {
    setTemplateFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getVoiceName = (voiceId) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    return voice ? voice.name : 'Default Voice';
  };

  const getLanguageConfig = () => {
    return [
      { code: 'en', name: 'English', flag: 'US', plan: 'basic' },
      { code: 'hi', name: 'Hindi', flag: 'IN', plan: 'pro' },
      { code: 'es', name: 'Spanish', flag: 'ES', plan: 'enterprise' },
      { code: 'fr', name: 'French', flag: 'FR', plan: 'enterprise' },
      { code: 'de', name: 'German', flag: 'DE', plan: 'enterprise' },
      { code: 'it', name: 'Italian', flag: 'IT', plan: 'enterprise' },
      { code: 'pt', name: 'Portuguese', flag: 'BR', plan: 'enterprise' },
      { code: 'ar', name: 'Arabic', flag: 'SA', plan: 'enterprise' },
      { code: 'zh', name: 'Chinese', flag: 'CN', plan: 'enterprise' },
      { code: 'ja', name: 'Japanese', flag: 'JP', plan: 'enterprise' },
      { code: 'ko', name: 'Korean', flag: 'KR', plan: 'enterprise' },
      { code: 'ru', name: 'Russian', flag: 'RU', plan: 'enterprise' }
    ];
  };

  const getLanguageName = (languageCode) => {
    const language = getLanguageConfig().find(lang => lang.code === languageCode);
    return language ? language.name : 'English';
  };

  const getLanguageFlag = (languageCode) => {
    const language = getLanguageConfig().find(lang => lang.code === languageCode);
    return language ? language.flag : '🇺🇸';
  };

  const canUseLanguage = (languageCode) => {
    const language = getLanguageConfig().find(lang => lang.code === languageCode);
    if (!language) return true;
    
    const userPlan = subscription?.plan_type || 'basic';
    
    if (language.plan === 'basic') return true;
    if (language.plan === 'pro') return ['pro', 'enterprise'].includes(userPlan);
    if (language.plan === 'enterprise') return userPlan === 'enterprise';
    
    return false;
  };

  const getUpgradeRequiredFor = (languageCode) => {
    const language = getLanguageConfig().find(lang => lang.code === languageCode);
    if (!language || canUseLanguage(languageCode)) return null;
    
    const userPlan = subscription?.plan_type || 'basic';
    
    if (language.plan === 'pro' && userPlan === 'basic') return 'Pro';
    if (language.plan === 'enterprise' && ['basic', 'pro'].includes(userPlan)) {
      return userPlan === 'basic' ? 'Pro or Enterprise' : 'Enterprise';
    }
    
    return null;
  };

  // ===============================
  // VOICE ACCESS CONTROL FUNCTIONS
  // ===============================
  
  const canUseVoice = (voiceId) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    if (!voice || !voice.access_control) return true; // Allow if no access control info
    
    return voice.access_control.available;
  };
  
  const getVoiceUpgradeRequiredFor = (voiceId) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    if (!voice || !voice.access_control || canUseVoice(voiceId)) return null;
    
    return voice.access_control.required_plan;
  };
  
  const getVoicePlanInfo = (voiceId) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    if (!voice || !voice.access_control) return null;
    
    return voice.access_control;
  };
  
  const isVoicePremium = (voiceId) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    if (!voice || !voice.access_control) return false;
    
    return !voice.access_control.available && voice.access_control.upgrade_needed;
  };

  const getCategoryName = (categoryCode) => {
    const categoryMap = {
      'sales': 'Sales & Marketing',
      'support': 'Customer Support',
      'appointment': 'Appointment Booking',
      'survey': 'Survey & Feedback',
      'reminder': 'Reminders & Follow-ups',
      'lead_qualification': 'Lead Qualification',
      'debt_collection': 'Debt Collection',
      'event_promotion': 'Event Promotion',
      'product_launch': 'Product Launch',
      'customer_retention': 'Customer Retention',
      'general': 'General Purpose'
    };
    return categoryMap[categoryCode] || categoryCode;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate agent slots based on subscription
  const generateAgentSlots = () => {
    const slots = [];
    const allowedSlots = agentLimit; // User's actual limit (2 for basic, 4 for pro, 10 for custom)
    
    // Determine how many slots to show based on plan
    let totalSlotsToShow;
    let nextTier;
    
    if (subscription?.plan_type === 'basic') {
      totalSlotsToShow = 4; // Show 4 slots (2 allowed + 2 locked) to encourage Pro upgrade
      nextTier = 'Pro';
    } else if (subscription?.plan_type === 'pro') {
      totalSlotsToShow = 10; // Show 10 slots (4 allowed + 6 locked) to encourage Enterprise upgrade
      nextTier = 'Enterprise';
    } else {
      totalSlotsToShow = 10; // Enterprise/Custom plan shows all 10 slots
      nextTier = null;
    }
    
    // Fill with existing agents
    agents.forEach((agent, index) => {
      slots.push({
        type: 'agent',
        agent: agent,
        index: index
      });
    });
    
    // Fill remaining allowed slots with empty slots
    const emptySlots = Math.max(0, allowedSlots - agents.length);
    for (let i = 0; i < emptySlots; i++) {
      slots.push({
        type: 'empty',
        index: agents.length + i
      });
    }
    
    // Fill remaining slots with locked slots
    const lockedSlots = totalSlotsToShow - allowedSlots;
    for (let i = 0; i < lockedSlots; i++) {
      slots.push({
        type: 'locked',
        index: allowedSlots + i,
        nextTier: nextTier
      });
    }
    
    return slots;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-gray-800">
                <Bot className="w-8 h-8 text-indigo-600" /> 
                AI Agents
              </h1>
              <p className="text-gray-600">Manage your conversational AI agents and explore templates</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={openCreateModal}
                disabled={!canCreateAgent && activeTab === 'my-agents'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  canCreateAgent || activeTab !== 'my-agents'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                Create Agent
              </button>
              
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'templates'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                } transform hover:scale-105`}
              >
                <BookOpen className="w-4 h-4" />
                Templates
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('my-agents')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-agents'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  My Agents ({agents.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Agent Templates
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* My Agents Tab */}
        {activeTab === 'my-agents' && (
          <>
            {/* Subscription Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Agent Usage</p>
                    <p className="text-sm text-gray-600">
                      {currentAgentCount} of {agentLimit} agents created
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="font-semibold text-indigo-600 capitalize">
                    {subscription?.plan_type || 'None'}
                  </p>
                </div>
              </div>
              {!canCreateAgent && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    You've reached your agent limit. Upgrade your plan to create more agents.
                  </span>
                </div>
              )}
            </div>

            {/* Agent Slots Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {generateAgentSlots().map((slot, index) => {
                if (slot.type === 'agent') {
                  const agent = slot.agent;
                  return (
                    <div key={agent.agent_id} className="relative group bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-48 transition-all duration-300 hover:shadow-lg hover:border-indigo-300 transform hover:scale-105">
                      {/* Agent Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => openEditModal(agent)}
                            className="p-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                            title="Edit Agent"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAgent(agent.agent_id, agent.name)}
                            className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                            title="Delete Agent"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Agent Icon */}
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-3 mx-auto">
                        <Bot className="w-6 h-6 text-white" />
                      </div>

                      {/* Agent Details */}
                      <div className="text-center">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate" title={agent.name}>
                          {agent.name}
                        </h3>
                        
                        {agent.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2" title={agent.description}>
                            {agent.description}
                          </p>
                        )}

                        {/* Agent Language & Voice */}
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm">{getLanguageFlag(agent.language)}</span>
                            <span>{getLanguageName(agent.language)}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            <span>{getVoiceName(agent.voice_id || 'default')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else if (slot.type === 'empty') {
                  return (
                    <div 
                      key={`empty-${slot.index}`}
                      onClick={openCreateModal}
                      className="relative group bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 h-48 flex flex-col items-center justify-center transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transform hover:scale-105"
                    >
                      <div className="p-3 rounded-full mb-3 bg-gray-100 group-hover:bg-indigo-100 transition-colors duration-300">
                        <Plus className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
                      </div>
                      <p className="text-xs text-gray-500 text-center font-medium">Add New Agent</p>
                      <p className="text-xs text-gray-400 text-center mt-1">Slot {slot.index + 1}</p>
                    </div>
                  );
                } else if (slot.type === 'locked') {
                  return (
                    <div 
                      key={`locked-${slot.index}`}
                      onClick={openUpgradeModal}
                      className="relative bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 h-48 flex flex-col items-center justify-center opacity-80 cursor-pointer hover:opacity-100 hover:scale-105 transition-all duration-300"
                    >
                      {/* Golden Lock Icon */}
                      <div className="p-3 rounded-full mb-3 bg-gradient-to-br from-yellow-200 to-orange-300">
                        <svg className="w-6 h-6 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-xs text-yellow-700 text-center font-semibold mb-1">Locked Slot</p>
                      <p className="text-xs text-yellow-600 text-center leading-tight">
                        {slot.nextTier ? `Upgrade to ${slot.nextTier} to unlock` : 'Available in higher plans'}
                      </p>
                    </div>
                  );
                }
              })}
            </div>
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <>
            {/* Template Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center flex-1">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={templateFilters.search}
                      onChange={(e) => handleTemplateFilterChange('search', e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={templateFilters.category}
                    onChange={(e) => handleTemplateFilterChange('category', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {templateCategories.map((category) => (
                      <option key={category.code} value={category.code}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>

                  {/* Difficulty Filter */}
                  <select
                    value={templateFilters.difficulty}
                    onChange={(e) => handleTemplateFilterChange('difficulty', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>

                  {/* Featured Toggle */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={templateFilters.featured}
                      onChange={(e) => handleTemplateFilterChange('featured', e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Featured only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            {templateLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading templates...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.template_id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {/* Template Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                            {template.name}
                          </h3>
                          {template.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    {/* Template Meta */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {getCategoryName(template.category)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(template.difficulty_level)}`}>
                        {template.difficulty_level}
                      </span>
                    </div>

                    {/* Template Stats */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{template.usage_count} uses</span>
                      </div>
                      {template.average_rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>{template.average_rating}/5</span>
                        </div>
                      )}
                    </div>

                    {/* Key Features */}
                    {template.key_features && template.key_features.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Key Features:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {template.key_features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <Check className="w-3 h-3 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openTemplateModal(template)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        disabled={!canCreateAgent || loading}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State for Templates */}
            {!templateLoading && templates.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No templates found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        )}

        {/* Create Agent Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Bot className="w-6 h-6 text-indigo-600" />
                    Create New Agent
                  </h2>
                  <button 
                    onClick={closeModals}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleCreateAgent} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formValues.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter agent name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language *</label>
                    <div className="relative">
                      <select
                        name="language"
                        value={formValues.language}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        {getLanguageConfig().map((lang) => {
                          const canUse = canUseLanguage(lang.code);
                          return (
                            <option 
                              key={lang.code} 
                              value={lang.code}
                              disabled={!canUse}
                              style={!canUse ? {color: '#9CA3AF'} : {}}
                            >
                              {lang.flag} {lang.name} {!canUse ? ' 👑' : ''}
                            </option>
                          );
                        })}
                      </select>
                      
                      {/* Crown icon for premium languages with tooltip */}
                      {!canUseLanguage(formValues.language) && (
                        <div 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-help"
                          title={`Upgrade to ${getUpgradeRequiredFor(formValues.language)} to use this language`}
                        >
                          <span className="text-xl">
                            👑
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Language restriction message */}
                    {!canUseLanguage(formValues.language) && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                          <Crown className="w-2 h-2 text-white" />
                        </div>
                        Upgrade to {getUpgradeRequiredFor(formValues.language)} to use {getLanguageName(formValues.language)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                  <div className="relative">
                    <select
                      name="voice_id"
                      value={formValues.voice_id}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="default">Default Voice</option>
                      {voices.map((voice) => {
                        const canUse = canUseVoice(voice.voice_id);
                        const isPremium = isVoicePremium(voice.voice_id);
                        return (
                          <option 
                            key={voice.voice_id} 
                            value={voice.voice_id}
                            disabled={!canUse}
                            style={!canUse ? {color: '#9CA3AF'} : {}}
                          >
                            {voice.name} {isPremium ? ' 👑' : ''}
                          </option>
                        );
                      })}
                    </select>
                    
                    {/* Crown icon for premium voices with tooltip */}
                    {formValues.voice_id !== 'default' && isVoicePremium(formValues.voice_id) && (
                      <div 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-help"
                        title={`Upgrade to ${getVoiceUpgradeRequiredFor(formValues.voice_id)} to use this voice`}
                      >
                        <span className="text-xl">
                          👑
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Voice restriction message */}
                  {formValues.voice_id !== 'default' && !canUseVoice(formValues.voice_id) && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <Crown className="w-2 h-2 text-white" />
                      </div>
                      Upgrade to {getVoiceUpgradeRequiredFor(formValues.voice_id)} to use {getVoiceName(formValues.voice_id)} voice
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formValues.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Brief description of your agent's purpose"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Message</label>
                  <textarea
                    name="first_message"
                    value={formValues.first_message}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="The first message your agent will say when a call starts (e.g., 'Hello! How can I help you today?')"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Script *</label>
                  <textarea
                    name="prompt"
                    value={formValues.prompt}
                    onChange={handleInputChange}
                    rows="8"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter the script that defines your agent's behavior and personality..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Create Agent
                      </>
                    )}
                  </button>
                </div>

                {status && (
                  <div className={`p-3 rounded-lg text-sm ${
                    status.includes('✅') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {status}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Template Details Modal */}
        {showTemplateModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-800">{selectedTemplate.name}</h2>
                    {selectedTemplate.is_featured && (
                      <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <button 
                    onClick={closeModals}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Template Meta */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {getCategoryName(selectedTemplate.category)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(selectedTemplate.difficulty_level)}`}>
                    {selectedTemplate.difficulty_level}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{selectedTemplate.usage_count} uses</span>
                  </div>
                  {selectedTemplate.average_rating > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4" />
                      <span>{selectedTemplate.average_rating}/5</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>

                {/* Key Features */}
                {selectedTemplate.key_features && selectedTemplate.key_features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedTemplate.key_features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Use Cases */}
                {selectedTemplate.suggested_use_cases && selectedTemplate.suggested_use_cases.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Suggested Use Cases</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedTemplate.suggested_use_cases.map((useCase, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeModals}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    disabled={!canCreateAgent || loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Agent...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Use This Template
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Agent Modal - Similar to Create Modal but with edit logic */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Edit className="w-6 h-6 text-indigo-600" />
                    Edit Agent
                  </h2>
                  <button 
                    onClick={closeModals}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleEditAgent} className="p-6 space-y-6">
                {/* Same form fields as create modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formValues.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter agent name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language *</label>
                    <div className="relative">
                      <select
                        name="language"
                        value={formValues.language}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        {getLanguageConfig().map((lang) => {
                          const canUse = canUseLanguage(lang.code);
                          return (
                            <option 
                              key={lang.code} 
                              value={lang.code}
                              disabled={!canUse}
                              style={!canUse ? {color: '#9CA3AF'} : {}}
                            >
                              {lang.flag} {lang.name} {!canUse ? ' 👑' : ''}
                            </option>
                          );
                        })}
                      </select>
                      
                      {/* Crown icon for premium languages with tooltip */}
                      {!canUseLanguage(formValues.language) && (
                        <div 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-help"
                          title={`Upgrade to ${getUpgradeRequiredFor(formValues.language)} to use this language`}
                        >
                          <span className="text-xl">
                            👑
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Language restriction message */}
                    {!canUseLanguage(formValues.language) && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                          <Crown className="w-2 h-2 text-white" />
                        </div>
                        Upgrade to {getUpgradeRequiredFor(formValues.language)} to use {getLanguageName(formValues.language)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                  <div className="relative">
                    <select
                      name="voice_id"
                      value={formValues.voice_id}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="default">Default Voice</option>
                      {voices.map((voice) => {
                        const canUse = canUseVoice(voice.voice_id);
                        const isPremium = isVoicePremium(voice.voice_id);
                        return (
                          <option 
                            key={voice.voice_id} 
                            value={voice.voice_id}
                            disabled={!canUse}
                            style={!canUse ? {color: '#9CA3AF'} : {}}
                          >
                            {voice.name} {isPremium ? ' 👑' : ''}
                          </option>
                        );
                      })}
                    </select>
                    
                    {/* Crown icon for premium voices with tooltip */}
                    {formValues.voice_id !== 'default' && isVoicePremium(formValues.voice_id) && (
                      <div 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-help"
                        title={`Upgrade to ${getVoiceUpgradeRequiredFor(formValues.voice_id)} to use this voice`}
                      >
                        <span className="text-xl">
                          👑
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Voice restriction message */}
                  {formValues.voice_id !== 'default' && !canUseVoice(formValues.voice_id) && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <Crown className="w-2 h-2 text-white" />
                      </div>
                      Upgrade to {getVoiceUpgradeRequiredFor(formValues.voice_id)} to use {getVoiceName(formValues.voice_id)} voice
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formValues.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Brief description of your agent's purpose"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Message</label>
                  <textarea
                    name="first_message"
                    value={formValues.first_message}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="The first message your agent will say when a call starts (e.g., 'Hello! How can I help you today?')"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Script *</label>
                  <textarea
                    name="prompt"
                    value={formValues.prompt}
                    onChange={handleInputChange}
                    rows="8"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter the script that defines your agent's behavior and personality..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update Agent
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agents;
