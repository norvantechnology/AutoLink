import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

function StatusBadge({ status, showIcon = true }) {
  const statusConfig = {
    active: {
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle,
      text: 'Active'
    },
    published: {
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle,
      text: 'Published'
    },
    generated: {
      color: 'bg-blue-100 text-blue-700',
      icon: Clock,
      text: 'Scheduled'
    },
    pending: {
      color: 'bg-yellow-100 text-yellow-700',
      icon: Clock,
      text: 'Pending'
    },
    expired: {
      color: 'bg-gray-100 text-gray-700',
      icon: XCircle,
      text: 'Expired'
    },
    cancelled: {
      color: 'bg-red-100 text-red-700',
      icon: XCircle,
      text: 'Cancelled'
    },
    failed: {
      color: 'bg-red-100 text-red-700',
      icon: AlertCircle,
      text: 'Failed'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{config.text}</span>
    </span>
  );
}

export default StatusBadge;

