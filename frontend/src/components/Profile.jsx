import React from "react";
import { Link } from "react-router-dom";

function Profile({ user }) {
  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return "👑";
      case "customer": return "👤";
      default: return "👤";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "#7f1d1d";
      case "customer": return "#fbbf24";
      default: return "#6b7280";
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">👤 Your Profile</h1>
        <p className="page-subtitle">Welcome to Grand Palace Hotel's luxury dining experience</p>
      </div>

      <div className="card animate-fade-in" style={{ maxWidth: "800px", width: "100%", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)" }}>
        <div className="card-header">
          <div className="flex items-center gap-4">
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${getRoleColor(user.role)} 0%, #fbbf24 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--font-size-4xl)",
              color: "white",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              border: "4px solid #fef7ed"
            }}>
              {getRoleIcon(user.role)}
            </div>
            <div>
              <h2 style={{ margin: 0, color: "var(--text-primary)", fontSize: "var(--font-size-2xl)" }}>
                Welcome, {user.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span 
                  className="badge"
                  style={{ 
                    background: getRoleColor(user.role),
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    padding: "var(--spacing-2) var(--spacing-4)"
                  }}
                >
                  {user.role === "admin" ? "🏨 Hotel Administrator" : "🍽️ Valued Guest"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div style={{ display: "grid", gap: "var(--spacing-8)" }}>
            <div>
              <h3 style={{ 
                margin: "0 0 var(--spacing-4) 0", 
                color: "#7f1d1d",
                fontSize: "var(--font-size-xl)",
                borderBottom: "2px solid #fbbf24",
                paddingBottom: "var(--spacing-2)"
              }}>
                📧 Account Information
              </h3>
              <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
                <div>
                  <label style={{ 
                    display: "block", 
                    fontSize: "var(--font-size-sm)", 
                    fontWeight: "600", 
                    color: "#7f1d1d",
                    marginBottom: "var(--spacing-1)"
                  }}>
                    Full Name
                  </label>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "var(--font-size-lg)", 
                    color: "var(--text-primary)",
                    fontWeight: "500"
                  }}>
                    {user.name}
                  </p>
                </div>
                
                <div>
                  <label style={{ 
                    display: "block", 
                    fontSize: "var(--font-size-sm)", 
                    fontWeight: "600", 
                    color: "#7f1d1d",
                    marginBottom: "var(--spacing-1)"
                  }}>
                    Email Address
                  </label>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "var(--font-size-lg)", 
                    color: "var(--text-primary)",
                    fontWeight: "500"
                  }}>
                    {user.email}
                  </p>
                </div>
                
                <div>
                  <label style={{ 
                    display: "block", 
                    fontSize: "var(--font-size-sm)", 
                    fontWeight: "600", 
                    color: "#7f1d1d",
                    marginBottom: "var(--spacing-1)"
                  }}>
                    Account Type
                  </label>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "var(--font-size-lg)", 
                    color: "var(--text-primary)",
                    fontWeight: "500"
                  }}>
                    {user.role === "admin" ? "Hotel Administrator" : "Valued Guest"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ 
                margin: "0 0 var(--spacing-4) 0", 
                color: "#7f1d1d",
                fontSize: "var(--font-size-xl)",
                borderBottom: "2px solid #fbbf24",
                paddingBottom: "var(--spacing-2)"
              }}>
                🚀 Quick Actions
              </h3>
              <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                {user.role === "customer" && (
                  <Link 
                    to="/menu" 
                    className="btn btn-primary btn-lg"
                    style={{ 
                      textDecoration: "none",
                      justifyContent: "flex-start",
                      padding: "var(--spacing-4)",
                      background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
                    }}
                  >
                    🍽️ Browse Our Menu
                  </Link>
                )}
                
                {user.role === "admin" && (
                  <>
                    <Link 
                      to="/admin" 
                      className="btn btn-primary btn-lg"
                      style={{ 
                        textDecoration: "none",
                        justifyContent: "flex-start",
                        padding: "var(--spacing-4)",
                        background: "linear-gradient(135deg, #7f1d1d 0%, #1e40af 100%)"
                      }}
                    >
                      ⚙️ Hotel Management
                    </Link>
                    <Link 
                      to="/admin/orders" 
                      className="btn btn-secondary btn-lg"
                      style={{ 
                        textDecoration: "none",
                        justifyContent: "flex-start",
                        padding: "var(--spacing-4)",
                        background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
                      }}
                    >
                      📋 Order Management
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)"
          }}>
            <span>✨ Grand Palace Hotel Member</span>
            <span>🏨 Luxury Dining Experience</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
