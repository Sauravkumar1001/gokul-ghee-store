import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminFeedbackBanner,
  AdminLoadingState,
  AdminStatusBadge,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';
import { subscribeToOrderEvents } from '../../services/socketClient';
import { formatINR } from '../../utils/formatters';

const ORDER_STATUS_LIST = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY FOR DISPATCH',
  'SHIPPED',
  'OUT FOR DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [nextStatus, setNextStatus] = useState('CONFIRMED');
  const [nextPaymentStatus, setNextPaymentStatus] = useState('PENDING');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getOrders({
      status: statusFilter,
      ...(search.trim() ? { q: search.trim() } : {}),
    });
    setLoading(false);
    if (res.ok) {
      setOrders(res.data.orders || []);
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to load orders.' });
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const refreshFromSocket = (evt, label) => {
      setFeedback({
        type: 'info',
        message: `Live Event (${label}): Order #${evt.orderNumber} — ${evt.status} (${evt.paymentStatus})`,
      });
      loadOrders();
    };

    return subscribeToOrderEvents({
      enabled: true,
      onOrderCreated: (evt) => refreshFromSocket(evt, 'New Order'),
      onOrderUpdated: (evt) => refreshFromSocket(evt, 'Status Update'),
    });
  }, [loadOrders]);

  const selectOrder = (order) => {
    setSelectedOrder(order);
    setNextStatus(order.status);
    setNextPaymentStatus(order.paymentStatus);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    const res = await adminService.updateOrderStatus(selectedOrder._id, {
      status: nextStatus,
      paymentStatus: nextPaymentStatus,
      note: statusNote,
    });
    setUpdating(false);
    if (res.ok && res.data?.order) {
      setFeedback({ type: 'info', message: res.data.message });
      setSelectedOrder(res.data.order);
      loadOrders();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Failed to update order.' });
    }
  };

  return (
    <AdminLayout
      title="Order Management"
      subtitle="Search orders, verify COD collection / Razorpay receipts, advance statuses, or handle cancellations."
    >
      <AdminFeedbackBanner type={feedback.type} message={feedback.message} />

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order #, recipient, phone, pincode..."
          className="flex-1 min-w-[220px] max-w-md px-3.5 py-2 rounded-md border border-slate-300 bg-white text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-md border border-slate-300 bg-white text-sm"
        >
          <option value="ALL">All Statuses</option>
          {ORDER_STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {selectedOrder && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Order #{selectedOrder.orderNumber}
              </h2>
              <p className="text-xs text-slate-500">
                {selectedOrder.deliveryAddress?.recipientName} •{' '}
                {selectedOrder.deliveryAddress?.phone} • Pincode{' '}
                {selectedOrder.deliveryAddress?.pincode}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Close Inspector
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <p className="font-semibold text-slate-800">Items Ordered</p>
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded p-3">
                {(selectedOrder.items || []).map((item, idx) => (
                  <li key={idx} className="py-1.5 flex justify-between gap-2">
                    <span>
                      {item.name} ({item.variantLabel}) × {item.quantity}
                    </span>
                    <strong className="tabular-nums">{formatINR(item.lineTotal)}</strong>
                  </li>
                ))}
              </ul>
              <p className="text-slate-600 pt-1">
                Address: {selectedOrder.deliveryAddress?.houseNumber},{' '}
                {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city} –{' '}
                {selectedOrder.deliveryAddress?.pincode}
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
              <p className="font-semibold text-slate-900">Update Order Lifecycle & Payment</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[11px] font-medium">Order Status</span>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    className="w-full px-2.5 py-2 rounded border border-slate-300 bg-white text-xs"
                  >
                    {ORDER_STATUS_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-medium">Payment Status</span>
                  <select
                    value={nextPaymentStatus}
                    onChange={(e) => setNextPaymentStatus(e.target.value)}
                    className="w-full px-2.5 py-2 rounded border border-slate-300 bg-white text-xs"
                  >
                    {['PENDING', 'PAID', 'FAILED', 'REFUNDED'].map((ps) => (
                      <option key={ps} value={ps}>
                        {ps}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium">Status Note / Courier Remark</span>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Optional customer-visible update note"
                  className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs"
                />
              </label>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 rounded bg-[#173D2B] text-[#F8F4E9] text-xs font-semibold uppercase"
              >
                {updating ? 'Updating...' : 'Apply Status Update'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <AdminLoadingState />
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          No matching orders found.
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-3.5 font-semibold">Order #</th>
                <th className="p-3.5 font-semibold">Customer / Pincode</th>
                <th className="p-3.5 font-semibold">Method</th>
                <th className="p-3.5 font-semibold">Payment</th>
                <th className="p-3.5 font-semibold">Order Status</th>
                <th className="p-3.5 font-semibold text-right">Total</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="p-3.5 font-semibold text-slate-900">
                    #{order.orderNumber}
                    <div className="text-[11px] font-normal text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : ''}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <p className="font-medium text-slate-800">
                      {order.deliveryAddress?.recipientName || order.user?.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {order.deliveryAddress?.phone} • {order.deliveryAddress?.pincode}
                    </p>
                  </td>
                  <td className="p-3.5 font-medium">{order.paymentMethod}</td>
                  <td className="p-3.5">
                    <AdminStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="p-3.5">
                    <AdminStatusBadge status={order.status} />
                  </td>
                  <td className="p-3.5 text-right font-semibold tabular-nums">
                    {formatINR(order.pricing?.totalAmount ?? 0)}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => selectOrder(order)}
                      className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
