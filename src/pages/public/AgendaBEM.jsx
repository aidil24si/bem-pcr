import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, MapPin, Clock } from 'lucide-react';

export default function AgendaBEM() {
  const [agendaList, setAgendaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgenda = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('agenda')
        .select('*')
        .order('tanggal_mulai', { ascending: true });
      setAgendaList(data || []);
      setLoading(false);
    };
    fetchAgenda();
  }, []);

  const formatAgendaDate = (start, end) => {
    const sDate = new Date(start);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    
    if (!end || start === end) {
      return sDate.toLocaleDateString('id-ID', options);
    }
    
    const eDate = new Date(end);
    if (sDate.getMonth() === eDate.getMonth()) {
      return `${sDate.getDate()} – ${eDate.toLocaleDateString('id-ID', options)}`;
    }
    return `${sDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – ${eDate.toLocaleDateString('id-ID', options)}`;
  };

  const isUpcoming = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const agendaDate = new Date(dateStr);
    return agendaDate >= today;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Agenda Kegiatan BEM
        </h2>
        <p className="text-gray-400">
          Ikuti timeline kegiatan, agenda audiensi, sosialisasi, dan aksi kemahasiswaan mendatang.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Memuat agenda...</p>
        </div>
      ) : agendaList.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
          <Calendar className="h-10 w-10 mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm font-semibold">Tidak ada agenda kegiatan terdaftar</p>
        </div>
      ) : (
        /* Timeline Container */
        <div className="relative border-l border-gray-800 ml-4 md:ml-32 space-y-8 py-2">
          {agendaList.map((a) => {
            const active = isUpcoming(a.tanggal_mulai);
            return (
              <div key={a.id} className="relative pl-6 md:pl-8 group">
                
                {/* Left side Date for desktop */}
                <div className="hidden md:block absolute right-full top-0.5 mr-8 text-right w-24">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-500 block">Mulai</span>
                  <span className="text-sm font-bold text-white">
                    {new Date(a.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {/* Point on timeline */}
                <div className={`absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 transition-colors ${
                  active 
                    ? 'bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/50 scale-125' 
                    : 'bg-gray-950 border-gray-700'
                }`} />

                {/* Content Card */}
                <div className={`p-5 rounded-2xl border bg-gray-900/20 hover:bg-gray-900/40 transition-all ${
                  active ? 'border-purple-500/20 hover:border-purple-500/40' : 'border-gray-800 hover:border-gray-700'
                }`}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {active ? (
                      <span className="text-[9px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2 py-0.5 rounded uppercase tracking-wider">
                        Akan Datang
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold text-gray-500 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded uppercase tracking-wider">
                        Selesai
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 md:hidden font-semibold">
                      {formatAgendaDate(a.tanggal_mulai, a.tanggal_selesai)}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-tight group-hover:text-purple-300 transition-colors">
                    {a.judul_agenda}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed mt-2">{a.deskripsi}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-gray-900/50 text-[10px] text-gray-500">
                    <span className="md:flex hidden items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-purple-400" />
                      {formatAgendaDate(a.tanggal_mulai, a.tanggal_selesai)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-purple-400" />
                      {a.waktu}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-purple-400" />
                      {a.lokasi}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
