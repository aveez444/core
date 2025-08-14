import { useState } from 'react';
import { Crown, Shield, Phone, Users, Calendar, ExternalLink, MessageCircle, Mail, CheckCircle, TrendingUp, Zap, Award, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Subscription = () => {
  const { getSubscription } = useAuth();
  const subscription = getSubscription();
  const [activeTab, setActiveTab] = useState('current');

  const planFeatures = {
    starter: {
      name: 'Starter Plan',
      price: '$82/month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'Up to 300 calls per month',
        '2 AI agents',
        '500 contacts',
        'Basic call flows',
        'Standard reporting',
        '1 language support',
        'Email support'
      ]
    },
    business: {
      name: 'Business Plan',
      price: '$249/month',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      features: [
        '400-800 calls per month',
        '4 AI agents',
        '1000 contacts',
        'Custom call flows',
        'Advanced analytics',
        '2-3 language support',
        'SMS & Auto-scheduling',
        'Priority support'
      ]
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: 'Custom',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        '700-1200+ calls per month',
        '10 AI agents',
        '5000+ contacts',
        'Fully customized call flows',
        'Real-time sentiment analysis',
        'Multilingual support',
        'API access for integrations',
        '24/7 dedicated support',
        'White-label solution'
      ]
    }
  };

  const currentPlan = planFeatures[subscription?.plan_type?.toLowerCase()] || planFeatures.starter;

  const handleContactSupport = (medium, plan = '') => {
    const message = plan 
      ? `Hi, I'm interested in upgrading to the ${plan} for CallGenie. Please provide more details.`
      : `Hi, I have a question about my CallGenie subscription. Please help.`;
    
    if (medium === 'whatsapp') {
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/919518337344?text=${encodedMessage}`, '_blank');
    } else if (medium === 'email') {
      const encodedSubject = encodeURIComponent(`CallGenie Subscription Inquiry`);
      const encodedMessage = encodeURIComponent(message);
      window.open(`mailto:support@callgenie.com?subject=${encodedSubject}&body=${encodedMessage}`, '_blank');
    }
    
    toast.success(`Opening ${medium} to contact support...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Subscription & Billing</h1>
          <p className="text-gray-600">Manage your subscription plan and billing preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'current'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Current Plan
          </button>
          <button
            onClick={() => setActiveTab('upgrade')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'upgrade'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upgrade Options
          </button>
        </div>

        {activeTab === 'current' && (
          <>
            {/* Current Subscription */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
              {/* Plan Header */}
              <div className={`${currentPlan.bgColor} px-8 py-6 border-b ${currentPlan.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full bg-white shadow-md`}>
                      <Crown className={`w-8 h-8 ${currentPlan.color}`} />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${currentPlan.color}`}>
                        {currentPlan.name}
                      </h2>
                      <p className="text-gray-600">Your current active plan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${currentPlan.color}`}>
                      {currentPlan.price}
                    </div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Subscription Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-600" />
                      Subscription Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Plan Status:</span>
                        <span className={subscription?.days_remaining > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {subscription?.days_remaining > 0 ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      {subscription?.days_remaining && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Days Remaining:</span>
                          <span className="font-semibold text-gray-800">{subscription.days_remaining}</span>
                        </div>
                      )}
                      {subscription?.calls_remaining !== undefined && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Calls Remaining:</span>
                          <span className="font-semibold text-gray-800">{subscription.calls_remaining}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Billing Cycle:</span>
                        <span className="font-semibold text-gray-800">Monthly</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      What's Included
                    </h3>
                    <div className="space-y-2">
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Upgrade CTA */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-bold text-orange-800">Ready to Upgrade?</h3>
                </div>
                <p className="text-orange-700 mb-4 text-sm">
                  Unlock more features, higher limits, and premium support with our advanced plans.
                </p>
                <button
                  onClick={() => setActiveTab('upgrade')}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105"
                >
                  View Upgrade Options
                </button>
              </div>

              {/* Support */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-lg font-bold text-indigo-800">Need Help?</h3>
                </div>
                <p className="text-indigo-700 mb-4 text-sm">
                  Have questions about your subscription or need assistance? Our team is here to help.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleContactSupport('whatsapp')}
                    className="flex-1 bg-green-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleContactSupport('email')}
                    className="flex-1 bg-indigo-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                  >
                    Email
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'upgrade' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                <h3 className="text-xl font-bold text-blue-800">Starter Plan</h3>
                <div className="text-3xl font-bold text-blue-600 mt-2">$82</div>
                <div className="text-blue-600 text-sm">per month</div>
              </div>
              <div className="p-6">
                <div className="space-y-2 mb-6">
                  {planFeatures.starter.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleContactSupport('whatsapp', 'Starter Plan')}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact for Starter
                </button>
              </div>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 overflow-hidden relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" /> Most Popular
                </span>
              </div>
              <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
                <h3 className="text-xl font-bold text-orange-800">Business Plan</h3>
                <div className="text-3xl font-bold text-orange-600 mt-2">$249</div>
                <div className="text-orange-600 text-sm">per month</div>
              </div>
              <div className="p-6">
                <div className="space-y-2 mb-6">
                  {planFeatures.business.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleContactSupport('whatsapp', 'Business Plan')}
                  className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Upgrade to Business
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden">
              <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
                <h3 className="text-xl font-bold text-purple-800">Enterprise Plan</h3>
                <div className="text-3xl font-bold text-purple-600 mt-2">Custom</div>
                <div className="text-purple-600 text-sm">tailored pricing</div>
              </div>
              <div className="p-6">
                <div className="space-y-2 mb-6">
                  {planFeatures.enterprise.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleContactSupport('whatsapp', 'Enterprise Plan')}
                  className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Contact for Enterprise
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-8 bg-gray-800 text-white rounded-2xl p-8">
          <div className="text-center">
            <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Need Help Choosing?</h3>
            <p className="text-gray-300 mb-6">
              Our team is here to help you find the perfect plan for your business needs.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleContactSupport('whatsapp')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Support
              </button>
              <button
                onClick={() => handleContactSupport('email')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
