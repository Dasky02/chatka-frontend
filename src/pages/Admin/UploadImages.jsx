import { useState, useEffect } from 'react';
import { getStoredAuth, saveAuth } from '../../helpers.js';
import { Link } from 'react-router-dom';
import TopBar from '../../components/admin/TopBar.jsx';
import AdminSidebar from '../../components/admin/Menu.jsx';
import Footer from '../../components/Footer.jsx';
import AdminCalendar from '../../components/AdminCalendar.jsx';
import ReservationCalendar from '../../components/admin/ReservationCalendary.jsx';
import CategoryForm from '../../components/admin/CategoryForm.jsx';
import CategoryItem from '../../components/admin/CategoryItem.jsx';
import { fetchCategoryById } from '../../api/categories.js';
import HeaderMenu from '../../components/admin/HeaderMenu.jsx';
import { useParams } from "react-router-dom";
import CategoryImagesUpload from '../../components/admin/CategoryImagesUpload.jsx';
import ImageGallery from '../../components/admin/ImagesGallery.jsx';


export default function UploadImages(){
 const { id } = useParams();
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
  if (!id) return;

  let isCancelled = false; // zabráníme updatu po unmountu

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchCategoryById(id);
      if (!isCancelled) {
        setCategory(data || []);
      }
    } catch (err) {
      console.error(err);
      if (!isCancelled) setCategory([]);
    } finally {
      if (!isCancelled) setLoading(false);
    }
  };

  fetchData();

  return () => {
    isCancelled = true; // cleanup
  };
}, [id]); // 🔹 přidáme id jako závislost

  if (loading) return <p>Načítám kategorie...</p>;


  return (
    <div className='flex admin'>
    <div className="admin-layout">
  <AdminSidebar />     {/* levý panel */}
  <div className="main-area">
    <TopBar />         {/* horní menu */}
    <div className="admin-content">
    <HeaderMenu name={category.name}/>
    <CategoryImagesUpload/>
    <ImageGallery id={id}/>
    </div>
    </div>
  </div>
</div>
  );
}
