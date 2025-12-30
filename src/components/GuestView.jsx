import { useState, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { iso, toMidnight, addDays, eachDayInclusive, firstDisabledAfter, isStartAllowed, canEndOn, postJson } from '../helpers.js';
import { cs } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function GuestView() {
  const [range, setRange] = useState([{ startDate: new Date(), endDate: addDays(new Date(), 1), key: 'selection' }]);
  const [focusRange, setFocusRange] = useState([0,0]);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [disabledDaysSet, setDisabledDaysSet] = useState(new Set());

  // --- načtení obsazených dní ---
useEffect(() => {
  (async () => {
    try {
      const res = await fetch(`/api/bookings/all?propertyId=1`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const days = new Set();

      data.forEach(booking => {
        // převést start/end na lokální midnight
        const start = new Date(booking.start);
        const end = new Date(booking.end);

        const startMid = toMidnight(new Date(booking.start));
const endMid = toMidnight(new Date(booking.end));
const lastNight = addDays(endMid, -1); // checkout den je volný

for (let d = startMid; d <= lastNight; d = addDays(d, 1)) {
  days.add(iso(d));
}
      });

      setDisabledDaysSet(days);
    } catch(e) {
      console.error(e);
      setMsg(`Chyba načítání obsazenosti: ${e.message}`);
    }
  })();
}, []);

  // --- kalkulace ceny při změně range ---
  useEffect(() => {
    if (range[0]?.startDate && range[0]?.endDate) handleQuote();
  }, [range]);

  const handleQuote = async () => {
    setMsg('');
    setQuote(null);
    try {
      const data = await postJson('/api/bookings/quote', {
        propertyId: 1,
        start: iso(range[0].startDate),
        end: iso(range[0].endDate),
        guests: Number(guests || 1)
      });
      setQuote(data);
    } catch (e) {
      setMsg(`Chyba kalkulace: ${e.message}`);
    }
  };

const handleBookAndPay=async()=>{
    setMsg(''); setBusy(true);
    try{
      const booking=await postJson('/api/bookings',{
        propertyId:1,
        start:iso(range[0].startDate),
        end:iso(range[0].endDate),
        guests:Number(guests||1),
        guestName:name||'Host',
        guestEmail:email||'host@example.com'
      });
      const publicUid=booking.publicUid||booking.public_uid;
      if(publicUid) window.location.href=`/r/${publicUid}`;
      else if(booking.id){
        const r=await fetch(`/api/payments/booking-url?bookingId=${booking.id}`);
        if(!r.ok) throw new Error(await r.text()||`HTTP ${r.status}`);
        const url=await r.text();
        window.location.href=url.startsWith('/r/')?url:`/r/${url}`;
      }else throw new Error('Missing booking identifier');
    }catch(e){ setMsg(e.status===409?'Termín je již obsazen.':`Chyba rezervace: ${e.message}`); }
    finally{ setBusy(false); }
  };

  return (
    <div className='calendar-form flex' id='calendar'>
      <div className='calendar fade-left flex'>
        <h2>TinyHouse – rezervace</h2>
   <DateRange
  ranges={range}
  onChange={(i) => {
    let s = toMidnight(i.selection.startDate);
    let e = i.selection.endDate ? toMidnight(i.selection.endDate) : addDays(s, 1);
    
    // pokud start je obsazený, posun dopředu
    while (disabledDaysSet.has(iso(s))) {
      s = addDays(s, 1);
      e = addDays(s, 1);
    }

    // ořízni end, aby nepřesáhl první obsazenou noc
    const firstDisabled = Array.from(disabledDaysSet).map(d => new Date(d)).sort((a,b)=>a-b).find(d => d > s);
    if (firstDisabled && e > firstDisabled) e = firstDisabled;

    setRange([{ ...i.selection, startDate: s, endDate: e, key: 'selection' }]);
  }}
  minDate={new Date()}
  moveRangeOnFirstSelection={false}
  disabledDay={(date) => {
    const dStr = iso(toMidnight(date));
    const todayStr = iso(toMidnight(new Date()));
    return dStr < todayStr || disabledDaysSet.has(dStr);
  }}
  dayClassName={(date) => disabledDaysSet.has(iso(toMidnight(date))) ? 'booked-day' : ''}
  locale={cs}
/>
      </div>

      {quote && (
        <div className='calculate-form flex fade-right'>
          <form action="" className='flex'>
            <h3>Informace o vás</h3>
            <div className='flex input-box flex'>
              <div className='input-col flex'> 
                <label>Jméno</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jan Novák"/>
              </div>
              <div className='input-col flex'>
                <label>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@example.com"/>
              </div>
            </div>
            <div className='input-col flex'>
              <label>Počet hostů</label>
              <input type="number" min="1" value={guests} onChange={e => setGuests(e.target.value)}/>
            </div>
            <button onClick={handleBookAndPay} disabled={busy || !quote} className='button' type='button'>Rezervovat</button>
          </form>
          <div className='reservation-info flex fade-right'>
            <h3>Výpočet ceny</h3>
            <div className='flex'>Nocí: {quote.nights}</div>
            <div className='flex'>Základ: {quote.base} Kč</div>
            <div className='flex'>Sleva 7+ nocí: {quote.longStayAdj} Kč</div>
            <div className='flex'>Úklid: {quote.cleaningFee} Kč</div>
            <div className='full-price-tag'><span>Celkem: {quote.total} Kč</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
