import Reset from "../../components/Reset/Reset";
import "./resetlayout.css";
import logo from "../../assets/img/logo.png"

const ResetLayout = ({ history }) => {
  const handleClick = () => {
    window.location.href = '../../login';
  };

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
        login ?
      </p>
    </div>
  );
};

export default ResetLayout;