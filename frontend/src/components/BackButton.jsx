import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function BackButton({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide back button on login and register pages
  const hideOnPages = ["/login", "/register"];
  if (hideOnPages.includes(location.pathname)) {
    return null;
  }

  const handleBackClick = () => {
    // If we're on the profile page, logout instead of going back
    if (location.pathname === "/profile") {
      if (onLogout) {
        onLogout();
      }
      return;
    }

    // For other pages, go back in history
    navigate(-1);
  };

  const isProfilePage = location.pathname === "/profile";

  return (
    <button
      onClick={handleBackClick}
      className={`back-button ${isProfilePage ? 'logout' : ''}`}
      title={isProfilePage ? "Sign Out" : "Go Back"}
    >
      {isProfilePage ? (
        <>
          🚪 Exit
        </>
      ) : (
        <>
          ← Back
        </>
      )}
    </button>
  );
}

export default BackButton;
