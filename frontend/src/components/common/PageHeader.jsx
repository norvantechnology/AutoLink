import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PageHeader({ title, description, showBack = true }) {
  const navigate = useNavigate();

  return (
    <div>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      )}
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {description && (
        <p className="text-gray-600 mt-1">{description}</p>
      )}
    </div>
  );
}

export default PageHeader;

