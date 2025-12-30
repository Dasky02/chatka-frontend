import React from 'react';
import { FaEdit, FaEye, FaCheck } from 'react-icons/fa';

export default function ReservationItem({ reservation, onEdit, onView, onConfirm }) {
  return (
    <div className="reservation-item">
      <div className="reservation-item-info">
        <div><strong>Host:</strong> {reservation.guestName}</div>
       <div>
  <strong>Od - Do:</strong>{" "}
  {new Date(reservation.start).toLocaleString()} - {new Date(reservation.end).toLocaleString()}
</div>
        <div><strong>Status:</strong> {reservation.status}</div>
        <div><strong>Platba:</strong> {reservation.totalPrice} ({reservation.paymentMethod})</div>
        <div><strong>Celkem:</strong> {reservation.totalPrice} CZK</div>
      </div>
      <div className="reservation-actions">
        <button onClick={() => onEdit(reservation)}><FaEdit /></button>
        <button onClick={() => onView(reservation)}><FaEye /></button>
        <button onClick={() => onConfirm(reservation)}><FaCheck /></button>
      </div>
    </div>
  );
}