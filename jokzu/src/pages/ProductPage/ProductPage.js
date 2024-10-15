import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './ProductPage.css';
import Comments from '../../components/ReviewForm/ReviewForm';
import '../../components/PaymentForm/PaymentForm.css';
import axios from 'axios';
import Footer from '../../components/Footer/Footer';
import { AuthContext } from '../../context/AuthContext';

const ProductPage = ({ products }) => {
  const { productId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [promoCode, setPromoCode] = useState('');
  const [message, setMessage] = useState('');
  const product = products.find(prod => prod.id === parseInt(productId));
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState(product ? product.reviews : []);
  const [discount, setDiscount] = useState(0);
  const { language } = useContext(AuthContext); 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyPromo = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/coupon`);
      if (response.data.exists) {
        setMessage('Promo code applied successfully!');
      } else {
        setMessage('Invalid promo code. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error applying promo code. Please try again later.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/commands', {
        size: selectedSize,
        quantity,
        name: `${formData.firstName} ${formData.lastName}`,
        phoneNumber: formData.phoneNumber,
        promoCode
      });
      console.log(response.data);
      navigate('/thankyou'); // Navigate to the /thankyou route
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
  };

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value));
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Please select a size.');
      return;
    }
    if (quantity < 1) {
      alert('Please select a valid quantity.');
      return;
    }
    setShowForm(true);
  };

  const addReview = (newReview) => {
    setReviews([...reviews, newReview]);
  };

  if (!product) {
    return <h2>Product not found</h2>;
  }

  const discountedPrice = (product.price * (1 - discount / 100)).toFixed(2);

  return (
    <div>
      <div className="product-page">
        <div className="product-page-container">
          <div className="product-image-container">
            <Carousel showArrows={true} dynamicHeight={true} infiniteLoop={true}>
              {product.images.map((image, index) => (
                <div key={index}>
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </Carousel>
          </div>

          {showForm ? (
            <form className="payment-form" onSubmit={handleSubmit}>
              <h3>{language === 'eng' ? "Enter your details" : language === 'fr' ? "Entrez vos détails" : "أدخل تفاصيلك"}</h3>
              <label>
                {language === 'en' ? "First Name:" : language === 'fr' ? "Prénom:" : "الاسم الشخصي:"}
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                {language === 'en' ? "Last Name:" : language === 'fr' ? "Nom de famille:" : "الاسم العائلي:"}
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                {language === 'en' ? "Phone Number:" : language === 'fr' ? "Numéro de téléphone:" : "رقم الهاتف:"}
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </label>
              <button type="submit">Submit</button>
            </form>
          ) : (
            <div className="product-details">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-price">
                MAD {discount > 0 ? discountedPrice : product.price}
                {discount > 0 && <span className="original-price">MAD {product.price}</span>}
              </p>
              <p className="product-description">{product.description}</p>
              <div className="product-size">
                <label htmlFor="size">{language === 'en' ? "Size:" : language === 'fr' ? "Taille:" : "المقاس:"}</label>
                <select id="size" value={selectedSize} onChange={handleSizeChange} required>
                  <option value="">{language === 'en' ? "Select size" : language === 'fr' ? "Sélectionner la taille" : "اختيار المقاس"}</option>
                  {product.sizes.map((size, index) => (
                    <option key={index} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div className="product-quantity">
                <label htmlFor="quantity">{language === 'en' ? "Quantity:" : language === 'fr' ? "Quantité:" : "الكمية:"}</label>
                <input type="number" id="quantity" value={quantity} onChange={handleQuantityChange} min={1} required />
              </div>
              <button className="buy-now-button" onClick={handleBuyNow}>
                {language === 'en' ? "Order Now" : language === 'fr' ? "Commandez maintenant" : "اطلب الآن"}
              </button>
            </div>
          )}
        </div>

        <Comments reviews={reviews} addReview={addReview} />
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
