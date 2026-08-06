import React, { useState, useEffect, useMemo } from 'react';
import { useMockDatabase } from '../../context/MockDatabaseContext';
import { sanitizeImageEXIF } from '../../utils/exifSanitizer';
import { validateEmail } from '../../utils/emailValidator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { MessageSquare, Upload, Search, CheckCircle2, ShieldAlert, EyeOff, X, Layers } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';

export default function AspirasiPublic() {
  useDocumentTitle('Kotak Aspirasi');

  const { aspirasi: allAspirations, rilisAdvokasi, tambahAspirasi } = useMockDatabase();
  
  // Hanya rilis yang sudah diterbitkan
  const releasesList = rilisAdvokasi.filter(r => r.status === 'diterbitkan');

  // Public Feed State
  const [publicTab, setPublicTab] = useState('rilis');
  const [showDraftWarning, setShowDraftWarning] = useState(false);

  // Form State
  const [tipeIsu, setTipeIsu] = useState('tangible');
  const [isAnonim, setIsAnonim] = useState(true);
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [buktiFile, setBuktiFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // UX State
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Object URL cleanup
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Load drafts on mount
  useEffect(() => {
    const savedTipe = sessionStorage.getItem('asp_tipe');
    const savedAnon = sessionStorage.getItem('asp_anon');
    const savedNama = sessionStorage.getItem('asp_nama');
    const savedNim = sessionStorage.getItem('asp_nim');
    const savedEmail = sessionStorage.getItem('asp_email');
    const savedDesc = sessionStorage.getItem('asp_desc');

    if (savedTipe) setTipeIsu(savedTipe);
    if (savedAnon) setIsAnonim(savedAnon === 'true');
    if (savedNama) setNama(savedNama);
    if (savedNim) setNim(savedNim);
    if (savedEmail) setEmail(savedEmail);
    if (savedDesc) setDeskripsi(savedDesc);

    if (savedTipe === 'tangible' && savedDesc) {
      setShowDraftWarning(true);
    }
  }, []);

  // Save drafts
  useEffect(() => sessionStorage.setItem('asp_tipe', tipeIsu), [tipeIsu]);
  useEffect(() => sessionStorage.setItem('asp_anon', String(isAnonim)), [isAnonim]);
  useEffect(() => sessionStorage.setItem('asp_nama', nama), [nama]);
  useEffect(() => sessionStorage.setItem('asp_nim', nim), [nim]);
  useEffect(() => sessionStorage.setItem('asp_email', email), [email]);
  useEffect(() => sessionStorage.setItem('asp_desc', deskripsi), [deskripsi]);

  // Filter Search
  const filteredReleases = useMemo(() => {
    if (!searchQuery.trim()) return releasesList;

    const query = searchQuery.toLowerCase();
    
    return releasesList.filter((rel) => 
      (rel.judul_isu && rel.judul_isu.toLowerCase().includes(query)) ||
      (rel.pembahasan_offline && rel.pembahasan_offline.toLowerCase().includes(query)) ||
      (rel.kategori_isu && rel.kategori_isu.toLowerCase().includes(query))
    );
  }, [searchQuery, releasesList]);

  const handleAnonimToggle = (e) => {
    const checked = e.target.checked;
    setIsAnonim(checked);
    if (checked) {
      setNama('');
      setNim('');
      setEmail('');
      sessionStorage.removeItem('asp_nama');
      sessionStorage.removeItem('asp_nim');
      sessionStorage.removeItem('asp_email');
    }
  };

  const handleFileChange = async (e) => {
    setErrorMessage('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Ukuran file maksimal adalah 2MB.');
        e.target.value = '';
        removeFile();
        return;
      }
      setBuktiFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setBuktiFile(null);
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSubmitSuccess(false);

    try {
      if (!isAnonim) {
        if (!email.trim() || !validateEmail(email)) throw new Error('Gunakan email kampus (@mahasiswa.pcr.ac.id)');
        if (!nama.trim() || !nim.trim()) throw new Error('Nama dan NIM wajib diisi jika tidak anonim.');
      }
      if (!deskripsi.trim()) throw new Error('Deskripsi aspirasi harus diisi.');

      let finalBuktiUrl = null;

      // EXIF Sanitization
      if (buktiFile && tipeIsu === 'tangible') {
        const { previewUrl: sanitizedUrl } = await sanitizeImageEXIF(buktiFile);
        finalBuktiUrl = sanitizedUrl;
      }

      const identitas = isAnonim ? null : { nama, nim, email };

      tambahAspirasi({
        tipe_isu: tipeIsu,
        identitas: identitas,
        deskripsi: deskripsi,
        bukti_url: finalBuktiUrl,
      });

      // Reset Form
      setNama('');
      setNim('');
      setEmail('');
      setDeskripsi('');
      removeFile();
      setIsAnonim(true);
      if (e.target) e.target.reset();
      sessionStorage.clear();
      setSubmitSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengirim aspirasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
      <PageHeader
        tag="Kotak Aspirasi"
        icon={MessageSquare}
        title="Kotak Aspirasi Mahasiswa"
        description="Suarakan keluhan, saran, dan ide konstruktif Anda. Kami menjamin privasi Anda (termasuk pembersihan otomatis metadata EXIF foto)."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <Card className="border-gray-200 bg-white sticky top-24 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#004B5F]">
                <MessageSquare className="h-5 w-5 text-[#004B5F]" />
                Formulir Aspirasi
              </CardTitle>
              <CardDescription>Isi form di bawah ini dengan jelas.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Tipe Isu */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#004B5F]">Tipe Isu</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipeIsu('tangible')}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                        tipeIsu === 'tangible'
                          ? 'border-[#004B5F] bg-[#E6F3F7] text-[#004B5F] font-bold shadow-sm'
                          : 'border-gray-200 bg-slate-50 text-slate-500 hover:text-[#004B5F]'
                      }`}
                    >
                      Fasilitas (Tangible)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipeIsu('intangible')}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                        tipeIsu === 'intangible'
                          ? 'border-[#004B5F] bg-[#E6F3F7] text-[#004B5F] font-bold shadow-sm'
                          : 'border-gray-200 bg-slate-50 text-slate-500 hover:text-[#004B5F]'
                      }`}
                    >
                      Birokrasi (Intangible)
                    </button>
                  </div>
                </div>

                {/* Switch Anonim */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-[#004B5F]" />
                    <div>
                      <p className="text-sm font-bold text-[#004B5F]">Kirim Secara Anonim</p>
                      <p className="text-xs text-slate-500">Identitas Anda tidak akan disimpan.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAnonim}
                    onChange={handleAnonimToggle}
                    className="h-4 w-4 rounded border-gray-300 text-[#004B5F] focus:ring-[#004B5F] cursor-pointer"
                  />
                </div>

                {/* Identitas Form (jika tidak anonim) */}
                {!isAnonim && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-[#004B5F]">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#004B5F]">NIM</label>
                        <input
                          type="text"
                          required
                          value={nim}
                          onChange={(e) => setNim(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#004B5F]">Email Kampus / Pribadi</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@mahasiswa.ac.id"
                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F]"
                      />
                      <p className="text-[10px] text-slate-500 mt-1.5 italic">
                        Email digunakan BEM untuk verifikasi & kontak resmi eksternal jika diperlukan.
                      </p>
                    </div>
                  </div>
                )}

                {/* Deskripsi */}
                <div>
                  <label className="text-sm font-bold text-[#004B5F]">Deskripsi Aspirasi</label>
                  <textarea
                    required
                    rows={4}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Tulis detail keluhan/saran Anda..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F]"
                  />
                </div>

                {/* File Upload (Tangible only) */}
                {tipeIsu === 'tangible' && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[#004B5F] block">
                      Unggah Bukti Foto (Wajib untuk Fasilitas)
                    </label>
                    {showDraftWarning && !buktiFile && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-xs font-medium animate-in fade-in zoom-in-95 duration-200">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>Draf teks dimuat. Silakan unggah ulang foto bukti jika ada.</span>
                      </div>
                    )}
                    {isAnonim && (
                      <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-medium animate-in fade-in zoom-in-95 duration-200">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>Lampiran foto tetap disertakan. Pastikan tidak menampilkan wajah atau info pribadi lain.</span>
                      </div>
                    )}
                    <div className="relative flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-slate-50 hover:bg-slate-100 transition-colors p-4 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center space-y-1">
                        <Upload className="mx-auto h-6 w-6 text-slate-400" />
                        <p className="text-xs text-slate-500 font-medium">
                          {buktiFile ? buktiFile.name : 'Pilih file gambar bukti (Maks 2MB)'}
                        </p>
                        <p className="text-[10px] text-[#EE152A] font-bold">Metadata lokasi (EXIF) akan dihapus otomatis!</p>
                      </div>
                    </div>
                    {previewUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white p-1.5 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                        <img src={previewUrl} alt="Pratinjau Bukti" className="h-44 w-full object-cover rounded-md" />
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-[#EE152A] hover:bg-red-700 text-white cursor-pointer shadow-md"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Alerts */}
                {submitSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Aspirasi tersimpan! Menunggu konsolidasi admin.</span>
                  </div>
                )}
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[#004B5F] hover:bg-[#003847] text-white font-bold shadow-lg shadow-[#004B5F]/20 hover:shadow-[#004B5F]/30 transition-all text-sm disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {loading ? 'Memproses Sanitasi Gambar...' : 'Kirim Aspirasi Ke BEM'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Public Feed Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 pb-px mt-1">
            <button
              onClick={() => setPublicTab('rilis')}
              className={`py-3 px-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer border-b-2 transition-colors ${publicTab === 'rilis' ? 'border-[#004B5F] text-[#004B5F]' : 'border-transparent text-slate-400 hover:text-[#004B5F]'}`}
            >
              Rilis Advokasi
            </button>
            <button
              onClick={() => setPublicTab('diproses')}
              className={`py-3 px-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer border-b-2 transition-colors ${publicTab === 'diproses' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-amber-600'}`}
            >
              Aspirasi Diproses ({allAspirations.filter(a => !a.rilis_id).length})
            </button>
          </div>

          {publicTab === 'rilis' ? (
            <>
              {/* Filter Bar */}
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <Search className="h-5 w-5 text-slate-400 shrink-0 ml-1" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari respon rilis advokasi resmi dari keluhan Anda..."
                  className="bg-transparent border-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none w-full px-2"
                />
              </div>

              {/* Feed List */}
              {filteredReleases.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-300 rounded-2xl bg-slate-50">
                  <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Belum ada Rilis Advokasi resmi</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredReleases.map((release) => {
                    const linkedAsps = allAspirations.filter(asp => asp.rilis_id === release.id);
                    return (
                      <Card key={release.id} className="border-gray-200 bg-white hover:border-[#004B5F]/30 transition-all shadow-sm hover:shadow-md">
                        <CardContent className="p-6 space-y-4">
                          {/* Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#004B5F] font-bold bg-[#E6F3F7] py-1 px-3 rounded-full border border-[#CCE7EF]">
                                {release.kategori_isu}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {new Date(release.tanggal_rilis).toLocaleDateString('id-ID', {
                                  day: 'numeric', month: 'long', year: 'numeric',
                                })}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
                              Rilis Resmi BEM
                            </span>
                          </div>

                          {/* Judul Isu */}
                          <h3 className="text-lg md:text-xl font-bold text-[#004B5F] leading-snug">
                            {release.judul_isu}
                          </h3>

                          {/* Pembahasan Offline */}
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hasil Pembahasan & Resolusi BEM:</p>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-gray-200">
                              {release.pembahasan_offline}
                            </p>
                          </div>

                          {/* Aspirasi Terkonsolidasi */}
                          {linkedAsps.length > 0 && (
                            <div className="pt-4 border-t border-gray-200 space-y-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Aspirasi Terkonsolidasi ({linkedAsps.length}):
                              </p>
                              <div className="space-y-3">
                                {linkedAsps.map((asp) => (
                                  <div key={asp.id} className="text-xs bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold text-[#004B5F]">
                                      <span>{asp.identitas ? asp.identitas.nama : 'Anonim'}</span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed italic">"{asp.deskripsi}"</p>
                                    {asp.bukti_url && (
                                      <a href={asp.bukti_url} target="_blank" rel="noreferrer" className="text-[10px] text-[#004B5F] font-bold mt-2 inline-block hover:underline">
                                        📎 Lihat Lampiran Sanitasi
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Feed List Aspirasi Diproses */}
              {allAspirations.filter(a => !a.rilis_id).length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-300 rounded-2xl bg-slate-50">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Semua aspirasi telah ditanggapi.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
                  {allAspirations.filter(a => !a.rilis_id).map((asp) => (
                    <Card key={asp.id} className="border-gray-200 bg-white hover:border-[#004B5F]/30 transition-all shadow-sm hover:shadow-md">
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-600 font-extrabold bg-slate-100 py-1 px-2.5 rounded-full border border-gray-200 uppercase tracking-wider">
                            {asp.tipe_isu === 'tangible' ? 'Fasilitas' : 'Birokrasi'}
                          </span>
                          <p className="text-sm font-bold text-[#004B5F]">
                            Laporan Masuk (Anonim)
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {new Date(asp.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full font-bold whitespace-nowrap self-start sm:self-center">
                          ⏳ Dalam Pengkajian BEM
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
