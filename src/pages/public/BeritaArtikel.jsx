import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card } from '../../components/ui/Card';
import { BookOpen, Calendar, User, ArrowLeft, Search } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';
import { CardGridSkeleton } from '../../components/ui/Skeleton';

const KATEGORI_OPTIONS = ['Semua', 'Kampus', 'Internal', 'Opini', 'Rilis'];

export default function BeritaArtikel() {
  useDocumentTitle('Berita & Agenda');
  const [beritaList, setBeritaList] = useState([]);
  const [selectedBerita, setSelectedBerita] = useState(null);
  const [activeKategori, setActiveKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBerita = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('berita')
        .select('*')
        .order('created_at', { ascending: false });
      setBeritaList(data || []);
      setLoading(false);
    };
    fetchBerita();
  }, []);

  const filteredBerita = beritaList.filter((b) => {
    const matchKategori = activeKategori === 'Semua' || b.kategori === activeKategori;
    const matchSearch = b.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        b.ringkasan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKategori && matchSearch;
  });

  if (selectedBerita) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        <button
          onClick={() => setSelectedBerita(null)}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Berita
        </button>

        {selectedBerita.gambar_url && (
          <div className="relative h-64 sm:h-[400px] w-full rounded-2xl overflow-hidden border border-gray-800">
            <img
              src={selectedBerita.gambar_url}
              alt={selectedBerita.judul}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold uppercase tracking-wider">
              {selectedBerita.kategori}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(selectedBerita.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{selectedBerita.pembuat}</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {selectedBerita.judul}
          </h2>

          <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line border-t border-gray-900 pt-6">
            {selectedBerita.isi}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header (Unified) */}
      <PageHeader
        tag="Berita & Artikel"
        icon={BookOpen}
        title="Berita & Artikel BEM"
        description="Ikuti perkembangan kabar terkini, rilis pers resmi, kajian opini, dan liputan dokumentasi kegiatan mahasiswa Universitas."
      />

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-900 pb-4">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5">
          {KATEGORI_OPTIONS.map((k) => (
            <button
              key={k}
              onClick={() => setActiveKategori(k)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                activeKategori === k
                  ? 'bg-purple-600/15 text-purple-300 border-purple-500/25'
                  : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/[0.03]'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-950 border border-gray-900 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* News Grid */}
      {loading ? (
        <CardGridSkeleton count={3} />
      ) : filteredBerita.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
          <BookOpen className="h-10 w-10 mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm font-semibold">Tidak ada artikel ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBerita.map((b) => (
            <Card
              key={b.id}
              onClick={() => setSelectedBerita(b)}
              className="border-gray-800 bg-gray-900/30 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                {b.gambar_url && (
                  <div className="h-44 w-full overflow-hidden rounded-t-xl">
                    <img
                      src={b.gambar_url}
                      alt={b.judul}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10 uppercase tracking-widest">
                      {b.kategori}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-base line-clamp-2 hover:text-purple-300 transition-colors">
                    {b.judul}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {b.ringkasan}
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-900/60 mt-4">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> {b.pembuat}
                </span>
                <span className="text-purple-400 font-bold group-hover:underline">Baca Selengkapnya →</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
