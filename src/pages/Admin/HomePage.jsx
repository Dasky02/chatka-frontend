import { useState, useEffect } from 'react';

import { getStoredAuth, saveAuth } from '../../helpers.js';
import { Link } from 'react-router-dom';
import TopBar from '../../components/admin/TopBar.jsx';
import AdminSidebar from '../../components/admin/Menu.jsx';
import Footer from '../../components/Footer.jsx';
import AdminCalendar from '../../components/AdminCalendar.jsx';


export default function AdminHomePage(){

 


  return (
    <div className='flex admin'>
    <div className="admin-layout">
  <AdminSidebar />     {/* levý panel */}
  <div className="main-area">
    <TopBar />         {/* horní menu */}
    <div className="admin-content">
      <AdminCalendar/>
    </div>
  </div>
</div>
    </div>
  );
}
