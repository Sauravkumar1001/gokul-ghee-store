import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Info,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  XCircle,
} from 'lucide-react';
import { Badge, JaaliPattern } from '../components/ui';
import AccountShell from '../components/account/AccountShell';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { subscribeToOrderEvents } from '../services/socketClient';
import { formatINR } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

const ORDER_STAGES = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY FOR DISPATCH',
  'SHIPPED',
  'OUT FOR DELIVERY',
  'DELIVERED',
];

function VerifiedItemReviewForm({ orderId, item, alreadyReviewed, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [done, setDone] = useState(alreadyReviewed);

  if (done) {
    return (
      <p className="text-xs text-[#0F3D2E] font-medium flex items-center gap-1.5 pt-2">
        <CheckCircle2 className="w-4 h-4 text-[#9A7624]" />
        <span>Verified review submitted for moderation. Thank you!</span>
      </p>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      setFeedback('Please share at least 5 characters about your experience.');
      return;
    }
    setSubmitting(true);
    setFeedback('');
    const res = await orderService.submitReview({
      productId: item.product,
      orderId,
      rating,
      title,
      comment,
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      if (onSubmitted) onSubmitted(item.product);
    } else {
      setFeedback(res.error?.message || 'Unable to submit review.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-[#E6DEC9] space-y-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-[#0F3D2E] flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-[#C9A24B]" />
          <span>Rate & Review {item.name}</span>
        </span>
        <select
          aria-label={`Rating for ${item.name}`}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="px-2.5 py-1 rounded-[10px] border border-[#E6DEC9] bg-[#FBF7EE] text-xs text-[#0F3D2E]"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Stars
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Headline (optional)"
        className="w-full px-3 py-2 rounded-[10px] bg-[#FBF7EE] border border-[#E6DEC9] text-xs text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
      />
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share aroma, freshness, or packaging feedback..."
        className="w-full px-3 py-2 rounded-[10px] bg-[#FBF7EE] border border-[#E6DEC9] text-xs text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
      />
      {feedback && <p className="text-[#8C2D19]">{feedback}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 rounded-full bg-[#0F3D2E] text-[#FBF7EE] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#155742] transition-colors disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit Verified Review'}
      </button>
    </form>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const justPlaced = searchParams.get('placed') === '1';
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const isHi = language === 'hi';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadOrderData = useCallback(async () => {
    if (!isAuthenticated || !id || id === 'preview-lifecycle') {
      return;
    }
    setLoading(true);
    const [orderRes, reviewsRes] = await Promise.all([
      orderService.getOrderById(id),
      orderService.getMyReviews(),
    ]);
    setLoading(false);

    if (orderRes.ok && orderRes.data?.order) {
      setOrder(orderRes.data.order);
      setErrorMsg('');
    } else if (!orderRes.ok) {
      setErrorMsg(orderRes.error.message);
    }

    if (reviewsRes.ok && Array.isArray(reviewsRes.data?.reviews)) {
      const reviewed = new Set(
        reviewsRes.data.reviews
          .filter((r) => String(r.order) === String(orderRes.data?.order?._id))
          .map((r) => String(r.product?._id || r.product))
      );
      setReviewedProductIds(reviewed);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    loadOrderData();
  }, [loadOrderData]);

  useEffect(() => {
    if (!isAuthenticated || !id || id === 'preview-lifecycle') return undefined;

    return subscribeToOrderEvents({
      enabled: true,
      orderId: id,
      onOrderUpdated: (evt) => {
        setOrder((prev) => {
          if (
            !prev ||
            (String(prev._id) !== String(evt.orderId) &&
              prev.orderNumber !== evt.orderNumber)
          ) {
            return prev;
          }
          return {
            ...prev,
            status: evt.status || prev.status,
            paymentStatus: evt.paymentStatus || prev.paymentStatus,
            statusHistory:
              Array.isArray(evt.statusHistory) && evt.statusHistory.length > 0
                ? evt.statusHistory
                : prev.statusHistory,
            updatedAt: evt.updatedAt || prev.updatedAt,
          };
        });
        if (evt.status) {
          setActionMessage(
            `Live order update: #${evt.orderNumber} is now "${evt.status}"${
              evt.note ? ` — ${evt.note}` : ''
            }.`
          );
        }
      },
    });
  }, [id, isAuthenticated]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    setActionMessage('');
    const res = await orderService.cancelOrder(
      order._id,
      cancelReason.trim() || 'Cancelled by customer'
    );
    setCancelling(false);
    if (res.ok && res.data?.order) {
      setOrder(res.data.order);
      setActionMessage(res.data.message);
    } else {
      setActionMessage(res.error?.message || 'Unable to cancel order.');
    }
  };

  const activeStageIndex = order ? ORDER_STAGES.indexOf(order.status) : -1;
  const isTerminated = order?.status === 'CANCELLED' || order?.status === 'REFUNDED';
  const canCancel = order && ['PLACED', 'CONFIRMED'].includes(order.status);
  const totalAmount = order?.pricing?.totalAmount ?? order?.totalAmount ?? 0;

  return (
    <AccountShell
      title={
        order
          ? isHi
            ? `ऑर्डर #${order.orderNumber}`
            : `Order #${order.orderNumber}`
          : isHi
            ? 'ऑर्डर ट्रैकिंग टाइमलाइन'
            : 'Order Tracking Timeline'
      }
      subtitle={
        isHi
          ? 'अपने ऑर्डर की रसीद और 7-चरणीय डिलीवरी प्रगति देखें।'
          : 'Follow your 7-stage preparation and doorstep delivery timeline.'
      }
    >
      <div className="rounded-[24px] border border-[#E6DEC9] bg-[#FFFDF8] p-6 sm:p-8 space-y-6 gg-shadow-sm">
        {justPlaced && order && (
          <motion.div
            role="status"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[20px] bg-[#0F3D2E] text-[#FBF7EE] p-5 sm:p-6 flex items-start gap-4 border border-[#C9A24B]/45"
          >
            <JaaliPattern variant="tile" opacity={0.07} />
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.6, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.08 }}
              className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-[#D8B45E] to-[#B08732] text-[#0F3D2E] flex items-center justify-center shrink-0 shadow-sm"
            >
              <CheckCircle2 className="w-6 h-6" />
            </motion.div>
            <div className="relative z-10 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-editorial text-xl sm:text-2xl font-semibold text-[#FBF7EE]">
                  Order #{order.orderNumber} Confirmed!
                </p>
                <Badge variant="gold" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                  Thank You
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-[#E8D08B] leading-relaxed">
                {order.paymentStatus === 'PAID'
                  ? 'Payment received successfully. Your order is confirmed by our team before dispatch.'
                  : 'Order placed with Cash on Delivery — pay in cash or UPI upon delivery. Your order is confirmed by our team before dispatch.'}
              </p>
            </div>
          </motion.div>
        )}

        {loading && (
          <p className="text-sm text-[#5A554C]">Loading your order details...</p>
        )}

        {!order && !loading && (
          <div className="rounded-[16px] bg-[#F3EAD7] border border-[#E6DEC9] px-4 py-3.5 text-xs text-[#0F3D2E] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#9A7624] shrink-0 mt-0.5" />
            <span>
              {errorMsg ||
                'Previewing our 7-stage kitchen-to-doorstep tracking timeline. Sign in and place an order at Checkout to view live receipts.'}
            </span>
          </div>
        )}

        {isTerminated && (
          <div className="rounded-[16px] bg-[#FDF1EE] border border-[#8C2D19]/30 p-4 text-xs text-[#8C2D19] flex items-start gap-2.5">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold uppercase tracking-wider">Order {order.status}</p>
              {order.cancellationReason && <p>Reason: {order.cancellationReason}</p>}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
              Fulfillment Lifecycle Stages
            </h2>
            {order && (
              <Badge variant={isTerminated ? 'saffron' : 'gold'} size="sm">
                {order.status}
              </Badge>
            )}
          </div>

          <ol className="space-y-2.5" aria-label="Order status timeline">
            {ORDER_STAGES.map((stage, idx) => {
              const completed = !isTerminated && activeStageIndex >= idx;
              const isCurrent = !isTerminated && activeStageIndex === idx;
              return (
                <li
                  key={stage}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border transition-colors ${
                    completed
                      ? 'bg-[#0F3D2E] text-[#FBF7EE] border-[#0F3D2E]'
                      : 'bg-[#FBF7EE] text-[#5A554C] border-[#E6DEC9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#C9A24B] shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 opacity-45 shrink-0" />
                    )}
                    <span className="text-xs font-semibold tracking-wider uppercase">{stage}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C9A24B] text-[#0F3D2E]">
                      Current Stage
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {order && (
          <>
            {/* Purchased Line Items + Delivered Review Trigger */}
            <div className="pt-5 border-t border-[#E6DEC9] space-y-3">
              <h3 className="font-editorial text-xl font-semibold text-[#0F3D2E]">
                Ordered Items
              </h3>
              <ul className="space-y-3">
                {(order.items || []).map((item, index) => (
                  <li
                    key={`${item.variantId}-${index}`}
                    className="p-4 rounded-[16px] bg-[#FBF7EE] border border-[#E6DEC9]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-[10px] object-cover bg-[#F3EAD7] shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0F3D2E] line-clamp-2 leading-snug">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#5A554C] mt-0.5">
                            {item.variantLabel} × {item.quantity} ({formatINR(item.unitPrice)} each)
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#0F3D2E] tabular-nums shrink-0">
                        {formatINR(item.lineTotal)}
                      </span>
                    </div>

                    {order.status === 'DELIVERED' && (
                      <VerifiedItemReviewForm
                        orderId={order._id}
                        item={item}
                        alreadyReviewed={reviewedProductIds.has(String(item.product))}
                        onSubmitted={(prodId) =>
                          setReviewedProductIds((prev) => new Set([...prev, String(prodId)]))
                        }
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing & Delivery Summary */}
            <div className="grid sm:grid-cols-2 gap-4 pt-5 border-t border-[#E6DEC9] text-xs">
              <div className="rounded-[16px] bg-[#FBF7EE] border border-[#E6DEC9] p-4 space-y-1.5">
                <span className="font-semibold uppercase tracking-wider text-[#9A7624] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Delivery Details</span>
                </span>
                <p className="font-semibold text-[#0F3D2E] pt-1">
                  {order.deliveryAddress?.recipientName} ({order.deliveryAddress?.phone})
                </p>
                <p className="text-[#5A554C] leading-relaxed">
                  {order.deliveryAddress?.houseNumber}, {order.deliveryAddress?.street}
                  {order.deliveryAddress?.landmark ? `, ${order.deliveryAddress.landmark}` : ''},{' '}
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state} –{' '}
                  {order.deliveryAddress?.pincode}
                </p>
                {order.deliveryMeta?.estimatedDeliveryTime && (
                  <p className="text-[#0F3D2E] font-medium pt-1">
                    Estimated Dispatch: {order.deliveryMeta.estimatedDeliveryTime}
                  </p>
                )}
              </div>

              <div className="rounded-[16px] bg-[#FBF7EE] border border-[#E6DEC9] p-4 space-y-1.5 tabular-nums">
                <span className="font-semibold uppercase tracking-wider text-[#9A7624] block pb-1">
                  Payment & Totals
                </span>
                <div className="flex justify-between">
                  <span className="text-[#5A554C]">Payment Method</span>
                  <span className="font-semibold text-[#0F3D2E]">
                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A554C]">Payment Status</span>
                  <span className="font-semibold text-[#0F3D2E]">
                    {order.paymentStatus === 'PAID'
                      ? 'Paid'
                      : order.paymentMethod === 'COD'
                        ? 'Pay on Delivery'
                        : 'Payment Due'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A554C]">Subtotal</span>
                  <span>{formatINR(order.pricing?.subtotal ?? totalAmount)}</span>
                </div>
                {(order.pricing?.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-[#0F3D2E]">
                    <span>Discount ({order.pricing.couponCode})</span>
                    <span>-{formatINR(order.pricing.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#5A554C]">Delivery Fee</span>
                  <span>
                    {(order.pricing?.deliveryCharge ?? 0) === 0
                      ? 'FREE'
                      : formatINR(order.pricing.deliveryCharge)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E6DEC9] flex justify-between text-sm font-semibold text-[#0F3D2E]">
                  <span>Total Amount</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Status Audit Trail */}
            {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
              <div className="pt-4 border-t border-[#E6DEC9] space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9A7624]">
                  Status Updates History
                </h3>
                <ul className="space-y-1.5 text-xs text-[#5A554C]">
                  {order.statusHistory.map((entry, idx) => (
                    <li key={idx} className="flex flex-wrap justify-between gap-2">
                      <span>
                        <strong className="text-[#0F3D2E]">{entry.status}</strong> — {entry.note}
                      </span>
                      <span className="text-[11px] tabular-nums">
                        {entry.changedAt ? new Date(entry.changedAt).toLocaleString('en-IN') : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cancel Action */}
            {canCancel && (
              <div className="pt-4 border-t border-[#E6DEC9] space-y-3">
                <p className="text-xs text-[#5A554C] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#9A7624]" />
                  <span>
                    Need to cancel before dispatch? You can cancel anytime while your order is being
                    prepared.
                  </span>
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation (optional)"
                    className="flex-1 px-3.5 py-2 rounded-full bg-[#FBF7EE] border border-[#E6DEC9] text-xs focus:outline-none focus:border-[#0F3D2E]"
                  />
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="px-4 py-2 rounded-full border border-[#8C2D19] text-[#8C2D19] text-xs font-semibold uppercase tracking-wider hover:bg-[#8C2D19] hover:text-[#FBF7EE] disabled:opacity-60 transition-colors"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>
              </div>
            )}

            {actionMessage && (
              <p role="status" className="text-xs font-medium text-[#0F3D2E]">
                {actionMessage}
              </p>
            )}
          </>
        )}

        <div className="pt-2">
          <Link
            to="/account/orders"
            className="text-xs font-semibold uppercase tracking-wider text-[#0F3D2E] hover:text-[#9A7624]"
          >
            ← Back to Order History
          </Link>
        </div>
      </div>
    </AccountShell>
  );
}
