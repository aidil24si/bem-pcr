import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useMockDatabase } from '../../context/MockDatabaseContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Lock, AlertCircle } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';

export default function Login() {
  useDocumentTitle('Login Admin');
  const navigate = useNavigate();
  const { session, login } = useMockDatabase();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if session already exists
  useEffect(() => {
    // In MockDatabase, session is already available synchronously
    setCheckingSession(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      login(email, password);
      // Redirect to admin portal on success
      navigate('/admin');
    } catch (err) {
      setErrorMsg(err.message || 'Alamat email atau kata sandi Anda salah.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-8 w-8 border-4 border-[#004B5F] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Memeriksa sesi...</p>
      </div>
    );
  }

  // If already logged in, redirect to admin directly
  if (session) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      <PageHeader
        tag="Portal Autentikasi"
        icon={Lock}
        title="Masuk Pengurus BEM"
        description="Gunakan akun administrasi resmi BEM untuk mengakses modul dasbor manajemen."
      />

      <div className="flex items-center justify-center pt-4">
        <Card className="w-full max-w-md border-gray-200 bg-white shadow-xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto h-14 w-14 rounded-full bg-[#E6F3F7] border border-[#CCE7EF] flex items-center justify-center mb-2">
              <Lock className="h-7 w-7 text-[#004B5F]" />
            </div>
            <CardTitle className="text-2xl text-[#004B5F] font-extrabold">Verifikasi Sesi</CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Masukkan surel dan kata sandi kementerian Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-[#004B5F] uppercase tracking-wider block mb-1.5">Email Resmi</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@universitas.ac.id"
                  className="block w-full rounded-xl border border-gray-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-[#004B5F] uppercase tracking-wider block mb-1.5">Kata Sandi</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-gray-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#004B5F] focus:ring-1 focus:ring-[#004B5F] outline-none transition-all"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#EE152A] font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#004B5F] hover:bg-[#003847] disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#004B5F]/20 hover:-translate-y-0.5 mt-2"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Portal'}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
