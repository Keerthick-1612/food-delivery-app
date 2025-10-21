import React from "react";
import { Link } from "react-router-dom";

function Header({ user }) {
  return (
    <header className="hotel-header">
      <div className="hotel-header-content">
        <Link to="/" className="hotel-logo">
          <div className="hotel-logo-icon">
            🏨
          </div>
          <div className="hotel-brand">
            <h1 className="hotel-name">AIT Grand Palace Hotel</h1>
            <p className="hotel-tagline">Luxury Dining Experience</p>
          </div>
        </Link>
        
        <nav className="hotel-nav">
          {user ? (
            <>
              <Link to="/profile" className="hotel-nav-link">
                👤 Profile
              </Link>
              {user.role === "customer" && (
                <>
                  <Link to="/menu" className="hotel-nav-link">
                    🍽️ Menu
                  </Link>
                  <Link to="/orders" className="hotel-nav-link">
                    📋 My Orders
                  </Link>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <Link to="/admin" className="hotel-nav-link">
                    ⚙️ Admin
                  </Link>
                  <Link to="/admin/orders" className="hotel-nav-link">
                    📋 Orders
                  </Link>
                </>
              )}
              <button 
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                className="hotel-nav-link"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hotel-nav-link">
                🔐 Login
              </Link>
              <Link to="/register" className="hotel-nav-link">
                📝 Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
