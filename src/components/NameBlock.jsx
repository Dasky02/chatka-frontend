import React, { useState } from 'react';
import Arrow from '../assets/down-arrow.png';

export default function NameBlock({name, id}) {
  const [open, setOpen] = useState(false);

  return (
    <div className='name-block flex fade-left' id={id}>
      <h3>{name || 'Název'}</h3>
    </div>
  );
}