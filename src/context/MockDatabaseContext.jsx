import React, { createContext, useContext, useState, useEffect } from 'react';

const MockDatabaseContext = createContext(null);

// Initial Seed Data
const INITIAL_KEMENTERIAN = [
  { id: 'k-presma', nama_kementerian: 'Presiden & Wakil Presiden Mahasiswa', hierarki_order: 0, rumpun: 'Inti' },
  { id: 'k-proto', nama_kementerian: 'Protokoler', hierarki_order: 1, rumpun: 'Inti' },
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
  // 1. TOP EXECUTIVE (LEVEL 0)
  { id: 'p1', nama: 'Aidil Ikhsan Rezki Idris', jabatan: 'Presiden Mahasiswa', kementerian_id: 'k-presma', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p2', nama: 'Baydella', jabatan: 'Wakil Presiden Mahasiswa', kementerian_id: 'k-presma', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  
  // 2. CORE EXECUTIVE / SECRETARIAT (LEVEL 1)
  { id: 'p3', nama: 'Bagus Aditya Wardana', jabatan: 'Protokoler Utama', kementerian_id: 'k-protokol', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p4', nama: 'Zaskia Az-Zahra', jabatan: 'Sekretaris Umum 1', kementerian_id: 'k-sekum-1', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p5', nama: 'Amelia Nur Rismayanti', jabatan: 'Sekretaris Umum 2', kementerian_id: 'k-sekum-2', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p6', nama: 'Manisahayu', jabatan: 'Bendahara Umum 1', kementerian_id: 'k-bendum-1', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p7', nama: 'Aila Marwa', jabatan: 'Bendahara Umum 2', kementerian_id: 'k-bendum-2', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },

  // 3. RUMPUN PELAYANAN & ISU (LEVEL 2)
  { id: 'p8', nama: 'Radit Al Ikhsan', jabatan: 'Menteri Advokesma', kementerian_id: 'k-advokesma', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p9', nama: 'Nuraiva Yuliana Dalfi', jabatan: 'Sekretaris Menteri Advokesma', kementerian_id: 'k-advokesma', is_pimpinan: false, is_sekmen: true, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p10', nama: 'Rafael Ardhiwinatta Lubis', jabatan: 'Staff 1 Advokesma', kementerian_id: 'k-advokesma', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p11', nama: 'Yusuf Hamdani', jabatan: 'Staff 2 Advokesma', kementerian_id: 'k-advokesma', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p12', nama: 'Azza Zhafira Nahuway', jabatan: 'Staff 3 Advokesma', kementerian_id: 'k-advokesma', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  
  { id: 'p13', nama: 'Muhammad Raihan Fadillah Ashabi', jabatan: 'Menteri Kemensospol', kementerian_id: 'k-kemensospol', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p14', nama: 'Nungki Kusuma Wardani', jabatan: 'Sekretaris Menteri Kemensospol', kementerian_id: 'k-kemensospol', is_pimpinan: false, is_sekmen: true, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p15', nama: 'Helena Azriya', jabatan: 'Staff Kemensospol', kementerian_id: 'k-kemensospol', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },

  // 4. RUMPUN INTERNAL & SDM (LEVEL 2)
  { id: 'p16', nama: 'Sahata Repaldo Sitinjak', jabatan: 'Menteri Kemenag', kementerian_id: 'k-kemenag', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p17', nama: 'Muahammad Raffi Akbar', jabatan: 'Sekretaris Menteri Kemenag', kementerian_id: 'k-kemenag', is_pimpinan: false, is_sekmen: true, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p18', nama: 'Zulfida Deby Riana', jabatan: 'Staff 1 Kemenag', kementerian_id: 'k-kemenag', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  
  { id: 'p19', nama: 'M. Iqbal Ramadhan', jabatan: 'Menteri Pesdikma', kementerian_id: 'k-psdm', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p20', nama: 'Nabilla Aulia Vani', jabatan: 'Sekretaris Menteri Pesdikma', kementerian_id: 'k-psdm', is_pimpinan: false, is_sekmen: true, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p21', nama: 'Andhika Wijaya Kusuma', jabatan: 'Staff 1 Pesdikma', kementerian_id: 'k-psdm', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p22', nama: 'Lathifah Melia Putri', jabatan: 'Staff 2 Pesdikma', kementerian_id: 'k-psdm', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p23', nama: 'Muhammad Rizky Hidayat', jabatan: 'Staff 3 Pesdikma', kementerian_id: 'k-psdm', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  
  { id: 'p24', nama: 'Farel Rizki Fahrillah', jabatan: 'Menteri Kemenpora', kementerian_id: 'k-kemenpora', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p25', nama: 'Raihan Fadli Adi Nugroho', jabatan: 'Sekretaris Menteri Kemenpora', kementerian_id: 'k-kemenpora', is_pimpinan: false, is_sekmen: true, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p26', nama: 'Muhammd Raja Muiz', jabatan: 'Staff 1 Kemenpora', kementerian_id: 'k-kemenpora', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p27', nama: 'Reza Okta Farezi', jabatan: 'Staff 2 Kemenpora', kementerian_id: 'k-kemenpora', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },

  // 5. RUMPUN EKSTERNAL & KREATIF (LEVEL 2)
  { id: 'p28', nama: 'Nabil Putra Yonma', jabatan: 'Menteri Kemenlu', kementerian_id: 'k-kemenlu', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p29', nama: 'Aliya Raushani Putri Harahap', jabatan: 'Sekretaris Menteri Kemenlu', kementerian_id: 'k-kemenlu', is_pimpinan: false, is_sekmen: true, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p30', nama: 'Rifqi Pratama', jabatan: 'Staff 1 Kemenlu', kementerian_id: 'k-kemenlu', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p31', nama: 'Chrisheyla Putri Chintya br Napitupulu', jabatan: 'Staff 2 Kemenlu', kementerian_id: 'k-kemenlu', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  
  { id: 'p32', nama: 'Muhammad Adlu', jabatan: 'Menteri Kominfo', kementerian_id: 'k-kominfo', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p33', nama: 'Riska Handayani', jabatan: 'Sekretaris Menteri Kominfo', kementerian_id: 'k-kominfo', is_pimpinan: false, is_sekmen: true, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p34', nama: 'Muhammad Zihni Fawwas', jabatan: 'Staff 1 Kominfo', kementerian_id: 'k-kominfo', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p35', nama: 'Muhammad Rivaldi', jabatan: 'Staff 2 Kominfo', kementerian_id: 'k-kominfo', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  
  { id: 'p36', nama: 'Fitri Ariani', jabatan: 'Menteri Kemenkraf', kementerian_id: 'k-kemenkraf', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p37', nama: 'Lakeisha Fadlin', jabatan: 'Sekretaris Menteri Kemenkraf', kementerian_id: 'k-kemenkraf', is_pimpinan: false, is_sekmen: true, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p38', nama: 'Zalva Zahiyah Amanda Davia Putri', jabatan: 'Staff 1 Kemenkraf', kementerian_id: 'k-kemenkraf', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  
  { id: 'p39', nama: 'Farhan Habibburrahman', jabatan: 'Menteri Kemensenbud', kementerian_id: 'k-kemensenbud', is_pimpinan: true, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p40', nama: 'Ghina Fadhila Antoni', jabatan: 'Sekretaris Menteri Kemensenbud', kementerian_id: 'k-kemensenbud', is_pimpinan: false, is_sekmen: true, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p41', nama: 'April Lita', jabatan: 'Staff 1 Kemensenbud', kementerian_id: 'k-kemensenbud', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] },
  { id: 'p42', nama: 'Muhammad Rasya Farezi', jabatan: 'Staff 2 Kemensenbud', kementerian_id: 'k-kemensenbud', is_pimpinan: false, is_sekmen: false, foto_url: null, periode_tahun: '2026/2027', prestasi_akademik: [], prestasi_non_akademik: [], riwayat_organisasi: [] }
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
  // Static configuration data (Read-Only)
  // Served directly from memory to prevent stale cache issues
  const kementerian = INITIAL_KEMENTERIAN;
  const profiles = INITIAL_PROFILES;

  // Mutable state synced with local storage
  const [pengurus, setPengurus] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('mvp_pengurus'));
    if (saved && saved.length >= 42) {
      // Migrate legacy data that might not have `periode_tahun`
      return saved.map(p => ({
        ...p,
        periode_tahun: p.periode_tahun || '2026/2027'
      }));
    }
    return INITIAL_PENGURUS;
  });
  const [aspirasi, setAspirasi] = useState(() => JSON.parse(localStorage.getItem('mvp_aspirasi')) || INITIAL_ASPIRASI);
  const [rilisAdvokasi, setRilisAdvokasi] = useState(() => JSON.parse(localStorage.getItem('mvp_rilis')) || INITIAL_RILIS);

  
  // Auth Session
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('mvp_session')) || null);

  // Decoupled sync to local storage
  useEffect(() => localStorage.setItem('mvp_pengurus', JSON.stringify(pengurus)), [pengurus]);
  useEffect(() => localStorage.setItem('mvp_aspirasi', JSON.stringify(aspirasi)), [aspirasi]);
  useEffect(() => localStorage.setItem('mvp_rilis', JSON.stringify(rilisAdvokasi)), [rilisAdvokasi]);
  useEffect(() => localStorage.setItem('mvp_session', JSON.stringify(session)), [session]);

  // One-time aggressive cache sanitation to remove obsolete static keys
  useEffect(() => {
    localStorage.removeItem('mvp_kementerian');
    localStorage.removeItem('mvp_profiles');
  }, []);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        switch (e.key) {
          case 'mvp_pengurus': setPengurus(parsed); break;
          case 'mvp_aspirasi': setAspirasi(parsed); break;
          case 'mvp_rilis': setRilisAdvokasi(parsed); break;
          case 'mvp_session': setSession(parsed); break;
          default: break;
        }
      } catch (err) {
        console.error("Error parsing storage event", err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const unconsolidateRilis = (rilisId) => {
    setRilisAdvokasi(prev => prev.filter(r => r.id !== rilisId));
    setAspirasi(prev => prev.map(asp => asp.rilis_id === rilisId ? { ...asp, rilis_id: null } : asp));
  };

  const editRilisAdvokasi = (rilisId, newData) => {
    setRilisAdvokasi(prev => prev.map(r => r.id === rilisId ? { ...r, ...newData } : r));
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
      unconsolidateRilis,
      editRilisAdvokasi,
      tambahPengurus,
      editPengurus,
      hapusPengurus
    }}>
      {children}
    </MockDatabaseContext.Provider>
  );
};

export const useMockDatabase = () => useContext(MockDatabaseContext);
