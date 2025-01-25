import Reset from "../../components/Reset/Reset";
import "./resetlayout.css";
import logo from "../../assets/img/logo.png"
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const ResetLayout = ({ history }) => {
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
  const handleClick = () => {
    window.location.href = `../../login/?user=${userParam}`;
  };
  const { user , language} = useContext(AuthContext);
  return (
    <div className="authlayout">
      {/* logo */}
      <div className="authlayout_logo">
        <img src={logo} alt="logo" />
      </div>
      {/* form */}
      <Reset />
      {/* actions */}
      <p className="reset_p" onClick={handleClick}>
  {language === 'en' 
    ? "Login?" 
    : language === 'fr' 
    ? "Connexion ?" 
    : "تسجيل الدخول؟"}
</p>

    </div>
  );
};

export default ResetLayout;