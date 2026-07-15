import { useState, useRef, useEffect } from 'react';
import { Star, ThumbsUp, Flag, User, X } from 'lucide-react';
import { productService } from '../../services/api/productService';
import { useAuth } from '../../context/AuthContext';

const REPORT_REASONS = [
  'Spam or fake review',
  'Inappropriate content',
  'Off-topic or irrelevant',
  'Misleading information',
  'Other',
];

export default function ProductReviews({ productId, initialReviews = [], initialRatingSummary = {}, pagination = {} }) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [ratingSummary, setRatingSummary] = useState(initialRatingSummary);
  const [currentPage, setCurrentPage] = useState(pagination.page || 1);
  const [totalPages, setTotalPages] = useState(pagination.pages || 1);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [helpfulLoading, setHelpfulLoading] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [reportForm, setReportForm] = useState({ reason: '', description: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const reportTimeoutRef = useRef(null);

  const fetchReviews = async (page) => {
    setLoading(true);
    try {
      const response = await productService.getProductReviews(productId, { page, limit: 10 });
      if (response.success) {
        setReviews(response.data);
        setRatingSummary(response.rating_summary);
        setCurrentPage(response.pagination?.page || 1);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await productService.createProductReview(productId, reviewForm);
      if (response.success) {
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: '', content: '' });
        fetchReviews(1);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHelpful = async (reviewId) => {
    if (!isAuthenticated) return;
    setHelpfulLoading(reviewId);
    try {
      const response = await productService.toggleReviewHelpful(productId, reviewId);
      if (response.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpful_count: response.data.helpful_count,
                  is_helpful: response.data.is_helpful,
                }
              : r
          )
        );
      }
    } catch {
      // Silently fail
    } finally {
      setHelpfulLoading(null);
    }
  };

  const handleOpenReport = (review) => {
    setReportModal(review);
    setReportForm({ reason: '', description: '' });
    setReportError(null);
    setReportSuccess(false);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.reason) return;
    setReportSubmitting(true);
    setReportError(null);
    try {
      const response = await productService.reportReview(productId, reportModal.id, reportForm);
      if (response.success) {
        setReportSuccess(true);
        reportTimeoutRef.current = setTimeout(() => {
          setReportModal(null);
          setReportSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setReportError(err.response?.data?.detail || 'Failed to report review');
    } finally {
      setReportSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (reportTimeoutRef.current) {
        clearTimeout(reportTimeoutRef.current);
      }
    };
  }, []);

  const renderStars = (rating, size = 'w-4 h-4') => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="btn-primary text-sm"
        >
          Write a Review
        </button>
      </div>

      {ratingSummary?.total > 0 && (
        <div className="flex items-center gap-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{ratingSummary.average}</div>
            {renderStars(Math.round(ratingSummary.average), 'w-5 h-5')}
            <div className="text-sm text-gray-500 mt-1">{ratingSummary.total} reviews</div>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">{star} star</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${
                        ratingSummary.total > 0
                          ? ((ratingSummary.breakdown?.[star] || 0) / (ratingSummary.total || 1)) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">
                  {ratingSummary.breakdown?.[star] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="p-4 border border-gray-200 rounded-lg space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewForm.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={reviewForm.title}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
              className="input-field"
              placeholder="Review title (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
            <textarea
              value={reviewForm.content}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, content: e.target.value }))}
              className="input-field"
              rows={4}
              placeholder="Share your experience with this product..."
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border border-gray-100 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.user_avatar ? (
                      <img
                        src={review.user_avatar}
                        alt={review.user_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{review.user_name}</div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      {review.is_verified_purchase && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.title && (
                <h4 className="mt-3 font-medium text-gray-900">{review.title}</h4>
              )}
              {review.content && (
                <p className="mt-2 text-sm text-gray-600">{review.content}</p>
              )}
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={() => handleToggleHelpful(review.id)}
                  disabled={!isAuthenticated || helpfulLoading === review.id}
                  className={`flex items-center gap-1 text-sm transition-colors disabled:opacity-50 ${
                    review.is_helpful
                      ? 'text-primary-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${review.is_helpful ? 'fill-primary-600' : ''}`} />
                  Helpful ({review.helpful_count})
                </button>
                <button
                  onClick={() => handleOpenReport(review)}
                  disabled={!isAuthenticated}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => fetchReviews(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchReviews(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {reportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Report Review</h3>
              <button
                onClick={() => setReportModal(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Flag className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-green-700 font-medium">Report submitted successfully</p>
                <p className="text-sm text-gray-500 mt-1">We will review your report shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                {reportError && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{reportError}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((reason) => (
                      <label key={reason} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="reason"
                          value={reason}
                          checked={reportForm.reason === reason}
                          onChange={(e) =>
                            setReportForm((prev) => ({ ...prev, reason: e.target.value }))
                          }
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) =>
                      setReportForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="input-field"
                    rows={3}
                    placeholder="Provide more context..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!reportForm.reason || reportSubmitting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportModal(null)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
