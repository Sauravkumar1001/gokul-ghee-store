import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Lock,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
  User,
  X,
} from 'lucide-react';
import AccountShell from '../components/account/AccountShell';
import GoogleMapAddressPicker from '../components/checkout/GoogleMapAddressPicker';
import { Badge, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { useLanguage } from '../context/LanguageContext';

export default function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addrMsg, setAddrMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [addrForm, setAddrForm] = useState({
    label: 'Home',
    recipientName: '',
    phone: '',
    houseNumber: '',
    street: '',
    landmark: '',
    city: 'Patna',
    state: 'Bihar',
    pincode: '801503',
    formattedAddress: '',
    coordinates: null,
    isDefault: true,
  });

  const refreshAccountData = useCallback(async () => {
    if (!isAuthenticated) return;
    const [addrRes, notifRes] = await Promise.all([
      orderService.getAddresses(),
      orderService.getNotifications(),
    ]);
    if (addrRes.ok && Array.isArray(addrRes.data?.addresses)) {
      setAddresses(addrRes.data.addresses);
    }
    if (notifRes.ok && Array.isArray(notifRes.data?.notifications)) {
      setNotifications(notifRes.data.notifications);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setAddrForm((prev) => ({
        ...prev,
        recipientName: prev.recipientName || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
    refreshAccountData();
  }, [user, refreshAccountData]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddrMsg('');
    setIsSaving(true);
    const res = await orderService.createAddress(addrForm);
    setIsSaving(false);

    if (res.ok) {
      setShowAddForm(false);
      setAddrMsg('Delivery address saved successfully.');
      refreshAccountData();
    } else {
      if (res.error?.isNetworkError) {
        setAddrMsg("We couldn't reach the store right now. Please try again in a moment.");
      } else {
        setAddrMsg(res.error?.message || 'Could not save address.');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    const res = await orderService.setDefaultAddress(addressId);
    if (res.ok) refreshAccountData();
  };

  const handleDeleteAddress = async (addressId) => {
    const res = await orderService.deleteAddress(addressId);
    if (res.ok) refreshAccountData();
  };

  const handleMarkNotificationRead = async (id) => {
    const res = await orderService.markNotificationRead(id);
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'G';

  return (
    <AccountShell
      title={language === 'en' ? 'My Account' : t('pages.account.title')}
      subtitle={
        isHi
          ? 'अपनी प्रोफ़ाइल, सहेजे गए पते और ऑर्डर सूचनाएं प्रबंधित करें।'
          : language === 'hinglish'
            ? 'Apni profile, saved delivery addresses aur order updates manage karein.'
            : 'Manage your customer profile, saved delivery addresses, and doorstep orders.'
      }
    >
      {!isAuthenticated ? (
        <div className="rounded-[24px] border border-[#E6DEC9] bg-[#FFFDF8] p-7 sm:p-10 space-y-7 gg-shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/40 flex items-center justify-center text-[#0F3D2E] shrink-0">
              <Lock className="w-6 h-6 text-[#9A7624]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#0F3D2E]">
                {isHi
                  ? 'सहेजी गई प्रोफ़ाइल देखने के लिए साइन इन करें'
                  : language === 'hinglish'
                    ? 'Apni Saved Profile Dekhne ke Liye Sign In Karein'
                    : 'Sign In to Access Your Saved Profile'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A554C] leading-relaxed max-w-xl">
                {isHi
                  ? 'अपने सहेजे गए पते, पिछले ऑर्डर की रसीदें और लाइव डिलीवरी स्थिति देखने के लिए अपने खाते में साइन इन करें।'
                  : 'Sign in to access your saved Danapur and Patna delivery addresses, view order history receipts, and track active deliveries.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="rounded-[18px] border border-[#E6DEC9] bg-[#FBF7EE] p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A7624]">
                <MapPin className="w-4 h-4 text-[#9A7624]" />
                <span>Saved Delivery Addresses</span>
              </div>
              <p className="text-xs text-[#5A554C] leading-relaxed">
                Save your home, shop, or office addresses with exact house numbers, nearby landmarks,
                and 6-digit pincodes for one-click ordering.
              </p>
            </div>

            <div className="rounded-[18px] border border-[#E6DEC9] bg-[#FBF7EE] p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A7624]">
                <Truck className="w-4 h-4 text-[#9A7624]" />
                <span>Verified Order Tracking</span>
              </div>
              <p className="text-xs text-[#5A554C] leading-relaxed">
                Track active orders in real time through 7 fulfillment stages, verify payment receipts,
                and review pure Bilona Ghee deliveries.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              to="/login?next=/account"
              variant="primary"
              size="md"
            >
              {t('pages.auth.signInBtn')}
            </Button>
            <Button
              to="/register?next=/account"
              variant="secondary"
              size="md"
            >
              {t('pages.auth.registerLink')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-[24px] border border-[#E6DEC9] bg-[#FFFDF8] p-6 sm:p-8 space-y-6 gg-shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DEC9] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D8B45E] to-[#B08732] text-[#0F3D2E] font-editorial font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
                  {userInitial}
                </div>
                <div>
                  <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                    Profile Information
                  </h2>
                  <p className="text-xs text-[#5A554C]">
                    Your verified personal details and contact preferences.
                  </p>
                </div>
              </div>
              <Badge variant="forest" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Active Customer
              </Badge>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-[16px] bg-[#FBF7EE] border border-[#E6DEC9]/70 space-y-1">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#9A7624]">
                  Full Name
                </dt>
                <dd className="font-semibold text-[#0F3D2E] text-sm truncate">
                  {user?.name || 'Not provided'}
                </dd>
              </div>
              <div className="p-3.5 rounded-[16px] bg-[#FBF7EE] border border-[#E6DEC9]/70 space-y-1">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#9A7624]">
                  Email Address
                </dt>
                <dd className="font-semibold text-[#0F3D2E] text-sm truncate">
                  {user?.email || 'Not provided'}
                </dd>
              </div>
              <div className="p-3.5 rounded-[16px] bg-[#FBF7EE] border border-[#E6DEC9]/70 space-y-1">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#9A7624]">
                  Mobile Number
                </dt>
                <dd className="font-semibold text-[#0F3D2E] text-sm truncate">
                  {user?.phone || 'Not provided'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Saved Delivery Addresses */}
          <div className="rounded-[24px] border border-[#E6DEC9] bg-[#FFFDF8] p-6 sm:p-8 space-y-6 gg-shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DEC9] pb-4">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-[#9A7624]" />
                <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                  Saved Delivery Addresses
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F3D2E] text-[#FBF7EE] text-xs font-semibold uppercase tracking-wider hover:bg-[#155742] transition-colors"
              >
                {showAddForm ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Close Form</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </>
                )}
              </button>
            </div>

            {addrMsg && (
              <div
                role="status"
                className="rounded-[14px] bg-[#F3EAD7] border border-[#E6DEC9] p-3 text-xs text-[#0F3D2E] flex items-center gap-2 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-[#9A7624] shrink-0" />
                <span>{addrMsg}</span>
              </div>
            )}

            {showAddForm && (
              <form
                onSubmit={handleSaveAddress}
                className="p-5 rounded-[20px] bg-[#FBF7EE] border border-[#E6DEC9] space-y-4 text-xs"
              >
                <h3 className="font-editorial text-lg font-semibold text-[#0F3D2E]">
                  Add New Delivery Location
                </h3>

                <GoogleMapAddressPicker
                  value={addrForm}
                  onChange={setAddrForm}
                  onPincodeDetected={(pin) =>
                    setAddrForm((prev) => ({ ...prev, pincode: pin }))
                  }
                />

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <label className="space-y-1 font-medium text-[#0F3D2E]">
                    <span>Address Label</span>
                    <input
                      type="text"
                      required
                      value={addrForm.label}
                      onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                      placeholder="e.g. Home, Office, Parents"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FFFDF8] border border-[#E6DEC9] text-xs text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
                    />
                  </label>

                  <label className="space-y-1 font-medium text-[#0F3D2E]">
                    <span>Recipient Full Name</span>
                    <input
                      type="text"
                      required
                      value={addrForm.recipientName}
                      onChange={(e) =>
                        setAddrForm({ ...addrForm, recipientName: e.target.value })
                      }
                      placeholder="Full name"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FFFDF8] border border-[#E6DEC9] text-xs text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
                    />
                  </label>

                  <label className="space-y-1 font-medium text-[#0F3D2E]">
                    <span>Mobile Number</span>
                    <input
                      type="tel"
                      required
                      value={addrForm.phone}
                      onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FFFDF8] border border-[#E6DEC9] text-xs text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
                    />
                  </label>

                  <label className="space-y-1 font-medium text-[#0F3D2E]">
                    <span>House / Flat / Shop No.</span>
                    <input
                      type="text"
                      required
                      value={addrForm.houseNumber}
                      onChange={(e) =>
                        setAddrForm({ ...addrForm, houseNumber: e.target.value })
                      }
                      placeholder="e.g. Flat 302, Building A"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FFFDF8] border border-[#E6DEC9] text-xs text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
                    />
                  </label>

                  <label className="space-y-1 font-medium text-[#0F3D2E] sm:col-span-2">
                    <span>Street / Mohalla / Locality</span>
                    <input
                      type="text"
                      required
                      value={addrForm.street}
                      onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                      placeholder="e.g. Math Road, Anand Bazar"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FFFDF8] border border-[#E6DEC9] text-xs text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
                    />
                  </label>

                  <label className="space-y-1 font-medium text-[#0F3D2E]">
                    <span>Nearby Landmark</span>
                    <input
                      type="text"
                      value={addrForm.landmark}
                      onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })}
                      placeholder="e.g. Near Hindu Society Mandir"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FFFDF8] border border-[#E6DEC9] text-xs text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
                    />
                  </label>

                  <label className="space-y-1 font-medium text-[#0F3D2E]">
                    <span>6-Digit Indian Pincode</span>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addrForm.pincode}
                      onChange={(e) =>
                        setAddrForm({
                          ...addrForm,
                          pincode: e.target.value.replace(/[^0-9]/g, ''),
                        })
                      }
                      placeholder="801503"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FFFDF8] border border-[#E6DEC9] text-xs tabular-nums text-[#1B1B1B] focus:outline-none focus:border-[#0F3D2E]"
                    />
                  </label>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-full bg-[#0F3D2E] text-[#FBF7EE] text-xs font-semibold uppercase tracking-wider hover:bg-[#155742] transition-colors disabled:opacity-60"
                    >
                      {isSaving ? 'Saving Address...' : 'Save Delivery Address'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <div className="p-8 rounded-[20px] bg-[#FBF7EE] border border-[#E6DEC9] text-center space-y-3">
                <MapPin className="w-8 h-8 text-[#9A7624] mx-auto" />
                <p className="font-editorial text-lg font-semibold text-[#0F3D2E]">
                  No Saved Delivery Addresses
                </p>
                <p className="text-xs text-[#5A554C] max-w-sm mx-auto">
                  Save your frequent Anand Bazar and Patna delivery spots for instant doorstep reorders.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#0F3D2E] text-[#0F3D2E] text-xs font-semibold uppercase tracking-wider hover:bg-[#0F3D2E] hover:text-[#FBF7EE] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Address</span>
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="p-5 rounded-[20px] bg-[#FBF7EE] border border-[#E6DEC9] space-y-2.5 text-xs gg-shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold uppercase tracking-wider text-[#9A7624]">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <Badge variant="forest" size="sm">
                            Default Address
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-[#0F3D2E]">
                        {addr.recipientName}
                      </p>
                      <p className="text-[#5A554C] leading-relaxed">
                        {addr.houseNumber}, {addr.street}
                        {addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} –{' '}
                        {addr.pincode}
                      </p>
                      <p className="text-[#1B1B1B] font-medium">{addr.phone}</p>
                      {addr.coordinates?.lat != null && addr.coordinates?.lng != null && (
                        <p className="text-[11px] font-mono text-[#0F3D2E]">
                          Pin: {Number(addr.coordinates.lat).toFixed(4)},{' '}
                          {Number(addr.coordinates.lng).toFixed(4)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E6DEC9]/70">
                      {!addr.isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr._id)}
                          className="text-[11px] font-semibold text-[#0F3D2E] hover:text-[#9A7624] underline underline-offset-2"
                        >
                          Make Default
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#5A554C]">Primary Location</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C2D19] hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Notifications */}
          {notifications.length > 0 && (
            <div className="rounded-[24px] border border-[#E6DEC9] bg-[#FFFDF8] p-6 sm:p-8 space-y-4 gg-shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#E6DEC9] pb-3">
                <Bell className="w-5 h-5 text-[#9A7624]" />
                <h2 className="font-editorial text-2xl font-semibold text-[#0F3D2E]">
                  Recent Order Updates
                </h2>
              </div>
              <ul className="space-y-2.5">
                {notifications.map((notif) => (
                  <li
                    key={notif._id}
                    className={`p-4 rounded-[16px] border text-xs flex items-start justify-between gap-3 ${
                      notif.isRead
                        ? 'bg-[#FBF7EE] border-[#E6DEC9] text-[#5A554C]'
                        : 'bg-[#F3EAD7]/60 border-[#C9A24B]/40 text-[#0F3D2E]'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{notif.title}</p>
                      <p className="text-xs leading-relaxed">{notif.message}</p>
                    </div>
                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkNotificationRead(notif._id)}
                        className="text-[11px] font-semibold underline text-[#0F3D2E] shrink-0"
                      >
                        Mark read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </AccountShell>
  );
}
