import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Linkedin, Mail, Lock, User, Eye, EyeOff, Bot, Calendar, TrendingUp, Zap, Users, MessageSquare, BarChart3, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import SEO from '../../components/SEO';

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { name, email, password } = formData;
      const response = await signup({ name, email, password });
      
      // Check if user exists but not verified (OTP resent)
      if (response.message && response.message.includes('not verified')) {
        toast.success('New OTP sent! Check your email for verification code.');
      } else {
        toast.success('Account created! Check your email for verification code.');
      }
      
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-linkedin to-linkedin-dark px-4 py-12 relative overflow-hidden">
      {/* SEO Meta Tags */}
      <SEO page="signup" />
      
      {/* Floating Icons Background - Always Visible */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Linkedin className="absolute top-24 left-12 w-14 h-14 text-white/40 animate-float" style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <Bot className="absolute top-32 right-24 w-18 h-18 text-white/40 animate-float" style={{ animationDelay: '1.2s', animationDuration: '7.5s' }} />
        <Calendar className="absolute bottom-28 left-16 w-12 h-12 text-white/40 animate-float" style={{ animationDelay: '2.3s', animationDuration: '8.2s' }} />
        <TrendingUp className="absolute top-1/4 right-14 w-11 h-11 text-white/40 animate-float" style={{ animationDelay: '0.7s', animationDuration: '6.8s' }} />
        <Zap className="absolute bottom-24 right-28 w-13 h-13 text-white/40 animate-float" style={{ animationDelay: '1.8s', animationDuration: '7.8s' }} />
        <Users className="absolute top-1/3 left-20 w-12 h-12 text-white/40 animate-float" style={{ animationDelay: '2.7s', animationDuration: '8.7s' }} />
        <MessageSquare className="absolute bottom-36 right-20 w-15 h-15 text-white/40 animate-float" style={{ animationDelay: '3.2s', animationDuration: '9.2s' }} />
        <BarChart3 className="absolute top-1/2 left-1/4 w-10 h-10 text-white/40 animate-float" style={{ animationDelay: '1.5s', animationDuration: '7.3s' }} />
        <Clock className="absolute bottom-1/4 left-1/3 w-12 h-12 text-white/40 animate-float" style={{ animationDelay: '3s', animationDuration: '9s' }} />
        <Bot className="absolute top-1/5 left-1/2 w-11 h-11 text-white/40 animate-float" style={{ animationDelay: '0.3s', animationDuration: '6.3s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Linkedin className="w-10 h-10 text-linkedin" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-blue-100">Create your LinkedOra account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-linkedin hover:text-linkedin-dark transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-blue-100 text-sm mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default Signup;

