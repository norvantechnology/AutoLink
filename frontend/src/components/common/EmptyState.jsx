import { useNavigate } from 'react-router-dom';

function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionPath 
}) {
  const navigate = useNavigate();

  return (
    <div className="card text-center py-12">
      {Icon && <Icon className="w-12 h-12 text-gray-400 mx-auto mb-3" />}
      <p className="text-gray-600 text-lg font-medium mb-2">{title}</p>
      {description && <p className="text-gray-500">{description}</p>}
      {actionText && actionPath && (
        <button
          onClick={() => navigate(actionPath)}
          className="mt-4 px-6 py-2 bg-linkedin text-white rounded-lg hover:bg-linkedin-dark"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

