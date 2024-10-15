import React, { useState } from 'react';
import './AffiliatePage.css';
import Footer from '../Footer/Footer';
import axios from 'axios';

function AffiliatePage() {
  const [Coupon, setCoupon] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCouponCodeChange = (event) => {
    setCoupon(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/coupon', {
        Coupon: Coupon
      });
      console.log(response.data);
      setSuccessMessage('Coupon added successfully!');
      setErrorMessage('');
      // Clear input after successful submission
      setCoupon('');
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data.error === 'Coupon already exists') {
        setErrorMessage('Coupon already exists. Please enter a different one.');
      } else {
        setErrorMessage('Error adding coupon. Please try again later.');
      }
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <div className="affiliate-page">
        <header className="affiliate-page__header">
          <h1 className="affiliate-page__heading">Join Our Affiliate Program</h1>
        </header>
        <main className="affiliate-page__main">
          <form onSubmit={handleSubmit} className="affiliate-page__form">
            <label className="affiliate-page__label">
              Coupon Code:
              <input
                type="text"
                value={Coupon}
                onChange={handleCouponCodeChange}
                placeholder="Enter Coupon Code"
                className="affiliate-page__input"
              />
            </label>
            <button type="submit" className="affiliate-page__button">
              Submit
            </button>
          </form>
          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AffiliatePage;
