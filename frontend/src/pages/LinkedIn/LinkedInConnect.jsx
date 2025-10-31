import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Linkedin, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import useLinkedInStore from '../../store/linkedinStore';

function LinkedInConnect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { connected, account, loading, checkStatus, connect, disconnect } = useLinkedInStore();
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    checkStatus();

    // Handle OAuth callback
    const status = searchParams.get('linkedin');
    const error = searchParams.get('error');

    if (status === 'connected') {
      toast.success('LinkedIn account connected successfully! Redirecting to dashboard...');
      checkStatus();
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);
    } else if (error) {
      toast.error('Failed to connect LinkedIn account');
    }
  }, [searchParams, navigate]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      toast.error('Failed to initiate LinkedIn connection');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your LinkedIn account?')) {
      return;
    }

    setDisconnecting(true);
    try {
      await disconnect();
      toast.success('LinkedIn account disconnected');
    } catch (error) {
      toast.error('Failed to disconnect LinkedIn account');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-0">
        <div className="card text-center py-8 sm:py-12 px-4">
          <Loader className="w-10 h-10 sm:w-12 sm:h-12 text-linkedin animate-spin mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-gray-600">Checking LinkedIn connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">LinkedIn Integration</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Connect your LinkedIn account to automate post publishing
        </p>
      </div>

      {/* Connection Status */}
      <div className={`card border-2 p-4 sm:p-6 ${connected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${connected ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Linkedin className={`w-6 h-6 sm:w-8 sm:h-8 ${connected ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Connection Status</h2>
              {connected && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
            </div>
            <p className={`text-xs sm:text-sm mb-4 ${connected ? 'text-green-700' : 'text-gray-600'}`}>
              {connected
                ? 'Your LinkedIn account is successfully connected and ready to publish posts.'
                : 'Connect your LinkedIn account to start automating your content.'}
            </p>

            {connected && account ? (
              <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 border border-green-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{account.profileData?.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{account.profileData?.email}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Connected: {new Date(account.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  {account.profileData?.profilePicture && (
                    <img
                      src={account.profileData.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                    />
                  )}
                </div>
              </div>
            ) : null}

            {connected ? (
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="btn btn-danger w-full sm:w-auto px-6 py-2.5 sm:py-2 text-sm sm:text-base"
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect Account'}
              </button>
            ) : (
              <button onClick={handleConnect} className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-2.5 sm:py-2 text-sm sm:text-base">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Connect LinkedIn Account</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">How It Works</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-linkedin text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
              1
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Connect Your Account</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Click the button above to securely connect your LinkedIn account using OAuth 2.0.
              </p>
            </div>
          </div>

          <div className="flex space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-linkedin text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
              2
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Create Topics</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Define content topics that our AI will use to generate engaging posts.
              </p>
            </div>
          </div>

          <div className="flex space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-linkedin text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
              3
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Schedule Posts</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Set when to generate content and when to publish it to your LinkedIn profile.
              </p>
            </div>
          </div>

          <div className="flex space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-linkedin text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
              4
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Automatic Publishing</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Our system automatically generates and publishes posts at your scheduled times.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="card bg-blue-50 border border-blue-200 p-4 sm:p-6">
        <div className="flex space-x-3">
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Security & Privacy</h3>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              <li>• Your LinkedIn credentials are never stored on our servers</li>
              <li>• We use OAuth 2.0 for secure authentication</li>
              <li>• Access tokens are encrypted in our database</li>
              <li>• You can disconnect your account at any time</li>
              <li>• We only request permissions needed for posting</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Required Permissions */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Required Permissions</h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          LinkedOra requires the following LinkedIn permissions to function:
        </p>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Profile Access:</strong> To identify your account and display your information</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Share on LinkedIn:</strong> To publish posts on your behalf</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Email Address:</strong> For account verification and notifications</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default LinkedInConnect;

