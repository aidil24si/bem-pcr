import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockDatabase } from '../../context/MockDatabaseContext';
import {
  MessageSquare,
  Calendar,
  Users,
  ArrowRight,
  ChevronDown,
  Megaphone,
  BookOpen,
  Star,
  TrendingUp,
  CheckCircle,
  Zap,
} from 'lucide-react';

// ============================================================
// DATA KONFIGURASI — Sesuaikan dengan identitas BEM Anda
// ============================================================
const BEM_CONFIG = {
  namaUniversitas: 'Politeknik Caltex Riau',
  namaFakultas: '',           // Kosongkan jika BEM Universitas (bukan Fakultas)
  namaKabinet: 'AKSALAKSANA / ARTHASENA',
  periode: '2026/2027',
  tagline: '-',
  deskripsi:
    'Badan Eksekutif Mahasiswa sebagai garda terdepan aspirasi dan pemberdayaan mahasiswa. Kami hadir untuk menghubungkan suara mahasiswa dengan kebijakan kampus.',
  visi:
    'Mewujudkan mahasiswa yang berdaya, kritis, dan inovatif dalam menciptakan lingkungan akademik yang inklusif dan berprestasi demi kemajuan bangsa.',
  misi: [
    'Menampung dan memperjuangkan aspirasi seluruh mahasiswa secara transparan dan akuntabel.',
    'Memfasilitasi pengembangan kompetensi mahasiswa di bidang akademik dan non-akademik.',
    'Membangun sinergi antar organisasi kemahasiswaan untuk program kerja yang berdampak.',
    'Mendorong partisipasi aktif mahasiswa dalam kehidupan kampus dan masyarakat.',
  ],
  sosmed: {
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    tiktok: 'https://tiktok.com',
    email: 'bem@universitas.ac.id',
    whatsapp: 'https://wa.me/62812345678',
  },
};

// ============================================================
// Sub-Komponen
// ============================================================

