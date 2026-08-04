import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Shield,
  GraduationCap,
  Home,
  BookOpen,
  Menu,
  X,
  Users,
} from 'lucide-react';

const PRIMARY_NAV = [
  { path: '/',         label: 'Beranda',         icon: Home },
  { path: '/profil',   label: 'Profil BEM',      icon: BookOpen },
  { path: '/kabinet',  label: 'Kabinet BEM',     icon: Users },
  { path: '/aspirasi', label: 'Kotak Aspirasi',  icon: MessageSquare },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menus on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo Brand */}
        <button
          onClick={() => navigateTo('/')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <GraduationCap className="h-6 w-6 text-[#004B5F] group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-base text-[#004B5F] tracking-tight">
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
                  ? 'bg-[#E6F3F7] text-[#004B5F] border-[#CCE7EF]'
                  : 'text-slate-500 hover:text-[#004B5F] hover:bg-slate-100 border-transparent'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Portal Admin */}
          <button
            onClick={() => navigateTo('/admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              location.pathname === '/admin'
                ? 'bg-[#004B5F] text-white border-[#004B5F] shadow-md shadow-[#004B5F]/20'
                : 'bg-white text-slate-500 hover:text-[#004B5F] hover:bg-slate-50 border-gray-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5 shrink-0" />
            <span>Portal Admin</span>
          </button>
        </nav>

        {/* Hamburger Menu Button for mobile/tablet */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 rounded-lg border border-gray-200 bg-slate-50 text-slate-500 hover:text-[#004B5F] cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-gray-200 bg-white py-4 px-4 space-y-2">
          
          {/* Primary Items */}
          {PRIMARY_NAV.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigateTo(path)}
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                location.pathname === path
                  ? 'bg-[#E6F3F7] text-[#004B5F] border-[#CCE7EF]'
                  : 'text-slate-500 border-transparent hover:text-[#004B5F] hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          <hr className="border-gray-200 my-2" />

          {/* Portal Admin */}
          <button
            onClick={() => navigateTo('/admin')}
            className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              location.pathname === '/admin'
                ? 'bg-[#004B5F] text-white border-[#004B5F] shadow-md'
                : 'bg-white text-slate-500 border-gray-200'
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
