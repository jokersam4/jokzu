import React, { useContext, useEffect, useState } from 'react';
import Banner from '../components/Banner/Banner';
import Products from '../components/Products/Products';
import product1 from '../assets/img/aaaa.png';
import Footer from '../components/Footer/Footer';
import { AuthContext } from '../context/AuthContext'; // Get language from context
import { useLocation } from 'react-router-dom';

const Home = () => {
  const { language } = useContext(AuthContext); // Access the selected language from context
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
  }, [location.search]);
  const dummyProducts = [
    {
      name: {
        en: 'Goku T-shirt',
        fr: 'T-shirt Goku',
        ar: 'تيشيرت غوكو',
      },
      price: 199,
      images: product1,
      id: 1,
      sizes: 'M',
    },
  ];

  // Translated texts for banner
  const bannerText = {
    title: {
      en: 'Welcome to Pluton',
      fr: 'Bienvenue chez Pluton',
      ar: 'Pluton مرحبًا بك في ',
    },
    subtitle: {
      en: 'Discover the latest trends in 3D T-shirts',
      fr: 'Découvrez les dernières tendances des t-shirts 3D',
      ar: 'اكتشف أحدث صيحات القمصان ثلاثية الأبعاد',
    },
    buttonText: {
      en: 'Shop Now',
      fr: 'Acheter maintenant',
      ar: 'تسوق الآن',
    },
  };

  return (
    <div>
      <Banner
        title={bannerText.title[language]}
        subtitle={bannerText.subtitle[language]}
        buttonText={bannerText.buttonText[language]}
        buttonLink={`../ourproducts/?user=${userParam}`}
      />
      <div className="home-content">
        <Products
          products={dummyProducts.map(product => ({
            ...product,
            name: product.name[language],
          }))}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
