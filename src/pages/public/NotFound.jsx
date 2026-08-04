import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Home } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Halaman Tidak Ditemukan');
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto">
      <div className="p-5 bg-[#E6F3F7] border border-[#CCE7EF] text-[#004B5F] rounded-full animate-pulse shadow-sm">
        <Map className="h-12 w-12" />
      </div>
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-[#004B5F]">404</h2>
        <h3 className="text-xl font-extrabold text-slate-700">Halaman Tidak Ditemukan</h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
          Tautan yang Anda ikuti salah, atau halaman telah dipindahkan oleh pengelola sistem BEM.
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="py-3 px-6 rounded-xl bg-[#004B5F] hover:bg-[#003847] text-white font-bold text-sm flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#004B5F]/20 hover:-translate-y-0.5"
      >
        <Home className="h-4 w-4" />
        Kembali ke Beranda
      </button>
    </div>
  );
}
