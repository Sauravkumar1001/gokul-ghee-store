import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const { isAuthenticated, isAdmin, login, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Administrator email and password are required.');
      return;
    }

    const result = await login({ email: email.trim(), password });
    if (!result.ok) {
      setErrorMsg(result.error?.message || 'Unable to sign in.');
      return;
    }

    if (result.data?.user?.role !== 'admin') {
      await logout();
      setErrorMsg(
        'Access denied: this account holds customer privileges. Administrator credentials are required.'
      );
      return;
    }

    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12 text-slate-900">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#173D2B] text-[#C9A34A] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9D7927]">
            Anil Ji Ka Gokul Ghee
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Admin Console Sign In</h1>
          <p className="text-xs text-slate-500">
            Restricted store management access for catalog, inventory, orders & analytics.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <label className="block space-y-1.5 text-xs font-medium text-slate-700">
            <span>Administrator Email</span>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gokulghee.in"
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-[#173D2B]"
              />
            </div>
          </label>

          <label className="block space-y-1.5 text-xs font-medium text-slate-700">
            <span>Password</span>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                autoComplete="current-password"
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:border-[#173D2B]"
              />
            </div>
          </label>

          {errorMsg && (
            <p role="alert" className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-md bg-[#173D2B] text-[#F8F4E9] text-sm font-semibold hover:bg-[#102B1E] disabled:opacity-60 transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900">
            ← Return to Customer Storefront
          </Link>
          <span>Role-Protected</span>
        </div>
      </div>
    </div>
  );
}
