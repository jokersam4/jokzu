import { useLocation, useParams } from "react-router-dom";
import "./activatelayout.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

const ActivateLayout = ({ history }) => {
  const { activation_token } = useParams();
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
  const { user , language} = useContext(AuthContext);
  useEffect(() => {
    // check token
    if (activation_token) {
      const activateUser = async () => {
        try {
          const res = await axios.post("/api/auth/activation", {
            activation_token,
          });
          toast(res.data.msg, {
            className: "toast-success",
            bodyClassName: "toast-success",
          });
        } catch (err) {
          console.log(err);
          toast(err.response.data.msg, {
            className: "toast-failed",
            bodyClassName: "toast-failed",
          });
        }
      };
      activateUser();
    }
  }, [activation_token]);

  const handleClick = () => {
    window.location.href = `../../../../login/?user=${userParam}`;
  };

  return (
    <div className="activate">
      <ToastContainer />
     <p>
  {language === 'en' 
    ? "Ready to login? 👉🏻" 
    : language === 'fr' 
    ? "Prêt à vous connecter ? 👉🏻" 
    : "جاهز لتسجيل الدخول؟"} 
   <span onClick={handleClick}>
    {language === 'en' ? "Here" : language === 'fr' ? "Ici" : "👈🏻هنا"}
  </span>
</p>
    </div>
  );
};

export default ActivateLayout;