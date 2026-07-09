import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

// ─── Daftar Ruangan yang Tersedia ──────────────────────────────
const RUANGAN_OPTIONS = [
  'Auditorium Utama',
  'Ruang Seminar 101',
  'Aula Gedung C',
  'Ruang Rapat BEM',
  'Ruang Sidang Senat',
  'Lapangan Serbaguna',
];

// ─── Helpers ───────────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  tanggal: TODAY,
  jam_mulai: '08:00',
  jam_selesai: '10:00',
  ruangan_utama: RUANGAN_OPTIONS[0],
  ruangan_tambahan: '',
  nama_ormawa: '',
  nama_agenda: '',
  penanggung_jawab: '',
  kontak_pj: '',
  keterangan: '',
};

function inputClass(hasError = false) {
  return `block w-full rounded-lg border ${
    hasError ? 'border-red-600' : 'border-gray-800'
  } bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors`;
}

function labelClass() {
  return 'text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1';
}

// ─── Komponen BookingCard ───────────────────────────────────────
function BookingCard({ booking, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 hover:border-gray-700 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="space-y-0.5 flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{booking.nama_agenda}</p>
          <p className="text-xs text-purple-400 font-semibold truncate">{booking.nama_ormawa}</p>
        </div>
        <div className="flex items-center gap-1 ml-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(booking)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
              title="Hapus"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onDelete(booking.id); setConfirmDelete(false); }}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/60 transition-colors cursor-pointer"
                title="Konfirmasi Hapus"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Calendar className="h-3 w-3 text-indigo-400 shrink-0" />
          <span>{new Date(booking.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <Clock className="h-3 w-3 text-indigo-400 shrink-0" />
          <span>{booking.jam_acara || `${booking.jam_mulai} – ${booking.jam_selesai}`}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 col-span-2">
          <MapPin className="h-3 w-3 text-purple-400 shrink-0" />
          <span className="truncate">
            {booking.ruangan_utama}
            {booking.ruangan_tambahan && ` + ${booking.ruangan_tambahan}`}
          </span>
        </div>
        {booking.penanggung_jawab && (
          <div className="flex items-center gap-1.5 text-gray-400 col-span-2">
            <Users className="h-3 w-3 text-gray-500 shrink-0" />
            <span>{booking.penanggung_jawab}{booking.kontak_pj && ` · ${booking.kontak_pj}`}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function RoomManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filter state
  const [filterMonth, setFilterMonth] = useState(TODAY.slice(0, 7)); // YYYY-MM
  const [filterRuangan, setFilterRuangan] = useState('');

  // ── Fetch ──
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('peminjaman_ruangan')
      .select('*')
      .order('tanggal', { ascending: true });
    setBookings(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // ── Filtered list ──
  const filteredBookings = bookings.filter((b) => {
    const matchMonth   = !filterMonth   || b.tanggal?.startsWith(filterMonth);
    const matchRuangan = !filterRuangan || b.ruangan_utama === filterRuangan;
    return matchMonth && matchRuangan;
  });

  // Navigate months
  const changeMonth = (dir) => {
    const [y, m] = filterMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setFilterMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthLabel = () => {
    const [y, m] = filterMonth.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // ── Form Handlers ──
  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.tanggal)        e.tanggal        = 'Wajib diisi';
    if (!form.jam_mulai)      e.jam_mulai      = 'Wajib diisi';
    if (!form.jam_selesai)    e.jam_selesai    = 'Wajib diisi';
    if (!form.ruangan_utama)  e.ruangan_utama  = 'Pilih ruangan';
    if (!form.nama_ormawa.trim())  e.nama_ormawa  = 'Wajib diisi';
    if (!form.nama_agenda.trim())  e.nama_agenda  = 'Wajib diisi';
    if (form.jam_mulai && form.jam_selesai && form.jam_selesai <= form.jam_mulai) {
      e.jam_selesai = 'Jam selesai harus setelah jam mulai';
    }
    return e;
  };

  // Cek konflik jadwal
  const checkConflict = (form, excludeId = null) => {
    return bookings.some((b) => {
      if (b.id === excludeId) return false;
      if (b.tanggal !== form.tanggal) return false;
      if (b.ruangan_utama !== form.ruangan_utama) return false;
      // Time overlap check
      const bStart = b.jam_mulai || b.jam_acara?.split(' – ')[0] || '';
      const bEnd   = b.jam_selesai || b.jam_acara?.split(' – ')[1] || '';
      if (!bStart || !bEnd) return false;
      return form.jam_mulai < bEnd && form.jam_selesai > bStart;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const hasConflict = checkConflict(form, editingId);
    if (hasConflict) {
      setErrorMsg('⚠️ Konflik jadwal: Ruangan ini sudah dipesan pada rentang waktu yang sama.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      tanggal:           form.tanggal,
      jam_mulai:         form.jam_mulai,
      jam_selesai:       form.jam_selesai,
      jam_acara:         `${form.jam_mulai} – ${form.jam_selesai}`,
      ruangan_utama:     form.ruangan_utama,
      ruangan_tambahan:  form.ruangan_tambahan || null,
      nama_ormawa:       form.nama_ormawa.trim(),
      nama_agenda:       form.nama_agenda.trim(),
      penanggung_jawab:  form.penanggung_jawab.trim() || null,
      kontak_pj:         form.kontak_pj.trim() || null,
      keterangan:        form.keterangan.trim() || null,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('peminjaman_ruangan')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        setSuccessMsg('✅ Data jadwal berhasil diperbarui.');
      } else {
        const { error } = await supabase
          .from('peminjaman_ruangan')
          .insert([payload]);
        if (error) throw error;
        setSuccessMsg('✅ Jadwal baru berhasil ditambahkan.');
      }
      resetForm();
      fetchBookings();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (booking) => {
    setEditingId(booking.id);
    const [start, end] = (booking.jam_acara || '').split(' – ');
    setForm({
      tanggal:          booking.tanggal,
      jam_mulai:        booking.jam_mulai || start || '',
      jam_selesai:      booking.jam_selesai || end || '',
      ruangan_utama:    booking.ruangan_utama,
      ruangan_tambahan: booking.ruangan_tambahan || '',
      nama_ormawa:      booking.nama_ormawa,
      nama_agenda:      booking.nama_agenda,
      penanggung_jawab: booking.penanggung_jawab || '',
      kontak_pj:        booking.kontak_pj || '',
      keterangan:       booking.keterangan || '',
    });
    setErrors({});
    setSuccessMsg('');
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('peminjaman_ruangan')
      .delete()
      .eq('id', id);
    if (!error) {
      setSuccessMsg('✅ Jadwal berhasil dihapus.');
      fetchBookings();
    } else {
      setErrorMsg('Gagal menghapus. Coba lagi.');
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
  };

  // ── JSX ────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

      {/* ── KOLOM KIRI: FORM INPUT ─────────────────────────── */}
      <div className="md:col-span-5">
        <Card className="border-gray-800 bg-gray-900/50 sticky top-20">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              {editingId
                ? <><Edit3 className="h-4 w-4 text-amber-400" /> Edit Jadwal Peminjaman</>
                : <><Plus className="h-4 w-4 text-purple-400" /> Tambah Jadwal Peminjaman</>
              }
            </CardTitle>
            <CardDescription>
              {editingId ? 'Perbarui data peminjaman ruangan.' : 'Input jadwal peminjaman ormawa baru.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">

              {/* ── Baris 1: Tanggal & Jam ── */}
              <div>
                <label className={labelClass()}>Tanggal Kegiatan</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setField('tanggal', e.target.value)}
                  className={inputClass(!!errors.tanggal)}
                />
                {errors.tanggal && <p className="text-[10px] text-red-400 mt-1">{errors.tanggal}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass()}>Jam Mulai</label>
                  <input
                    type="time"
                    value={form.jam_mulai}
                    onChange={(e) => setField('jam_mulai', e.target.value)}
                    className={inputClass(!!errors.jam_mulai)}
                  />
                  {errors.jam_mulai && <p className="text-[10px] text-red-400 mt-1">{errors.jam_mulai}</p>}
                </div>
                <div>
                  <label className={labelClass()}>Jam Selesai</label>
                  <input
                    type="time"
                    value={form.jam_selesai}
                    onChange={(e) => setField('jam_selesai', e.target.value)}
                    className={inputClass(!!errors.jam_selesai)}
                  />
                  {errors.jam_selesai && <p className="text-[10px] text-red-400 mt-1">{errors.jam_selesai}</p>}
                </div>
              </div>

              {/* ── Ruangan Utama ── */}
              <div>
                <label className={labelClass()}>Ruangan Utama</label>
                <select
                  value={form.ruangan_utama}
                  onChange={(e) => setField('ruangan_utama', e.target.value)}
                  className={inputClass(!!errors.ruangan_utama)}
                >
                  {RUANGAN_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.ruangan_utama && <p className="text-[10px] text-red-400 mt-1">{errors.ruangan_utama}</p>}
              </div>

              {/* ── Ruangan Tambahan (Opsional) ── */}
              <div>
                <label className={labelClass()}>
                  Ruangan Tambahan <span className="text-gray-600 normal-case font-normal">(opsional)</span>
                </label>
                <select
                  value={form.ruangan_tambahan}
                  onChange={(e) => setField('ruangan_tambahan', e.target.value)}
                  className={inputClass()}
                >
                  <option value="">— Tidak Ada —</option>
                  {RUANGAN_OPTIONS.filter((r) => r !== form.ruangan_utama).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <hr className="border-gray-800" />

              {/* ── Nama Ormawa ── */}
              <div>
                <label className={labelClass()}>Nama Ormawa / Peminjam</label>
                <input
                  type="text"
                  value={form.nama_ormawa}
                  onChange={(e) => setField('nama_ormawa', e.target.value)}
                  placeholder="cth: BEM, HMTI, UKM Paduan Suara"
                  className={inputClass(!!errors.nama_ormawa)}
                />
                {errors.nama_ormawa && <p className="text-[10px] text-red-400 mt-1">{errors.nama_ormawa}</p>}
              </div>

              {/* ── Nama Agenda ── */}
              <div>
                <label className={labelClass()}>Nama Kegiatan / Agenda</label>
                <input
                  type="text"
                  value={form.nama_agenda}
                  onChange={(e) => setField('nama_agenda', e.target.value)}
                  placeholder="cth: Rapat Koordinasi Proker, Seminar Nasional"
                  className={inputClass(!!errors.nama_agenda)}
                />
                {errors.nama_agenda && <p className="text-[10px] text-red-400 mt-1">{errors.nama_agenda}</p>}
              </div>

              {/* ── Penanggung Jawab & Kontak ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass()}>
                    Penanggung Jawab <span className="text-gray-600 normal-case font-normal">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.penanggung_jawab}
                    onChange={(e) => setField('penanggung_jawab', e.target.value)}
                    placeholder="Nama PJ"
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>
                    Kontak PJ <span className="text-gray-600 normal-case font-normal">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.kontak_pj}
                    onChange={(e) => setField('kontak_pj', e.target.value)}
                    placeholder="08xx-xxxx-xxxx"
                    className={inputClass()}
                  />
                </div>
              </div>

              {/* ── Keterangan ── */}
              <div>
                <label className={labelClass()}>
                  Keterangan Tambahan <span className="text-gray-600 normal-case font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.keterangan}
                  onChange={(e) => setField('keterangan', e.target.value)}
                  placeholder="Catatan khusus mengenai peminjaman ini..."
                  className={`${inputClass()} resize-none`}
                />
              </div>

              {/* ── Feedback Messages ── */}
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <p>{errorMsg}</p>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  <p>{successMsg}</p>
                </div>
              )}

              {/* ── Submit Buttons ── */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-purple-900/30"
                >
                  {saving
                    ? <><div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                    : <><Check className="h-4 w-4" /> {editingId ? 'Perbarui Jadwal' : 'Simpan Jadwal'}</>
                  }
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-2.5 px-4 rounded-lg border border-gray-700 bg-gray-900/50 text-gray-400 hover:text-white text-sm font-semibold cursor-pointer transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ── KOLOM KANAN: DAFTAR JADWAL ────────────────────── */}
      <div className="md:col-span-7 space-y-5">

        {/* Header & Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              Daftar Jadwal Terdaftar
            </h4>
            <span className="text-xs text-gray-500">{filteredBookings.length} jadwal</span>
          </div>

          {/* Filter Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Month Navigator */}
            <div className="flex items-center gap-1 border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-xs font-semibold text-gray-200 whitespace-nowrap min-w-[120px] text-center">
                {monthLabel()}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Room Filter */}
            <select
              value={filterRuangan}
              onChange={(e) => setFilterRuangan(e.target.value)}
              className="border border-gray-800 bg-gray-900/50 text-xs text-gray-300 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none cursor-pointer"
            >
              <option value="">Semua Ruangan</option>
              {RUANGAN_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {(filterRuangan) && (
              <button
                onClick={() => setFilterRuangan('')}
                className="text-[10px] text-gray-500 hover:text-gray-300 flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3 w-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Booking List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="h-7 w-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-xs">Memuat data jadwal...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
            <Calendar className="h-10 w-10 mx-auto text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm font-semibold">Belum ada jadwal terdaftar</p>
            <p className="text-gray-600 text-xs mt-1">
              {filterRuangan ? `untuk ruangan "${filterRuangan}"` : 'di bulan ini'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {filteredBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
