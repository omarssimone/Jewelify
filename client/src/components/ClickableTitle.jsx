import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import "../styles/ClickableTitle.css";

const ClickableTitle = ({ className }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    // Only prompt if not already on home
    if (location.pathname !== "/") {
      setShowConfirm(true);
    }
  };

  const confirmYes = () => {
    setShowConfirm(false);
    navigate('/');
  };

  const confirmNo = () => setShowConfirm(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  };

  return (
    <div className={`clickable-title ${className ? className : ""}`}>
      <h1 onClick={handleClick} onKeyDown={handleKeyDown} className="clickable-title-text brand-title" role="button" tabIndex={0}>JEWELIFY</h1>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p>Are you sure you want to go back to the home page?</p>
            <div className="confirm-actions">
              <button className="btn-yes" onClick={confirmYes}>Yes</button>
              <button className="btn-no" onClick={confirmNo}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClickableTitle;
