import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Calendar, Clock, Building, Users, Info } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog';

const MONTHS = [
  { label: 'Agustus 2025', value: '2025-08' },
  { label: 'September 2025', value: '2025-09' },
  { label: 'Oktober 2025', value: '2025-10' },
  { label: 'November 2025', value: '2025-11' },
  { label: 'Desember 2025', value: '2025-12' },
  { label: 'Januari 2026', value: '2026-01' },
  { label: 'Februari 2026', value: '2026-02' },
  { label: 'Maret 2026', value: '2026-03' },
  { label: 'April 2026', value: '2026-04' },
  { label: 'Mei 2026', value: '2026-05' },
  { label: 'Juni 2026', value: '2026-06' },
  { label: 'Juli 2026', value: '2026-07' },
];

export default function RoomScheduler() {
  useDocumentTitle('Jadwal Ruangan');
  const [selectedMonth, setSelectedMonth] = useState('2025-08');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal details state
  const [activeDate, setActiveDate] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);

  // Fetch all bookings
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('peminjaman_ruangan')
          .select('*');

        if (error) throw error;

        // Map and extract unique room names
        const roomsSet = new Set();
        data?.forEach((b) => {
          if (b.ruangan_utama) roomsSet.add(b.ruangan_utama);
        });

        setBookings(data || []);
        setUniqueRooms(Array.from(roomsSet).sort());
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to get total days in active month
  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const date = new Date(year, month, 0); // last day of current month
    const totalDays = date.getDate();

    const list = [];
    for (let d = 1; d <= totalDays; d++) {
      const paddedDay = String(d).padStart(2, '0');
      const paddedMonth = String(month).padStart(2, '0');
      list.push(`${year}-${paddedMonth}-${paddedDay}`);
    }
    return list;
  };

  const daysList = getDaysInMonth(selectedMonth);

  // Get offset blank cells for Monday-start calendar grid
  const getFirstDayOffset = (yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const day = firstDay.getDay(); // 0 = Sun, 1 = Mon ...
    return (day + 6) % 7; // Map to Mon = 0, Tue = 1, ... Sun = 6
  };

  const offset = getFirstDayOffset(selectedMonth);

  // Styling Helpers for Rooms
  const getRoomBadgeStyles = (room) => {
    const normalized = room.toLowerCase();
    if (normalized.includes('aula') || normalized.includes('auditorium')) {
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    }
    if (normalized.includes('rapat') || normalized.includes('meeting')) {
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
    if (normalized.includes('sekre') || normalized.includes('sekretariat')) {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
    return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
  };

  const getRoomDotStyles = (room) => {
    const normalized = room.toLowerCase();
    if (normalized.includes('aula') || normalized.includes('auditorium')) {
      return 'bg-purple-500';
    }
    if (normalized.includes('rapat') || normalized.includes('meeting')) {
      return 'bg-blue-500';
    }
    if (normalized.includes('sekre') || normalized.includes('sekretariat')) {
      return 'bg-emerald-500';
    }
    return 'bg-indigo-500';
  };

  const formatFullDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getBookingsForDate = (dateStr) => {
    return bookings.filter((b) => b.tanggal === dateStr);
  };

  const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="space-y-8">
      {/* Page Header (Unified) */}
      <PageHeader
        tag="Jadwal Ruangan"
        icon={Calendar}
        title="Jadwal Ruangan Ormawa BEM"
        description="Papan informasi reservasi ruang pertemuan ormawa secara real-time. Silakan hubungi kementerian terkait untuk melakukan pemesanan jadwal kegiatan."
      />

      <Tabs value={selectedMonth} onValueChange={setSelectedMonth}>
        {/* Month Selector Tabs wrapper */}
        <div className="border-b border-gray-900 pb-2">
          <TabsList className="flex flex-row overflow-x-auto gap-1 py-1 max-w-full justify-start whitespace-nowrap scrollbar-thin">
            {MONTHS.map((m) => (
              <TabsTrigger
                key={m.value}
                value={m.value}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
              >
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Display selected month details */}
        {MONTHS.map((m) => (
          <TabsContent key={m.value} value={m.value} className="pt-4">
            <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl text-white">{m.label}</CardTitle>
                  <CardDescription>Jadwal reservasi ruangan terdaftar</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 py-1.5 px-3.5 rounded-full font-bold">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{daysList.length} Hari</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">

                {loading ? (
                  <div className="py-12">
                    <TableSkeleton />
                  </div>
                ) : (
                  <>
                    {/* Weekdays Header */}
                    <div className="grid grid-cols-7 gap-1.5 md:gap-3 text-center font-bold text-[10px] md:text-xs text-gray-400 mb-2 md:mb-3">
                      {WEEKDAYS.map((day) => (
                        <div key={day} className="py-1.5 md:py-2 bg-gray-950/40 rounded-lg border border-gray-800/40">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1.5 md:gap-3">
                      {/* Offset blanks */}
                      {Array.from({ length: offset }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="aspect-square md:min-h-[110px] rounded-xl bg-gray-950/10 border border-gray-900/10 opacity-30" />
                      ))}

                      {/* Days list */}
                      {daysList.map((dateStr) => {
                        const dayBookings = getBookingsForDate(dateStr);
                        const dayNum = parseInt(dateStr.split('-')[2]);
                        
                        // Check if dateStr matches today's local date
                        const todayStr = new Date().toISOString().split('T')[0];
                        const isToday = dateStr === todayStr;

                        const dayOfWeek = new Date(dateStr).getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                        return (
                          <div
                            key={dateStr}
                            onClick={() => {
                              setActiveDate(dateStr);
                              setActiveBookings(dayBookings);
                            }}
                            className={`aspect-square md:aspect-auto md:min-h-[110px] p-2 md:p-3 rounded-xl border bg-gray-900/20 hover:bg-gray-800/40 backdrop-blur-sm cursor-pointer transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 flex flex-col justify-between group ${
                              isToday 
                                ? 'border-purple-500 ring-1 ring-purple-500 shadow-lg shadow-purple-500/10' 
                                : isWeekend 
                                  ? 'border-gray-850 bg-gray-950/30' 
                                  : 'border-gray-850'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`text-xs md:text-sm font-bold ${isToday ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'}`}>
                                {dayNum}
                              </span>
                              {dayBookings.length > 0 && (
                                <span className="text-[8px] md:text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-400">
                                  {dayBookings.length}
                                </span>
                              )}
                            </div>

                            {/* Bookings Indicator */}
                            <div className="mt-1 md:mt-2 space-y-1 overflow-hidden">
                              {/* Desktop badge lists */}
                              <div className="hidden md:block space-y-1">
                                {dayBookings.slice(0, 2).map((b) => (
                                  <div
                                    key={b.id}
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate ${getRoomBadgeStyles(b.ruangan_utama)}`}
                                    title={`${b.nama_ormawa}: ${b.nama_agenda}`}
                                  >
                                    {b.ruangan_utama}
                                  </div>
                                ))}
                                {dayBookings.length > 2 && (
                                  <div className="text-[8px] text-gray-500 font-extrabold pl-1.5">
                                    + {dayBookings.length - 2} lainnya
                                  </div>
                                )}
                              </div>

                              {/* Mobile dots indicator */}
                              <div className="flex md:hidden flex-wrap gap-1 justify-center">
                                {dayBookings.map((b) => (
                                  <span
                                    key={b.id}
                                    className={`h-1.5 w-1.5 rounded-full ${getRoomDotStyles(b.ruangan_utama)}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Legend Info */}
                    <div className="mt-6 flex flex-wrap gap-4 items-center justify-center p-3 rounded-xl border border-gray-800/40 bg-gray-950/20 text-[10px] md:text-xs">
                      <span className="text-gray-500 font-semibold flex items-center gap-1">
                        <Info className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                        <span>Legenda Ruangan:</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-gray-400">Aula Utama / Auditorium</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-gray-400">Ruang Rapat</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-gray-400">Sekretariat BEM</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        <span className="text-gray-400">Ruangan Lain</span>
                      </div>
                    </div>
                  </>
                )}

              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* ── Dialog Details Modal ────────────────────────────────── */}
      <Dialog open={!!activeDate} onOpenChange={() => setActiveDate(null)}>
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">
            Jadwal Reservasi Ruangan
          </DialogTitle>
          <DialogDescription className="text-xs text-purple-400 font-bold mt-1">
            {activeDate && formatFullDate(activeDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          {activeBookings.length === 0 ? (
            <div className="text-center py-10">
              <Building className="h-10 w-10 mx-auto text-gray-700 mb-2" />
              <p className="text-gray-400 text-xs font-semibold">Tidak ada agenda reservasi ruangan pada tanggal ini.</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Ruangan tersedia penuh untuk digunakan.</p>
            </div>
          ) : (
            activeBookings.map((b) => (
              <div key={b.id} className="p-4 rounded-xl border border-gray-800 bg-gray-900/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">
                      Organisasi / Ormawa
                    </span>
                    <h4 className="font-bold text-white text-xs md:text-sm flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span>{b.nama_ormawa}</span>
                    </h4>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoomBadgeStyles(b.ruangan_utama)}`}>
                    {b.ruangan_utama}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">
                    Nama Agenda Kegiatan
                  </span>
                  <p className="text-xs text-gray-200 font-semibold">{b.nama_agenda}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-gray-950">
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">
                      Waktu Acara
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{b.jam_acara}</span>
                    </div>
                  </div>
                  {b.ruangan_tambahan && (
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">
                        Fasilitas Lain
                      </span>
                      <span className="text-[9px] text-gray-300 bg-gray-950 px-1.5 py-0.5 rounded inline-block font-semibold">
                        {b.ruangan_tambahan}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setActiveDate(null)}
            className="px-4 py-2 rounded-lg bg-gray-900 text-gray-400 hover:text-white text-xs cursor-pointer border border-gray-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </Dialog>
    </div>
  );
}
