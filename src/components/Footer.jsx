import React from 'react';
import Img from '../assets/chatka.jpg'
import Exterier from '../assets/main_pic.avif'
import Interier from '../assets/interier.avif'
import Cenik from '../assets/cenik.avif'
import Vyrivka from '../assets/vyrivka.avif'
// import externího CSS

export default function Footer() {
  return (
    <footer className='flex'>
        <div className='footer-info flex'>
            <div className='footer-block flex'>
                  <h3>TinyHouse</h3>
            <p>Pronájem TinyHouse – klidný pobyt v přírodě, kousek od města.</p>
            </div>
             <div className="footer-links flex">
                <a href="#rezervace">Rezervace</a>
                <a href="#kontakt">Kontakt</a>
                <a href="#faq">FAQ</a>
            </div>
        </div>
        <p>&copy; 2025 TinyHouse. Všechna práva vyhrazena.</p>
    </footer>
  );
}