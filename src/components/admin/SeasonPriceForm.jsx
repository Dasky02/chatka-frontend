import React, { useState, useEffect } from "react";
import { getCookie } from "../../api/functions";

const SeasonForm = ({ season, propertyId, onSaved, onCancel }) => {
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minNights, setMinNights] = useState("");
  const [weekendMultiplier, setWeekendMultiplier] = useState("");
  const [discount, setDiscount] = useState("");
  const token = getCookie("token");

  useEffect(() => {
    if (season) {
      setName(season.name || "");
      setBasePrice(season.basePriceCzk || "");
      setDateFrom(season.dateFrom || "");
      setDateTo(season.dateTo || "");
      setMinNights(season.minNights || "");
      setWeekendMultiplier(season.weekendMult || "");
      setDiscount(season.discountPct || "");
    }
  }, [season]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      propertyId,
      name,
      dateFrom,
      dateTo,
      basePriceCzk: Number(basePrice),
      minNights: Number(minNights),
      weekendMult: Number(weekendMultiplier),
      discountPct: Number(discount),
    };

    try {
      const method = season?.id ? "PUT" : "POST";
      const url = season?.id
        ? `/api/admin/pricing/seasons/${season.id}`
        : `/api/admin/pricing/seasons`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Chyba při ukládání sezony");

      onSaved();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="season-form-modal">
      <div className="season-form-container">
        <h2>{season?.id ? "Editace sezony" : "Nová sezona"}</h2>
        <form onSubmit={handleSubmit} className="season-form">
          <div className="form-row">
            <label>Název:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Základ (Kč):</label>
            <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
          </div>
          <div className="form-row date-row">
            <div>
              <label>Datum od:</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required />
            </div>
            <div>
              <label>Datum do:</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <label>Min nocí:</label>
            <input type="number" value={minNights} onChange={(e) => setMinNights(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Víkendový násobič:</label>
            <input type="number" step="0.1" value={weekendMultiplier} onChange={(e) => setWeekendMultiplier(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Sleva (%):</label>
            <input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
          <div className="form-buttons">
            <button type="submit" className="add-button">{season?.id ? "Uložit" : "Přidat"}</button>
            <button type="button" className="cancel-button" onClick={onCancel}>Zrušit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeasonForm;
