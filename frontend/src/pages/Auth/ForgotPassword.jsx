import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Linkedin, Mail, ArrowLeft, Bot, Calendar, TrendingUp, Zap, Users, MessageSquare, BarChart3, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import SEO from '../../components/SEO';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      toast.success('Password reset code sent! Check your email.');
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-linkedin to-linkedin-dark px-4 relative overflow-hidden">
      {/* SEO Meta Tags */}
      <SEO page="forgotPassword" />
      
      {/* Floating Icons Background - Always Visible */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Linkedin className="absolute top-20 left-10 w-12 h-12 text-white/40 animate-float" style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <Bot className="absolute top-40 right-20 w-16 h-16 text-white/40 animate-float" style={{ animationDelay: '1s', animationDuration: '7s' }} />
        <Calendar className="absolute bottom-32 left-20 w-14 h-14 text-white/40 animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <TrendingUp className="absolute top-1/4 right-10 w-10 h-10 text-white/40 animate-float" style={{ animationDelay: '0.5s', animationDuration: '6.5s' }} />
        <Zap className="absolute bottom-20 right-32 w-12 h-12 text-white/40 animate-float" style={{ animationDelay: '1.5s', animationDuration: '7.5s' }} />
        <Users className="absolute top-1/3 left-16 w-10 h-10 text-white/40 animate-float" style={{ animationDelay: '2.5s', animationDuration: '8.5s' }} />
        <MessageSquare className="absolute bottom-40 right-16 w-14 h-14 text-white/40 animate-float" style={{ animationDelay: '3s', animationDuration: '9s' }} />
        <BarChart3 className="absolute top-1/2 left-1/4 w-11 h-11 text-white/40 animate-float" style={{ animationDelay: '1.2s', animationDuration: '7.2s' }} />
        <Clock className="absolute bottom-1/4 left-1/3 w-13 h-13 text-white/40 animate-float" style={{ animationDelay: '2.8s', animationDuration: '8.8s' }} />
        <Linkedin className="absolute top-16 right-1/4 w-10 h-10 text-white/40 animate-float" style={{ animationDelay: '0.8s', animationDuration: '6.8s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Linkedin className="w-10 h-10 text-linkedin" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-blue-100">No worries, we'll send you reset instructions</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Code'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>

        <p className="text-center text-blue-100 text-sm mt-6">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-white hover:text-blue-100 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

