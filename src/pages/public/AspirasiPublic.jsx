import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { sanitizeAndCompressImage } from '../../utils/imageSanitizer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { MessageSquare, Upload, Search, CheckCircle2, ShieldAlert, EyeOff, User, X } from 'lucide-react';
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
  const [aspirasiList, setAspirasiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedLoading, setFeedLoading] = useState(true);

  // Fetch published aspirations
  const fetchAspirations = async () => {
    setFeedLoading(true);
    try {
      const { data, error } = await supabase
        .from('aspirasi')
        .select('*')
        .eq('status', 'diterbitkan')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAspirasiList(data || []);
    } catch (err) {
      console.error('Error fetching aspirations:', err);
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

    fetchAspirations();
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

  // Filter local aspirations based on searchQuery (Case-Insensitive)
  const filteredAspirations = aspirasiList.filter((item) =>
    item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
      if (!prodi.trim()) throw new Error('Program studi harus diisi.');
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

      // 3. Insert into Supabase table 'aspirasi' (status default to 'draft' or 'review' for moderation)
      const { error: insertError } = await supabase.from('aspirasi').insert({
        tipe_isu: tipeIsu,
        identitas: identitas,
        prodi: prodi,
        deskripsi: deskripsi,
        bukti_url: finalBuktiUrl,
        status: 'review', // Ke status review untuk dimoderasi admin
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
      // Refetch aspirations in case some auto-publish rules or to verify list
      fetchAspirations();
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
                  </div>
                )}

                {/* Program Studi */}
                <div>
                  <label className="text-sm font-medium text-gray-300">Program Studi</label>
                  <input
                    type="text"
                    required
                    value={prodi}
                    onChange={(e) => setProdi(e.target.value)}
                    placeholder="Contoh: Teknik Informatika"
                    className="mt-1 block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

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
              placeholder="Cari aspirasi berdasarkan kata kunci..."
              className="bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none w-full"
            />
          </div>

          {/* Feed List */}
          {feedLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Memuat data aspirasi...</p>
            </div>
          ) : filteredAspirations.length === 0 ? (
            <div className="text-center py-16 border border-gray-800 rounded-xl bg-gray-900/20">
              <MessageSquare className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Belum ada aspirasi diterbitkan</p>
              <p className="text-gray-500 text-sm mt-1">Gunakan kotak pencarian atau jadilah yang pertama beraspirasi.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {filteredAspirations.map((item) => (
                <Card key={item.id} className="border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 transition-colors">
                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.identitas ? (
                          <div className="flex items-center gap-1 text-purple-400 text-xs font-semibold bg-purple-500/10 py-1 px-2.5 rounded-full border border-purple-500/20">
                            <User className="h-3.5 w-3.5" />
                            <span>{item.identitas.nama} ({item.identitas.nim})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400 text-xs font-semibold bg-gray-800/80 py-1 px-2.5 rounded-full border border-gray-700">
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>Anonim</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span
                        className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full border ${
                          item.tipe_isu === 'tangible'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                        }`}
                      >
                        {item.tipe_isu === 'tangible' ? 'Fasilitas' : 'Non-Fasilitas'}
                      </span>
                    </div>

                    {/* Prodi */}
                    <p className="text-xs text-gray-400 font-medium">
                      Program Studi: <span className="text-gray-200">{item.prodi}</span>
                    </p>

                    {/* Deskripsi */}
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                      {item.deskripsi}
                    </p>

                    {/* Image Attachment */}
                    {item.bukti_url && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 font-semibold mb-1">Bukti Foto Lampiran:</p>
                        <div className="relative max-w-sm rounded-lg overflow-hidden border border-gray-800">
                          <img
                            src={item.bukti_url}
                            alt="Bukti Aspirasi"
                            className="max-h-48 object-cover w-full hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
