import { useState, useEffect } from 'react';
import GuestView from '../components/GuestView.jsx';
import AdminView from '../components/AdminView.jsx';
import LoginModal from '../components/LoginModal.jsx';
import { getStoredAuth, saveAuth } from '../helpers.js';
import Header from '../components/Header.jsx';
import HeadSection from '../components/HeadSection.jsx';
import BlockSection from '../components/BlockSection.jsx';
import MapSection from '../components/Map.jsx';
import FAQcomponent from '../components/Faq.jsx';
import FAQSection from '../components/FaqSection.jsx';
import GallerySection from '../components/GalleryBlock.jsx';
import Footer from '../components/Footer.jsx';
import NameBlock from '../components/NameBlock.jsx';
import SwiperLightbox from '../components/Swiper.jsx';
import Interier from '../assets/interier.avif';
import Exterier from '../assets/main_pic.avif';
import Vyrivka from '../assets/vyrivka.avif';
import Cenik from '../assets/cenik.avif';
import Img from '../assets/chatka.jpg';


export default function GalleryPage(){
  const [tab,setTab]=useState('guest');
  const [auth,setAuth]=useState(getStoredAuth());
  const [showLogin,setShowLogin]=useState(false);
  const [msg,setMsg]=useState('');
    const images = [Interier, Exterier, Vyrivka, Cenik];

  useEffect(()=>{ saveAuth(auth); },[auth]);


  return (
    <div className='flex page'>
      <Header/>
      <HeadSection name={'Galerie'}/>
        <div className='gallery-section-page flex'>
        <NameBlock name={'Exteriér'} id={'exterier'}/>
        <GallerySection images={images}/>
         <NameBlock name={'Interiér'} id={'interier'}/>
        <GallerySection images={images}/>
         <NameBlock name={'Výřivka'} id={'bazen'}/>
        <GallerySection images={images}/>
         <NameBlock name={'Další fotky'} id={'dalsi_fotky'}/>
        <GallerySection images={images}/>
        <SwiperLightbox/>
        </div>
        <Footer/>
    </div>
  );
}
