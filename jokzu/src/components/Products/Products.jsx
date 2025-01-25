// src/components/Products/Products.js
import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Products.css';
import { AuthContext } from '../../context/AuthContext';

const Products = ({ products }) => {
  const { language } = useContext(AuthContext);
   const location = useLocation();
    const [userParam, setUserParam] = useState('');
    useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      const user = queryParams.get('user'); // Get the 'user' parameter from the URL
    
      if (user) {
        setUserParam(user); 
         // Set affiliate to user if it's not null
      } else {
        setUserParam('');  // Return an empty string if user is null
      }
      console.log("sssssssssssss" +userParam)
      
    }, [location.search]);
  return (
    <div className="products-container">
      <h2 className="products-title">  {language === 'en' ? "Our Products "
        : language === 'fr' ? "Nos Produits "
          : "منتجاتنا"}</h2>
      <div className="products-grid">
        {products.map((product, index) => (
          <div key={index} className="product-card">
            <Link className='zzz' to={`/product/${product.id}/?user=${userParam}`}>
              <img src={product.images} alt={product.name} className="product-image" />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">
                {language === 'en' ? "MAD" : language === 'fr' ? "MAD" : "درهم"} {product.price}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
