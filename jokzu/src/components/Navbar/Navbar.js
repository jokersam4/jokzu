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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [SS, setSS] = useState(false);
  const [userSectionOpen, setUserSectionOpen] = useState(false);
  const { state, dispatch } = useContext(AuthContext);
  const { isLoggedIn } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  const dropdownRef = useRef(null);

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await axios.get("/api/auth/signout");
      localStorage.clear();
      dispatch({ type: "SIGNOUT" });
      // Redirect to './login' relative path
      window.location.href = '../login';
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
      window.location.href = '../login';
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} className="logo" alt="Logo" />
        </Link>
        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          {/* <li className="nav-item">
            <Link to="/" className="nav-links" onClick={toggleMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/shop" className="nav-links" onClick={toggleMenu}>
              Shop
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-links" onClick={toggleMenu}>
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/Affiliate" className="nav-links" onClick={toggleMenu}>
              Affiliate
            </Link>
          </li> */}
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

                {isLoggedIn ? <button onClick={handleClick}>

                  {"logout"}


                </button>



                  :

                  <NavLink to={"./login"}>
                    <button onClick={handleClick2}>

                      {"login"}


                    </button>

                  </NavLink>


                }
              </motion.div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
