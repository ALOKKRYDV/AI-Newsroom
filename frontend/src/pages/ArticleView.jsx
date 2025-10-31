import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useArticleStore } from '../store/articleStore';
import { useAuthStore } from '../store/authStore';
import { 
  Edit, 
  Trash2, 
  Clock, 
  User, 
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentArticle, fetchArticle, deleteArticle, subscribeToArticle } = useArticleStore();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [factChecks, setFactChecks] = useState([]);

  useEffect(() => {
    if (id) {
      fetchArticle(id).then(article => {
        if (article) {
          setComments(article.comments || []);
          setFactChecks(article.factChecks || []);
        }
      });

      // Subscribe to real-time updates
      const unsubscribe = subscribeToArticle(id, (data) => {
        if (data.type === 'article-updated') {
          fetchArticle(id);
          toast.success('Article updated by another user');
        }
      });

      return () => unsubscribe();
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      const result = await deleteArticle(id);
      if (result.success) {
        toast.success('Article deleted');
        navigate('/articles');
      } else {
        toast.error('Failed to delete article');
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data } = await api.post('/comments', {
        articleId: id,
        content: newComment
      });
      setComments([data, ...comments]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (!currentArticle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  const canEdit = user?.id === currentArticle.authorId || user?.role === 'EDITOR' || user?.role === 'ADMIN';

  const canPublish = user?.role === 'EDITOR' || user?.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentArticle.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
            currentArticle.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {currentArticle.status}
          </span>

          {canEdit && (
            <div className="flex space-x-2">
              <Link to={`/articles/${id}/edit`} className="btn-outline">
                <Edit className="w-4 h-4 mr-2 inline" />
                Edit
              </Link>
              <button onClick={handleDelete} className="btn-secondary text-red-600">
                <Trash2 className="w-4 h-4 mr-2 inline" />
                Delete
              </button>
              {user?.id === currentArticle.authorId && currentArticle.status === 'DRAFT' && (
                <button onClick={async () => {
                  try {
                    const { data } = await api.post(`/articles/${id}/submit`);
                    toast.success('Submitted for review');
                    fetchArticle(id);
                  } catch (e) { toast.error('Submit failed'); }
                }} className="btn-primary">
                  Submit for Review
                </button>
              )}
              {canPublish && currentArticle.status === 'IN_REVIEW' && (
                <button onClick={async () => {
                  try {
                    const { data } = await api.post(`/articles/${id}/publish`);
                    toast.success('Article published');
                    fetchArticle(id);
                  } catch (e) { toast.error('Publish failed'); }
                }} className="btn-primary bg-green-600">
                  Publish
                </button>
              )}
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {currentArticle.title}
        </h1>

        <div className="flex items-center space-x-6 text-gray-600">
          <div className="flex items-center space-x-2">
            <img
              src={currentArticle.author.avatar || `https://ui-avatars.com/api/?name=${currentArticle.author.name}`}
              alt={currentArticle.author.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{currentArticle.author.name}</p>
              <p className="text-sm">{currentArticle.author.role}</p>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {new Date(currentArticle.createdAt).toLocaleDateString()}
          </div>
        </div>

        {currentArticle.tags && currentArticle.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {currentArticle.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card mb-8">
        {currentArticle.featuredImage && (
          <img
            src={currentArticle.featuredImage}
            alt={currentArticle.title}
            className="w-full rounded-lg mb-6"
          />
        )}

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: currentArticle.content }}
        />
      </div>

      {/* Fact Checks */}
      {factChecks.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Fact Checks
          </h2>
          <div className="space-y-4">
            {factChecks.map((check) => (
              <div key={check.id} className="border-l-4 border-primary-500 pl-4">
                <p className="font-medium text-gray-900">{check.claim}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    check.verdict === 'true' ? 'bg-green-100 text-green-800' :
                    check.verdict === 'false' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {check.verdict}
                  </span>
                  {check.confidence && (
                    <span className="text-sm text-gray-600">
                      Confidence: {(check.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                {check.explanation && (
                  <p className="text-sm text-gray-600 mt-2">{check.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Comments ({comments.length})
        </h2>

        {/* Add Comment */}
        <div className="mb-6">
          <textarea
            className="input-field resize-none"
            rows="3"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment} className="btn-primary mt-2">
            Post Comment
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src={comment.user.avatar || `https://ui-avatars.com/api/?name=${comment.user.name}`}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{comment.user.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700">{comment.content}</p>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 mt-3 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-2">
                      <img
                        src={reply.user.avatar || `https://ui-avatars.com/api/?name=${reply.user.name}`}
                        alt={reply.user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{reply.user.name}</p>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
