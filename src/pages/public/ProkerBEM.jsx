import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card } from '../../components/ui/Card';
import { Layers, CheckCircle2, RefreshCw, HelpCircle, User } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';
import { ListSkeleton } from '../../components/ui/Skeleton';

export default function ProkerBEM() {
  useDocumentTitle('Program Kerja');
  const [prokerList, setProkerList] = useState([]);
  const [kementerianList, setKementerianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKem, setActiveKem] = useState('Semua');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: proker } = await supabase.from('proker').select('*');
      const { data: kem } = await supabase.from('kementerian').select('*').order('hierarki_order', { ascending: true });
      
      setProkerList(proker || []);
      setKementerianList(kem || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Selesai
          </span>
        );
      case 'berjalan':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <RefreshCw className="h-3 w-3 animate-spin [animation-duration:3s]" /> Berjalan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-500/10 border border-gray-500/20 px-2 py-0.5 rounded-full">
            <HelpCircle className="h-3 w-3" /> Belum Mulai
          </span>
        );
    }
  };

  const getMinistryName = (id) => {
    const found = kementerianList.find((k) => k.id === id);
    return found ? found.nama_kementerian : 'Kementerian Sektoral';
  };

  const filteredProker = prokerList.filter((p) => {
    return activeKem === 'Semua' || p.kementerian_id === activeKem;
  });

  // Calculate statistics
  const total = filteredProker.length;
  const selesai = filteredProker.filter((p) => p.status === 'selesai').length;
  const berjalan = filteredProker.filter((p) => p.status === 'berjalan').length;
  const progressPercent = total > 0 ? Math.round((selesai / total) * 100) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header (Unified) */}
      <PageHeader
        tag="Program Kerja"
        icon={Layers}
        title="Program Kerja BEM"
        description="Pantau transparansi pencapaian target, program kerja utama, dan rencana aksi taktis dari setiap Kementerian BEM Kabinet Nusantara Maju."
      />

      {/* Progress Card */}
      <Card className="border-gray-800 bg-gradient-to-r from-purple-950/20 via-gray-950 to-indigo-950/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="space-y-1">
            <h4 className="text-xs text-gray-500 uppercase tracking-widest font-extrabold">Progress Keseluruhan</h4>
            <div className="text-3xl font-extrabold text-white">{progressPercent}% Selesai</div>
            <p className="text-xs text-gray-400">Dari total program kerja terdaftar</p>
          </div>
          <div className="md:col-span-3 space-y-3">
            {/* Progress bar */}
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-emerald-400 font-bold">{selesai} Selesai</span>
              <span className="text-amber-400 font-bold">{berjalan} Sedang Berjalan</span>
              <span className="text-gray-400 font-bold">{total - selesai - berjalan} Belum Mulai</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters and List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Ministry Filter */}
        <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-20">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Filter Kementerian</h4>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveKem('Semua')}
              className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeKem === 'Semua'
                  ? 'bg-purple-600/15 text-purple-300 border-purple-500/20'
                  : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/[0.02]'
              }`}
            >
              <span>Semua Kementerian ({total})</span>
            </button>
            {kementerianList.map((k) => {
              const count = prokerList.filter((p) => p.kementerian_id === k.id).length;
              return (
                <button
                  key={k.id}
                  onClick={() => setActiveKem(k.id)}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeKem === k.id
                      ? 'bg-purple-600/15 text-purple-300 border-purple-500/20'
                      : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="line-clamp-1">{k.nama_kementerian} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Proker Grid */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <ListSkeleton count={4} />
          ) : filteredProker.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
              <Layers className="h-10 w-10 mx-auto text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm font-semibold">Belum ada program kerja terdaftar</p>
            </div>
          ) : (
            filteredProker.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-gray-800 bg-gray-900/25 hover:border-gray-700 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-widest block">
                      {getMinistryName(p.kementerian_id)}
                    </span>
                    <h4 className="font-extrabold text-white text-base leading-tight">{p.nama_proker}</h4>
                  </div>
                  {getStatusBadge(p.status)}
                </div>

                <p className="text-gray-400 text-xs leading-relaxed">{p.deskripsi}</p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-900/60 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    <span>PJ: {p.penanggung_jawab}</span>
                  </div>
                  <div>
                    <span>Target: <strong className="text-gray-300">{p.target_pelaksanaan}</strong></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
