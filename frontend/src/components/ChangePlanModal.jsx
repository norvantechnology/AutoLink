import { useState, useEffect } from 'react';
import { X, TrendingUp, Check, Info, Zap, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentAPI } from '../services/api';

function ChangePlanModal({ isOpen, onClose, currentSubscription, currencies, onConfirm }) {
  const [selectedCurrency, setSelectedCurrency] = useState(currentSubscription?.currencyCode || 'USD');
  const [startImmediately, setStartImmediately] = useState(true);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Default to next upgrade tier (current + 1)
  const defaultUpgrade = (currentSubscription?.postsPerDay || 1) + 1;
  const [selectedPostsPerDay, setSelectedPostsPerDay] = useState(defaultUpgrade);

  useEffect(() => {
    if (isOpen && selectedCurrency) {
      loadPricing();
    }
  }, [isOpen, selectedCurrency]);

  useEffect(() => {
    // When pricing loads, set to first available upgrade option
    if (pricing.length > 0 && currentSubscription) {
      const firstUpgrade = pricing.find(p => p.postsPerDay > currentSubscription.postsPerDay);
      if (firstUpgrade) {
        setSelectedPostsPerDay(firstUpgrade.postsPerDay);
      }
    }
  }, [pricing, currentSubscription]);

  const loadPricing = async () => {
    try {
      const response = await paymentAPI.getPricing(selectedCurrency);
      setPricing(response.data.pricing);
    } catch (error) {
      toast.error('Failed to load pricing');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentCurrency = currencies.find(c => c.code === selectedCurrency);
  const selectedPrice = pricing.find(p => p.postsPerDay === selectedPostsPerDay)?.price || 0;
  
  // Calculate days used from startDate
  const now = new Date();
  const startDate = new Date(currentSubscription.startDate);
  const endDate = new Date(currentSubscription.endDate);
  
  // Calculate actual days used (from start to now)
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysUsed = Math.max(0, Math.ceil((now - startDate) / millisecondsPerDay));
  
  // Calculate days remaining (from now to end)
  const daysRemaining = Math.max(0, Math.ceil((endDate - now) / millisecondsPerDay));
  
  // Total subscription days should be 30
  const totalDays = 30;
  
  // If currency changed, calculate conversion
  const currentSubCurrency = currencies.find(c => c.code === currentSubscription.currencyCode);
  let currentPlanPriceInSelectedCurrency;
  
  if (selectedCurrency === currentSubscription.currencyCode) {
    // Same currency - use original amount
    currentPlanPriceInSelectedCurrency = currentSubscription.amount;
  } else {
    // Different currency - convert
    // Convert to USD first, then to new currency
    const amountInUSD = currentSubscription.amount / (currentSubCurrency?.conversionRate || 1);
    currentPlanPriceInSelectedCurrency = Math.round(amountInUSD * (currentCurrency?.conversionRate || 1));
  }
  
  // Calculate used and remaining with decimals (keep precision)
  const perDayRate = currentPlanPriceInSelectedCurrency / totalDays;
  const usedAmount = perDayRate * daysUsed;
  const remainingCredit = perDayRate * daysRemaining;
  
  // Calculate amount based on selection (keep decimals)
  const amountToPay = startImmediately 
    ? Math.max(0, Math.round(selectedPrice - remainingCredit))  // Round final amount only
    : selectedPrice;  // Full price
  
  // Format function for display
  const formatAmount = (amount) => {
    return amount.toFixed(2);
  };

  const handleConfirm = () => {
    if (selectedPostsPerDay <= currentSubscription.postsPerDay) {
      toast.error('You can only upgrade your plan');
      return;
    }
    if (!pricing || pricing.length === 0) {
      toast.error('Please wait for pricing to load');
      return;
    }
    onConfirm(selectedPostsPerDay, selectedCurrency, startImmediately);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upgrade Plan</h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Current: {currentSubscription.postsPerDay} posts/day • {daysRemaining} days left
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Currency & Plan Selection in One Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Currency
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                New Plan
              </label>
              <select
                value={selectedPostsPerDay}
                onChange={(e) => setSelectedPostsPerDay(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent font-medium"
              >
                {pricing
                  .filter(p => p.postsPerDay > currentSubscription.postsPerDay)
                  .map(plan => (
                    <option key={plan.postsPerDay} value={plan.postsPerDay}>
                      {plan.postsPerDay} Posts - {currentCurrency?.symbol}{plan.price}/mo
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Start Options */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setStartImmediately(true)}
              className={`p-3 rounded-lg border-2 text-left ${
                startImmediately ? 'border-linkedin bg-linkedin/5' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Zap className={`w-4 h-4 ${startImmediately ? 'text-linkedin' : 'text-gray-400'}`} />
                <p className="text-sm font-semibold text-gray-900">Start Now</p>
              </div>
              <p className="text-xl font-bold text-linkedin">
                {currentCurrency?.symbol}{Math.max(0, Math.round(selectedPrice - remainingCredit))}
              </p>
              <p className="text-xs text-gray-500">
                Credit: -{currentCurrency?.symbol}{formatAmount(remainingCredit)}
              </p>
            </button>

            <button
              onClick={() => setStartImmediately(false)}
              className={`p-3 rounded-lg border-2 text-left ${
                !startImmediately ? 'border-linkedin bg-linkedin/5' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className={`w-4 h-4 ${!startImmediately ? 'text-linkedin' : 'text-gray-400'}`} />
                <p className="text-sm font-semibold text-gray-900">Start Later</p>
              </div>
              <p className="text-xl font-bold text-linkedin">
                {currentCurrency?.symbol}{selectedPrice}
              </p>
              <p className="text-xs text-gray-500">On {new Date(endDate).toLocaleDateString()}</p>
            </button>
          </div>

          {/* Calculation Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              💰 Calculation Summary
            </p>
            
            {startImmediately ? (
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">New plan ({selectedPostsPerDay} posts/day):</span>
                  <span className="font-semibold">{currentCurrency?.symbol}{selectedPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Current plan used ({daysUsed} of {totalDays} days):</span>
                  <span className="font-medium text-red-600">-{currentCurrency?.symbol}{formatAmount(usedAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Unused credit ({daysRemaining} days left):</span>
                  <span className="font-medium text-green-600">-{currentCurrency?.symbol}{formatAmount(remainingCredit)}</span>
                </div>
                <div className="border-t-2 border-gray-400 my-2"></div>
                <div className="flex justify-between text-gray-900 font-bold text-base">
                  <span>Total to pay:</span>
                  <span className="text-xl text-linkedin">{currentCurrency?.symbol}{amountToPay}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 italic">
                  ✓ Activates immediately • Valid for 30 days
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Current plan ends:</span>
                  <span className="font-medium">{new Date(endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">New plan ({selectedPostsPerDay} posts/day):</span>
                  <span className="font-semibold">{currentCurrency?.symbol}{selectedPrice}</span>
                </div>
                <div className="border-t-2 border-gray-400 my-2"></div>
                <div className="flex justify-between text-gray-900 font-bold text-base">
                  <span>Total to pay:</span>
                  <span className="text-xl text-linkedin">{currentCurrency?.symbol}{amountToPay}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 italic">
                  ✓ Starts {new Date(endDate).toLocaleDateString()} • Valid for 30 days
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedPostsPerDay <= currentSubscription.postsPerDay || loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Loading...' : `Pay ${currentCurrency?.symbol}${amountToPay}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePlanModal;
