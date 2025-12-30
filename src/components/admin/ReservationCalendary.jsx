import React from 'react';
import ReservationItem from './ReservationItem';
import ReservationDay from './ReservationDay';

export default function ReservationCalendar({ reservations, onEdit, onView, onConfirm }) {


  return (
    <div className="reservation-calendar">
      {reservations.map((res) => (
        <ReservationDay
          key={res.publicUid}
          reservation={res}
          onEdit={onEdit}
          onView={onView}
          onConfirm={onConfirm}
        />
      ))}
    </div>
  );
}