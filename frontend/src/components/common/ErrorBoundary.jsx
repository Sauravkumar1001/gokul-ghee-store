import React from 'react';
import { AlertCircle, Home, Phone, RefreshCw } from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught runtime exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] bg-[#FBF7EE] py-12 px-4 flex items-center justify-center">
          <div className="max-w-md w-full text-center space-y-6 p-8 rounded-[28px] border border-[#E6DEC9] bg-[#FFFDF8] gg-shadow-lg">
            <div className="w-14 h-14 rounded-full bg-[#F3EAD7] border border-[#C9A24B]/40 flex items-center justify-center text-[#9A7624] mx-auto shadow-xs">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7624]">
                Notice
              </span>
              <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#0F3D2E]">
                Something Went Wrong
              </h1>
              <p className="text-xs sm:text-sm text-[#5A554C] leading-relaxed">
                We encountered an unexpected issue while loading this view. Your cart items and account details remain safe.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-xs text-red-700 font-mono overflow-auto max-h-36">
                  <p className="font-bold">{this.state.error.toString()}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0F3D2E] text-[#FBF7EE] text-xs font-semibold hover:bg-[#155742] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#E6DEC9] bg-[#FFFDF8] text-[#0F3D2E] text-xs font-semibold hover:bg-[#F3EAD7] transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </a>
            </div>

            <div className="pt-4 border-t border-[#E6DEC9] text-xs text-[#5A554C]">
              <span>Need help? Call our Danapur store at </span>
              <a
                href={STORE_CONFIG.phoneHref}
                className="font-semibold text-[#0F3D2E] hover:text-[#9A7624]"
              >
                {STORE_CONFIG.phone}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
