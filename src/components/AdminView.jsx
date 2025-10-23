import { useState, useEffect } from 'react';
import AdminCalendar from './AdminCalendar.jsx';
import AdminSeasons from './AdminSeasons.jsx';

export default function AdminView({auth,msg,setMsg}){
  const [adminTab,setAdminTab]=useState('calendar');
  return (
    <>
      <div style={{marginBottom:12, display:'flex', gap:8}}>
        <button onClick={()=>setAdminTab('calendar')} disabled={adminTab==='calendar'}>Kalendář</button>
        <button onClick={()=>setAdminTab('seasons')} disabled={adminTab==='seasons'}>Ceník / Sezóny</button>
      </div>
      {adminTab==='calendar' && <AdminCalendar auth={auth} msg={msg} setMsg={setMsg}/>}
      {adminTab==='seasons' && <AdminSeasons />}
    </>
  );
}
