import { useState, useEffect } from 'react';
import TopBar from '../../components/admin/TopBar.jsx';
import AdminSidebar from '../../components/admin/Menu.jsx';
import CategoryForm from '../../components/admin/CategoryForm.jsx';
import CategoryItem from '../../components/admin/CategoryItem.jsx';
import { fetchCategories } from '../../api/categories.js';
import HeaderMenu from '../../components/admin/HeaderMenu.jsx';


export default function CategoryPage(){

 const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchCategories(); // 🔹 volání externí funkce
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Načítám kategorie...</p>;

 const handleCategoryCreated = (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
  };

   const handleOnClick = (data) => {
    setVisible(data);
  };


  return (
    <div className='flex admin'>
    <div className="admin-layout">
  <AdminSidebar />     {/* levý panel */}
  <div className="main-area">
    <TopBar />         {/* horní menu */}
    <div className="admin-content">
      <HeaderMenu name={'KATEGORIE'} onClick={handleOnClick}/>
      {visible && <CategoryForm onCategoryCreated={handleCategoryCreated} onClicked={handleOnClick}/>}
     <div className='categories flex'>
  {categories.map((category) => {
    return (
      <CategoryItem
        key={category.id} // nezapomeň na key!
        name={category.name}
        description={category.description}
        id={category.id}
      />
    );
  })}
</div>
      <div>

      </div>
    </div>
  </div>
</div>
    </div>
  );
}
