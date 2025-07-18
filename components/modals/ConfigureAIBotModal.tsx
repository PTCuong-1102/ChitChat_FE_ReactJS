import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../icons/Icons';

interface ConfigureAIBotModalProps {
  onClose: () => void;
  onConfigure: (botName: string, model: string, provider: string, apiKey: string) => void;
}

interface Model {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
}

interface Provider {
  name: string;
  models: Model[];
  description: string;
  apiKeyPlaceholder: string;
  helpUrl: string;
  pricing?: string;
}

const LLM_PROVIDERS: Record<string, Provider> = {
  gemini: {
    name: 'Google Gemini',
    description: 'Google\'s most capable AI model with multimodal capabilities',
    apiKeyPlaceholder: 'Enter your Google AI API key...',
    helpUrl: 'https://ai.google.dev/gemini-api/docs',
    pricing: 'Free tier available',
    models: [
      { 
        id: 'gemini-1.5-flash', 
        name: 'Gemini 1.5 Flash',
        description: 'Fast and efficient model for most tasks',
        contextWindow: 1048576
      },
      { 
        id: 'gemini-1.5-pro', 
        name: 'Gemini 1.5 Pro',
        description: 'Most capable model for complex reasoning',
        contextWindow: 2097152
      }
    ],
  },
  openai: {
    name: 'OpenAI',
    description: 'Industry-leading AI models from OpenAI',
    apiKeyPlaceholder: 'Enter your OpenAI API key...',
    helpUrl: 'https://platform.openai.com/docs',
    pricing: 'Pay-per-use',
    models: [
      { 
        id: 'gpt-4o', 
        name: 'GPT-4o',
        description: 'Most advanced multimodal model',
        contextWindow: 128000
      },
      { 
        id: 'gpt-4o-mini', 
        name: 'GPT-4o Mini',
        description: 'Affordable and intelligent small model',
        contextWindow: 128000
      },
      { 
        id: 'gpt-4-turbo', 
        name: 'GPT-4 Turbo',
        description: 'High-performance model with enhanced capabilities',
        contextWindow: 128000
      },
      { 
        id: 'gpt-3.5-turbo', 
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective model',
        contextWindow: 16385
      }
    ],
  },
  mistral: {
    name: 'Mistral AI',
    description: 'European AI company with efficient and capable models',
    apiKeyPlaceholder: 'Enter your Mistral API key...',
    helpUrl: 'https://docs.mistral.ai/',
    pricing: 'Competitive pricing',
    models: [
      { 
        id: 'mistral-large-latest', 
        name: 'Mistral Large',
        description: 'Most capable model for complex tasks',
        contextWindow: 128000
      },
      { 
        id: 'mistral-medium-latest', 
        name: 'Mistral Medium',
        description: 'Balanced performance and cost',
        contextWindow: 32000
      },
      { 
        id: 'mistral-small-latest', 
        name: 'Mistral Small',
        description: 'Fast and efficient for simple tasks',
        contextWindow: 32000
      }
    ],
  }
};

