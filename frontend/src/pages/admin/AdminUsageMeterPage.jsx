import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminFeedbackBanner,
  AdminKpiCard,
  AdminLoadingState,
  AdminStatusBadge,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';

export default function AdminUsageMeterPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadMeter = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await adminService.getUsageMeter();
    setLoading(false);
    if (res.ok) {
      setData(res.data);
    } else {
      setErrorMsg(res.error?.message || 'Unable to load usage telemetry.');
    }
  }, []);

  useEffect(() => {
    loadMeter();
  }, [loadMeter]);

  const ai = data?.ai || {
    totalRequests: 0,
    failedRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCostUsd: 0,
    avgLatencyMs: 0,
    dailyUsage: [],
    monthlyUsage: [],
    recentErrors: [],
  };
  const website = data?.website || {
    totalVisitors: 0,
    pageViews: 0,
    productViews: 0,
    cartAdditions: 0,
    checkoutStarts: 0,
    completedPurchases: 0,
    conversionRate: 0,
  };
  const sys = data?.system || {
    avgApiResponseMs: 0,
    maxResponseMs: 0,
    totalTrackedRequests: 0,
    backendErrors: 0,
    uptimeSeconds: 0,
    memoryRssMb: 0,
    database: { connected: false, state: 'unknown', name: null },
    imageStorage: { configured: false, available: false, note: '' },
  };

  return (
    <AdminLayout
      title="AI Usage, Website Funnel & System Meter"
      subtitle="Zero fabricated metrics — every counter originates strictly from AIUsage, AnalyticsEvent, Mongoose & process telemetry."
      actions={
        <button
          type="button"
          onClick={loadMeter}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      }
    >
      <AdminFeedbackBanner type="error" message={errorMsg} />

      {loading && !data ? (
        <AdminLoadingState />
      ) : (
        <div className="space-y-8">
          {/* 1. AI Usage Telemetry */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              1. GOKUL AI (Gemini API) Consumption
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminKpiCard
                label="Total AI Requests"
                value={ai.totalRequests}
                subtitle={`Failed: ${ai.failedRequests} • Avg Latency: ${ai.avgLatencyMs} ms`}
                accent={ai.failedRequests > 0 ? 'alert' : 'default'}
              />
              <AdminKpiCard
                label="Input Tokens"
                value={ai.inputTokens.toLocaleString('en-IN')}
                subtitle="Logged from Gemini usageMetadata"
              />
              <AdminKpiCard
                label="Output Tokens"
                value={ai.outputTokens.toLocaleString('en-IN')}
                subtitle="Generated assistant tokens"
              />
              <AdminKpiCard
                label="Estimated API Spend"
                value={`$${ai.estimatedCostUsd.toFixed(5)}`}
                subtitle="Calculated per token consumption"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2 text-xs">
                <h3 className="font-bold text-slate-900">Daily & Monthly AI Usage</h3>
                {ai.dailyUsage.length === 0 ? (
                  <p className="text-slate-500">No Gemini API calls logged yet (Gemini connects live in Phase 6).</p>
                ) : (
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="pb-1.5">Date</th>
                        <th className="pb-1.5 text-right">Requests</th>
                        <th className="pb-1.5 text-right">Tokens (In/Out)</th>
                        <th className="pb-1.5 text-right">Est. USD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ai.dailyUsage.map((row) => (
                        <tr key={row.date}>
                          <td className="py-1.5 font-mono">{row.date}</td>
                          <td className="py-1.5 text-right tabular-nums">{row.requests}</td>
                          <td className="py-1.5 text-right tabular-nums">
                            {row.inputTokens} / {row.outputTokens}
                          </td>
                          <td className="py-1.5 text-right tabular-nums">
                            ${(row.estimatedCostUsd || 0).toFixed(5)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2 text-xs">
                <h3 className="font-bold text-slate-900">Recent AI API Errors</h3>
                {ai.recentErrors.length === 0 ? (
                  <p className="text-slate-500">Zero Gemini API errors recorded.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {ai.recentErrors.map((err, idx) => (
                      <li key={idx} className="py-2 text-rose-800">
                        <p className="font-semibold">{err.errorMessage || 'API Error'}</p>
                        <p className="text-[11px] text-slate-500">
                          {err.model} •{' '}
                          {err.createdAt ? new Date(err.createdAt).toLocaleString('en-IN') : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* 2. Website Analytics */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              2. Website Analytics Events
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminKpiCard label="Unique Visitors" value={website.totalVisitors} />
              <AdminKpiCard
                label="Page / Product Views"
                value={`${website.pageViews} / ${website.productViews}`}
              />
              <AdminKpiCard
                label="Cart / Checkout Starts"
                value={`${website.cartAdditions} / ${website.checkoutStarts}`}
              />
              <AdminKpiCard
                label="Completed Purchases"
                value={website.completedPurchases}
                subtitle={`Conversion Rate: ${website.conversionRate}%`}
                accent="success"
              />
            </div>
          </section>

          {/* 3. System Health & Infrastructure */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              3. System Health, Database & Image Storage
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminKpiCard
                label="API Response Time"
                value={`${sys.avgApiResponseMs} ms`}
                subtitle={`Max observed: ${sys.maxResponseMs} ms • ${sys.totalTrackedRequests} reqs`}
              />
              <AdminKpiCard
                label="Backend 5xx Errors"
                value={sys.backendErrors}
                accent={sys.backendErrors > 0 ? 'alert' : 'default'}
              />
              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Database Connectivity
                </p>
                <div className="flex items-center gap-2">
                  <AdminStatusBadge
                    status={sys.database.connected ? 'ACTIVE' : 'INACTIVE'}
                  />
                  <span className="text-sm font-bold text-slate-900 uppercase">
                    {sys.database.state}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  DB: {sys.database.name || 'No live URI connected yet'} • Uptime:{' '}
                  {sys.uptimeSeconds}s ({sys.memoryRssMb} MB RSS)
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Cloudinary Media Storage
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {sys.imageStorage.available
                    ? `${Math.round((sys.imageStorage.usedBytes || 0) / 1024)} KB`
                    : sys.imageStorage.configured
                    ? 'Error querying'
                    : 'Not Configured'}
                </p>
                <p className="text-xs text-slate-500">{sys.imageStorage.note}</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
