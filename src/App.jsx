import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// ── LAZY LOAD PAGES (Pola apotek-web) ───────────────────────────
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const ProfilBEM = lazy(() => import('./pages/public/ProfilBEM'));
const BeritaArtikel = lazy(() => import('./pages/public/BeritaArtikel'));
const ProkerBEM = lazy(() => import('./pages/public/ProkerBEM'));
const AgendaBEM = lazy(() => import('./pages/public/AgendaBEM'));
const RoomScheduler = lazy(() => import('./pages/public/RoomScheduler'));
const CabinetHierarchy = lazy(() => import('./pages/public/CabinetHierarchy'));
const AspirasiPublic = lazy(() => import('./pages/public/AspirasiPublic'));
const GaleriBEM = lazy(() => import('./pages/public/GaleriBEM'));
const KontakBEM = lazy(() => import('./pages/public/KontakBEM'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const Login = lazy(() => import('./pages/public/Login'));

export default function App() {
  return (
    <MainLayout>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm font-medium animate-pulse">Memuat halaman...</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/profil" element={
              <div className="max-w-6xl mx-auto px-4 py-10">
                <ProfilBEM />
              </div>
            } />
            
            <Route path="/kabinet" element={
              <div className="max-w-6xl mx-auto px-4 py-10">
                <CabinetHierarchy />
              </div>
            } />

            <Route path="/proker" element={
              <div className="max-w-6xl mx-auto px-4 py-10">
                <ProkerBEM />
              </div>
            } />

            <Route path="/berita" element={
              <div className="max-w-6xl mx-auto px-4 py-10 space-y-16">
                <BeritaArtikel />
                <hr className="border-gray-950" />
                <AgendaBEM />
              </div>
            } />

            <Route path="/galeri" element={
              <div className="max-w-6xl mx-auto px-4 py-10">
                <GaleriBEM />
              </div>
            } />

            <Route path="/aspirasi" element={
              <div className="max-w-6xl mx-auto px-4 py-10">
                <AspirasiPublic />
              </div>
            } />

            <Route path="/ruangan" element={
              <div className="max-w-6xl mx-auto px-4 py-10">
                <RoomScheduler />
              </div>
            } />

            <Route path="/kontak" element={
              <div className="max-w-6xl mx-auto px-4 py-10">
                <KontakBEM />
              </div>
            } />

            <Route path="/login" element={<Login />} />

            <Route path="/admin" element={
              <ProtectedRoute>
                <div className="max-w-6xl mx-auto px-4 py-10">
                  <AdminDashboard />
                </div>
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </MainLayout>
  );
}
