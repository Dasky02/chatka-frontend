// Funkce pro získání všech kategorií
export async function fetchCategories() {
  try {
    // načteme token z cookie
    const token = getCookie("token");
    console.log("Token:", token);
    if (!token) throw new Error("Uživatel není přihlášen");

    const res = await fetch("/api/photos/categories", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Chyba při načítání kategorií: ${res.status}`);
    }

    const data = await res.json();
    return data; // vrací pole kategorií
  } catch (err) {
    console.error(err);
    return [];
  }
}


export async function fetchCategoryById(id) {
  try {
    const token = getCookie("token");
    if (!token) throw new Error("Uživatel není přihlášen");

    const res = await fetch(`/api/photos?categoryId=${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Chyba při načítání kategorie ${id}: ${res.status}`);
    }

    const data = await res.json();

    // prostě vrátíme celé pole obrázků
    return data;
  } catch (err) {
    console.error("fetchCategoryById error:", err);
    return [];
  }
}

// Pomocná funkce pro získání tokenu z cookie
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}