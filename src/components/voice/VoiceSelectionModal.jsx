import { useState, useEffect } from 'react';
import { X, Search, Filter, Volume2, Grid, List } from 'lucide-react';
import VoicePreview from './VoicePreview';
import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

const VoiceSelectionModal = ({ isOpen, onClose, onVoiceSelect, selectedVoice, customSampleText }) => {
  const [voices, setVoices] = useState([]);
  const [filteredVoices, setFilteredVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [localSelectedVoice, setLocalSelectedVoice] = useState(selectedVoice);

  useEffect(() => {
    if (isOpen) {
      fetchVoices();
    }
  }, [isOpen]);

  useEffect(() => {
    filterVoices();
  }, [voices, searchTerm, selectedCategory, selectedGender]);

  const fetchVoices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVoices();
      
      if (response.voices) {
        // Enhance voices with detailed information
        const enhancedVoices = await Promise.all(
          response.voices.map(async (voice) => {
            try {
              const details = await apiService.getVoiceDetails(voice.voice_id);
              return {
                ...voice,
                ...details,
                characteristics: details.characteristics || {}
              };
            } catch (error) {
              console.warn(`Failed to fetch details for voice ${voice.voice_id}:`, error);
              return voice;
            }
          })
        );
        
        setVoices(enhancedVoices);
        setFilteredVoices(enhancedVoices);
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
      toast.error('Failed to load voices');
    } finally {
      setLoading(false);
    }
  };

  const filterVoices = () => {
    let filtered = voices;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(voice =>
        voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (voice.description && voice.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(voice => 
        voice.category && voice.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by gender
    if (selectedGender !== 'all') {
      filtered = filtered.filter(voice => 
        voice.characteristics?.gender && 
        voice.characteristics.gender.toLowerCase() === selectedGender.toLowerCase()
      );
    }

    setFilteredVoices(filtered);
  };

  const handleVoiceSelect = (voice) => {
    setLocalSelectedVoice(voice);
  };

  const handleConfirmSelection = () => {
    if (localSelectedVoice) {
      onVoiceSelect(localSelectedVoice);
      onClose();
    } else {
      toast.error('Please select a voice first');
    }
  };

  const handleClose = () => {
    setLocalSelectedVoice(selectedVoice); // Reset to original selection
    onClose();
  };

  // Get unique categories and genders for filters
  const categories = [...new Set(voices.map(v => v.category).filter(Boolean))];
  const genders = [...new Set(voices.map(v => v.characteristics?.gender).filter(Boolean))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Select Voice</h2>
              <p className="text-sm text-gray-600">
                Choose a voice for your AI agent. Click preview to hear samples.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search voices by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Genders</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          {(searchTerm || selectedCategory !== 'all' || selectedGender !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>
                Showing {filteredVoices.length} of {voices.length} voices
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                {selectedGender !== 'all' && ` (${selectedGender})`}
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedGender('all');
                }}
                className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Voice List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600">Loading voices...</p>
              </div>
            </div>
          ) : filteredVoices.length === 0 ? (
            <div className="text-center py-12">
              <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No voices found matching your criteria</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {filteredVoices.map((voice) => (
                <VoicePreview
                  key={voice.voice_id}
                  voice={voice}
                  onVoiceSelect={handleVoiceSelect}
                  selectedVoice={localSelectedVoice}
                  customText={customSampleText}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {localSelectedVoice ? (
              <span>Selected: <strong>{localSelectedVoice.name}</strong></span>
            ) : (
              <span>Select a voice to continue</span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!localSelectedVoice}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                localSelectedVoice
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Select Voice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelectionModal;
