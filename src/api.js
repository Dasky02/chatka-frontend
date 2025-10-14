// src/api.js

// BASE URL — může být prázdné (proxy na /api), nebo třeba "http://localhost:8080"
const RAW = (import.meta.env.VITE_API_URL || "").trim();
// odstraň koncové lomítko, ať neskládáme //api
const API_BASE = RAW.replace(/\/+$/, "");

// ----- Admin token helpery -----
const ADMIN_TOKEN_KEY = "adminToken";

// VRAŤ absolutní/relativní URL bez dvojitých lomítek
export function apiUrl(path = "") {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE) return p; // relativně přes proxy (Caddy/Vite)
  return `${API_BASE}${p}`; // absolutně vůči VITE_API_URL
}

export function saveAdminToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

// ----- Request core -----
export async function request(
  path,
  { method = "GET", body, admin = false, headers = {} } = {}
) {
  const url = apiUrl(path);
  const h = new Headers(headers);

  if (body !== undefined && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }

  if (admin) {
    const token = getAdminToken();
    if (token) h.set("X-Admin-Token", token);
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: h,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const err = new Error(`Network error: ${e?.message || e}`);
    err.cause = e;
    throw err;
  }

  // Zkus JSON, ale počítej s 204/empty body
  let data;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  } else {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(
      typeof data === "string" ? data : data?.message || `HTTP ${res.status}`
    );
    err.status = res.status;
    err.payload = data;

    // hezčí hlášky pro auth chyby
    if (res.status === 401 || res.status === 403) {
      err.message = data?.message ||
        "Neautorizováno / zakázáno (zkontroluj admin token).";
    }
    throw err;
  }

  return data;
}

// ----- Pohodlné aliasy -----
export function getJson(path, { admin = false, headers = {} } = {}) {
  return request(path, { method: "GET", admin, headers });
}

export function postJson(path, body, { admin = false, headers = {} } = {}) {
  return request(path, { method: "POST", body, admin, headers });
}

export function putJson(path, body, { admin = false, headers = {} } = {}) {
  return request(path, { method: "PUT", body, admin, headers });
}

export function delJson(path, { admin = false, headers = {} } = {}) {
  return request(path, { method: "DELETE", admin, headers });
}

// ----- Helper na query string (volitelný) -----
export function toQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

// Exponujeme i BASE pro debug (není v konfliktu s apiUrl funkcí)
export const API_BASE_URL = API_BASE;