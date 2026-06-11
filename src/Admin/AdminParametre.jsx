import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Admin_css/AdminDashboard.css";
import "../Admin_css/AdminParametre.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const AdminParametre = () => {
  const [activeSection, setActiveSection] = useState("general");
  const [saveStatus, setSaveStatus] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: "Algérie Télécom - Monitoring",
      siteDescription: "Plateforme de surveillance des pannes et infrastructures",
      adminEmail: "admin@algerietelecom.dz",
      supportEmail: "support@algerietelecom.dz",
      phoneNumber: "+213 21 XX XX XX",
      timezone: "Africa/Algiers",
      dateFormat: "DD/MM/YYYY",
      language: "fr"
    },
    notification: {
      emailAlerts: true,
      smsAlerts: false,
      criticalOnly: true,
      alertEmail: "tech@algerietelecom.dz",
      alertPhone: "+213 55 XX XX XX",
      notificationInterval: 5,
      soundEnabled: true,
      desktopNotifications: true
    },
    monitoring: {
      refreshInterval: 5,
      autoRefresh: true,
      mapDefaultZoom: 6,
      showCircles: true,
      showClusters: false,
      maxMarkers: 200,
      criticalThreshold: 5000,
      majorThreshold: 2000
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      ipWhitelist: "",
      backupFrequency: "daily"
    },
    backup: {
      autoBackup: true,
      backupTime: "02:00",
      backupRetention: 30,
      lastBackup: null,
      backupLocation: "/backups/monitoring/"
    },
    api: {
      apiEnabled: true,
      apiKey: generateApiKey(),
      corsEnabled: true,
      allowedOrigins: "*",
      rateLimit: 100,
      rateLimitWindow: 60
    }
  });

  const [localSettings, setLocalSettings] = useState(settings);
  const navigate = useNavigate();

  function generateApiKey() {
    return "AT_" + Math.random().toString(36).substr(2, 16).toUpperCase();
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem("admin_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        setLocalSettings(parsed);
      } catch (e) {
        console.error("Error loading settings", e);
      }
    }
  };

  const saveSettings = () => {
    localStorage.setItem("admin_settings", JSON.stringify(localSettings));
    setSettings(localSettings);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const handleSettingChange = (section, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setSaveStatus("unsaved");
  };

  const resetSettings = () => {
    const defaultSettings = {
      general: {
        siteName: "Algérie Télécom - Monitoring",
        siteDescription: "Plateforme de surveillance des pannes et infrastructures",
        adminEmail: "admin@algerietelecom.dz",
        supportEmail: "support@algerietelecom.dz",
        phoneNumber: "+213 21 XX XX XX",
        timezone: "Africa/Algiers",
        dateFormat: "DD/MM/YYYY",
        language: "fr"
      },
      notification: {
        emailAlerts: true,
        smsAlerts: false,
        criticalOnly: true,
        alertEmail: "tech@algerietelecom.dz",
        alertPhone: "+213 55 XX XX XX",
        notificationInterval: 5,
        soundEnabled: true,
        desktopNotifications: true
      },
      monitoring: {
        refreshInterval: 5,
        autoRefresh: true,
        mapDefaultZoom: 6,
        showCircles: true,
        showClusters: false,
        maxMarkers: 200,
        criticalThreshold: 5000,
        majorThreshold: 2000
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordExpiry: 90,
        ipWhitelist: "",
        backupFrequency: "daily"
      },
      backup: {
        autoBackup: true,
        backupTime: "02:00",
        backupRetention: 30,
        lastBackup: null,
        backupLocation: "/backups/monitoring/"
      },
      api: {
        apiEnabled: true,
        apiKey: generateApiKey(),
        corsEnabled: true,
        allowedOrigins: "*",
        rateLimit: 100,
        rateLimitWindow: 60
      }
    };
    setLocalSettings(defaultSettings);
    setSaveStatus("unsaved");
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settings_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSaveStatus("exported");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setLocalSettings(imported);
          setSaveStatus("imported");
          setTimeout(() => setSaveStatus(""), 3000);
        } catch (err) {
          alert("Fichier invalide");
        }
      };
      reader.readAsText(file);
    }
  };

  const performBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      settings: localSettings,
      statistics: {
        totalPannes: JSON.parse(localStorage.getItem("realtime_pannes") || "[]").length,
        totalInfra: JSON.parse(localStorage.getItem("infrastructure") || "[]").length
      }
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `full_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setLocalSettings(prev => ({
      ...prev,
      backup: {
        ...prev.backup,
        lastBackup: new Date().toISOString()
      }
    }));
  };

  const clearAllData = () => {
    if (window.confirm("⚠️ ATTENTION: Cette action supprimera TOUTES les données (pannes, infrastructure, paramètres). Êtes-vous absolument sûr ?")) {
      if (window.confirm("DERNIÈRE CONFIRMATION: Cette action est irréversible. Confirmer ?")) {
        localStorage.clear();
        alert("Toutes les données ont été supprimées. La page va se recharger.");
        window.location.reload();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: "/admin", icon: "🏠", label: "Tableau de bord" },
    { path: "/admin/signals", icon: "📱", label: "Signalements" },
    { path: "/admin/tickets", icon: "🎫", label: "Tickets reçus" },
    { path: "/admin/techniciens", icon: "👨‍🔧", label: "Techniciens" },
    { path: "/admin/pannes", icon: "🔴", label: "Pannes temps réel" },
    { path: "/admin/infrastructure", icon: "🏗️", label: "Infrastructure" },
    { path: "/admin/rapports", icon: "📊", label: "Rapports" },
    { path: "/admin/parametres", icon: "⚙️", label: "Paramètres", active: true },
  ];

  const sections = [
    { id: "general", name: "⚙️ Général", icon: "⚙️" },
    { id: "notification", name: "🔔 Notifications", icon: "🔔" },
    { id: "monitoring", name: "📊 Monitoring", icon: "📊" },
    { id: "security", name: "🔒 Sécurité", icon: "🔒" },
    { id: "backup", name: "💾 Sauvegarde", icon: "💾" },
    { id: "api", name: "🔌 API", icon: "🔌" }
  ];

  return (
    <div className={`admin-dashboard ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Sidebar Toggle Button */}
      <button 
        className="sidebar-toggle-btn" 
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? "→" : "←"}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <img src={Algerie_telecom} alt="Logo" className="sidebar-logo" />
            </div>
            {!sidebarCollapsed && (
              <div className="logo-text">
                <span className="logo-main">NetGuard</span>
                <span className="logo-sub">Admin</span>
              </div>
            )}
          </div>
        </div>

        <div className="user-info-sidebar">
          <div className="user-avatar admin-avatar">
            A
            <div className="user-status admin"></div>
          </div>
          {!sidebarCollapsed && (
            <div className="user-details">
              <h4>Administrateur</h4>
              <p>Admin</p>
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
      <main className="admin-main">
        <div className="admin-content">
          <div className="admin-parametre-container">
            <div className="param-header">
              <div className="header-left">
                <div>
                  <h1>⚙️ Administration - Paramètres</h1>
                  <p>Configuration avancée de la plateforme de monitoring</p>
                </div>
              </div>
              <div className="header-actions">
                {saveStatus === "unsaved" && (
                  <span className="status-badge unsaved">⚠️ Modifications non sauvegardées</span>
                )}
                {saveStatus === "saved" && (
                  <span className="status-badge saved">✅ Paramètres sauvegardés</span>
                )}
                {saveStatus === "exported" && (
                  <span className="status-badge exported">📤 Paramètres exportés</span>
                )}
                {saveStatus === "imported" && (
                  <span className="status-badge imported">📥 Paramètres importés</span>
                )}
                <button className="btn-secondary" onClick={resetSettings}>
                  🔄 Réinitialiser
                </button>
                <button className="btn-primary" onClick={saveSettings}>
                  💾 Sauvegarder
                </button>
              </div>
            </div>

            <div className="param-content">
              <div className="param-sidebar">
                {sections.map(section => (
                  <button
                    key={section.id}
                    className={`sidebar-item ${activeSection === section.id ? "active" : ""}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="sidebar-icon">{section.icon}</span>
                    <span className="sidebar-name">{section.name}</span>
                  </button>
                ))}
                
                <div className="sidebar-divider"></div>
                
                <button className="sidebar-item danger" onClick={exportSettings}>
                  📤 Exporter
                </button>
                <label className="sidebar-item">
                  📥 Importer
                  <input type="file" accept=".json" onChange={importSettings} style={{ display: "none" }} />
                </label>
                <button className="sidebar-item danger" onClick={performBackup}>
                  💾 Backup complet
                </button>
                <button className="sidebar-item danger" onClick={clearAllData}>
                  🗑️ Effacer toutes les données
                </button>
              </div>

              <div className="param-main">
                {/* General Settings */}
                {activeSection === "general" && (
                  <div className="settings-section">
                    <h2>⚙️ Paramètres Généraux</h2>
                    <div className="settings-form">
                      <div className="form-group">
                        <label>Nom du site</label>
                        <input 
                          type="text" 
                          value={localSettings.general.siteName}
                          onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Description du site</label>
                        <textarea 
                          rows="2"
                          value={localSettings.general.siteDescription}
                          onChange={(e) => handleSettingChange("general", "siteDescription", e.target.value)}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Email administrateur</label>
                          <input 
                            type="email" 
                            value={localSettings.general.adminEmail}
                            onChange={(e) => handleSettingChange("general", "adminEmail", e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Email support</label>
                          <input 
                            type="email" 
                            value={localSettings.general.supportEmail}
                            onChange={(e) => handleSettingChange("general", "supportEmail", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Téléphone</label>
                          <input 
                            type="tel" 
                            value={localSettings.general.phoneNumber}
                            onChange={(e) => handleSettingChange("general", "phoneNumber", e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Fuseau horaire</label>
                          <select 
                            value={localSettings.general.timezone}
                            onChange={(e) => handleSettingChange("general", "timezone", e.target.value)}
                          >
                            <option value="Africa/Algiers">Afrique/Alger (UTC+1)</option>
                            <option value="Africa/Casablanca">Afrique/Casablanca (UTC+0)</option>
                            <option value="Africa/Tunis">Afrique/Tunis (UTC+1)</option>
                            <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Format de date</label>
                          <select 
                            value={localSettings.general.dateFormat}
                            onChange={(e) => handleSettingChange("general", "dateFormat", e.target.value)}
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Langue</label>
                          <select 
                            value={localSettings.general.language}
                            onChange={(e) => handleSettingChange("general", "language", e.target.value)}
                          >
                            <option value="fr">Français</option>
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeSection === "notification" && (
                  <div className="settings-section">
                    <h2>🔔 Paramètres de Notification</h2>
                    <div className="settings-form">
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.notification.emailAlerts}
                            onChange={(e) => handleSettingChange("notification", "emailAlerts", e.target.checked)}
                          />
                          Activer les alertes email
                        </label>
                      </div>
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.notification.smsAlerts}
                            onChange={(e) => handleSettingChange("notification", "smsAlerts", e.target.checked)}
                          />
                          Activer les alertes SMS
                        </label>
                      </div>
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.notification.criticalOnly}
                            onChange={(e) => handleSettingChange("notification", "criticalOnly", e.target.checked)}
                          />
                          Alertes uniquement pour les pannes critiques
                        </label>
                      </div>
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.notification.soundEnabled}
                            onChange={(e) => handleSettingChange("notification", "soundEnabled", e.target.checked)}
                          />
                          Activer les sons
                        </label>
                      </div>
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.notification.desktopNotifications}
                            onChange={(e) => handleSettingChange("notification", "desktopNotifications", e.target.checked)}
                          />
                          Notifications desktop
                        </label>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Email d'alerte</label>
                          <input 
                            type="email" 
                            value={localSettings.notification.alertEmail}
                            onChange={(e) => handleSettingChange("notification", "alertEmail", e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Téléphone d'alerte</label>
                          <input 
                            type="tel" 
                            value={localSettings.notification.alertPhone}
                            onChange={(e) => handleSettingChange("notification", "alertPhone", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Intervalle notifications (minutes)</label>
                          <input 
                            type="number" 
                            min="1" 
                            max="60"
                            value={localSettings.notification.notificationInterval}
                            onChange={(e) => handleSettingChange("notification", "notificationInterval", parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monitoring Settings */}
                {activeSection === "monitoring" && (
                  <div className="settings-section">
                    <h2>📊 Paramètres de Monitoring</h2>
                    <div className="settings-form">
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.monitoring.autoRefresh}
                            onChange={(e) => handleSettingChange("monitoring", "autoRefresh", e.target.checked)}
                          />
                          Auto-raffraîchissement des données
                        </label>
                      </div>
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.monitoring.showCircles}
                            onChange={(e) => handleSettingChange("monitoring", "showCircles", e.target.checked)}
                          />
                          Afficher les cercles d'impact sur la carte
                        </label>
                      </div>
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.monitoring.showClusters}
                            onChange={(e) => handleSettingChange("monitoring", "showClusters", e.target.checked)}
                          />
                          Regrouper les marqueurs sur la carte
                        </label>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Intervalle raffraîchissement (secondes)</label>
                          <input 
                            type="number" 
                            min="2" 
                            max="60"
                            value={localSettings.monitoring.refreshInterval}
                            onChange={(e) => handleSettingChange("monitoring", "refreshInterval", parseInt(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Zoom par défaut de la carte</label>
                          <select 
                            value={localSettings.monitoring.mapDefaultZoom}
                            onChange={(e) => handleSettingChange("monitoring", "mapDefaultZoom", parseInt(e.target.value))}
                          >
                            <option value="4">Niveau 4 - Vue pays</option>
                            <option value="5">Niveau 5 - Régions</option>
                            <option value="6">Niveau 6 - Villes principales</option>
                            <option value="7">Niveau 7 - Détail</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nombre max de marqueurs</label>
                          <input 
                            type="number" 
                            min="50" 
                            max="500"
                            value={localSettings.monitoring.maxMarkers}
                            onChange={(e) => handleSettingChange("monitoring", "maxMarkers", parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Seuil critique (clients affectés)</label>
                          <input 
                            type="number" 
                            value={localSettings.monitoring.criticalThreshold}
                            onChange={(e) => handleSettingChange("monitoring", "criticalThreshold", parseInt(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Seuil majeur (clients affectés)</label>
                          <input 
                            type="number" 
                            value={localSettings.monitoring.majorThreshold}
                            onChange={(e) => handleSettingChange("monitoring", "majorThreshold", parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeSection === "security" && (
                  <div className="settings-section">
                    <h2>🔒 Paramètres de Sécurité</h2>
                    <div className="settings-form">
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.security.twoFactorAuth}
                            onChange={(e) => handleSettingChange("security", "twoFactorAuth", e.target.checked)}
                          />
                          Activer l'authentification à deux facteurs
                        </label>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Timeout session (minutes)</label>
                          <input 
                            type="number" 
                            min="5" 
                            max="480"
                            value={localSettings.security.sessionTimeout}
                            onChange={(e) => handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Tentatives de connexion max</label>
                          <input 
                            type="number" 
                            min="3" 
                            max="10"
                            value={localSettings.security.maxLoginAttempts}
                            onChange={(e) => handleSettingChange("security", "maxLoginAttempts", parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiration mot de passe (jours)</label>
                          <input 
                            type="number" 
                            min="30" 
                            max="365"
                            value={localSettings.security.passwordExpiry}
                            onChange={(e) => handleSettingChange("security", "passwordExpiry", parseInt(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Fréquence sauvegarde</label>
                          <select 
                            value={localSettings.security.backupFrequency}
                            onChange={(e) => handleSettingChange("security", "backupFrequency", e.target.value)}
                          >
                            <option value="daily">Quotidienne</option>
                            <option value="weekly">Hebdomadaire</option>
                            <option value="monthly">Mensuelle</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Liste blanche IP (une par ligne)</label>
                        <textarea 
                          rows="3"
                          value={localSettings.security.ipWhitelist}
                          onChange={(e) => handleSettingChange("security", "ipWhitelist", e.target.value)}
                          placeholder="192.168.1.1&#10;10.0.0.0/24"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Backup Settings */}
                {activeSection === "backup" && (
                  <div className="settings-section">
                    <h2>💾 Paramètres de Sauvegarde</h2>
                    <div className="settings-form">
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.backup.autoBackup}
                            onChange={(e) => handleSettingChange("backup", "autoBackup", e.target.checked)}
                          />
                          Sauvegarde automatique
                        </label>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Heure de sauvegarde</label>
                          <input 
                            type="time" 
                            value={localSettings.backup.backupTime}
                            onChange={(e) => handleSettingChange("backup", "backupTime", e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Rétention (jours)</label>
                          <input 
                            type="number" 
                            min="7" 
                            max="365"
                            value={localSettings.backup.backupRetention}
                            onChange={(e) => handleSettingChange("backup", "backupRetention", parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Emplacement sauvegarde</label>
                        <input 
                          type="text" 
                          value={localSettings.backup.backupLocation}
                          onChange={(e) => handleSettingChange("backup", "backupLocation", e.target.value)}
                        />
                      </div>
                      {localSettings.backup.lastBackup && (
                        <div className="backup-info">
                          <p>📅 Dernière sauvegarde: {new Date(localSettings.backup.lastBackup).toLocaleString("fr-FR")}</p>
                        </div>
                      )}
                      <div className="backup-actions">
                        <button className="btn-secondary" onClick={performBackup}>
                          💾 Sauvegarder maintenant
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* API Settings */}
                {activeSection === "api" && (
                  <div className="settings-section">
                    <h2>🔌 Paramètres API</h2>
                    <div className="settings-form">
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.api.apiEnabled}
                            onChange={(e) => handleSettingChange("api", "apiEnabled", e.target.checked)}
                          />
                          Activer l'API REST
                        </label>
                      </div>
                      <div className="form-group checkbox">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={localSettings.api.corsEnabled}
                            onChange={(e) => handleSettingChange("api", "corsEnabled", e.target.checked)}
                          />
                          Activer CORS
                        </label>
                      </div>
                      <div className="form-group">
                        <label>Clé API</label>
                        <div className="api-key-display">
                          <code>{localSettings.api.apiKey}</code>
                          <button 
                            className="btn-small"
                            onClick={() => {
                              const newKey = generateApiKey();
                              handleSettingChange("api", "apiKey", newKey);
                            }}
                          >
                            🔄 Regénérer
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Origines autorisées (CORS)</label>
                        <input 
                          type="text" 
                          value={localSettings.api.allowedOrigins}
                          onChange={(e) => handleSettingChange("api", "allowedOrigins", e.target.value)}
                          placeholder="* ou http://localhost:3000,https://domaine.com"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Rate limit (requêtes)</label>
                          <input 
                            type="number" 
                            min="10" 
                            max="1000"
                            value={localSettings.api.rateLimit}
                            onChange={(e) => handleSettingChange("api", "rateLimit", parseInt(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Rate limit window (secondes)</label>
                          <input 
                            type="number" 
                            min="10" 
                            max="3600"
                            value={localSettings.api.rateLimitWindow}
                            onChange={(e) => handleSettingChange("api", "rateLimitWindow", parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="api-docs">
                        <h3>📚 Endpoints API disponibles:</h3>
                        <ul>
                          <li><code>GET /api/pannes</code> - Liste des pannes actives</li>
                          <li><code>GET /api/pannes/:id</code> - Détail d'une panne</li>
                          <li><code>POST /api/pannes</code> - Ajouter une panne</li>
                          <li><code>PUT /api/pannes/:id/resolve</code> - Résoudre une panne</li>
                          <li><code>GET /api/infrastructure</code> - Liste des équipements</li>
                          <li><code>GET /api/stats</code> - Statistiques globales</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminParametre;