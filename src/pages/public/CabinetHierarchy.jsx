import React, { useState, useEffect } from 'react';
import { useMockDatabase } from '../../context/MockDatabaseContext';
import { Select, SelectItem } from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card, CardContent } from '../../components/ui/Card';
import { Award, BookOpen, Briefcase, Calendar, User, Layers, Shield, Star, Users } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  // Profile Detail Modal State
  const [selectedPengurus, setSelectedPengurus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('academic');

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const filtered = pengurus.filter(p => p.periode_tahun === selectedYear);
      setPengurusList(filtered);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedYear, pengurus]);

  const handleOpenDetail = (p) => {
    setSelectedPengurus(p);
    setModalTab('academic');
    setModalOpen(true);
  };

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
      onClick={() => handleOpenDetail(p)}
      className="border-gray-200 bg-white hover:bg-slate-50 hover:border-[#004B5F]/50 hover:shadow-md transition-all cursor-pointer group text-center flex flex-col items-center p-5 space-y-3"
    >
      <div className="relative">
        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200 bg-slate-50 group-hover:border-[#004B5F] transition-colors">
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
      onClick={() => handleOpenDetail(p)}
      className={`p-3 bg-white border ${isSekmen ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'} hover:border-[#004B5F]/50 rounded-lg text-center cursor-pointer transition-colors group relative shadow-sm hover:shadow`}
    >
      {isSekmen && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-0.5 shadow-md" title="Sekretaris Kementerian">
          <Star className="h-3 w-3" />
        </div>
      )}
      <div className="h-12 w-12 rounded-full overflow-hidden mx-auto mb-2 border border-gray-200 bg-slate-50 group-hover:border-[#004B5F]">
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
      ) : (
        <div className="space-y-12">
          {/* HIERARCHY LEVEL 1: Presma & Wapresma */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-xs uppercase font-extrabold tracking-widest text-[#004B5F] bg-[#E6F3F7] border border-[#CCE7EF] px-3 py-1 rounded-full">
              Top Level: Pimpinan Tertinggi
            </div>
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
            <div className="text-xs uppercase font-extrabold tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              Core Executive Layout
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl justify-center">
              {getPengurusByMinistryOrder(1).map(renderProfileCard)}
              {getPengurusByMinistryOrder(1).length === 0 && (
                <p className="text-slate-500 text-sm col-span-4">Data Sekretaris & Bendahara belum diisi.</p>
              )}
            </div>
            {/* Visual connector */}
            <div className="w-0.5 h-8 bg-gray-300"></div>
          </div>

          {/* HIERARCHY LEVEL 3: Rumpun Kementerian */}
          <div className="space-y-12">
            <div className="text-center">
              <div className="inline-block text-xs uppercase font-extrabold tracking-widest text-slate-500 bg-slate-100 border border-gray-200 px-3 py-1 rounded-full mb-3">
                Kementerian Sektoral
              </div>
              <p className="text-xs text-slate-500">Diklasifikasikan berdasarkan rumpun kerja operasional</p>
            </div>

            {RUMPUN_LIST.map((rumpun) => {
              const ministries = getSektoralMinistriesByRumpun(rumpun.name);
              if (ministries.length === 0) return null;

              return (
                <div key={rumpun.name} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <div className={`px-4 py-1.5 rounded-full border ${rumpun.bg} ${rumpun.border} ${rumpun.text} text-xs font-bold tracking-widest uppercase`}>
                      Rumpun: {rumpun.name}
                    </div>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {ministries.map((min) => {
                      const staff = getPengurusForMinistry(min.id);
                      
                      const pimpinan = staff.filter(p => p.jabatan.toLowerCase().includes('menteri') || p.jabatan.toLowerCase().includes('koordinator'));
                      const sekmen = staff.filter(p => p.jabatan.toLowerCase().includes('sekretaris') || p.jabatan.toLowerCase().includes('sekmen'));
                      const anggota = staff.filter(p => 
                        !p.jabatan.toLowerCase().includes('menteri') && 
                        !p.jabatan.toLowerCase().includes('koordinator') && 
                        !p.jabatan.toLowerCase().includes('sekretaris') && 
                        !p.jabatan.toLowerCase().includes('sekmen')
                      );

                      return (
                        <Card key={min.id} className="border-gray-200 bg-slate-50 overflow-hidden shadow-sm">
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
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-gray-200 pb-1">
                                        Manajerial
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {pimpinan.map(p => renderMiniProfile(p, false))}
                                        {sekmen.map(p => renderMiniProfile(p, true))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Anggota/Staf Section */}
                                  {anggota.length > 0 && (
                                    <div className="space-y-3 pt-2 border-t border-gray-200 border-dashed">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-gray-200 pb-1 flex items-center gap-2">
                                        <Users className="h-3 w-3" /> Staf / Anggota
                                      </div>
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
              );
            })}
          </div>
        </div>
      )}

      {/* Profile Detail Dialog */}
      {selectedPengurus && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#004B5F]">
              <User className="h-5 w-5 text-[#004B5F]" />
              Profil Detail Pengurus
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Informasi prestasi akademis, non-akademis, dan riwayat organisasi.
            </DialogDescription>
          </DialogHeader>
          <DialogContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-gray-200">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-white">
                {selectedPengurus.foto_url ? (
                  <img src={selectedPengurus.foto_url} alt={selectedPengurus.nama} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-7 w-7 text-slate-300" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-[#004B5F] text-base">{selectedPengurus.nama}</h3>
                <p className="text-xs text-slate-600 font-semibold">{selectedPengurus.jabatan}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Kabinet Periode {selectedPengurus.periode_tahun}</p>
              </div>
            </div>

            <Tabs value={modalTab} onValueChange={setModalTab}>
              <TabsList className="grid grid-cols-3 w-full bg-slate-100 border border-gray-200">
                <TabsTrigger value="academic" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#004B5F]">Akademik</TabsTrigger>
                <TabsTrigger value="non-academic" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#004B5F]">Non-Akademik</TabsTrigger>
                <TabsTrigger value="organizations" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#004B5F]">Organisasi</TabsTrigger>
              </TabsList>

              <TabsContent value="academic" className="space-y-3 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#004B5F] flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#004B5F]" /> Prestasi Akademik
                </h4>
                {selectedPengurus.prestasi_akademik && selectedPengurus.prestasi_akademik.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPengurus.prestasi_akademik.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-600 bg-white p-2.5 rounded border border-gray-200 flex items-start gap-2 shadow-sm">
                        <Award className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">Belum ada rekam jejak yang diinput.</p>
                )}
              </TabsContent>

              <TabsContent value="non-academic" className="space-y-3 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#004B5F] flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#004B5F]" /> Prestasi Non-Akademik
                </h4>
                {selectedPengurus.prestasi_non_akademik && selectedPengurus.prestasi_non_akademik.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPengurus.prestasi_non_akademik.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-600 bg-white p-2.5 rounded border border-gray-200 flex items-start gap-2 shadow-sm">
                        <Award className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" /> <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">Belum ada rekam jejak yang diinput.</p>
                )}
              </TabsContent>

              <TabsContent value="organizations" className="space-y-3 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#004B5F] flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-[#004B5F]" /> Riwayat Organisasi
                </h4>
                {selectedPengurus.riwayat_organisasi && selectedPengurus.riwayat_organisasi.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPengurus.riwayat_organisasi.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-600 bg-white p-2.5 rounded border border-gray-200 flex items-start gap-2 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-[#004B5F] shrink-0 mt-1.5"></span> <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">Belum ada rekam jejak yang diinput.</p>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
