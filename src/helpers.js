export const AUTH_KEY = 'authBasic';

export const getStoredAuth = () => {
  try { return localStorage.getItem(AUTH_KEY) || ''; } 
  catch { return ''; }
};

export const saveAuth = (val) => {
  try { if(val) localStorage.setItem(AUTH_KEY, val); else localStorage.removeItem(AUTH_KEY); } 
  catch {}
};

export const iso = (d) => {
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};

export const ymdPragueFromTs = (ts) => {
  if(!ts) return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(ts)) return ts;
  const d = new Date(ts);
  const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Prague', year:'numeric', month:'2-digit', day:'2-digit' });
  return fmt.format(d);
};

export function addDaysStr(yyyyMmDd, days) {
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  d.setDate(d.getDate()+days);
  return iso(d);
}

export function eachDayInclusive(startYmd,endYmdExclusive){
  const out=[];
  let cur=new Date(`${startYmd}T00:00:00`);
  const end=new Date(`${endYmdExclusive}T00:00:00`);
  while(cur<end){ out.push(iso(cur)); cur.setDate(cur.getDate()+1); }
  return out;
}

export function parseICS(text){
  const events=[];
  const vevents=text.split('BEGIN:VEVENT').slice(1);
  vevents.forEach(vevent=>{
    const dtstart=vevent.match(/DTSTART(?:;[^:]*)?:(\d{8}T?\d{0,6}Z?)/);
    const dtend=vevent.match(/DTEND(?:;[^:]*)?:(\d{8}T?\d{0,6}Z?)/);
    const summary=vevent.match(/SUMMARY:(.*)/);
    if(dtstart && dtend && summary){
      const parseDate=d=>{
        if(d.length===8) return d.slice(0,4)+'-'+d.slice(4,6)+'-'+d.slice(6,8);
        const y=d.slice(0,4),m=d.slice(4,6),day=d.slice(6,8),h=d.slice(9,11),min=d.slice(11,13),s=d.slice(13,15);
        return new Date(Date.UTC(y,m-1,day,h,min,s)).toISOString();
      };
      events.push({ title: summary[1], start: parseDate(dtstart[1]), end: parseDate(dtend[1]), allDay: dtstart[1].length===8 });
    }
  });
  return events;
}

// --- Další utility ---
export function addDays(date, days){ const d=new Date(date); const d0=new Date(d.getFullYear(),d.getMonth(),d.getDate()); d0.setDate(d0.getDate()+days); return d0; }
export function toMidnight(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
export function firstDisabledAfter(startDate, disabledSet, maxDays=400){
  const startMid=toMidnight(startDate);
  for(let i=1;i<=maxDays;i++){ const d=addDays(startMid,i); if(disabledSet.has(iso(d))) return d; }
  return null;
}
export function isStartAllowed(day, bookedNights){ return !bookedNights.has(iso(day)); }
export function canEndOn(endDay,startDay,bookedNights){
  if(!startDay||endDay<=startDay) return false;
  const cur=new Date(startDay.getFullYear(),startDay.getMonth(),startDay.getDate());
  while(cur<endDay){ if(bookedNights.has(iso(cur))) return false; cur.setDate(cur.getDate()+1); }
  return true;
}
export async function postJson(url,data){ 
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(!res.ok) throw new Error(await res.text()||`HTTP ${res.status}`);
  return res.json();
}
