import React, { useContext } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import './ThankYou.css';
import { AuthContext } from '../../context/AuthContext';

const ThankYou = () => {
  const { language } = useContext(AuthContext); 
  return (
    <div className="thank-you-container">
      <FaCheckCircle className="thank-you-icon" />
      <h2 className="thank-you-title">  {language === 'en' ? "Thank You for Your Order!" : language === 'fr' ? "Merci pour votre commande !" : "! شكرًا على طلبك "}</h2>
      <p className="thank-you-message"> {language === 'en' ? "Your order has been placed successfully. We appreciate your trust!" : language === 'fr' ? "Votre commande a été passée avec succès. Nous vous remercions pour votre confiance !" : "!تم تقديم طلبك بنجاح. نحن نقدر تعاملكم معنا "}</p>
      <p className="thank-you-details">{language === 'en' ? "You will receive a confirmation message with your order details shortly." : language === 'fr' ? "Vous recevrez bientôt un message de confirmation avec les détails de votre commande ." : "!سوف تتلقى رسالة تأكيد مع تفاصيل طلبك قريبًا "}</p>
    </div>
  );
};

export default ThankYou;
