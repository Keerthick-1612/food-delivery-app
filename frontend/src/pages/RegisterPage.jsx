import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/authApi";

function RegisterPage({ setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setLoading(true);
      const { data } = await registerUser({ name, email, password });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-card animate-fade-in" style={{ maxWidth: "450px", width: "100%" }}>
        <div className="auth-header">
          <h1 className="auth-title">🏨 Join AIT Grand Palace</h1>
          <p className="auth-subtitle">Create your luxury dining account</p>
        </div>
        
        <div className="auth-body">
          {error && (
            <div className="form-error" style={{ 
              background: "var(--danger-color)", 
              color: "white", 
              padding: "var(--spacing-3)", 
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--spacing-4)",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
            
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
                placeholder="Create a password (min 6 characters)"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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
                  Creating Account...
                </>
              ) : (
                "✨ Create Account"
              )}
            </button>
          </form>
        </div>
        
        <div className="auth-footer">
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ 
              color: "var(--hotel-gold)", 
              fontWeight: "600",
              textDecoration: "none"
            }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;



