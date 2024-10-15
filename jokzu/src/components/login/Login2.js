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

const initialState = {
  name: "",
  password: "",
};


const Login2 = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(initialState);
  const { email, password } = data;
  const { dispatch } = useContext(AuthContext);
  const { user, token, isLoggedIn } = useContext(AuthContext);
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
    const _appToken = localStorage.getItem("_appToken");
    if (_appToken) {
      const getToken = async () => {
        try {
          const res = await axios.post("/api/auth/access", null);
          dispatch({ type: "GET_TOKEN", payload: res.data.ac_token });
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      };
      getToken();
    }
  }, [dispatch]);
  
  useEffect(() => {
    if (token) {
      const getUser = async () => {
        try {
          dispatch({ type: "SIGNING" });
          const res = await axios.get("/api/auth/user", {
            headers: { Authorization: token },
          });
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

  const login = async (e) => {
    e.preventDefault();
    // check fields
    if (isEmpty(email) || isEmpty(password))
      return toast("Please fill in all fields.", {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    // check email
    if (!isEmail(email))
      return toast("Please enter a valid email address.", {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    try {
      const res = await axios.post("/api/auth/signing", { email, password });
      const token = res.data.token;
      localStorage.setItem("_appToken", token);
      dispatch({ type: "SIGNING" });
  
      // Retrieve user information from decoded token or response data
      const decodedToken = jwtDecode(token);
      const { email: userEmail, name: userName } = decodedToken; // Assuming your token contains email and name fields
  
      // Log user email and name
  
      console.log("token Name:", decodedToken);
  
      // Optionally, you can dispatch the user data to your context if needed
      dispatch({ type: "GET_USER", payload: { email: userEmail, name: userName } });
  
      // Redirect or perform any additional actions after successful login
      // Example: redirect to home page
      window.location.href = '../';
    } catch (err) {
      toast(err.response.data.msg, {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    }
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

  const googleSuccess = async (response) => {
    console.log("Google Response:", response);
  
    const tokenId = response?.credential;
    
    try {
      const decodedToken = jwtDecode(tokenId);
      const res = await axios.post("/api/auth/google_signing", { tokenId });
      
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
      window.location.href = '../';
      
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
          text="Email"
          name="email"
          handleChange={handleChange}
        />
        <Input
          name="password"
          type={visible ? "text" : "password"}
          icon={visible ? <MdVisibility /> : <MdVisibilityOff />}
          text="Password"
          handleClick={handleClick}
          handleChange={handleChange}
        />
        <div className="login_btn">
          <button type="submit">login</button>
          <GoogleLogin
          className="googlebtn"
            clientId={process.env.REACT_APP_G_CLIENT_ID}
            render={(renderProps) => (
              <button
                className="btn-alt"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >
                sign in <FcGoogle />
              </button>
            )}
            cookiePolicy={"single_host_origin"}
            onSuccess={(response) => googleSuccess(response)}
            onFailure={googleError}
          />
        </div>
      </form>
    </>
  );
};

export default Login2;
