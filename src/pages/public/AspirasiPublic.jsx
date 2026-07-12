import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { sanitizeAndCompressImage, validateImageMagicBytes } from '../../utils/imageSanitizer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { MessageSquare, Upload, Search, CheckCircle2, ShieldAlert, EyeOff, User, X, Layers } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';

export default function AspirasiPublic() {
  useDocumentTitle('Kotak Aspirasi');

  // Form State
  const [tipeIsu, setTipeIsu] = useState('tangible');
  const [isAnonim, setIsAnonim] = useState(true);
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [prodi, setProdi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [buktiFile, setBuktiFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // UX State
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Object URL cleanup to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Feed State
  const [releasesList, setReleasesList] = useState([]);
  const [allAspirations, setAllAspirations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedLoading, setFeedLoading] = useState(true);

  // Fetch published releases & associated aspirations
  const fetchPublicData = async () => {
    setFeedLoading(true);
    try {
      // 1. Fetch published releases
      const { data: relData, error: relError } = await supabase
        .from('rilis_advokasi')
        .select('*')
        .eq('status', 'diterbitkan')
        .order('tanggal_rilis', { ascending: false });

      if (relError) throw relError;
      setReleasesList(relData || []);

      // 2. Fetch all aspirations that are linked to a release
      const { data: aspData, error: aspError } = await supabase
        .from('aspirasi')
        .select('*');

      if (aspError) throw aspError;
      setAllAspirations(aspData || []);
    } catch (err) {
      console.error('Error fetching public advokasi data:', err);
    } finally {
      setFeedLoading(false);
    }
  };

  // Load drafts on mount
  useEffect(() => {
    const savedTipe = sessionStorage.getItem('asp_tipe');
    const savedAnon = sessionStorage.getItem('asp_anon');
    const savedNama = sessionStorage.getItem('asp_nama');
    const savedNim = sessionStorage.getItem('asp_nim');
    const savedProdi = sessionStorage.getItem('asp_prodi');
    const savedDesc = sessionStorage.getItem('asp_desc');

    if (savedTipe) setTipeIsu(savedTipe);
    if (savedAnon) setIsAnonim(savedAnon === 'true');
    if (savedNama) setNama(savedNama);
    if (savedNim) setNim(savedNim);
    if (savedProdi) setProdi(savedProdi);
    if (savedDesc) setDeskripsi(savedDesc);

    fetchPublicData();
  }, []);

  // Save drafts to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('asp_tipe', tipeIsu);
  }, [tipeIsu]);

  useEffect(() => {
    sessionStorage.setItem('asp_anon', String(isAnonim));
  }, [isAnonim]);

  useEffect(() => {
    sessionStorage.setItem('asp_nama', nama);
  }, [nama]);

  useEffect(() => {
    sessionStorage.setItem('asp_nim', nim);
  }, [nim]);

  useEffect(() => {
    sessionStorage.setItem('asp_prodi', prodi);
  }, [prodi]);

  useEffect(() => {
    sessionStorage.setItem('asp_desc', deskripsi);
  }, [deskripsi]);

  // Filter and Join search logic: Rilis Advokasi (FR-1.5)
  const filteredReleases = useMemo(() => {
    if (!searchQuery.trim()) return releasesList;

    const query = searchQuery.toLowerCase();
    const matchedReleaseIds = new Set();

    // 1. Direct search in releases
    releasesList.forEach((rel) => {
      const matchJudul = rel.judul_isu && rel.judul_isu.toLowerCase().includes(query);
      const matchPembahasan = rel.pembahasan_offline && rel.pembahasan_offline.toLowerCase().includes(query);
      const matchKategori = rel.kategori_isu && rel.kategori_isu.toLowerCase().includes(query);
      
      if (matchJudul || matchPembahasan || matchKategori) {
        matchedReleaseIds.add(rel.id);
      }
    });

    // 2. Indirect search in consolidated student aspirations
    allAspirations.forEach((asp) => {
      if (asp.rilis_id) {
        const matchDesc = asp.deskripsi && asp.deskripsi.toLowerCase().includes(query);
        const matchProdi = asp.prodi && asp.prodi.toLowerCase().includes(query);
        
        if (matchDesc || matchProdi) {
          matchedReleaseIds.add(asp.rilis_id);
        }
      }
    });

    return releasesList.filter((rel) => matchedReleaseIds.has(rel.id));
  }, [searchQuery, releasesList, allAspirations]);

  const handleFileChange = async (e) => {
    setErrorMessage('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Limit file size to 2MB (2 * 1024 * 1024 bytes)
      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setErrorMessage('Gagal memilih file: Ukuran file gambar maksimal adalah 2MB.');
        e.target.value = ''; // Reset file input element
        setBuktiFile(null);
        setPreviewUrl('');
        return;
      }

      // Validate Magic Bytes to confirm it is a valid image (JPEG, PNG, GIF, WEBP)
      const isValidImage = await validateImageMagicBytes(file);
      if (!isValidImage) {
        setErrorMessage('Gagal memilih file: File bukan gambar yang valid. Harap unggah berkas dengan format JPEG, PNG, GIF, atau WEBP.');
        e.target.value = ''; // Reset file input element
        setBuktiFile(null);
        setPreviewUrl('');
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
      if (!isAnonim && !prodi.trim()) throw new Error('Program studi harus diisi.');
      if (!deskripsi.trim()) throw new Error('Deskripsi aspirasi harus diisi.');

      let finalBuktiUrl = null;

      // Handle Image Upload if file exists
      if (buktiFile) {
        // 1. Sanitize & Compress image (HTML5 Canvas redraw to strip EXIF + JPEG conversion)
        const sanitizedFile = await sanitizeAndCompressImage(buktiFile, 0.7);

        // 2. Upload file to Supabase private storage bucket 'bukti-aspirasi'
        const { error: uploadError } = await supabase.storage
          .from('bukti-aspirasi')
          .upload(sanitizedFile.name, sanitizedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw new Error(`Gagal mengunggah bukti: ${uploadError.message}`);

        // Get public URL or path reference
        const { data: urlData } = supabase.storage
          .from('bukti-aspirasi')
          .getPublicUrl(sanitizedFile.name);
        
        finalBuktiUrl = urlData?.publicUrl || sanitizedFile.name;
      }

      // Build identity object
      const identitas = isAnonim ? null : { nama, nim };

      // 3. Insert into Supabase table 'aspirasi' (status columns deprecated, rilis_id defaults to null)
      const { error: insertError } = await supabase.from('aspirasi').insert({
        tipe_isu: tipeIsu,
        identitas: identitas,
        prodi: isAnonim ? 'Anonim' : prodi,
        deskripsi: deskripsi,
        bukti_url: finalBuktiUrl,
        rilis_id: null,
      });

      if (insertError) throw insertError;

      // Reset Form
      setNama('');
      setNim('');
      setProdi('');
      setDeskripsi('');
      setBuktiFile(null);
      setPreviewUrl('');
      setIsAnonim(true);
      if (e.target) e.target.reset();

      // Clear sessionStorage drafts
      sessionStorage.removeItem('asp_tipe');
      sessionStorage.removeItem('asp_anon');
      sessionStorage.removeItem('asp_nama');
      sessionStorage.removeItem('asp_nim');
      sessionStorage.removeItem('asp_prodi');
      sessionStorage.removeItem('asp_desc');

      setSubmitSuccess(true);
      // Refetch releases & aspirations
      fetchPublicData();
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengirim aspirasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Page Header (Unified) */}
      <PageHeader
        tag="Kotak Aspirasi"
        icon={MessageSquare}
        title="Kotak Aspirasi Mahasiswa"
        description="Suarakan keluhan, saran, dan ide konstruktif Anda demi kemajuan kampus. Kami menjamin privasi Anda 100% aman (termasuk pembersihan otomatis metadata gambar bukti)."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-md sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                Formulir Aspirasi
              </CardTitle>
              <CardDescription>
                Isi form di bawah ini dengan lengkap dan jujur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Tipe Isu */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Tipe Isu</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipeIsu('tangible')}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        tipeIsu === 'tangible'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-semibold'
                          : 'border-gray-800 bg-gray-950 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Fasilitas (Tangible)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipeIsu('intangible')}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        tipeIsu === 'intangible'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-semibold'
                          : 'border-gray-800 bg-gray-950 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Non-Fasilitas (Intangible)
                    </button>
                  </div>
                </div>

                {/* Switch Anonim */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-950/80 border border-gray-800">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-200">Kirim Secara Anonim</p>
                      <p className="text-xs text-gray-400">Identitas Anda tidak akan disimpan.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAnonim}
                    onChange={(e) => setIsAnonim(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900 bg-gray-950 cursor-pointer"
                  />
                </div>

                {/* Identitas Form (jika tidak anonim) */}
                {!isAnonim && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-400">Nama</label>
                        <input
                          type="text"
                          required
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          placeholder="Nama Lengkap"
                          className="mt-1 block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-400">NIM</label>
                        <input
                          type="text"
                          required
                          value={nim}
                          onChange={(e) => setNim(e.target.value)}
                          placeholder="NIM"
                          className="mt-1 block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>

                    {/* Program Studi */}
                    <div>
                      <label className="text-xs font-medium text-gray-400">Program Studi</label>
                      <input
                        type="text"
                        required
                        value={prodi}
                        onChange={(e) => setProdi(e.target.value)}
                        placeholder="Contoh: Teknik Informatika"
                        className="mt-1 block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>
                )}

                {/* Deskripsi */}
                <div>
                  <label className="text-sm font-medium text-gray-300">Deskripsi Aspirasi</label>
                  <textarea
                    required
                    rows={4}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Tulis detail keluhan/saran Anda secara jelas..."
                    className="mt-1 block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* File Upload (Tangible only) */}
                {tipeIsu === 'tangible' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300 block">
                      Unggah Bukti Foto (Optional)
                    </label>
                    <div className="relative flex items-center justify-center rounded-lg border border-dashed border-gray-800 bg-gray-950 hover:bg-gray-900/50 transition-colors p-4 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center space-y-1">
                        <Upload className="mx-auto h-6 w-6 text-gray-400" />
                        <p className="text-xs text-gray-400 font-medium">
                          {buktiFile ? buktiFile.name : 'Pilih file gambar bukti'}
                        </p>
                        <p className="text-[10px] text-gray-500">EXIF metadata akan dihapus otomatis</p>
                      </div>
                    </div>
                    {/* Visual Image Preview */}
                    {previewUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-gray-800 bg-gray-950 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                        <img
                          src={previewUrl}
                          alt="Pratinjau Bukti"
                          className="h-44 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-colors shadow-md"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Alert Messages */}
                {submitSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-400 rounded-lg text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Aspirasi berhasil dikirim! Sedang menunggu proses moderasi admin.</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800 text-red-400 rounded-lg text-sm">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg hover:shadow-purple-500/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </>
                  ) : (
                    'Kirim Aspirasi'
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Public Feed Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center gap-2 bg-gray-900/40 p-3 rounded-lg border border-gray-800">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari respon rilis advokasi resmi BEM..."
              className="bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none w-full"
            />
          </div>

          {/* Feed List */}
          {feedLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Memuat data advokasi...</p>
            </div>
          ) : filteredReleases.length === 0 ? (
            <div className="text-center py-16 border border-gray-800 rounded-xl bg-gray-900/20">
              <Layers className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Belum ada Rilis Advokasi resmi</p>
              <p className="text-gray-500 text-sm mt-1">Gunakan kotak pencarian untuk mencocokkan keluhan lama Anda.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {filteredReleases.map((release) => {
                const linkedAsps = allAspirations.filter(asp => asp.rilis_id === release.id);
                return (
                  <Card key={release.id} className="border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 transition-colors">
                    <CardContent className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 py-1 px-2.5 rounded-full border border-purple-500/20">
                            {release.kategori_isu}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(release.tanggal_rilis).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase font-bold">
                          Rilis Resmi BEM
                        </span>
                      </div>

                      {/* Judul Isu */}
                      <h3 className="text-sm md:text-base font-bold text-white leading-snug">
                        {release.judul_isu}
                      </h3>

                      {/* Pembahasan Offline */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hasil Pembahasan & Resolusi BEM:</p>
                        <p className="text-gray-200 text-xs md:text-sm leading-relaxed whitespace-pre-line bg-gray-950/40 p-3 rounded-lg border border-gray-900">
                          {release.pembahasan_offline}
                        </p>
                      </div>

                      {/* Associated student aspirations list */}
                      {linkedAsps.length > 0 && (
                        <div className="pt-3 border-t border-gray-800/60 space-y-2">
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                            Aspirasi Terkonsolidasi ({linkedAsps.length}):
                          </p>
                          <div className="space-y-2">
                            {linkedAsps.map((asp) => (
                              <div key={asp.id} className="text-xs bg-gray-950/30 p-2.5 rounded border border-gray-900/60">
                                <div className="flex justify-between items-center mb-1 text-[9px] font-semibold text-gray-500">
                                  <span>{asp.identitas ? asp.identitas.nama : 'Anonim'}</span>
                                  <span>Prodi: {asp.prodi}</span>
                                </div>
                                <p className="text-gray-300 leading-normal italic">"{asp.deskripsi}"</p>
                                {asp.bukti_url && (
                                  <span className="text-[9px] text-purple-400 mt-1 inline-block">📎 Memiliki Lampiran Foto</span>
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
        </div>
      </div>
    </div>
  );
}
