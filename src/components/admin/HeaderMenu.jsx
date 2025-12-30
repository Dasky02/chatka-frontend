import React, { useState } from 'react';

export default function HeaderMenu({ name, onClick }) {

  return (
    <div className='header-menu flex'>
        <h2>{name}</h2>
        <button className='button' onClick={()=>onClick(true)}>Přidat</button>
    </div>
  );
}