const ConfigureAIBotModal: React.FC<ConfigureAIBotModalProps> = ({ onClose, onConfigure }) => {
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [botName, setBotName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);
  
  useEffect(() => {
    // Reset model and errors when provider changes
    setModel('');
    setErrors({});
    if (provider && LLM_PROVIDERS[provider]?.models.length > 0) {
      setModel(LLM_PROVIDERS[provider].models[0].id);
    }
  }, [provider]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!provider) {
      newErrors.provider = 'Please select a provider';
    }
    
    if (!model) {
      newErrors.model = 'Please select a model';
    }
    
    if (!botName.trim()) {
      newErrors.botName = 'Bot name is required';
    } else if (botName.trim().length < 2) {
      newErrors.botName = 'Bot name must be at least 2 characters';
    } else if (botName.trim().length > 50) {
      newErrors.botName = 'Bot name must be less than 50 characters';
    }
    
    if (!apiKey.trim()) {
      newErrors.apiKey = 'API key is required';
    } else if (apiKey.trim().length < 10) {
      newErrors.apiKey = 'API key appears to be too short';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API validation delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onConfigure(botName.trim(), model, provider, apiKey.trim());
      onClose();
    } catch (error) {
      setErrors({ submit: 'Failed to configure bot. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = botName.trim() && model && provider && apiKey.trim();
  const isProviderSelected = !!provider;
  const currentProvider = provider ? LLM_PROVIDERS[provider] : null;
  const selectedModel = model ? currentProvider?.models.find(m => m.id === model) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
            <CloseIcon />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Configure AI Bot</h2>
          <p className="text-gray-500">
            Set up your AI assistant by selecting a provider and providing your credentials.
          </p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label htmlFor="llmProvider" className="block text-sm font-medium text-gray-700 mb-2">LLM Provider</label>
              <select
                id="llmProvider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg bg-white border-2 focus:outline-none transition-colors ${
                  errors.provider ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                }`}
              >
                <option value="" disabled>Select a provider</option>
                {Object.entries(LLM_PROVIDERS).map(([id, providerData]) => (
                  <option key={id} value={id}>
                    {providerData.name}
                  </option>
                ))}
              </select>
              {errors.provider && <p className="mt-1 text-sm text-red-600">{errors.provider}</p>}
            </div>
            
            {/* Provider Info */}
            {currentProvider && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">{currentProvider.name}</h3>
                <p className="text-sm text-blue-700 mb-2">{currentProvider.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600">💰 {currentProvider.pricing}</span>
                  <a 
                    href={currentProvider.helpUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    📚 Documentation
                  </a>
                </div>
              </div>
            )}
            
            {/* API Key */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">API Key</label>
                <button
                  type="button"
                  onClick={() => setShowApiKeyHelp(!showApiKeyHelp)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Need help?
                </button>
              </div>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={currentProvider?.apiKeyPlaceholder || "Enter your API key..."}
                className={`w-full px-4 py-3 rounded-lg bg-white border-2 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.apiKey ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                }`}
                required
                disabled={!isProviderSelected}
              />
              {errors.apiKey && <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>}
              
              {showApiKeyHelp && currentProvider && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Get your API key from the{' '}
                    <a href={currentProvider.helpUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      {currentProvider.name} documentation
                    </a>
                    . Make sure to keep it secure and never share it publicly.
                  </p>
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div>
              <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
              <select
                id="aiModel"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg bg-white border-2 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.model ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                }`}
                disabled={!isProviderSelected || !currentProvider?.models.length}
              >
                <option value="" disabled>Select a model</option>
                {currentProvider?.models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
            </div>
            
            {/* Model Info */}
            {selectedModel && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-1">{selectedModel.name}</h4>
                <p className="text-sm text-green-700 mb-2">{selectedModel.description}</p>
                {selectedModel.contextWindow && (
                  <p className="text-sm text-green-600">
                    📝 Context Window: {selectedModel.contextWindow.toLocaleString()} tokens
                  </p>
                )}
              </div>
            )}

            {/* Bot Name */}
            <div>
              <label htmlFor="botName" className="block text-sm font-medium text-gray-700 mb-2">Bot Name</label>
              <input
                id="botName"
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Enter a friendly name for your bot..."
                className={`w-full px-4 py-3 rounded-lg bg-white border-2 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.botName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                }`}
                required
                disabled={!isProviderSelected}
                maxLength={50}
              />
              {errors.botName && <p className="mt-1 text-sm text-red-600">{errors.botName}</p>}
              <p className="mt-1 text-sm text-gray-500">{botName.length}/50 characters</p>
            </div>
            
            {/* Error Messages */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}
            
            {/* Security Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-amber-500 mr-2">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">Security Warning</p>
                  <p className="text-sm text-amber-700">
                    API keys are handled in the browser and stored only for this session. For maximum security, 
                    always prefer applications that manage keys on a secure backend. Do not leave this page open 
                    in untrusted environments.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Configuring...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  ✓ Configure Bot
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfigureAIBotModal;