import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Plus, Trash2, Edit3, Check, X, Layers, Calendar } from 'lucide-react';

export default function ManageProker() {
  const [prokerList, setProkerList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [kemList, setKemList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [prokerSearch, setProkerSearch] = useState('');
  const [prokerFilterKem, setProkerFilterKem] = useState('Semua');
  const [agendaSearch, setAgendaSearch] = useState('');

  // Form Proker
  const [editingProkerId, setEditingProkerId] = useState(null);
  const [prokerNama, setProkerNama] = useState('');
  const [prokerKemId, setProkerKemId] = useState('');
  const [prokerDesc, setProkerDesc] = useState('');
  const [prokerTarget, setProkerTarget] = useState('');
  const [prokerStatus, setProkerStatus] = useState('belum_mulai'); // belum_mulai, berjalan, selesai
  const [prokerPj, setProkerPj] = useState('');

  // Form Agenda
  const [editingAgendaId, setEditingAgendaId] = useState(null);
  const [agendaJudul, setAgendaJudul] = useState('');
  const [agendaStart, setAgendaStart] = useState('');
  const [agendaEnd, setAgendaEnd] = useState('');
  const [agendaLokasi, setAgendaLokasi] = useState('');
  const [agendaWaktu, setAgendaWaktu] = useState('');
  const [agendaDesc, setAgendaDesc] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: p } = await supabase.from('proker').select('*');
    const { data: a } = await supabase.from('agenda').select('*').order('tanggal_mulai', { ascending: true });
    const { data: k } = await supabase.from('kementerian').select('*').order('hierarki_order', { ascending: true });
    
    setProkerList(p || []);
    setAgendaList(a || []);
    setKemList(k || []);

    if (k && k.length > 0) {
      setProkerKemId(k[0].id);
    }
    setLoading(false);
  };

  const getMinistryName = (id) => {
    const found = kemList.find((k) => k.id === id);
    return found ? found.nama_kementerian : 'Kementerian Sektoral';
  };

  // ── PROKER HANDLERS ──
  const handleSaveProker = async (e) => {
    e.preventDefault();
    if (!prokerNama || !prokerKemId || !prokerDesc || !prokerTarget || !prokerPj) {
      setErrorMsg('Wajib mengisi semua field program kerja.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      nama_proker: prokerNama,
      kementerian_id: prokerKemId,
      deskripsi: prokerDesc,
      target_pelaksanaan: prokerTarget,
      status: prokerStatus,
      penanggung_jawab: prokerPj,
    };

    try {
      if (editingProkerId) {
        await supabase.from('proker').update(payload).eq('id', editingProkerId);
        setSuccessMsg('Program kerja berhasil diperbarui.');
      } else {
        await supabase.from('proker').insert([payload]);
        setSuccessMsg('Program kerja baru berhasil ditambahkan.');
      }
      resetProkerForm();
      fetchData();
    } catch (err) {
      setErrorMsg('Gagal menyimpan program kerja.');
    }
  };

  const handleEditProker = (p) => {
    setEditingProkerId(p.id);
    setProkerNama(p.nama_proker);
    setProkerKemId(p.kementerian_id);
    setProkerDesc(p.deskripsi);
    setProkerTarget(p.target_pelaksanaan);
    setProkerStatus(p.status);
    setProkerPj(p.penanggung_jawab);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleDeleteProker = async (id) => {
    await supabase.from('proker').delete().eq('id', id);
    setSuccessMsg('Program kerja berhasil dihapus.');
    fetchData();
  };

  const resetProkerForm = () => {
    setEditingProkerId(null);
    setProkerNama('');
    if (kemList.length > 0) setProkerKemId(kemList[0].id);
    setProkerDesc('');
    setProkerTarget('');
    setProkerStatus('belum_mulai');
    setProkerPj('');
  };

  // ── AGENDA HANDLERS ──
  const handleSaveAgenda = async (e) => {
    e.preventDefault();
    if (!agendaJudul || !agendaStart || !agendaLokasi || !agendaWaktu || !agendaDesc) {
      setErrorMsg('Wajib mengisi semua field agenda.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      judul_agenda: agendaJudul,
      tanggal_mulai: agendaStart,
      tanggal_selesai: agendaEnd || agendaStart,
      lokasi: agendaLokasi,
      waktu: agendaWaktu,
      deskripsi: agendaDesc,
    };

    try {
      if (editingAgendaId) {
        await supabase.from('agenda').update(payload).eq('id', editingAgendaId);
        setSuccessMsg('Agenda kegiatan berhasil diperbarui.');
      } else {
        await supabase.from('agenda').insert([payload]);
        setSuccessMsg('Agenda kegiatan baru berhasil ditambahkan.');
      }
      resetAgendaForm();
      fetchData();
    } catch (err) {
      setErrorMsg('Gagal menyimpan agenda.');
    }
  };

  const handleEditAgenda = (a) => {
    setEditingAgendaId(a.id);
    setAgendaJudul(a.judul_agenda);
    setAgendaStart(a.tanggal_mulai);
    setAgendaEnd(a.tanggal_selesai);
    setAgendaLokasi(a.lokasi);
    setAgendaWaktu(a.waktu);
    setAgendaDesc(a.deskripsi);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleDeleteAgenda = async (id) => {
    await supabase.from('agenda').delete().eq('id', id);
    setSuccessMsg('Agenda kegiatan berhasil dihapus.');
    fetchData();
  };

  const resetAgendaForm = () => {
    setEditingAgendaId(null);
    setAgendaJudul('');
    setAgendaStart('');
    setAgendaEnd('');
    setAgendaLokasi('');
    setAgendaWaktu('');
    setAgendaDesc('');
  };

  return (
    <div className="space-y-8">
      {/* Messages */}
      {successMsg && <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs rounded-xl">{successMsg}</div>}
      {errorMsg && <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs rounded-xl">{errorMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ── SEKSI 1: PROKER ── */}
        <Card className="border-gray-800 bg-gray-900/30">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              Kelola Program Kerja
            </CardTitle>
            <CardDescription>Tambah atau perbarui status progam kerja kementerian BEM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSaveProker} className="space-y-4 border-b border-gray-900 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nama Proker</label>
                  <input
                    type="text"
                    required
                    value={prokerNama}
                    onChange={(e) => setProkerNama(e.target.value)}
                    placeholder="cth: Upgrade & LDKM"
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Kementerian Pelaksana</label>
                  <select
                    value={prokerKemId}
                    onChange={(e) => setProkerKemId(e.target.value)}
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500"
                  >
                    {kemList.map((kem) => (
                      <option key={kem.id} value={kem.id}>{kem.nama_kementerian}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Deskripsi Proker</label>
                <textarea
                  required
                  rows={2}
                  value={prokerDesc}
                  onChange={(e) => setProkerDesc(e.target.value)}
                  placeholder="Detail rencana pelaksanaan dan tujuan..."
                  className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">PJ Proker (Kementerian/Biro)</label>
                  <input
                    type="text"
                    required
                    value={prokerPj}
                    onChange={(e) => setProkerPj(e.target.value)}
                    placeholder="cth: Kementerian PSDM"
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Target</label>
                  <input
                    type="text"
                    required
                    value={prokerTarget}
                    onChange={(e) => setProkerTarget(e.target.value)}
                    placeholder="cth: Juni 2025"
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Status Proker</label>
                <select
                  value={prokerStatus}
                  onChange={(e) => setProkerStatus(e.target.value)}
                  className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500"
                >
                  <option value="belum_mulai">Belum Mulai</option>
                  <option value="berjalan">Berjalan</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer">
                  {editingProkerId ? 'Update Proker' : 'Simpan Proker'}
                </button>
                {editingProkerId && (
                  <button type="button" onClick={resetProkerForm} className="py-2 px-3 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-xs">
                    Batal
                  </button>
                )}
              </div>
            </form>

            {/* List Proker with Search and Filter */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cari program kerja..."
                  value={prokerSearch}
                  onChange={(e) => setProkerSearch(e.target.value)}
                  className="flex-grow bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
                <select
                  value={prokerFilterKem}
                  onChange={(e) => setProkerFilterKem(e.target.value)}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none max-w-[150px]"
                >
                  <option value="Semua">Semua Kem.</option>
                  {kemList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama_kementerian.split(' ')[0]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {prokerList
                  .filter((p) => {
                    const matchSearch =
                      p.nama_proker.toLowerCase().includes(prokerSearch.toLowerCase()) ||
                      p.deskripsi.toLowerCase().includes(prokerSearch.toLowerCase()) ||
                      p.penanggung_jawab.toLowerCase().includes(prokerSearch.toLowerCase());
                    const matchKem = prokerFilterKem === 'Semua' || p.kementerian_id === prokerFilterKem;
                    return matchSearch && matchKem;
                  })
                  .map((p) => (
                    <div key={p.id} className="p-3 rounded-lg border border-gray-800 bg-gray-950/25 flex items-center justify-between text-xs gap-4">
                      <div className="truncate">
                        <h4 className="font-bold text-white truncate">{p.nama_proker}</h4>
                        <span className="text-[9px] text-gray-500">
                          {getMinistryName(p.kementerian_id)} · Status: <span className="text-purple-400 font-bold uppercase">{p.status}</span>
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleEditProker(p)} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteProker(p.id)} className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── SEKSI 2: AGENDA KEGIATAN ── */}
        <Card className="border-gray-800 bg-gray-900/30">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              Kelola Agenda Kegiatan
            </CardTitle>
            <CardDescription>Tambah atau atur timeline kegiatan mendatang.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSaveAgenda} className="space-y-4 border-b border-gray-900 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Judul Agenda</label>
                  <input
                    type="text"
                    required
                    value={agendaJudul}
                    onChange={(e) => setAgendaJudul(e.target.value)}
                    placeholder="cth: Audiensi Terbuka"
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Lokasi</label>
                  <input
                    type="text"
                    required
                    value={agendaLokasi}
                    onChange={(e) => setAgendaLokasi(e.target.value)}
                    placeholder="cth: Aula Gedung C"
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tgl Mulai</label>
                  <input
                    type="date"
                    required
                    value={agendaStart}
                    onChange={(e) => setAgendaStart(e.target.value)}
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tgl Selesai</label>
                  <input
                    type="date"
                    value={agendaEnd}
                    onChange={(e) => setAgendaEnd(e.target.value)}
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Waktu / Jam</label>
                  <input
                    type="text"
                    required
                    value={agendaWaktu}
                    onChange={(e) => setAgendaWaktu(e.target.value)}
                    placeholder="08:00 - 13:00 WIB"
                    className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Deskripsi Agenda</label>
                <textarea
                  required
                  rows={2}
                  value={agendaDesc}
                  onChange={(e) => setAgendaDesc(e.target.value)}
                  placeholder="Detail singkat kegiatan..."
                  className="block w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer">
                  {editingAgendaId ? 'Update Agenda' : 'Simpan Agenda'}
                </button>
                {editingAgendaId && (
                  <button type="button" onClick={resetAgendaForm} className="py-2 px-3 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-xs">
                    Batal
                  </button>
                )}
              </div>
            </form>

            {/* List Agenda with Search */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Cari agenda..."
                value={agendaSearch}
                onChange={(e) => setAgendaSearch(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {agendaList
                  .filter((a) => {
                    return (
                      a.judul_agenda.toLowerCase().includes(agendaSearch.toLowerCase()) ||
                      a.lokasi.toLowerCase().includes(agendaSearch.toLowerCase()) ||
                      (a.deskripsi || '').toLowerCase().includes(agendaSearch.toLowerCase())
                    );
                  })
                  .map((a) => (
                    <div key={a.id} className="p-3 rounded-lg border border-gray-800 bg-gray-950/25 flex items-center justify-between text-xs gap-4">
                      <div className="truncate">
                        <h4 className="font-bold text-white truncate">{a.judul_agenda}</h4>
                        <span className="text-[9px] text-gray-500">Mulai: {a.tanggal_mulai} · {a.lokasi}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleEditAgenda(a)} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteAgenda(a.id)} className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
