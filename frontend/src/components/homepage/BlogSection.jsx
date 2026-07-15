import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Eye } from 'lucide-react';

export default function BlogSection({ posts = [] }) {
  if (posts.length === 0) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest from Our Blog</h2>
            <p className="text-gray-600 mt-1">Tips, guides, and more</p>
          </div>
          <Link
            to="/blog"
            className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug || post.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                    <span className="text-primary-300 text-4xl font-bold">B</span>
                  </div>
                )}
              </div>

              <div className="p-5">
                {post.category && (
                  <span className="inline-block text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded mb-3">
                    {post.category}
                  </span>
                )}

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{post.author_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{post.view_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            View All Articles
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
