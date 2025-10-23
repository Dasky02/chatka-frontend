import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingStatusPage from './pages/BookingStatusPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx'
import './App.css'; 
import ScrollAnimations from './components/ScrollAnimations.jsx'
import GalleryPage from './pages/GalleryPage.jsx';
import 'swiper/css';
import 'swiper/css/navigation';


export default function App(){
  return (
    <ScrollAnimations>
    <Router>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/gallery" element={<GalleryPage/>} />
        <Route path="/r/:publicUid" element={<BookingStatusPage />} />
      </Routes>
    </Router>
    </ScrollAnimations>
  );
}
