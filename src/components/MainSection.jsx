import React from 'react';
// import externího CSS
import Mouse from '../assets/mouse-cursor.png'

export default function MainSection() {
  return (
    <header className="main flex">
        <div className='main-block flex'>
            <h1 className='fade-in'>Pronájem TinyHouse – Váš útulný únik do přírody</h1>
            <p className='fade-in'>Najdete nás v klidné přírodě, kousek od města – ideální místo pro odpočinek.</p>
        </div>
        <a href="#blocks"><img src={Mouse} alt="" /></a>
        <div className='shadow'>

        </div>
    </header>
  );
}
