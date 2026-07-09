import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Megaphone, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout({ children }) {
  const location = useLocation();
  const [activeAnn, setActiveAnn] = useState(null);

  // Fetch active announcement banner
  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data } = await supabase
        .from('pengumuman')
        .select('*')
        .eq('status_aktif', true);
      if (data && data.length > 0) {
        setActiveAnn(data[0]);
      } else {
        setActiveAnn(null);
      }
    };
    fetchAnnouncement();
  }, [location.pathname]);

  const getAnnBg = (type) => {
    switch (type) {
      case 'danger': return 'bg-red-600/90 border-red-500/20 text-white';
      case 'warning': return 'bg-amber-600/90 border-amber-500/20 text-white';
      default: return 'bg-purple-600/95 border-purple-500/20 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col justify-between">

      {/* ── DYNAMIC ANNOUNCEMENT BANNER ──────────────── */}
      {activeAnn && (
        <div className={`relative border-b py-2 px-8 text-center text-xs font-semibold backdrop-blur-md transition-all ${getAnnBg(activeAnn.tipe)}`}>
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Megaphone className="h-4 w-4 shrink-0 animate-bounce" />
            <span>
              <strong>{activeAnn.judul}:</strong> {activeAnn.isi}
            </span>
          </div>
          <button
            onClick={() => setActiveAnn(null)}
            className="absolute right-3 top-1.5 p-1 rounded hover:bg-white/10 transition-colors text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── MODULAR HEADER ──────────────────────────── */}
      <Header />

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <main className="flex-grow w-full">
        {children}
      </main>

      {/* ── MODULAR FOOTER ──────────────────────────── */}
      <Footer />
    </div>
  );
}
