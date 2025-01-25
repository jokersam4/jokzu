import { useContext, useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdVisibility } from "react-icons/md";
import { MdVisibilityOff } from "react-icons/md";
import { isEmpty, isEmail } from "../helper/validate";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Input from "../input/Input";
import "./Login.css";
import { AuthContext } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode"; // Changed to named import
import { GoogleLogin } from '@react-oauth/google';
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
const initialState = {
  name: "",
  password: "",
};


const Login2 = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(initialState);
  const { email, password } = data;
  const { dispatch } = useContext(AuthContext);
  const { user, token, isLoggedIn , language} = useContext(AuthContext);
  const location = useLocation();
    const [userParam, setUserParam] = useState('');
    useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      const user = queryParams.get('user'); // Get the 'user' parameter from the URL
      console.log("sssssssssssss" +userParam)
      if (user) {
        setUserParam(user); 
         // Set affiliate to user if it's not null
      } else {
        setUserParam('');  // Return an empty string if user is null
      }
    }, [location.search]);
    useEffect(() => {
        if (userParam) {
          console.log("Uszszszsz:", userParam);
        }
      }, [userParam]);
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    const token = localStorage.getItem("_appToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem("_appToken");
        } else {
          dispatch({ type: "SIGNING" });
          dispatch({ type: "GET_USER", payload: decodedToken });
        }
      } catch (error) {
        console.error("Invalid token");
        localStorage.removeItem("_appToken");
      }
    }
  }, [dispatch]);
  
  
  
  
  
  
  
  
  
  

  
  useEffect(() => {
    if (token) {
      const getUser = async () => {
        try {
          dispatch({ type: "SIGNING" });
          const res = await axios.get("/api/auth/user", {
            headers: { Authorization: token },
          }, { withCredentials: true });
          dispatch({ type: "GET_USER", payload: res.data });
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
      getUser();
    }
  }, [dispatch, token]);
  const handleClick = () => {
    setVisible(!visible);
  };

 
  


  useEffect(() => {
    const token = localStorage.getItem("_appToken");
    
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem("_appToken");
        } else {
          dispatch({ type: "SIGNING" });
          dispatch({ type: "GET_USER", payload: decodedToken });
        }
      } catch (error) {
        console.error("Invalid token");
        localStorage.removeItem("_appToken");
      }
    }
  }, [dispatch]);
 const login = async (e) => {

    e.preventDefault();
  
    // Check fields
    if (isEmpty(email) || isEmpty(password)) {
      return toast("Please fill in all fields.", {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    }
    
    // Check email
    if (!isEmail(email)) {
      return toast("Please enter a valid email address.", {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    }
    
    try {
      // Send login request
      const res = await axios.post("/api/auth/signing", { email, password }, { withCredentials: true });
      const token = res.data.token;
      console.log("Token:", token);
      // Save token to localStorage
      localStorage.setItem("_appToken", token);
   //   Cookies.set("_appToken", token, { expires: 7, path: "" });
      // Decode token to retrieve user information
      const decodedToken = jwtDecode(token);
      const { email: userEmail, name: userName } = decodedToken; // Assuming token has these fields
  
      console.log("Decoded Token:", decodedToken);
  
      // Dispatch user information
      dispatch({ type: "SIGNING" });
      dispatch({ type: "GET_USER", payload: { email: userEmail, name: userName } });
      
      // Redirect after login
      window.location.href = `../?user=${userParam}`;
    } catch (err) {
      // Show error message
      toast(err.response?.data?.msg || "An error occurred. Please try again.", {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
      console.error("Login Error:", err);
    }
  };
  const googleSuccess = async (response) => {
    console.log("Google Response:", response);
  
    const tokenId = response?.credential;
    
    try {
      const decodedToken = jwtDecode(tokenId);
      const res = await axios.post("/api/auth/google_signing", { tokenId }, { withCredentials: true });
      
      localStorage.setItem("_appToken", tokenId);
      dispatch({ type: "SIGNING" });
    

      const { email, name } = decodedToken;
      console.log("User Email:", email);
      console.log("User Name:", name);
      const userData = decodedToken;
      dispatch({ type: "GET_USER", payload: userData });
      

      await fetch("/api/auth/google_signing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tokenId: tokenId })
      });

      console.log("Token:", tokenId);
      localStorage.setItem("_appToken", tokenId);
      dispatch({ type: "SIGNING" });
      window.location.href = `../?user=${userParam}`;
      
    } catch (err) {
      toast(err.response.data.msg, {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
      console.error("Error:", err);
    }
  };

  const googleError = (err) => {
    console.log("Google sign-in error:", err);
    toast("There was an error signing in, please try again later.", {
      className: "toast-failed",
      bodyClassName: "toast-failed",
    });
  };

  return (
    <>
    <ToastContainer />
    <form className="login" onSubmit={login}>
      <Input
        type="email"
        text={language === 'en' ? "Email" : language === 'fr' ? "E-mail" : "البريد الإلكتروني"}
        name="email"
        handleChange={handleChange}
      />
      <Input
        name="password"
        type={visible ? "text" : "password"}
        icon={visible ? <MdVisibility /> : <MdVisibilityOff />}
        text={language === 'en' ? "Password" : language === 'fr' ? "Mot de passe" : "كلمة المرور"}
        handleClick={handleClick}
        handleChange={handleChange}
      />
      <div className="login_btn">
        <button className="login_btn9" type="submit">
          {language === 'en' ? "Login" : language === 'fr' ? "Connexion" : "تسجيل الدخول"}
        </button>
        <div className="googlebtn">
          <GoogleLogin
            clientId={process.env.REACT_APP_G_CLIENT_ID}
            render={(renderProps) => (
              <button
                className="btn-alt"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >
                {language === 'en' ? "Sign in" : language === 'fr' ? "Se connecter" : "تسجيل الدخول"} <FcGoogle />
              </button>
            )}
            cookiePolicy={"single_host_origin"}
            onSuccess={(response) => googleSuccess(response)}
            onFailure={googleError}
          />
        </div>
      </div>
    </form>
  </>
  
  );
};

export default Login2;
