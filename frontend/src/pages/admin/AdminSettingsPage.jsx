import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminFeedbackBanner,
  AdminLoadingState,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';

export default function AdminSettingsPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getSettings();
    setLoading(false);
    if (res.ok && res.data?.settings) {
      setForm(res.data.settings);
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to load store settings.' });
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setFeedback({ type: 'info', message: '' });
    const res = await adminService.updateSettings({
      businessName: form.businessName,
      brandDisplayName: form.brandDisplayName,
      tagline: form.tagline,
      phone: form.phone,
      hours: form.hours,
      address: form.address,
      googleBusinessUrl: form.googleBusinessUrl,
      googleMapsPlaceId: form.googleMapsPlaceId,
      announcementItems: Array.isArray(form.announcementItems) ? form.announcementItems : [],
    });
    setSaving(false);
    if (res.ok) {
      setFeedback({ type: 'info', message: res.data.message });
      setForm(res.data.settings);
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Failed to save settings.' });
    }
  };

  return (
    <AdminLayout
      title="Store Settings & Location Identity"
      subtitle="Update verified store contact phone, daily opening hours, Anand Bazar address details, and announcement bar copy."
    >
      <AdminFeedbackBanner type={feedback.type} message={feedback.message} />

      {loading || !form ? (
        <AdminLoadingState />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-6 space-y-5 text-xs"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="font-semibold">Business Legal Name *</span>
              <input
                type="text"
                required
                value={form.businessName || ''}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Brand Display Name *</span>
              <input
                type="text"
                required
                value={form.brandDisplayName || ''}
                onChange={(e) => setForm({ ...form, brandDisplayName: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Brand Tagline</span>
              <input
                type="text"
                value={form.tagline || ''}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Public Phone *</span>
              <input
                type="text"
                required
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm tabular-nums"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="font-semibold">Opening Hours *</span>
              <input
                type="text"
                required
                value={form.hours || ''}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <label className="space-y-1">
              <span className="font-semibold">Address Line 1 *</span>
              <input
                type="text"
                required
                value={form.address?.line1 || ''}
                onChange={(e) =>
                  setForm({ ...form, address: { ...form.address, line1: e.target.value } })
                }
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Address Line 2</span>
              <input
                type="text"
                value={form.address?.line2 || ''}
                onChange={(e) =>
                  setForm({ ...form, address: { ...form.address, line2: e.target.value } })
                }
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="font-semibold">Full Formatted Store Address *</span>
              <input
                type="text"
                required
                value={form.address?.fullFormatted || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: { ...form.address, fullFormatted: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Google Business Listing URL</span>
              <input
                type="text"
                value={form.googleBusinessUrl || ''}
                onChange={(e) => setForm({ ...form, googleBusinessUrl: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Google Maps Place ID</span>
              <input
                type="text"
                value={form.googleMapsPlaceId || ''}
                onChange={(e) => setForm({ ...form, googleMapsPlaceId: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm font-mono"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded bg-[#173D2B] text-[#F8F4E9] text-xs font-semibold uppercase tracking-wider"
          >
            {saving ? 'Saving...' : 'Save Store Settings'}
          </button>
        </form>
      )}
    </AdminLayout>
  );
}
