import React from 'react';
import Img from '../assets/chatka.jpg'
import Exterier from '../assets/main_pic.avif'
import Interier from '../assets/interier.avif'
import Cenik from '../assets/cenik.avif'
import Vyrivka from '../assets/vyrivka.avif'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// import externího CSS

export default function BlockSection() {
    const navigate = useNavigate();

   const goToSection = (id) => {
    navigate('/gallery'); // přejdi na stránku
    setTimeout(() => {     // počkej, až se stránka renderuje
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };
  return (
        <div className='blocks flex' id='blocks'>
            <div className='block block-hover fade-left' onClick={()=>goToSection('interier')}>
                <img src={Interier} alt="" />
                <h3>Interiér</h3>
            </div>
            <div className='right-blocks flex'>
                <div className='big-block block-hover fade-right' onClick={()=>goToSection('exterier')}>
                    <img src={Exterier} alt="" />
                    <h3>Exteriér</h3>
                </div>
                <div className='flex small-blocks'>
                    <div className='block-hover fade-up' onClick={()=>goToSection('bazen')}>
                        <img src={Vyrivka} alt="" />
                        <h3>Výřivka</h3>
                    </div>
                    <div className='block-hover fade-up' onClick={()=>goToSection('dalsi_fotky')}>
                        <img src={Cenik} alt="" />
                        <h3>Ceník</h3>
                        </div>
                </div>
            </div>
        </div>
  );
}