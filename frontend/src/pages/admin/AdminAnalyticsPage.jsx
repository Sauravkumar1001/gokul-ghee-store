import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminBarSeries,
  AdminFeedbackBanner,
  AdminKpiCard,
  AdminLoadingState,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';
import { formatINR } from '../../utils/formatters';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [granularity, setGranularity] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await adminService.getAnalytics();
    setLoading(false);
    if (res.ok) {
      setData(res.data);
    } else {
      setErrorMsg(res.error?.message || 'Unable to load store analytics.');
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const series =
    granularity === 'monthly'
      ? data?.monthlyRevenue || []
      : granularity === 'weekly'
      ? data?.weeklyRevenue || []
      : data?.dailyRevenue || [];

  const funnel = data?.funnel || {
    totalVisitors: 0,
    pageViews: 0,
    productViews: 0,
    cartAdditions: 0,
    checkoutStarts: 0,
    completedPurchases: 0,
    conversionRate: 0,
  };

  return (
    <AdminLayout
      title="Sales & Funnel Analytics"
      subtitle="100% database-backed revenue trends, product/category rankings, customer growth, and real event conversion funnel."
      actions={
        <button
          type="button"
          onClick={loadAnalytics}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium"
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
        <div className="space-y-6">
          {/* Funnel KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <AdminKpiCard label="Tracked Visitors" value={funnel.totalVisitors} />
            <AdminKpiCard label="Product Views" value={funnel.productViews} />
            <AdminKpiCard label="Cart Additions" value={funnel.cartAdditions} />
            <AdminKpiCard label="Checkout Starts" value={funnel.checkoutStarts} />
            <AdminKpiCard
              label="Conversion Rate"
              value={`${funnel.conversionRate}%`}
              subtitle={`${funnel.completedPurchases} completed orders`}
              accent="success"
            />
          </div>

          {/* Granularity Toggle + Revenue Trend */}
          <div className="space-y-3">
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGranularity(mode)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase ${
                    granularity === mode
                      ? 'bg-[#173D2B] text-[#F8F4E9]'
                      : 'bg-white border border-slate-300 text-slate-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <AdminBarSeries
              title={`${granularity.toUpperCase()} Revenue Performance`}
              items={series}
              labelKey="period"
              valueKey="revenue"
              formatValue={(val, item) => `${formatINR(val)} (${item.orders} orders)`}
            />
          </div>

          {/* Category & Product Performance */}
          <div className="grid lg:grid-cols-2 gap-6">
            <AdminBarSeries
              title="Category Revenue Performance"
              items={data?.categoryPerformance || []}
              labelKey="category"
              valueKey="revenue"
              formatValue={(val, item) => `${formatINR(val)} (${item.unitsSold} units)`}
            />

            <AdminBarSeries
              title="Customer Registration Growth (Last 6 Months)"
              items={data?.customerGrowth || []}
              labelKey="month"
              valueKey="newCustomers"
              formatValue={(val) => `${val} new customer(s)`}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Top Product Performance</h2>
            {(!data?.productPerformance || data.productPerformance.length === 0) ? (
              <p className="text-xs text-slate-500">No active sales recorded yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="pb-2">Product</th>
                    <th className="pb-2 text-right">Units Sold</th>
                    <th className="pb-2 text-right">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.productPerformance.map((p) => (
                    <tr key={p._id || p.productName}>
                      <td className="py-2.5 font-medium text-slate-900">{p.productName}</td>
                      <td className="py-2.5 text-right tabular-nums">{p.unitsSold}</td>
                      <td className="py-2.5 text-right font-semibold tabular-nums">
                        {formatINR(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
