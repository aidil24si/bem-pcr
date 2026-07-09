import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Calendar,
  Shield,
  GraduationCap,
  Home,
  BookOpen,
  Layers,
  Image as ImageIcon,
  Mail,
  Megaphone,
  Menu,
  X,
  ChevronDown,
  Users,
} from 'lucide-react';

const PRIMARY_NAV = [
  { path: '/',         label: 'Beranda',         icon: Home },
  { path: '/profil',   label: 'Profil BEM',      icon: BookOpen },
  { path: '/kabinet',  label: 'Kabinet BEM',     icon: Users },
  { path: '/proker',   label: 'Program Kerja',   icon: Layers },
  { path: '/berita',   label: 'Berita & Agenda', icon: Megaphone },
];

const SECONDARY_NAV = [
  { path: '/galeri',   label: 'Galeri Foto',     icon: ImageIcon },
  { path: '/aspirasi', label: 'Kotak Aspirasi',  icon: MessageSquare },
  { path: '/ruangan',  label: 'Jadwal Ruangan',  icon: Calendar },
  { path: '/kontak',   label: 'Hubungi Kami',    icon: Mail },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close menus on page transition
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navigateTo = (path) => {
    navigate(path);
  };

  // Check if any secondary link is active
  const isSecondaryActive = SECONDARY_NAV.some(item => location.pathname === item.path);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.05] bg-[#030712]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo Brand */}
        <button
          onClick={() => navigateTo('/')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <GraduationCap className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-base bg-gradient-to-r from-white via-gray-200 to-purple-400 bg-clip-text text-transparent tracking-tight">
            BEM Universitas
          </span>
        </button>

        {/* Desktop Menu Links (Hidden on small laptops/tablets) */}
        <nav className="hidden xl:flex items-center gap-1.5">
          
          {/* Primary Navbar Links */}
          {PRIMARY_NAV.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigateTo(path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                location.pathname === path
                  ? 'bg-purple-600/15 text-purple-300 border-purple-500/25'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border-transparent'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          {/* Secondary Dropdown "Layanan / Lainnya" */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                isSecondaryActive
                  ? 'bg-purple-600/10 text-purple-300 border-purple-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border-transparent'
              }`}
            >
              <span>Layanan Lainnya</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-800 bg-[#030712]/95 backdrop-blur-xl p-1.5 shadow-xl shadow-black/80 animate-in fade-in slide-in-from-top-2 duration-150">
                {SECONDARY_NAV.map(({ path, label, icon: Icon }) => (
                  <button
                    key={path}
                    onClick={() => navigateTo(path)}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-left ${
                      location.pathname === path
                        ? 'bg-purple-600 text-white font-extrabold'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Portal Admin */}
          <button
            onClick={() => navigateTo('/admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              location.pathname === '/admin'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/50'
                : 'bg-white/[0.04] text-gray-400 hover:text-gray-200 hover:bg-white/[0.07] border-white/[0.06]'
            }`}
          >
            <Shield className="h-3.5 w-3.5 shrink-0" />
            <span>Portal Admin</span>
          </button>
        </nav>

        {/* Hamburger Menu Button for mobile/tablet */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 rounded-lg border border-white/10 bg-white/[0.02] text-gray-400 hover:text-white cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-white/[0.05] bg-[#030712] py-4 px-4 space-y-2">
          
          {/* Primary Items */}
          {PRIMARY_NAV.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigateTo(path)}
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                location.pathname === path
                  ? 'bg-purple-600/15 text-purple-300 border-purple-500/20'
                  : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/[0.02]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-white/5 my-2 flex items-center px-4 pt-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Layanan BEM</span>
          </div>

          {/* Secondary Items */}
          {SECONDARY_NAV.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigateTo(path)}
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                location.pathname === path
                  ? 'bg-purple-600/15 text-purple-300 border-purple-500/20'
                  : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/[0.02]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          <hr className="border-white/5 my-2" />

          {/* Portal Admin */}
          <button
            onClick={() => navigateTo('/admin')}
            className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              location.pathname === '/admin'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                : 'bg-white/[0.04] text-gray-400 border-white/[0.06]'
            }`}
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span>Portal Admin</span>
          </button>
        </div>
      )}
    </header>
  );
}
