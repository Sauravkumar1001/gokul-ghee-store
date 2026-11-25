import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminFeedbackBanner,
  AdminLoadingState,
  AdminStatusBadge,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getReviews({ status: filter });
    setLoading(false);
    if (res.ok) {
      setReviews(res.data.reviews || []);
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to load reviews.' });
    }
  }, [filter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleModerate = async (reviewId, status) => {
    const res = await adminService.moderateReview(reviewId, status);
    if (res.ok) {
      setFeedback({ type: 'info', message: res.data.message });
      loadReviews();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Moderation failed.' });
    }
  };

  return (
    <AdminLayout
      title="Verified Review Moderation"
      subtitle="Approve or reject verified-delivery customer reviews; product ratings recalculate automatically."
    >
      <AdminFeedbackBanner type={feedback.type} message={feedback.message} />

      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase ${
              filter === tab
                ? 'bg-[#173D2B] text-[#F8F4E9]'
                : 'bg-white border border-slate-300 text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <AdminLoadingState />
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          No customer reviews found in this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="rounded-lg border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {rev.product?.name || 'Product'}
                  </span>
                  <span className="font-semibold text-amber-700">{rev.rating} / 5 ★</span>
                  <AdminStatusBadge status={rev.status} />
                  {rev.order?.orderNumber && (
                    <span className="text-[11px] text-slate-500">
                      Order #{rev.order.orderNumber}
                    </span>
                  )}
                </div>
                {rev.title && <p className="font-semibold text-slate-800">{rev.title}</p>}
                <p className="text-slate-600 max-w-2xl">{rev.comment}</p>
                <p className="text-[11px] text-slate-400">
                  By {rev.user?.name || 'Customer'} ({rev.user?.email})
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleModerate(rev._id, 'approved')}
                  className="px-3 py-1.5 rounded bg-emerald-700 text-white font-semibold"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleModerate(rev._id, 'rejected')}
                  className="px-3 py-1.5 rounded border border-rose-300 text-rose-700 font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
