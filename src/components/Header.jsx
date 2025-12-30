import React from 'react';
import { Link } from 'react-router-dom';
// import externího CSS

export default function Header() {
  return (
    <header className="header">
      {/* Nadpis */}
      <h1>TinyHouse</h1>

      {/* Navigace */}
      <nav>
        <ul>
          <li><Link to="/">Domů</Link></li>
          <li><Link to="/#reservation">Rezervace</Link></li>
          <li><Link to="/gallery">Fotky</Link></li>
          <li><Link to="/contact">Kontakt</Link></li>
        </ul>

        {/* Tlačítko + */}
        <button className='button'>Rezervace</button>
      </nav>
    </header>
  );
}
