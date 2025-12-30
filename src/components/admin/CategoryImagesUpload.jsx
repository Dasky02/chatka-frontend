import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { getCookie } from "../../api/functions";

export default function CategoryImagesUpload() {
  const { id } = useParams(); // ID kategorie z URL
  const [images, setImages] = useState([]);
  const [titles, setTitles] = useState([]); // pole pro title
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = getCookie("token");
  if (!token) return alert("Uživatel není přihlášen");

  // Výběr obrázků a preview
  const handleImageChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    setTitles(files.map((file) => file.name)); // defaultní title = název souboru
  };

  // Odstranění obrázku
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    setTitles(titles.filter((_, i) => i !== index));
  };

  // Změna title pro konkrétní obrázek
  const handleTitleChange = (index, value) => {
    const newTitles = [...titles];
    newTitles[index] = value;
    setTitles(newTitles);
  };

const handleUploadImages = async () => {
  if (!images.length) return alert("Vyber obrázky k nahrání");

  setLoading(true);

  try {
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const title = titles[i] || img.name;

      const formData = new FormData();
      formData.append("file", img);       // obrázek
      formData.append("title", title);    // volitelný title

      // categoryId jde do query param
      const res = await fetch(`/api/photos/upload?categoryId=${id}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`, // jen token
        },
      });

      if (!res.ok) throw new Error(`Chyba při nahrávání obrázku ${title}`);
    }

    alert("Obrázky úspěšně nahrány!");
    setImages([]);
    setPreviewUrls([]);
    setTitles([]);
  } catch (err) {
    console.error(err);
    alert("Nepodařilo se nahrát obrázky");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="image-upload-container">
      <h2>Přidat obrázky pro kategorii: {id}</h2>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
      />

      {previewUrls.length > 0 && (
        <div className="image-preview-grid">
          {previewUrls.map((url, i) => (
            <div key={i} className="image-preview-item">
              <img src={url} alt={`preview ${i}`} />
              <input
                type="text"
                value={titles[i]}
                onChange={(e) => handleTitleChange(i, e.target.value)}
                placeholder="Název obrázku"
              />
              <button type="button" onClick={() => handleRemoveImage(i)}>
                ❌
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleUploadImages} disabled={loading}>
        {loading ? "Nahrávám..." : "Nahrát obrázky"}
      </button>
    </div>
  );
}
