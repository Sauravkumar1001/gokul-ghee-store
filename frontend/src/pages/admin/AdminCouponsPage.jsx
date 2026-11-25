import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminFeedbackBanner,
  AdminLoadingState,
  AdminStatusBadge,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';
import { formatINR } from '../../utils/formatters';

const BLANK_COUPON = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  maxDiscountAmount: 150,
  minOrderAmount: 499,
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  usageLimit: 100,
  isActive: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK_COUPON);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getCoupons();
    setLoading(false);
    if (res.ok) {
      setCoupons(res.data.coupons || []);
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to load coupons.' });
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      maxDiscountAmount:
        form.maxDiscountAmount === '' || form.maxDiscountAmount === null
          ? null
          : Number(form.maxDiscountAmount),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      usageLimit:
        form.usageLimit === '' || form.usageLimit === null
          ? null
          : Number(form.usageLimit),
    };

    const res = editingId
      ? await adminService.updateCoupon(editingId, payload)
      : await adminService.createCoupon(payload);

    if (res.ok) {
      setShowForm(false);
      setEditingId(null);
      setForm(BLANK_COUPON);
      setFeedback({ type: 'info', message: 'Coupon saved cleanly.' });
      loadCoupons();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to save coupon.' });
    }
  };

  const handleDelete = async (id) => {
    const res = await adminService.deleteCoupon(id);
    if (res.ok) {
      setFeedback({ type: 'info', message: 'Coupon removed.' });
      loadCoupons();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to delete coupon.' });
    }
  };

  return (
    <AdminLayout
      title="Coupons & Promotions"
      subtitle="Create percentage or flat discount codes with minimum order values, expiry dates, and usage caps."
      actions={
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(BLANK_COUPON);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#173D2B] text-[#F8F4E9] text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      }
    >
      <AdminFeedbackBanner type={feedback.type} message={feedback.message} />

      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-lg border border-slate-200 bg-white p-6 space-y-4 text-xs"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">
              {editingId ? 'Edit Coupon' : 'Create Coupon'}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500">
              Close
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="font-semibold">Code *</span>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm uppercase font-mono"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Discount Type *</span>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed INR (₹)</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Discount Value *</span>
              <input
                type="number"
                required
                min={1}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Max Discount Cap (₹)</span>
              <input
                type="number"
                min={0}
                value={form.maxDiscountAmount ?? ''}
                onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Min Order Subtotal (₹)</span>
              <input
                type="number"
                min={0}
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Expiry Date *</span>
              <input
                type="date"
                required
                value={String(form.expiresAt).slice(0, 10)}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Usage Limit</span>
              <input
                type="number"
                min={1}
                value={form.usageLimit ?? ''}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="font-semibold">Description</span>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-[#173D2B]"
            />
            <span>Active</span>
          </label>
          <div>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#173D2B] text-[#F8F4E9] text-xs font-semibold uppercase"
            >
              Save Coupon
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <AdminLoadingState />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-3.5 font-semibold">Code</th>
                <th className="p-3.5 font-semibold">Discount</th>
                <th className="p-3.5 font-semibold">Min Order</th>
                <th className="p-3.5 font-semibold">Usage</th>
                <th className="p-3.5 font-semibold">Expires</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td className="p-3.5 font-bold font-mono">{c.code}</td>
                  <td className="p-3.5 tabular-nums">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}%${c.maxDiscountAmount ? ` (max ${formatINR(c.maxDiscountAmount)})` : ''}`
                      : formatINR(c.discountValue)}
                  </td>
                  <td className="p-3.5 tabular-nums">{formatINR(c.minOrderAmount)}</td>
                  <td className="p-3.5 tabular-nums">
                    {c.usedCount} / {c.usageLimit ?? '∞'}
                  </td>
                  <td className="p-3.5 tabular-nums">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : ''}
                  </td>
                  <td className="p-3.5">
                    <AdminStatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(c._id);
                        setForm({
                          ...c,
                          maxDiscountAmount: c.maxDiscountAmount ?? '',
                          usageLimit: c.usageLimit ?? '',
                        });
                        setShowForm(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c._id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 text-rose-700"
                    >
                      <Trash2 className="w-3 h-3" />
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
