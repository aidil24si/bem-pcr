import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
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
  namaKabinet: 'Kabinet Presma Magang Bandung',
  periode: '2026/2027',
  tagline: 'Walau Presma Magang, Kabinet Tidak Tumbang',
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
  const colorMap = {
    purple: 'from-purple-600 to-purple-800 border-purple-500/30',
    indigo: 'from-indigo-600 to-indigo-800 border-indigo-500/30',
    emerald: 'from-emerald-600 to-emerald-800 border-emerald-500/30',
    amber: 'from-amber-600 to-amber-800 border-amber-500/30',
  };
  const iconColorMap = {
    purple: 'text-purple-300',
    indigo: 'text-indigo-300',
    emerald: 'text-emerald-300',
    amber: 'text-amber-300',
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorMap[color]} p-5 flex flex-col gap-3 group hover:scale-[1.03] transition-transform duration-300`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.07),transparent_60%)]" />
      <Icon className={`h-6 w-6 ${iconColorMap[color]}`} />
      <div>
        <p className="text-3xl font-extrabold text-white">{value}</p>
        <p className="text-xs text-white/60 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, buttonLabel, onClick, accent }) {
  const accentMap = {
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 border border-purple-500/20',
      iconColor: 'text-purple-400',
      btn: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25',
    },
    indigo: {
      border: 'hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 border border-indigo-500/20',
      iconColor: 'text-indigo-400',
      btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
      iconColor: 'text-emerald-400',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25',
    },
  };
  const a = accentMap[accent];
  return (
    <div
      className={`group flex flex-col gap-5 rounded-2xl border border-white/5 bg-gray-950/50 backdrop-blur-md p-6 ${a.border} hover:bg-gray-950/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
    >
      <div className={`w-12 h-12 rounded-xl ${a.iconBg} flex items-center justify-center`}>
        <Icon className={`h-6 w-6 ${a.iconColor}`} />
      </div>
      <div className="flex-grow space-y-2">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
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
    <div className="relative group flex flex-col items-center text-center rounded-2xl border border-white/5 bg-gray-950/50 backdrop-blur-md p-6 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.06),transparent_60%)]" />
      <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-purple-500/50 group-hover:border-purple-400 transition-colors shadow-xl shadow-purple-900/40 mb-4">
        {pengurus.foto_url ? (
          <img src={pengurus.foto_url} alt={pengurus.nama} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-800 flex items-center justify-center">
            <Users className="h-10 w-10 text-gray-500" />
          </div>
        )}
      </div>
      <h4 className="font-extrabold text-white text-base">{pengurus.nama}</h4>
      <p className="text-xs text-purple-400 font-semibold mt-0.5">{pengurus.jabatan}</p>
      <p className="text-[10px] text-gray-500 mt-2">Kabinet {pengurus.periode_tahun}</p>
    </div>
  );
}

