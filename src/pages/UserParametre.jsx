import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Algerie_telecom from "../images/Algerie_telecom.jpg";
import "../Styles/UserDashboard.css";
import "../Styles/UserParametre.css";

const UserParametre = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [settings, setSettings] = useState({
        // Notification Settings
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        signalementUpdates: true,
        promotionalEmails: false,
        
        // Appearance Settings
        theme: "dark",
        fontSize: "medium",
        compactView: false,
        animationsEnabled: true,
        
        // Privacy Settings
        profileVisibility: "private",
        shareLocation: true,
        shareUsageData: false,
        
        // Language Settings
        language: "fr",
        dateFormat: "DD/MM/YYYY",
        
        // Security Settings
        twoFactorAuth: false,
        loginAlerts: true,
        sessionTimeout: 30,
        
        // Support Settings
        autoTicketPriority: "medium",
        preferredContact: "email",
        emergencyContact: "",
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("notifications");
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(currentUser));
        loadUserData();
        loadSettings();
    }, [navigate]);

    const loadUserData = () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setUser(currentUser);
    };

    const loadSettings = () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const savedSettings = JSON.parse(localStorage.getItem(`settings_${currentUser.id}`) || '{}');
        setSettings(prev => ({ ...prev, ...savedSettings }));
    };

    const saveSettings = (newSettings) => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        localStorage.setItem(`settings_${currentUser.id}`, JSON.stringify(newSettings));
        setSettings(newSettings);
    };

    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        saveSettings(newSettings);
        setSuccess("Paramètre mis à jour");
        setTimeout(() => setSuccess(""), 2000);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }
        
        setIsLoading(true);
        
        setTimeout(() => {
            setSuccess("Mot de passe modifié avec succès");
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setIsLoading(false);
            setTimeout(() => setSuccess(""), 2000);
        }, 1000);
    };

    const handleDeleteAccount = () => {
        setIsLoading(true);
        
        setTimeout(() => {
            localStorage.removeItem('currentUser');
            navigate('/login');
        }, 1500);
    };

    const handleResetSettings = () => {
        if (window.confirm("Réinitialiser tous les paramètres par défaut ?")) {
            const defaultSettings = {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,
                signalementUpdates: true,
                promotionalEmails: false,
                theme: "dark",
                fontSize: "medium",
                compactView: false,
                animationsEnabled: true,
                profileVisibility: "private",
                shareLocation: true,
                shareUsageData: false,
                language: "fr",
                dateFormat: "DD/MM/YYYY",
                twoFactorAuth: false,
                loginAlerts: true,
                sessionTimeout: 30,
                autoTicketPriority: "medium",
                preferredContact: "email",
                emergencyContact: "",
            };
            saveSettings(defaultSettings);
            setSettings(defaultSettings);
            setSuccess("Paramètres réinitialisés");
            setTimeout(() => setSuccess(""), 2000);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const tabs = [
        { id: "notifications", icon: "🔔", label: "Notifications" },
        { id: "appearance", icon: "🎨", label: "Apparence" },
        { id: "privacy", icon: "🔒", label: "Confidentialité" },
        { id: "language", icon: "🌐", label: "Langue" },
        { id: "security", icon: "🛡️", label: "Sécurité" },
        { id: "support", icon: "🎫", label: "Support" },
    ];

    const menuItems = [
        { path: "/dashboard", icon: "🏠", label: "Tableau de bord", exact: true },
        { path: "/dashboard/signalements", icon: "📋", label: "Mes Signalements" },
        { path: "/dashboard/notifications", icon: "🔔", label: "Notifications" },
        { path: "/dashboard/speedtests", icon: "⚡", label: "Tests de débit" },
        { path: "/dashboard/assistant", icon: "🤖", label: "Assistant IA" },
        { path: "/dashboard/profile", icon: "👤", label: "Mon Profil" },
        { path: "/dashboard/settings", icon: "⚙️", label: "Paramètres", active: true },
    ];

    if (!user) {
        return (
            <div className="parametre-wrapper">
                <div className="parametre-loading">
                    <div className="loading-spinner"></div>
                    <p>Chargement des paramètres...</p>
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
                    <div className="parametre-wrapper">
                        <div className="parametre-bg-animation">
                            <div className="parametre-ball ball-1"></div>
                            <div className="parametre-ball ball-2"></div>
                            <div className="parametre-ball ball-3"></div>
                        </div>

                        <div className="parametre-main-card">
                            {/* Header */}
                            <div className="parametre-header">
                                <div className="parametre-header-content">
                                    <div className="parametre-logo-wrapper">
                                        <img src={Algerie_telecom} alt="Algérie Télécom" className="parametre-logo" />
                                    </div>
                                    <div className="parametre-header-text">
                                        <h1>Paramètres</h1>
                                        <p>Personnalisez votre expérience NetGuard DZ</p>
                                    </div>
                                </div>
                                <div className="parametre-header-badge">
                                    <span className="badge-dot"></span>
                                    <span>{user.fullName || user.email}</span>
                                </div>
                            </div>

                            {/* Success/Error Messages */}
                            {success && (
                                <div className="parametre-success-toast">
                                    <span>✅</span>
                                    <span>{success}</span>
                                </div>
                            )}
                            {error && (
                                <div className="parametre-error-toast">
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Tabs */}
                            <div className="parametre-tabs">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <span className="tab-icon">{tab.icon}</span>
                                        <span className="tab-label">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="parametre-content">
                                {/* Notifications Tab */}
                                {activeTab === "notifications" && (
                                    <div className="settings-section">
                                        <h3>🔔 Préférences de notifications</h3>
                                        <div className="settings-list">
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Notifications par email</span>
                                                    <span className="setting-desc">Recevez des alertes par email</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.emailNotifications}
                                                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Notifications SMS</span>
                                                    <span className="setting-desc">Recevez des alertes par SMS</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.smsNotifications}
                                                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Notifications push</span>
                                                    <span className="setting-desc">Notifications dans l'application</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.pushNotifications}
                                                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Mises à jour des signalements</span>
                                                    <span className="setting-desc">Suivi de vos demandes</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.signalementUpdates}
                                                        onChange={(e) => handleSettingChange('signalementUpdates', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Offres promotionnelles</span>
                                                    <span className="setting-desc">Recevez nos meilleures offres</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.promotionalEmails}
                                                        onChange={(e) => handleSettingChange('promotionalEmails', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Appearance Tab */}
                                {activeTab === "appearance" && (
                                    <div className="settings-section">
                                        <h3>🎨 Apparence</h3>
                                        <div className="settings-list">
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Thème</span>
                                                    <span className="setting-desc">Choisissez votre thème préféré</span>
                                                </div>
                                                <div className="theme-options">
                                                    <button 
                                                        className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                                                        onClick={() => handleSettingChange('theme', 'dark')}
                                                    >
                                                        🌙 Sombre
                                                    </button>
                                                    <button 
                                                        className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                                                        onClick={() => handleSettingChange('theme', 'light')}
                                                    >
                                                        ☀️ Clair
                                                    </button>
                                                    <button 
                                                        className={`theme-option ${settings.theme === 'system' ? 'active' : ''}`}
                                                        onClick={() => handleSettingChange('theme', 'system')}
                                                    >
                                                        💻 Système
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Taille de police</span>
                                                    <span className="setting-desc">Ajustez la taille du texte</span>
                                                </div>
                                                <div className="font-options">
                                                    <button 
                                                        className={`font-option ${settings.fontSize === 'small' ? 'active' : ''}`}
                                                        onClick={() => handleSettingChange('fontSize', 'small')}
                                                    >
                                                        Petit
                                                    </button>
                                                    <button 
                                                        className={`font-option ${settings.fontSize === 'medium' ? 'active' : ''}`}
                                                        onClick={() => handleSettingChange('fontSize', 'medium')}
                                                    >
                                                        Moyen
                                                    </button>
                                                    <button 
                                                        className={`font-option ${settings.fontSize === 'large' ? 'active' : ''}`}
                                                        onClick={() => handleSettingChange('fontSize', 'large')}
                                                    >
                                                        Grand
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Vue compacte</span>
                                                    <span className="setting-desc">Afficher plus d'informations</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.compactView}
                                                        onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Animations</span>
                                                    <span className="setting-desc">Activer les animations fluides</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.animationsEnabled}
                                                        onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Privacy Tab */}
                                {activeTab === "privacy" && (
                                    <div className="settings-section">
                                        <h3>🔒 Confidentialité</h3>
                                        <div className="settings-list">
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Visibilité du profil</span>
                                                    <span className="setting-desc">Qui peut voir votre profil</span>
                                                </div>
                                                <select 
                                                    value={settings.profileVisibility}
                                                    onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                                                    className="setting-select"
                                                >
                                                    <option value="private">Privé</option>
                                                    <option value="public">Public</option>
                                                    <option value="contacts">Contacts uniquement</option>
                                                </select>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Partager ma position</span>
                                                    <span className="setting-desc">Pour les signalements</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.shareLocation}
                                                        onChange={(e) => handleSettingChange('shareLocation', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Partager les données d'utilisation</span>
                                                    <span className="setting-desc">Aider à améliorer nos services</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.shareUsageData}
                                                        onChange={(e) => handleSettingChange('shareUsageData', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Language Tab */}
                                {activeTab === "language" && (
                                    <div className="settings-section">
                                        <h3>🌐 Langue et région</h3>
                                        <div className="settings-list">
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Langue</span>
                                                    <span className="setting-desc">Choisissez votre langue préférée</span>
                                                </div>
                                                <select 
                                                    value={settings.language}
                                                    onChange={(e) => handleSettingChange('language', e.target.value)}
                                                    className="setting-select"
                                                >
                                                    <option value="fr">Français</option>
                                                    <option value="ar">العربية</option>
                                                    <option value="en">English</option>
                                                </select>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Format de date</span>
                                                    <span className="setting-desc">Affichage des dates</span>
                                                </div>
                                                <select 
                                                    value={settings.dateFormat}
                                                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                                                    className="setting-select"
                                                >
                                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Security Tab */}
                                {activeTab === "security" && (
                                    <div className="settings-section">
                                        <h3>🛡️ Sécurité</h3>
                                        <div className="settings-list">
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Authentification à deux facteurs</span>
                                                    <span className="setting-desc">Sécurisez votre compte</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.twoFactorAuth}
                                                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Alertes de connexion</span>
                                                    <span className="setting-desc">Notification lors d'une nouvelle connexion</span>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.loginAlerts}
                                                        onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Délai d'inactivité</span>
                                                    <span className="setting-desc">Déconnexion automatique (minutes)</span>
                                                </div>
                                                <select 
                                                    value={settings.sessionTimeout}
                                                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                                                    className="setting-select"
                                                >
                                                    <option value="15">15 minutes</option>
                                                    <option value="30">30 minutes</option>
                                                    <option value="60">1 heure</option>
                                                    <option value="120">2 heures</option>
                                                </select>
                                            </div>
                                            <div className="setting-item">
                                                <button 
                                                    className="change-password-btn"
                                                    onClick={() => setShowPasswordModal(true)}
                                                >
                                                    🔑 Changer le mot de passe
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Support Tab */}
                                {activeTab === "support" && (
                                    <div className="settings-section">
                                        <h3>🎫 Support et assistance</h3>
                                        <div className="settings-list">
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Priorité automatique des tickets</span>
                                                    <span className="setting-desc">Priorité par défaut pour vos signalements</span>
                                                </div>
                                                <select 
                                                    value={settings.autoTicketPriority}
                                                    onChange={(e) => handleSettingChange('autoTicketPriority', e.target.value)}
                                                    className="setting-select"
                                                >
                                                    <option value="low">Basse</option>
                                                    <option value="medium">Moyenne</option>
                                                    <option value="high">Haute</option>
                                                </select>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Contact préféré</span>
                                                    <span className="setting-desc">Comment souhaitez-vous être contacté</span>
                                                </div>
                                                <select 
                                                    value={settings.preferredContact}
                                                    onChange={(e) => handleSettingChange('preferredContact', e.target.value)}
                                                    className="setting-select"
                                                >
                                                    <option value="email">Email</option>
                                                    <option value="phone">Téléphone</option>
                                                    <option value="whatsapp">WhatsApp</option>
                                                    <option value="sms">SMS</option>
                                                </select>
                                            </div>
                                            <div className="setting-item">
                                                <div className="setting-info">
                                                    <span className="setting-label">Contact d'urgence</span>
                                                    <span className="setting-desc">Numéro à contacter en cas d'urgence</span>
                                                </div>
                                                <input 
                                                    type="tel"
                                                    value={settings.emergencyContact}
                                                    onChange={(e) => handleSettingChange('emergencyContact', e.target.value)}
                                                    placeholder="05 XX XX XX XX"
                                                    className="setting-input"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="parametre-footer">
                                <div className="footer-actions">
                                    <button className="reset-btn" onClick={handleResetSettings}>
                                        🔄 Réinitialiser les paramètres
                                    </button>
                                    <button className="danger-btn" onClick={() => setShowDeleteModal(true)}>
                                        🗑️ Supprimer mon compte
                                    </button>
                                </div>
                                <div className="footer-info">
                                    <span className="info-icon">ℹ️</span>
                                    <span>Version 2.0.0 - © 2024 NetGuard DZ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔑 Changer le mot de passe</h3>
                            <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>
                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group">
                                <label>Mot de passe actuel</label>
                                <input 
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nouveau mot de passe</label>
                                <input 
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirmer le mot de passe</label>
                                <input 
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-modal-btn" onClick={() => setShowPasswordModal(false)}>Annuler</button>
                                <button type="submit" className="save-modal-btn" disabled={isLoading}>
                                    {isLoading ? "Changement..." : "Changer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content danger-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>⚠️ Supprimer le compte</h3>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="warning-icon">🗑️</div>
                            <p>Êtes-vous sûr de vouloir supprimer votre compte ?</p>
                            <p className="warning-text">Cette action est irréversible. Toutes vos données seront perdues.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-modal-btn" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                            <button className="delete-modal-btn" onClick={handleDeleteAccount} disabled={isLoading}>
                                {isLoading ? "Suppression..." : "Oui, supprimer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserParametre;