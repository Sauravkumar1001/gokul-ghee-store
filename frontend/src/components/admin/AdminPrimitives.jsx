import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function AdminKpiCard({ label, value, subtitle, accent = 'default' }) {
  const accentRing =
    accent === 'alert'
      ? 'border-amber-300 bg-amber-50/70'
      : accent === 'success'
      ? 'border-emerald-200 bg-emerald-50/50'
      : 'border-slate-200 bg-white';

  return (
    <div className={`rounded-lg border ${accentRing} p-5 shadow-xs space-y-1.5`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function AdminStatusBadge({ status }) {
  const normalized = String(status || '').toUpperCase();
  let classes = 'bg-slate-100 text-slate-700';

  if (['DELIVERED', 'PAID', 'APPROVED', 'ACTIVE'].includes(normalized)) {
    classes = 'bg-emerald-100 text-emerald-800';
  } else if (['CANCELLED', 'REFUNDED', 'FAILED', 'REJECTED', 'INACTIVE'].includes(normalized)) {
    classes = 'bg-rose-100 text-rose-800';
  } else if (['PLACED', 'PENDING'].includes(normalized)) {
    classes = 'bg-amber-100 text-amber-800';
  } else if (['CONFIRMED', 'PREPARING', 'READY FOR DISPATCH', 'SHIPPED', 'OUT FOR DELIVERY'].includes(normalized)) {
    classes = 'bg-sky-100 text-sky-800';
  }

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${classes}`}>
      {normalized}
    </span>
  );
}

export function AdminFeedbackBanner({ type = 'info', message }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`rounded-md border px-4 py-3 text-xs flex items-start gap-2 ${
        isError
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}

export function AdminLoadingState({ label = 'Loading live MongoDB data...' }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

export function AdminBarSeries({ title, items = [], valueKey = 'revenue', labelKey = 'date', formatValue }) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">No recorded events in the selected window yet.</p>
      </div>
    );
  }

  const maxVal = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="space-y-2.5">
        {items.map((item) => {
          const val = Number(item[valueKey]) || 0;
          const pct = Math.max(4, Math.round((val / maxVal) * 100));
          return (
            <div key={item[labelKey]} className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 tabular-nums">
                <span className="font-medium text-slate-800">{item[labelKey]}</span>
                <span>{formatValue ? formatValue(val, item) : val}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#173D2B]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
