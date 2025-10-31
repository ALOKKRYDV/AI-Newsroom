import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticleStore } from '../store/articleStore';
import { Search, Filter, Plus } from 'lucide-react';

export default function ArticleList() {
  const { articles, pagination, fetchArticles, loading } = useArticleStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchArticles({ search: searchTerm, status: statusFilter });
  }, [searchTerm, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
        <Link to="/articles/new" className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No articles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/articles/${article.id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              {article.featuredImage && (
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.title}
              </h3>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  article.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                  article.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {article.status}
                </span>
                <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <img
                  src={article.author.avatar || `https://ui-avatars.com/api/?name=${article.author.name}`}
                  alt={article.author.name}
                  className="w-6 h-6 rounded-full"
                />
                <span>{article.author.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchArticles({ page })}
              className={`px-4 py-2 rounded-lg ${
                page === pagination.page
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
