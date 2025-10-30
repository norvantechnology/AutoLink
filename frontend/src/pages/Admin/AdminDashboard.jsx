import { useEffect, useState } from 'react';
import { Users, CreditCard, FileText, CheckCircle, Clock, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingPayments()
      ]);
      
      console.log('📊 Admin Stats Response:', statsRes.data);
      console.log('💳 Pending Payments:', paymentsRes.data);
      
      setStats(statsRes.data.stats);
      setPendingPayments(paymentsRes.data.payments);
    } catch (error) {
      console.error('❌ Load admin data error:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (subscriptionId) => {
    if (!confirm('Verify and activate this payment?')) return;

    try {
      await adminAPI.verifyPayment(subscriptionId);
      toast.success('Payment verified and subscription activated!');
      loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify payment');
    }
  };

  const handleRejectPayment = async (subscriptionId) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;

    try {
      await adminAPI.rejectPayment(subscriptionId, reason);
      toast.success('Payment rejected');
      loadAdminData();
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users, payments, and system settings</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.verifiedUsers ?? 0} verified, {stats?.adminCount ?? 0} admin
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="card bg-green-50 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
              <p className="text-3xl font-bold text-green-600">{stats?.activeSubscriptions || 0}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="card bg-yellow-50 border-2 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.pendingPayments || 0}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        <div className="card bg-purple-50 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Posts</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.totalPosts || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats?.publishedPosts || 0} published</p>
            </div>
            <FileText className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-linkedin text-linkedin'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-linkedin text-linkedin'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Payments ({pendingPayments.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Summary</h3>
              {stats?.revenue && stats.revenue.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.revenue.map((rev) => (
                    <div key={rev._id} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Revenue ({rev._id})</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {rev._id === 'USD' ? '$' : '₹'}{rev.total}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{rev.count} subscriptions</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No revenue data yet</p>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Payment Verifications</h3>
              
              {pendingPayments.length > 0 ? (
                <div className="space-y-3">
                  {pendingPayments.map((payment) => (
                    <div key={payment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Payment Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {payment.userId?.name || 'Unknown User'}
                            </h4>
                            <StatusBadge status={payment.status} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">Email:</span> {payment.userId?.email}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Plan:</span> {payment.planType}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Amount:</span> {payment.currencySymbol}{payment.amount}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Posts/day:</span> {payment.postsPerDay}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Transaction ID:</span> {payment.transactionId || 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Method:</span> {payment.paymentMethod}
                            </p>
                            <p className="text-gray-600 col-span-2">
                              <span className="font-medium">Submitted:</span>{' '}
                              {new Date(payment.createdAt).toLocaleString()}
                            </p>
                          </div>

                          {payment.transactionScreenshot && (
                            <div className="mt-3">
                              <a
                                href={payment.transactionScreenshot}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-linkedin hover:underline"
                              >
                                View Screenshot →
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2">
                          <button
                            onClick={() => handleVerifyPayment(payment._id)}
                            className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                          >
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Verify
                          </button>
                          <button
                            onClick={() => handleRejectPayment(payment._id)}
                            className="flex-1 md:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No pending payments</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

