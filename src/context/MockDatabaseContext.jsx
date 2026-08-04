import React, { createContext, useContext, useState, useEffect } from 'react';

const MockDatabaseContext = createContext(null);

// Initial Seed Data
const INITIAL_KEMENTERIAN = [
  { id: 'k-presma', nama_kementerian: 'Presiden & Wakil Presiden Mahasiswa', hierarki_order: 0, rumpun: 'Pimpinan' },
  { id: 'k-sekum-1', nama_kementerian: 'Sekretaris Umum 1', hierarki_order: 1, rumpun: 'Inti' },
  { id: 'k-sekum-2', nama_kementerian: 'Sekretaris Umum 2', hierarki_order: 1, rumpun: 'Inti' },
  { id: 'k-bendum-1', nama_kementerian: 'Bendahara Umum 1', hierarki_order: 1, rumpun: 'Inti' },
  { id: 'k-bendum-2', nama_kementerian: 'Bendahara Umum 2', hierarki_order: 1, rumpun: 'Inti' },
  { id: 'k-protokol', nama_kementerian: 'Protokoler Utama', hierarki_order: 1, rumpun: 'Inti' },
  { id: 'k-advokesma', nama_kementerian: 'Kementerian Advokasi & Kesejahteraan Mahasiswa (Advokesma)', hierarki_order: 2, rumpun: 'Pelayanan & Isu' },
  { id: 'k-kemensospol', nama_kementerian: 'Kementerian Sosial & Politik (Kemensospol)', hierarki_order: 2, rumpun: 'Pelayanan & Isu' },
  { id: 'k-psdm', nama_kementerian: 'Kementerian Pengembangan SDM & Pesdikma', hierarki_order: 2, rumpun: 'Internal & SDM' },
  { id: 'k-kemenag', nama_kementerian: 'Kementerian Agama (Kemenag)', hierarki_order: 2, rumpun: 'Internal & SDM' },
  { id: 'k-kemenpora', nama_kementerian: 'Kementerian Pemuda & Olahraga (Kemenpora)', hierarki_order: 2, rumpun: 'Internal & SDM' },
  { id: 'k-kemenkraf', nama_kementerian: 'Kementerian Ekonomi Kreatif (Kemenkraf)', hierarki_order: 2, rumpun: 'Eksternal & Kreatif' },
  { id: 'k-kemensenbud', nama_kementerian: 'Kementerian Seni & Budaya (Kemensenbud)', hierarki_order: 2, rumpun: 'Eksternal & Kreatif' },
  { id: 'k-kominfo', nama_kementerian: 'Kementerian Komunikasi & Informasi (Kominfo)', hierarki_order: 2, rumpun: 'Eksternal & Kreatif' },
  { id: 'k-kemenlu', nama_kementerian: 'Kementerian Luar Negeri (Kemenlu)', hierarki_order: 2, rumpun: 'Eksternal & Kreatif' },
];

const INITIAL_PENGURUS = [
  {
    id: 'p1',
    kementerian_id: 'k-presma',
    nama: 'Aidil Ikhsan Rezki Idris',
    jabatan: 'Presiden Mahasiswa',
    prestasi_akademik: ['Juara 1 Web Design Nasional'],
    prestasi_non_akademik: ['Debat Bahasa Inggris'],
    riwayat_organisasi: ['Ketua HIMA 2024'],
    foto_url: null,
    periode_tahun: '2026/2027',
  },
  {
    id: 'p2',
    kementerian_id: 'k-presma',
    nama: 'Baydella',
    jabatan: 'Wakil Presiden Mahasiswa',
    prestasi_akademik: ['IPK 3.9', 'Mawapres 2025'],
    prestasi_non_akademik: [],
    riwayat_organisasi: ['Sekretaris BEM 2025'],
    foto_url: null,
    periode_tahun: '2026/2027',
  },
];

