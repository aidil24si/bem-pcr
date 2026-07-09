import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto">
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full animate-bounce">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Sistem Mengalami Gangguan</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Gagal memuat modul halaman. Hal ini biasanya terjadi karena pembaruan sistem atau masalah koneksi internet Anda.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-purple-900/30"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Muat Ulang Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
