export default function ReservationPanel({ event, onClose }) {
  return (
    <div className="w-80 p-4 bg-white shadow-lg border-l">
      <h2 className="font-bold text-xl mb-4">Detail rezervace</h2>
      <p><strong>Host:</strong> {event.guestName}</p>
      <p><strong>Datum:</strong> {event.date}</p>
      <p><strong>Počet osob:</strong> {event.people}</p>

      <div className="mt-4 flex justify-between">
        <button className="bg-red-500 text-white px-3 py-1 rounded">Zrušit</button>
        <button className="bg-gray-300 px-3 py-1 rounded" onClick={onClose}>Zavřít</button>
      </div>
    </div>
  );
}