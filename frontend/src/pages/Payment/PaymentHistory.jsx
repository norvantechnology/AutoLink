import { useEffect, useState } from 'react';
import { CreditCard, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paymentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const response = await paymentAPI.getPaymentHistory();
      setPayments(response.data.payments);
    } catch (error) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = (planType) => {
    const plans = {
      basic: 'Basic Plan',
      standard: 'Standard Plan',
      premium: 'Premium Plan',
      enterprise: 'Enterprise Plan'
    };
    return plans[planType] || planType;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Payment History"
        description="View all your subscription payments and status"
      />

      {/* Payments List */}
      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
              <div key={payment._id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-linkedin/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-linkedin" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getPlanName(payment.planType)}
                        </h3>
                        <StatusBadge status={payment.status} />
                      </div>
                      <p className="text-sm text-gray-600">
                        {payment.postsPerDay} post{payment.postsPerDay > 1 ? 's' : ''} per day
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {formatDate(payment.createdAt)}</span>
                        </div>
                        {payment.startDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(payment.startDate)} - {payment.endDate ? formatDate(payment.endDate) : 'Ongoing'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col md:items-end space-y-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {payment.currencySymbol}{payment.amount}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {payment.currencyCode}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      via {payment.paymentMethod === 'upi' ? 'UPI' : 'QR Code'}
                    </div>
                    {payment.transactionId && (
                      <div className="text-xs text-gray-500">
                        TXN: {payment.transactionId}
                      </div>
                    )}
                    {payment.paymentVerifiedAt && (
                      <div className="text-xs text-green-600">
                        ✓ Verified: {formatDate(payment.paymentVerifiedAt)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info for Pending */}
                {payment.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⏳ Payment verification in progress. You'll be notified once verified.
                    </p>
                  </div>
                )}

                {/* Additional Info for Expired */}
                {payment.status === 'expired' && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      This subscription has expired. 
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="ml-2 text-linkedin hover:text-linkedin-dark font-medium"
                      >
                        Renew Now →
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      ) : (
        <EmptyState
          icon={CreditCard}
          title="No Payment History"
          description="Your payment transactions will appear here"
          actionText="Go to Dashboard"
          actionPath="/dashboard"
        />
      )}

      {/* Summary Stats */}
      {payments.length > 0 && (
        <div className="card bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Verifications</p>
              <p className="text-2xl font-bold text-yellow-600">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentHistory;

