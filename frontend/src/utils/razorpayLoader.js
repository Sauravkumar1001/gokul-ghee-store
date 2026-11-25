let scriptPromise = null;

export function loadRazorpayCheckoutScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }
  if (window.Razorpay) {
    return Promise.resolve(true);
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}
