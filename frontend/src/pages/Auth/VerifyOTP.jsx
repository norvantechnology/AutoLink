import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Mail, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const { verifyOTP: verifyOTPStore, logout } = useAuthStore();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please sign up first.');
      navigate('/signup');
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

  const handleVerify = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit code');
      return;
    }

    try {
      setLoading(true);
      // Use auth store to verify OTP and login
      await verifyOTPStore({ email, otp: otpCode });
      setVerified(true);
      toast.success('Email verified successfully! Logging you in...');
      setTimeout(() => navigate('/app/dashboard'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await authAPI.resendOTP({ email });
      toast.success('New OTP sent to your email!');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-linkedin to-linkedin-dark px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-linkedin to-linkedin-dark px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linkedin/10 rounded-full mb-4">
              <Mail className="w-8 h-8 text-linkedin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600">
              We sent a 6-digit code to<br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>

          {/* OTP Input */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center space-x-3 mb-6">
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
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-linkedin focus:ring-2 focus:ring-linkedin/20 outline-none transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            {/* Resend Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-linkedin hover:text-linkedin-dark font-medium disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Didn\'t receive code? Resend'}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 text-center">
              💡 Check your spam folder if you don't see the email
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                logout(); // Clear any token
                navigate('/login');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;

