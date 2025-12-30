// src/api/booking.js
import { apiUrl } from "../api";


// ---- Public (guest) ----
export async function getPublicBooking(publicUid, token) {
    const res = await fetch(apiUrl(`/api/public/bookings/${publicUid}${toQuery({ t: token })}`));
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// zvolení platební metody ("CARD" | "BANK_TRANSFER")
export async function choosePaymentMethod(publicUid, method) {
    const res = await fetch(apiUrl(`/api/public/bookings/${publicUid}/payment-method`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
export const setPaymentMethod = choosePaymentMethod; // alias, pokud se to někde ještě používá

// mock brána pro platbu kartou
export async function mockCreatePayment(publicUid) {
    const res = await fetch(apiUrl(`/api/payments/mock/create?publicUid=${publicUid}`), {
        method: "POST",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // { redirectUrl?: string }
}

// ---- Admin ----
export async function adminSetTotal(id, totalCzk, token) {
    const res = await fetch(apiUrl(`/api/admin/bookings/${id}/set-total`), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Admin-Token": token,
        },
        body: JSON.stringify({ totalCzk }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function adminMarkPaid(id, paidAmountCzk, token) {
    const res = await fetch(apiUrl(`/api/admin/bookings/${id}/mark-paid`), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Admin-Token": token,
        },
        body: JSON.stringify({ paidAmountCzk }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}


export async function adminMarkUnpaid(id, token) {
    const res = await fetch(apiUrl(`/api/admin/bookings/${id}/mark-unpaid`), {
        method: "POST",
        headers: { "X-Admin-Token": token },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}