import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Eye, BookOpen } from 'lucide-react';

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
    <section className="py-20 sm:py-28">
      <div className="section-premium">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 text-accent-cyan rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Our Blog
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mt-3 leading-tight">
              Latest Articles
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-4 max-w-lg text-lg">
              Tips, guides, and insights from our team
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-marsana-600 dark:text-marsana-400 hover:text-marsana-700 dark:hover:text-marsana-300 bg-marsana-50 dark:bg-marsana-950 hover:bg-marsana-100 dark:hover:bg-marsana-900 rounded-2xl transition-all duration-200 group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug || post.id}`}
              className="group bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-soft border border-surface-100/50 dark:border-surface-800/50 hover:shadow-float hover:-translate-y-2 transition-all duration-500 ease-out-expo"
            >
              <div className="aspect-[16/9] bg-surface-50 dark:bg-surface-800 overflow-hidden">
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out-expo"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-marsana-50 to-marsana-100 dark:from-marsana-950 dark:to-marsana-900">
                    <BookOpen className="w-10 h-10 text-marsana-300 dark:text-marsana-600" />
                  </div>
                )}
              </div>

              <div className="p-6">
                {post.category && (
                  <span className="inline-block text-xs font-semibold text-marsana-600 dark:text-marsana-400 bg-marsana-50 dark:bg-marsana-950 px-3 py-1.5 rounded-xl mb-4">
                    {post.category}
                  </span>
                )}

                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-3 group-hover:text-marsana-600 dark:group-hover:text-marsana-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-5 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-surface-400 dark:text-surface-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{post.author_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{post.view_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium text-marsana-600 dark:text-marsana-400 bg-marsana-50 dark:bg-marsana-950 hover:bg-marsana-100 dark:hover:bg-marsana-900 rounded-2xl transition-all duration-200"
          >
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
