import React, { useState, useEffect } from 'react';
import { Volume2, Play, Sparkles } from 'lucide-react';
import VoicePreview from '../components/voice/VoicePreview';
import VoiceSelectionModal from '../components/voice/VoiceSelectionModal';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';

const VoicePreviewTest = () => {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [customSampleText, setCustomSampleText] = useState(
    "Hello! Welcome to CallGenie's voice preview system. This is how I would sound as your AI agent."
  );

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVoices();
      
      if (response.voices) {
        // Get first 8 voices for preview
        const limitedVoices = response.voices.slice(0, 8);
        
        // Enhance with voice details
        const enhancedVoices = await Promise.all(
          limitedVoices.map(async (voice) => {
            try {
              const details = await apiService.getVoiceDetails(voice.voice_id);
              return {
                ...voice,
                ...details,
                characteristics: details.characteristics || {}
              };
            } catch (error) {
              console.warn(`Failed to fetch details for voice ${voice.voice_id}`);
              return voice;
            }
          })
        );
        
        setVoices(enhancedVoices);
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
      toast.error('Failed to load voices');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSelect = (voice) => {
    setSelectedVoice(voice);
    toast.success(`Selected voice: ${voice.name}`);
  };

  const handleModalVoiceSelect = (voice) => {
    setSelectedVoice(voice);
    toast.success(`Selected voice from modal: ${voice.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Voice Preview System</h1>
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience our enhanced circular voice preview system! Each voice is displayed with a beautiful circular avatar, 
              allowing you to preview and select voices with an intuitive, modern interface.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sample Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Sample Text
              </label>
              <textarea
                value={customSampleText}
                onChange={(e) => setCustomSampleText(e.target.value)}
                placeholder="Enter custom text for voice samples..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows="3"
                maxLength="200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {customSampleText.length}/200 characters
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Open Full Voice Selection Modal
              </button>

              <button
                onClick={fetchVoices}
                disabled={loading}
                className="w-full border border-indigo-300 text-indigo-600 px-6 py-3 rounded-xl font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Voices'}
              </button>

              {selectedVoice && (
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <p className="text-sm font-medium text-indigo-800">
                    Currently Selected:
                  </p>
                  <p className="text-lg font-semibold text-indigo-900">
                    {selectedVoice.name}
                  </p>
                  <p className="text-sm text-indigo-600">
                    ID: {selectedVoice.voice_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voice Preview Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Voice Gallery</h2>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              Circular Design
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600">Loading amazing voices...</p>
              </div>
            </div>
          ) : voices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {voices.map((voice) => (
                <VoicePreview
                  key={voice.voice_id}
                  voice={voice}
                  onVoiceSelect={handleVoiceSelect}
                  selectedVoice={selectedVoice}
                  customText={customSampleText}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No voices available</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Enhanced Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Audio Preview</h3>
              <p className="text-gray-600 text-sm">
                Generate and play voice samples directly in the interface with high-quality audio
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Circular Design</h3>
              <p className="text-gray-600 text-sm">
                Beautiful circular avatars with voice names and characteristics displayed elegantly
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Selection</h3>
              <p className="text-gray-600 text-sm">
                Advanced filtering, search, and selection capabilities with visual feedback
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Selection Modal */}
      <VoiceSelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVoiceSelect={handleModalVoiceSelect}
        selectedVoice={selectedVoice}
        customSampleText={customSampleText}
      />
    </div>
  );
};

export default VoicePreviewTest;
