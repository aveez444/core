import { createContext, useContext, useState } from 'react';
import { X, Check, ExternalLink } from 'lucide-react';

const UpgradeModalContext = createContext();

export const useUpgradeModal = () => {
  const context = useContext(UpgradeModalContext);
  if (!context) {
    throw new Error('useUpgradeModal must be used within UpgradeModalProvider');
  }
  return context;
};

export const UpgradeModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openUpgradeModal = () => setIsOpen(true);
  const closeUpgradeModal = () => setIsOpen(false);

  return (
    <UpgradeModalContext.Provider value={{ openUpgradeModal, closeUpgradeModal, isOpen }}>
      {children}
      
      {/* Upgrade Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
                <button 
                  onClick={closeUpgradeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pro Plan */}
                <div className="border-2 border-purple-200 rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-6">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Pro Plan</h3>
                    <div className="text-3xl font-bold text-purple-600 mb-1">₹2,999</div>
                    <div className="text-gray-500 text-sm">per month</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">4 AI agents (vs 2 in Basic)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">1000 AI calls per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Premium voice quality</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Advanced analytics dashboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Call recordings & transcripts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">24/7 Priority support</span>
                    </li>
                  </ul>
                  <a 
                    href="https://wa.me/919518337344?text=Hi%2C%20I%27m%20interested%20in%20the%20Pro%20Plan%20for%20CallGenie" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Choose Pro Plan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                {/* Enterprise Plan */}
                <div className="border-2 border-yellow-200 rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Enterprise Plan</h3>
                    <div className="text-3xl font-bold text-orange-600 mb-1">Custom</div>
                    <div className="text-gray-500 text-sm">tailored pricing</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">10 AI agents (unlimited)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Unlimited AI calls</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Custom voice training</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">White-label solution</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">API integration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Dedicated account manager</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Enterprise-grade security</span>
                    </li>
                  </ul>
                  <a 
                    href="https://wa.me/919518337344?text=Hi%2C%20I%27m%20interested%20in%20an%20Enterprise%20Plan%20for%20CallGenie.%20Please%20share%20more%20details." 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors"
                  >
                    Get Enterprise Quote
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  All plans include free setup and onboarding support.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </UpgradeModalContext.Provider>
  );
};

export default UpgradeModalContext;
