import React, { useState } from 'react';
import Arrow from '../assets/down-arrow.png';
import FAQcomponent from './Faq';

export default function FAQSection({ question, answer }) {
 const [faq,setfaq]=useState(4);


    const faqArray = Array.from({ length: faq }, (_, i) => i);

  return (
    <div className='faq-section flex'>
    <div className='flex faq-box'>
              {faqArray.map((_, index) => (
            <FAQcomponent key={index} />
          ))}
    </div>
    </div>
  );
}