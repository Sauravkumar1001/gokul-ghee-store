import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminBarSeries,
  AdminFeedbackBanner,
  AdminKpiCard,
  AdminLoadingState,
  AdminStatusBadge,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';
import { formatINR } from '../../utils/formatters';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await adminService.getDashboard();
    setLoading(false);
    if (res.ok) {
      setData(res.data);
    } else {
      setErrorMsg(res.error?.message || 'Unable to load dashboard metrics.');
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metrics = data?.metrics || {
    totalRevenue: 0,
    verifiedPaidRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    lowStockCount: 0,
  };

  return (
    <AdminLayout
      title="Operations Dashboard"
      subtitle="Live MongoDB metrics across orders, verified payments, stock health, and top-selling items."
      actions={
        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      }
    >
      <AdminFeedbackBanner type="error" message={errorMsg} />

      {loading && !data ? (
        <AdminLoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminKpiCard
              label="Gross Order Revenue"
              value={formatINR(metrics.totalRevenue)}
              subtitle={`Verified Paid: ${formatINR(metrics.verifiedPaidRevenue)}`}
              accent="success"
            />
            <AdminKpiCard
              label="Total Orders"
              value={metrics.totalOrders}
              subtitle={`Pending: ${metrics.pendingOrders} • Completed: ${metrics.completedOrders}`}
            />
            <AdminKpiCard
              label="Total Customers"
              value={metrics.totalCustomers}
              subtitle={`Avg Order Value: ${formatINR(metrics.averageOrderValue)}`}
            />
            <AdminKpiCard
              label="Low Stock Alerts"
              value={metrics.lowStockCount}
              subtitle="Variants at or below threshold"
              accent={metrics.lowStockCount > 0 ? 'alert' : 'default'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <AdminBarSeries
                title="Sales Revenue Trend (Last 14 Days)"
                items={data?.salesTrends || []}
                labelKey="date"
                valueKey="revenue"
                formatValue={(val, item) => `${formatINR(val)} (${item.orders} orders)`}
              />
            </div>

            <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Bestselling Products</h2>
                <Link to="/admin/analytics" className="text-xs font-medium text-[#173D2B] underline">
                  Full Analytics
                </Link>
              </div>
              {(!data?.bestsellingProducts || data.bestsellingProducts.length === 0) ? (
                <p className="text-xs text-slate-500">No non-cancelled orders recorded yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-xs">
                  {data.bestsellingProducts.map((item) => (
                    <li key={item._id || item.name} className="py-2.5 flex justify-between gap-3">
                      <span className="font-medium text-slate-800 truncate">{item.name}</span>
                      <span className="tabular-nums text-slate-600 shrink-0">
                        {item.unitsSold} sold • <strong>{formatINR(item.revenue)}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
                <Link to="/admin/orders" className="text-xs font-medium text-[#173D2B] underline">
                  Manage All Orders
                </Link>
              </div>
              {(!data?.recentOrders || data.recentOrders.length === 0) ? (
                <p className="text-xs text-slate-500">No customer orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="pb-2 font-medium">Order</th>
                        <th className="pb-2 font-medium">Customer</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Payment</th>
                        <th className="pb-2 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="py-2.5 font-semibold text-slate-900">#{order.orderNumber}</td>
                          <td className="py-2.5 text-slate-600">
                            {order.deliveryAddress?.recipientName || order.user?.name || 'Customer'}
                          </td>
                          <td className="py-2.5">
                            <AdminStatusBadge status={order.status} />
                          </td>
                          <td className="py-2.5">
                            <AdminStatusBadge status={order.paymentStatus} />
                          </td>
                          <td className="py-2.5 text-right font-semibold tabular-nums">
                            {formatINR(order.pricing?.totalAmount ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Low Stock Variants</h2>
                <Link to="/admin/inventory" className="text-xs font-medium text-[#173D2B] underline">
                  Adjust Stock
                </Link>
              </div>
              {(!data?.lowStockAlerts || data.lowStockAlerts.length === 0) ? (
                <p className="text-xs text-emerald-700">All variant stock levels are healthy.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-xs">
                  {data.lowStockAlerts.slice(0, 8).map((alert) => (
                    <li key={alert.variantId} className="py-2.5 flex justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800">{alert.productName}</p>
                        <p className="text-[11px] text-slate-500">
                          {alert.variantLabel} • {alert.sku}
                        </p>
                      </div>
                      <span className="font-bold text-amber-700 tabular-nums shrink-0">
                        {alert.stock} left
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
