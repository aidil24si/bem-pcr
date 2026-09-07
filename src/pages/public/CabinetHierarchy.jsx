import React, { useState, useEffect } from 'react';
import { useMockDatabase } from '../../context/MockDatabaseContext';
import { Select, SelectItem } from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent } from '../../components/ui/Dialog';
import { Calendar, User, Layers, Shield, Star, Users } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const PERIODS = ['2026/2027', '2025/2026', '2024/2025'];

const RUMPUN_LIST = [
  { name: 'Pelayanan & Isu', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { name: 'Internal & SDM', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { name: 'Eksternal & Kreatif', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
];

export default function CabinetHierarchy() {
  useDocumentTitle('Struktur Kabinet');
  const [selectedYear, setSelectedYear] = useState('2026/2027');
  const { kementerian: kementerianList, pengurus } = useMockDatabase();
  const [pengurusList, setPengurusList] = useState([]);
  const [selectedPengurus, setSelectedPengurus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const filtered = pengurus.filter(p => p.periode_tahun === selectedYear);
      setPengurusList(filtered);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedYear, pengurus]);

  const getPengurusByMinistryOrder = (order) => {
    const minIds = kementerianList.filter((k) => k.hierarki_order === order).map((k) => k.id);
    return pengurusList.filter((p) => minIds.includes(p.kementerian_id));
  };

  const getSektoralMinistriesByRumpun = (rumpunName) => {
    return kementerianList.filter((k) => k.hierarki_order > 1 && k.rumpun === rumpunName);
  };

  const getPengurusForMinistry = (minId) => {
    return pengurusList.filter((p) => p.kementerian_id === minId);
  };

  const renderProfileCard = (p) => (
    <Card
      key={p.id}
      onClick={() => setSelectedPengurus(p)}
      className="border-gray-200 bg-white text-center flex flex-col items-center p-5 space-y-3 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group"
    >
      <div className="relative">
        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200 bg-slate-50">
          {p.foto_url ? (
            <img src={p.foto_url} alt={p.nama} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <User className="h-8 w-8 text-slate-300" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#004B5F] rounded-full p-1 text-white border border-white">
          <Shield className="h-3 w-3" />
        </div>
      </div>
      <div>
        <h4 className="font-bold text-[#004B5F] text-sm line-clamp-1">
          {p.nama}
        </h4>
        <p className="text-xs text-slate-500 font-medium">{p.jabatan}</p>
      </div>
    </Card>
  );

  const renderMiniProfile = (p, isSekmen = false) => (
    <div
      key={p.id}
      onClick={() => setSelectedPengurus(p)}
      className={`p-3 bg-white border ${isSekmen ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'} rounded-lg text-center relative shadow-sm cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group`}
    >
      {isSekmen && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-0.5 shadow-md" title="Sekretaris Kementerian">
          <Star className="h-3 w-3" />
        </div>
      )}
      <div className="h-12 w-12 rounded-full overflow-hidden mx-auto mb-2 border border-gray-200 bg-slate-50">
        {p.foto_url ? (
          <img src={p.foto_url} alt={p.nama} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <User className="h-5 w-5 text-slate-300" />
          </div>
        )}
      </div>
      <div className="font-semibold text-[#004B5F] text-xs truncate">
        {p.nama}
      </div>
      <div className={`text-[10px] ${isSekmen ? 'text-amber-600' : 'text-slate-500'} truncate`}>{p.jabatan}</div>
    </div>
  );

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#004B5F]">
            Struktur Kabinet Dinamis
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Eksplorasi bagan organisasi kepengurusan BEM Universitas secara interaktif.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <label className="text-xs text-[#004B5F] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Periode Kabinet:
          </label>
          <div className="w-40">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              {PERIODS.map((y) => (
                <SelectItem key={y} value={y}>
                  Kabinet {y}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="h-10 w-10 border-4 border-[#004B5F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Mengunduh data pengurus kabinet...</p>
        </div>
      ) : pengurusList.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-300 rounded-3xl bg-white shadow-sm mt-8">
          <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
            <Users className="h-10 w-10 text-slate-300" />
          </div>
          <h4 className="font-extrabold text-[#004B5F] text-xl">Data Kepengurusan Kosong</h4>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Belum ada anggota kabinet yang terdaftar untuk periode {selectedYear}.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* HIERARCHY LEVEL 1: Presma & Wapresma */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg justify-center">
              {getPengurusByMinistryOrder(0).map(renderProfileCard)}
              {getPengurusByMinistryOrder(0).length === 0 && (
                <p className="text-slate-500 text-sm col-span-2">Data pimpinan belum diisi.</p>
              )}
            </div>
            {/* Visual connector */}
            <div className="w-0.5 h-8 bg-gray-300"></div>
          </div>

          {/* HIERARCHY LEVEL 2: Admin Inti (Sekum/Bendum/Sekre) */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl justify-center">
              {getPengurusByMinistryOrder(1).map(renderProfileCard)}
              {getPengurusByMinistryOrder(1).length === 0 && (
                <p className="text-slate-500 text-sm col-span-4">Data Sekretaris & Bendahara belum diisi.</p>
              )}
            </div>
            {/* Visual connector */}
            <div className="w-0.5 h-8 bg-gray-300"></div>
          </div>

          {/* HIERARCHY LEVEL 3: Kementerian Sektoral */}
          <div className="columns-1 lg:columns-2 gap-8">
            {kementerianList.filter(k => k.hierarki_order > 1).map((min) => {
              const staff = getPengurusForMinistry(min.id);
                      
                      const sekmen = staff.filter(p => p.jabatan.toLowerCase().includes('sekretaris') || p.jabatan.toLowerCase().includes('sekmen'));
                      const pimpinan = staff.filter(p => 
                        !p.jabatan.toLowerCase().includes('sekretaris') && 
                        !p.jabatan.toLowerCase().includes('sekmen') && 
                        (p.jabatan.toLowerCase().includes('menteri') || p.jabatan.toLowerCase().includes('koordinator'))
                      );
                      const anggota = staff.filter(p => 
                        !p.jabatan.toLowerCase().includes('menteri') && 
                        !p.jabatan.toLowerCase().includes('koordinator') && 
                        !p.jabatan.toLowerCase().includes('sekretaris') && 
                        !p.jabatan.toLowerCase().includes('sekmen')
                      );

                      return (
                        <Card key={min.id} className="border-gray-200 bg-slate-50 overflow-hidden shadow-sm break-inside-avoid mb-8">
                          <CardContent className="p-0">
                            {/* Header Kementerian */}
                            <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                              <h3 className="text-sm font-bold text-[#004B5F]">{min.nama_kementerian}</h3>
                              <Layers className="h-4 w-4 text-slate-400" />
                            </div>

                            <div className="p-6 space-y-6">
                              {staff.length === 0 ? (
                                <p className="text-xs text-slate-500 italic text-center">Belum ada staf kementerian.</p>
                              ) : (
                                <>
                                  {/* Pimpinan Section */}
                                  {(pimpinan.length > 0 || sekmen.length > 0) && (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {pimpinan.map(p => renderMiniProfile(p, false))}
                                        {sekmen.map(p => renderMiniProfile(p, true))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Anggota/Staf Section */}
                                  {anggota.length > 0 && (
                                    <div className="space-y-3 pt-2 border-t border-gray-200 border-dashed">
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {anggota.map(p => renderMiniProfile(p, false))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
            })}
          </div>
        </div>
      )}

      {/* MODAL DETAIL PENGURUS */}
      <Dialog open={!!selectedPengurus} onOpenChange={(open) => !open && setSelectedPengurus(null)}>
        <DialogContent className="border-gray-200 bg-white sm:max-w-xl">
          {selectedPengurus && (
            <div className="space-y-6">
              {/* Header: Foto, Nama, Jabatan */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="h-28 w-28 shrink-0 rounded-full overflow-hidden border-4 border-gray-100 bg-slate-50 shadow-sm relative">
                  {selectedPengurus.foto_url ? (
                    <img src={selectedPengurus.foto_url} alt={selectedPengurus.nama} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left flex-1 mt-2 sm:mt-0">
                  <DialogTitle className="text-2xl font-extrabold text-[#004B5F] mb-1">{selectedPengurus.nama}</DialogTitle>
                  <DialogDescription className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{selectedPengurus.jabatan}</DialogDescription>
                  <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-gray-200">
                    Periode {selectedPengurus.periode_tahun}
                  </div>
                </div>
              </div>

              {/* Detail Lists */}
              <div className="space-y-5 pt-2">
                {/* Prestasi Akademik */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-[#004B5F] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Star className="h-3.5 w-3.5" /> Prestasi Akademik
                  </h4>
                  {(!selectedPengurus.prestasi_akademik || selectedPengurus.prestasi_akademik.length === 0) ? (
                    <p className="text-sm text-slate-400 italic">Belum ada data.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                      {selectedPengurus.prestasi_akademik.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>

                {/* Prestasi Non-Akademik */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-[#004B5F] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Star className="h-3.5 w-3.5" /> Prestasi Non-Akademik
                  </h4>
                  {(!selectedPengurus.prestasi_non_akademik || selectedPengurus.prestasi_non_akademik.length === 0) ? (
                    <p className="text-sm text-slate-400 italic">Belum ada data.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                      {selectedPengurus.prestasi_non_akademik.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>

                {/* Riwayat Organisasi */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-[#004B5F] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Users className="h-3.5 w-3.5" /> Riwayat Organisasi
                  </h4>
                  {(!selectedPengurus.riwayat_organisasi || selectedPengurus.riwayat_organisasi.length === 0) ? (
                    <p className="text-sm text-slate-400 italic">Belum ada data.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                      {selectedPengurus.riwayat_organisasi.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
