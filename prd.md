# Product Requirements Document (PRD) — Portal BEM PCR
**Status:** As-Built (Kondisi Terkini, Revisi)
**Menggantikan:** PRD versi perencanaan awal (disimpan terpisah sebagai arsip historis, tidak dipakai rujukan lagi untuk bagian desain & struktur admin)

---

## 1. Ringkasan
Portal BEM PCR (versi MVP) adalah aplikasi web berbasis React yang menjawab dua kebutuhan utama: transparansi struktur kepengurusan dan penyaluran aspirasi mahasiswa secara aman. Sistem saat ini berjalan sepenuhnya dengan basis data simulasi lokal (`MockDatabaseContext` via `localStorage`), tanpa backend eksternal — migrasi ke backend sungguhan sengaja ditunda sampai fitur inti benar-benar stabil.

## 2. Visi & Tujuan Produk
- **Transparansi Struktur:** Menampilkan struktur kepengurusan secara jelas dan mudah diakses.
- **Ruang Aman untuk Menyampaikan Aspirasi:** Mahasiswa bisa melapor dengan opsi anonim, dan sistem secara teknis melindungi metadata foto yang dilampirkan.
- **Konsolidasi Respons:** Admin tidak perlu membalas satu-satu — keluhan serumpun dirangkum jadi satu "Rilis Advokasi Resmi" yang dipublikasikan ke mahasiswa.

## 3. Target Pengguna
1. **Mahasiswa/Pengunjung Umum** — melihat struktur kabinet, mengirim aspirasi/keluhan, membaca rilis advokasi.
2. **Admin BEM** — satu peran tunggal, dengan akses penuh: mengelola data pengurus, mengonsolidasikan aspirasi, menerbitkan rilis.

*(Catatan: tidak ada pembagian "Admin Sektoral" vs "Super Admin". Sistem login hanya mengenal satu jenis sesi admin, tanpa role-based access control. Kalau ke depannya dibutuhkan pembagian akses bertingkat, itu jadi keputusan produk baru yang perlu dirancang dari awal, bukan asumsi yang sudah ada.)*

---

## 4. Fitur Utama (Scope MVP)

### 4.1 Profil BEM & Struktur Kabinet (Publik)
- Landing page dengan visi-misi dan info dasar organisasi.
- Struktur kabinet ditampilkan bertingkat:
  - **Pimpinan Tertinggi:** Presiden & Wakil Presiden Mahasiswa.
  - **Eksekutif Inti:** Sekretaris, Bendahara, dan jajaran inti lainnya.
  - **Kementerian:** Seluruh kementerian ditampilkan dalam satu susunan grid/masonry yang rata, **tanpa dikelompokkan** berdasarkan rumpun/klaster tertentu.
- Kartu pengurus menampilkan foto, nama, dan jabatan. **Saat ini bersifat statis** — tidak ada pop-up/detail tambahan saat kartu diklik (lihat Bagian 6, fitur ini sempat dibangun lalu dibatalkan).

### 4.2 Kotak Aspirasi & Perlindungan Privasi (Publik)
- Kategori isu: *Tangible* (fasilitas/infrastruktur) dan *Intangible* (layanan/birokrasi).
- Lampiran foto bukti tersedia untuk **semua kategori isu**, bersifat opsional, dengan label netral "Unggah bukti pendukung (foto/tangkapan layar)".
- **Mode Anonim:** saat diaktifkan, field nama/NIM/email hilang total dari tampilan (bukan cuma dikosongkan). Foto bukti tetap boleh dilampirkan, disertai notice peringatan agar pelapor tidak menyertakan wajah/info pribadi lain.
- **Mode Non-Anonim:** email wajib diisi, dikunci ke domain kampus (`@mahasiswa.pcr.ac.id`).
- Foto yang diunggah otomatis dikompresi dan dibersihkan dari metadata EXIF (lokasi GPS, tipe perangkat) sebelum disimpan.
- Mahasiswa hanya bisa melihat Rilis Advokasi resmi, bukan keluhan mentah milik orang lain — mencegah portal jadi ajang debat publik.

### 4.3 Dasbor Admin (Internal)
- Login admin tunggal (session-based, tanpa pembagian role).
- Kelola data pengurus: tambah, edit, hapus.
- Konsolidasi aspirasi: admin bisa memilih beberapa keluhan serumpun (checkbox multi-select) dan menerbitkannya sebagai satu Rilis Advokasi. Sudah dilengkapi pencegahan race condition saat ada lebih dari satu tab/sesi admin aktif bersamaan.
- Aksi penghapusan/pembatalan (hapus pengurus, batal konsolidasi rilis) selalu melalui dialog konfirmasi, mencegah kesalahan klik.

---

## 5. Spesifikasi Teknis

### 5.1 Tech Stack
- **Frontend:** React 18, Vite.
- **Styling:** Tailwind CSS v4.
- **Ikon:** Lucide React.
- **State & Data (MVP):** `MockDatabaseContext.jsx` — Context API tersinkronisasi dengan `localStorage` (key: `mvp_kementerian`, `mvp_pengurus`, `mvp_aspirasi`, `mvp_rilis`, dll).
- **Routing:** React Router v6.

### 5.2 Desain Visual
- **Tema:** Light Mode — latar putih bersih.
- **Warna utama:** Midnight Green (`#004B5F`).
- **Warna aksen/peringatan:** Pigment Red (`#EE152A`).
- **Kesan:** Bersih, profesional, mudah dibaca.

### 5.3 Praktik Pengembangan
- Branch `main` hanya menerima kode yang sudah diverifikasi manual di browser sungguhan. Semua pekerjaan aktif dilakukan di branch `dev` terlebih dahulu.
- Klaim "sudah diperbaiki/sudah bisa" dari proses development wajib disertai bukti visual (screenshot), bukan hanya deskripsi berdasarkan pembacaan kode.

---

## 6. Fitur yang Ditunda / Dibatalkan

- **Manajemen Jadwal Peminjaman Ruangan, Publikasi Berita, Pemantauan Proker, Galeri Dokumentasi, dan halaman Kontak** — dipangkas dari scope MVP, halaman-halaman terkait sudah dihapus dari codebase.
- **Pop-up Detail Pengurus (menampilkan prestasi & riwayat organisasi)** — sempat dibangun, namun dibatalkan karena bug rendering (modal gagal tampil) yang tidak kunjung terselesaikan setelah beberapa kali percobaan perbaikan. Kartu pengurus untuk saat ini dikembalikan ke tampilan statis.
- **Modal Detail Aspirasi + fitur lihat foto bukti untuk admin** — sempat dibangun untuk memenuhi kebutuhan admin memeriksa foto bukti, tapi dibatalkan karena bug scroll yang tidak terselesaikan. Kebutuhan ini masih valid dan bisa dibangun ulang nanti dengan pendekatan berbeda.
- **Integrasi backend sungguhan (Supabase/Firebase)** — ditangguhkan sampai fitur inti benar-benar stabil dan bebas bug.

---

## 7. Dokumen Terkait
Untuk kondisi proyek paling terkini (hari ke hari, bukan snapshot sesaat), rujuk `status_proyek_bem_pcr.md` — dokumen ini (PRD) sebaiknya diperbarui hanya saat ada perubahan scope/keputusan produk besar, bukan untuk setiap detail perbaikan kecil.
