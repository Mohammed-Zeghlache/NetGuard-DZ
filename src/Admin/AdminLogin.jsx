import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Admin_css/AdminLogin.css"
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (!formData.username || !formData.password) {
      setError("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admins/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username: formData.username, 
          password: formData.password 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Store admin data in localStorage
        localStorage.setItem('currentAdmin', JSON.stringify(data.admin));
        localStorage.setItem('adminToken', data.token); // Store token if provided
        navigate('/admin');
      } else {
        setError(data.message || "Nom d'utilisateur ou mot de passe incorrect");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Erreur de connexion au serveur. Veuillez réessayer.");
      
      // Fallback to localStorage if backend is unavailable
      fallbackAdminLogin();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback function for when backend is unavailable
  const fallbackAdminLogin = () => {
    // Get admins from localStorage
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    
    // Check if admin exists
    const admin = admins.find(
      admin => admin.fullName === formData.username && admin.password === formData.password
    );

    if (admin) {
      const adminData = {
        id: admin.id,
        fullName: admin.fullName,
        username: admin.username,
        role: admin.role
      };
      localStorage.setItem("currentAdmin", JSON.stringify(adminData));
      navigate("/admin");
    } else {
      setError("Nom d'utilisateur ou mot de passe incorrect");
    }
    setIsLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="bg-animation">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-circle bg-circle-4"></div>
      </div>

      <div className="admin-login-card">
        <div className="login-logo-section">
          <div className="logo-wrapper">
            <img src={Algerie_telecom} alt="Algérie Télécom" className="login-logo" />
            <div className="logo-glow"></div>
          </div>
          <h1 className="login-title">
            NetGuard<span className="title-accent">Admin</span>
          </h1>
          <p className="login-subtitle">Portail d'administration</p>
        </div>

        <div className="login-divider">
          <span className="divider-line"></span>
          <span className="divider-icon">🔐</span>
          <span className="divider-line"></span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-input">
            <label className="input-label">
              <span className="label-icon">👤</span>
              Nom d'utilisateur
            </label>
            <div className="input-wrapper">
              <span className="input-icon">👨‍💼</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Votre nom"
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group-input">
            <label className="input-label">
              <span className="label-icon">🔒</span>
              Mot de passe
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔑</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className={`login-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="btn-spinner"></div>
                <span>Connexion...</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <span className="btn-arrow">→</span>
              </>
            )}
          </button>

          <div className="login-footer">
            <div className="security-badge">
              <span className="security-icon">🛡️</span>
              <span>Connexion sécurisée</span>
            </div>
            <div className="signup-redirect">
              <p>Pas de compte ? <Link to="/admin/signup">S'inscrire</Link></p>
            </div>
          </div>
        </form>

        <div className="login-note">
          <p>© 2024 NetGuard DZ</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;