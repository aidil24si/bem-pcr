import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Calendar, Clock, Building, Users, MoveHorizontal } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';
import { TableSkeleton } from '../../components/ui/Skeleton';

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
  const [uniqueRooms, setUniqueRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all bookings to extract unique rooms & map active month
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

  // Formatter helpers
  const formatDayName = (dateStr) => {
    const date = new Date(dateStr);
    const dayNum = date.getDate();
    const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
    return `${dayNum} (${dayName})`;
  };

  const getBookingFor = (dateStr, room) => {
    return bookings.find(
      (b) => b.tanggal === dateStr && b.ruangan_utama === room
    );
  };

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
              <CardContent className="p-0 relative">
                
                {/* Horizontal Swipe Indicator for Mobile */}
                <div className="block md:hidden bg-purple-600/10 border-b border-purple-500/15 py-2 px-4 text-center text-[10px] font-extrabold text-purple-300 flex items-center justify-center gap-1.5">
                  <MoveHorizontal className="h-3.5 w-3.5 animate-pulse" />
                  <span>Geser ke samping (swipe) untuk melihat seluruh kolom ruangan</span>
                </div>

                {loading ? (
                  <div className="p-6">
                    <TableSkeleton />
                  </div>
                ) : uniqueRooms.length === 0 ? (
                  <div className="text-center py-16">
                    <Building className="h-10 w-10 mx-auto text-gray-700 mb-2" />
                    <p className="text-gray-500 text-sm font-semibold">Belum ada ruangan yang dipinjam bulan ini.</p>
                  </div>
                ) : (
                  /* Horizontal Scroll Container */
                  <div className="overflow-x-auto w-full">
                    <div className="min-w-[768px] w-full">
                      <table className="w-full border-collapse text-left text-sm text-gray-300">
                        <thead className="bg-gray-950/65 border-b border-gray-800 text-gray-400">
                          <tr>
                            <th className="py-4 px-4 font-semibold w-28 border-r border-gray-800 text-xs uppercase tracking-wider">Tanggal</th>
                            {uniqueRooms.map((room) => (
                              <th key={room} className="py-4 px-6 font-semibold border-r border-gray-800 last:border-r-0">
                                <div className="flex items-center gap-2 text-white text-xs uppercase tracking-wider">
                                  <Building className="h-4 w-4 text-purple-500 shrink-0" />
                                  <span>{room}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {daysList.map((dateStr) => {
                            const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
                            return (
                              <tr key={dateStr} className={`hover:bg-gray-800/10 transition-colors ${isWeekend ? 'bg-gray-950/25' : ''}`}>
                                <td className="py-3.5 px-4 font-bold border-r border-gray-800 text-gray-400 text-xs whitespace-nowrap">
                                  {formatDayName(dateStr)}
                                </td>
                                {uniqueRooms.map((room) => {
                                  const booking = getBookingFor(dateStr, room);
                                  return (
                                    <td key={room} className="py-3 px-5 border-r border-gray-800 last:border-r-0">
                                      {booking ? (
                                        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 space-y-1.5 text-xs shadow-lg shadow-purple-950/5">
                                          <div className="font-bold text-purple-200 flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                                            <span>{booking.nama_ormawa}</span>
                                          </div>
                                          <div className="text-gray-300 font-medium line-clamp-1">{booking.nama_agenda}</div>
                                          <div className="flex items-center gap-1.5 text-[10px] text-purple-300 font-semibold">
                                            <Clock className="h-3.5 w-3.5 shrink-0" />
                                            <span>{booking.jam_acara}</span>
                                          </div>
                                          {booking.ruangan_tambahan && (
                                            <div className="text-[10px] text-gray-400 bg-gray-950 px-1.5 py-0.5 rounded inline-block mt-1 font-medium">
                                              + {booking.ruangan_tambahan}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-gray-700 text-xs">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
