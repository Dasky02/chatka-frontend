import { useState, useEffect } from 'react';
import GuestView from '../components/GuestView.jsx';
import AdminView from '../components/AdminView.jsx';
import LoginModal from '../components/LoginModal.jsx';
import { getStoredAuth, saveAuth } from '../helpers.js';
import Header from '../components/Header.jsx';
import MainSection from '../components/MainSection.jsx';
import BlockSection from '../components/BlockSection.jsx';
import MapSection from '../components/Map.jsx';
import FAQcomponent from '../components/Faq.jsx';
import FAQSection from '../components/FaqSection.jsx';
import GallerySection from '../components/GalleryBlock.jsx';
import Footer from '../components/Footer.jsx';
import { Link } from 'react-router-dom';
import Interier from '../assets/interier.avif';
import Exterier from '../assets/main_pic.avif';
import Vyrivka from '../assets/vyrivka.avif';
import Cenik from '../assets/cenik.avif';


export default function MainApp(){
  const [tab,setTab]=useState('guest');
  const [auth,setAuth]=useState(getStoredAuth());
  const [showLogin,setShowLogin]=useState(false);
  const [msg,setMsg]=useState('');
    const images = [Interier, Exterier, Vyrivka, Cenik, Cenik];
  useEffect(()=>{ saveAuth(auth); },[auth]);


  return (
    <div className='flex page'>
      <Header/>
      <MainSection/>
      <BlockSection/>
      <div className='reservation flex'>
    </div>
    
      {showLogin && <LoginModal setAuth={setAuth} setShowLogin={setShowLogin} setMsg={setMsg}/>}

      {tab==='guest' && <div className='reservation-form flex'><GuestView /></div>}
      {tab==='admin' && <AdminView auth={auth} msg={msg} setMsg={setMsg} />}
        <div className='gallery-section flex'>
        <h2>Galerie</h2>
        <GallerySection images={images}/>
         <Link to="/gallery" className='button'>Více fotek</Link>
        </div>
        <MapSection/>
        <Footer/>
    </div>
  );
}
