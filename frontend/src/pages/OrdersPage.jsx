import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Sparkles } from 'lucide-react';
import { Badge, Button } from '../components/ui';
import AccountShell from '../components/account/AccountShell';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { subscribeToOrderEvents } from '../services/socketClient';
import { formatINR } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

function getPaymentBadgeVariant(paymentStatus) {
  if (paymentStatus === 'PAID') return 'forest';
  if (paymentStatus === 'FAILED') return 'saffron';
  return 'gold';
}

function formatCustomerPaymentStatus(order) {
  if (order.paymentStatus === 'PAID') return 'Paid';
  if (order.paymentStatus === 'FAILED') return 'Not Completed';
  return order.paymentMethod === 'COD' ? 'Pay on Delivery' : 'Payment Due';
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    setLoading(true);
    orderService.getMyOrders().then((res) => {
      if (!active) return;
      setLoading(false);
      if (res.ok && Array.isArray(res.data?.orders)) {
        setOrders(res.data.orders);
      } else if (!res.ok) {
        if (res.error?.isNetworkError) {
          console.warn('[Orders] Could not reach store:', res.error);
          setStatusMessage("We couldn't reach the store right now. Please try again in a moment.");
        } else {
          setStatusMessage(res.error.message);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    return subscribeToOrderEvents({
      enabled: true,
      onOrderUpdated: (evt) => {
        setOrders((prev) =>
          prev.map((o) =>
            String(o._id) === String(evt.orderId) || o.orderNumber === evt.orderNumber
              ? {
                  ...o,
                  status: evt.status || o.status,
                  paymentStatus: evt.paymentStatus || o.paymentStatus,
                }
              : o
          )
        );
        setStatusMessage(`Order #${evt.orderNumber} is now ${evt.status}.`);
      },
    });
  }, [isAuthenticated]);

  return (
    <AccountShell
      title={language === 'en' ? 'Order History' : t('pages.orders.title')}
      subtitle={
        language === 'en'
          ? 'Review your past purchases, delivery progress, and order receipts.'
          : t('pages.orders.subtitle')
      }
    >
      {!isAuthenticated ? (
        <div className="rounded-[22px] border border-[#E6DEC9] bg-[#FFFDF8] p-7 sm:p-9 space-y-5 gg-shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/40 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#9A7624]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-editorial text-3xl font-semibold text-[#0F3D2E]">
                {language === 'hi'
                  ? 'ऑर्डर देखने के लिए साइन इन आवश्यक है'
                  : language === 'hinglish'
                    ? 'Orders Dekhne ke Liye Sign In Zaroori Hai'
                    : 'Sign In Required to View Orders'}
              </h2>
              <p className="text-sm text-[#5A554C] leading-relaxed">
                {language === 'hi'
                  ? 'अपने ऑर्डर, रसीद और लाइव डिलीवरी स्थिति देखने के लिए साइन इन करें।'
                  : 'Sign in with your customer account to view your past purchases, order receipts, and live delivery status.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button to="/login?next=/account/orders" variant="primary" size="md">
              {t('pages.auth.signInBtn')}
            </Button>
            <Button
              to="/account/orders/preview-lifecycle"
              variant="secondary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {language === 'hi'
                ? 'ऑर्डर ट्रैकिंग टाइमलाइन देखें'
                : language === 'hinglish'
                  ? 'Order Tracking UI Dekhein'
                  : 'Inspect Order Tracking Timeline UI'}
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="rounded-[22px] border border-[#E6DEC9] bg-[#FFFDF8] p-8 text-center text-sm text-[#5A554C] gg-shadow-sm">
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-[22px] border border-[#E6DEC9] bg-[#FFFDF8] p-10 text-center space-y-4 gg-shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/40 flex items-center justify-center mx-auto text-[#0F3D2E]">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
              No Orders Yet
            </h2>
            <p className="text-sm text-[#5A554C] max-w-sm mx-auto">
              Once you place your first order from our kitchen, it will appear here with live
              delivery tracking.
            </p>
          </div>
          {statusMessage && <p className="text-xs text-[#8C2D19]">{statusMessage}</p>}
          <Button
            to="/shop"
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Shop
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {statusMessage && (
            <div
              role="status"
              className="rounded-[14px] border border-[#C9A24B]/40 bg-[#FFFDF8] px-4 py-3 text-xs text-[#0F3D2E] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#9A7624] shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {orders.map((order) => {
            const totalAmount = order.pricing?.totalAmount ?? order.totalAmount ?? 0;
            const totalItems = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
            return (
              <Link
                key={order._id || order.orderNumber}
                to={`/account/orders/${order._id || order.orderNumber}`}
                className="block rounded-[20px] border border-[#E6DEC9] bg-[#FFFDF8] p-5 hover:gg-shadow-md transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9A7624]">
                      Order #{order.orderNumber} •{' '}
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : ''}
                    </p>
                    <p className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                      {order.status}
                    </p>
                    <p className="text-xs text-[#5A554C]">
                      {totalItems} {totalItems === 1 ? 'pack' : 'packs'} •{' '}
                      {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
                    </p>
                  </div>

                  <div className="text-right space-y-1.5">
                    <p className="text-lg font-semibold text-[#0F3D2E] tabular-nums">
                      {formatINR(totalAmount)}
                    </p>
                    <div className="inline-flex items-center gap-1.5">
                      <Badge variant="cream" size="sm">
                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                      </Badge>
                      <Badge variant={getPaymentBadgeVariant(order.paymentStatus)} size="sm">
                        {formatCustomerPaymentStatus(order)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
