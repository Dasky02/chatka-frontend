import { getCookie } from "./functions";

export async function fetchReservations(propertyId) {
  try {
    const token = getCookie('token');
    if (!token) throw new Error('Uživatel není přihlášen');

    const res = await fetch(`/api/bookings/all?propertyId=${propertyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`Chyba při načítání rezervací: ${res.status}`);

    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function confirmReservation(id) {
  const token = getCookie('token');
  if (!token) throw new Error('Uživatel není přihlášen');

  const res = await fetch(`/api/bookings/${id}/confirm`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Chyba při potvrzení rezervace: ${res.status}`);
  return true;
}

export async function cancelReservation(id) {
  const token = getCookie('token');
  if (!token) throw new Error('Uživatel není přihlášen');

  const res = await fetch(`/api/bookings/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Chyba při zrušení rezervace: ${res.status}`);
  return true;
}