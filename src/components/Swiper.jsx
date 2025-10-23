import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function SwiperLightbox({ images = [], currentIndex = 0, onClose }) {
  // fallback, pokud není žádný obrázek
  if (!images.length) return null;

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  const buttonStyles = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '32px',
    color: 'white',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    zIndex: 10000,
  };

  return (
    <div style={overlayStyles}>
      <button onClick={onClose} style={buttonStyles}>&times;</button>
      <div style={{ width: '80%', height: '80vh' }}>
        <Swiper
          key={currentIndex}
          initialSlide={currentIndex}
          navigation={true}
          modules={[Navigation]}
          slidesPerView={1}
          style={{ width: '100%', height: '100%' }}
        >
          {images.map((img, i) => (
            <SwiperSlide
              key={i}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <img
                src={img}
                alt=""
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
