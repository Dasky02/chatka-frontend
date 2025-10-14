import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import { postJson } from './api';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import SeasonsPage from './components/admin/SeasonsPage.jsx';

import BookingStatusPage from './pages/BookingStatusPage.jsx';

//TODO
// CSS pro FullCalendar
// import '@fullcalendar/common/main.css';
// import '@fullcalendar/daygrid/main.css';

const AUTH_KEY = 'authBasic';
const getStoredAuth = () => {
  try { return localStorage.getItem(AUTH_KEY) || ''; } catch { return ''; }
};
const saveAuth = (val) => {
  try { if (val) localStorage.setItem(AUTH_KEY, val); else localStorage.removeItem(AUTH_KEY); } catch {}
};


const iso = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const ymdPragueFromTs = (ts) => {
  if (!ts) return '';
  // If it's already a YYYY-MM-DD string, use as-is (avoids TZ parsing issues)
  if (/^\d{4}-\d{2}-\d{2}$/.test(ts)) return ts;
  const d = new Date(ts);
  // Resolve the calendar day for Europe/Prague regardless of the user's browser TZ
  const fmt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(d); // -> YYYY-MM-DD
};

function addDaysStr(yyyyMmDd, days) {
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  d.setDate(d.getDate() + days);
  return iso(d);
}

