import React, { useState } from "react";

export default function CategoryForm({ onCategoryCreated, onClicked}) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName) return alert("Zadej název kategorie");

    const token = getCookie("token");
    if (!token) return alert("Uživatel není přihlášen");

    setLoading(true);
    try {
      const res = await fetch("/api/photos/categories", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: categoryName, description: categoryDescription }),
      });

      if (!res.ok) throw new Error("Chyba při vytváření kategorie");
      const data = await res.json();

      // 🔹 po úspěchu voláme callback, aby rodič mohl aktualizovat seznam
      if (onCategoryCreated) onCategoryCreated(data);

      alert("Kategorie vytvořena! Teď ji můžeš upravit nebo přidat obrázky jinde.");
      setCategoryName("");
      setCategoryDescription("");
    } catch (err) {
      console.error(err);
      alert("Nepodařilo se vytvořit kategorii");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-card">
      <div className="category-card-menu flex">
        <h2>Vytvořit kategorii</h2>
        <button onClick={()=>onClicked(false)}>&times;</button>
      </div>

      <form onSubmit={handleCreateCategory} className="form">
        <div className="form-group">
          <label htmlFor="categoryName">Název kategorie</label>
          <input
            id="categoryName"
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Např. Deky"
            required
          />
          <textarea
            id="categoryDescription"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            placeholder="Zadej popis"
          ></textarea>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Ukládám..." : "Vytvořit kategorii"}
        </button>
      </form>
    </div>
  );
}
