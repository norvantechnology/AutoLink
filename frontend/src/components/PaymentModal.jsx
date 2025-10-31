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
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount */}
          <div className="bg-linkedin/10 rounded-lg p-3 mb-4 text-center">
            <p className="text-xs text-gray-600 mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold text-linkedin">
              {paymentInfo.currencySymbol}{paymentInfo.amount}
            </p>
            <p className="text-xs text-gray-600 mt-1">{paymentInfo.note}</p>
          </div>

          {/* Payment Method Based on Currency */}
          {paymentInfo.method === 'upi' && (
            <>
              {/* QR Code for UPI */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-gray-700 mb-2 text-center">
                  Scan QR Code with Any UPI App
                </p>
                <div className="flex justify-center bg-white p-2">
                  <QRCode 
                    value={paymentInfo.upiUrl} 
                    size={160}
                    level="M"
                  />
                </div>
              </div>

              {/* UPI Payment Link */}
              <div className="mb-3">
                <a
                  href={paymentInfo.upiUrl}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2 text-xs py-2"
                >
                  <span>💳</span>
                  <span>Pay via UPI App</span>
                </a>
              </div>
            </>
          )}

          {paymentInfo.method === 'paypal' && (
            <div className="mb-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-2">PayPal Payment</p>
                <a
                  href={paymentInfo.paypalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full flex items-center justify-center space-x-2 text-xs py-2"
                >
                  <span>💰</span>
                  <span>Pay with PayPal</span>
                </a>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-yellow-800 font-medium mb-1">📱 Payment Instructions:</p>
            <ol className="text-xs text-yellow-700 space-y-0.5 list-decimal list-inside">
              {paymentInfo.method === 'upi' ? (
                <>
                  <li>Scan QR code or click "Pay via UPI App"</li>
                  <li>Pay {paymentInfo.currencySymbol}{paymentInfo.amount} via UPI</li>
                  <li>Enter transaction ID/UTR below</li>
                  <li>Wait for verification (within 24 hours)</li>
                </>
              ) : paymentInfo.method === 'paypal' ? (
                <>
                  <li>Click "Pay with PayPal" button</li>
                  <li>Complete {paymentInfo.currencySymbol}{paymentInfo.amount} payment</li>
                  <li>Enter transaction ID below</li>
                  <li>Wait for verification (within 24 hours)</li>
                </>
              ) : (
                <>
                  <li>Make payment using provided details</li>
                  <li>Pay {paymentInfo.currencySymbol}{paymentInfo.amount}</li>
                  <li>Enter transaction ID below</li>
                  <li>Wait for verification (within 24 hours)</li>
                </>
              )}
            </ol>
          </div>

          {/* Transaction ID Input */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {paymentInfo.method === 'paypal' ? 'PayPal Transaction ID *' : 'Transaction ID / UTR Number *'}
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder={paymentInfo.method === 'paypal' ? 'Enter PayPal transaction ID' : 'Enter 12-digit transaction ID'}
              className="input text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              You'll receive this after successful payment
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !transactionId.trim()}
            className="btn btn-primary w-full text-sm py-2"
          >
            {submitting ? 'Submitting...' : 'Submit Payment Proof'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            Your automation will be activated within 24 hours after verification
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;

