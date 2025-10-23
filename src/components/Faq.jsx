import React, { useState } from 'react';
import Arrow from '../assets/down-arrow.png';

export default function FAQcomponent({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className={`faq-component flex ${open ? 'open' : ''}`} 
      onClick={() => setOpen(!open)}
      style={{
        height: open ? '200px' : '80px',
      }}
    >
      <div className='faq-line flex'>
        <img 
          src={Arrow} 
          alt="" 
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} 
        />
        <h3>Dotaz 1</h3>
      </div>
      <p>
       Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eveniet voluptatibus, nemo ipsam debitis velit dolorem pariatur! Quos excepturi quibusdam sed amet soluta similique modi recusandae quaerat voluptas pariatur, dolores non!
      </p>
    </div>
  );
}