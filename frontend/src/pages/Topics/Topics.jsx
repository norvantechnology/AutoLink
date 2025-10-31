import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { topicsAPI } from '../../services/api';

function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keywords: '',
    tone: 'professional',
  });

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await topicsAPI.getAll();
      setTopics(response.data.topics);
    } catch (error) {
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({
        name: topic.name,
        description: topic.description || '',
        keywords: topic.keywords?.join(', ') || '',
        tone: topic.tone || 'professional',
      });
    } else {
      setEditingTopic(null);
      setFormData({
        name: '',
        description: '',
        keywords: '',
        tone: 'professional',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTopic(null);
    setFormData({
      name: '',
      description: '',
      keywords: '',
      tone: 'professional',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
    };

    try {
      if (editingTopic) {
        await topicsAPI.update(editingTopic._id, data);
        toast.success('Topic updated successfully');
      } else {
        await topicsAPI.create(data);
        toast.success('Topic created successfully');
      }
      loadTopics();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save topic');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    try {
      await topicsAPI.delete(id);
      toast.success('Topic deleted successfully');
      loadTopics();
    } catch (error) {
      toast.error('Failed to delete topic');
    }
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'educational', label: 'Educational' },
    { value: 'humorous', label: 'Humorous' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-linkedin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Content Topics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Create and manage topics for AI-powered post generation
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">New Topic</span>
        </button>
      </div>

      {/* Topics Grid */}
      {topics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {topics.map((topic) => (
            <div key={topic._id} className="card hover:shadow-lg transition-shadow p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-linkedin/10 rounded-lg">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-linkedin" />
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handleOpenModal(topic)}
                    className="p-1.5 text-gray-400 hover:text-linkedin transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(topic._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{topic.name}</h3>
              {topic.description && (
                <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                  {topic.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="badge badge-pending capitalize text-xs">{topic.tone}</span>
                {topic.keywords && topic.keywords.length > 0 && (
                  <span className="text-gray-500">{topic.keywords.length} keywords</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8 sm:py-12 px-4">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No topics yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Create your first topic to start generating AI-powered content
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary inline-flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create Topic</span>
          </button>
        </div>
      )}

      {/* Modal - Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                {editingTopic ? 'Edit Topic' : 'Create New Topic'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input text-sm sm:text-base h-11 sm:h-12"
                    placeholder="e.g., Artificial Intelligence, Marketing Tips"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                    placeholder="Brief description of what this topic covers..."
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="input text-sm sm:text-base h-11 sm:h-12"
                    placeholder="AI, machine learning, technology (comma-separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate keywords with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    className="input text-sm sm:text-base h-11 sm:h-12"
                  >
                    {toneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary w-full sm:w-auto py-2.5 sm:py-2 text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary w-full sm:w-auto py-2.5 sm:py-2 text-sm sm:text-base order-1 sm:order-2">
                    {editingTopic ? 'Update Topic' : 'Create Topic'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Topics;

