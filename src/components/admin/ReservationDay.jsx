import React from 'react';
import ReservationItem from './ReservationItem';

export default function ReservationDay({ reservation, onEdit, onView, onConfirm }) {
  return (
    <div className="reservation-day">
     <h2>
  {reservation.guestName},{" "}
  {new Date(reservation.start).toLocaleString()}
</h2>
      <p>{reservation.title}</p>
      <div className="reservation-list">
          <ReservationItem
            reservation={reservation}
            onEdit={onEdit}
            onView={onView}
            onConfirm={onConfirm}
          />
      </div>
    </div>
  );
}
