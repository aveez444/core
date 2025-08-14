import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Phone, 
  Globe, 
  Search, 
  Filter, 
  MapPin, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Star,
  Eye,
  Plus,
  Trash2,
  Settings,
  Info,
  Clock,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/dateUtils';

const BuyNumbers = () => {
  const { user, getSubscription } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  
  // Current numbers state
  const [currentNumbers, setCurrentNumbers] = useState([]);
  const [currentNumbersLoading, setCurrentNumbersLoading] = useState(false);
  
  // Available numbers state
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [availableNumbersLoading, setAvailableNumbersLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedAreaCode, setSelectedAreaCode] = useState('');
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [numberType, setNumberType] = useState('all'); // 'all', 'local', 'toll_free'
  
  // Countries data - prices match backend pricing (Twilio base + $2.00 markup)
  const [countries, setCountries] = useState([
    { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', price: '3.00' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'USD', price: '3.00' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'USD', price: '3.50' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'USD', price: '4.00' }
  ]);
  
  // Area codes for US (most common ones)
  const usAreaCodes = [
    '212', '213', '214', '215', '216', '217', '218', '219', '224', '225',
    '301', '302', '303', '304', '305', '307', '308', '309', '310', '312',
    '313', '314', '315', '316', '317', '318', '319', '320', '321', '323',
    '401', '402', '403', '404', '405', '406', '407', '408', '409', '410',
    '412', '413', '414', '415', '416', '417', '418', '419', '423', '424',
    '425', '430', '432', '434', '435', '440', '443', '469', '470', '475'
  ];

  const subscription = getSubscription();

  useEffect(() => {
    fetchCurrentNumbers();
    fetchAvailableNumbers();
  }, []);

  useEffect(() => {
    if (selectedCountry || selectedAreaCode) {
      fetchAvailableNumbers();
    }
  }, [selectedCountry, selectedAreaCode]);

  // Debounced search effect for real-time search
  useEffect(() => {
    if (!searchTerm) {
      // If search term is cleared, fetch regular numbers
      if (availableNumbers.length === 0) {
        fetchAvailableNumbers();
      }
      return;
    }

    // Debounce search requests
    const searchTimeout = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  const fetchCurrentNumbers = async () => {
    try {
      setCurrentNumbersLoading(true);
      // FIXED: Use getPurchasedNumbers for the Buy Numbers page to show all purchased numbers
      const response = await apiService.getPurchasedNumbers();
      setCurrentNumbers(response.purchased_numbers || []);
    } catch (error) {
      console.error('Error fetching current numbers:', error);
      toast.error('Failed to fetch your current phone numbers');
    } finally {
      setCurrentNumbersLoading(false);
      setLoading(false);
    }
  };

  const fetchAvailableNumbers = async (searchQuery = '') => {
    try {
      setAvailableNumbersLoading(true);
      const params = {
        country: selectedCountry,
        area_code: selectedAreaCode || undefined,
        search: searchQuery || undefined, // Add search parameter
        limit: searchQuery ? undefined : 20  // No limit when searching for specific number
      };
      
      const response = await apiService.searchAvailableNumbers(params);
      setAvailableNumbers(response.available_numbers || []);
      
      // If search returned no results, show helpful message
      if (searchQuery && (!response.available_numbers || response.available_numbers.length === 0)) {
        toast.info(`No numbers found containing "${searchQuery}". Try a different search term.`);
      }
    } catch (error) {
      console.error('Error fetching available numbers:', error);
      toast.error('Failed to fetch available numbers');
      setAvailableNumbers([]);
    } finally {
      setAvailableNumbersLoading(false);
    }
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      // If search is too short, fetch regular numbers
      if (searchQuery.trim().length === 0) {
        await fetchAvailableNumbers('');
      }
      return;
    }

    try {
      setSearchLoading(true);
      console.log(`🔍 Searching for numbers containing: ${searchQuery}`);
      
      // Use backend search instead of client-side filtering
      await fetchAvailableNumbers(searchQuery.trim());
    } catch (error) {
      console.error('Error searching numbers:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePurchaseNumber = async (phoneNumber) => {
    if (!phoneNumber || typeof phoneNumber !== 'string') return;
    
    const confirmPurchase = window.confirm(
      `Are you sure you want to purchase the phone number ${phoneNumber}?\n\nYour purchase request will be forwarded to the owner for manual fulfillment within 1-3 business days.`
    );
    
    if (!confirmPurchase) return;

    try {
      setPurchaseLoading(phoneNumber);
      
      // Safely format the friendly name
      let friendlyName = phoneNumber;
      try {
        const cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.length >= 10) {
          friendlyName = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
      } catch (formatError) {
        console.warn('Error formatting phone number:', formatError);
        // Use original phone number if formatting fails
      }
      
      const response = await apiService.purchasePhoneNumber({
        phone_number: phoneNumber,
        friendly_name: friendlyName
      });
      
      if (response.success || response.message) {
        toast.success(`Purchase request forwarded to owner for ${phoneNumber}! You'll be contacted within 1-3 business days for fulfillment.`);
        await fetchCurrentNumbers();
        await fetchAvailableNumbers(); // Refresh to remove purchased number
      } else {
        throw new Error(response.error || 'Failed to purchase number');
      }
    } catch (error) {
      console.error('Error purchasing number:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to purchase phone number';
      toast.error(errorMsg);
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleReleaseNumber = async (phoneNumber, sid) => {
    const confirmRelease = window.confirm(
      `Are you sure you want to release the phone number ${phoneNumber}?\n\nThis action cannot be undone and you will lose this number.`
    );
    
    if (!confirmRelease) return;

    try {
      const response = await apiService.releasePhoneNumber(sid);
      
      if (response.success || response.message) {
        toast.success(`Successfully released ${phoneNumber}!`);
        await fetchCurrentNumbers();
      } else {
        throw new Error(response.error || 'Failed to release number');
      }
    } catch (error) {
      console.error('Error releasing number:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to release phone number';
      toast.error(errorMsg);
    }
  };

  const formatPhoneNumber = (phoneNumber) => {
    // Handle undefined, null, or non-string values
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return phoneNumber || '';
    }
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    } else if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phoneNumber;
  };

  const getSelectedCountry = () => {
    return countries.find(c => c.code === selectedCountry) || countries[0];
  };

  // No longer need client-side filtering since backend handles search
  const filteredAvailableNumbers = availableNumbers.filter(number => {
    // Safety check for number object and phone_number property
    return number && number.phone_number;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading phone numbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-gray-800">
                <ShoppingCart className="w-8 h-8 text-indigo-600" />
                Buy Phone Numbers
              </h1>
              <p className="text-gray-600">Purchase and manage phone numbers for your calling campaigns</p>
            </div>
            
            <button
              onClick={() => {
                fetchCurrentNumbers();
                fetchAvailableNumbers();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Current Numbers Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Your Phone Numbers ({currentNumbers.length})
              </h2>
              {subscription && (
                <div className="text-sm text-gray-600">
                  Plan: <span className="font-medium capitalize text-indigo-600">{subscription.plan_type}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {currentNumbersLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading your numbers...</p>
              </div>
            ) : currentNumbers.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No phone numbers yet</h3>
                <p className="text-gray-500 mb-6">Purchase your first phone number to start making calls</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentNumbers.map((number) => {
                  const isSharedNumber = number.capabilities?.shared_resource || number.capabilities?.plan_included;
                  const isActive = number.status === 'Active' || number.status === 'active';
                  
                  return (
                    <div key={number.purchase_id} className={`rounded-lg p-4 ${
                      isSharedNumber 
                        ? 'bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200' 
                        : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-600" />
                          )}
                          <span className="font-medium text-gray-800">
                            {isSharedNumber ? 'Plan Included' : (number.status || 'Active')}
                          </span>
                          {isSharedNumber && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              FREE
                            </span>
                          )}
                        </div>
                        {number.is_active && !isSharedNumber && (
                          <button
                            onClick={() => handleReleaseNumber(number.phone_number, number.purchase_id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Release number"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="mb-2">
                        <p className="text-lg font-semibold text-gray-800">
                          {number.formatted_number || formatPhoneNumber(number.phone_number)}
                        </p>
                        {number.friendly_name && number.friendly_name !== number.phone_number && (
                          <p className="text-sm text-gray-600">{number.friendly_name}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{number.country_code || 'US'}</span>
                      </div>
                      {number.purchased_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Added {formatDate(number.purchased_at)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        <span>{number.monthly_cost}/month</span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Country Selection */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name} (${country.price}/month)
                    </option>
                  ))}
                </select>
              </div>

              {/* Area Code Selection (US only) */}
              {selectedCountry === 'US' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area Code (Optional)</label>
                  <select
                    value={selectedAreaCode}
                    onChange={(e) => setSelectedAreaCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Any area code</option>
                    {usAreaCodes.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Numbers</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by digits..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Numbers Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Available Numbers - {getSelectedCountry().name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4" />
                <span>${getSelectedCountry().price}/month per number</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {availableNumbersLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600">Searching for available numbers...</p>
              </div>
            ) : filteredAvailableNumbers.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No numbers available</h3>
                <p className="text-gray-500 mb-6">
                  {availableNumbers.length === 0 
                    ? "No numbers found for the selected criteria. Try a different area code or country."
                    : "No numbers match your search. Try different search terms."
                  }
                </p>
                <button
                  onClick={fetchAvailableNumbers}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Search Again
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filteredAvailableNumbers.map((number) => (
                    <div key={number.phone_number} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-800">Available</span>
                        </div>
                        <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                          {number.monthly_cost || `$${getSelectedCountry().price}/mo`}
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-lg font-semibold text-gray-800">
                          {formatPhoneNumber(number.phone_number)}
                        </p>
                        <div className="text-xs text-gray-500 space-y-1 mt-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{number.locality || number.region || selectedCountry}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePurchaseNumber(number.phone_number)}
                        disabled={purchaseLoading === number.phone_number}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {purchaseLoading === number.phone_number ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Purchasing...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Purchase
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Info banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Purchase Process:</p>
                      <ul className="space-y-1 text-amber-700">
                        <li>• Numbers shown are real available Twilio numbers with premium pricing</li>
                        <li>• Purchase requests are manually fulfilled by our team within 1-3 business days</li>
                        <li>• You'll be charged only after your number is activated and ready to use</li>
                        <li>• Monthly cost includes CallGenie premium features and 24/7 support</li>
                        <li>• Contact support@callgenie.com for immediate activation needs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyNumbers;
