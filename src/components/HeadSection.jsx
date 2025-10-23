import React from 'react';
// import externího CSS
import Mouse from '../assets/mouse-cursor.png'

export default function HeadSection({name}) {
  return (
    <header className="head-section flex">
        <div className='head-block flex'>
            <h1 className='fade-in'>{name || 'Název'}</h1>
        </div>
    </header>
  );
}
