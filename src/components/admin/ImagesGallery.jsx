import React, { useEffect, useState } from "react";
import { getCookie } from "../../api/functions";

const ImageGallery = ({id}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = getCookie("token");

  const fetchImages = async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/photos/categories/${id}/photos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Nepodařilo se načíst obrázky");
    const data = await res.json();
    console.log("Fetched category:", data.photos);
    setImages(Array.isArray(data.photos) ? data.photos : []);
  } catch (err) {
    console.error(err);
    alert("Chyba při načítání obrázků");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  if (id) fetchImages();
}, [id]);

  const handleDelete = async (imageId) => {
    if (!window.confirm("Opravdu chcete obrázek smazat?")) return;
    try {
      const res = await fetch(`/api/photos/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Nepodařilo se smazat obrázek");
      setImages(images.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error(err);
      alert("Chyba při mazání obrázku");
    }
  };

  return (
    <div className="gallery-container">
  <h2>Galerie obrázků</h2>
  {loading && <p>Načítám obrázky...</p>}
  <div className="gallery-grid">
    {images.map((img) => (
  <div key={img.id} className="gallery-item-admin">
    <img  src={`http://localhost:8080${img.filePath}`} alt={img.title} className="gallery-image" />
    <p className="gallery-title">{img.title}</p>
    <button onClick={() => handleDelete(img.id)} className="delete-button">
      Smazat
    </button>
  </div>
))}
    {!images.length && !loading && <p>Žádné obrázky k zobrazení</p>}
  </div>
</div>
  );
};

export default ImageGallery;
