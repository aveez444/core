import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Loader2, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

const VoicePreview = ({ voice, onVoiceSelect, selectedVoice, customText }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const audioRef = useRef(null);

  const defaultSampleText = "Hello! This is a voice preview sample. How does this sound for your AI agent?";
  const sampleText = customText || defaultSampleText;

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const generateVoiceSample = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await apiService.generateVoiceSample({
        voice_id: voice.voice_id,
        text: sampleText
      });

      if (response.success) {
        // Create audio object from base64 data
        const audioBlob = new Blob([Uint8Array.from(atob(response.audio_base64), c => c.charCodeAt(0))], 
          { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioData({
          url: audioUrl,
          base64: response.audio_base64
        });
        setHasGenerated(true);
        toast.success('Voice sample generated!');
      } else {
        throw new Error(response.message || 'Failed to generate voice sample');
      }
    } catch (error) {
      console.error('Voice sample generation error:', error);
      setError(error.message || 'Failed to generate voice sample');
      toast.error('Failed to generate voice sample');
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = async () => {
    if (!audioData) {
      await generateVoiceSample();
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(audioData.url);
      
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
      };

      await audioRef.current.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const regenerateSample = () => {
    setAudioData(null);
    setHasGenerated(false);
    setError(null);
    generateVoiceSample();
  };

  const handleVoiceSelect = () => {
    if (onVoiceSelect) {
      onVoiceSelect(voice);
    }
  };

  const isSelected = selectedVoice?.voice_id === voice.voice_id;

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-300 p-6 hover:shadow-xl hover:scale-[1.02] ${
      isSelected ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg' : 'border-gray-200 hover:border-indigo-300'
    }`}>
      {/* Voice Avatar and Header */}
      <div className="flex flex-col items-center text-center mb-4 relative">
        {/* Selection Status */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
        
        {/* Circular Avatar */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 transition-all duration-300 ${
          isSelected 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg' 
            : 'bg-gradient-to-br from-gray-400 to-gray-600 hover:from-indigo-400 hover:to-purple-500'
        }`}>
          {voice.name.charAt(0).toUpperCase()}
        </div>
        
        {/* Voice Name */}
        <h3 className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
          isSelected ? 'text-indigo-800' : 'text-gray-900'
        }`}>
          {voice.name}
        </h3>
        
        {/* Voice Category Badge */}
        {voice.category && (
          <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs font-medium rounded-full mb-3">
            {voice.category}
          </span>
        )}
        
        {/* Voice Characteristics */}
        {voice.characteristics && (
          <div className="flex flex-wrap gap-1 justify-center mb-3">
            {Object.entries(voice.characteristics).map(([key, value]) => (
              value && value !== 'Unknown' && (
                <span key={key} className="px-2 py-1 bg-white/80 backdrop-blur-sm text-gray-700 text-xs rounded-full border border-gray-200">
                  {key}: {value}
                </span>
              )
            ))}
          </div>
        )}
      </div>

      {/* Preview Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {/* Play/Generate Button */}
        <button
          onClick={isPlaying ? pauseAudio : playAudio}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex-1 justify-center max-w-xs ${
            isGenerating ? 
              'bg-gray-100 text-gray-400 cursor-not-allowed' :
              hasGenerated ?
                isSelected 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' :
                'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 hover:scale-105'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </>
          ) : hasGenerated ? (
            <>
              <Play className="w-4 h-4" />
              <span>Play Again</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Preview Voice</span>
            </>
          )}
        </button>

        {/* Regenerate Button */}
        {hasGenerated && !isGenerating && (
          <button
            onClick={regenerateSample}
            className={`p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
              isSelected 
                ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200' 
                : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200'
            }`}
            title="Generate new sample"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg mb-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Sample Text Preview */}
      {hasGenerated && (
        <div className="bg-gray-50 rounded-lg p-2 mb-3">
          <p className="text-xs text-gray-600 font-medium mb-1">Sample Text:</p>
          <p className="text-sm text-gray-800 italic">"{sampleText}"</p>
        </div>
      )}

      {/* Select Voice Button */}
      <button
        onClick={handleVoiceSelect}
        className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
          isSelected ?
            'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' :
            'border border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50'
        }`}
      >
        {isSelected ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Selected
          </span>
        ) : (
          'Select Voice'
        )}
      </button>

      {/* Voice ID (for debugging in development) */}
      {process.env.NODE_ENV === 'development' && (
        <p className="text-xs text-gray-400 mt-2 font-mono">ID: {voice.voice_id}</p>
      )}
    </div>
  );
};

export default VoicePreview;
