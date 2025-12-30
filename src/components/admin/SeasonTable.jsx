import React from "react";
import { FaTrash, FaPen } from "react-icons/fa";

const SeasonTable = ({ seasons, loading, onEdit, onDelete }) => {
  if (loading) return <p>Načítám...</p>;

  return (
    <div className="season-table-container">
      <h2>Sezony</h2>
      <table className="season-table">
        <thead>
          <tr>
            <th>Název</th>
            <th>Základ (Kč)</th>
            <th>Datum od</th>
            <th>Datum do</th>
            <th>Min nocí</th>
            <th>Víkendový násobič</th>
            <th>Sleva (%)</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {seasons.length ? (
            seasons.map((season) => (
              <tr key={season.id}>
                <td>{season.name}</td>
                <td>{season.basePriceCzk}</td>
                <td>{season.dateFrom}</td>
                <td>{season.dateTo}</td>
                <td>{season.minNights}</td>
                <td>{season.weekendMult}</td>
                <td>{season.discountPct}</td>
                <td className="action-buttons">
                  <button className="edit-btn" onClick={() => onEdit(season)}>
                    <FaPen />
                  </button>
                  <button className="delete-btn" onClick={() => onDelete(season.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                Žádné sezony k zobrazení
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SeasonTable;
