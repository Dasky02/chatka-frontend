import React, { useState } from 'react';
import SwiperLightbox from './Swiper';

export default function GallerySection({ images }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || !images.length) return null;

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  return (
    <div className="gallery-container">
      {/* Vlevo velký obrázek */}
      <div className="gallery-left" onClick={() => openLightbox(0)}>
        <img src={images[0]} alt="" />
      </div>

      {/* Vpravo */}
      <div className="gallery-right">
        {/* Pravý horní */}
        {images[1] && (
          <div className="gallery-right-top" onClick={() => openLightbox(1)}>
            <img src={images[1]} alt="" />
          </div>
        )}

        {/* Pravý dolní – všechny ostatní obrázky */}
        <div className="gallery-right-bottom">
          {images.slice(2).map((img, index) => (
            <div key={index} className="gallery-small" onClick={() => openLightbox(index + 2)}>
              <img src={img} alt="" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <SwiperLightbox images={images} currentIndex={currentIndex} onClose={closeLightbox} />
      )}
    </div>
  );
}
