import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './AffiliatePage.css';
import Footer from '../Footer/Footer';
import { FaCheck, FaClipboard, FaEdit, FaMoneyBill, FaShoppingCart, FaTicketAlt } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
const AffiliatePage = () => {
  const [promoCode, setPromoCode] = useState('');
  const [message, setMessage] = useState('');
  const [myPromos, setMyPromos] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { token, isLoggedIn, language } = useContext(AuthContext);
  const [copied, setCopied] = useState(false);
  const createAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });
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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const user = queryParams.get('user'); 
  
    if (user) {
      setUserParam(user); 
    } else {
      setUserParam('');  
    }
  
  }, [location.search]);
  
  useEffect(() => {
    const checkLoginStatus = async () => {
      if (isLoggedIn === undefined) return;  // Ensure isLoggedIn is defined before running
    
      if (!isLoggedIn) {
        window.location.href = `/login/?user=${userParam}`;
      }
    };
  
    checkLoginStatus();
  }, [isLoggedIn, userParam]);
  
 
  useEffect(() => {
    
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/current', createAuthHeaders());
        setUserInfo(response.data);
        console.log('auywaa')
      } catch (error) {
        setMessage('Failed to fetch user information.');
      }




  
    };
    const Promocode = async () => {
      try {
        const response = await axios.post('/api/codepromo2', { code: promoCode });
        setMessage(response.data.message);
      } catch (error) {
        if (error.response) {
          setMessage(error.response.data.message);
        } else {
          setMessage("An error occurred. Please try again.");
        }
      }
    };
  
    
   
    const fetchPromos = async () => {
      try {
        const response = await axios.get('/api/codepromo');
        const filteredPromos = response.data.filter(
          (promo) => promo.codepromo2 === userInfo?.codepromo
        );
        setMyPromos(filteredPromos);
      } catch (error) {
        console.error('Error fetching promos:', error);
      }
    };

    if (isLoggedIn && token) {
      fetchUserInfo();
      fetchPromos();
    }
   
  }, [ token, userInfo?.codepromo]);

 
  
  const handlePromoChange = (e) => setPromoCode(e.target.value);
  const updatePromoCode = async () => {
    try {
      await axios.patch(
        '/api/codepromo',
        {
          coda: userInfo.codepromo,
          codepromo2: promoCode,
        },
        createAuthHeaders()
      );
      await axios.patch(
        '/api/updateCredit',
        { codepromo: promoCode },
        createAuthHeaders()
      );






      // Update the state
      setUserInfo((prev) => ({ ...prev, codepromo: promoCode }));
      setMyPromos((prevPromos) =>
        prevPromos.map((promo) =>
          promo.codepromo2 === userInfo.codepromo
            ? { ...promo, codepromo2: promoCode }
            : promo
        )
      );

      setMessage('Promo code updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating promo code:', error);
      setMessage('Error updating promo code.');
    }
  };
  const addPromoCode = async () => {
    console.log('addPromoCode function triggered');
    console.log('Current promoCode:', promoCode);

    try {
      // Check if the promo code already exists
      console.log('Checking if promo code already exists...');
      const existingResponse = await axios.get(`/api/codepromo?code=${promoCode}`);
      console.log('Existing promo code check response:', existingResponse.data);

      // Check if any promo code in the response matches the entered promoCode
      const promoExists = existingResponse.data.some(promo => promo.codepromo2 === promoCode);

      if (promoExists) {
        console.log(`Promo code "${promoCode}" already exists.`);
        setMessage('This promo code already exists. Please try another one.');
        return; // Exit the function if the code exists
      }

      // If the code is unique, proceed to add it
      console.log(`Promo code "${promoCode}" is unique. Proceeding to add...`);
      const addResponse = await axios.post(
        '/api/codepromo',
        { codepromo2: promoCode },
        createAuthHeaders()
      );
      console.log('Promo code added successfully:', addResponse.data);

      // Update user credit
      console.log('Updating user credit with promo code...');
      const updateCreditResponse = await axios.patch(
        '/api/updateCredit',
        { codepromo: promoCode },
        createAuthHeaders()
      );
      console.log('Credit update response:', updateCreditResponse.data);

      // Update the state
      setUserInfo(prev => ({ ...prev, codepromo: promoCode }));
      console.log('Updated userInfo state:', userInfo);

      // Update promo list state
      setMyPromos(prevPromos =>
        prevPromos.map(promo =>
          promo.codepromo2 === userInfo.codepromo
            ? { ...promo, codepromo2: promoCode }
            : promo
        )
      );
      console.log('Updated myPromos state:', myPromos);

      // Set success message
      setMessage('Promo code added successfully!');
      setIsEditing(false);
      console.log('Promo code addition completed successfully.');
    } catch (error) {
      console.error('Error adding promo code:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        setMessage(error.response.data.message || 'Error adding promo code.');
      } else {
        setMessage('An error occurred. Please try again.');
      }
    }
  };



  const handleEditToggle = () => {
    setPromoCode(userInfo.codepromo);
    setIsEditing((prev) => !prev);
  };
  const handleApplyPromo = async () => {
    await addPromoCode();


  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`/?user=${userInfo.codepromo}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);  // Reset after 2 seconds
  };
  return (
  
      <div className='rrr'>
        <div className="affiliate-page">
          {userInfo ? ( // Check if userInfo is not null
            userInfo.codepromo !== 'empty' ? (
              <div>
                <h2 className="dashboard-title">
                  {language === 'en' 
                    ? `Welcome, ${userInfo.name}!` 
                    : language === 'fr' 
                    ? `Bienvenue, ${userInfo.name}!` 
                    : `مرحبًا, ${userInfo.name}!`}
                </h2>
    
                <div className="dashboard-container">
                  <div className="dashboard-section promo-code-section">
                    <h3><FaTicketAlt /> {language === 'en' ? "Promo Code" : language === 'fr' ? "Code Promo" : "الرمز الترويجي"}</h3>
                    
                    {isEditing ? (
                      <div className="edit-mode">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="promo-input"
                          placeholder={language === 'en' ? "Enter new promo code" : language === 'fr' ? "Entrez un nouveau code promo" : "أدخل رمزًا ترويجيًا جديدًا"}
                        />
                        <div className="button-group">
                          <button onClick={updatePromoCode} className="save-btn">
                            {language === 'en' ? "Save" : language === 'fr' ? "Enregistrer" : "حفظ"}
                          </button>
                          <button onClick={() => setIsEditing(false)} className="cancel-btn">
                            {language === 'en' ? "Cancel" : language === 'fr' ? "Annuler" : "إلغاء"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="view-mode">
                        <p className="promo-label">
                          {language === 'en' ? "/?user=" : language === 'fr' ? "Votre code promo:  " : "رمزك الترويجي:  "} 
                          <span className="promo-code">{  userInfo.codepromo  }</span>
                        </p>
                        <div>
                          <button onClick={copyToClipboard} className={`copy-btn ${copied ? 'copied' : ''}`}>
                            {copied ? <FaCheck /> : <FaClipboard />} {copied ? (language === 'en' ? 'Copied' : language === 'fr' ? 'Copié' : 'تم النسخ') : (language === 'en' ? 'Copy' : language === 'fr' ? 'Copier' : 'نسخ')}
                          </button>
                          <button onClick={handleEditToggle} className="edit-btn">
                            <FaEdit /> {language === 'en' ? "Edit" : language === 'fr' ? "Modifier" : "تعديل"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
    
                  <ul className="promo-list">
                    {myPromos.map((promo) => (
                      <li key={promo._id} className="promo-item">
                        <div className="dashboard-section orders-section">
                          <h3><FaShoppingCart /> {language === 'en' ? "Orders" : language === 'fr' ? "Commandes" : "الطلبات"}</h3>
                          <p>
                            {language === 'en' ? "You have" : language === 'fr' ? "Vous avez" : "لديك"} 
                            <strong> {promo.codeusage} </strong> 
                            {language === 'en' ? "orders using your promo code." : language === 'fr' ? "commandes utilisant votre code promo." : "طلبات تستخدم رمزك الترويجي."}
                          </p>
                        </div>
                        <div className="dashboard-section earnings-section">
                          <h3><FaMoneyBill /> {language === 'en' ? "Earnings" : language === 'fr' ? "Gains" : "الأرباح"}</h3>
                          <p>
                            {language === 'en' ? "You have earned:  " : language === 'fr' ? "Vous avez gagné:  " : "لقد ربحت:  "} 
                            <strong>{promo.earnings}</strong> 
                            {language === 'en' ? "  DH" : language === 'fr' ? "DH" : "   درهم  " }
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="affiliate-intro">
                <h1>{language === 'en' ? "Welcome to Pluton Affiliate" : language === 'fr' ? "Bienvenue chez Pluton Affiliation" : "مرحبًا بك في Pluton Affiliate"}</h1>
                <p>
                  {language === 'en' 
                    ? "Create a promo code and earn " 
                    : language === 'fr' 
                    ? "Créez un code promo et gagnez " 
                    : "أنشئ رمزًا ترويجيًا واربح "}
                  <strong>10%</strong> 
                  {language === 'en' 
                    ? " of every item sold using your code." 
                    : language === 'fr' 
                    ? " sur chaque article vendu avec votre code." 
                    : " من كل عنصر يتم بيعه باستخدام رمزك."}
                </p>
    
                <div className="promo-creation">
                  <label htmlFor="promo-code">
                    {language === 'en' ? "Create Your Promo Code:" : language === 'fr' ? "Créez votre code promo :" : "قم بإنشاء رمز العرض الترويجي الخاص بك:"}
                  </label>
                  <input
                    type="text"
                    id="promo-code"
                    value={promoCode}
                    onChange={handlePromoChange}
                    className="promo-input"
                    placeholder={language === 'en' ? "Enter your promo code" : language === 'fr' ? "Entrez votre code promo" : "أدخل رمزك الترويجي"}
                  />
                  <button onClick={addPromoCode} className="submit-btn">
                    {language === 'en' ? "Submit Promo Code" : language === 'fr' ? "Soumettre le code promo" : "إرسال رمز العرض الترويجي"}
                  </button>
                </div>
              </div>
            )
          ) : (
            <p>{language === 'en' ? "Loading user information..." : language === 'fr' ? "Chargement des informations utilisateur..." : "جاري تحميل معلومات المستخدم..."}</p>
          )}
          {message && <p>{message}</p>}
        </div>
        <Footer />
      </div>
    );
    
  
};

export default AffiliatePage;
