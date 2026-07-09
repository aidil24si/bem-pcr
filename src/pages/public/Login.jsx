import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Lock, AlertCircle } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';

export default function Login() {
  useDocumentTitle('Login Admin');
  const navigate = useNavigate();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSession, setHasSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if session already exists
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasSession(true);
      }
      setCheckingSession(false);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
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
        <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Memeriksa sesi...</p>
      </div>
    );
  }

  // If already logged in, redirect to admin directly
  if (hasSession) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      <PageHeader
        tag="Portal Autentikasi"
        icon={Lock}
        title="Masuk Pengurus BEM"
        description="Gunakan akun administrasi resmi BEM yang telah terdaftar di database untuk mengakses modul dasbor manajemen."
      />

      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md border-gray-800 bg-gray-900/40 backdrop-blur-md shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Lock className="h-6 w-6 text-purple-500" />
            </div>
            <CardTitle className="text-xl text-white">Verifikasi Sesi</CardTitle>
            <CardDescription className="text-xs">
              Masukkan surel dan kata sandi kementerian Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Resmi</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@universitas.ac.id"
                  className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Kata Sandi</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-400 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-purple-900/30"
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
