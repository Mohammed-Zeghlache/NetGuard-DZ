import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Algerie_telecom from "../images/Algerie_telecom.jpg";
import "../Styles/UserDashboard.css";
import "../Styles/UserProfile.css";

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        wilaya: "",
        commune: "",
        clientCode: "",
        birthDate: "",
        gender: "male"
    });

    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(currentUser));
        loadUserData();
    }, [navigate]);

    const loadUserData = () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Load additional user data from localStorage
        const savedProfile = JSON.parse(localStorage.getItem(`profile_${currentUser.id}`) || '{}');
        
        const userData = {
            id: currentUser.id,
            fullName: currentUser.fullName || "",
            email: currentUser.email || "",
            phone: currentUser.phone || savedProfile.phone || "",
            address: savedProfile.address || "",
            wilaya: savedProfile.wilaya || "",
            commune: savedProfile.commune || "",
            clientCode: savedProfile.clientCode || currentUser.clientCode || "",
            birthDate: savedProfile.birthDate || "",
            gender: savedProfile.gender || "male",
            createdAt: currentUser.createdAt || new Date().toISOString(),
            lastLogin: currentUser.lastLogin || new Date().toISOString()
        };
        
        setUser(userData);
        setFormData(userData);
    };

    const saveUserData = (updatedData) => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Update current user
        const updatedCurrentUser = {
            ...currentUser,
            fullName: updatedData.fullName,
            email: updatedData.email,
            phone: updatedData.phone
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
        
        // Save profile data separately
        const profileData = {
            address: updatedData.address,
            wilaya: updatedData.wilaya,
            commune: updatedData.commune,
            clientCode: updatedData.clientCode,
            birthDate: updatedData.birthDate,
            gender: updatedData.gender
        };
        localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(profileData));
        
        // Update users list
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(u => 
            u.id === currentUser.id ? { ...u, ...updatedCurrentUser } : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        setUser(updatedData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        // Validation
        if (!formData.fullName.trim()) {
            setError("Le nom complet est requis");
            setIsLoading(false);
            return;
        }
        
        if (!formData.email.trim()) {
            setError("L'email est requis");
            setIsLoading(false);
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Email invalide");
            setIsLoading(false);
            return;
        }
        
        if (formData.phone && !/^(05|06|07)[0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
            setError("Numéro de téléphone invalide");
            setIsLoading(false);
            return;
        }
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        saveUserData(formData);
        setIsEditing(false);
        setIsLoading(false);
        setSuccess("Profil mis à jour avec succès !");
        
        setTimeout(() => setSuccess(""), 3000);
    };

    const handleCancel = () => {
        setFormData(user);
        setIsEditing(false);
        setError("");
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Non renseigné";
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    };

    const menuItems = [
        { path: "/dashboard", icon: "🏠", label: "Tableau de bord", exact: true },
        { path: "/dashboard/signalements", icon: "📋", label: "Mes Signalements" },
        { path: "/dashboard/notifications", icon: "🔔", label: "Notifications" },
        { path: "/dashboard/speedtests", icon: "⚡", label: "Tests de débit" },
        { path: "/dashboard/assistant", icon: "🤖", label: "Assistant IA" },
        { path: "/dashboard/profile", icon: "👤", label: "Mon Profil", active: true },
        { path: "/dashboard/settings", icon: "⚙️", label: "Paramètres" },
    ];

    if (!user) {
        return (
            <div className="user-profile-wrapper">
                <div className="profile-loading">
                    <div className="loading-spinner"></div>
                    <p>Chargement du profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`user-dashboard ${sidebarCollapsed ? 'collapsed' : ''}`}>
            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <div className="hamburger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>

            {/* Sidebar Toggle Button */}
            <button className="sidebar-toggle-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                {sidebarCollapsed ? "→" : "←"}
            </button>

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <img src={Algerie_telecom} alt="Logo" className="sidebar-logo" />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="logo-text">
                                <span className="logo-main">NetGuard</span>
                                <span className="logo-sub">DZ</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="user-info-sidebar">
                    <div className="user-avatar">
                        {user.fullName?.charAt(0).toUpperCase() || "U"}
                        <div className="user-status"></div>
                    </div>
                    {!sidebarCollapsed && (
                        <div className="user-details">
                            <h4>{user.fullName}</h4>
                            <p>{user.email}</p>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${item.active ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span>
                        {!sidebarCollapsed && <span className="nav-label">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>}

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-content">
                    <div className="user-profile-wrapper">
                        <div className="profile-bg-animation">
                            <div className="profile-ball ball-1"></div>
                            <div className="profile-ball ball-2"></div>
                            <div className="profile-ball ball-3"></div>
                        </div>

                        <div className="profile-main-card">
                            {/* Header */}
                            <div className="profile-header">
                                <div className="profile-header-content">
                                    <div className="profile-logo-wrapper">
                                        <img src={Algerie_telecom} alt="Algérie Télécom" className="profile-logo" />
                                    </div>
                                    <div className="profile-header-text">
                                        <h1>Mon Profil</h1>
                                        <p>Gérez vos informations personnelles</p>
                                    </div>
                                </div>
                                <div className="profile-header-badge">
                                    <span className="badge-dot"></span>
                                    <span>Connecté</span>
                                </div>
                            </div>

                            {/* Success/Error Messages */}
                            {success && (
                                <div className="profile-success-toast">
                                    <span>✅</span>
                                    <span>{success}</span>
                                </div>
                            )}
                            {error && (
                                <div className="profile-error-toast">
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Profile Content */}
                            <div className="profile-body">
                                {/* Avatar Section */}
                                <div className="profile-avatar-section">
                                    <div className="profile-avatar">
                                        <div className="avatar-initial">{getInitials(user.fullName)}</div>
                                        <div className="avatar-status"></div>
                                    </div>
                                    <h3 className="avatar-name">{user.fullName}</h3>
                                    <p className="avatar-role">Client Algérie Télécom</p>
                                    <div className="avatar-stats">
                                        <div className="stat-item">
                                            <span className="stat-value">{formatDate(user.createdAt)}</span>
                                            <span className="stat-label">Membre depuis</span>
                                        </div>
                                        <div className="stat-divider"></div>
                                        <div className="stat-item">
                                            <span className="stat-value">{formatDate(user.lastLogin)}</span>
                                            <span className="stat-label">Dernière connexion</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="profile-info-section">
                                    <div className="section-header">
                                        <h2>📋 Informations personnelles</h2>
                                        {!isEditing && (
                                            <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                                                    <path d="M4 20h16" />
                                                </svg>
                                                Modifier
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <form onSubmit={handleSubmit} className="profile-form">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Nom complet *</label>
                                                    <div className="input-wrapper">
                                                        <span className="input-icon">👤</span>
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleInputChange}
                                                            placeholder="Votre nom complet"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Email *</label>
                                                    <div className="input-wrapper">
                                                        <span className="input-icon">📧</span>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            placeholder="votre@email.com"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Téléphone</label>
                                                    <div className="input-wrapper">
                                                        <span className="input-icon">📱</span>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            placeholder="05 XX XX XX XX"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Code client</label>
                                                    <div className="input-wrapper">
                                                        <span className="input-icon">🆔</span>
                                                        <input
                                                            type="text"
                                                            name="clientCode"
                                                            value={formData.clientCode}
                                                            onChange={handleInputChange}
                                                            placeholder="Ex: AT123456789"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Date de naissance</label>
                                                    <div className="input-wrapper">
                                                        <span className="input-icon">🎂</span>
                                                        <input
                                                            type="date"
                                                            name="birthDate"
                                                            value={formData.birthDate}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Genre</label>
                                                    <div className="gender-group">
                                                        <label className="gender-option">
                                                            <input
                                                                type="radio"
                                                                name="gender"
                                                                value="male"
                                                                checked={formData.gender === 'male'}
                                                                onChange={handleInputChange}
                                                            />
                                                            <span>👨 Homme</span>
                                                        </label>
                                                        <label className="gender-option">
                                                            <input
                                                                type="radio"
                                                                name="gender"
                                                                value="female"
                                                                checked={formData.gender === 'female'}
                                                                onChange={handleInputChange}
                                                            />
                                                            <span>👩 Femme</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Adresse</label>
                                                <div className="input-wrapper">
                                                    <span className="input-icon">📍</span>
                                                    <textarea
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        rows="2"
                                                        placeholder="Votre adresse complète"
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Wilaya</label>
                                                    <div className="input-wrapper">
                                                        <span className="input-icon">🏙️</span>
                                                        <input
                                                            type="text"
                                                            name="wilaya"
                                                            value={formData.wilaya}
                                                            onChange={handleInputChange}
                                                            placeholder="Votre wilaya"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Commune</label>
                                                    <div className="input-wrapper">
                                                        <span className="input-icon">🏘️</span>
                                                        <input
                                                            type="text"
                                                            name="commune"
                                                            value={formData.commune}
                                                            onChange={handleInputChange}
                                                            placeholder="Votre commune"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-actions">
                                                <button type="button" className="cancel-btn" onClick={handleCancel}>
                                                    Annuler
                                                </button>
                                                <button type="submit" className="save-btn" disabled={isLoading}>
                                                    {isLoading ? (
                                                        <>
                                                            <div className="btn-spinner"></div>
                                                            Enregistrement...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                            Enregistrer
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="profile-display">
                                            <div className="info-grid">
                                                <div className="info-card">
                                                    <div className="info-label">
                                                        <span>📧</span>
                                                        <span>Email</span>
                                                    </div>
                                                    <div className="info-value">{user.email}</div>
                                                </div>
                                                <div className="info-card">
                                                    <div className="info-label">
                                                        <span>📱</span>
                                                        <span>Téléphone</span>
                                                    </div>
                                                    <div className="info-value">{user.phone || "Non renseigné"}</div>
                                                </div>
                                                <div className="info-card">
                                                    <div className="info-label">
                                                        <span>🆔</span>
                                                        <span>Code client</span>
                                                    </div>
                                                    <div className="info-value">{user.clientCode || "Non renseigné"}</div>
                                                </div>
                                                <div className="info-card">
                                                    <div className="info-label">
                                                        <span>🎂</span>
                                                        <span>Date de naissance</span>
                                                    </div>
                                                    <div className="info-value">{user.birthDate ? new Date(user.birthDate).toLocaleDateString('fr-FR') : "Non renseignée"}</div>
                                                </div>
                                                <div className="info-card">
                                                    <div className="info-label">
                                                        <span>👤</span>
                                                        <span>Genre</span>
                                                    </div>
                                                    <div className="info-value">{user.gender === 'male' ? 'Homme' : user.gender === 'female' ? 'Femme' : 'Non renseigné'}</div>
                                                </div>
                                                <div className="info-card">
                                                    <div className="info-label">
                                                        <span>📍</span>
                                                        <span>Adresse</span>
                                                    </div>
                                                    <div className="info-value">{user.address || "Non renseignée"}</div>
                                                </div>
                                                <div className="info-card">
                                                    <div className="info-label">
                                                        <span>🏙️</span>
                                                        <span>Wilaya</span>
                                                    </div>
                                                    <div className="info-value">{user.wilaya || "Non renseignée"}</div>
                                                </div>
                                                <div className="info-card">
                                                    <div className="info-label">
                                                        <span>🏘️</span>
                                                        <span>Commune</span>
                                                    </div>
                                                    <div className="info-value">{user.commune || "Non renseignée"}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="profile-footer">
                                <div className="footer-badges">
                                    <span className="footer-badge">🔒 Données sécurisées</span>
                                    <span className="footer-badge">✓ Informations vérifiées</span>
                                    <span className="footer-badge">🇩🇿 Algérie Télécom</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfile;