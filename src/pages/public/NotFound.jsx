import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Home } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Halaman Tidak Ditemukan');
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto">
      <div className="p-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full animate-pulse">
        <Map className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-white">404</h2>
        <h3 className="text-lg font-bold text-gray-200">Halaman Tidak Ditemukan</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Tautan yang Anda ikuti salah, atau halaman telah dipindahkan oleh pengelola sistem BEM.
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-purple-900/30"
      >
        <Home className="h-3.5 w-3.5" />
        Kembali ke Beranda
      </button>
    </div>
  );
}
