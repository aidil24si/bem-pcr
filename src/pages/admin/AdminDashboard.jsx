import React, { useState, useEffect } from 'react';
import { useMockDatabase } from '../../context/MockDatabaseContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { LogOut, Check, X, Shield, Users, User, MessageSquare, Layers, Menu, Trash2, Edit3, History, Archive } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent } from '../../components/ui/Dialog';
import Toast from '../../components/ui/Toast';

export default function AdminDashboard() {
  useDocumentTitle('Dasbor Admin');
  
  // Context Data
  const {
    session,
    login,
    logout,
    kementerian,
    pengurus,
    aspirasi,
    rilisAdvokasi,
    konsolidasiAspirasi,
    tambahPengurus,
    editPengurus,
    hapusPengurus
  } = useMockDatabase();

  // Toast & Modal States
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [confirmDeletePengurus, setConfirmDeletePengurus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Navigation State
  const [activeTab, setActiveTab] = useState('moderation');
  const [aspirationSubTab, setAspirationSubTab] = useState('pending'); // 'pending' | 'history'

  // Consolidation States
  const [selectedAspirations, setSelectedAspirations] = useState([]);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [releaseTitle, setReleaseTitle] = useState('');
  const [releaseCategory, setReleaseCategory] = useState('Fasilitas');
  const [releaseDiscussion, setReleaseDiscussion] = useState('');

  // Form States (for creating/editing Pengurus)
  const [editingPengurus, setEditingPengurus] = useState(null);
  const [formNama, setFormNama] = useState('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formKementerianId, setFormKementerianId] = useState('');
  const [formAkademik, setFormAkademik] = useState('');
  const [formNonAkademik, setFormNonAkademik] = useState('');
  const [formOrganisasi, setFormOrganisasi] = useState('');
  const [formFotoUrl, setFormFotoUrl] = useState('');
  const [formPeriode, setFormPeriode] = useState('2026/2027');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const pendingAspirations = aspirasi.filter(a => !a.rilis_id);
  const consolidatedAspirations = aspirasi.filter(a => !!a.rilis_id);
  const userRole = session?.user?.role;
  const userNama = session?.user?.nama || 'Admin BEM';



  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      login(email, password);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Consolidation Handlers
  const toggleAspirationSelection = (id) => {
    setSelectedAspirations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveRelease = (e) => {
    e.preventDefault();
    if (selectedAspirations.length === 0) {
      setToastType('error');
      setToastMsg('Pilih minimal satu aspirasi untuk dikonsolidasikan.');
      return;
    }
    if (!releaseTitle.trim() || !releaseDiscussion.trim()) {
      setToastType('error');
      setToastMsg('Harap lengkapi semua bidang form rilis.');
      return;
    }

    try {
      konsolidasiAspirasi(selectedAspirations, {
        judul_isu: releaseTitle,
        kategori_isu: releaseCategory,
        pembahasan_offline: releaseDiscussion,
      });

      setToastType('success');
      setToastMsg('Rilis Hasil Advokasi berhasil diterbitkan.');
      
      setReleaseTitle('');
      setReleaseDiscussion('');
      setSelectedAspirations([]);
      setIsConsolidating(false);
      setAspirationSubTab('history');
    } catch (err) {
      setToastType('error');
      setToastMsg(`Gagal membuat rilis: ${err.message}`);
    }
  };

  // Pengurus Handlers
  const handleSavePengurus = (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    try {
      const trimmedNama = formNama.trim();
      const trimmedJabatan = formJabatan.trim();
      
      if (!trimmedNama || !trimmedJabatan || !formKementerianId) {
        throw new Error("Nama, Jabatan, dan Kementerian tidak boleh kosong atau hanya berisi spasi.");
      }

      const prestasiAkademik = formAkademik.split('\n').map(s => s.trim()).filter(Boolean);
      const prestasiNonAkademik = formNonAkademik.split('\n').map(s => s.trim()).filter(Boolean);
      const riwayatOrganisasi = formOrganisasi.split('\n').map(s => s.trim()).filter(Boolean);

      const payload = {
        nama: trimmedNama,
        jabatan: trimmedJabatan,
        kementerian_id: formKementerianId,
        prestasi_akademik: prestasiAkademik,
        prestasi_non_akademik: prestasiNonAkademik,
        riwayat_organisasi: riwayatOrganisasi,
        foto_url: formFotoUrl.trim() !== '' ? formFotoUrl.trim() : null,
        periode_tahun: formPeriode,
      };

      if (editingPengurus) {
        editPengurus(editingPengurus.id, payload);
        setActionSuccess('Data pengurus berhasil diperbarui!');
      } else {
        tambahPengurus(payload);
        setActionSuccess('Pengurus baru berhasil didaftarkan!');
      }

      resetPengurusForm();
    } catch (err) {
      setActionError(err.message || 'Gagal menyimpan data pengurus.');
    }
  };

  const resetPengurusForm = () => {
    setEditingPengurus(null);
    setFormNama('');
    setFormJabatan('');
    setFormKementerianId('');
    setFormAkademik('');
    setFormNonAkademik('');
    setFormOrganisasi('');
    setFormFotoUrl('');
    setFormPeriode('2026/2027');
    setActionSuccess('');
    setActionError('');
  };

  const handleEditPengurusClick = (p) => {
    setEditingPengurus(p);
    setFormNama(p.nama);
    setFormJabatan(p.jabatan);
    setFormKementerianId(p.kementerian_id);
    setFormAkademik((p.prestasi_akademik || []).join('\n'));
    setFormNonAkademik((p.prestasi_non_akademik || []).join('\n'));
    setFormOrganisasi((p.riwayat_organisasi || []).join('\n'));
    setFormFotoUrl(p.foto_url || '');
    setFormPeriode(p.periode_tahun);
    setActionSuccess('');
    setActionError('');
  };

  const executeDeletePengurus = () => {
    if (!confirmDeletePengurus) return;
    try {
      hapusPengurus(confirmDeletePengurus.id);
      
      if (editingPengurus && editingPengurus.id === confirmDeletePengurus.id) {
        resetPengurusForm();
      }

      setToastType('success');
      setToastMsg(`Data pengurus ${confirmDeletePengurus.nama} berhasil dihapus.`);
    } catch (err) {
      setToastType('error');
      setToastMsg(`Gagal menghapus: ${err.message}`);
    } finally {
      setConfirmDeletePengurus(null);
    }
  };

  const getMinistryName = (id) => {
    const found = kementerian.find(k => k.id === id);
    return found ? found.nama_kementerian : 'Tidak Diketahui';
  };

  const getRilisTitle = (rilisId) => {
    const found = rilisAdvokasi.find(r => r.id === rilisId);
    return found ? found.judul_isu : 'Rilis Tidak Diketahui';
  };

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center relative z-10 px-4">
        <Card className="w-full max-w-md border-gray-200 bg-white shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-[#E6F3F7] p-3 rounded-full mb-2 border border-[#CCE7EF]">
              <Shield className="h-6 w-6 text-[#004B5F]" />
            </div>
            <CardTitle className="text-[#004B5F] text-2xl font-extrabold">Admin Portal</CardTitle>
            <CardDescription className="text-slate-500">Akses khusus sistem MVP BEM</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#004B5F]">Email Admin</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-slate-700 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none transition-all"
                  placeholder="bem@pcr.ac.id"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#004B5F]">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-slate-700 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              {loginError && <p className="text-xs text-[#EE152A] bg-red-50 p-2.5 rounded-lg border border-red-200 font-medium text-center">{loginError}</p>}
              <button type="submit" className="w-full py-3 bg-[#004B5F] hover:bg-[#003847] text-white font-bold rounded-xl shadow-lg shadow-[#004B5F]/20 transition-all cursor-pointer mt-2">
                Masuk Sistem
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative bg-slate-50 min-h-screen pb-12">
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* MODAL HAPUS PENGURUS */}
      <Dialog open={!!confirmDeletePengurus} onOpenChange={() => setConfirmDeletePengurus(null)}>
        <DialogContent className="border-gray-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#004B5F]">Konfirmasi Hapus Pengurus</DialogTitle>
            <DialogDescription className="text-slate-500">
              Apakah Anda yakin ingin memberhentikan pengurus atas nama <strong className="text-[#EE152A]">{confirmDeletePengurus?.nama}</strong> dari sistem?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setConfirmDeletePengurus(null)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-[#004B5F] hover:bg-slate-200 text-xs font-bold cursor-pointer transition-colors">Batal</button>
            <button onClick={executeDeletePengurus} className="px-5 py-2.5 rounded-xl bg-[#EE152A] hover:bg-[#C20F20] text-white font-bold text-xs cursor-pointer shadow-lg shadow-[#EE152A]/20 transition-all">Hapus Permanen</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 p-6 flex flex-col justify-between transform transition-transform duration-300 shadow-xl lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#E6F3F7] p-1.5 rounded border border-[#CCE7EF]">
                <Shield className="h-5 w-5 text-[#004B5F]" />
              </div>
              <span className="font-extrabold text-[#004B5F] text-sm tracking-wide">Admin BEM</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-[#004B5F] cursor-pointer bg-slate-50 p-1.5 rounded-md"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { setActiveTab('moderation'); setSidebarOpen(false); }} className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-3 cursor-pointer transition-all ${activeTab === 'moderation' ? 'bg-[#004B5F] text-white shadow-md' : 'text-slate-600 hover:text-[#004B5F] hover:bg-slate-50'}`}>
              <MessageSquare className="h-4 w-4" /> Konsolidasi Aspirasi
              {pendingAspirations.length > 0 && <span className="ml-auto bg-[#EE152A] text-white text-[10px] px-2 py-0.5 rounded-full">{pendingAspirations.length}</span>}
            </button>
            <button onClick={() => { setActiveTab('pengurus'); resetPengurusForm(); setSidebarOpen(false); }} className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-3 cursor-pointer transition-all ${activeTab === 'pengurus' ? 'bg-[#004B5F] text-white shadow-md' : 'text-slate-600 hover:text-[#004B5F] hover:bg-slate-50'}`}>
              <Users className="h-4 w-4" /> Kelola Pengurus
            </button>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full py-3 px-4 rounded-xl bg-red-50 text-[#EE152A] hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"><LogOut className="h-4 w-4" /> Keluar Sistem</button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* DESKTOP SIDEBAR (Static) */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 hidden lg:block">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#E6F3F7] border border-[#CCE7EF] shrink-0">
                <Shield className="h-6 w-6 text-[#004B5F]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#004B5F] text-sm">{userNama}</h4>
                <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Super Admin Terpusat</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed border-t border-gray-100 pt-4">
              Akses administratif tunggal mengelola struktur kabinet dan resolusi aspirasi secara terpusat.
            </p>
            <button onClick={handleLogout} className="w-full py-2.5 bg-red-50 text-[#EE152A] hover:bg-red-100 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors rounded-xl border border-red-100"><LogOut className="h-3.5 w-3.5" /> Keluar Sistem</button>
          </div>
          
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <button onClick={() => setActiveTab('moderation')} className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-3 cursor-pointer transition-all ${activeTab === 'moderation' ? 'bg-[#004B5F] text-white shadow-md' : 'text-slate-600 hover:text-[#004B5F] hover:bg-slate-50'}`}>
              <MessageSquare className="h-4 w-4" /> <span>Konsolidasi Aspirasi</span>
              {pendingAspirations.length > 0 && <span className="ml-auto bg-[#EE152A] text-white text-[10px] px-2 py-0.5 rounded-full">{pendingAspirations.length}</span>}
            </button>
            <button onClick={() => { setActiveTab('pengurus'); resetPengurusForm(); }} className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-3 cursor-pointer transition-all ${activeTab === 'pengurus' ? 'bg-[#004B5F] text-white shadow-md' : 'text-slate-600 hover:text-[#004B5F] hover:bg-slate-50'}`}>
              <Users className="h-4 w-4" /> <span>Kelola Pengurus BEM</span>
            </button>
          </div>
        </div>

        {/* MOBILE HEADER (Nav trigger) */}
        <div className="lg:hidden col-span-1 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#004B5F]" />
            <h4 className="font-extrabold text-[#004B5F] text-sm">Dashboard Admin</h4>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-[#004B5F] bg-slate-50 p-2 rounded-lg border border-gray-200 cursor-pointer"><Menu className="h-4 w-4" /></button>
        </div>

        <div className="lg:col-span-9 space-y-8">
          {/* STATS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col gap-2">
              <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Aspirasi Pending</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-[#004B5F]">{pendingAspirations.length}</span>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><MessageSquare className="h-5 w-5" /></div>
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col gap-2">
              <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Kementerian</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-[#004B5F]">{kementerian.length}</span>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Layers className="h-5 w-5" /></div>
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col gap-2">
              <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Pengurus Aktif</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-[#004B5F]">{pengurus.length}</span>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Users className="h-5 w-5" /></div>
              </div>
            </div>
          </div>

          {/* TAB 1: MODERASI ASPIRASI */}
          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#004B5F]">Modul Aspirasi</h3>
                  <p className="text-sm text-slate-500 mt-1">Pantau dan rilis respon dari keluhan mahasiswa yang masuk.</p>
                </div>
                {selectedAspirations.length > 0 && aspirationSubTab === 'pending' && (
                  <button onClick={() => setIsConsolidating(true)} className="py-3 px-6 rounded-xl bg-[#004B5F] hover:bg-[#003847] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#004B5F]/20 cursor-pointer transition-all hover:-translate-y-0.5">
                    <Layers className="h-4 w-4" /> Konsolidasikan ({selectedAspirations.length})
                  </button>
                )}
              </div>

              {/* Aspirasi Sub-Tabs */}
              <div className="flex gap-4 border-b border-gray-200 pb-px">
                <button
                  onClick={() => setAspirationSubTab('pending')}
                  className={`py-3 px-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer border-b-2 transition-colors ${aspirationSubTab === 'pending' ? 'border-[#004B5F] text-[#004B5F]' : 'border-transparent text-slate-400 hover:text-[#004B5F]'}`}
                >
                  <History className="h-4 w-4" /> Aspirasi Masuk ({pendingAspirations.length})
                </button>
                <button
                  onClick={() => setAspirationSubTab('history')}
                  className={`py-3 px-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer border-b-2 transition-colors ${aspirationSubTab === 'history' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-emerald-700'}`}
                >
                  <Archive className="h-4 w-4" /> Terkonsolidasi ({consolidatedAspirations.length})
                </button>
              </div>

              {aspirationSubTab === 'pending' && (
                <>
                  {pendingAspirations.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl bg-white shadow-sm">
                      <div className="bg-emerald-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                        <Check className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h4 className="font-extrabold text-[#004B5F] text-lg">Inbox Bersih!</h4>
                      <p className="text-sm text-slate-500 mt-2">Tidak ada aspirasi baru yang perlu direspon.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pendingAspirations.map((a) => {
                        const isSelected = selectedAspirations.includes(a.id);
                        return (
                          <Card key={a.id} onClick={() => toggleAspirationSelection(a.id)} className={`border-gray-200 bg-white cursor-pointer transition-all shadow-sm ${isSelected ? 'ring-2 ring-[#004B5F] border-[#004B5F] bg-[#E6F3F7]/50' : 'hover:border-[#004B5F]/40 hover:shadow-md'}`}>
                            <CardHeader className="pb-4 border-b border-gray-100 flex flex-row justify-between gap-4">
                              <div className="space-y-2">
                                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border bg-slate-100 text-slate-600 border-gray-200 tracking-wider">
                                  {a.tipe_isu}
                                </span>
                                <CardTitle className="text-sm text-[#004B5F] pt-1">
                                  Dari: {a.identitas ? <span className="font-bold">{a.identitas.nama} ({a.identitas.nim})</span> : <span className="italic text-slate-400">Anonim</span>}
                                </CardTitle>
                              </div>
                              <input type="checkbox" checked={isSelected} readOnly className="h-5 w-5 rounded border-gray-300 text-[#004B5F] focus:ring-[#004B5F] mt-1 cursor-pointer" />
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-gray-100 leading-relaxed italic">"{a.deskripsi}"</p>
                              {a.bukti_url && (
                                <div className="rounded-xl overflow-hidden border border-gray-200 max-h-48 bg-slate-100 shadow-sm">
                                  <img src={a.bukti_url} alt="Bukti" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(a.created_at).toLocaleString('id-ID')}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {aspirationSubTab === 'history' && (
                <>
                  {consolidatedAspirations.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl bg-white shadow-sm">
                      <Archive className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                      <h4 className="font-extrabold text-slate-400 text-lg">Belum Ada Rekam Jejak</h4>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {consolidatedAspirations.map((a) => (
                        <Card key={a.id} className="border-gray-200 bg-white shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                          <CardHeader className="pb-3 flex flex-row justify-between gap-4 border-b border-gray-100">
                            <div className="space-y-2">
                              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 tracking-wider">
                                Terkonsolidasi
                              </span>
                              <CardTitle className="text-sm text-slate-500 pt-1">
                                Dari: {a.identitas ? a.identitas.nama : 'Anonim'}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-4">
                            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">"{a.deskripsi}"</p>
                            <div className="bg-[#E6F3F7] border border-[#CCE7EF] p-3 rounded-xl text-[11px] text-[#004B5F]">
                              <span className="font-extrabold block mb-1 uppercase tracking-wider">Rilis Advokasi:</span>
                              {getRilisTitle(a.rilis_id)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* MODAL KONSOLIDASI */}
              <Dialog open={isConsolidating} onOpenChange={setIsConsolidating}>
                <DialogContent className="border-gray-200 bg-white sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle className="text-[#004B5F] text-xl font-extrabold">Terbitkan Rilis Advokasi</DialogTitle>
                    <DialogDescription className="text-slate-500">Merangkum {selectedAspirations.length} aspirasi yang dicentang menjadi satu rilis resmi.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSaveRelease} className="space-y-5 mt-4">
                    <div>
                      <label className="text-[11px] font-extrabold text-[#004B5F] uppercase tracking-wider">Kategori Isu</label>
                      <select value={releaseCategory} onChange={e => setReleaseCategory(e.target.value)} className="w-full mt-1.5 rounded-xl bg-slate-50 border border-gray-300 px-4 py-3 text-sm text-slate-700 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none">
                        <option value="Fasilitas">Fasilitas Kampus</option>
                        <option value="Akademik & Birokrasi">Akademik & Birokrasi</option>
                        <option value="Layanan & Ormawa">Layanan & Ormawa</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold text-[#004B5F] uppercase tracking-wider">Judul Rilis</label>
                      <input type="text" required value={releaseTitle} onChange={e => setReleaseTitle(e.target.value)} placeholder="Contoh: Perbaikan AC H.3.1" className="w-full mt-1.5 rounded-xl bg-slate-50 border border-gray-300 px-4 py-3 text-sm text-slate-700 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold text-[#004B5F] uppercase tracking-wider">Hasil Advokasi / Tindakan BEM</label>
                      <textarea required rows={5} value={releaseDiscussion} onChange={e => setReleaseDiscussion(e.target.value)} placeholder="Tuliskan respon resmi BEM yang telah didiskusikan secara offline..." className="w-full mt-1.5 rounded-xl bg-slate-50 border border-gray-300 px-4 py-3 text-sm text-slate-700 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none resize-none" />
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                      <button type="button" onClick={() => setIsConsolidating(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-colors hover:text-[#004B5F] hover:bg-slate-200">Batal</button>
                      <button type="submit" className="px-5 py-2.5 bg-[#004B5F] hover:bg-[#003847] text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-[#004B5F]/20 transition-all hover:-translate-y-0.5">Terbitkan Sekarang</button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* TAB 2: PENGURUS */}
          {activeTab === 'pengurus' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* FORM PENGURUS */}
              <div className="xl:col-span-5">
                <Card className="border-gray-200 bg-white shadow-lg sticky top-24">
                  <CardHeader className="bg-slate-50 border-b border-gray-100 rounded-t-xl pb-4">
                    <CardTitle className="text-[#004B5F] text-lg font-extrabold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {editingPengurus ? 'Edit Data Anggota' : 'Daftarkan Anggota Baru'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleSavePengurus} className="space-y-5">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                        <input type="text" required value={formNama} onChange={e => setFormNama(e.target.value)} className="w-full mt-1.5 bg-white border border-gray-300 px-3 py-2.5 text-sm text-slate-700 rounded-lg focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none shadow-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Jabatan</label>
                          <input type="text" required value={formJabatan} onChange={e => setFormJabatan(e.target.value)} placeholder="cth: Sekmen" className="w-full mt-1.5 bg-white border border-gray-300 px-3 py-2.5 text-sm text-slate-700 rounded-lg focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none shadow-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Kementerian</label>
                          <select required value={formKementerianId} onChange={e => setFormKementerianId(e.target.value)} className="w-full mt-1.5 bg-white border border-gray-300 px-3 py-2.5 text-sm text-slate-700 rounded-lg focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none shadow-sm">
                            <option value="">-- Pilih --</option>
                            {kementerian.map(k => <option key={k.id} value={k.id}>{k.nama_kementerian}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Periode</label>
                          <input type="text" required value={formPeriode} onChange={e => setFormPeriode(e.target.value)} className="w-full mt-1.5 bg-white border border-gray-300 px-3 py-2.5 text-sm text-slate-700 rounded-lg focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none shadow-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Foto URL (Opsional)</label>
                          <input type="text" value={formFotoUrl} onChange={e => setFormFotoUrl(e.target.value)} className="w-full mt-1.5 bg-white border border-gray-300 px-3 py-2.5 text-sm text-slate-700 rounded-lg focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none shadow-sm" placeholder="https://..." />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Prestasi Akademik</label>
                        <textarea rows={2} value={formAkademik} onChange={e => setFormAkademik(e.target.value)} placeholder="Pisahkan per baris" className="w-full mt-1.5 bg-white border border-gray-300 px-3 py-2.5 text-sm text-slate-700 rounded-lg focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none resize-none shadow-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Prestasi Non-Akademik</label>
                        <textarea rows={2} value={formNonAkademik} onChange={e => setFormNonAkademik(e.target.value)} placeholder="Pisahkan per baris" className="w-full mt-1.5 bg-white border border-gray-300 px-3 py-2.5 text-sm text-slate-700 rounded-lg focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none resize-none shadow-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Riwayat Organisasi</label>
                        <textarea rows={2} value={formOrganisasi} onChange={e => setFormOrganisasi(e.target.value)} placeholder="Pisahkan per baris" className="w-full mt-1.5 bg-white border border-gray-300 px-3 py-2.5 text-sm text-slate-700 rounded-lg focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none resize-none shadow-sm" />
                      </div>
                      
                      {actionError && <p className="text-xs text-[#EE152A] bg-red-50 p-3 border border-red-200 rounded-lg font-medium">{actionError}</p>}
                      {actionSuccess && <p className="text-xs text-emerald-700 bg-emerald-50 p-3 border border-emerald-200 rounded-lg font-medium">{actionSuccess}</p>}
                      
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button type="submit" className="flex-1 py-3 bg-[#004B5F] hover:bg-[#003847] text-white font-bold rounded-xl text-sm cursor-pointer shadow-lg shadow-[#004B5F]/20 transition-all hover:-translate-y-0.5">
                          {editingPengurus ? 'Simpan Perubahan' : 'Daftarkan Anggota'}
                        </button>
                        {editingPengurus && (
                          <button type="button" onClick={resetPengurusForm} className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold cursor-pointer transition-colors">
                            Batal
                          </button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* LIST PENGURUS */}
              <div className="xl:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-[#004B5F] uppercase tracking-wider">Daftar Pengurus Kabinet</h4>
                  <span className="text-xs font-bold bg-[#E6F3F7] text-[#004B5F] px-3 py-1 rounded-full border border-[#CCE7EF]">Total: {pengurus.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar pb-10">
                  {pengurus.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-3 truncate">
                        <div className="h-12 w-12 rounded-full bg-slate-100 shrink-0 border-2 border-gray-200 group-hover:border-[#004B5F] transition-colors overflow-hidden">
                          {p.foto_url ? <img src={p.foto_url} alt="" className="h-full w-full object-cover" /> : <User className="h-6 w-6 m-auto mt-2.5 text-slate-400" />}
                        </div>
                        <div className="truncate">
                          <div className="font-extrabold text-[#004B5F] text-sm truncate" title={p.nama}>{p.nama}</div>
                          <div className="text-[11px] text-slate-500 font-bold truncate mt-0.5" title={p.jabatan}>{p.jabatan}</div>
                          <div className="text-[10px] text-slate-400 mt-1 truncate px-2 py-0.5 bg-slate-50 rounded inline-block">{getMinistryName(p.kementerian_id)}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => handleEditPengurusClick(p)} className="p-2 rounded-lg bg-slate-50 hover:bg-[#E6F3F7] text-slate-400 hover:text-[#004B5F] border border-gray-200 hover:border-[#CCE7EF] transition-colors cursor-pointer shadow-sm"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => setConfirmDeletePengurus(p)} className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-[#EE152A] border border-gray-200 hover:border-red-200 transition-colors cursor-pointer shadow-sm"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                  {pengurus.length === 0 && (
                    <div className="col-span-2 text-center py-12 border border-dashed border-gray-300 rounded-2xl bg-white">
                      <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 font-medium">Belum ada pengurus terdaftar.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
