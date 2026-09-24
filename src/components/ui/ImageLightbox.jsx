import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * ImageLightbox - menampilkan foto pada ukuran natural (tanpa upscale).
 *
 * Aturan desain:
 * - Punya React Portal sendiri ke document.body (lepas dari stacking context apapun).
 * - TIDAK mengatur document.body.style.overflow - scroll-lock diserahkan
 *   sepenuhnya ke Dialog.jsx yang sudah membuka lebih dulu.
 * - Gambar ditampilkan pada natural size, dibatasi max-w/max-h agar tidak
 *   overflow di viewport kecil, tanpa di-stretch melebihi resolusi asli.
 */
export function ImageLightbox({ src, alt, onClose }) {
  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Tampilan foto bukti"
    >
      {/* Tombol close (X) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[61] rounded-lg p-2 bg-white/10 hover:bg-white/25 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
        aria-label="Tutup foto"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Gambar - max-w/max-h batas viewport, tanpa upscale melebihi natural size */}
      <img
        src={src}
        alt={alt || 'Foto bukti aspirasi'}
        className="relative z-[61] object-contain rounded-lg shadow-2xl"
        style={{
          maxWidth: 'min(100%, 600px)',
          maxHeight: 'calc(100vh - 3rem)',
          width: 'auto',
          height: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
}
