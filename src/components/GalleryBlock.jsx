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
      {images.map((img, index) => {
        const isLarge =
          index % 7 === 0 || index === 0; // nebo jiná logika pro "velké" fotky
        const animationClass = isLarge ? 'fade-left' : 'fade-in';

        return (
          <div
            key={index}
            className={`gallery-item ${isLarge ? 'gallery-item-large' : ''} ${animationClass}`}
            onClick={() => openLightbox(index)}
          >
            <img src={img} alt="" />
          </div>
        );
      })}

      {lightboxOpen && (
        <SwiperLightbox
          images={images}
          currentIndex={currentIndex}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
