import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  Clock,
  ThumbsUp,
  MessageCircle,
  Share2,
  Eye,
  Zap,
  Save,
  CreditCard,
  AlertCircle,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { automationAPI, paymentAPI } from '../../services/api';
import useLinkedInStore from '../../store/linkedinStore';
import PaymentModal from '../../components/PaymentModal';
import ChangePlanModal from '../../components/ChangePlanModal';

function Dashboard() {
  const { connected, checkStatus } = useLinkedInStore();
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [pendingSubscription, setPendingSubscription] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [pricing, setPricing] = useState([]);
  const [testGenerating, setTestGenerating] = useState(false);

  // Local state for settings form
  const [formData, setFormData] = useState({
    postsPerDay: 1,
    contentCreationTime: '08:00',
    publishTimes: ['09:00'],
    enabled: true
  });

  useEffect(() => {
    checkStatus();
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Load currencies first
      const currenciesRes = await paymentAPI.getCurrencies();
      setCurrencies(currenciesRes.data.currencies);
      
      // Default to USD or first available currency
      const defaultCurrency = currenciesRes.data.currencies.find(c => c.code === 'USD') || currenciesRes.data.currencies[0];
      setSelectedCurrency(defaultCurrency?.code || 'USD');
      
      const [statsRes, settingsRes, subscriptionRes, pricingRes] = await Promise.all([
        automationAPI.getStats(),
        automationAPI.getSettings(),
        paymentAPI.getSubscription(),
        paymentAPI.getPricing(defaultCurrency?.code || 'USD')
      ]);
      
      setStats(statsRes.data.stats);
      setSettings(settingsRes.data.settings);
      
      const sub = subscriptionRes.data.subscription;
      setSubscription(sub);
      setPricing(pricingRes.data.pricing);
      
      // If user has active subscription, use subscription's postsPerDay
      // Otherwise use settings
      const effectivePostsPerDay = sub ? sub.postsPerDay : settingsRes.data.settings.postsPerDay;
      const effectiveCurrency = sub ? sub.currencyCode : defaultCurrency?.code;
      
      if (sub) {
        setSelectedCurrency(effectiveCurrency);
        // Load pricing for subscription currency
        const subPricingRes = await paymentAPI.getPricing(effectiveCurrency);
        setPricing(subPricingRes.data.pricing);
      }
      
      // Ensure publishTimes array matches postsPerDay count
      let effectivePublishTimes = [...settingsRes.data.settings.publishTimes];
      const defaultTimes = ['09:00', '14:00', '18:00', '21:00', '23:00'];
      
      // Add more times if needed
      while (effectivePublishTimes.length < effectivePostsPerDay) {
        effectivePublishTimes.push(defaultTimes[effectivePublishTimes.length] || '12:00');
      }
      
      // Remove extra times if needed
      if (effectivePublishTimes.length > effectivePostsPerDay) {
        effectivePublishTimes = effectivePublishTimes.slice(0, effectivePostsPerDay);
      }
      
      // Update form data
      setFormData({
        postsPerDay: effectivePostsPerDay,
        contentCreationTime: settingsRes.data.settings.contentCreationTime,
        publishTimes: effectivePublishTimes,
        enabled: settingsRes.data.settings.enabled
      });
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (currencyCode) => {
    setSelectedCurrency(currencyCode);
    try {
      const pricingRes = await paymentAPI.getPricing(currencyCode);
      setPricing(pricingRes.data.pricing);
    } catch (error) {
      toast.error('Failed to load pricing');
    }
  };

  const handlePayNow = async () => {
    try {
      const response = await paymentAPI.createPayment({ 
        postsPerDay: formData.postsPerDay,
        currencyCode: selectedCurrency
      });
      setPaymentInfo(response.data.paymentInfo);
      setShowPaymentModal(true);
    } catch (error) {
      toast.error('Failed to create payment request');
    }
  };

  const handleUpgradePlan = async (newPostsPerDay, currencyCode, startImmediately) => {
    if (!subscription) return;

    setShowChangePlanModal(false);

    try {
      const response = await paymentAPI.upgradePlan({ 
        newPostsPerDay,
        currencyCode,
        startImmediately
      });
      setPaymentInfo(response.data.paymentInfo);
      setShowPaymentModal(true);
      toast.success(`Plan upgrade initiated! Complete payment to activate.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upgrade plan');
    }
  };

  const handlePaymentSubmitted = async (paymentData) => {
    try {
      await paymentAPI.submitProof(paymentData);
      setShowPaymentModal(false);
      loadDashboard();
    } catch (error) {
      throw error;
    }
  };

  const handleTestGenerate = async () => {
    setTestGenerating(true);
    try {
      await automationAPI.testGenerate();
      toast.success('Test post generated! Check Post History in 30 seconds.');
      setTimeout(() => loadDashboard(), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Test generation failed');
    } finally {
      setTestGenerating(false);
    }
  };

  const handlePostsPerDayChange = (value) => {
    const count = parseInt(value);
    const newPublishTimes = [...formData.publishTimes];
    
    // Add or remove publish times to match posts per day
    if (count > newPublishTimes.length) {
      // Add more times
      const defaultTimes = ['09:00', '14:00', '18:00', '21:00', '12:00'];
      while (newPublishTimes.length < count) {
        newPublishTimes.push(defaultTimes[newPublishTimes.length] || '12:00');
      }
    } else if (count < newPublishTimes.length) {
      // Remove excess times
      newPublishTimes.splice(count);
    }
    
    setFormData({
      ...formData,
      postsPerDay: count,
      publishTimes: newPublishTimes
    });
  };

  const handlePublishTimeChange = (index, value) => {
    const newPublishTimes = [...formData.publishTimes];
    newPublishTimes[index] = value;
    setFormData({
      ...formData,
      publishTimes: newPublishTimes
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await automationAPI.updateSettings(formData);
      setSettings(response.data.settings);
      toast.success('Settings saved successfully!');
      loadDashboard(); // Refresh stats
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAutomation = async () => {
    try {
      const newEnabled = !formData.enabled;
      const response = await automationAPI.updateSettings({
        ...formData,
        enabled: newEnabled
      });
      setSettings(response.data.settings);
      setFormData({ ...formData, enabled: newEnabled });
      toast.success(newEnabled ? 'Automation enabled!' : 'Automation paused');
    } catch (error) {
      toast.error('Failed to toggle automation');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-linkedin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Fully automated LinkedIn content generation</p>
        </div>
        {subscription && (
          <button
            onClick={handleTestGenerate}
            disabled={testGenerating}
            className="btn btn-secondary flex items-center space-x-2"
          >
            {testGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span>Test Generate</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* LinkedIn Connection Alert */}
      {!connected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              LinkedIn Account Not Connected
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Connect your LinkedIn to start automation.
            </p>
            <Link
              to="/linkedin"
              className="mt-3 inline-flex items-center text-sm font-medium text-yellow-800 hover:text-yellow-900"
            >
              Connect Now →
            </Link>
          </div>
        </div>
      )}


      {/* Automation Configuration Card - Well Organized */}
      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Zap className={`w-5 h-5 ${subscription ? 'text-green-600' : 'text-red-600'}`} />
            <h2 className="text-lg font-bold text-gray-900">Automation</h2>
            <span className={`text-xs px-2 py-1 rounded-full ${subscription ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {subscription ? 'Active' : 'Inactive'}
            </span>
          </div>
          {subscription && (
            <button
              onClick={handleToggleAutomation}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium ${formData.enabled ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white'}`}
            >
              {formData.enabled ? 'Pause' : 'Enable'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: SUBSCRIPTION & PLAN */}
          <div className="space-y-4">
            {/* Plan Selection Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-linkedin" />
                Subscription Plan
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Posts Per Day</label>
                  <select
                    value={formData.postsPerDay}
                    onChange={(e) => handlePostsPerDayChange(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg ${subscription ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                    disabled={!!subscription}
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} Post{n > 1 ? 's' : ''}/day</option>
                    ))}
                  </select>
                  {subscription && (
                    <button onClick={() => setShowChangePlanModal(true)} className="text-xs text-linkedin hover:underline mt-1">
                      Change Plan →
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-600 block mb-1">Currency</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg ${subscription ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                    disabled={!!subscription}
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>{curr.symbol} {curr.name}</option>
                    ))}
                  </select>
                </div>

                <div className={`p-4 rounded-lg text-center ${subscription ? 'bg-green-100 border-2 border-green-300' : 'bg-white border-2 border-linkedin'}`}>
                  <p className="text-xs text-gray-600 mb-1">Monthly Cost</p>
                  <p className={`text-3xl font-bold ${subscription ? 'text-green-700' : 'text-linkedin'}`}>
                    {subscription ? subscription.currencySymbol : (currencies.find(c => c.code === selectedCurrency)?.symbol || '$')}
                    {subscription ? subscription.amount : (pricing.find(p => p.postsPerDay === formData.postsPerDay)?.price || 10)}
                  </p>
                  {subscription && (
                    <p className="text-xs text-gray-500 mt-1">Valid until {new Date(subscription.endDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                  )}
                </div>

                {!subscription && (
                  <button
                    onClick={handlePayNow}
                    className="w-full px-4 py-3 bg-linkedin text-white rounded-lg hover:bg-linkedin-dark font-medium"
                  >
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Subscribe Now
                  </button>
                )}
              </div>
            </div>

            {/* Today's Progress Box */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm text-gray-600">Generated</span>
                  <span className="text-sm font-bold text-gray-900">{stats?.generatedToday || 0} / {formData.postsPerDay}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm text-gray-600">Published</span>
                  <span className="text-sm font-bold text-gray-900">{stats?.publishedToday || 0} / {formData.postsPerDay}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm text-gray-600">Total Posts</span>
                  <span className="text-sm font-bold text-linkedin">{stats?.totalPosted || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TIMING & SCHEDULE */}
          <div className="space-y-4">
            {/* Content Creation Box */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-purple-600" />
                Content Creation
              </h3>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Generation Time</label>
                <input
                  type="time"
                  value={formData.contentCreationTime}
                  onChange={(e) => setFormData({ ...formData, contentCreationTime: e.target.value })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg ${!subscription ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  disabled={!subscription}
                />
                <p className="text-xs text-gray-500 mt-1">When AI generates all posts</p>
              </div>
            </div>

            {/* Publish Schedule Box */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Share2 className="w-4 h-4 mr-2 text-green-600" />
                Publish Schedule
              </h3>
              <div className="space-y-2">
                {formData.publishTimes.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 font-medium w-14">Post {index + 1}</span>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handlePublishTimeChange(index, e.target.value)}
                      className={`flex-1 px-3 py-2 text-sm border rounded-lg ${!subscription ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                      disabled={!subscription}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">When posts go live on LinkedIn</p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {subscription && (
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              )}
              <button
                onClick={handleTestGenerate}
                disabled={testGenerating || !subscription}
                className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
              >
                {testGenerating ? 'Generating...' : 'Test Generate Post'}
              </button>
            </div>
          </div>
        </div>

        {/* Warning if no subscription */}
        {!subscription && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">⚠️ Subscribe to activate automation</p>
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{formData.contentCreationTime} - Content Generation</p>
              <p className="text-sm text-gray-600">
                AI generates {formData.postsPerDay} {formData.postsPerDay === 1 ? 'post' : 'posts'} with images
              </p>
            </div>
            {stats?.generatedToday >= formData.postsPerDay ? (
              <span className="text-green-600 font-medium">✅ Done</span>
            ) : (
              <span className="text-gray-400 font-medium">⏳ Pending</span>
            )}
          </div>

          {formData.publishTimes.map((time, index) => {
            const isPublished = stats?.publishedToday > index;
            return (
              <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Share2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{time} - Post {index + 1} to LinkedIn</p>
                  <p className="text-sm text-gray-600">Automatic publishing</p>
                </div>
                {isPublished ? (
                  <span className="text-green-600 font-medium">✅ Posted</span>
                ) : (
                  <span className="text-gray-400 font-medium">⏳ Scheduled</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalPosted || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Topics</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalTopics || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.engagement?.totalLikes || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Engagement</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(stats?.engagement?.totalLikes || 0) + 
                 (stats?.engagement?.totalComments || 0) + 
                 (stats?.engagement?.totalShares || 0)}
              </p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
          <Link
            to="/posts"
            className="text-sm text-linkedin hover:text-linkedin-dark font-medium"
          >
            View All →
          </Link>
        </div>

        {stats?.recentPosts && stats.recentPosts.length > 0 ? (
          <div className="space-y-4">
            {stats.recentPosts.map((post) => (
              <div
                key={post._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-linkedin transition-colors"
              >
                <div className="flex items-start space-x-3 mb-3">
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt="Post" 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500">{post.topicId?.name}</span>
                      <span className={`badge ${
                        post.status === 'published' ? 'badge-posted' :
                        post.status === 'generated' ? 'badge-generated' : 'badge-pending'
                      }`}>
                        {post.status}
                      </span>
                      {post.scheduledPublishTime && (
                        <span className="text-xs text-gray-500">
                          📅 {post.scheduledPublishTime}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 line-clamp-2">{post.content}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <span className="flex items-center space-x-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.engagement?.likes || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.engagement?.comments || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>{post.engagement?.shares || 0}</span>
                    </span>
                  </div>
                  {post.linkedInPostUrl && (
                    <a
                      href={post.linkedInPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-linkedin hover:text-linkedin-dark font-medium"
                    >
                      View on LinkedIn →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No posts yet. Configure settings and enable automation!</p>
          </div>
        )}
      </div>

      {/* Quick Setup */}
      {(!connected || stats?.totalTopics === 0) && (
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Quick Setup Checklist</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className={connected ? 'text-green-600' : 'text-gray-400'}>
                {connected ? '✅' : '⭕'}
              </span>
              <span className="text-blue-800">
                Connect LinkedIn Account
                {!connected && (
                  <Link to="/linkedin" className="ml-2 underline">Connect now</Link>
                )}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={stats?.totalTopics > 0 ? 'text-green-600' : 'text-gray-400'}>
                {stats?.totalTopics > 0 ? '✅' : '⭕'}
              </span>
              <span className="text-blue-800">
                Add Topics (at least 2-3 recommended)
                {stats?.totalTopics === 0 && (
                  <Link to="/topics" className="ml-2 underline">Add topics</Link>
                )}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={formData.enabled ? 'text-green-600' : 'text-gray-400'}>
                {formData.enabled ? '✅' : '⭕'}
              </span>
              <span className="text-blue-800">Configure times and enable automation</span>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangePlanModal && subscription && (
        <ChangePlanModal
          isOpen={showChangePlanModal}
          onClose={() => setShowChangePlanModal(false)}
          currentSubscription={subscription}
          currencies={currencies}
          onConfirm={handleUpgradePlan}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentInfo && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          paymentInfo={paymentInfo}
          onPaymentSubmitted={handlePaymentSubmitted}
        />
      )}
    </div>
  );
}

export default Dashboard;