function eachDayInclusive(startYmd, endYmdExclusive) {
  const out = [];
  let cur = new Date(`${startYmd}T00:00:00`);
  const end = new Date(`${endYmdExclusive}T00:00:00`);
  while (cur < end) {
    out.push(iso(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function parseICS(text) {
  // Very basic ICS parser for VEVENTs with DTSTART, DTEND, SUMMARY
  const events = [];
  const vevents = text.split('BEGIN:VEVENT').slice(1);
  vevents.forEach(vevent => {
    const dtstart = vevent.match(/DTSTART(?:;[^:]*)?:(\d{8}T?\d{0,6}Z?)/);
    const dtend = vevent.match(/DTEND(?:;[^:]*)?:(\d{8}T?\d{0,6}Z?)/);
    const summary = vevent.match(/SUMMARY:(.*)/);
    if (dtstart && dtend && summary) {
      // Parse dates
      let start = dtstart[1];
      let end = dtend[1];
      // Format YYYYMMDD[T]HHMMSS[Z] to YYYY-MM-DD or ISO string
      const parseDate = d => {
        if (d.length === 8) {
          // date only
          return d.slice(0,4)+'-'+d.slice(4,6)+'-'+d.slice(6,8);
        } else {
          // datetime
          const y = d.slice(0,4), m = d.slice(4,6), day = d.slice(6,8);
          const h = d.slice(9,11), min = d.slice(11,13), s = d.slice(13,15);
          return new Date(Date.UTC(y,m-1,day,h,min,s)).toISOString();
        }
      };
      events.push({
        title: summary[1],
        start: parseDate(start),
        end: parseDate(end),
        allDay: start.length === 8
      });
    }
  });
  return events;
}

// --- Inserted helper functions ---
function addDays(date, days) {
  const base = new Date(date);
  const d0 = new Date(base.getFullYear(), base.getMonth(), base.getDate()); // midnight
  d0.setDate(d0.getDate() + days);
  return d0;
}

function toMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function firstDisabledAfter(startDate, disabledSet, maxDays = 400) {
  // normalize start to midnight local
  const startMid = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  for (let i = 1; i <= maxDays; i++) {
    const d = addDays(startMid, i); // already midnight
    if (disabledSet.has(iso(d))) return d;
  }
  return null;
}

function isStartAllowed(day, bookedNights) {
  // start je povolený, pokud noc day→day+1 není obsazená
  return !bookedNights.has(iso(day));
}

function canEndOn(endDay, startDay, bookedNights) {
  if (!startDay) return false;
  // end musí být po startu
  if (endDay <= startDay) return false;
  // všechny noci [start, end) musí být volné
  const cur = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
  while (cur < endDay) {
    if (bookedNights.has(iso(cur))) return false;
    cur.setDate(cur.getDate() + 1);
  }
  return true;
}

function MainApp() {
  const [tab, setTab] = useState('guest');
  const [adminTab, setAdminTab] = useState('calendar'); // 'calendar' | 'seasons'

  const [auth, setAuth] = useState(getStoredAuth());
  const [showLogin, setShowLogin] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Guest form states
  const [range, setRange] = useState([{ startDate: new Date(), endDate: new Date(Date.now()+86400000), key: 'selection' }]);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  // Guest disabled days (occupied nights)
  const [disabledDaysSet, setDisabledDaysSet] = useState(new Set());
  const [focusRange, setFocusRange] = useState([0, 0]); // [rangeIndex, 0=start | 1=end] – start focused by default

  // Admin calendar events
  const [adminEvents, setAdminEvents] = useState([]);

  // Admin detail panel state
  const [selectedEvent, setSelectedEvent] = useState(null); // { id, title, start, end, ext }
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  useEffect(() => { saveAuth(auth); }, [auth]);

  useEffect(() => {
    if (tab !== 'guest') return;

    (async () => {
      try {
        setMsg('');
        // Load a wide range (today ... +12 months)
        const today = new Date();
        const from = iso(today);
        const plus12m = new Date(today.getFullYear(), today.getMonth() + 12, 1);
        const to = iso(plus12m);
        const url = `/api/bookings?propertyId=1&from=${from}&to=${to}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Build a set of occupied calendar days (local Prague) for each booking: [start, end) => start..end-1
        const days = [];
        for (const x of data) {
          const rawStart = x.start ?? x.startTs ?? x.start_ts;
          const rawEnd   = x.end   ?? x.endTs   ?? x.end_ts;
          const startStr = ymdPragueFromTs(rawStart);
          const endStr   = ymdPragueFromTs(rawEnd); // end is exclusive day
          days.push(...eachDayInclusive(startStr, endStr));
        }
        setDisabledDaysSet(new Set(days));
      } catch (e) {
        setMsg(`Chyba načítání obsazenosti: ${e.message}`);
      }
    })();
  }, [tab]);

  async function handleQuote() {
    setMsg(''); setQuote(null);
    try {
      const data = await postJson('/api/bookings/quote', {
        propertyId: 1, start: iso(range[0].startDate), end: iso(range[0].endDate), guests: Number(guests||1)
      });
      setQuote(data);
    } catch (e) {
      setMsg(`Chyba kalkulace: ${e.message}`);
    }
  }

  async function handleBookAndPay() {
    setMsg(''); setBusy(true);
    try {
      const booking = await postJson('/api/bookings', {
        propertyId: 1,
        start: iso(range[0].startDate),
        end: iso(range[0].endDate),
        guests: Number(guests||1),
        guestName: name || 'Host',
        guestEmail: email || 'host@example.com'
      });

      // Prefer redirect to info page – user pays later from there
      const publicUid = booking.publicUid || booking.public_uid;
      if (publicUid) {
        window.location.href = `/r/${publicUid}`;
      } else if (booking.id) {
        // Fallback: ask backend for the public URL (if create response didn't include it)
        const r = await fetch(`/api/payments/booking-url?bookingId=${booking.id}`);
        if (!r.ok) throw new Error(await r.text() || `HTTP ${r.status}`);
        const url = await r.text();
        // backend returns something like "/r/<uid>"
        window.location.href = url.startsWith('/r/') ? url : `/r/${url}`;
      } else {
        throw new Error('Missing booking identifier');
      }
    } catch (e) {
      setMsg(e.status === 409 ? 'Termín je již obsazen.' : `Chyba rezervace: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function loadAdminEvents(rangeStart, rangeEnd) {
    try {
      setMsg('');
      const from = iso(rangeStart);
      const to = iso(new Date(rangeEnd.getTime() - 24*60*60*1000)); // inclusive upper bound for API
      const url = `/api/bookings?propertyId=1&from=${from}&to=${to}`;
      const res = await fetch(url, {
        headers: auth ? { 'Authorization': auth } : undefined
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // map API -> FullCalendar events (all-day, end exclusive)
      const evs = data.map((x) => {
        // Back-end může posílat start/end jako YYYY-MM-DD (all‑day) nebo UTC timestampy startTs/endTs (půlnoci v Praze v UTC).
        const rawStart = x.start ?? x.startTs ?? x.start_ts;
        const rawEnd   = x.end   ?? x.endTs   ?? x.end_ts;

        const startStr = ymdPragueFromTs(rawStart);
        // posuň end o +1 den, protože FullCalendar bere end EXCLUSIVE
        const endStr   = addDaysStr(ymdPragueFromTs(rawEnd), 1);
        let color = '#3788d8'; // default: confirmed reservation
        if (x.source === 'BLOCK') color = '#666';
        if (x.source === 'AIRBNB') color = '#ff9f89';
        if (x.status === 'PENDING') color = '#f59e0b';


        return {
          id: String(x.id),
          title: x.title || x.guestName || 'Rezervace',
          start: startStr,      // pass plain date strings => no TZ shift
          end: endStr,          // FullCalendar expects end EXCLUSIVE (checkout day)
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
    // compute inclusive end for display
    const s = fcEvent.startStr?.slice(0,10);
    const en = addDaysStr(fcEvent.endStr, -1);
    setSelectedEvent({
      id: fcEvent.id,
      title: fcEvent.title || 'Rezervace',
      start: s,
      end: en,
      price: fcEvent.extendedProps?.totalPrice,
      source: fcEvent.extendedProps?.source || 'DIRECT',
      status: fcEvent.extendedProps?.status || 'CONFIRMED',
      guestName: fcEvent.extendedProps?.guestName || ''
    });
  }

  async function confirmBooking(id) {
    try {
      setMsg('');
      const res = await fetch(`/api/bookings/${id}/confirm`, {
        method: 'PATCH',
        headers: auth ? { 'Authorization': auth } : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // refresh current calendar range
      if (rangeStart && rangeEnd) await loadAdminEvents(rangeStart, rangeEnd);
      // update panel
      setSelectedEvent(prev => prev ? { ...prev, status: 'CONFIRMED' } : prev);
    } catch (e) {
      setMsg(`Chyba potvrzení: ${e.message}`);
    }
  }

  async function cancelBooking(id) {
    try {
      setMsg('');
      // optional endpoint – pokud není k dispozici, zobrazí se smysluplná chyba
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: auth ? { 'Authorization': auth } : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (rangeStart && rangeEnd) await loadAdminEvents(rangeStart, rangeEnd);
      setSelectedEvent(null);
    } catch (e) {
      setMsg(`Zrušení se nepovedlo: ${e.message}`);
    }
  }

  useEffect(() => {
    if (tab === 'admin') {
      if (!auth) {
        setMsg('Pro vstup do administrace se prosím přihlas.');
        setTab('guest');
        setShowLogin(true);
        return;
      }
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      setRangeStart(start);
      setRangeEnd(end);
      loadAdminEvents(start, end);
    }
  }, [tab]);

  return (
    <div style={{ maxWidth: 920, margin: '30px auto', fontFamily: 'system-ui' }}>
      <h1>TinyHouse – rezervace</h1>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => setTab('guest')} disabled={tab === 'guest'} style={{ marginRight: 10, padding: '8px 16px' }}>Host</button>
          {auth && (
            <button onClick={() => setTab('admin')} disabled={tab === 'admin'} style={{ padding: '8px 16px' }}>Admin</button>
          )}
        </div>
        <div>
          {!auth ? (
            <button onClick={() => setShowLogin(true)} style={{ padding: '8px 14px' }}>Přihlásit</button>
          ) : (
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <span style={{ opacity: .8 }}>Přihlášen (admin)</span>
              <button
                onClick={() => { setAuth(''); setTab('guest'); setMsg(''); }}
                style={{ padding: '8px 14px' }}
              >Odhlásit</button>
            </div>
          )}
        </div>
      </div>

      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', color: '#000', padding: 20, borderRadius: 10, width: 320, boxShadow: '0 10px 30px rgba(0,0,0,.3)' }}>
            <h3 style={{ marginTop: 0 }}>Přihlášení</h3>
            <label>Uživatel</label>
            <input
              type="text"
              value={loginUser}
              onChange={e => setLoginUser(e.target.value)}
              style={{ display: 'block', padding: 8, margin: '6px 0 12px', width: '100%' }}
            />
            <label>Heslo</label>
            <input
              type="password"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              style={{ display: 'block', padding: 8, margin: '6px 0 12px', width: '100%' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setShowLogin(false)} style={{ padding: '8px 12px' }}>Zpět</button>
              <button
                onClick={() => {
                  const b = 'Basic ' + btoa(`${loginUser}:${loginPass}`);
                  setAuth(b);
                  setShowLogin(false);
                  setLoginUser('');
                  setLoginPass('');
                  setMsg('');
                }}
                style={{ padding: '8px 12px' }}
              >Přihlásit</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'guest' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <DateRange
              ranges={range}
              onRangeFocusChange={(fr) => setFocusRange(fr)} // fr = [rangeIndex, 0=start | 1=end]
              onChange={(i) => {
                let s = toMidnight(i.selection.startDate);
                let e = i.selection.endDate ? toMidnight(i.selection.endDate) : null;

                // Pokud end chybí nebo je ≤ start, nastav právě 1 noc
                if (!e || e <= s) e = addDays(s, 1);

                // Pokud je vybraný start na obsazené noci, posuň ho dopředu
                while (disabledDaysSet.has(iso(s))) {
                  s = addDays(s, 1);
                  if (e <= s) e = addDays(s, 1);
                }

                // Ořízni end tak, aby nepřekročil první blokovaný den po startu
                const cut = firstDisabledAfter(s, disabledDaysSet);
                if (cut && e > cut) e = cut;

                // Bezpečnost – nikdy 0 nocí
                if (e <= s) e = addDays(s, 1);

                setRange([{ ...i.selection, startDate: s, endDate: e, key: 'selection' }]);
              }}
              minDate={new Date()}
              moveRangeOnFirstSelection={false}
              disabledDay={
                (date) => {
                  const dMid = toMidnight(date);
                  const dStr = iso(dMid);
                  const todayStr = iso(toMidnight(new Date()));
                  if (dStr < todayStr) return true; // minulost zakázat

                  // Který konec vybíráme? 0 = start, 1 = end (react-date-range focus tuple)
                  const pickingStart = (focusRange?.[1] ?? 0) === 0;

                  if (pickingStart) {
                    // Start je zakázaný pouze pokud je noc d→d+1 obsazená
                    return !isStartAllowed(dMid, disabledDaysSet);
                  }

                  // Vybíráme END
                  const s0 = range[0]?.startDate ? toMidnight(range[0].startDate) : null;
                  if (!s0 || dMid <= s0) return true; // end musí být po startu

                  // První blokovaný den po startu
                  const cut = firstDisabledAfter(s0, disabledDaysSet);
                  if (cut) {
                    const cutTime = cut.getTime();
                    const dTime = dMid.getTime();
                    if (dTime === cutTime) {
                      // checkout den – povolit jako END (Airbnb chování)
                      return false;
                    }
                    if (dTime > cutTime) return true; // za blokovaným dnem zakázat
                  }

                  // Jinak povol, pouze pokud všechny noci [start, end) jsou volné
                  return !canEndOn(dMid, s0, disabledDaysSet);
                }
              }
            />
          </div>
          <div>
            <label>Počet hostů</label>
            <input
              type="number"
              min="1"
              value={guests}
              onChange={e => setGuests(e.target.value)}
              style={{ display: 'block', padding: 8, margin: '6px 0 12px', width: 200 }}
            />
            <label>Jméno</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jan Novák"
              style={{ display: 'block', padding: 8, margin: '6px 0 12px', width: 300 }}
            />
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jan@example.com"
              style={{ display: 'block', padding: 8, margin: '6px 0 12px', width: 300 }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={handleQuote} disabled={busy} style={{ padding: '10px 16px' }}>Spočítat cenu</button>
              <button onClick={handleBookAndPay} disabled={busy || !quote} style={{ padding: '10px 16px' }}>Rezervovat</button>
            </div>

            {quote && (
              <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
                <div>Nocí: <strong>{quote.nights}</strong></div>
                <div>Základ: {quote.base} Kč</div>
                <div>Sleva 7+ nocí: {quote.longStayAdj} Kč</div>
                <div>Úklid: {quote.cleaningFee} Kč</div>
                <div style={{ marginTop: 6, fontSize: 18 }}>Celkem: <strong>{quote.total} Kč</strong></div>
              </div>
            )}
            {msg && <div style={{ marginTop: 12, color: 'crimson' }}>{msg}</div>}
          </div>
        </div>
      )}

      {tab === 'admin' && (
        <>
          <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={() => setAdminTab('calendar')}
              disabled={adminTab === 'calendar'}
              style={{ padding: '8px 12px' }}
            >
              Kalendář
            </button>
            <button
              onClick={() => setAdminTab('seasons')}
              disabled={adminTab === 'seasons'}
              style={{ padding: '8px 12px' }}
            >
              Ceník / Sezóny
            </button>
          </div>

          {adminTab === 'calendar' && (
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
                eventContent={(arg) => {
                  const title = arg.event.title || 'Rezervace';
                  const price = arg.event.extendedProps?.totalPrice;
                  const isPending = (arg.event.extendedProps?.status === 'PENDING');
                  return {
                    html: `<div style="padding:2px 4px; ${isPending ? 'font-weight:600;' : ''}">
                      ${title}${price ? ` – ${price} Kč` : ''}
                    </div>`
                  };
                }}
                eventClick={(info) => {
                  openEventPanel(info.event);
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
                    <button onClick={() => setSelectedEvent(null)} style={{ padding: '6px 10px' }}>✕</button>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 14, color: '#ddd' }}>
                    <div><strong>Host:</strong> {selectedEvent.guestName || '—'}</div>
                    <div>
                      <strong>Termín:</strong> {selectedEvent.start} → {selectedEvent.end}
                      <div style={{opacity:.8}}>Check-in 16:00 · Check-out 10:00</div>
                    </div>
                    <div><strong>Zdroj:</strong> {selectedEvent.source}</div>
                    <div><strong>Stav:</strong> {selectedEvent.status}</div>
                    {selectedEvent.price != null && (
                      <div><strong>Cena:</strong> {selectedEvent.price} Kč</div>
                    )}
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

              <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 16, height: 16, backgroundColor: '#3788d8', borderRadius: 3 }}></div>
                  <span>Rezervace</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 16, height: 16, backgroundColor: '#ff9f89', borderRadius: 3 }}></div>
                  <span>Airbnb</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 16, height: 16, backgroundColor: '#666', borderRadius: 3 }}></div>
                  <span>Blokace</span>
                </div>
              </div>
              {msg && <div style={{ marginTop: 12, color: 'crimson' }}>{msg}</div>}
            </>
          )}

          {adminTab === 'seasons' && (
            <SeasonsPage propertyId={1} />
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/r/:publicUid" element={<BookingStatusPage />} />
      </Routes>
    </Router>
  );
}