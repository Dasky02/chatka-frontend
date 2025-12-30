import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';

export default function TopBar({}) {
const navigate = useNavigate();
const handleLogout = async () => {
  const success = await logout();
  if (success) {
    alert("Byl jste odhlášen");
    //navigate("/login")
  } else {
    alert("Nepodařilo se odhlásit");
  }
};

  return (
    <div className="topbar">
      <div className="topbar-placeholder"></div> {/* levá strana pro vizuální symetrii */}
      <div className="topbar-right">
        <span className="user-email">Libor</span>
        <button className="logout-btn" onClick={()=>handleLogout()}>
          Odhlásit se
        </button>
      </div>
    </div>
  );
}