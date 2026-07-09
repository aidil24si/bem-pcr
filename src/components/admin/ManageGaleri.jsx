import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Plus, Trash2, Edit3, X, Image } from 'lucide-react';

export default function ManageGaleri() {
  const [photoList, setPhotoList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [photoSearch, setPhotoSearch] = useState('');
  const [photoFilterKategori, setPhotoFilterKategori] = useState('Semua');

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [judulFoto, setJudulFoto] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [gambarUrl, setGambarUrl] = useState('');
  const [kategori, setKategori] = useState('Kegiatan');
  const [tanggalUnggah, setTanggalUnggah] = useState(new Date().toISOString().slice(0, 10));

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('galeri')
      .select('*')
      .order('tanggal_unggah', { ascending: false });
    setPhotoList(data || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!judulFoto || !deskripsi || !gambarUrl || !tanggalUnggah) {
      setErrorMsg('Wajib mengisi seluruh bidang.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      judul_foto: judulFoto,
      deskripsi,
      gambar_url: gambarUrl,
      kategori,
      tanggal_unggah: tanggalUnggah,
    };

    try {
      if (editingId) {
        await supabase.from('galeri').update(payload).eq('id', editingId);
        setSuccessMsg('Foto kegiatan berhasil diperbarui.');
      } else {
        await supabase.from('galeri').insert([payload]);
        setSuccessMsg('Foto kegiatan baru berhasil ditambahkan.');
      }
      resetForm();
      fetchPhotos();
    } catch (err) {
      setErrorMsg('Gagal menyimpan foto kegiatan.');
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setJudulFoto(p.judul_foto);
    setDeskripsi(p.deskripsi);
    setGambarUrl(p.gambar_url);
    setKategori(p.kategori);
    setTanggalUnggah(p.tanggal_unggah);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleDelete = async (id) => {
    await supabase.from('galeri').delete().eq('id', id);
    setSuccessMsg('Foto kegiatan berhasil dihapus.');
    fetchPhotos();
  };

  const resetForm = () => {
    setEditingId(null);
    setJudulFoto('');
    setDeskripsi('');
    setGambarUrl('');
    setKategori('Kegiatan');
    setTanggalUnggah(new Date().toISOString().slice(0, 10));
  };

  return (
    <Card className="border-gray-800 bg-gray-900/30">
      <CardHeader>
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Image className="h-4 w-4 text-purple-400" />
          Kelola Galeri Foto
        </CardTitle>
        <CardDescription>Upload link foto dokumentasi aksi sosial dan kegiatan BEM.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Messages */}
        {successMsg && <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs rounded-xl">{successMsg}</div>}
        {errorMsg && <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs rounded-xl">{errorMsg}</div>}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <form onSubmit={handleSave} className="md:col-span-5 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Judul Foto</label>
              <input
                type="text"
                required
                value={judulFoto}
                onChange={(e) => setJudulFoto(e.target.value)}
                placeholder="cth: Aksi Sosial 2025"
                className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Deskripsi Singkat</label>
              <textarea
                required
                rows={2}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Detail dokumentasi kegiatan..."
                className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Kategori</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500"
                >
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Sosial">Sosial</option>
                  <option value="Audiensi">Audiensi</option>
                  <option value="Eksternal">Eksternal</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={tanggalUnggah}
                  onChange={(e) => setTanggalUnggah(e.target.value)}
                  className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500"
                />
              </div>
            </div>

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

            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer">
                {editingId ? 'Update Foto' : 'Unggah Foto'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="py-2 px-3 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-xs">
                  Batal
                </button>
              )}
            </div>
          </form>

          {/* List */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-900 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Daftar Dokumentasi Foto</h4>
              <div className="flex gap-2 flex-grow sm:flex-none">
                <input
                  type="text"
                  placeholder="Cari foto..."
                  value={photoSearch}
                  onChange={(e) => setPhotoSearch(e.target.value)}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
                <select
                  value={photoFilterKategori}
                  onChange={(e) => setPhotoFilterKategori(e.target.value)}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Sosial">Sosial</option>
                  <option value="Audiensi">Audiensi</option>
                  <option value="Eksternal">Eksternal</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-gray-500">Memuat foto...</p>
            ) : photoList.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Belum ada foto.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1">
                {photoList
                  .filter((p) => {
                    const matchSearch =
                      p.judul_foto.toLowerCase().includes(photoSearch.toLowerCase()) ||
                      p.deskripsi.toLowerCase().includes(photoSearch.toLowerCase());
                    const matchCat = photoFilterKategori === 'Semua' || p.kategori === photoFilterKategori;
                    return matchSearch && matchCat;
                  })
                  .map((p) => (
                    <div key={p.id} className="p-3 rounded-lg border border-gray-800 bg-gray-950/25 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2 truncate">
                        <div className="h-8 w-12 rounded overflow-hidden bg-gray-900 shrink-0">
                          <img src={p.gambar_url} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-white truncate">{p.judul_foto}</h4>
                          <span className="text-[9px] text-gray-500">{p.kategori} · {p.tanggal_unggah}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleEdit(p)} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
