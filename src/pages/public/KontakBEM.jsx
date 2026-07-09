import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Mail, Phone, MapPin, Send, Check, AlertCircle } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';

export default function KontakBEM() {
  useDocumentTitle('Hubungi Kami');

  // Form States
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [pesan, setPesan] = useState('');
  
  // Validation & Loading States
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  // Load draft from sessionStorage on mount
  useEffect(() => {
    const savedNama = sessionStorage.getItem('kontak_nama');
    const savedEmail = sessionStorage.getItem('kontak_email');
    const savedPesan = sessionStorage.getItem('kontak_pesan');
    
    if (savedNama) setNama(savedNama);
    if (savedEmail) setEmail(savedEmail);
    if (savedPesan) setPesan(savedPesan);
  }, []);

  // Save changes to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('kontak_nama', nama);
  }, [nama]);

  useEffect(() => {
    sessionStorage.setItem('kontak_email', email);
    // Clear validation error when typing
    if (emailError) setEmailError('');
  }, [email, emailError]);

  useEffect(() => {
    sessionStorage.setItem('kontak_pesan', pesan);
  }, [pesan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Email Regex Match Validation (Client-Side Validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Format alamat email tidak valid (contoh: nama@domain.com)');
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSuccess(true);
      setSending(false);
      
      // Clear form inputs
      setNama('');
      setEmail('');
      setPesan('');
      
      // Clear sessionStorage drafts
      sessionStorage.removeItem('kontak_nama');
      sessionStorage.removeItem('kontak_email');
      sessionStorage.removeItem('kontak_pesan');
      
      // Reset success banner after 5s
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header (Unified) */}
      <PageHeader
        tag="Hubungi Kami"
        icon={Mail}
        title="Hubungi BEM"
        description="Butuh kolaborasi, kemitraan strategis, atau ingin menyampaikan kritik & saran secara langsung? Tim kami siap melayani Anda."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Info Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <Card className="border-gray-800 bg-gray-900/30 flex-1">
            <CardHeader>
              <CardTitle className="text-white text-base">Informasi Kontak</CardTitle>
              <CardDescription>Saluran komunikasi resmi BEM Universitas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-extrabold text-white">Sekretariat Utama</h4>
                  <p className="text-gray-400 leading-relaxed">
                    Gedung Student Center Lt. 2, Kampus Utama Universitas Nusantara
                    <br />
                    Jl. Ahmad Yani No. 123, Kota Nusantara
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-extrabold text-white">Surel Resmi</h4>
                  <p className="text-gray-400">bem@universitas.ac.id</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-extrabold text-white">WhatsApp Center</h4>
                  <p className="text-gray-400">0812-3456-7890 (Kementerian Adkesma)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Container */}
          <div className="h-52 w-full rounded-2xl border border-gray-800 bg-gray-900/10 relative overflow-hidden flex items-center justify-center p-6 text-center text-xs text-gray-500">
            <div className="absolute inset-0 bg-cover bg-center filter grayscale opacity-25" 
                 style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400')` }} />
            <div className="relative z-10 space-y-2 max-w-xs">
              <MapPin className="h-8 w-8 mx-auto text-purple-500 animate-bounce" />
              <p className="font-bold text-gray-300">Peta Lokasi Sekretariat BEM</p>
              <p className="text-[10px] text-gray-400">Peta interaktif nyata akan terhubung via Google Maps SDK setelah deployment Supabase selesai.</p>
            </div>
          </div>

        </div>

        {/* Form Column */}
        <div className="lg:col-span-7">
          <Card className="border-gray-800 bg-gray-900/40 backdrop-blur-md h-full">
            <CardHeader>
              <CardTitle className="text-white text-base">Kirim Pesan Langsung</CardTitle>
              <CardDescription>Pesan Anda akan terkirim langsung ke Sekretariat Jenderal.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Budi Wijaya"
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Alamat Email</label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="budi@email.com"
                    className={`block w-full rounded-lg border bg-gray-950 px-3 py-2 text-sm text-white focus:outline-none ${
                      emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-purple-500'
                    }`}
                  />
                  {emailError && (
                    <p className="text-[10px] text-red-400 flex items-center gap-1 mt-1 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5" /> {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Pesan / Saran</label>
                  <textarea
                    required
                    rows={4}
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    placeholder="Tulis pesan atau pertanyaan Anda di sini..."
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>

                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>Terima kasih! Pesan Anda telah terkirim ke Sekretariat Jenderal.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-purple-900/30"
                >
                  {sending ? (
                    <>Mengirim...</>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Kirim Pesan
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
