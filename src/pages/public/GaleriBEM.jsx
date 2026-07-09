import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Image as ImageIcon, Calendar, Tag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/ui/PageHeader';
import { CardGridSkeleton } from '../../components/ui/Skeleton';

export default function GaleriBEM() {
  useDocumentTitle('Galeri Kegiatan');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Semua');

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('galeri')
        .select('*')
        .order('tanggal_unggah', { ascending: false });
      setPhotos(data || []);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  const categories = ['Semua', ...Array.from(new Set(photos.map((p) => p.kategori)))];

  const filteredPhotos = photos.filter((p) => {
    return activeFilter === 'Semua' || p.kategori === activeFilter;
  });

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const navigateLightbox = (direction) => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      let nextIndex = prev + direction;
      if (nextIndex < 0) nextIndex = filteredPhotos.length - 1;
      if (nextIndex >= filteredPhotos.length) nextIndex = 0;
      return nextIndex;
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header (Unified) */}
      <PageHeader
        tag="Galeri Foto"
        icon={ImageIcon}
        title="Galeri Kegiatan BEM"
        description="Dokumentasi visual dari berbagai aksi sosial, program kerja taktis kementerian, dan rangkaian seremonial resmi kemahasiswaan."
      />

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 justify-center border-b border-gray-900 pb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveFilter(c)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              activeFilter === c
                ? 'bg-purple-600/15 text-purple-300 border-purple-500/25'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/[0.03]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {loading ? (
        <CardGridSkeleton count={3} />
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
          <ImageIcon className="h-10 w-10 mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm font-semibold">Belum ada foto kegiatan diunggah</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="group relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900/10 cursor-pointer hover:border-purple-500/30 transition-all hover:scale-[1.02] duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={photo.gambar_url}
                  alt={photo.judul_foto}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end space-y-1">
                <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-widest">
                  {photo.kategori}
                </span>
                <h4 className="font-extrabold text-white text-sm leading-tight">{photo.judul_foto}</h4>
                <p className="text-[10px] text-gray-300 line-clamp-1">{photo.deskripsi}</p>
                <div className="flex items-center gap-1 text-[9px] text-gray-400 pt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(photo.tanggal_unggah).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-w-4xl w-full flex items-center justify-center gap-4">
            {/* Left Nav */}
            <button
              onClick={() => navigateLightbox(-1)}
              className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            {/* Image & Description */}
            <div className="flex flex-col items-center space-y-4 max-w-3xl">
              <div className="max-h-[70vh] rounded-xl overflow-hidden border border-white/10">
                <img
                  src={filteredPhotos[lightboxIndex].gambar_url}
                  alt={filteredPhotos[lightboxIndex].judul_foto}
                  className="max-h-[70vh] object-contain"
                />
              </div>
              <div className="text-center space-y-1 px-4">
                <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  <Tag className="h-3 w-3" /> {filteredPhotos[lightboxIndex].kategori}
                </div>
                <h3 className="font-extrabold text-white text-lg">{filteredPhotos[lightboxIndex].judul_foto}</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-xl mx-auto">{filteredPhotos[lightboxIndex].deskripsi}</p>
                <p className="text-[10px] text-gray-500">
                  Diunggah: {new Date(filteredPhotos[lightboxIndex].tanggal_unggah).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Right Nav */}
            <button
              onClick={() => navigateLightbox(1)}
              className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
