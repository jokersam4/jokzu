import Input from "../input/Input";
import { isEmpty, isEmail } from "../helper/validate";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useState } from "react";
import './F.css' ;
import { AuthContext } from "../../context/AuthContext";
const Forgot = () => {
  const [email, setEmail] = useState("");
  const { user , language} = useContext(AuthContext);
  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleReset = () => {
    Array.from(document.querySelectorAll("input")).forEach(
      (input) => (input.value = "")
    );
    setEmail({ email: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // check fields
    if (isEmpty(email))
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
      await axios.post("/api/auth/forgot_pass", { email });
      handleReset();
      return toast("Please check your email 📧", {
        className: "toast-success",
        bodyClassName: "toast-success",
      });
    } catch (err) {
      toast(err.response.data.msg, {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          text="Email"
          name="email"
          handleChange={handleChange}
        />
        <div className="login_btn66">
        <button type="submit">
  {language === 'en' ? "Send" : language === 'fr' ? "Envoyer" : "إرسال"}
</button>

        </div>
      </form>
    </>
  );
};

export default Forgot;