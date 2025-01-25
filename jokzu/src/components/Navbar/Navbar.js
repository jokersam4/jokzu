import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Navbar.css';
import logo from "../../assets/img/logo2.png";
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { FaUserCircle } from "react-icons/fa";
import { FaUserGear } from "react-icons/fa6";

import { useLocation } from 'react-router-dom';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [userSectionOpen, setUserSectionOpen] = useState(false);
  const { state, dispatch } = useContext(AuthContext);
  const { isLoggedIn } = useContext(AuthContext);
  const { user , language} = useContext(AuthContext);
  const dropdownRef = useRef(null);
  const [Tt, setTt] = useState(false);
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


  
  // Log the value after it's updated
  useEffect(() => {
    if (userParam) {
      console.log("Updated userParam:", userParam);
    }
  }, [userParam]);
  
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await axios.get("/api/auth/signout");
      localStorage.clear();
      dispatch({ type: "SIGNOUT" });
      // Redirect to './login' relative path
      window.location.href = `../../login/?user=${userParam}`;
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    Ss();
  }, []);

  const Ss = () => {
    console.log("fzaafaez")
  };
  const handleClick2 = async (e) => {
    e.preventDefault();

    try {
      if (isLoggedIn) {
        await axios.get("/api/auth/signout");
        localStorage.clear();
        dispatch({ type: "SIGNOUT" });
      }


      // Redirect to './login' relative path
      window.location.href = `../../login/?user=${userParam}`;
    } catch (err) {
      console.log(err);
    }
  };
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserSection = () => {
    setUserSectionOpen(!userSectionOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setUserSectionOpen(false);
    }
  };
  const LanguageSelectionScreen = ({ onSelectLanguage }) => {
    return (
      <div className="language-selection-screen">
        <h2>Select Your Language</h2>
        <button onClick={() => {onSelectLanguage('en') ; Mm();} }>English</button>
        <button onClick={() => {onSelectLanguage('fr') ; Mm();}}>Français</button>
        <button onClick={() => {onSelectLanguage('ar') ; Mm();}}>عربي</button>
      </div>
    );
  };
  const TT = () => {
    setTt(true);
  } 
  const Mm = () => {
    setTt(false);
  } 
  
  
  useEffect(() => {
    console.log("user.picture")
    console.log(user.picture)
    if (userSectionOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userSectionOpen]);
  // Handle language selection
  const handleLanguageSelection = (lang) => {
    console.log('dget')
    dispatch({ type: 'SET_LANGUAGE', payload: lang }); // Dispatch action to update language in context
    localStorage.setItem('language', lang); // Persist the selected language in localStorage
  };
  if (Tt) {
    return <LanguageSelectionScreen onSelectLanguage={handleLanguageSelection} />;
  }

  return (
    <nav className="navbar">
    <div className="navbar-container">
    <Link to={`../?user=${userParam}`} className="navbar-logo">
  <img src={logo} className="logo" alt="Logo" />
</Link>

      <div className="menu-icon" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>
      <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
        <li className="nav-item">
          <Link to=   {`../ourproducts/?user=${userParam}`} className="nav-links" onClick={toggleMenu}>
            {language === 'en' ? "Our Products" : language === 'fr' ? "Nos Produits" : "منتجاتنا"}
          </Link>
        </li>
        
        <li className="nav-item">
          <Link to=  {`../affiliate/?user=${userParam}`} className="nav-links" onClick={toggleMenu}>
            {language === 'en' ? "Affiliate" : language === 'fr' ? "Affiliation" : "التسويق"}
          </Link>
        </li>
  
        <li className="nav-item user-item">
          <div className="user-info" onClick={toggleUserSection}>
            <>
              {isLoggedIn ?
                user.picture ?
                  <img src={user.picture} alt="User" />
                  : <FaUserGear className='aa' />
                : <FaUserCircle className='aa' />}
            </>
          </div>
          
          {userSectionOpen && (
            <motion.div
              className="user-dropdown"
              ref={dropdownRef}
              initial={{ opacity: 0, x: -20, y: -10 }}
              animate={{ opacity: 1, y: 10 }}
              transition={{ duration: 0.5 }}
            >
              <p className='username'>{user.name}</p>
              <button onClick={TT}>
                {language === 'en' ? "Language" : language === 'fr' ? "Langue" : "اللغة"}
              </button>
  
              {isLoggedIn ? 
                <button onClick={handleClick}>
                  {language === 'en' ? "Logout" : language === 'fr' ? "Déconnexion" : "تسجيل الخروج"}
                </button>
                :
                <NavLink to={`../../login/?user=${userParam}`}>
                  <button onClick={handleClick2}>
                    {language === 'en' ? "Login" : language === 'fr' ? "Connexion" : "تسجيل الدخول"}
                  </button>
                </NavLink>
              }
            </motion.div>
          )}
        </li>
      </ul>
    </div>
  </nav>
  )
};

export default Navbar;
