import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function ProductGallery({ images = [], productName = '' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  useEffect(() => {
    if (!isZoomed) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsZoomed(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isZoomed]);

  const allImages = images.length > 0
    ? images
    : [{ url: 'https://placehold.co/600x600/e2e8f0/94a3b8?text=No+Image', alt_text: productName }];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative aspect-square bg-surface-100 rounded-xl overflow-hidden group">
        <img
          src={allImages[selectedIndex]?.url}
          alt={allImages[selectedIndex]?.alt_text || productName}
          className="w-full h-full object-cover"
        />

        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-white/80 rounded-full shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-surface-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-white/80 rounded-full shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-surface-700" />
            </button>
          </>
        )}

        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-2 sm:p-2.5 bg-white/80 rounded-full shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Zoom image"
        >
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-surface-700" />
        </button>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {selectedIndex + 1} / {allImages.length}
        </div>
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
          {allImages.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-colors snap-start min-h-[44px] min-w-[44px] ${
                index === selectedIndex
                  ? 'border-marsana-600'
                  : 'border-surface-200 hover:border-surface-300'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt_text || `${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={allImages[selectedIndex]?.url}
            alt={allImages[selectedIndex]?.alt_text || productName}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
