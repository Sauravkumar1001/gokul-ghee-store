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

const BLANK_ZONE = {
  pincode: '',
  areaName: '',
  city: 'Patna',
  deliveryCharge: 40,
  freeDeliveryAbove: 699,
  minimumOrderValue: 199,
  estimatedDeliveryTime: 'Same-day local dispatch',
  notes: '',
  isActive: true,
};

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK_ZONE);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });

  const loadZones = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getDeliveryZones();
    setLoading(false);
    if (res.ok) {
      setZones(res.data.zones || []);
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to load delivery zones.' });
    }
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      deliveryCharge: Number(form.deliveryCharge) || 0,
      freeDeliveryAbove:
        form.freeDeliveryAbove === '' || form.freeDeliveryAbove === null
          ? null
          : Number(form.freeDeliveryAbove),
      minimumOrderValue: Number(form.minimumOrderValue) || 0,
    };

    const res = editingId
      ? await adminService.updateDeliveryZone(editingId, payload)
      : await adminService.createDeliveryZone(payload);

    if (res.ok) {
      setShowForm(false);
      setEditingId(null);
      setForm(BLANK_ZONE);
      setFeedback({ type: 'info', message: 'Delivery zone configuration saved.' });
      loadZones();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to save delivery zone.' });
    }
  };

  const handleDelete = async (id) => {
    const res = await adminService.deleteDeliveryZone(id);
    if (res.ok) {
      setFeedback({ type: 'info', message: 'Delivery zone deleted.' });
      loadZones();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to delete zone.' });
    }
  };

  return (
    <AdminLayout
      title="Serviceable Pincodes & Delivery Zones"
      subtitle="Control exact local Bihar delivery coverage, charges, free-shipping thresholds, and ETAs."
      actions={
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(BLANK_ZONE);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#173D2B] text-[#F8F4E9] text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pincode Zone</span>
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
              {editingId ? 'Edit Delivery Zone' : 'Add Serviceable Pincode'}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500">
              Close
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="font-semibold">6-Digit Pincode *</span>
              <input
                type="text"
                required
                maxLength={6}
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm tabular-nums"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Area / Zone Name *</span>
              <input
                type="text"
                required
                value={form.areaName}
                onChange={(e) => setForm({ ...form, areaName: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">City</span>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Delivery Charge (₹)</span>
              <input
                type="number"
                min={0}
                required
                value={form.deliveryCharge}
                onChange={(e) => setForm({ ...form, deliveryCharge: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Free Delivery Above (₹)</span>
              <input
                type="number"
                min={0}
                value={form.freeDeliveryAbove ?? ''}
                onChange={(e) => setForm({ ...form, freeDeliveryAbove: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Min Order Value (₹)</span>
              <input
                type="number"
                min={0}
                value={form.minimumOrderValue}
                onChange={(e) => setForm({ ...form, minimumOrderValue: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="font-semibold">Estimated Delivery Time *</span>
              <input
                type="text"
                required
                value={form.estimatedDeliveryTime}
                onChange={(e) => setForm({ ...form, estimatedDeliveryTime: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="inline-flex items-center gap-2 self-end pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="accent-[#173D2B]"
              />
              <span>Zone Enabled</span>
            </label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#173D2B] text-[#F8F4E9] text-xs font-semibold uppercase"
          >
            Save Zone
          </button>
        </form>
      )}

      {loading ? (
        <AdminLoadingState />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-3.5 font-semibold">Pincode</th>
                <th className="p-3.5 font-semibold">Zone / City</th>
                <th className="p-3.5 font-semibold">Fee / Free Above</th>
                <th className="p-3.5 font-semibold">Min Order</th>
                <th className="p-3.5 font-semibold">ETA</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {zones.map((z) => (
                <tr key={z._id}>
                  <td className="p-3.5 font-bold font-mono">{z.pincode}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-900">{z.areaName}</p>
                    <p className="text-[11px] text-slate-500">{z.city}</p>
                  </td>
                  <td className="p-3.5 tabular-nums">
                    {formatINR(z.deliveryCharge)}
                    {z.freeDeliveryAbove ? ` (Free > ${formatINR(z.freeDeliveryAbove)})` : ''}
                  </td>
                  <td className="p-3.5 tabular-nums">{formatINR(z.minimumOrderValue)}</td>
                  <td className="p-3.5 text-slate-600">{z.estimatedDeliveryTime}</td>
                  <td className="p-3.5">
                    <AdminStatusBadge status={z.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(z._id);
                        setForm({ ...z, freeDeliveryAbove: z.freeDeliveryAbove ?? '' });
                        setShowForm(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(z._id)}
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
