import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminFeedbackBanner,
  AdminLoadingState,
  AdminStatusBadge,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';
import { formatINR } from '../../utils/formatters';

function createBlankProduct(firstCategoryId = '') {
  return {
    name: '',
    slug: '',
    categoryId: firstCategoryId,
    shortDescription: '',
    description: '',
    images: ['/images/cat-desi-ghee.jpg'],
    variants: [
      {
        sku: '',
        label: '500g Jar',
        weightGrams: 500,
        price: 0,
        mrp: 0,
        stock: 0,
        lowStockThreshold: 5,
        isActive: true,
      },
    ],
    tagsText: '',
    highlightsText: '',
    storageNote: '',
    isBestseller: false,
    isFeaturedGhee: false,
    isSpecialOffer: false,
    offerBadge: '',
    isActive: true,
    isSampleData: false,
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });

  const [editingId, setEditingId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState(() => createBlankProduct());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      adminService.getProducts(search.trim() ? { q: search.trim() } : {}),
      adminService.getCategories(),
    ]);
    setLoading(false);

    if (prodRes.ok) setProducts(prodRes.data.products || []);
    if (catRes.ok) setCategories(catRes.data.categories || []);
    if (!prodRes.ok) {
      setFeedback({ type: 'error', message: prodRes.error?.message || 'Unable to fetch products.' });
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(createBlankProduct(categories[0]?._id || ''));
    setShowEditor(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      slug: product.slug,
      categoryId: String(product.category || categories[0]?._id || ''),
      shortDescription: product.shortDescription,
      description: product.description,
      images: product.images?.length ? product.images : [''],
      variants: product.variants?.length
        ? product.variants.map((v) => ({ ...v }))
        : createBlankProduct().variants,
      tagsText: (product.tags || []).join(', '),
      highlightsText: (product.highlights || []).join('\n'),
      storageNote: product.storageNote || '',
      isBestseller: Boolean(product.isBestseller),
      isFeaturedGhee: Boolean(product.isFeaturedGhee),
      isSpecialOffer: Boolean(product.isSpecialOffer),
      offerBadge: product.offerBadge || '',
      isActive: product.isActive !== false,
      isSampleData: Boolean(product.isSampleData),
    });
    setShowEditor(true);
  };

  const handleUploadFiles = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const res = await adminService.uploadImages(files);
    setUploading(false);
    if (res.ok && Array.isArray(res.data?.images)) {
      const urls = res.data.images.map((img) => img.url);
      setForm((prev) => ({
        ...prev,
        images: [...prev.images.filter(Boolean), ...urls],
      }));
      setFeedback({ type: 'info', message: `${urls.length} image(s) uploaded cleanly.` });
    } else {
      setFeedback({
        type: 'error',
        message: res.error?.message || 'Cloudinary upload unavailable.',
      });
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: 'info', message: '' });

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      categoryId: form.categoryId,
      shortDescription: form.shortDescription,
      description: form.description,
      images: form.images.map((u) => u.trim()).filter(Boolean),
      variants: form.variants.map((v) => ({
        ...v,
        weightGrams: Number(v.weightGrams),
        price: Number(v.price),
        mrp: Number(v.mrp),
        stock: Number(v.stock),
        lowStockThreshold: Number(v.lowStockThreshold || 5),
      })),
      tags: form.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      highlights: form.highlightsText
        .split('\n')
        .map((h) => h.trim())
        .filter(Boolean),
      storageNote: form.storageNote,
      isBestseller: form.isBestseller,
      isFeaturedGhee: form.isFeaturedGhee,
      isSpecialOffer: form.isSpecialOffer,
      offerBadge: form.offerBadge,
      isActive: form.isActive,
      isSampleData: form.isSampleData,
    };

    const res = editingId
      ? await adminService.updateProduct(editingId, payload)
      : await adminService.createProduct(payload);

    setSaving(false);
    if (res.ok) {
      setShowEditor(false);
      setFeedback({
        type: 'info',
        message: editingId ? 'Product updated in catalog.' : 'Product created in catalog.',
      });
      loadData();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Failed to save product.' });
    }
  };

  const handleDeleteProduct = async (product) => {
    const res = await adminService.deleteProduct(product._id);
    if (res.ok) {
      setFeedback({ type: 'info', message: res.data.message });
      loadData();
    } else {
      setFeedback({ type: 'error', message: res.error?.message || 'Unable to delete product.' });
    }
  };

  return (
    <AdminLayout
      title="Products & Variants"
      subtitle="Configure store products, multiple pack weights, pricing, stock, images, and featured flags."
      actions={
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#173D2B] text-[#F8F4E9] text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      }
    >
      <AdminFeedbackBanner type={feedback.type} message={feedback.message} />

      {showEditor && (
        <form
          onSubmit={handleSaveProduct}
          className="rounded-lg border border-slate-200 bg-white p-6 space-y-5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Product' : 'Create New Product'}
            </h2>
            <button
              type="button"
              onClick={() => setShowEditor(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <label className="space-y-1">
              <span className="font-semibold text-slate-700">Product Name *</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold text-slate-700">Slug (optional auto)</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold text-slate-700">Category *</span>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <label className="space-y-1">
              <span className="font-semibold text-slate-700">Short Description *</span>
              <input
                type="text"
                required
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="font-semibold text-slate-700">Storage Note</span>
              <input
                type="text"
                value={form.storageNote}
                onChange={(e) => setForm({ ...form, storageNote: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="font-semibold text-slate-700">Full Editorial Description *</span>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm"
              />
            </label>
          </div>

          {/* Images */}
          <div className="space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-700">
                Product Images (URLs per line or Cloudinary upload)
              </span>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUploadFiles}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={2}
              value={form.images.join('\n')}
              onChange={(e) => setForm({ ...form, images: e.target.value.split('\n') })}
              placeholder="/images/cat-desi-ghee.jpg"
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs font-mono"
            />
          </div>

          {/* Variants */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Pack Variants & Stock *</span>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    variants: [
                      ...prev.variants,
                      {
                        sku: '',
                        label: '',
                        weightGrams: 250,
                        price: 0,
                        mrp: 0,
                        stock: 0,
                        lowStockThreshold: 5,
                        isActive: true,
                      },
                    ],
                  }))
                }
                className="text-xs font-semibold text-[#173D2B] underline"
              >
                + Add Variant
              </button>
            </div>

            {form.variants.map((variant, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 sm:grid-cols-7 gap-2 p-3 rounded-md bg-slate-50 border border-slate-200 items-end"
              >
                <label className="space-y-1">
                  <span className="text-[11px]">SKU</span>
                  <input
                    type="text"
                    required
                    value={variant.sku}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[idx].sku = e.target.value;
                      setForm({ ...form, variants: next });
                    }}
                    className="w-full px-2 py-1.5 rounded border border-slate-300"
                  />
                </label>
                <label className="space-y-1 col-span-2">
                  <span className="text-[11px]">Pack Label</span>
                  <input
                    type="text"
                    required
                    value={variant.label}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[idx].label = e.target.value;
                      setForm({ ...form, variants: next });
                    }}
                    className="w-full px-2 py-1.5 rounded border border-slate-300"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px]">Grams</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={variant.weightGrams}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[idx].weightGrams = e.target.value;
                      setForm({ ...form, variants: next });
                    }}
                    className="w-full px-2 py-1.5 rounded border border-slate-300"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px]">Price (₹)</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={variant.price}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[idx].price = e.target.value;
                      setForm({ ...form, variants: next });
                    }}
                    className="w-full px-2 py-1.5 rounded border border-slate-300"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px]">MRP (₹)</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={variant.mrp}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[idx].mrp = e.target.value;
                      setForm({ ...form, variants: next });
                    }}
                    className="w-full px-2 py-1.5 rounded border border-slate-300"
                  />
                </label>
                <div className="flex gap-1 items-end">
                  <label className="space-y-1 flex-1">
                    <span className="text-[11px]">Stock</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={variant.stock}
                      onChange={(e) => {
                        const next = [...form.variants];
                        next[idx].stock = e.target.value;
                        setForm({ ...form, variants: next });
                      }}
                      className="w-full px-2 py-1.5 rounded border border-slate-300"
                    />
                  </label>
                  {form.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          variants: form.variants.filter((_, i) => i !== idx),
                        })
                      }
                      aria-label="Remove variant"
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-5 text-xs pt-2">
            {[
              ['isActive', 'Active in Storefront'],
              ['isBestseller', 'Bestseller'],
              ['isFeaturedGhee', 'Featured Ghee'],
              ['isSpecialOffer', 'Special Offer'],
              ['isSampleData', 'Sample Placeholder Flag'],
            ].map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form[key])}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="accent-[#173D2B]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-md bg-[#173D2B] text-[#F8F4E9] text-xs font-semibold uppercase tracking-wider disabled:opacity-60"
          >
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Product'}
          </button>
        </form>
      )}

      {/* Product Search Bar */}
      <div className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name, slug, or SKU..."
          className="flex-1 max-w-md px-3.5 py-2 rounded-md border border-slate-300 bg-white text-sm"
        />
      </div>

      {loading ? (
        <AdminLoadingState />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-3.5 font-semibold">Product</th>
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Variants & Pricing</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((prod) => (
                <tr key={prod._id}>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-900">{prod.name}</p>
                    <p className="text-[11px] text-slate-500">/{prod.slug}</p>
                  </td>
                  <td className="p-3.5 text-slate-700">{prod.categoryName}</td>
                  <td className="p-3.5 space-y-1 tabular-nums">
                    {(prod.variants || []).map((v) => (
                      <div key={v._id} className="text-[11px]">
                        <strong>{v.label}</strong>: {formatINR(v.price)} (Stock: {v.stock})
                      </div>
                    ))}
                  </td>
                  <td className="p-3.5">
                    <AdminStatusBadge status={prod.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(prod)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50"
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
