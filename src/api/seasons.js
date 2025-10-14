const API_BASE = import.meta.env.VITE_API_URL || ""; // prázdné => volá relativní /api

function authHeaders() {
    const token = localStorage.getItem("adminToken") || "";
    return {
        "Content-Type": "application/json",
        "X-Admin-Token": token
    };
}

export async function listSeasons(propertyId) {
    const res = await fetch(`${API_BASE}/api/admin/pricing/seasons?propertyId=${propertyId}`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function createSeason(payload) {
    const res = await fetch(`${API_BASE}/api/admin/pricing/seasons`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function updateSeason(id, payload) {
    const res = await fetch(`${API_BASE}/api/admin/pricing/seasons/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function deleteSeason(id) {
    const res = await fetch(`${API_BASE}/api/admin/pricing/seasons/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
}