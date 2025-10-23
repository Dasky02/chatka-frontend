import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { iso, ymdPragueFromTs, addDaysStr } from "../helpers.js"// předpokládáme, že helper funkce jsou v helpers.js

export default function AdminCalendar({ auth, msg, setMsg }) {
  const [adminEvents, setAdminEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  async function loadAdminEvents(start, end) {
    try {
      setMsg('');
      const from = iso(start);
      const to = iso(new Date(end.getTime() - 24 * 60 * 60 * 1000)); // FullCalendar end exclusive
      const res = await fetch(`/api/bookings?propertyId=1&from=${from}&to=${to}`, {
        headers: auth ? { Authorization: auth } : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const evs = data.map((x) => {
        const rawStart = x.start ?? x.startTs ?? x.start_ts;
        const rawEnd = x.end ?? x.endTs ?? x.end_ts;
        const startStr = ymdPragueFromTs(rawStart);
        const endStr = addDaysStr(ymdPragueFromTs(rawEnd), 1); // end exclusive

        let color = '#3788d8';
        if (x.source === 'BLOCK') color = '#666';
        if (x.source === 'AIRBNB') color = '#ff9f89';
        if (x.status === 'PENDING') color = '#f59e0b';

        return {
          id: String(x.id),
          title: x.title || x.guestName || 'Rezervace',
          start: startStr,
          end: endStr,
          allDay: true,
          color,
          extendedProps: {
            totalPrice: x.totalPrice,
            status: x.status,
            source: x.source,
            guestName: x.guestName,
          },
        };
      });

      setAdminEvents(evs);
    } catch (e) {
      setMsg(`Chyba načítání kalendáře: ${e.message}`);
    }
  }

  function openEventPanel(fcEvent) {
    const s = fcEvent.startStr?.slice(0, 10);
    const en = addDaysStr(fcEvent.endStr, -1);
    setSelectedEvent({
      id: fcEvent.id,
      title: fcEvent.title || 'Rezervace',
      start: s,
      end: en,
      price: fcEvent.extendedProps?.totalPrice,
      source: fcEvent.extendedProps?.source || 'DIRECT',
      status: fcEvent.extendedProps?.status || 'CONFIRMED',
      guestName: fcEvent.extendedProps?.guestName || '',
    });
  }

  async function confirmBooking(id) {
    try {
      setMsg('');
      const res = await fetch(`/api/bookings/${id}/confirm`, {
        method: 'PATCH',
        headers: auth ? { Authorization: auth } : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (rangeStart && rangeEnd) await loadAdminEvents(rangeStart, rangeEnd);
      setSelectedEvent(prev => prev ? { ...prev, status: 'CONFIRMED' } : prev);
    } catch (e) {
      setMsg(`Chyba potvrzení: ${e.message}`);
    }
  }

  async function cancelBooking(id) {
    try {
      setMsg('');
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: auth ? { Authorization: auth } : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (rangeStart && rangeEnd) await loadAdminEvents(rangeStart, rangeEnd);
      setSelectedEvent(null);
    } catch (e) {
      setMsg(`Zrušení se nepovedlo: ${e.message}`);
    }
  }

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    setRangeStart(start);
    setRangeEnd(end);
    loadAdminEvents(start, end);
  }, [auth]);

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={adminEvents}
        height="auto"
        timeZone="Europe/Prague"
        displayEventTime={false}
        datesSet={(arg) => {
          setRangeStart(arg.start);
          setRangeEnd(arg.end);
          loadAdminEvents(arg.start, arg.end);
        }}
        eventClick={(info) => openEventPanel(info.event)}
        eventContent={(arg) => {
          const title = arg.event.title || 'Rezervace';
          const price = arg.event.extendedProps?.totalPrice;
          const isPending = arg.event.extendedProps?.status === 'PENDING';
          return { html: `<div style="padding:2px 4px;${isPending ? 'font-weight:600;' : ''}">${title}${price ? ` – ${price} Kč` : ''}</div>` };
        }}
      />
      {selectedEvent && (
        <div style={{
          position: 'fixed', right: 0, top: 0, height: '100vh', width: 360,
          background: 'rgba(20,20,20,0.98)', color: '#fff', boxShadow: '-6px 0 20px rgba(0,0,0,.4)',
          padding: 16, zIndex: 50
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{selectedEvent.title}</h3>
            <button onClick={() => setSelectedEvent(null)}>✕</button>
          </div>
          <div style={{ marginTop: 12, fontSize: 14, color: '#ddd' }}>
            <div><strong>Host:</strong> {selectedEvent.guestName || '—'}</div>
            <div><strong>Termín:</strong> {selectedEvent.start} → {selectedEvent.end}</div>
            <div><strong>Zdroj:</strong> {selectedEvent.source}</div>
            <div><strong>Stav:</strong> {selectedEvent.status}</div>
            {selectedEvent.price != null && <div><strong>Cena:</strong> {selectedEvent.price} Kč</div>}
          </div>
          {selectedEvent.status === 'PENDING' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => confirmBooking(selectedEvent.id)} style={{ padding: '10px 12px', background: '#22c55e', color: '#000' }}>Potvrdit</button>
              <button onClick={() => cancelBooking(selectedEvent.id)} style={{ padding: '10px 12px', background: '#ef4444', color: '#fff' }}>Zrušit</button>
            </div>
          )}
          {msg && <div style={{ marginTop: 12, color: '#ff9f89' }}>{msg}</div>}
        </div>
      )}
    </>
  );
}