const INITIAL_RILIS = [
  {
    id: 'rilis-1',
    judul_isu: 'Perbaikan Pendingin Ruangan (AC) di Gedung H.3.1',
    kategori_isu: 'Fasilitas',
    pembahasan_offline: 'BEM telah berkoordinasi dengan Sarpras Rektorat untuk menindaklanjuti keluhan mahasiswa mengenai AC kelas Gedung Baru yang bocor. Rektorat telah menjadwalkan perbaikan menyeluruh pada hari Sabtu ini.',
    status: 'diterbitkan',
    tanggal_rilis: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
];

const INITIAL_ASPIRASI = [
  {
    id: 'a1',
    tipe_isu: 'tangible',
    identitas: { nama: 'Fajar Nugraha', nim: '12345678', email: 'fajar@mahasiswa.pcr.ac.id' },
    deskripsi: 'AC di Ruang Kelas H.3.1 Gedung Baru bocor dan kurang dingin selama dua minggu terakhir.',
    bukti_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=300',
    rilis_id: 'rilis-1', // Terhubung dengan rilis di atas
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a2',
    tipe_isu: 'intangible',
    identitas: null, // Anonim
    deskripsi: 'Pelayanan birokrasi kemahasiswaan fakultas sangat lambat dalam memproses surat rekomendasi beasiswa.',
    bukti_url: null,
    rilis_id: null, // Belum dikonsolidasi
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a3',
    tipe_isu: 'intangible',
    identitas: { nama: 'Andi Wijaya', nim: '87654321', email: 'andi@mahasiswa.pcr.ac.id' },
    deskripsi: 'Sistem pengajuan beasiswa sering error di jam sibuk.',
    bukti_url: null,
    rilis_id: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_PROFILES = [
  {
    id: 'admin-super-id',
    nama: 'Super Admin BEM',
    role: 'super_admin',
    kementerian_id: null,
    email: 'bem@pcr.ac.id',
  },
];

export const MockDatabaseProvider = ({ children }) => {
  // Load initial state from local storage or fallback to seed data
  const [kementerian] = useState(() => JSON.parse(localStorage.getItem('mvp_kementerian')) || INITIAL_KEMENTERIAN);
  const [pengurus, setPengurus] = useState(() => JSON.parse(localStorage.getItem('mvp_pengurus')) || INITIAL_PENGURUS);
  const [aspirasi, setAspirasi] = useState(() => JSON.parse(localStorage.getItem('mvp_aspirasi')) || INITIAL_ASPIRASI);
  const [rilisAdvokasi, setRilisAdvokasi] = useState(() => JSON.parse(localStorage.getItem('mvp_rilis')) || INITIAL_RILIS);
  const [profiles] = useState(() => JSON.parse(localStorage.getItem('mvp_profiles')) || INITIAL_PROFILES);
  
  // Auth Session
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('mvp_session')) || null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('mvp_kementerian', JSON.stringify(kementerian));
    localStorage.setItem('mvp_pengurus', JSON.stringify(pengurus));
    localStorage.setItem('mvp_aspirasi', JSON.stringify(aspirasi));
    localStorage.setItem('mvp_rilis', JSON.stringify(rilisAdvokasi));
    localStorage.setItem('mvp_profiles', JSON.stringify(profiles));
    localStorage.setItem('mvp_session', JSON.stringify(session));
  }, [kementerian, pengurus, aspirasi, rilisAdvokasi, profiles, session]);

  // Auth Methods
  const login = (email, password) => {
    // Mock validation
    const profile = profiles.find((p) => p.email === email);
    if (!profile) throw new Error('Email atau password salah');
    // Accept any password for mock
    setSession({ user: profile });
  };

  const logout = () => {
    setSession(null);
  };

  // Aspirasi Methods
  const tambahAspirasi = (data) => {
    const newAspirasi = {
      id: `a-${Date.now()}`,
      ...data,
      rilis_id: null,
      created_at: new Date().toISOString(),
    };
    setAspirasi((prev) => [newAspirasi, ...prev]);
    return newAspirasi;
  };

  const konsolidasiAspirasi = (aspirasiIds, rilisData) => {
    // 1. Create Rilis
    const newRilis = {
      id: `rilis-${Date.now()}`,
      ...rilisData,
      status: 'diterbitkan',
      tanggal_rilis: new Date().toISOString()
    };
    
    // 2. Update Aspirasi array
    const updatedAspirasi = aspirasi.map(asp => {
      if (aspirasiIds.includes(asp.id)) {
        return { ...asp, rilis_id: newRilis.id };
      }
      return asp;
    });

    setRilisAdvokasi(prev => [newRilis, ...prev]);
    setAspirasi(updatedAspirasi);
  };

  // Pengurus Methods
  const tambahPengurus = (data) => {
    const newPengurus = {
      id: `p-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    setPengurus(prev => [newPengurus, ...prev]);
  };

  const editPengurus = (id, data) => {
    setPengurus(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const hapusPengurus = (id) => {
    setPengurus(prev => prev.filter(p => p.id !== id));
  };

  return (
    <MockDatabaseContext.Provider value={{
      kementerian,
      pengurus,
      aspirasi,
      rilisAdvokasi,
      session,
      login,
      logout,
      tambahAspirasi,
      konsolidasiAspirasi,
      tambahPengurus,
      editPengurus,
      hapusPengurus
    }}>
      {children}
    </MockDatabaseContext.Provider>
  );
};

export const useMockDatabase = () => useContext(MockDatabaseContext);
