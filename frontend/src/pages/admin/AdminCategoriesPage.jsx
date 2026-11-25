import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminFeedbackBanner,
  AdminLoadingState,
  AdminStatusBadge,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';

const BLANK_CAT = {
  name: '',
  slug: '',
  eyebrow: '',
  description: '',
  image: '/images/cat-desi-ghee.jpg',
  displayOrder: 0,
  isActive: true,
  isSampleData: false,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK_CAT);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getCategories();
    setLoading(false);
    if (res.ok) {
      setCategories(res.data.categories || []);
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to load categories.' });
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      slug: form.slug || undefined,
      displayOrder: Number(form.displayOrder) || 0,
    };

    const res = editingId
      ? await adminService.updateCategory(editingId, payload)
      : await adminService.createCategory(payload);

    if (res.ok) {
      setShowForm(false);
      setEditingId(null);
      setForm(BLANK_CAT);
      setFeedback({ type: 'info', message: 'Category saved cleanly.' });
      loadCategories();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to save category.' });
    }
  };

  const handleDelete = async (cat) => {
    const res = await adminService.deleteCategory(cat._id);
    if (res.ok) {
      setFeedback({ type: 'info', message: res.data.message });
      loadCategories();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to delete category.' });
    }
  };

  return (
    <AdminLayout
      title="Product Categories"
      subtitle="Organize Desi Ghee, Mithai, Samosa, Namkeen, and Festival categories."
      actions={
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(BLANK_CAT);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#173D2B] text-[#F8F4E9] text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
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
              {editingId ? 'Edit Category' : 'Add Category'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-500 hover:text-slate-900"
            >
              Close
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="font-semibold">Name *</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Eyebrow</span>
              <input
                type="text"
                value={form.eyebrow}
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold">Display Order</span>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
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
            <label className="space-y-1">
              <span className="font-semibold">Image Path / URL</span>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
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
            <span>Active in storefront</span>
          </label>

          <div>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#173D2B] text-[#F8F4E9] text-xs font-semibold uppercase"
            >
              Save Category
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
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Slug</th>
                <th className="p-3.5 font-semibold">Products</th>
                <th className="p-3.5 font-semibold">Order</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td className="p-3.5 font-semibold text-slate-900">{cat.name}</td>
                  <td className="p-3.5 text-slate-500 font-mono">/{cat.slug}</td>
                  <td className="p-3.5 tabular-nums">{cat.productCount ?? 0}</td>
                  <td className="p-3.5 tabular-nums">{cat.displayOrder}</td>
                  <td className="p-3.5">
                    <AdminStatusBadge status={cat.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(cat._id);
                        setForm({ ...cat });
                        setShowForm(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 text-rose-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
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
