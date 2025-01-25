import React from 'react';
import './WhatsAppButton.css';


import { FaWhatsappSquare } from "react-icons/fa";

const WhatsAppButton = () => {
    const handleSubmit = async (e) => {
        window.location.href = 'https://wa.me/+212707160954';
      };
    return (
       
           <FaWhatsappSquare className='wtsp' onClick={handleSubmit} />
      
    );
};

export default WhatsAppButton;
