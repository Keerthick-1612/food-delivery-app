import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/authApi";

function LoginPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { data } = await loginUser({ email, password });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <h1 className="auth-title">🏨 Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your AIT Grand Chola account</p>
        </div>
        
        <div className="auth-body">
          {error && (
            <div className="form-error" style={{ 
              background: "#dc2626", 
              color: "white", 
              padding: "var(--spacing-3)", 
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--spacing-4)",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: "var(--spacing-2)" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing In...
                </>
              ) : (
                "🔐 Sign In"
              )}
            </button>
          </form>
        </div>
        
        <div className="auth-footer">
          <p style={{ margin: 0, color: "#64748b" }}>
            New to Grand Palace Hotel?{" "}
            <Link to="/register" style={{ 
              color: "#fbbf24", 
              fontWeight: "600",
              textDecoration: "none"
            }}>
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
