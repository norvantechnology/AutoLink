import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Linkedin, Mail, Lock, Eye, EyeOff, Bot, Calendar, TrendingUp, Zap, Users, MessageSquare, BarChart3, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import SEO from '../../components/SEO';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await login(formData);
      toast.success('Welcome back!');
      navigate('/app/dashboard');
    } catch (error) {
      // Handle unverified user attempting to login
      if (error.response?.status === 403 && error.response?.data?.verified === false) {
        toast.error(error.response?.data?.message || 'Please verify your email first');
        // Redirect to OTP verification page
        navigate('/verify-otp', { state: { email: error.response?.data?.email || formData.email } });
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-linkedin to-linkedin-dark px-3 sm:px-4 md:px-6 py-6 sm:py-8 relative overflow-hidden">
      {/* SEO Meta Tags */}
      <SEO page="login" />
      
      {/* Floating Icons Background - Responsive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Linkedin className="absolute top-20 left-4 sm:left-10 w-8 sm:w-12 h-8 sm:h-12 text-white/40 animate-float" style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <Bot className="absolute top-40 right-10 sm:right-20 w-12 sm:w-16 h-12 sm:h-16 text-white/40 animate-float" style={{ animationDelay: '1s', animationDuration: '7s' }} />
        <Calendar className="absolute bottom-32 left-10 sm:left-20 w-10 sm:w-14 h-10 sm:h-14 text-white/40 animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <TrendingUp className="absolute top-1/4 right-6 sm:right-10 w-8 sm:w-10 h-8 sm:h-10 text-white/40 animate-float" style={{ animationDelay: '0.5s', animationDuration: '6.5s' }} />
        <Zap className="absolute bottom-20 right-16 sm:right-32 w-10 sm:w-12 h-10 sm:h-12 text-white/40 animate-float" style={{ animationDelay: '1.5s', animationDuration: '7.5s' }} />
        <Users className="absolute top-1/3 left-8 sm:left-16 w-8 sm:w-10 h-8 sm:h-10 text-white/40 animate-float" style={{ animationDelay: '2.5s', animationDuration: '8.5s' }} />
        <MessageSquare className="absolute bottom-40 right-8 sm:right-16 w-10 sm:w-14 h-10 sm:h-14 text-white/40 animate-float" style={{ animationDelay: '3s', animationDuration: '9s' }} />
        <BarChart3 className="absolute top-1/2 left-1/4 w-9 sm:w-11 h-9 sm:h-11 text-white/40 animate-float" style={{ animationDelay: '1.2s', animationDuration: '7.2s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full mb-3 sm:mb-4">
            <Linkedin className="w-8 h-8 sm:w-10 sm:h-10 text-linkedin" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-sm sm:text-base text-blue-100">Sign in to your LinkedOra account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-9 sm:pl-10 text-sm sm:text-base h-11 sm:h-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-9 sm:pl-10 pr-10 text-sm sm:text-base h-11 sm:h-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-linkedin hover:text-linkedin-dark font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 sm:py-3.5 text-base sm:text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-linkedin hover:text-linkedin-dark transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-blue-100 text-xs sm:text-sm mt-4 sm:mt-6 px-4">
          Automate your LinkedIn presence with AI-powered content
        </p>
      </div>
    </div>
  );
}

export default Login;

