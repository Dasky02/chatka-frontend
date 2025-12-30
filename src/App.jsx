import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingStatusPage from './pages/BookingStatusPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import './App.css'; 
import ScrollAnimations from './components/ScrollAnimations.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import 'swiper/css';
import 'swiper/css/navigation';
import AdminHomePage from './pages/Admin/HomePage.jsx';
import LoginPage from './pages/Admin/LoginPage.jsx';
import ReservationsPage from './pages/Admin/ReservationsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import CategoryPage from './pages/Admin/CategoryPage.jsx';
import ProtectedRoute from './pages/ProtectedRoute.jsx';
import UploadImages from './pages/Admin/UploadImages.jsx';
import SeasonPage from './pages/Admin/SeasonPage.jsx';

export default function App() {
  return (
    <ScrollAnimations>
      <Router>
        <Routes>
          {/* veřejné stránky */}
          <Route path="/" element={<CalendarPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/r/:publicUid" element={<BookingStatusPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* chráněné admin stránky */}
          <Route 
            path="/admin/reservations" 
            element={
              <ProtectedRoute>
                <ReservationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminHomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/category" 
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            } 
          />
          <Route
          path="/admin/category/:id/upload"
          element={
            <ProtectedRoute>
              <UploadImages />
            </ProtectedRoute>
          }
          />
          <Route 
            path="/admin/season" 
            element={
              <ProtectedRoute>
                <SeasonPage/>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ScrollAnimations>
  );
}