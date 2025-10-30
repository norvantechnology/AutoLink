import { useEffect, useState } from 'react';
import { Edit2, Trash2, Save, X, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { automationAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { getWordCount } from '../../utils/formatters';

function ScheduledPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({ content: '', imageUrl: '', hashtags: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    try {
      const response = await automationAPI.getScheduledPosts();
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (post) => {
    setEditingPost(post._id);
    setEditForm({
      content: post.content,
      imageUrl: post.imageUrl,
      hashtags: post.hashtags || []
    });
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditForm({ content: '', imageUrl: '', hashtags: [] });
  };

  const saveEdit = async (postId) => {
    try {
      setSaving(true);
      await automationAPI.updatePost(postId, editForm);
      toast.success('Post updated successfully!');
      setEditingPost(null);
      loadScheduledPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this scheduled post?')) return;
    
    try {
      await automationAPI.deletePost(postId);
      toast.success('Post deleted successfully!');
      loadScheduledPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Scheduled Posts"
        description="Review and edit posts before they're published to LinkedIn"
      />

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="card">
              {editingPost === post._id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Post</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => saveEdit(post._id)}
                        disabled={saving}
                        className="flex items-center space-x-1 px-3 py-2 bg-linkedin text-white rounded-lg hover:bg-linkedin-dark disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center space-x-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>

                  {/* Edit Post Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Text
                    </label>
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent"
                      placeholder="Edit your post content..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {getWordCount(editForm.content)} words
                    </p>
                  </div>

                  {/* Edit Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={editForm.imageUrl}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent"
                      placeholder="https://..."
                    />
                    {editForm.imageUrl && (
                      <img 
                        src={editForm.imageUrl} 
                        alt="Preview" 
                        className="mt-3 w-full max-w-md rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          toast.error('Invalid image URL');
                        }}
                      />
                    )}
                  </div>

                  {/* Edit Hashtags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hashtags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editForm.hashtags.join(', ')}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        hashtags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent"
                      placeholder="AI, Tech, LinkedIn"
                    />
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          {post.topicId?.name || 'No topic'}
                        </span>
                        <span className="badge badge-generated">Scheduled</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Publishes at {post.scheduledPublishTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(post)}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deletePost(post._id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image Preview */}
                    {post.imageUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Image</p>
                        <img 
                          src={post.imageUrl} 
                          alt="Post" 
                          className="w-full rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    )}

                    {/* Content Preview */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Post Content</p>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                              {post.hashtags.map((tag, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-sm text-linkedin bg-blue-50 px-2 py-1 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Scheduled Posts"
          description="Posts will appear here after content generation runs"
          actionText="Go to Dashboard"
          actionPath="/dashboard"
        />
      )}
    </div>
  );
}

export default ScheduledPosts;

