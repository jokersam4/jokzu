// src/components/Products/Products.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';
import { AuthContext } from '../../context/AuthContext';

const Products = ({ products }) => {
  const {  language } = useContext(AuthContext);
  return (
    <div className="products-container">
      <h2 className="products-title">  {language === 'en' ? "Our Products "
            : language === 'fr' ? "Nos Produits "
              : "منتجاتنا"}</h2>
      <div className="products-grid">
        {products.map((product, index) => (
          <div key={index} className="product-card">
            <Link className='zzz' to={`/product/${product.id}`}>
              <img src={product.images} alt={product.name} className="product-image" />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">MAD {product.price}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
