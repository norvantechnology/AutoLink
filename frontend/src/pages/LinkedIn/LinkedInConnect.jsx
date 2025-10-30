import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Linkedin, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import useLinkedInStore from '../../store/linkedinStore';

function LinkedInConnect() {
  const [searchParams] = useSearchParams();
  const { connected, account, loading, checkStatus, connect, disconnect } = useLinkedInStore();
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    checkStatus();

    // Handle OAuth callback
    const status = searchParams.get('linkedin');
    const error = searchParams.get('error');

    if (status === 'connected') {
      toast.success('LinkedIn account connected successfully!');
      checkStatus();
    } else if (error) {
      toast.error('Failed to connect LinkedIn account');
    }
  }, [searchParams]);

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
      <div className="max-w-3xl mx-auto">
        <div className="card text-center py-12">
          <Loader className="w-12 h-12 text-linkedin animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking LinkedIn connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">LinkedIn Integration</h1>
        <p className="text-gray-600 mt-1">
          Connect your LinkedIn account to automate post publishing
        </p>
      </div>

      {/* Connection Status */}
      <div className={`card border-2 ${connected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${connected ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Linkedin className={`w-8 h-8 ${connected ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-xl font-bold text-gray-900">Connection Status</h2>
              {connected && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <p className={`text-sm mb-4 ${connected ? 'text-green-700' : 'text-gray-600'}`}>
              {connected
                ? 'Your LinkedIn account is successfully connected and ready to publish posts.'
                : 'Connect your LinkedIn account to start automating your content.'}
            </p>

            {connected && account ? (
              <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{account.profileData?.name}</p>
                    <p className="text-sm text-gray-600">{account.profileData?.email}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Connected: {new Date(account.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  {account.profileData?.profilePicture && (
                    <img
                      src={account.profileData.profilePicture}
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                </div>
              </div>
            ) : null}

            {connected ? (
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="btn btn-danger"
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect Account'}
              </button>
            ) : (
              <button onClick={handleConnect} className="btn btn-primary flex items-center space-x-2">
                <Linkedin className="w-5 h-5" />
                <span>Connect LinkedIn Account</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-linkedin text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Connect Your Account</h3>
              <p className="text-sm text-gray-600">
                Click the button above to securely connect your LinkedIn account using OAuth 2.0.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-linkedin text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Create Topics</h3>
              <p className="text-sm text-gray-600">
                Define content topics that our AI will use to generate engaging posts.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-linkedin text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Schedule Posts</h3>
              <p className="text-sm text-gray-600">
                Set when to generate content and when to publish it to your LinkedIn profile.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-linkedin text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Automatic Publishing</h3>
              <p className="text-sm text-gray-600">
                Our system automatically generates and publishes posts at your scheduled times.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex space-x-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Security & Privacy</h3>
            <ul className="text-sm text-blue-800 space-y-1">
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
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Required Permissions</h2>
        <p className="text-sm text-gray-600 mb-4">
          AutoLink requires the following LinkedIn permissions to function:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Profile Access:</strong> To identify your account and display your information</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Share on LinkedIn:</strong> To publish posts on your behalf</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Email Address:</strong> For account verification and notifications</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default LinkedInConnect;

