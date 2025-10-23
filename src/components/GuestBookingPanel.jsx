import { DateRange } from 'react-date-range';
import { useState } from 'react';
import { iso, toMidnight, addDays, isStartAllowed, firstDisabledAfter, canEndOn } from '../utils/dateHelpers';
import { postJson } from '../api';

export default function GuestBookingPanel({ disabledDaysSet }) {
  const [range, setRange] = useState([{ startDate: new Date(), endDate: addDays(new Date(), 1), key: 'selection' }]);
  const [focusRange, setFocusRange] = useState([0,0]);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleQuote() {
    setMsg(''); setQuote(null);
    try {
      const data = await postJson('/api/bookings/quote', {
        propertyId: 1, start: iso(range[0].startDate), end: iso(range[0].endDate), guests: Number(guests||1)
      });
      setQuote(data);
    } catch (e) { setMsg(`Chyba kalkulace: ${e.message}`); }
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
      const publicUid = booking.publicUid || booking.public_uid;
      if (publicUid) window.location.href = `/r/${publicUid}`;
    } catch (e) { setMsg(e.status === 409 ? 'Termín je již obsazen.' : `Chyba rezervace: ${e.message}`); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <DateRange
          ranges={range}
          onRangeFocusChange={fr => setFocusRange(fr)}
          onChange={(i) => {
            let s = toMidnight(i.selection.startDate);
            let e = i.selection.endDate ? toMidnight(i.selection.endDate) : addDays(s, 1);

            while(disabledDaysSet.has(iso(s))) { s = addDays(s, 1); if(e <= s) e = addDays(s, 1); }
            const cut = firstDisabledAfter(s, disabledDaysSet);
            if(cut && e > cut) e = cut;
            if(e <= s) e = addDays(s,1);
            setRange([{ ...i.selection, startDate: s, endDate: e }]);
          }}
          minDate={new Date()}
          moveRangeOnFirstSelection={false}
          disabledDay={(date) => {
            const dMid = toMidnight(date);
            const pickingStart = (focusRange?.[1] ?? 0) === 0;
            if(pickingStart) return !isStartAllowed(dMid, disabledDaysSet);
            const s0 = range[0]?.startDate ? toMidnight(range[0].startDate) : null;
            if(!s0 || dMid <= s0) return true;
            const cut = firstDisabledAfter(s0, disabledDaysSet);
            if(cut){ const cutTime = cut.getTime(); const dTime = dMid.getTime();
              if(dTime === cutTime) return false;
              if(dTime > cutTime) return true;
            }
            return !canEndOn(dMid, s0, disabledDaysSet);
          }}
        />
      </div>
      <div>
        <label>Počet hostů</label>
        <input type="number" min="1" value={guests} onChange={e=>setGuests(e.target.value)} style={{display:'block',padding:8,margin:'6px 0 12px',width:200}} />
        <label>Jméno</label>
        <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Jan Novák" style={{display:'block',padding:8,margin:'6px 0 12px',width:300}} />
        <label>E-mail</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="jan@example.com" style={{display:'block',padding:8,margin:'6px 0 12px',width:300}} />
        <div style={{display:'flex',gap:8,marginTop:12}}>
          <button onClick={handleQuote} disabled={busy} style={{padding:'10px 16px'}}>Spočítat cenu</button>
          <button onClick={handleBookAndPay} disabled={busy || !quote} style={{padding:'10px 16px'}}>Rezervovat</button>
        </div>
        {quote && (
          <div style={{marginTop:16,padding:12,border:'1px solid #ddd',borderRadius:8}}>
            <div>Nocí: <strong>{quote.nights}</strong></div>
            <div>Základ: {quote.base} Kč</div>
            <div>Sleva 7+ nocí: {quote.longStayAdj} Kč</div>
            <div>Úklid: {quote.cleaningFee} Kč</div>
            <div style={{marginTop:6,fontSize:18}}>Celkem: <strong>{quote.total} Kč</strong></div>
          </div>
        )}
        {msg && <div style={{marginTop:12,color:'crimson'}}>{msg}</div>}
      </div>
    </div>
  );
}
