import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaImages,
  FaQuestionCircle,
  FaEnvelope,
  FaRegCalendarCheck
} from "react-icons/fa";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(location.pathname); // podle aktuální URL

  const menuItems = [
    { key: "/admin", label: "Domů", icon: <FaHome /> },
    { key: "/admin/reservations", label: "Kalendář", icon: <FaCalendarAlt /> },
    { key: "/admin/category", label: "Obrázky", icon: <FaImages /> },
    { key: "/admin/faq", label: "FAQ", icon: <FaQuestionCircle /> },
    { key: "/admin/emails", label: "Maily", icon: <FaEnvelope /> },
    { key: "/admin/season", label: "Sezóny", icon: <FaRegCalendarCheck /> },
  ];

  const handleClick = (path) => {
    setActive(path);
    navigate(path);
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-logo">
        <h2>Admin</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`sidebar-item ${active === item.key ? "active" : ""}`}
            onClick={() => handleClick(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}