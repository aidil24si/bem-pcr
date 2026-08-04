import React, { useState, useEffect } from 'react';
import { useMockDatabase } from '../../context/MockDatabaseContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { LogOut, Check, X, Shield, Users, MessageSquare, Layers, Menu, Trash2, Edit3, History, Archive } from 'lucide-react';
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

  useEffect(() => {
    if (session && !formKementerianId && kementerian.length > 0) {
      setFormKementerianId(kementerian[0].id);
    }
  }, [session, kementerian, formKementerianId]);

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
      const prestasiAkademik = formAkademik.split('\n').map(s => s.trim()).filter(Boolean);
      const prestasiNonAkademik = formNonAkademik.split('\n').map(s => s.trim()).filter(Boolean);
      const riwayatOrganisasi = formOrganisasi.split('\n').map(s => s.trim()).filter(Boolean);

      const payload = {
        nama: formNama,
        jabatan: formJabatan,
        kementerian_id: formKementerianId,
        prestasi_akademik: prestasiAkademik,
        prestasi_non_akademik: prestasiNonAkademik,
        riwayat_organisasi: riwayatOrganisasi,
        foto_url: formFotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
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
    setFormKementerianId(kementerian[0]?.id || '');
    setFormAkademik('');
    setFormNonAkademik('');
    setFormOrganisasi('');
    setFormFotoUrl('');
    setFormPeriode('2026/2027');
  };

  const handleEditPengurusClick = (p) => {
    setEditingPengurus(p);
    setFormNama(p.nama);
    setFormJabatan(p.jabatan);
    setFormKementerianId(p.kementerian_id);
    setFormAkademik(p.prestasi_akademik.join('\n'));
    setFormNonAkademik(p.prestasi_non_akademik.join('\n'));
    setFormOrganisasi(p.riwayat_organisasi.join('\n'));
    setFormFotoUrl(p.foto_url || '');
    setFormPeriode(p.periode_tahun);
  };

  const executeDeletePengurus = () => {
    if (!confirmDeletePengurus) return;
    try {
      hapusPengurus(confirmDeletePengurus.id);
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
      <div className="min-h-[80vh] flex items-center justify-center relative z-10">
        <Card className="w-full max-w-md border-gray-800 bg-gray-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Admin Login</CardTitle>
            <CardDescription>Akses khusus sistem MVP (bem@pcr.ac.id)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="bem@pcr.ac.id"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              {loginError && <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded">{loginError}</p>}
              <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors cursor-pointer">
                Masuk
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      <Dialog open={!!confirmDeletePengurus} onOpenChange={() => setConfirmDeletePengurus(null)}>
        <DialogContent className="border-gray-800 bg-gray-950">
          <DialogHeader>
            <DialogTitle className="text-white">Konfirmasi Hapus Pengurus</DialogTitle>
            <DialogDescription className="text-gray-400">
              Apakah Anda yakin ingin memberhentikan pengurus atas nama <strong className="text-purple-400">{confirmDeletePengurus?.nama}</strong> dari sistem?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setConfirmDeletePengurus(null)} className="px-4 py-2 rounded-lg bg-gray-900 text-gray-400 hover:text-white text-xs font-bold cursor-pointer transition-colors">Batal</button>
            <button onClick={executeDeletePengurus} className="px-4 py-2 rounded-lg bg-red-650 hover:bg-red-750 text-white font-bold text-xs cursor-pointer transition-colors">Hapus Permanen</button>
          </div>
        </DialogContent>
      </Dialog>

      {sidebarOpen && <div className="fixed inset-0 z-50 bg-black/80 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-900 p-6 flex flex-col justify-between transform transition-transform lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <span className="font-bold text-white text-sm">Navigasi Admin</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 cursor-pointer"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { setActiveTab('moderation'); setSidebarOpen(false); }} className={`w-full py-2.5 px-3.5 rounded-lg text-left text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'moderation' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}>
              <MessageSquare className="h-4 w-4" /> Konsolidasi Aspirasi
              {pendingAspirations.length > 0 && <span className="ml-auto bg-red-650 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingAspirations.length}</span>}
            </button>
            <button onClick={() => { setActiveTab('pengurus'); resetPengurusForm(); setSidebarOpen(false); }} className={`w-full py-2.5 px-3.5 rounded-lg text-left text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'pengurus' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}>
              <Users className="h-4 w-4" /> Kelola Pengurus
            </button>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full py-2.5 px-3.5 rounded bg-red-950/20 text-red-400 hover:bg-red-950/50 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"><LogOut className="h-4 w-4" /> Keluar</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-600/10 border border-purple-500/20 shrink-0"><Shield className="h-5 w-5 text-purple-400" /></div>
                <div>
                  <h4 className="font-bold text-white text-xs leading-none">{userNama}</h4>
                  <span className="text-[8px] font-extrabold uppercase text-purple-400 tracking-wider">Super Admin Terpusat</span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 cursor-pointer"><Menu className="h-4 w-4" /></button>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal border-t border-gray-950 pt-3">
              Akses administratif tunggal mengelola struktur kabinet dan resolusi aspirasi secara terpusat.
            </p>
            <button onClick={handleLogout} className="w-full py-2 bg-red-950/10 text-red-400 hover:bg-red-950/30 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors rounded"><LogOut className="h-3.5 w-3.5" /> Keluar Sistem</button>
          </div>
          <div className="hidden lg:flex flex-col gap-1.5 p-1.5 rounded-xl bg-gray-900/20 border border-gray-800">
            <button onClick={() => setActiveTab('moderation')} className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-colors ${activeTab === 'moderation' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}>
              <MessageSquare className="h-3.5 w-3.5" /> <span>Konsolidasi Aspirasi</span>
              {pendingAspirations.length > 0 && <span className="ml-auto bg-red-650 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingAspirations.length}</span>}
            </button>
            <button onClick={() => { setActiveTab('pengurus'); resetPengurusForm(); }} className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-colors ${activeTab === 'pengurus' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}>
              <Users className="h-3.5 w-3.5" /> <span>Kelola Pengurus BEM</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-white/5 bg-gray-950/40 space-y-1">
              <p className="text-[10px] uppercase font-extrabold text-gray-400">Aspirasi Pending</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">{pendingAspirations.length}</span>
                <MessageSquare className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-gray-950/40 space-y-1">
              <p className="text-[10px] uppercase font-extrabold text-gray-400">Kementerian</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">{kementerian.length}</span>
                <Layers className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-gray-950/40 space-y-1">
              <p className="text-[10px] uppercase font-extrabold text-gray-400">Pengurus Aktif</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">{pengurus.length}</span>
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>

          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Modul Aspirasi BEM</h3>
                  <p className="text-xs text-gray-400">Pantau dan rilis respon dari keluhan mahasiswa yang masuk.</p>
                </div>
                {selectedAspirations.length > 0 && aspirationSubTab === 'pending' && (
                  <button onClick={() => setIsConsolidating(true)} className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition-colors">
                    <Layers className="h-4 w-4" /> Konsolidasikan ({selectedAspirations.length})
                  </button>
                )}
              </div>

              {/* Aspirasi Sub-Tabs */}
              <div className="flex gap-2 border-b border-gray-800 pb-px">
                <button
                  onClick={() => setAspirationSubTab('pending')}
                  className={`py-2 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer border-b-2 transition-colors ${aspirationSubTab === 'pending' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  <History className="h-3.5 w-3.5" /> Aspirasi Masuk ({pendingAspirations.length})
                </button>
                <button
                  onClick={() => setAspirationSubTab('history')}
                  className={`py-2 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer border-b-2 transition-colors ${aspirationSubTab === 'history' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  <Archive className="h-3.5 w-3.5" /> Terkonsolidasi ({consolidatedAspirations.length})
                </button>
              </div>

              {aspirationSubTab === 'pending' && (
                <>
                  {pendingAspirations.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl bg-gray-950/10">
                      <Check className="h-10 w-10 mx-auto text-emerald-600 mb-3" />
                      <h4 className="font-bold text-white text-sm">Inbox Bersih!</h4>
                      <p className="text-xs text-gray-500 mt-1">Tidak ada aspirasi baru yang perlu direspon.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pendingAspirations.map((a) => {
                        const isSelected = selectedAspirations.includes(a.id);
                        return (
                          <Card key={a.id} onClick={() => toggleAspirationSelection(a.id)} className={`border-gray-800 bg-gray-900/30 cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-purple-600 border-purple-600 bg-purple-950/10' : 'hover:bg-gray-900/50'}`}>
                            <CardHeader className="pb-3 flex flex-row justify-between gap-4">
                              <div className="space-y-2">
                                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">{a.tipe_isu}</span>
                                <CardTitle className="text-sm text-white">Dari: {a.identitas ? `${a.identitas.nama} (${a.identitas.nim})` : 'Anonim'}</CardTitle>
                              </div>
                              <input type="checkbox" checked={isSelected} readOnly className="h-4 w-4 rounded border-gray-800 text-purple-600 focus:ring-purple-500 bg-gray-950 mt-1 cursor-pointer" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-xs text-gray-300 bg-gray-950/40 p-3 rounded-lg border border-gray-900">{a.deskripsi}</p>
                              {a.bukti_url && (
                                <div className="rounded-lg overflow-hidden border border-gray-900 max-h-40 bg-black">
                                  <img src={a.bukti_url} alt="Bukti" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <p className="text-[9px] text-gray-500">{new Date(a.created_at).toLocaleString('id-ID')}</p>
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
                    <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl bg-gray-950/10">
                      <Archive className="h-10 w-10 mx-auto text-gray-600 mb-3" />
                      <h4 className="font-bold text-gray-400 text-sm">Belum Ada Rekam Jejak</h4>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {consolidatedAspirations.map((a) => (
                        <Card key={a.id} className="border-gray-800 bg-gray-950/30 opacity-70">
                          <CardHeader className="pb-3 flex flex-row justify-between gap-4">
                            <div className="space-y-2">
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Terkonsolidasi</span>
                              <CardTitle className="text-sm text-gray-400">Dari: {a.identitas ? a.identitas.nama : 'Anonim'}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-xs text-gray-500 line-clamp-3">{a.deskripsi}</p>
                            <div className="bg-indigo-950/20 border border-indigo-900/30 p-2.5 rounded text-[10px] text-indigo-300">
                              <span className="font-bold block mb-1">Rilis Advokasi:</span>
                              {getRilisTitle(a.rilis_id)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              <Dialog open={isConsolidating} onOpenChange={setIsConsolidating}>
                <DialogContent className="border-gray-800 bg-gray-950">
                  <DialogHeader>
                    <DialogTitle className="text-white">Terbitkan Rilis Advokasi</DialogTitle>
                    <DialogDescription className="text-gray-400">Merangkum {selectedAspirations.length} aspirasi yang dicentang menjadi satu rilis resmi.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSaveRelease} className="space-y-4 mt-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Kategori Isu</label>
                      <select value={releaseCategory} onChange={e => setReleaseCategory(e.target.value)} className="w-full mt-1 rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none">
                        <option value="Fasilitas">Fasilitas Kampus</option>
                        <option value="Akademik & Birokrasi">Akademik & Birokrasi</option>
                        <option value="Layanan & Ormawa">Layanan & Ormawa</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Judul Rilis</label>
                      <input type="text" required value={releaseTitle} onChange={e => setReleaseTitle(e.target.value)} placeholder="Contoh: Perbaikan AC H.3.1" className="w-full mt-1 rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Hasil Advokasi / Tindakan BEM</label>
                      <textarea required rows={5} value={releaseDiscussion} onChange={e => setReleaseDiscussion(e.target.value)} placeholder="Tuliskan respon resmi BEM yang telah didiskusikan secara offline..." className="w-full mt-1 rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none resize-none" />
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <button type="button" onClick={() => setIsConsolidating(false)} className="px-4 py-2 bg-gray-900 text-gray-400 rounded-lg text-xs font-bold cursor-pointer transition-colors hover:text-white">Batal</button>
                      <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">Terbitkan Sekarang</button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'pengurus' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-5">
                <Card className="border-gray-800 bg-gray-900/30">
                  <CardHeader>
                    <CardTitle className="text-white text-base">{editingPengurus ? 'Edit Data Anggota' : 'Daftarkan Anggota Baru'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSavePengurus} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Lengkap</label>
                        <input type="text" required value={formNama} onChange={e => setFormNama(e.target.value)} className="w-full mt-1 bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white rounded-lg focus:border-purple-500 focus:outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Jabatan</label>
                          <input type="text" required value={formJabatan} onChange={e => setFormJabatan(e.target.value)} placeholder="cth: Sekmen" className="w-full mt-1 bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white rounded-lg focus:border-purple-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Kementerian</label>
                          <select required value={formKementerianId} onChange={e => setFormKementerianId(e.target.value)} className="w-full mt-1 bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white rounded-lg focus:border-purple-500 focus:outline-none">
                            <option value="">-- Pilih --</option>
                            {kementerian.map(k => <option key={k.id} value={k.id}>{k.nama_kementerian}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Periode</label>
                          <input type="text" required value={formPeriode} onChange={e => setFormPeriode(e.target.value)} className="w-full mt-1 bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white rounded-lg focus:border-purple-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Foto URL (Opsional)</label>
                          <input type="text" value={formFotoUrl} onChange={e => setFormFotoUrl(e.target.value)} className="w-full mt-1 bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white rounded-lg focus:border-purple-500 focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Prestasi Akademik</label>
                        <textarea rows={2} value={formAkademik} onChange={e => setFormAkademik(e.target.value)} placeholder="Pisahkan per baris" className="w-full mt-1 bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white rounded-lg focus:border-purple-500 focus:outline-none resize-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Prestasi Non-Akademik</label>
                        <textarea rows={2} value={formNonAkademik} onChange={e => setFormNonAkademik(e.target.value)} placeholder="Pisahkan per baris" className="w-full mt-1 bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white rounded-lg focus:border-purple-500 focus:outline-none resize-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Riwayat Organisasi</label>
                        <textarea rows={2} value={formOrganisasi} onChange={e => setFormOrganisasi(e.target.value)} placeholder="Pisahkan per baris" className="w-full mt-1 bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white rounded-lg focus:border-purple-500 focus:outline-none resize-none" />
                      </div>
                      {actionError && <p className="text-xs text-red-400 bg-red-950/40 p-2.5 border border-red-800 rounded">{actionError}</p>}
                      {actionSuccess && <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2.5 border border-emerald-800 rounded">{actionSuccess}</p>}
                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-xs cursor-pointer transition-colors">{editingPengurus ? 'Update Data' : 'Daftarkan Anggota'}</button>
                        {editingPengurus && <button type="button" onClick={resetPengurusForm} className="py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-bold cursor-pointer transition-colors">Batal</button>}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="xl:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Daftar Pengurus Kabinet</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                  {pengurus.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-gray-800 bg-gray-900/30 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 truncate">
                        <div className="h-10 w-10 rounded-full bg-gray-800 shrink-0 border border-gray-700 overflow-hidden">
                          {p.foto_url ? <img src={p.foto_url} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5 m-auto mt-2.5 text-gray-500" />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm truncate" title={p.nama}>{p.nama}</div>
                          <div className="text-[10px] text-purple-400 font-semibold truncate" title={p.jabatan}>{p.jabatan}</div>
                          <div className="text-[9px] text-gray-500 mt-0.5 truncate">{getMinistryName(p.kementerian_id)}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => handleEditPengurusClick(p)} className="p-1.5 rounded bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white transition-colors cursor-pointer"><Edit3 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setConfirmDeletePengurus(p)} className="p-1.5 rounded bg-gray-800 hover:bg-red-950 text-gray-300 hover:text-red-400 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {pengurus.length === 0 && <p className="text-xs text-gray-500 italic col-span-2">Belum ada pengurus terdaftar.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
