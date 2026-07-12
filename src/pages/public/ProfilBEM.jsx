import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { BookOpen, Target, Award, ShieldAlert, History, Landmark, Sparkles, Compass } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';

const KABINET_PERIODS = [
  {
    periode: '2025/2026',
    namaKabinet: 'Kabinet Nusantara Maju',
    tagline: 'Bersama Bergerak, Bersatu Membangun',
    deskripsiKabinet: 'Kabinet Nusantara Maju membawa semangat persatuan, progresivitas, dan keberlanjutan. Kami berkomitmen untuk menjadi motor penggerak perubahan positif di lingkungan universitas dan masyarakat luas.',
    visi: 'Mewujudkan mahasiswa yang berdaya, kritis, dan inovatif dalam menciptakan lingkungan akademik yang inklusif dan berprestasi demi kemajuan bangsa.',
    misi: [
      {
        title: 'Advokasi Responsif',
        desc: 'Menampung dan memperjuangkan aspirasi seluruh mahasiswa secara transparan, solutif, dan akuntabel kepada pihak birokrasi kampus.'
      },
      {
        title: 'Pengembangan Potensi',
        desc: 'Memfasilitasi peningkatan kompetensi akademik, minat-bakat, kepemimpinan, dan kewirausahaan mahasiswa.'
      },
      {
        title: 'Sinergi Ormawa',
        desc: 'Membangun kolaborasi harmonis dan aktif dengan seluruh Organisasi Kemahasiswaan (Ormawa) demi terwujudnya iklim kampus yang dinamis.'
      },
      {
        title: 'Pengabdian Masyarakat',
        desc: 'Menginisiasi gerakan sosial-kemasyarakatan yang nyata dan berkelanjutan sebagai bentuk perwujudan Tri Dharma Perguruan Tinggi.'
      }
    ],
    tujuan: [
      'Meningkatkan partisipasi aktif mahasiswa dalam kegiatan internal dan eksternal kampus.',
      'Menjamin hak-hak mahasiswa terpenuhi melalui jalur diplomasi yang sehat dengan rektorat.',
      'Mewujudkan tata kelola BEM yang profesional, bersih, dan berbasis digital.'
    ],
    logoFilosofi: [
      {
        simbol: 'Pena & Buku',
        arti: 'Melambangkan keilmuan, intelektualitas, dan pemikiran kritis mahasiswa yang menjadi dasar pergerakan.'
      },
      {
        simbol: 'Dua Sayap Mengepak',
        arti: 'Melambangkan kebebasan akademik dan cita-cita tinggi untuk terbang membawa nama baik almamater.'
      },
      {
        simbol: 'Lingkaran Persatuan',
        arti: 'Melambangkan sinergi dan kolaborasi yang inklusif antar seluruh elemen mahasiswa tanpa memandang latar belakang.'
      },
      {
        simbol: 'Warna Ungu & Emas',
        arti: 'Warna ungu melambangkan kebijaksanaan, kreativitas, dan ambisi; warna emas melambangkan kejayaan dan integritas.'
      }
    ]
  },
  {
    periode: '2024/2025',
    namaKabinet: 'Kabinet Sinergi Progresif',
    tagline: 'Berakar Kuat, Menjulang Tinggi',
    deskripsiKabinet: 'Kabinet Sinergi Progresif fokus pada penguatan internal organisasi, peningkatan sarana dan prasarana ormawa, serta kolaborasi antar kementerian untuk menghasilkan program kerja yang inklusif.',
    visi: 'Menjadikan BEM Universitas wadah kolaborasi aktif yang dinamis, tanggap, dan profesional dalam mendampingi langkah mahasiswa berprestasi.',
    misi: [
      {
        title: 'Konsolidasi Internal',
        desc: 'Merapikan manajemen ormawa dan administrasi internal agar terkoordinasi secara efektif dan profesional.'
      },
      {
        title: 'Kemitraan Eksternal',
        desc: 'Membuka kerja sama dengan lembaga mahasiswa eksternal, industri, dan alumni untuk mendukung karir lulusan.'
      },
      {
        title: 'Digitalisasi Layanan',
        desc: 'Mulai mengenalkan platform pelaporan digital serta sistem reservasi ruang pertemuan terpusat.'
      }
    ],
    tujuan: [
      'Menyelesaikan standardisasi administrasi seluruh UKM/Ormawa.',
      'Membangun inkubator ide sosial kemahasiswaan tingkat daerah.'
    ],
    logoFilosofi: [
      {
        simbol: 'Tiga Garis Sinergi',
        arti: 'Melambangkan integrasi tri dharma perguruan tinggi dalam kehidupan mahasiswa sehari-hari.'
      },
      {
        simbol: 'Warna Biru Laut',
        arti: 'Melambangkan ketenangan, kepercayaan, dan kedalaman visi pergerakan kabinet.'
      }
    ]
  }
];

