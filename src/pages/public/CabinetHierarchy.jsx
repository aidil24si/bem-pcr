import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Select, SelectItem } from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card, CardContent } from '../../components/ui/Card';
import { Award, BookOpen, Briefcase, Calendar, User, Layers } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const PERIODS = ['2025/2026', '2024/2025', '2023/2024'];

export default function CabinetHierarchy() {
  useDocumentTitle('Struktur Kabinet');
  const [selectedYear, setSelectedYear] = useState('2025/2026');
  const [kementerianList, setKementerianList] = useState([]);
  const [pengurusList, setPengurusList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Detail Modal State
  const [selectedPengurus, setSelectedPengurus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('academic');

  // 1. Fetch ministries on mount (metadata is stable and lightweight)
  useEffect(() => {
    const fetchKementerian = async () => {
      try {
        const { data, error } = await supabase
          .from('kementerian')
          .select('*')
          .order('hierarki_order', { ascending: true });
        
        if (error) throw error;
        setKementerianList(data || []);
      } catch (err) {
        console.error('Error fetching kementerian:', err);
      }
    };
    fetchKementerian();
  }, []);

  // 2. Fetch pengurus only for the selected year (LAZY LOADING - FR-3.4)
  useEffect(() => {
    const fetchPengurusForYear = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pengurus')
          .select('*')
          .eq('periode_tahun', selectedYear);

        if (error) throw error;
        setPengurusList(data || []);
      } catch (err) {
        console.error('Error fetching pengurus for year:', selectedYear, err);
      } finally {
        setLoading(false);
      }
    };

    fetchPengurusForYear();
  }, [selectedYear]);

  // Open modal with user details
  const handleOpenDetail = (pengurus) => {
    setSelectedPengurus(pengurus);
    setModalTab('academic'); // Default sub-tab inside profile
    setModalOpen(true);
  };

  // Grouping logic for hierarchy: Presma (order 0) -> Admin Inti (order 1) -> Sektoral (order > 1)
  const getPengurusByMinistryOrder = (order) => {
    const minIds = kementerianList
      .filter((k) => k.hierarki_order === order)
      .map((k) => k.id);
    return pengurusList.filter((p) => minIds.includes(p.kementerian_id));
  };

  const getSektoralMinistries = () => {
    return kementerianList.filter((k) => k.hierarki_order > 1);
  };

  const getPengurusForMinistry = (minId) => {
    return pengurusList.filter((p) => p.kementerian_id === minId);
  };

  const renderProfileCard = (p) => (
    <Card
      key={p.id}
      onClick={() => handleOpenDetail(p)}
      className="border-gray-800 bg-gray-900/40 hover:bg-gray-900/70 hover:border-purple-500/50 hover:shadow-purple-500/10 hover:shadow-lg transition-all cursor-pointer group text-center flex flex-col items-center p-5 space-y-3"
    >
      <div className="relative">
        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-purple-500/50 group-hover:border-purple-500 transition-colors">
          {p.foto_url ? (
            <img src={p.foto_url} alt={p.nama} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gray-800 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-500" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1 text-white border border-gray-900">
          <Layers className="h-3 w-3" />
        </div>
      </div>
      <div>
        <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors text-sm line-clamp-1">
          {p.nama}
        </h4>
        <p className="text-xs text-gray-400 font-medium">{p.jabatan}</p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-gray-800">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Struktur Kabinet Dinamis
          </h2>
          <p className="text-gray-400 mt-1 text-sm">
            Eksplorasi bagan organisasi kepengurusan BEM Universitas secara interaktif.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-purple-500" />
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
          <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Mengunduh data pengurus kabinet...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* HIERARCHY LEVEL 1: Presma & Wapresma */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-xs uppercase font-extrabold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
              Pucuk Pimpinan
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
              {getPengurusByMinistryOrder(0).map(renderProfileCard)}
              {getPengurusByMinistryOrder(0).length === 0 && (
                <p className="text-gray-500 text-sm col-span-2">Data pimpinan belum diisi.</p>
              )}
            </div>
            {/* Visual connector */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-indigo-500"></div>
          </div>

          {/* HIERARCHY LEVEL 2: Admin Inti (Sekum/Bendum/Sekre) */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Administrasi & Kesekretariatan
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-3xl">
              {getPengurusByMinistryOrder(1).map(renderProfileCard)}
              {getPengurusByMinistryOrder(1).length === 0 && (
                <p className="text-gray-500 text-sm col-span-3">Data administrasi inti belum diisi.</p>
              )}
            </div>
            {/* Visual connector */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-500 to-gray-800"></div>
          </div>

          {/* HIERARCHY LEVEL 3: Kementerian Sektoral */}
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-block text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-3">
                Kementerian Sektoral
              </div>
              <p className="text-xs text-gray-500">Pilih kementerian di bawah untuk melihat pengurus sektoral</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {getSektoralMinistries().map((min) => {
                const staff = getPengurusForMinistry(min.id);
                return (
                  <Card key={min.id} className="border-gray-800 bg-gray-900/30">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-base font-bold text-white border-b border-gray-800 pb-2">
                        {min.nama_kementerian}
                      </h3>
                      {staff.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">Belum ada staf kementerian terdaftar.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {staff.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleOpenDetail(p)}
                              className="p-3 bg-gray-950/60 border border-gray-800 hover:border-purple-500/50 rounded-lg text-center cursor-pointer transition-colors group"
                            >
                              <div className="h-12 w-12 rounded-full overflow-hidden mx-auto mb-2 border border-purple-500/30 group-hover:border-purple-500">
                                {p.foto_url ? (
                                  <img src={p.foto_url} alt={p.nama} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="font-semibold text-white group-hover:text-purple-400 text-xs truncate">
                                {p.nama}
                              </div>
                              <div className="text-[10px] text-gray-400 truncate">{p.jabatan}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Profile Detail Dialog */}
      {selectedPengurus && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              Profil Detail Pengurus
            </DialogTitle>
            <DialogDescription>
              Informasi prestasi akademis, non-akademis, dan riwayat organisasi.
            </DialogDescription>
          </DialogHeader>
          <DialogContent className="space-y-6">
            {/* Brief Info */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-950 border border-gray-800">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-purple-500/50 shrink-0">
                {selectedPengurus.foto_url ? (
                  <img src={selectedPengurus.foto_url} alt={selectedPengurus.nama} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                    <User className="h-7 w-7 text-gray-500" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{selectedPengurus.nama}</h3>
                <p className="text-xs text-purple-400 font-semibold">{selectedPengurus.jabatan}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Kabinet Periode {selectedPengurus.periode_tahun}</p>
              </div>
            </div>

            {/* Profile Tab Section */}
            <Tabs value={modalTab} onValueChange={setModalTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="academic" className="text-xs">Akademik</TabsTrigger>
                <TabsTrigger value="non-academic" className="text-xs">Non-Akademik</TabsTrigger>
                <TabsTrigger value="organizations" className="text-xs">Organisasi</TabsTrigger>
              </TabsList>

              {/* Tab 1: Prestasi Akademik */}
              <TabsContent value="academic" className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  Prestasi Akademik
                </h4>
                {selectedPengurus.prestasi_akademik && selectedPengurus.prestasi_akademik.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPengurus.prestasi_akademik.map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-200 bg-gray-950 p-2.5 rounded border border-gray-900 flex items-start gap-2">
                        <Award className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 italic">Tidak ada catatan prestasi akademik.</p>
                )}
              </TabsContent>

              {/* Tab 2: Prestasi Non Akademik */}
              <TabsContent value="non-academic" className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-purple-400" />
                  Prestasi Non-Akademik
                </h4>
                {selectedPengurus.prestasi_non_akademik && selectedPengurus.prestasi_non_akademik.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPengurus.prestasi_non_akademik.map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-200 bg-gray-950 p-2.5 rounded border border-gray-900 flex items-start gap-2">
                        <Award className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 italic">Tidak ada catatan prestasi non-akademik.</p>
                )}
              </TabsContent>

              {/* Tab 3: Riwayat Organisasi */}
              <TabsContent value="organizations" className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-purple-400" />
                  Riwayat Organisasi
                </h4>
                {selectedPengurus.riwayat_organisasi && selectedPengurus.riwayat_organisasi.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPengurus.riwayat_organisasi.map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-200 bg-gray-950 p-2.5 rounded border border-gray-900 flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0 mt-1.5"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 italic">Tidak ada catatan riwayat organisasi.</p>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
