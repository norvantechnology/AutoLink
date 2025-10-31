import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Linkedin, Lock, Eye, EyeOff, CheckCircle, Bot, Calendar, TrendingUp, Zap, Users, MessageSquare, BarChart3, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('Please start from forgot password page');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length - 1, 5);
    document.getElementById(`otp-${lastIndex}`)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit code');
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Please enter both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({ email, otp: otpCode, newPassword });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.forgotPassword({ email });
      toast.success('New reset code sent to your email!');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-linkedin to-linkedin-dark px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
          <p className="text-gray-600 mb-4">Your password has been reset successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-linkedin to-linkedin-dark px-4 py-12 relative overflow-hidden">
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Lock className="w-10 h-10 text-linkedin" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-blue-100">
            Enter the code sent to<br />
            <span className="font-medium">{email}</span>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Verification Code
              </label>
              <div className="flex justify-center space-x-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-linkedin focus:ring-2 focus:ring-linkedin/20 outline-none transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-linkedin hover:text-linkedin-dark font-medium"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 text-center">
              💡 Check your spam folder if you don't see the email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

