import { useEffect, useState } from 'react';
import { ArrowLeft, ThumbsUp, MessageCircle, Share2, Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { automationAPI } from '../../services/api';

function PostHistory() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await automationAPI.getGeneratedPosts();
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to load post history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-linkedin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Post History</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          View all your generated and published posts with engagement metrics
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {posts.map((post) => (
            <div key={post._id} className="card hover:shadow-lg transition-shadow h-full flex flex-col p-4 sm:p-6">
              {/* Post Image */}
              {post.imageUrl && (
                <div className="rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <img 
                    src={post.imageUrl} 
                    alt="Post content" 
                    className="w-full h-40 sm:h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Topic & Status */}
              <div className="flex items-center justify-between mb-2 gap-2">
                {post.topicId && (
                  <span className="text-xs sm:text-sm font-medium text-gray-600 truncate flex-1">
                    {post.topicId.name}
                  </span>
                )}
                <span className={`badge text-xs flex-shrink-0 ${
                  post.status === 'published' ? 'badge-posted' :
                  post.status === 'generated' ? 'badge-generated' : 'badge-pending'
                }`}>
                  {post.status || 'generated'}
                </span>
              </div>

              {/* Post Content */}
              <div className="mb-3 flex-1">
                <p className="text-xs sm:text-sm text-gray-900 line-clamp-3 leading-relaxed">{post.content}</p>
              </div>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.hashtags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 rounded-full bg-linkedin/10 text-linkedin"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.hashtags.length > 3 && (
                    <span className="text-xs text-gray-500">+{post.hashtags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Engagement Stats - Compact */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="flex items-center space-x-1">
                    <ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{post.engagement?.likes || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{post.engagement?.comments || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{post.engagement?.shares || 0}</span>
                  </span>
                </div>
                {post.linkedInPostUrl && (
                  <a
                    href={post.linkedInPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-linkedin hover:text-linkedin-dark"
                    title="View on LinkedIn"
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                )}
              </div>

              {/* Date */}
              <div className="text-xs text-gray-400 mt-2">
                {post.postedAt ? (
                  format(new Date(post.postedAt), 'MMM dd, yyyy')
                ) : (
                  format(new Date(post.createdAt), 'MMM dd, yyyy')
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8 sm:py-12 px-4">
          <Eye className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
            Your generated and published posts will appear here
          </p>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="btn btn-primary inline-block px-6 py-2.5 text-sm sm:text-base"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* Summary Stats */}
      {posts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="card text-center p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Posts</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{posts.length}</p>
          </div>
          <div className="card text-center p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Likes</p>
            <p className="text-xl sm:text-2xl font-bold text-linkedin">
              {posts.reduce((sum, post) => sum + (post.engagement?.likes || 0), 0)}
            </p>
          </div>
          <div className="card text-center p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Comments</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {posts.reduce((sum, post) => sum + (post.engagement?.comments || 0), 0)}
            </p>
          </div>
          <div className="card text-center p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Shares</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {posts.reduce((sum, post) => sum + (post.engagement?.shares || 0), 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostHistory;

