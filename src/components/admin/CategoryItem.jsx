import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CategoryItem({ name, description, id }) {
  const navigate = useNavigate();
  return (
    <div className='category-item flex' onClick={()=>navigate(`/admin/category/${id}/upload`)}>
        <h3>{name}</h3>
        <p>{description}</p>
      
    </div>
  );
}