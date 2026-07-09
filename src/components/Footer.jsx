import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const FOOTER_LINKS = [
  { path: '/',         label: 'Beranda' },
  { path: '/profil',   label: 'Profil BEM' },
  { path: '/kabinet',  label: 'Kabinet BEM' },
  { path: '/proker',   label: 'Program Kerja' },
  { path: '/berita',   label: 'Berita & Agenda' },
  { path: '/galeri',   label: 'Galeri Foto' },
  { path: '/aspirasi', label: 'Kotak Aspirasi' },
  { path: '/ruangan',  label: 'Jadwal Ruangan' },
  { path: '/kontak',   label: 'Hubungi Kami' },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-white/[0.05] bg-[#030712] py-10 mt-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-sm">

          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-500" />
              <span className="font-extrabold text-white tracking-tight">Badan Eksekutif Mahasiswa</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              Platform digital resmi BEM sebagai layanan aspirasi, informasi jadwal ruangan, dan direktori kabinet mahasiswa.
            </p>
          </div>

          {/* Quick Links Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-2 text-xs">
              {FOOTER_LINKS.map(({ path, label }) => (
                <li key={path}>
                  <button
                    onClick={() => navigate(path)}
                    className="text-gray-400 hover:text-purple-400 transition-colors cursor-pointer text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate('/admin')}
                  className="text-gray-400 hover:text-purple-400 transition-colors cursor-pointer text-left font-bold"
                >
                  Portal Admin
                </button>
              </li>
            </ul>
          </div>

          {/* Socials / Contacts */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Hubungi Kami</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>📧 bem@universitas.ac.id</li>
              <li>📸 @bem.universitas</li>
              <li>📱 WhatsApp: 0812-3456-7890</li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 pt-6 border-t border-white/[0.05] text-center text-[10px] text-gray-600">
          © {new Date().getFullYear()} Badan Eksekutif Mahasiswa Universitas. Hak cipta dilindungi undang-undang.
        </div>
      </div>
    </footer>
  );
}
