import { useState, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { iso, toMidnight, addDays, firstDisabledAfter, isStartAllowed, canEndOn, postJson } from '../helpers.js';
import { cs } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Night from '../assets/night-mode.png';
import Price from '../assets/price-tag.png';
import Discount from '../assets/discount.png';
import Clean from '../assets/clean.png';

export default function GuestView(){
  const [range,setRange]=useState([{ startDate:new Date(), endDate:addDays(new Date(),1), key:'selection' }]);
  const [focusRange,setFocusRange]=useState([0,0]);
  const [guests,setGuests]=useState(2);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [quote,setQuote]=useState(null);
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState('');
  const [disabledDaysSet,setDisabledDaysSet]=useState(new Set());
  const [userSelected, setUserSelected] = useState(false);

   const [pos, setPos] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(()=>{
    (async()=>{
      try{
        const today=new Date();
        const from=iso(today);
        const plus12m=new Date(today.getFullYear(),today.getMonth()+12,1);
        const to=iso(plus12m);
        const res=await fetch(`/api/bookings?propertyId=1&from=${from}&to=${to}`);
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const data=await res.json();
        const days=[];
        for(const x of data){
          const startStr=x.start??x.startTs??x.start_ts;
          const endStr=x.end??x.endTs??x.end_ts;
          days.push(...eachDayInclusive(startStr,endStr));
        }
        setDisabledDaysSet(new Set(days));
      }catch(e){ setMsg(`Chyba načítání obsazenosti: ${e.message}`); }
    })();
  },[]);

  useEffect(() => {
  if (range[0]?.startDate && range[0]?.endDate) {
    handleQuote();
  }
}, [range]);

useEffect(() => {
  if (quote) {
    const el = document.querySelector('.calculate-form');
    if (el) setTimeout(() => el.classList.add('active'), 100);
  }
}, [quote]);

  const handleQuote=async()=>{
    setMsg(''); setQuote(null);
    try{ const data=await postJson('/api/bookings/quote',{
      propertyId:1,
      start:iso(range[0].startDate),
      end:iso(range[0].endDate),
      guests:Number(guests||1)
    }); setQuote(data);
    }catch(e){ setMsg(`Chyba kalkulace: ${e.message}`); }
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
  onRangeFocusChange={(fr) => setFocusRange(fr)}
  onChange={(i) => {
    let s = toMidnight(i.selection.startDate);
    let e = i.selection.endDate ? toMidnight(i.selection.endDate) : null;

    if (!e || e <= s) e = addDays(s, 1);
    while (disabledDaysSet.has(iso(s))) {
      s = addDays(s, 1);
      if (e <= s) e = addDays(s, 1);
    }

    const cut = firstDisabledAfter(s, disabledDaysSet);
    if (cut && e > cut) e = cut;
    if (e <= s) e = addDays(s, 1);

    // 💡 pouze nastav range, nevolej handleQuote()
    setRange([{ ...i.selection, startDate: s, endDate: e, key: 'selection' }]);
    setUserSelected(true); 
  }}
  minDate={new Date()}
  moveRangeOnFirstSelection={false}
  disabledDay={(date) => {
    const dMid = toMidnight(date);
    const dStr = iso(dMid);
    const todayStr = iso(toMidnight(new Date()));
    if (dStr < todayStr) return true;

    const pickingStart = (focusRange?.[1] ?? 0) === 0;
    if (pickingStart) return !isStartAllowed(dMid, disabledDaysSet);

    const s0 = range[0]?.startDate ? toMidnight(range[0].startDate) : null;
    if (!s0 || dMid <= s0) return true;

    const cut = firstDisabledAfter(s0, disabledDaysSet);
    if (cut) {
      const cutTime = cut.getTime(),
        dTime = dMid.getTime();
      if (dTime === cutTime) return false;
      if (dTime > cutTime) return true;
    }

    return !canEndOn(dMid, s0, disabledDaysSet);
  }}
  locale={cs}
/>
      </div>
    {quote && (
  <div
   className={`calculate-form flex fade-right`}
  >
    <form action="" className='flex'>
      <h3>Informace o vás</h3>
     <div className='flex input-box flex'>
      <div className='input-col flex'> 
        <label>Jméno</label>
      <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Jan Novák"/>
      </div>
      <div className='input-col flex'>
<label>E-mail</label>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="jan@example.com"/>
      </div>
      </div>
      <div className='input-col flex'>
        <label>Počet hostů</label>
      <input type="number" min="1" value={guests} onChange={e=>setGuests(e.target.value)}/>
      </div>
        <button onClick={handleBookAndPay} disabled={busy||!quote} className='button' type='button'>Rezervovat</button>
    </form>
    <div className='reservation-info flex'>
      <h3>Výpočet ceny</h3>
      <div className='flex'><img src={Night} alt="" />Nocí: {quote.nights}</div>
      <div className='flex'><img src={Price} alt="" />Základ: {quote.base} Kč</div>
      <div className='flex'><img src={Discount} alt="" />Sleva 7+ nocí: {quote.longStayAdj} Kč</div>
      <div className='flex'><img src={Clean} alt="" />Úklid: {quote.cleaningFee} Kč</div>
      <div className='full-price-tag'><span>Celkem: {quote.total} Kč</span></div>
    </div>
   
  </div>
)}
    </div>
  );
}
