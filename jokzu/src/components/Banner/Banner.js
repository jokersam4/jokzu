// src/components/Banner.js
import React from 'react';
import './Banner.css';
import bannerImage from '../../assets/img/banner.jpg'; // Import the local image

const Banner = ({ title, subtitle, buttonText, buttonLink }) => {
  return (
    <div className="banner" style={{ backgroundImage: `url(${bannerImage})` }}>
      <div className="banner-overlay">
        <div className="banner-content">
          <h1 className="banner-title">{title}</h1>
          <p className="banner-subtitle">{subtitle}</p>
          <a href={buttonLink} className="banner-button">{buttonText}</a>
        </div>
      </div>
    </div>
  );
};

export default Banner;