// ============================================================
// Main Landing Page Component
// ============================================================
export default function LandingPage({ onNavigate }) {
  const [pimpinan, setPimpinan] = useState([]);
  const [stats, setStats] = useState({ kementerian: 0, pengurus: 0, aspirasi: 0, ruangan: 0 });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch pimpinan (Presma & Wapresma)
      const { data: pengurusData } = await supabase
        .from('pengurus')
        .select('*')
        .eq('periode_tahun', BEM_CONFIG.periode);

      const kemData = await supabase.from('kementerian').select('*');
      const aspData = await supabase.from('aspirasi').select('*').eq('status', 'diterbitkan');
      const ruangData = await supabase.from('peminjaman_ruangan').select('*');

      // Ambil pimpinan berdasarkan hierarki kementerian order 0
      const kemList = kemData.data || [];
      const presmaKem = kemList.find((k) => k.hierarki_order === 0);
      const pimpinanList = presmaKem
        ? (pengurusData || []).filter((p) => p.kementerian_id === presmaKem.id)
        : [];

      setPimpinan(pimpinanList.slice(0, 2)); // Presma & Wapresma
      setStats({
        kementerian: kemList.length,
        pengurus: (pengurusData || []).filter((p) => p.periode_tahun === BEM_CONFIG.periode).length,
        aspirasi: (aspData.data || []).length,
        ruangan: (ruangData.data || []).length,
      });
    };

    fetchData();
  }, []);

  const scrollToContent = () => {
    document.getElementById('fitur-utama')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-0">
      {/* ── HERO SECTION ──────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-700/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Star className="h-3 w-3" />
            Kabinet {BEM_CONFIG.namaKabinet} · {BEM_CONFIG.periode}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight">
            <span className="text-white">Badan Eksekutif</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Mahasiswa
            </span>
            <br />
            <span className="text-gray-300 text-3xl sm:text-4xl md:text-5xl">
              {BEM_CONFIG.namaUniversitas}
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            <span className="italic text-purple-300 font-semibold">&ldquo;{BEM_CONFIG.tagline}&rdquo;</span>
            <br />
            <span className="text-sm md:text-base">{BEM_CONFIG.deskripsi}</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('aspirasi')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-xl shadow-purple-900/50 hover:shadow-purple-900/70 transition-all hover:scale-105 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              Sampaikan Aspirasi
            </button>
            <button
              onClick={() => onNavigate('kabinet')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-gray-700 bg-gray-950/60 text-gray-200 font-bold text-sm hover:border-purple-500/50 hover:text-white transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
            >
              <Users className="h-4 w-4" />
              Kenali Kabinet Kami
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer group"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold">Jelajahi</span>
          <ChevronDown className="h-5 w-5 animate-bounce group-hover:text-purple-400" />
        </button>
      </section>

      {/* ── STATISTIK ────────────────────────────────────── */}
      <section className="py-16 px-4" id="fitur-utama">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={stats.kementerian} label="Kementerian Aktif" icon={TrendingUp} color="purple" />
            <StatCard value={stats.pengurus}    label="Pengurus Kabinet"  icon={Users}       color="indigo" />
            <StatCard value={stats.aspirasi}    label="Aspirasi Diterbitkan" icon={Megaphone} color="emerald" />
            <StatCard value={stats.ruangan}     label="Jadwal Terdaftar"  icon={Calendar}   color="amber" />
          </div>
        </div>
      </section>

      {/* ── FITUR UTAMA ──────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-purple-400 font-extrabold">Layanan Kami</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Semua yang Anda Butuhkan,<br />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                dalam Satu Platform
              </span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              BEM hadir digital agar setiap mahasiswa dapat berinteraksi, mengetahui informasi, dan berpartisipasi dengan mudah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={MessageSquare}
              title="Kotak Aspirasi"
              description="Sampaikan keluhan, saran, dan ide Anda secara anonim maupun terbuka. Setiap aspirasi dimoderasi dan diteruskan ke pihak berwenang."
              buttonLabel="Sampaikan Sekarang"
              onClick={() => onNavigate('aspirasi')}
              accent="purple"
            />
            <FeatureCard
              icon={Calendar}
              title="Jadwal Ruangan"
              description="Cek jadwal peminjaman ruangan ormawa secara real-time. Hindari bentrokan jadwal antar organisasi dengan mudah."
              buttonLabel="Lihat Jadwal"
              onClick={() => onNavigate('ruangan')}
              accent="indigo"
            />
            <FeatureCard
              icon={Users}
              title="Struktur Kabinet"
              description="Kenali pengurus BEM, latar belakang, prestasi, dan riwayat organisasi mereka. Tersedia untuk setiap periode kepengurusan."
              buttonLabel="Lihat Kabinet"
              onClick={() => onNavigate('kabinet')}
              accent="emerald"
            />
          </div>
        </div>
      </section>

      {/* ── VISI & MISI ──────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-white/5 bg-gray-950/40 backdrop-blur-md overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-white/5">
              <p className="text-xs uppercase tracking-widest text-purple-400 font-extrabold mb-2">Identitas Organisasi</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Visi & Misi BEM</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Visi */}
              <div className="p-8 space-y-4 border-b md:border-b-0 md:border-r border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <BookOpen className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="font-extrabold text-white text-lg">Visi</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm font-medium italic border-l-2 border-purple-500 pl-4">
                  &ldquo;{BEM_CONFIG.visi}&rdquo;
                </p>
              </div>

              {/* Misi */}
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Zap className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="font-extrabold text-white text-lg">Misi</h3>
                </div>
                <ul className="space-y-3">
                  {BEM_CONFIG.misi.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
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
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-purple-400 font-extrabold">Pucuk Pimpinan</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Presiden & Wakil Presiden Mahasiswa
              </h2>
              <p className="text-gray-400 text-sm">Kabinet {BEM_CONFIG.namaKabinet} · Periode {BEM_CONFIG.periode}</p>
            </div>
            <div className={`grid gap-6 max-w-lg mx-auto ${pimpinan.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {pimpinan.map((p) => (
                <LeaderCard key={p.id} pengurus={p} />
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => onNavigate('kabinet')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-purple-500/40 text-sm font-semibold transition-all cursor-pointer"
              >
                Lihat Seluruh Struktur Kabinet
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ASPIRASI ─────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 via-gray-950 to-indigo-900/30 p-10 md:p-14 text-center">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-widest">
                <Megaphone className="h-3.5 w-3.5" />
                Suaramu Penting
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Punya keluhan atau saran<br />
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  untuk kampus kita?
                </span>
              </h2>
              <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                BEM siap mendengar dan memperjuangkan suaramu. Kirimkan aspirasi secara anonim atau dengan identitas — keduanya kami jamin privasi dan keamanannya.
              </p>
              <button
                onClick={() => onNavigate('aspirasi')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-xl shadow-purple-900/50 hover:shadow-purple-900/70 transition-all hover:scale-105 cursor-pointer"
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