export default function ProfilBEM() {
  useDocumentTitle('Profil BEM');
  const [cabinetPeriods, setCabinetPeriods] = useState(KABINET_PERIODS);
  const [selectedPeriod, setSelectedPeriod] = useState('2025/2026');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCabinets = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('kabinet_periode')
          .select('*')
          .order('periode', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map((d) => ({
            periode: d.periode,
            namaKabinet: d.nama_kabinet,
            tagline: d.tagline,
            deskripsiKabinet: d.deskripsi_kabinet,
            visi: d.visi,
            misi: Array.isArray(d.misi) 
              ? d.misi 
              : typeof d.misi === 'string' 
                ? JSON.parse(d.misi) 
                : [],
            tujuan: Array.isArray(d.tujuan) 
              ? d.tujuan 
              : typeof d.tujuan === 'string' 
                ? JSON.parse(d.tujuan) 
                : [],
            logoFilosofi: Array.isArray(d.logo_filosofi) 
              ? d.logo_filosofi 
              : typeof d.logo_filosofi === 'string' 
                ? JSON.parse(d.logo_filosofi) 
                : [],
          }));
          setCabinetPeriods(formatted);
          setSelectedPeriod(formatted[0].periode);
        }
      } catch (err) {
        console.log('Using local cabinet periods fallback data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCabinets();
  }, []);

  // Find active cabinet details
  const activeCabinet = cabinetPeriods.find(k => k.periode === selectedPeriod) || cabinetPeriods[0];

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
      
      {/* ── HEADER HERO (Pola PageHeader Pemersatu) ───────── */}
      <PageHeader
        tag="Profil Resmi BEM"
        icon={Landmark}
        title="Badan Eksekutif Mahasiswa"
        description="Kenali peran utama BEM sebagai lembaga eksekutif tertinggi mahasiswa serta telusuri rekam jejak visi, misi, dan kabinet kepengurusan kami antar-periode."
      />

      {/* ── SEJARAH & PERAN SINGKAT (General) ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-purple-400" />
            Apa itu BEM Universitas?
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Badan Eksekutif Mahasiswa (BEM) merupakan lembaga eksekutif tertinggi di tingkat universitas yang bertugas untuk memimpin koordinasi kegiatan kemahasiswaan, menyalurkan aspirasi, serta menyelenggarakan kegiatan pengembangan minat, bakat, keilmuan, dan pelayanan sosial-politik mahasiswa.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Sebagai perpanjangan tangan mahasiswa ke rektorat dan masyarakat luas, BEM berupaya mewujudkan iklim kampus yang demokratis, progresif, dan inklusif. Kami percaya kepemimpinan yang berintegritas berakar dari pelayanan yang tulus dan komunikasi yang terbuka.
          </p>
        </div>
        <div className="md:col-span-5">
          <Card className="border-gray-800 bg-gray-900/40 backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/10 border border-purple-500/20 rounded-lg">
                  <Compass className="h-5 w-5 text-purple-400" />
                </div>
                <h4 className="font-bold text-white">Prinsip Kerja BEM</h4>
              </div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Inklusif:</strong> Terbuka untuk seluruh mahasiswa tanpa membedakan golongan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Progresif:</strong> Selalu berinovasi dan adaptif terhadap perkembangan teknologi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Substantif:</strong> Mengutamakan dampak nyata bagi mahasiswa dan civitas akademika.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── ARSIP KABINET & SELEKTOR PERIODE ──────────────── */}
      <div className="border-t border-gray-900 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Arsip & Filosofi Kabinet
            </h3>
            <p className="text-xs text-gray-400">Pilih periode kepengurusan untuk melihat visi-misi kabinet sejarah.</p>
          </div>
          <div className="flex bg-gray-950 p-1.5 rounded-xl border border-gray-800/80 max-w-sm">
            {cabinetPeriods.map(k => (
              <button
                key={k.periode}
                onClick={() => setSelectedPeriod(k.periode)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === k.periode
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/45'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Periode {k.periode}
              </button>
            ))}
          </div>
        </div>

        {/* Kabinet Details */}
        <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-900 pb-6">
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-widest text-purple-400 font-extrabold">Filosofi & Tagline</p>
              <h3 className="text-2xl font-bold text-white">{activeCabinet.namaKabinet}</h3>
              <p className="text-xs text-gray-400 italic">Slogan: &ldquo;{activeCabinet.tagline}&rdquo;</p>
            </div>
            <div className="shrink-0 flex items-center justify-center h-14 w-14 rounded-full border border-purple-500/25 bg-purple-500/5 text-purple-400">
              <Landmark className="h-6 w-6" />
            </div>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">
            {activeCabinet.deskripsiKabinet}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {activeCabinet.logoFilosofi.map((logo, index) => (
              <div key={index} className="p-4 rounded-xl border border-gray-900 bg-gray-900/20 space-y-2">
                <div className="inline-flex items-center justify-center p-1.5 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
                  {logo.simbol}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{logo.arti}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── VISI & MISI KABINET AKTIF ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visi */}
        <div className="lg:col-span-5">
          <Card className="h-full border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-gray-950 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <BookOpen className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-extrabold text-white text-xl">Visi Kabinet</h3>
              </div>
              <p className="text-gray-200 leading-relaxed text-sm italic border-l-4 border-purple-500 pl-4">
                &ldquo;{activeCabinet.visi}&rdquo;
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-900 text-xs text-purple-300 font-medium">
              Visi Utama periode kepengurusan {activeCabinet.periode}
            </div>
          </Card>
        </div>

        {/* Misi */}
        <div className="lg:col-span-7">
          <Card className="border-gray-800 bg-gray-900/40 backdrop-blur-md h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Target className="h-6 w-6 text-indigo-400" />
                </div>
                <CardTitle className="text-white text-xl">Misi Kabinet</CardTitle>
              </div>
              <CardDescription>Langkah-langkah strategis untuk merealisasikan visi.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeCabinet.misi.map((m, index) => (
                <div key={index} className="p-4 rounded-xl border border-gray-800/80 bg-gray-950/40 hover:border-indigo-500/30 transition-all">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-1">Misi 0{index + 1}</span>
                  <h4 className="font-bold text-white text-sm mb-1">{m.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── TUJUAN UTAMA KEPENGURUSAN ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <Card className="border-gray-800 bg-gray-900/40 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-white text-base">Tujuan Utama Periode {activeCabinet.periode}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-xs text-gray-300">
              {activeCabinet.tujuan.map((t, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">0{idx + 1}.</span>
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/40 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-white text-base">Nilai & Integritas BEM</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-gray-400">
            <p className="leading-relaxed">
              Seluruh pengurus Badan Eksekutif Mahasiswa terikat oleh kode etik organisasi yang ketat demi menjaga nama baik almamater, transparansi keuangan, dan objektivitas penyaluran aspirasi mahasiswa.
            </p>
            <p className="leading-relaxed">
              Kami menjunjung tinggi kebebasan berpendapat dan independensi lembaga mahasiswa dari segala bentuk intervensi politik praktis pihak luar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
