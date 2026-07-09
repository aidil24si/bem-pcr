import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from Vite environment variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

// A full LocalStorage-backed mock client for local development when credentials are missing
class MockSupabaseClient {
  constructor() {
    this.initMockData();
    this.authListeners = [];
    console.warn(
      '⚠️ SUPABASE URL/KEY NOT FOUND: Fallback to LocalStorage Mock Client active. Your database states will persist in your browser.'
    );
  }

  initMockData() {
    // ── Seed version guard: bump this whenever you change initial data ──
    const SEED_VERSION = 'v4';
    if (localStorage.getItem('mock_seed_version') !== SEED_VERSION) {
      const keys = [
        'mock_kementerian',
        'mock_profiles',
        'mock_pengurus',
        'mock_aspirasi',
        'mock_peminjaman_ruangan',
        'mock_berita',
        'mock_proker',
        'mock_agenda',
        'mock_galeri',
        'mock_pengumuman'
      ];
      keys.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('mock_seed_version', SEED_VERSION);
    }

    // 1. Kementerian
    if (!localStorage.getItem('mock_kementerian')) {
      const initialKementerian = [
        { id: 'k-presma', nama_kementerian: 'Presiden & Wakil Presiden Mahasiswa', hierarki_order: 0 },
        { id: 'k-sekre', nama_kementerian: 'Sekretariat Jenderal', hierarki_order: 1 },
        { id: 'k-adkesma', nama_kementerian: 'Kementerian Advokasi & Kesejahteraan Mahasiswa (Adkesma)', hierarki_order: 2 },
        { id: 'k-kominfo', nama_kementerian: 'Kementerian Komunikasi & Informasi (Kominfo)', hierarki_order: 3 },
        { id: 'k-psdm', nama_kementerian: 'Kementerian Pengembangan Sumber Daya Mahasiswa (PSDM)', hierarki_order: 4 },
      ];
      localStorage.setItem('mock_kementerian', JSON.stringify(initialKementerian));
    }

    // 2. Profiles (Admin accounts)
    if (!localStorage.getItem('mock_profiles')) {
      const initialProfiles = [
        {
          id: 'admin-super-id',
          nama: 'Super Admin BEM',
          role: 'super_admin',
          kementerian_id: null,
          email: 'bem@universitas.ac.id',
        },
        {
          id: 'admin-adkesma-id',
          nama: 'Admin Adkesma',
          role: 'admin_sektoral',
          kementerian_id: 'k-adkesma',
          email: 'adkesma@universitas.ac.id',
        },
      ];
      localStorage.setItem('mock_profiles', JSON.stringify(initialProfiles));
    }

    // 3. Pengurus
    if (!localStorage.getItem('mock_pengurus')) {
      const initialPengurus = [
        {
          id: 'p1',
          kementerian_id: 'k-presma',
          nama: 'Aidil Ikhsan Rezki Idris',
          jabatan: 'Presiden Mahasiswa',
          prestasi_akademik: [],
          prestasi_non_akademik: [],
          riwayat_organisasi: [],
          foto_url: null,
          periode_tahun: '2025/2026',
        },
        {
          id: 'p2',
          kementerian_id: 'k-presma',
          nama: 'Baydella',
          jabatan: 'Wakil Presiden Mahasiswa',
          prestasi_akademik: [],
          prestasi_non_akademik: [],
          riwayat_organisasi: [],
          foto_url: null,
          periode_tahun: '2025/2026',
        },
      ];
      localStorage.setItem('mock_pengurus', JSON.stringify(initialPengurus));
    }

    // 4. Aspirasi
    if (!localStorage.getItem('mock_aspirasi')) {
      const initialAspirasi = [
        {
          id: 'a1',
          tipe_isu: 'tangible',
          identitas: { nama: 'Fajar Nugraha', nim: '12345678' },
          prodi: 'Teknik Informatika',
          deskripsi: 'AC di Ruang Kelas H.3.1 Gedung Baru bocor dan kurang dingin selama dua minggu terakhir.',
          bukti_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=300',
          status: 'diterbitkan',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'a2',
          tipe_isu: 'intangible',
          identitas: null, // Anonim
          prodi: 'Sistem Informasi',
          deskripsi: 'Pelayanan birokrasi kemahasiswaan fakultas sangat lambat dalam memproses surat rekomendasi beasiswa.',
          bukti_url: null,
          status: 'diterbitkan',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'a3',
          tipe_isu: 'tangible',
          identitas: { nama: 'Andi Wijaya', nim: '87654321' },
          prodi: 'Teknik Mesin',
          deskripsi: 'Fasilitas alat las di bengkel teknik mesin banyak yang rusak dan berkarat.',
          bukti_url: null,
          status: 'review',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'a4',
          tipe_isu: 'intangible',
          identitas: null, // Anonim
          prodi: 'Psikologi',
          deskripsi: 'Kurangnya bimbingan konseling dan kesehatan mental gratis di tingkat universitas.',
          bukti_url: null,
          status: 'draft',
          created_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem('mock_aspirasi', JSON.stringify(initialAspirasi));
    }

    // 5. Peminjaman Ruangan
    if (!localStorage.getItem('mock_peminjaman_ruangan')) {
      const initialBookings = [
        {
          id: 'b1',
          tanggal: '2025-08-15',
          ruangan_utama: 'Gedung Pertemuan Utama (Auditorium)',
          ruangan_tambahan: 'Selasar Barat',
          nama_ormawa: 'BEM Universitas',
          nama_agenda: 'Grand Opening Kabinet BEM 2025',
          jam_acara: '08:00 - 13:00',
        },
        {
          id: 'b2',
          tanggal: '2025-08-18',
          ruangan_utama: 'Ruang Seminar G.201',
          ruangan_tambahan: '',
          nama_ormawa: 'Himpunan Mahasiswa Elektro',
          nama_agenda: 'Workshop IoT Dasar',
          jam_acara: '09:00 - 12:00',
        },
        {
          id: 'b3',
          tanggal: '2025-09-02',
          ruangan_utama: 'Gedung Pertemuan Utama (Auditorium)',
          ruangan_tambahan: 'Halaman Depan',
          nama_ormawa: 'UKM Kesenian',
          nama_agenda: 'Festival Musik Kampus',
          jam_acara: '15:00 - 21:00',
        },
      ];
      localStorage.setItem('mock_peminjaman_ruangan', JSON.stringify(initialBookings));
    }

    // 6. Current User Session
    if (!localStorage.getItem('mock_session')) {
      localStorage.setItem('mock_session', 'null');
    }

    // 7. Berita & Artikel
    if (!localStorage.getItem('mock_berita')) {
      const initialBerita = [
        {
          id: 'news-1',
          judul: 'BEM Universitas Nusantara Luncurkan Website Operasional Baru',
          ringkasan: 'Website ini dirancang untuk mempermudah penyampaian aspirasi mahasiswa dan transparansi jadwal peminjaman ruangan ormawa.',
          isi: 'Dalam rangka meningkatkan kualitas pelayanan dan transparansi administrasi bagi seluruh mahasiswa, Badan Eksekutif Mahasiswa (BEM) Universitas Nusantara resmi meluncurkan platform website operasional baru.\n\nWebsite ini mengintegrasikan berbagai layanan unggulan, seperti Kotak Aspirasi Publik yang dilengkapi dengan Canvas-based EXIF Sanitizer untuk keamanan privasi foto bukti, serta Papan Jadwal Ruangan real-time.\n\nPresiden Mahasiswa, Aidil Ikhsan Rezki Idris, menyatakan bahwa inovasi digital ini diharapkan mampu memangkas rantai birokrasi dan mendekatkan BEM dengan mahasiswa.',
          kategori: 'Kampus',
          gambar_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600',
          pembuat: 'Kementerian Kominfo',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'news-2',
          judul: 'Rapat Koordinasi Perdana Kabinet Nusantara Maju',
          ringkasan: 'Presma dan Wapresma memimpin rapat koordinasi perdana bersama seluruh menteri sektoral untuk menyelaraskan target program kerja 14 hari ke depan.',
          isi: 'Seluruh menteri sektoral Kabinet Nusantara Maju menghadiri Rapat Koordinasi Perdana yang bertempat di Ruang Rapat BEM Utama.\n\nFokus pembahasan rapat kali ini adalah penyusunan timeline program kerja taktis jangka pendek dan menengah. Wakil Presiden Mahasiswa, Baydella, menekankan pentingnya sinergi lintas kementerian agar program kerja yang dicanangkan tepat sasaran dan berdampak langsung bagi mahasiswa.',
          kategori: 'Internal',
          gambar_url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=600',
          pembuat: 'Sekretariat Jenderal',
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      localStorage.setItem('mock_berita', JSON.stringify(initialBerita));
    }

    // 8. Program Kerja (Proker)
    if (!localStorage.getItem('mock_proker')) {
      const initialProker = [
        {
          id: 'proker-1',
          nama_proker: 'Pekan Advokasi Mahasiswa',
          kementerian_id: 'k-adkesma',
          deskripsi: 'Program kerja berkala untuk menampung keluhan fasilitas sarana prasarana dan akademik kampus secara langsung dari mahasiswa tiap fakultas.',
          target_pelaksanaan: 'Juli 2025',
          status: 'berjalan', // belum_mulai | berjalan | selesai
          penanggung_jawab: 'Kementerian Adkesma',
        },
        {
          id: 'proker-2',
          nama_proker: 'BEM Tech Academy 2025',
          kementerian_id: 'k-kominfo',
          deskripsi: 'Pelatihan dasar desain web, coding, dan UI/UX untuk memperkuat literasi digital mahasiswa umum.',
          target_pelaksanaan: 'Agustus 2025',
          status: 'belum_mulai',
          penanggung_jawab: 'Kementerian Kominfo',
        },
        {
          id: 'proker-3',
          nama_proker: 'Upgrading & LDKM Pengurus',
          kementerian_id: 'k-psdm',
          deskripsi: 'Pelatihan kepemimpinan dan manajemen organisasi bagi internal pengurus BEM periode 2025/2026.',
          target_pelaksanaan: 'Juni 2025',
          status: 'selesai',
          penanggung_jawab: 'Kementerian PSDM',
        }
      ];
      localStorage.setItem('mock_proker', JSON.stringify(initialProker));
    }

    // 9. Agenda Kegiatan
    if (!localStorage.getItem('mock_agenda')) {
      const initialAgenda = [
        {
          id: 'agenda-1',
          judul_agenda: 'Grand Upgrading Pengurus BEM',
          tanggal_mulai: '2025-06-25',
          tanggal_selesai: '2025-06-26',
          lokasi: 'Aula Gedung C',
          waktu: '08:00 - 17:00 WIB',
          deskripsi: 'Sesi pembekalan visi, misi, dan nilai kabinet serta perumusan program kerja tahunan.',
        },
        {
          id: 'agenda-2',
          judul_agenda: 'Audiensi Terbuka Rektorat Kampus',
          tanggal_mulai: '2025-07-20',
          tanggal_selesai: '2025-07-20',
          lokasi: 'Auditorium Utama',
          waktu: '10:00 - 13:00 WIB',
          deskripsi: 'Pertemuan terbuka mahasiswa bersama Rektor untuk membahas kenaikan biaya UKT dan perbaikan fasilitas kelas.',
        }
      ];
      localStorage.setItem('mock_agenda', JSON.stringify(initialAgenda));
    }

    // 10. Galeri Foto
    if (!localStorage.getItem('mock_galeri')) {
      const initialGaleri = [
        {
          id: 'gal-1',
          judul_foto: 'Pelantikan Pengurus Baru BEM 2025',
          deskripsi: 'Momen khidmat pengucapan sumpah pengurus BEM Universitas oleh Rektor.',
          gambar_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600',
          kategori: 'Kegiatan',
          tanggal_unggah: '2025-06-10',
        },
        {
          id: 'gal-2',
          judul_foto: 'Aksi Sosial Peduli Bencana',
          deskripsi: 'Penyaluran bantuan logistik dan donasi dari mahasiswa ke daerah terdampak banjir.',
          gambar_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600',
          kategori: 'Sosial',
          tanggal_unggah: '2025-06-18',
        }
      ];
      localStorage.setItem('mock_galeri', JSON.stringify(initialGaleri));
    }

    // 11. Pengumuman Dinamis
    if (!localStorage.getItem('mock_pengumuman')) {
      const initialPengumuman = [
        {
          id: 'ann-1',
          judul: 'Layanan Pengaduan UKT Dibuka',
          isi: 'BEM membuka posko advokasi peninjauan tarif UKT hingga 25 Juli 2025. Segera kirimkan berkas Anda melalui Kotak Aspirasi.',
          status_aktif: true,
          tipe: 'warning', // info | warning | danger
        }
      ];
      localStorage.setItem('mock_pengumuman', JSON.stringify(initialPengumuman));
    }
  }

  // --- AUTH METHODS ---
  get auth() {
    return {
      signUp: async ({ email, password: _password, options }) => {
        const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '[]');
        const newUserId = `user-${Math.random().toString(36).substr(2, 9)}`;
        const role = email === 'bem@universitas.ac.id' ? 'super_admin' : 'admin_sektoral';
        
        const newProfile = {
          id: newUserId,
          nama: options?.data?.nama || 'Pengurus Baru',
          role: role,
          kementerian_id: options?.data?.kementerian_id || null,
          email: email,
        };

        profiles.push(newProfile);
        localStorage.setItem('mock_profiles', JSON.stringify(profiles));

        return { data: { user: { id: newUserId, email } }, error: null };
      },

      signInWithPassword: async ({ email, password: _password }) => {
        const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '[]');
        const profile = profiles.find((p) => p.email === email);

        if (!profile) {
          return { data: { session: null }, error: new Error('User not found in mock database') };
        }

        const session = {
          user: {
            id: profile.id,
            email: profile.email,
            user_metadata: {
              nama: profile.nama,
              role: profile.role,
              kementerian_id: profile.kementerian_id,
            },
          },
          access_token: 'mock-jwt-token',
        };

        localStorage.setItem('mock_session', JSON.stringify(session));
        this.notifyAuthChange('SIGNED_IN', session);
        return { data: { session, user: session.user }, error: null };
      },

      signOut: async () => {
        localStorage.setItem('mock_session', 'null');
        this.notifyAuthChange('SIGNED_OUT', null);
        return { error: null };
      },

      getSession: async () => {
        const session = JSON.parse(localStorage.getItem('mock_session') || 'null');
        return { data: { session }, error: null };
      },

      onAuthStateChange: (callback) => {
        this.authListeners.push(callback);
        const session = JSON.parse(localStorage.getItem('mock_session') || 'null');
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                this.authListeners = this.authListeners.filter((cb) => cb !== callback);
              },
            },
          },
        };
      },
    };
  }

  notifyAuthChange(event, session) {
    this.authListeners.forEach((callback) => callback(event, session));
  }

  // --- STORAGE METHODS ---
  get storage() {
    return {
      from: (bucket) => ({
        upload: async (path, _file) => {
          return { data: { path, fullPath: `${bucket}/${path}` }, error: null };
        },
        getPublicUrl: (path) => {
          return {
            data: {
              publicUrl: path.startsWith('http') 
                ? path 
                : `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600`,
            },
          };
        },
      }),
    };
  }

  // --- QUERY ENGINE ---
  from(table) {
    let data = JSON.parse(localStorage.getItem(`mock_${table}`) || '[]');
    let currentFilter = (_item) => true;
    let orderCol = 'created_at';
    let orderAsc = false;

    return {
      select(_columns = '*') {
        // chainable
        return this;
      },

      eq(column, value) {
        const prevFilter = currentFilter;
        currentFilter = (item) => prevFilter(item) && String(item[column]) === String(value);
        return this;
      },

      ilike(column, pattern) {
        const query = pattern.replace(/%/g, '').toLowerCase();
        const prevFilter = currentFilter;
        currentFilter = (item) => 
          prevFilter(item) && 
          item[column] && 
          String(item[column]).toLowerCase().includes(query);
        return this;
      },

      order(column, { ascending = false } = {}) {
        orderCol = column;
        orderAsc = ascending;
        return this;
      },

      async then(resolve) {
        let result = data.filter(currentFilter);
        result.sort((a, b) => {
          const valA = a[orderCol];
          const valB = b[orderCol];
          if (valA < valB) return orderAsc ? -1 : 1;
          if (valA > valB) return orderAsc ? 1 : -1;
          return 0;
        });
        resolve({ data: result, error: null });
      },

      async insert(newData) {
        const records = Array.isArray(newData) ? newData : [newData];
        const updatedRecords = records.map((r) => ({
          id: r.id || `mock-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          ...r,
        }));

        data.push(...updatedRecords);
        localStorage.setItem(`mock_${table}`, JSON.stringify(data));
        return { data: updatedRecords, error: null };
      },

      async update(updateData) {
        // Update elements that pass the current chain filter
        let updatedCount = 0;
        data = data.map((item) => {
          if (currentFilter(item)) {
            updatedCount++;
            return { ...item, ...updateData };
          }
          return item;
        });

        localStorage.setItem(`mock_${table}`, JSON.stringify(data));
        return { data: null, count: updatedCount, error: null };
      },

      async delete() {
        let deletedCount = 0;
        data = data.filter((item) => {
          if (currentFilter(item)) {
            deletedCount++;
            return false; // Remove
          }
          return true;
        });

        localStorage.setItem(`mock_${table}`, JSON.stringify(data));
        return { data: null, count: deletedCount, error: null };
      },
    };
  }
}

// Inisialisasi client
let supabase;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('Failed to initialize real Supabase client, using mock fallback', e);
    supabase = new MockSupabaseClient();
  }
} else {
  supabase = new MockSupabaseClient();
}

export { supabase };
