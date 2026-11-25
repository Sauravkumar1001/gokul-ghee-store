import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminFeedbackBanner,
  AdminLoadingState,
  AdminStatusBadge,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';

export default function AdminInventoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const [deltas, setDeltas] = useState({});
  const [notes, setNotes] = useState({});

  const loadInventory = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getInventory();
    setLoading(false);
    if (res.ok) {
      setData(res.data);
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to load inventory.' });
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleAdjust = async (row, customDelta = null) => {
    const delta =
      customDelta !== null ? customDelta : Number(deltas[row.variantId] || 0);
    if (!delta) {
      setFeedback({ type: 'error', message: 'Enter a non-zero stock adjustment value.' });
      return;
    }

    const res = await adminService.adjustInventory({
      productId: row.productId,
      variantId: row.variantId,
      delta,
      note: notes[row.variantId] || 'Manual inventory update in Admin',
    });

    if (res.ok) {
      setFeedback({ type: 'info', message: res.data.message });
      setDeltas((prev) => ({ ...prev, [row.variantId]: '' }));
      loadInventory();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Adjustment rejected.' });
    }
  };

  return (
    <AdminLayout
      title="Inventory & Stock Ledger"
      subtitle="Monitor variant stock levels, prevent overselling, and audit stock movements."
    >
      <AdminFeedbackBanner type={feedback.type} message={feedback.message} />

      {loading && !data ? (
        <AdminLoadingState />
      ) : (
        <div className="space-y-6">
          {/* Current SKU Table */}
          <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-3.5 font-semibold">SKU & Product</th>
                  <th className="p-3.5 font-semibold">Pack Variant</th>
                  <th className="p-3.5 font-semibold">Stock Level</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Adjust Stock (+/-)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.inventoryRows || []).map((row) => (
                  <tr key={row.variantId}>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-900">{row.productName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{row.sku}</p>
                    </td>
                    <td className="p-3.5">{row.variantLabel}</td>
                    <td className="p-3.5 font-bold tabular-nums text-sm">{row.stock}</td>
                    <td className="p-3.5">
                      <AdminStatusBadge
                        status={row.isOutOfStock ? 'FAILED' : row.isLowStock ? 'PENDING' : 'ACTIVE'}
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={deltas[row.variantId] ?? ''}
                          onChange={(e) =>
                            setDeltas({ ...deltas, [row.variantId]: e.target.value })
                          }
                          placeholder="+10 or -2"
                          className="w-24 px-2 py-1 rounded border border-slate-300 text-xs tabular-nums"
                        />
                        <input
                          type="text"
                          value={notes[row.variantId] ?? ''}
                          onChange={(e) =>
                            setNotes({ ...notes, [row.variantId]: e.target.value })
                          }
                          placeholder="Reason note"
                          className="w-36 px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleAdjust(row)}
                          className="px-3 py-1 rounded bg-[#173D2B] text-[#F8F4E9] text-[11px] font-semibold"
                        >
                          Apply
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Audit Movement History */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Stock Movement History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Product / Pack</th>
                    <th className="pb-2">Movement Type</th>
                    <th className="pb-2 text-right">Delta</th>
                    <th className="pb-2 text-right">Stock After</th>
                    <th className="pb-2">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.movements || []).map((mov) => (
                    <tr key={mov._id}>
                      <td className="py-2 text-slate-500 tabular-nums">
                        {mov.createdAt ? new Date(mov.createdAt).toLocaleString('en-IN') : ''}
                      </td>
                      <td className="py-2 font-medium text-slate-800">
                        {mov.product?.name || 'Product'} ({mov.variantLabel})
                      </td>
                      <td className="py-2 font-mono text-[11px]">{mov.changeType}</td>
                      <td
                        className={`py-2 text-right font-semibold tabular-nums ${
                          mov.delta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {mov.delta > 0 ? `+${mov.delta}` : mov.delta}
                      </td>
                      <td className="py-2 text-right tabular-nums">{mov.stockAfter}</td>
                      <td className="py-2 text-slate-600">{mov.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
