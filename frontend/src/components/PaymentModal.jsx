import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

function PaymentModal({ isOpen, onClose, paymentInfo, onPaymentSubmitted }) {
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text, message) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(message);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    setSubmitting(true);
    try {
      await onPaymentSubmitted({
        transactionId,
        postsPerDay: paymentInfo.postsPerDay,
        currencyCode: paymentInfo.currencyCode
      });
      toast.success('Payment proof submitted! Waiting for verification.');
      onClose();
    } catch (error) {
      toast.error('Failed to submit payment proof');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Amount */}
          <div className="bg-linkedin/10 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
            <p className="text-4xl font-bold text-linkedin">
              {paymentInfo.currencySymbol}{paymentInfo.amount}
            </p>
            <p className="text-sm text-gray-600 mt-1">{paymentInfo.note}</p>
          </div>

          {/* Payment Method Based on Currency */}
          {paymentInfo.method === 'upi' && (
            <>
              {/* QR Code for UPI */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3 text-center">
                  Scan QR Code with Any UPI App
                </p>
                <div className="flex justify-center bg-white p-4">
                  <QRCode 
                    value={paymentInfo.upiUrl} 
                    size={200}
                    level="M"
                  />
                </div>
              </div>

              {/* UPI ID */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Pay Directly to UPI ID
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={paymentInfo.upiId}
                    readOnly
                    className="input flex-1 bg-gray-50"
                  />
                  <button
                    onClick={() => handleCopy(paymentInfo.upiId, 'UPI ID copied!')}
                    className="btn btn-secondary flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {paymentInfo.method === 'paypal' && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">PayPal Payment</p>
                <p className="text-sm text-blue-700 mb-3">
                  Send {paymentInfo.currencySymbol}{paymentInfo.amount} to:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={paymentInfo.paypalEmail}
                    readOnly
                    className="input flex-1 bg-white"
                  />
                  <button
                    onClick={() => handleCopy(paymentInfo.paypalEmail, 'PayPal email copied!')}
                    className="btn btn-secondary flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <a
                  href={paymentInfo.paypalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full mt-3"
                >
                  Pay with PayPal →
                </a>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 font-medium mb-2">📱 Payment Instructions:</p>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Scan QR code or copy UPI ID</li>
              <li>Pay ${paymentInfo.amount} via Google Pay/PhonePe/Paytm</li>
              <li>Enter transaction ID below</li>
              <li>Wait for admin verification (within 24 hours)</li>
            </ol>
          </div>

          {/* Transaction ID Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID / UTR Number *
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter 12-digit transaction ID"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              You'll receive this after successful payment
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !transactionId.trim()}
            className="btn btn-primary w-full"
          >
            {submitting ? 'Submitting...' : 'Submit Payment Proof'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your automation will be activated within 24 hours after verification
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;

