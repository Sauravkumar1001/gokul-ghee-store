import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AdminFeedbackBanner,
  AdminLoadingState,
  AdminStatusBadge,
} from '../../components/admin/AdminPrimitives';
import { adminService } from '../../services/adminService';
import { formatINR } from '../../utils/formatters';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getCustomers(search.trim() ? { q: search.trim() } : {});
    setLoading(false);
    if (res.ok) {
      setCustomers(res.data.customers || []);
    } else {
      setErrorMsg(res.error?.message || 'Unable to load customers.');
    }
  }, [search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const inspectCustomer = async (id) => {
    const res = await adminService.getCustomerDetail(id);
    if (res.ok) {
      setDetail(res.data);
    }
  };

  return (
    <AdminLayout
      title="Customer Directory"
      subtitle="Verified customer accounts, saved delivery locations, and historical purchase totals."
    >
      <AdminFeedbackBanner type="error" message={errorMsg} />

      <div className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer by name, email, or phone..."
          className="flex-1 max-w-md px-3.5 py-2 rounded-md border border-slate-300 bg-white text-sm"
        />
      </div>

      {detail && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">{detail.customer?.name}</h2>
              <p className="text-xs text-slate-500">
                {detail.customer?.email} • {detail.customer?.phone}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Close
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800">Saved Addresses ({detail.addresses?.length || 0})</h3>
              {(detail.addresses || []).length === 0 ? (
                <p className="text-slate-500">No saved delivery addresses.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.addresses.map((addr) => (
                    <li key={addr._id} className="p-3 rounded bg-slate-50 border border-slate-200">
                      <p className="font-semibold">{addr.label} — {addr.recipientName}</p>
                      <p className="text-slate-600">
                        {addr.houseNumber}, {addr.street}, {addr.city} – {addr.pincode}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800">Order History ({detail.orders?.length || 0})</h3>
              {(detail.orders || []).length === 0 ? (
                <p className="text-slate-500">No orders placed yet.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.orders.map((ord) => (
                    <li key={ord._id} className="p-3 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">#{ord.orderNumber}</p>
                        <AdminStatusBadge status={ord.status} />
                      </div>
                      <strong className="tabular-nums">{formatINR(ord.pricing?.totalAmount ?? 0)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <AdminLoadingState />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-3.5 font-semibold">Customer</th>
                <th className="p-3.5 font-semibold">Contact</th>
                <th className="p-3.5 font-semibold text-right">Orders</th>
                <th className="p-3.5 font-semibold text-right">Lifetime Spend</th>
                <th className="p-3.5 font-semibold text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((cust) => (
                <tr key={cust._id}>
                  <td className="p-3.5 font-semibold text-slate-900">{cust.name}</td>
                  <td className="p-3.5 text-slate-600">
                    {cust.email}
                    <div className="text-[11px]">{cust.phone}</div>
                  </td>
                  <td className="p-3.5 text-right tabular-nums">{cust.orderCount}</td>
                  <td className="p-3.5 text-right font-semibold tabular-nums">
                    {formatINR(cust.totalSpent)}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => inspectCustomer(cust._id)}
                      className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50"
                    >
                      View History
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
