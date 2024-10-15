import React, { useContext } from 'react';
import Banner from '../components/Banner/Banner';
import Products from '../components/Products/Products';
import product1 from '../assets/img/aaaa.png';
import Footer from '../components/Footer/Footer';
import { AuthContext } from '../context/AuthContext'; // Get language from context

const Home = () => {
  const { language } = useContext(AuthContext); // Access the selected language from context

  const dummyProducts = [
    {
      name: {
        en: 'Goku T-shirt',
        fr: 'T-shirt Goku',
        ar: 'تيشيرت غوكو',
      },
      price: 299,
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
      ar: 'مرحبًا بك في Pluton',
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
        buttonLink="/shop"
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
