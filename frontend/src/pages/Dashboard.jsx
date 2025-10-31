import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useArticleStore } from '../store/articleStore';
import { FileText, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { fetchArticles, articles } = useArticleStore();
  const [stats, setStats] = useState({ articlesCount: 0, publishedCount: 0, commentsCount: 0 });

  useEffect(() => {
    fetchArticles({ authorId: user?.id, limit: 5 });
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/users/me/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your articles</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Articles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.articlesCount}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.publishedCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comments Made</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.commentsCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Articles</h2>
          <Link to="/articles" className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No articles yet</p>
            <Link to="/articles/new" className="btn-primary mt-4 inline-block">
              Create Your First Article
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 hover:text-primary-600">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        article.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {article.status}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(article.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