function StatCard({ value, label, icon: Icon, color }) {
  // Ubah ke warna solid cerah
  const colorMap = {
    purple: 'bg-white border-[#004B5F]/20',
    indigo: 'bg-white border-blue-500/20',
    emerald: 'bg-white border-emerald-500/20',
    amber: 'bg-white border-amber-500/20',
  };
  const iconColorMap = {
    purple: 'text-[#004B5F]',
    indigo: 'text-blue-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${colorMap[color]} p-5 flex flex-col gap-3 group hover:scale-[1.03] transition-transform duration-300 shadow-sm hover:shadow-md`}
    >
      <Icon className={`h-6 w-6 ${iconColorMap[color]}`} />
      <div>
        <p className="text-3xl font-extrabold text-[#004B5F]">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, buttonLabel, onClick, accent }) {
  const accentMap = {
    purple: {
      border: 'hover:border-[#004B5F]/40',
      iconBg: 'bg-[#E6F3F7] border border-[#CCE7EF]',
      iconColor: 'text-[#004B5F]',
      btn: 'bg-[#004B5F] hover:bg-[#003847] shadow-[#004B5F]/25',
    },
    indigo: {
      border: 'hover:border-blue-500/40',
      iconBg: 'bg-blue-50 border border-blue-200',
      iconColor: 'text-blue-600',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-50 border border-emerald-200',
      iconColor: 'text-emerald-600',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25',
    },
  };
  const a = accentMap[accent];
  return (
    <div
      className={`group flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 ${a.border} hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl`}
    >
      <div className={`w-12 h-12 rounded-xl ${a.iconBg} flex items-center justify-center`}>
        <Icon className={`h-6 w-6 ${a.iconColor}`} />
      </div>
      <div className="flex-grow space-y-2">
        <h3 className="text-lg font-bold text-[#004B5F]">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={`flex items-center gap-2 self-start text-sm font-semibold text-white px-4 py-2 rounded-lg ${a.btn} shadow-lg hover:shadow-xl transition-all cursor-pointer`}
      >
        {buttonLabel}
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

function LeaderCard({ pengurus }) {
  if (!pengurus) return null;
  return (
    <div className="relative group flex flex-col items-center text-center rounded-2xl border border-gray-200 bg-white p-6 hover:border-[#004B5F]/30 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg overflow-hidden">
      <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#004B5F] transition-colors shadow-sm mb-4 bg-slate-50">
        {pengurus.foto_url ? (
          <img src={pengurus.foto_url} alt={pengurus.nama} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Users className="h-10 w-10 text-slate-300" />
          </div>
        )}
      </div>
      <h4 className="font-extrabold text-[#004B5F] text-base">{pengurus.nama}</h4>
      <p className="text-xs text-slate-600 font-semibold mt-0.5">{pengurus.jabatan}</p>
      <p className="text-[10px] text-slate-400 mt-2">Kabinet {pengurus.periode_tahun}</p>
    </div>
  );
}

// ============================================================
// Main Landing Page Component
// ============================================================
export default function LandingPage() {
  const navigate = useNavigate();
  const { kementerian, pengurus, aspirasi, rilisAdvokasi } = useMockDatabase();
  const [pimpinan, setPimpinan] = useState([]);
  const [stats, setStats] = useState({ kementerian: 0, pengurus: 0, aspirasi: 0, rilis: 0 });

  useEffect(() => {
    // Ambil pimpinan berdasarkan hierarki kementerian order 0
    const presmaKem = kementerian.find((k) => k.hierarki_order === 0);
    const pimpinanList = presmaKem
      ? pengurus.filter((p) => p.kementerian_id === presmaKem.id && p.periode_tahun === BEM_CONFIG.periode)
      : [];

    setPimpinan(pimpinanList.slice(0, 2)); // Presma & Wapresma
    setStats({
      kementerian: kementerian.length,
      pengurus: pengurus.filter((p) => p.periode_tahun === BEM_CONFIG.periode).length,
      aspirasi: aspirasi.length,
      rilis: rilisAdvokasi.filter((r) => r.status === 'diterbitkan').length,
    });
  }, [kementerian, pengurus, aspirasi, rilisAdvokasi]);

  const scrollToContent = () => {
    document.getElementById('fitur-utama')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-0">
      {/* ── HERO SECTION ──────────────────────────────────── */}
      <section className="relative min-h-[92vh] min-h-[680px] lg:min-h-[780px] flex flex-col items-center justify-center text-center px-4 pb-24 sm:pb-32 overflow-hidden bg-white">
        <div className="relative z-10 max-w-4xl mx-auto space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#CCE7EF] bg-[#E6F3F7] text-[#004B5F] text-xs font-bold uppercase tracking-widest">
            <Star className="h-3 w-3" />
            Kabinet {BEM_CONFIG.namaKabinet} · {BEM_CONFIG.periode}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight">
            <span className="text-[#004B5F]">Badan Eksekutif</span>
            <br />
            <span className="text-[#004B5F]">Mahasiswa</span>
            <br />
            <span className="text-slate-500 text-3xl sm:text-4xl md:text-5xl">
              {BEM_CONFIG.namaUniversitas}
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            <span className="italic text-[#004B5F] font-semibold">&ldquo;{BEM_CONFIG.tagline}&rdquo;</span>
            <br />
            <span className="text-sm md:text-base">{BEM_CONFIG.deskripsi}</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/aspirasi')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#EE152A] hover:bg-[#C20F20] text-white font-bold text-sm shadow-xl shadow-[#EE152A]/20 hover:shadow-[#EE152A]/40 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              Sampaikan Aspirasi
            </button>
            <button
              onClick={() => navigate('/kabinet')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-gray-200 bg-white text-[#004B5F] font-bold text-sm hover:border-[#004B5F]/50 hover:bg-slate-50 transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm hover:shadow-md"
            >
              <Users className="h-4 w-4" />
              Kenali Kabinet Kami
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 hover:text-[#004B5F] transition-colors cursor-pointer group"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold">Jelajahi</span>
          <ChevronDown className="h-5 w-5 animate-bounce group-hover:text-[#004B5F]" />
        </button>
      </section>

      {/* ── STATISTIK ────────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-50" id="fitur-utama">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={stats.kementerian} label="Kementerian Aktif" icon={TrendingUp} color="purple" />
            <StatCard value={stats.pengurus}    label="Pengurus Kabinet"  icon={Users}       color="indigo" />
            <StatCard value={stats.aspirasi}    label="Aspirasi Masuk" icon={Megaphone} color="emerald" />
            <StatCard value={stats.rilis}       label="Rilis Advokasi"  icon={BookOpen}   color="amber" />
          </div>
        </div>
      </section>

      {/* ── FITUR UTAMA ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-[#004B5F] font-extrabold">Layanan Kami</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#004B5F] leading-tight">
              Semua yang Anda Butuhkan,<br />
              dalam Satu Platform
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              BEM hadir digital agar setiap mahasiswa dapat berinteraksi, mengetahui informasi, dan berpartisipasi dengan mudah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              icon={MessageSquare}
              title="Kotak Aspirasi"
              description="Sampaikan keluhan, saran, dan ide Anda secara anonim maupun terbuka. Setiap aspirasi dimoderasi dan diteruskan ke pihak berwenang."
              buttonLabel="Sampaikan Sekarang"
              onClick={() => navigate('/aspirasi')}
              accent="purple"
            />
            <FeatureCard
              icon={Users}
              title="Struktur Kabinet"
              description="Kenali pengurus BEM, latar belakang, prestasi, dan riwayat organisasi mereka. Tersedia untuk setiap periode kepengurusan."
              buttonLabel="Lihat Kabinet"
              onClick={() => navigate('/kabinet')}
              accent="indigo"
            />
          </div>
        </div>
      </section>

      {/* ── VISI & MISI ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <p className="text-xs uppercase tracking-widest text-[#004B5F] font-extrabold mb-2">Identitas Organisasi</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#004B5F]">Visi & Misi BEM</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Visi */}
              <div className="p-8 space-y-4 border-b md:border-b-0 md:border-r border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-[#E6F3F7] border border-[#CCE7EF]">
                    <BookOpen className="h-5 w-5 text-[#004B5F]" />
                  </div>
                  <h3 className="font-extrabold text-[#004B5F] text-lg">Visi</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm font-medium italic border-l-2 border-[#004B5F] pl-4">
                  &ldquo;{BEM_CONFIG.visi}&rdquo;
                </p>
              </div>

              {/* Misi */}
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-extrabold text-[#004B5F] text-lg">Misi</h3>
                </div>
                <ul className="space-y-3">
                  {BEM_CONFIG.misi.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-[#EE152A] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIMPINAN KABINET ─────────────────────────────── */}
      {pimpinan.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-[#004B5F] font-extrabold">Pucuk Pimpinan</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#004B5F]">
                Presiden & Wakil Presiden Mahasiswa
              </h2>
              <p className="text-slate-500 text-sm">Kabinet {BEM_CONFIG.namaKabinet} · Periode {BEM_CONFIG.periode}</p>
            </div>
            <div className={`grid gap-6 max-w-lg mx-auto ${pimpinan.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {pimpinan.map((p) => (
                <LeaderCard key={p.id} pengurus={p} />
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => navigate('/kabinet')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-slate-500 hover:text-[#004B5F] hover:border-[#004B5F]/40 hover:bg-slate-50 text-sm font-semibold transition-all cursor-pointer"
              >
                Lihat Seluruh Struktur Kabinet
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ASPIRASI ─────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-[#CCE7EF] bg-white shadow-xl p-10 md:p-14 text-center">
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#CCE7EF] bg-[#E6F3F7] text-[#004B5F] text-xs font-bold uppercase tracking-widest">
                <Megaphone className="h-3.5 w-3.5" />
                Suaramu Penting
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#004B5F] leading-tight">
                Punya keluhan atau saran<br />
                untuk kampus kita?
              </h2>
              <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                BEM siap mendengar dan memperjuangkan suaramu. Kirimkan aspirasi secara anonim atau dengan identitas — keduanya kami jamin privasi dan keamanannya.
              </p>
              <button
                onClick={() => navigate('/aspirasi')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#EE152A] hover:bg-[#C20F20] text-white font-bold text-sm shadow-xl shadow-[#EE152A]/20 hover:shadow-[#EE152A]/40 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                Kirim Aspirasi Sekarang
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
