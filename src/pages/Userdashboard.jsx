import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import "../Styles/UserDashboard.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

// ==================== DASHBOARD HOME COMPONENT ====================
const DashboardHome = ({ user }) => {
  const [speedTestResult, setSpeedTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [recentSignalements, setRecentSignalements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalSignalements: 0,
    resolvedSignalements: 0,
    pendingSignalements: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    if (user && user.id) {
      loadData();
    }
  }, [user ? user.id : null]);

  const loadData = () => {
    if (!user || !user.id) return;
    const signalements = JSON.parse(localStorage.getItem(`signalements_${user.id}`) || '[]');
    setRecentSignalements(signalements.slice(0, 3));
    
    const notifs = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    setNotifications(notifs.slice(0, 5));
    
    setStats({
      totalSignalements: signalements.length,
      resolvedSignalements: signalements.filter(s => s.status === 'resolu').length,
      pendingSignalements: signalements.filter(s => s.status !== 'resolu').length,
      unreadNotifications: notifs.filter(n => !n.read).length
    });
  };

  const performSpeedTest = async () => {
    if (!user || !user.id) return;
    setIsTesting(true);
    setSpeedTestResult(null);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const downloadSpeed = (Math.random() * 90 + 10).toFixed(1);
    const uploadSpeed = (Math.random() * 30 + 5).toFixed(1);
    const ping = (Math.random() * 40 + 10).toFixed(0);
    
    setSpeedTestResult({
      download: downloadSpeed,
      upload: uploadSpeed,
      ping: ping,
      isp: "Algérie Télécom"
    });
    
    const savedTests = localStorage.getItem(`speedtests_${user.id}`);
    const tests = savedTests ? JSON.parse(savedTests) : [];
    tests.unshift({ download: downloadSpeed, upload: uploadSpeed, ping: ping });
    localStorage.setItem(`speedtests_${user.id}`, JSON.stringify(tests.slice(0, 10)));
    
    setIsTesting(false);
  };

  const getSpeedRating = (speed) => {
    if (speed >= 50) return { label: "Excellent", color: "#10b981", icon: "🚀", class: "excellent" };
    if (speed >= 20) return { label: "Bon", color: "#3b82f6", icon: "👍", class: "good" };
    if (speed >= 8) return { label: "Moyen", color: "#f59e0b", icon: "⚠️", class: "average" };
    return { label: "Lent", color: "#ef4444", icon: "🐌", class: "poor" };
  };

  return (
    <div className="dashboard-home">
      <div className="hero-section">
        <div className="hero-content">
          <div className="greeting-badge">
            <span className="wave-emoji">👋</span>
            <span>Bienvenue</span>
          </div>
          <h1>
            Bonjour, <span className="highlight">{user && user.fullName ? user.fullName : "Utilisateur"}</span>
          </h1>
          <p>Votre assistant réseau intelligent est prêt à vous aider</p>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-value">{stats.totalSignalements}</div>
              <div className="stat-label">Signalements</div>
            </div>
            <div className="hero-stat">
              <div className="stat-value">{stats.resolvedSignalements}</div>
              <div className="stat-label">Résolus</div>
            </div>
            <div className="hero-stat">
              <div className="stat-value">{stats.unreadNotifications}</div>
              <div className="stat-label">Notifications</div>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <div className="stat-icon">📡</div>
            <span className="stat-trend">En ligne</span>
          </div>
          <div className="stat-body">
            <h3>État connexion</h3>
            <div className="stat-value-group">
              <span className="stat-value">Actif</span>
            </div>
            <p>Débit moyen: 45 Mbps</p>
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <div className="stat-icon">🎫</div>
            <span className="stat-trend">{stats.pendingSignalements} actifs</span>
          </div>
          <div className="stat-body">
            <h3>Signalements</h3>
            <div className="stat-value-group">
              <span className="stat-value">{stats.totalSignalements}</span>
              <span className="stat-unit">total</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.totalSignalements ? (stats.resolvedSignalements / stats.totalSignalements) * 100 : 0}%` }}></div>
            </div>
            <p>{stats.resolvedSignalements} résolus</p>
          </div>
        </div>

        <div className="stat-card gradient-green">
          <div className="stat-header">
            <div className="stat-icon">✅</div>
            <span className="stat-trend">Satisfaction</span>
          </div>
          <div className="stat-body">
            <h3>Taux de résolution</h3>
            <div className="stat-value-group">
              <span className="stat-value">
                {stats.totalSignalements ? Math.round((stats.resolvedSignalements / stats.totalSignalements) * 100) : 0}
              </span>
              <span className="stat-unit">%</span>
            </div>
            <p>Objectif: 95%</p>
          </div>
        </div>

        <div className="stat-card gradient-orange">
          <div className="stat-header">
            <div className="stat-icon">🔔</div>
            <span className="stat-trend">{stats.unreadNotifications} non lues</span>
          </div>
          <div className="stat-body">
            <h3>Notifications</h3>
            <div className="stat-value-group">
              <span className="stat-value">{notifications.length}</span>
              <span className="stat-unit">total</span>
            </div>
            <p>Mise à jour récente</p>
          </div>
        </div>
      </div>

      <div className="speedtest-section">
        <div className="section-header">
          <div className="header-left">
            <span className="section-icon">⚡</span>
            <h3>Test de Débit</h3>
          </div>
          <button className={`speedtest-btn ${isTesting ? 'testing' : ''}`} onClick={performSpeedTest} disabled={isTesting}>
            {isTesting ? (
              <>
                <div className="btn-spinner"></div>
                <span>Test en cours...</span>
              </>
            ) : (
              <>
                <span>Lancer le test</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </>
            )}
          </button>
        </div>
        
        {isTesting && (
          <div className="speedtest-loading">
            <div className="loading-animation">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>
            <p>Analyse de votre connexion...</p>
          </div>
        )}
        
        {speedTestResult && !isTesting && (
          <div className="speedtest-result">
            <div className="result-card">
              <div className="result-icon">📥</div>
              <div className="result-value">{speedTestResult.download}</div>
              <div className="result-label">Mbps</div>
              <div className="result-sub">Téléchargement</div>
              <div className="result-bar">
                <div className="bar-fill" style={{ width: `${(speedTestResult.download / 100) * 100}%` }}></div>
              </div>
            </div>
            <div className="result-card">
              <div className="result-icon">📤</div>
              <div className="result-value">{speedTestResult.upload}</div>
              <div className="result-label">Mbps</div>
              <div className="result-sub">Téléversement</div>
              <div className="result-bar">
                <div className="bar-fill" style={{ width: `${(speedTestResult.upload / 50) * 100}%` }}></div>
              </div>
            </div>
            <div className="result-card">
              <div className="result-icon">⏱️</div>
              <div className="result-value">{speedTestResult.ping}</div>
              <div className="result-label">ms</div>
              <div className="result-sub">Latence</div>
              <div className="result-bar">
                <div className="bar-fill" style={{ width: `${100 - (speedTestResult.ping / 100) * 100}%` }}></div>
              </div>
            </div>
            <div className={`result-rating ${getSpeedRating(speedTestResult.download).class}`}>
              <span className="rating-icon">{getSpeedRating(speedTestResult.download).icon}</span>
              <span className="rating-text">Qualité: {getSpeedRating(speedTestResult.download).label}</span>
            </div>
          </div>
        )}
      </div>

      <div className="recent-section">
        <div className="section-header">
          <div className="header-left">
            <span className="section-icon">📋</span>
            <h3>Derniers Signalements</h3>
          </div>
          <Link to="/dashboard/signalements" className="view-all-link">
            Voir tout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
        {recentSignalements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h4>Aucun signalement</h4>
            <p>Créez votre premier signalement pour obtenir de l'aide</p>
            <Link to="/dashboard/signalements" className="btn-primary-sm">+ Nouveau signalement</Link>
          </div>
        ) : (
          <div className="signalements-list">
            {recentSignalements.map((s) => (
              <div key={s.id} className={`signalement-item ${s.status}`}>
                <div className="signalement-icon">
                  {s.type === "panne" ? "🔌" : s.type === "lent" ? "⚡" : "📡"}
                </div>
                <div className="signalement-info">
                  <h4>{s.title}</h4>
                  <p>{(s.description || "").substring(0, 50)}...</p>
                  <div className="signalement-meta">
                    <span className="signalement-id">#{s.id ? s.id.toString().slice(-6) : ""}</span>
                  </div>
                </div>
                <div className="signalement-status">
                  <span className={`status-badge ${s.status}`}>
                    {s.status === "en_cours" ? "En cours" : s.status === "resolu" ? "Résolu" : "Nouveau"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recent-section">
        <div className="section-header">
          <div className="header-left">
            <span className="section-icon">🔔</span>
            <h3>Notifications Récentes</h3>
          </div>
          <Link to="/dashboard/notifications" className="view-all-link">
            Voir tout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
        {notifications.length === 0 ? (
          <div className="empty-state small">
            <span>🔕</span>
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((n) => (
              <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                <div className="notification-icon">{n.icon || "🔔"}</div>
                <div className="notification-content">
                  <p>{n.message}</p>
                </div>
                {!n.read && <div className="unread-dot"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== SIGNALEMENTS PAGE ====================
const SignalementsPage = ({ user }) => {
  const [signalements, setSignalements] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.id) {
      loadSignalements();
    }
  }, [user ? user.id : null]);

  const loadSignalements = () => {
    if (!user || !user.id) return;
    const saved = localStorage.getItem(`signalements_${user.id}`);
    if (saved) {
      setSignalements(JSON.parse(saved));
    }
  };

  const saveSignalements = (data) => {
    if (!user || !user.id) return;
    localStorage.setItem(`signalements_${user.id}`, JSON.stringify(data));
    setSignalements(data);
  };

  const addNotification = (message, icon = "🔔") => {
    if (!user || !user.id) return;
    const savedNotifs = localStorage.getItem(`notifications_${user.id}`);
    const notifs = savedNotifs ? JSON.parse(savedNotifs) : [];
    notifs.unshift({
      id: Date.now(),
      message: message,
      icon: icon,
      read: false,
      date: new Date().toISOString()
    });
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifs.slice(0, 50)));
  };

  const handleNewSignalement = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSignalement = {
      id: Date.now(),
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type'),
      priority: formData.get('priority'),
      status: 'nouveau',
      user: user && user.fullName ? user.fullName : "Utilisateur",
      updates: [{ message: "Signalement créé", date: new Date().toISOString() }]
    };
    
    const updated = [newSignalement, ...signalements];
    saveSignalements(updated);
    addNotification(`Nouveau signalement: "${newSignalement.title}" a été créé avec succès`, "✅");
    setShowNewForm(false);
    e.target.reset();
  };

  const updateStatus = (id, newStatus) => {
    const updated = signalements.map(s => 
      s.id === id ? { 
        ...s, 
        status: newStatus, 
        updates: [{ message: `Statut changé à ${newStatus === "en_cours" ? "En cours" : newStatus === "resolu" ? "Résolu" : "Nouveau"}`, date: new Date().toISOString() }, ...(s.updates || [])] 
      } : s
    );
    saveSignalements(updated);
    addNotification(`Signalement #${id.toString().slice(-6)}: statut mis à jour`, "🔄");
  };

  const deleteSignalement = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce signalement ?")) {
      const updated = signalements.filter(s => s.id !== id);
      saveSignalements(updated);
      addNotification(`Signalement #${id.toString().slice(-6)} a été supprimé`, "🗑️");
    }
  };

  const filteredSignalements = signalements.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="signalements-page">
      <div className="page-header">
        <div className="header-left">
          <h2>📋 Mes Signalements</h2>
          <p>Gérez vos demandes d'assistance technique</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewForm(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau signalement
        </button>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tous
          <span className="filter-count">{signalements.length}</span>
        </button>
        <button className={`filter-tab ${filter === 'nouveau' ? 'active' : ''}`} onClick={() => setFilter('nouveau')}>
          Nouveaux
          <span className="filter-count">{signalements.filter(s => s.status === 'nouveau').length}</span>
        </button>
        <button className={`filter-tab ${filter === 'en_cours' ? 'active' : ''}`} onClick={() => setFilter('en_cours')}>
          En cours
          <span className="filter-count">{signalements.filter(s => s.status === 'en_cours').length}</span>
        </button>
        <button className={`filter-tab ${filter === 'resolu' ? 'active' : ''}`} onClick={() => setFilter('resolu')}>
          Résolus
          <span className="filter-count">{signalements.filter(s => s.status === 'resolu').length}</span>
        </button>
      </div>

      {showNewForm && (
        <div className="modal-overlay" onClick={() => setShowNewForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📝 Nouveau Signalement</h3>
              <button className="modal-close" onClick={() => setShowNewForm(false)}>×</button>
            </div>
            <form onSubmit={handleNewSignalement}>
              <div className="form-group">
                <label>Titre du signalement</label>
                <input type="text" name="title" required placeholder="Ex: Problème de connexion internet" />
              </div>
              <div className="form-group">
                <label>Description détaillée</label>
                <textarea name="description" required rows="4" placeholder="Décrivez votre problème en détail..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type de problème</label>
                  <select name="type" required>
                    <option value="panne">🔌 Panne totale</option>
                    <option value="lent">⚡ Connexion lente</option>
                    <option value="instable">📡 Connexion instable</option>
                    <option value="autre">❓ Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priorité</label>
                  <select name="priority" required>
                    <option value="haute">🔴 Haute</option>
                    <option value="moyenne">🟡 Moyenne</option>
                    <option value="basse">🟢 Basse</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowNewForm(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Créer le signalement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {signalements.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon">📭</div>
          <h3>Aucun signalement</h3>
          <p>Vous n'avez pas encore créé de signalement.</p>
          <button className="btn-primary" onClick={() => setShowNewForm(true)}>Créer mon premier signalement</button>
        </div>
      ) : (
        <div className="signalements-table-container">
          <table className="signalements-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Type</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignalements.map(s => (
                <tr key={s.id}>
                  <td><span className="signalement-id-badge">#{s.id.toString().slice(-6)}</span></td>
                  <td>{s.title}</td>
                  <td><span className={`type-badge ${s.type}`}>{s.type}</span></td>
                  <td><span className={`priority-badge ${s.priority}`}>{s.priority}</span></td>
                  <td>
                    <select value={s.status} onChange={(e) => updateStatus(s.id, e.target.value)} className="status-select">
                      <option value="nouveau">🆕 Nouveau</option>
                      <option value="en_cours">🔄 En cours</option>
                      <option value="resolu">✅ Résolu</option>
                    </select>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn view" onClick={() => navigate(`/dashboard/signalements/${s.id}`)} title="Voir détails">👁️</button>
                    <button className="action-btn delete" onClick={() => deleteSignalement(s.id)} title="Supprimer">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==================== SIGNALEMENT DETAIL PAGE ====================
const SignalementDetail = ({ user }) => {
  const [signalement, setSignalement] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const match = location.pathname.match(/\/dashboard\/signalements\/(\d+)/);
  const id = match ? match[1] : null;

  useEffect(() => {
    if (user && user.id && id) {
      const saved = localStorage.getItem(`signalements_${user.id}`);
      if (saved) {
        const signalements = JSON.parse(saved);
        const found = signalements.find(s => s.id === parseInt(id));
        if (found) {
          setSignalement(found);
        } else {
          navigate('/dashboard/signalements');
        }
      }
    }
  }, [id, user, navigate]);

  if (!signalement) return <div className="loading"><div className="loading-spinner"></div><p>Chargement...</p></div>;

  return (
    <div className="signalement-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/signalements')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </button>
        <h2>Détail du Signalement</h2>
      </div>
      
      <div className="detail-card">
        <div className="detail-info">
          <div className="detail-title-section">
            <h3>{signalement.title}</h3>
            <span className={`detail-status ${signalement.status}`}>
              {signalement.status === "en_cours" ? "🔄 En cours" : signalement.status === "resolu" ? "✅ Résolu" : "🆕 Nouveau"}
            </span>
          </div>
          <div className="detail-meta">
            <span className="detail-id">#{signalement.id.toString().slice(-6)}</span>
            <span className="detail-priority">
              {signalement.priority === 'haute' ? '🔴' : signalement.priority === 'moyenne' ? '🟡' : '🟢'} Priorité {signalement.priority}
            </span>
            <span className="detail-type">{signalement.type}</span>
          </div>
          <div className="description-section">
            <h4>Description</h4>
            <p>{signalement.description}</p>
          </div>
        </div>
        
        <div className="detail-updates">
          <h4>📝 Historique des mises à jour</h4>
          <div className="timeline">
            {(signalement.updates || []).map((update, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-message">{update.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== NOTIFICATIONS PAGE ====================
const NotificationsPage = ({ user }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      loadNotifications();
    }
  }, [user ? user.id : null]);

  const loadNotifications = () => {
    if (!user || !user.id) return;
    const saved = localStorage.getItem(`notifications_${user.id}`);
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  };

  const markAsRead = (id) => {
    if (!user || !user.id) return;
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
    setNotifications(updated);
  };

  const markAllAsRead = () => {
    if (!user || !user.id) return;
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
    setNotifications(updated);
  };

  const clearAll = () => {
    if (!user || !user.id) return;
    if (window.confirm("Supprimer toutes les notifications ?")) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify([]));
      setNotifications([]);
    }
  };

  const deleteNotification = (id) => {
    if (!user || !user.id) return;
    const updated = notifications.filter(n => n.id !== id);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
    setNotifications(updated);
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div className="header-left">
          <h2>🔔 Mes Notifications</h2>
          <p>Restez informé des mises à jour</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={markAllAsRead}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Tout marquer lu
          </button>
          <button className="btn-danger" onClick={clearAll}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Tout supprimer
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon">🔕</div>
          <h3>Aucune notification</h3>
          <p>Vous serez notifié des mises à jour ici.</p>
        </div>
      ) : (
        <div className="notifications-list-full">
          {notifications.map(n => (
            <div key={n.id} className={`notification-card ${!n.read ? 'unread' : ''}`}>
              <div className="notification-icon-large">{n.icon || "🔔"}</div>
              <div className="notification-content-full" onClick={() => markAsRead(n.id)}>
                <p>{n.message}</p>
              </div>
              <button className="notification-delete" onClick={() => deleteNotification(n.id)}>×</button>
              {!n.read && <div className="unread-dot"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== SPEED TESTS PAGE ====================
const SpeedTestsPage = ({ user }) => {
  const [tests, setTests] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      loadTests();
    }
  }, [user ? user.id : null]);

  const loadTests = () => {
    if (!user || !user.id) return;
    const saved = localStorage.getItem(`speedtests_${user.id}`);
    if (saved) {
      setTests(JSON.parse(saved));
    }
  };

  const performSpeedTest = async () => {
    if (!user || !user.id) return;
    setIsTesting(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const downloadSpeed = (Math.random() * 90 + 10).toFixed(1);
    const uploadSpeed = (Math.random() * 30 + 5).toFixed(1);
    const ping = (Math.random() * 40 + 10).toFixed(0);
    
    const newTest = {
      download: downloadSpeed,
      upload: uploadSpeed,
      ping: ping
    };
    
    const updated = [newTest, ...tests];
    localStorage.setItem(`speedtests_${user.id}`, JSON.stringify(updated.slice(0, 20)));
    setTests(updated);
    setIsTesting(false);
  };

  const getSpeedRating = (speed) => {
    if (speed >= 50) return { label: "Excellent", class: "excellent" };
    if (speed >= 20) return { label: "Bon", class: "good" };
    if (speed >= 8) return { label: "Moyen", class: "average" };
    return { label: "Lent", class: "poor" };
  };

  const averageSpeed = tests.length > 0 
    ? (tests.reduce((sum, t) => sum + parseFloat(t.download), 0) / tests.length).toFixed(1)
    : 0;

  const bestSpeed = tests.length > 0
    ? Math.max(...tests.map(t => parseFloat(t.download))).toFixed(1)
    : 0;

  return (
    <div className="speedtests-page">
      <div className="page-header">
        <div className="header-left">
          <h2>⚡ Tests de Débit</h2>
          <p>Analysez et suivez la qualité de votre connexion</p>
        </div>
        <button className={`btn-primary ${isTesting ? 'testing' : ''}`} onClick={performSpeedTest} disabled={isTesting}>
          {isTesting ? (
            <>
              <div className="btn-spinner"></div>
              Test en cours...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Nouveau test
            </>
          )}
        </button>
      </div>

      {tests.length > 0 && (
        <div className="stats-summary">
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-info">
              <span className="summary-label">Moyenne Download</span>
              <span className="summary-value">{averageSpeed} <span className="summary-unit">Mbps</span></span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🏆</div>
            <div className="summary-info">
              <span className="summary-label">Meilleur débit</span>
              <span className="summary-value">{bestSpeed} <span className="summary-unit">Mbps</span></span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📈</div>
            <div className="summary-info">
              <span className="summary-label">Total tests</span>
              <span className="summary-value">{tests.length}</span>
            </div>
          </div>
        </div>
      )}

      {tests.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon">📊</div>
          <h3>Aucun test effectué</h3>
          <p>Lancez votre premier test de débit pour analyser votre connexion.</p>
          <button className="btn-primary" onClick={performSpeedTest}>Commencer le test</button>
        </div>
      ) : (
        <div className="tests-table-container">
          <table className="tests-table">
            <thead>
              <tr>
                <th>Download</th>
                <th>Upload</th>
                <th>Latence</th>
                <th>Qualité</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, idx) => {
                const rating = getSpeedRating(test.download);
                return (
                  <tr key={idx}>
                    <td className="download-cell">{test.download} <span className="unit">Mbps</span></td>
                    <td>{test.upload} <span className="unit">Mbps</span></td>
                    <td>{test.ping} <span className="unit">ms</span></td>
                    <td><span className={`quality-badge ${rating.class}`}>{rating.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==================== AI ASSISTANT PAGE ====================
const AIAssistantPage = () => {
  return (
    <div className="ai-assistant-page">
      <div className="page-header">
        <div className="header-left">
          <h2>🤖 Assistant IA NetGuard</h2>
          <p>Support technique intelligent disponible 24/7</p>
        </div>
      </div>
      <div className="chat-embed-container">
        <div className="chat-header-mini">
          <img src={Algerie_telecom} alt="Algérie Télécom" className="mini-logo" />
          <div className="chat-status">
            <span className="status-dot"></span>
            <span>Assistant en ligne</span>
          </div>
        </div>
        <div className="chat-messages-preview">
          <div className="message bot">
            <div className="avatar">🤖</div>
            <div className="message-text">
              Bonjour ! Je suis l'assistant NetGuard DZ. Je peux vous aider avec :
              <ul>
                <li>🔌 Diagnostic de panne</li>
                <li>⚡ Optimisation de connexion</li>
                <li>📡 Configuration modem/routeur</li>
                <li>🎫 Création de tickets</li>
                <li>📊 Analyse de votre réseau</li>
              </ul>
              Comment puis-je vous assister aujourd'hui ?
            </div>
          </div>
        </div>
        <div className="chat-input-preview">
          <input type="text" placeholder="Posez votre question..." disabled />
          <button disabled>Envoyer</button>
        </div>
        <p className="chat-note">
          💡 L'assistant complet est disponible via le widget flottant
        </p>
      </div>
    </div>
  );
};

// ==================== PROFILE PAGE ====================
const ProfilePage = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user && user.fullName ? user.fullName : "",
    email: user && user.email ? user.email : "",
    phone: user && user.phone ? user.phone : "",
    address: user && user.address ? user.address : ""
  });

  useEffect(() => {
    setFormData({
      fullName: user && user.fullName ? user.fullName : "",
      email: user && user.email ? user.email : "",
      phone: user && user.phone ? user.phone : "",
      address: user && user.address ? user.address : ""
    });
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getInitial = () => {
    const name = user && user.fullName ? user.fullName : "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="header-left">
          <h2>👤 Mon Profil</h2>
          <p>Gérez vos informations personnelles</p>
        </div>
        <button className="btn-secondary" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Annuler" : "Modifier"}
        </button>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-large">
            {getInitial()}
            <div className="avatar-status"></div>
          </div>
          <h3>{user && user.fullName ? user.fullName : "Utilisateur"}</h3>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Nom complet</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Adresse</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="3" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Enregistrer les modifications</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">📧 Email</span>
              <span className="info-value">{user && user.email ? user.email : "Non renseigné"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📱 Téléphone</span>
              <span className="info-value">{user && user.phone ? user.phone : "Non renseigné"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📍 Adresse</span>
              <span className="info-value">{user && user.address ? user.address : "Non renseignée"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== SETTINGS PAGE ====================
const SettingsPage = ({ user }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: 'fr'
  });

  useEffect(() => {
    if (user && user.id) {
      const saved = localStorage.getItem(`settings_${user.id}`);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    }
  }, [user ? user.id : null]);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    if (user && user.id) {
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(newSettings));
    }
  };

  const handleToggle = (key) => {
    saveSettings({ ...settings, [key]: !settings[key] });
  };

  const clearAllData = () => {
    if (window.confirm("⚠️ Attention : Cette action supprimera tous vos signalements, notifications et historiques. Cette action est irréversible. Continuer ?")) {
      if (user && user.id) {
        localStorage.removeItem(`signalements_${user.id}`);
        localStorage.removeItem(`notifications_${user.id}`);
        localStorage.removeItem(`speedtests_${user.id}`);
      }
      alert("Toutes vos données ont été supprimées.");
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-left">
          <h2>⚙️ Paramètres</h2>
          <p>Personnalisez votre expérience</p>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-section">
          <h3>🔔 Notifications</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Notifications par email</span>
              <span className="setting-desc">Recevez des alertes par email</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Notifications SMS</span>
              <span className="setting-desc">Recevez des alertes par SMS</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.smsNotifications} onChange={() => handleToggle('smsNotifications')} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>🎨 Apparence</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Mode sombre</span>
              <span className="setting-desc">Thème sombre pour l'interface</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>🌐 Préférences</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Langue</span>
              <span className="setting-desc">Choisissez votre langue préférée</span>
            </div>
            <select value={settings.language} onChange={(e) => saveSettings({ ...settings, language: e.target.value })} className="language-select">
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="settings-section danger">
          <h3>⚠️ Zone de danger</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Supprimer toutes mes données</span>
              <span className="setting-desc">Supprime définitivement tous vos signalements et notifications</span>
            </div>
            <button className="btn-danger" onClick={clearAllData}>Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(currentUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  if (!user) return null;

  const menuItems = [
    { path: "/dashboard", icon: "🏠", label: "Tableau de bord", exact: true },
    { path: "/dashboard/signalements", icon: "📋", label: "Mes Signalements" },
    { path: "/dashboard/notifications", icon: "🔔", label: "Notifications" },
    { path: "/dashboard/speedtests", icon: "⚡", label: "Tests de débit" },
    { path: "/dashboard/assistant", icon: "🤖", label: "Assistant IA" },
    { path: "/dashboard/profile", icon: "👤", label: "Mon Profil" },
    { path: "/dashboard/settings", icon: "⚙️", label: "Paramètres" },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`user-dashboard ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="mobile-menu-btn" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
      >
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      <button 
        className="sidebar-toggle-btn" 
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? "→" : "←"}
      </button>

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

        {/* FIXED: The problematic line 1164 is now safe */}
        <div className="user-info-sidebar">
          <div className="user-avatar">
            {(user && user.fullName ? user.fullName.charAt(0) : "U").toUpperCase()}
            <div className="user-status"></div>
          </div>
          {!sidebarCollapsed && (
            <div className="user-details">
              <h4>{user && user.fullName ? user.fullName : "Utilisateur"}</h4>
              <p>{user && user.email ? user.email : ""}</p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
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

      <main className="dashboard-main">
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<DashboardHome user={user} />} />
            <Route path="/signalements" element={<SignalementsPage user={user} />} />
            <Route path="/signalements/:id" element={<SignalementDetail user={user} />} />
            <Route path="/notifications" element={<NotificationsPage user={user} />} />
            <Route path="/speedtests" element={<SpeedTestsPage user={user} />} />
            <Route path="/assistant" element={<AIAssistantPage />} />
            <Route path="/profile" element={<ProfilePage user={user} onUpdateUser={updateUser} />} />
            <Route path="/settings" element={<SettingsPage user={user} />} />
          </Routes>
        </div>
      </main>

      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>}
    </div>
  );
};

export default UserDashboard;