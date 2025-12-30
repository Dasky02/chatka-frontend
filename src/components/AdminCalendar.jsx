import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { iso, ymdPragueFromTs, addDaysStr } from '../helpers.js';
import { fetchReservations, confirmReservation, cancelReservation } from '../api/reservations.js';
import csLocale from "@fullcalendar/core/locales/cs";

export default function AdminCalendar() {
  const [adminEvents, setAdminEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [msg, setMsg] = useState('');
  

  async function loadAdminEvents(start, end) {
    try {
      setMsg('');
      const propertyId = 1;
      const data = await fetchReservations(propertyId);

      console.log('Data z backendu:', data); // <-- pro debug

      const evs = data.map(x => {
        const rawStart = x.start ?? x.startTs ?? x.start_ts;
        const rawEnd = x.end ?? x.endTs ?? x.end_ts;
        const startStr = ymdPragueFromTs(rawStart);
        const endStr = addDaysStr(ymdPragueFromTs(rawEnd), 1);

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
      console.error(e);
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

  async function handleConfirmBooking(id) {
    try {
      setMsg('');
      await confirmReservation(id);
      if (rangeStart && rangeEnd) await loadAdminEvents(rangeStart, rangeEnd);
      setSelectedEvent(prev => prev ? { ...prev, status: 'CONFIRMED' } : prev);
    } catch (e) {
      setMsg(`Chyba potvrzení: ${e.message}`);
    }
  }

  async function handleCancelBooking(id) {
    try {
      setMsg('');
      await cancelReservation(id);
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
  }, []);

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={adminEvents}
        height="auto"
        timeZone="Europe/Prague"
        displayEventTime={false}
        datesSet={arg => {
          setRangeStart(arg.start);
          setRangeEnd(arg.end);
          loadAdminEvents(arg.start, arg.end);
        }}
        locale={csLocale}
        eventClick={info => openEventPanel(info.event)}
        eventContent={arg => {
          const title = arg.event.title || 'Rezervace';
          const price = arg.event.extendedProps?.totalPrice;
          const isPending = arg.event.extendedProps?.status === 'PENDING';
          return { html: `<div style="padding:2px 4px;${isPending ? 'font-weight:600;' : ''}">${title}${price ? ` – ${price} Kč` : ''}</div>` };
        }}
      />

      {selectedEvent && (
        <div className='selected-reservation'>
          <div className='flex selected-reservation-header'>
            <h3>{selectedEvent.title}</h3>
            <button onClick={() => setSelectedEvent(null)}>✕</button>
          </div>
          <div className='flex list'>
            <div><strong>Host:</strong> {selectedEvent.guestName || '—'}</div>
            <div><strong>Termín:</strong> {selectedEvent.start} → {selectedEvent.end}</div>
            <div><strong>Zdroj:</strong> {selectedEvent.source}</div>
            <div><strong>Stav:</strong> {selectedEvent.status}</div>
            {selectedEvent.price != null && <div><strong>Cena:</strong> {selectedEvent.price} Kč</div>}
          </div>
          {selectedEvent.status === 'PENDING' && (
            <div className='buttons flex'>
              <button onClick={() => handleConfirmBooking(selectedEvent.id)} className='button'>Potvrdit</button>
              <button onClick={() => handleCancelBooking(selectedEvent.id)} className='second-button'>Zrušit</button>
            </div>
          )}
          {msg && <div style={{ marginTop: 12, color: '#ff9f89' }}>{msg}</div>}
        </div>
      )}
    </>
  );
}
