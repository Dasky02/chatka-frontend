import { useState, useEffect } from 'react';
import TopBar from '../../components/admin/TopBar.jsx';
import AdminSidebar from '../../components/admin/Menu.jsx';
import HeaderMenu from '../../components/admin/HeaderMenu.jsx';
import SeasonForm from '../../components/admin/SeasonPriceForm.jsx';
import SeasonTable from '../../components/admin/SeasonTable.jsx';
import { getCookie } from '../../api/functions.jsx';

export default function SeasonPage() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSeason, setEditingSeason] = useState(null); // vybraná sezona pro edit
  const propertyId = 1;
  const token = getCookie('token');

  const fetchSeasons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pricing/seasons?propertyId=${propertyId}`, {
          headers: { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },

      });
      if (!res.ok) throw new Error('Nepodařilo se načíst sezony');
      const data = await res.json();
      setSeasons(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  // Funkce, která se zavolá po úspěšném přidání / editu
  const handleSeasonSaved = () => {
    setEditingSeason(null);
    fetchSeasons();
  };

  return (
    <div className='flex admin'>
      <div className="admin-layout">
        <AdminSidebar />
        <div className="main-area">
          <TopBar />
          <div className="admin-content">
            <HeaderMenu name={'Sezóna'} />

            {/* Season Form se zobrazuje jen pokud je edit nebo new */}
            {editingSeason && (
              <SeasonForm
                season={editingSeason}
                propertyId={propertyId}
                onSaved={handleSeasonSaved}
                onCancel={() => setEditingSeason(null)}
              />
            )}

            <SeasonTable
              seasons={seasons}
              loading={loading}
              onEdit={(season) => setEditingSeason(season)}
              onDelete={(id) => {
                setSeasons(seasons.filter((s) => s.id !== id));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
