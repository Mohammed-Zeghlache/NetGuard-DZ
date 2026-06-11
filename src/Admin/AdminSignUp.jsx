import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Admin_css/AdminSignUp.css"
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const AdminSignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Le nom complet est requis";
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Le nom doit contenir au moins 3 caractères";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 4) {
      newErrors.password = "Le mot de passe doit contenir au moins 4 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/admins/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          fullName: formData.fullName, 
          password: formData.password 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Store admin data in localStorage
        localStorage.setItem('currentAdmin', JSON.stringify(data.admin));
        localStorage.setItem('adminToken', data.token); // Store token if provided
        
        setTimeout(() => {
          navigate("/admin");
        }, 500);
      } else {
        setErrors({ general: data.message || "Erreur lors de l'inscription. Veuillez réessayer." });
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Admin signup error:", err);
      setErrors({ general: "Erreur de connexion au serveur. Veuillez réessayer." });
      
      // Fallback to localStorage if backend is unavailable
      fallbackAdminSignup();
    }
  };

  // Fallback function for when backend is unavailable
  const fallbackAdminSignup = () => {
    // Check if admin already exists (by fullName)
    const existingAdmins = JSON.parse(localStorage.getItem('admins') || '[]');
    if (existingAdmins.some(admin => admin.fullName === formData.fullName)) {
      setErrors({ fullName: "Ce nom d'utilisateur existe déjà" });
      setIsLoading(false);
      return;
    }

    // Create new admin account
    const newAdmin = {
      id: Date.now(),
      fullName: formData.fullName,
      username: formData.fullName,
      password: formData.password,
      role: "admin",
      createdAt: new Date().toISOString()
    };

    existingAdmins.push(newAdmin);
    localStorage.setItem('admins', JSON.stringify(existingAdmins));

    // Auto login
    const adminData = {
      id: newAdmin.id,
      fullName: newAdmin.fullName,
      username: newAdmin.username,
      role: newAdmin.role
    };
    localStorage.setItem("currentAdmin", JSON.stringify(adminData));

    setTimeout(() => {
      navigate("/admin");
    }, 500);
  };

  return (
    <div className="admin-signup-container">
      <div className="bg-animation">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-circle bg-circle-4"></div>
      </div>

      <div className="admin-signup-card">
        <div className="signup-header">
          <Link to="/admin/login" className="back-link">
            ← Retour
          </Link>
          <div className="logo-wrapper">
            <img src={Algerie_telecom} alt="Algérie Télécom" className="signup-logo" />
            <div className="logo-glow"></div>
          </div>
          <h1 className="signup-title">
            Inscription<span className="title-accent"> Admin</span>
          </h1>
          <p className="signup-subtitle">Créez votre compte administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* General Error Message */}
          {errors.general && (
            <div className="error-message general-error">
              <span className="error-icon">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="form-group-input">
            <label className="input-label">
              <span className="label-icon">👤</span>
              Nom complet
            </label>
            <div className="input-wrapper">
              <span className="input-icon">📝</span>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Votre nom complet"
                autoFocus
                disabled={isLoading}
              />
            </div>
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          {/* Password */}
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
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group-input">
            <label className="input-label">
              <span className="label-icon">✅</span>
              Confirmer mot de passe
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔄</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className={`signup-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="btn-spinner"></div>
                <span>Inscription...</span>
              </>
            ) : (
              <>
                <span>S'inscrire</span>
                <span className="btn-arrow">→</span>
              </>
            )}
          </button>

          <div className="login-link">
            <p>Déjà un compte ? <Link to="/admin/login">Se connecter</Link></p>
          </div>
        </form>

        <div className="signup-footer">
          <div className="security-badge">
            <span className="security-icon">🛡️</span>
            <span>Connexion sécurisée</span>
          </div>
          <p>© 2024 NetGuard DZ</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignUp;