import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Plus, Trash2, Edit3, Check, X, Megaphone, BookOpen } from 'lucide-react';

const KATEGORI_OPTIONS = ['Kampus', 'Internal', 'Opini', 'Rilis'];

export default function ManageBerita() {
  const [beritaList, setBeritaList] = useState([]);
  const [annList, setAnnList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Berita
  const [editingBeritaId, setEditingBeritaId] = useState(null);
  const [judul, setJudul] = useState('');
  const [ringkasan, setRingkasan] = useState('');
  const [isi, setIsi] = useState('');
  const [kategori, setKategori] = useState(KATEGORI_OPTIONS[0]);
  const [gambarUrl, setGambarUrl] = useState('');
  const [pembuat, setPembuat] = useState('');

  // Form Pengumuman
  const [editingAnnId, setEditingAnnId] = useState(null);
  const [annJudul, setAnnJudul] = useState('');
  const [annIsi, setAnnIsi] = useState('');
  const [annAktif, setAnnAktif] = useState(true);
  const [annTipe, setAnnTipe] = useState('info'); // info, warning, danger

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: b } = await supabase.from('berita').select('*').order('created_at', { ascending: false });
    const { data: a } = await supabase.from('pengumuman').select('*');
    setBeritaList(b || []);
    setAnnList(a || []);
    setLoading(false);
  };

  // ── BERITA HANDLERS ──
  const handleSaveBerita = async (e) => {
    e.preventDefault();
    if (!judul || !ringkasan || !isi || !pembuat) {
      setErrorMsg('Wajib mengisi semua field berita.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      judul,
      ringkasan,
      isi,
      kategori,
      gambar_url: gambarUrl || null,
      pembuat,
    };

    try {
      if (editingBeritaId) {
        await supabase.from('berita').update(payload).eq('id', editingBeritaId);
        setSuccessMsg('Berita berhasil diperbarui.');
      } else {
        await supabase.from('berita').insert([payload]);
        setSuccessMsg('Berita baru berhasil ditambahkan.');
      }
      resetBeritaForm();
      fetchData();
    } catch (err) {
      setErrorMsg('Gagal menyimpan berita.');
    }
  };

  const handleEditBerita = (b) => {
    setEditingBeritaId(b.id);
    setJudul(b.judul);
    setRingkasan(b.ringkasan);
    setIsi(b.isi);
    setKategori(b.kategori);
    setGambarUrl(b.gambar_url || '');
    setPembuat(b.pembuat);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleDeleteBerita = async (id) => {
    await supabase.from('berita').delete().eq('id', id);
    setSuccessMsg('Berita berhasil dihapus.');
    fetchData();
  };

  const resetBeritaForm = () => {
    setEditingBeritaId(null);
    setJudul('');
    setRingkasan('');
    setIsi('');
    setKategori(KATEGORI_OPTIONS[0]);
    setGambarUrl('');
    setPembuat('');
  };

  // ── PENGUMUMAN HANDLERS ──
  const handleSaveAnn = async (e) => {
    e.preventDefault();
    if (!annJudul || !annIsi) {
      setErrorMsg('Wajib mengisi judul dan isi pengumuman.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      judul: annJudul,
      isi: annIsi,
      status_aktif: annAktif,
      tipe: annTipe,
    };

    try {
      if (editingAnnId) {
        await supabase.from('pengumuman').update(payload).eq('id', editingAnnId);
        setSuccessMsg('Pengumuman berhasil diperbarui.');
      } else {
        await supabase.from('pengumuman').insert([payload]);
        setSuccessMsg('Pengumuman baru berhasil diaktifkan.');
      }
      resetAnnForm();
      fetchData();
    } catch (err) {
      setErrorMsg('Gagal menyimpan pengumuman.');
    }
  };

  const handleEditAnn = (a) => {
    setEditingAnnId(a.id);
    setAnnJudul(a.judul);
    setAnnIsi(a.isi);
    setAnnAktif(a.status_aktif);
    setAnnTipe(a.tipe);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleDeleteAnn = async (id) => {
    await supabase.from('pengumuman').delete().eq('id', id);
    setSuccessMsg('Pengumuman berhasil dihapus.');
    fetchData();
  };

  const resetAnnForm = () => {
    setEditingAnnId(null);
    setAnnJudul('');
    setAnnIsi('');
    setAnnAktif(true);
    setAnnTipe('info');
  };

  return (
    <div className="space-y-8">
      {/* Messages */}
      {successMsg && <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs rounded-xl">{successMsg}</div>}
      {errorMsg && <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs rounded-xl">{errorMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ── SEKSI 1: MANAGING BERITA ── */}
        <Card className="border-gray-800 bg-gray-900/30">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-400" />
              Kelola Berita & Artikel
            </CardTitle>
            <CardDescription>Tambah atau perbarui postingan kabar kampus BEM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSaveBerita} className="space-y-4 border-b border-gray-900 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Judul Berita</label>
                  <input
                    type="text"
                    required
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder="Judul postingan"
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    {KATEGORI_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Ringkasan Singkat</label>
                <input
                  type="text"
                  required
                  value={ringkasan}
                  onChange={(e) => setRingkasan(e.target.value)}
                  placeholder="Deskripsi singkat yang tampil di beranda depan"
                  className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Isi Berita</label>
                <textarea
                  required
                  rows={4}
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  placeholder="Detail konten berita..."
                  className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Unggah Gambar (Lokal)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setGambarUrl(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-400 focus:border-purple-500 focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                  />
                  {gambarUrl && (
                    <span className="text-[9px] text-emerald-400 block mt-1">✓ Berkas gambar siap diunggah</span>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Pembuat</label>
                  <input
                    type="text"
                    required
                    value={pembuat}
                    onChange={(e) => setPembuat(e.target.value)}
                    placeholder="cth: Kementerian Kominfo"
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer">
                  {editingBeritaId ? 'Update Berita' : 'Simpan Berita'}
                </button>
                {editingBeritaId && (
                  <button type="button" onClick={resetBeritaForm} className="py-2 px-3 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-xs">
                    Batal
                  </button>
                )}
              </div>
            </form>

            {/* List Berita */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {beritaList.map((b) => (
                <div key={b.id} className="p-3 rounded-lg border border-gray-800 bg-gray-950/25 flex items-center justify-between text-xs gap-4">
                  <div className="truncate">
                    <h4 className="font-bold text-white truncate">{b.judul}</h4>
                    <span className="text-[9px] text-gray-500">{b.kategori} · Oleh: {b.pembuat}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEditBerita(b)} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDeleteBerita(b.id)} className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── SEKSI 2: MANAGING PENGUMUMAN DINAMIS ── */}
        <Card className="border-gray-800 bg-gray-900/30">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-purple-400" />
              Kelola Pengumuman Dinamis
            </CardTitle>
            <CardDescription>Buat alert penting/mendesak yang tampil di bagian atas web.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSaveAnn} className="space-y-4 border-b border-gray-900 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Judul Alert</label>
                  <input
                    type="text"
                    required
                    value={annJudul}
                    onChange={(e) => setAnnJudul(e.target.value)}
                    placeholder="UKT Diperpanjang, dll"
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tipe Banner</label>
                  <select
                    value={annTipe}
                    onChange={(e) => setAnnTipe(e.target.value)}
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="info">Info (Ungu)</option>
                    <option value="warning">Warning (Kuning)</option>
                    <option value="danger">Danger (Merah)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Isi Pengumuman</label>
                <textarea
                  required
                  rows={2}
                  value={annIsi}
                  onChange={(e) => setAnnIsi(e.target.value)}
                  placeholder="Isi rincian pengumuman ringkas..."
                  className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ann-aktif"
                  checked={annAktif}
                  onChange={(e) => setAnnAktif(e.target.checked)}
                  className="h-4 w-4 bg-gray-950 border-gray-800 rounded focus:ring-purple-500 text-purple-600"
                />
                <label htmlFor="ann-aktif" className="text-xs text-gray-300 font-semibold select-none cursor-pointer">
                  Aktifkan & Tampilkan di Web
                </label>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer">
                  {editingAnnId ? 'Update Pengumuman' : 'Aktifkan Pengumuman'}
                </button>
                {editingAnnId && (
                  <button type="button" onClick={resetAnnForm} className="py-2 px-3 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-xs">
                    Batal
                  </button>
                )}
              </div>
            </form>

            {/* List Pengumuman */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {annList.map((a) => (
                <div key={a.id} className="p-3 rounded-lg border border-gray-800 bg-gray-950/25 flex items-center justify-between text-xs gap-4">
                  <div className="truncate">
                    <h4 className="font-bold text-white truncate">{a.judul}</h4>
                    <span className="text-[9px] font-semibold tracking-wider text-purple-400 uppercase">
                      Tipe: {a.tipe} · {a.status_aktif ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEditAnn(a)} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDeleteAnn(a.id)} className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
