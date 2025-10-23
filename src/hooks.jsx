export async function handleQuote() {
    setMsg(''); setQuote(null);
    try{ const data=await postJson('/api/bookings/quote',{
      propertyId:1,
      start:iso(range[0].startDate),
      end:iso(range[0].endDate),
      guests:Number(guests||1)
    }); setQuote(data);
    }catch(e){ setMsg(`Chyba kalkulace: ${e.message}`); }
  };