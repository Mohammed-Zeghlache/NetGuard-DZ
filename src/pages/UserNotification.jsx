import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Styles/UserDashboard.css";
import "../Styles/UserNotification.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const UserNotification = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [allNotifications, setAllNotifications] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [loadingNotifs, setLoadingNotifs] = useState(true);

    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(currentUser));
        fetchUserNotifications();
    }, [navigate]);

    const fetchUserNotifications = () => {
        setLoadingNotifs(true);
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const storedNotifs = JSON.parse(localStorage.getItem(`notifications_${currentUser.id}`) || '[]');
        
        const userSignals = JSON.parse(localStorage.getItem(`user_signals_${currentUser.id}`) || '[]');
        const signalRelatedNotifs = [];
        
        userSignals.forEach(signalItem => {
            if (signalItem.updates && signalItem.updates.length > 0) {
                signalItem.updates.forEach(updateItem => {
                    signalRelatedNotifs.push({
                        uniqueId: `${signalItem.id}_${Date.now()}_${Math.random()}`,
                        category: "signal_update",
                        heading: `Mise à jour signalement`,
                        content: updateItem.message,
                        iconSymbol: "📋",
                        isRead: false,
                        timestamp: updateItem.date || new Date().toISOString(),
                        linkedSignalId: signalItem.id,
                        urgencyLevel: signalItem.priority
                    });
                });
            }
        });
        
        const mergedNotifs = [...storedNotifs, ...signalRelatedNotifs];
        mergedNotifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setAllNotifications(mergedNotifs);
        setLoadingNotifs(false);
    };

    const markNotifAsRead = (notifId) => {
        const updatedList = allNotifications.map(notif => 
            notif.uniqueId === notifId ? { ...notif, isRead: true } : notif
        );
        setAllNotifications(updatedList);
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userOnlyNotifs = updatedList.filter(notif => notif.category !== "signal_update");
        localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(userOnlyNotifs));
    };

    const markAllNotifsAsRead = () => {
        const updatedList = allNotifications.map(notif => ({ ...notif, isRead: true }));
        setAllNotifications(updatedList);
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userOnlyNotifs = updatedList.filter(notif => notif.category !== "signal_update");
        localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(userOnlyNotifs));
    };

    const removeSingleNotif = (notifId) => {
        const filteredList = allNotifications.filter(notif => notif.uniqueId !== notifId);
        setAllNotifications(filteredList);
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userOnlyNotifs = filteredList.filter(notif => notif.category !== "signal_update");
        localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(userOnlyNotifs));
    };

    const removeAllNotifs = () => {
        if (window.confirm("⚠️ Supprimer toutes les notifications ? Cette action est irréversible.")) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify([]));
            setAllNotifications([]);
        }
    };

    const getFilteredNotifs = () => {
        if (activeFilter === "unread") {
            return allNotifications.filter(notif => !notif.isRead);
        }
        return allNotifications;
    };

    const getIconForNotif = (category, customIcon) => {
        if (customIcon) return customIcon;
        switch(category) {
            case "signal_update": return "📋";
            case "new_signal": return "🆕";
            case "status_change": return "🔄";
            case "technician": return "🔧";
            default: return "🔔";
        }
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return "Récemment";
        const currentTime = new Date();
        const pastTime = new Date(timestamp);
        const diffMilliseconds = currentTime - pastTime;
        const diffMinutes = Math.floor(diffMilliseconds / 60000);
        const diffHours = Math.floor(diffMilliseconds / 3600000);
        const diffDays = Math.floor(diffMilliseconds / 86400000);
        
        if (diffMinutes < 1) return "À l'instant";
        if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
        if (diffHours < 24) return `Il y a ${diffHours} h`;
        if (diffDays < 7) return `Il y a ${diffDays} j`;
        return pastTime.toLocaleDateString('fr-FR');
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const totalUnreadCount = allNotifications.filter(notif => !notif.isRead).length;

    const menuItems = [
        { path: "/dashboard", icon: "🏠", label: "Tableau de bord", exact: true },
        { path: "/dashboard/signalements", icon: "📋", label: "Mes Signalements" },
        { path: "/dashboard/notifications", icon: "🔔", label: "Notifications", active: true },
        { path: "/dashboard/speedtests", icon: "⚡", label: "Tests de débit" },
        { path: "/dashboard/assistant", icon: "🤖", label: "Assistant IA" },
        { path: "/dashboard/profile", icon: "👤", label: "Mon Profil" },
        { path: "/dashboard/settings", icon: "⚙️", label: "Paramètres" },
    ];

    if (!user) return null;

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
                    <div className="notif-main-wrapper">
                        <div className="notif-animated-bg">
                            <div className="animated-bg-ball ball-one"></div>
                            <div className="animated-bg-ball ball-two"></div>
                            <div className="animated-bg-ball ball-three"></div>
                        </div>

                        <div className="notif-main-card">
                            <div className="notif-card-header">
                                <div className="header-left-area">
                                    <div className="header-icon-box">🔔</div>
                                    <div className="header-title-area">
                                        <h1 className="header-main-title">Mes Notifications</h1>
                                        <p className="header-sub-title">Suivez l'évolution de vos demandes</p>
                                    </div>
                                </div>
                                <div className="header-stats-area">
                                    <div className="stat-counter-box">
                                        <span className="stat-number-value">{allNotifications.length}</span>
                                        <span className="stat-label-text">Total</span>
                                    </div>
                                    <div className="stat-counter-box unread-box">
                                        <span className="stat-number-value">{totalUnreadCount}</span>
                                        <span className="stat-label-text">Non lues</span>
                                    </div>
                                </div>
                            </div>

                            <div className="notif-filter-bar">
                                <div className="filter-buttons-group">
                                    <button 
                                        className={`filter-btn ${activeFilter === 'all' ? 'filter-active' : ''}`}
                                        onClick={() => setActiveFilter('all')}
                                    >
                                        Toutes
                                        <span className="filter-badge">{allNotifications.length}</span>
                                    </button>
                                    <button 
                                        className={`filter-btn ${activeFilter === 'unread' ? 'filter-active' : ''}`}
                                        onClick={() => setActiveFilter('unread')}
                                    >
                                        Non lues
                                        <span className="filter-badge">{totalUnreadCount}</span>
                                    </button>
                                </div>
                                
                                <div className="action-buttons-group">
                                    {totalUnreadCount > 0 && (
                                        <button className="action-mark-read-btn" onClick={markAllNotifsAsRead}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            Tout marquer lu
                                        </button>
                                    )}
                                    {allNotifications.length > 0 && (
                                        <button className="action-delete-all-btn" onClick={removeAllNotifs}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                            Tout supprimer
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="notif-list-container">
                                {loadingNotifs ? (
                                    <div className="loading-state-area">
                                        <div className="loading-circle"></div>
                                        <p>Chargement en cours...</p>
                                    </div>
                                ) : getFilteredNotifs().length === 0 ? (
                                    <div className="empty-state-area">
                                        <div className="empty-state-icon">🔕</div>
                                        <h3 className="empty-state-title">Aucune notification</h3>
                                        <p className="empty-state-text">Vous serez informé des mises à jour ici</p>
                                        <button className="primary-action-btn" onClick={() => navigate('/dashboard/signalements')}>
                                            Créer un signalement
                                        </button>
                                    </div>
                                ) : (
                                    <div className="notif-items-list">
                                        {getFilteredNotifs().map((notification) => (
                                            <div 
                                                key={notification.uniqueId} 
                                                className={`notif-item-card ${!notification.isRead ? 'notif-unread' : ''}`}
                                                onClick={() => markNotifAsRead(notification.uniqueId)}
                                            >
                                                <div className="notif-icon-area">
                                                    <div className={`notif-icon-box ${notification.urgencyLevel === 'haute' ? 'high-urgency' : notification.urgencyLevel === 'moyenne' ? 'medium-urgency' : ''}`}>
                                                        {getIconForNotif(notification.category, notification.iconSymbol)}
                                                    </div>
                                                    {!notification.isRead && <div className="unread-indicator"></div>}
                                                </div>
                                                
                                                <div className="notif-content-area">
                                                    <div className="notif-title-row">
                                                        <h4 className="notif-heading">{notification.heading || "Notification"}</h4>
                                                        <span className="notif-time-ago">{formatTimeAgo(notification.timestamp)}</span>
                                                    </div>
                                                    <p className="notif-message-text">{notification.content}</p>
                                                    {notification.linkedSignalId && (
                                                        <button 
                                                            className="view-signal-link"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                navigate(`/dashboard/signalements/${notification.linkedSignalId}`);
                                                            }}
                                                        >
                                                            Consulter le signalement →
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <button 
                                                    className="delete-item-btn"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        removeSingleNotif(notification.uniqueId);
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="notif-card-footer">
                                <div className="footer-info-row">
                                    <span className="footer-info-icon">🔒</span>
                                    <span>Espace sécurisé</span>
                                    <span className="footer-separator">|</span>
                                    <span className="footer-info-icon">⚡</span>
                                    <span>Mises à jour en direct</span>
                                </div>
                            </div>
                        </div>

                        {selectedNotif && (
                            <div className="notif-modal-overlay" onClick={() => setSelectedNotif(null)}>
                                <div className="notif-modal-content" onClick={(event) => event.stopPropagation()}>
                                    <div className="notif-modal-header">
                                        <h3>Détail de la notification</h3>
                                        <button className="notif-modal-close" onClick={() => setSelectedNotif(null)}>×</button>
                                    </div>
                                    <div className="notif-modal-body">
                                        <div className="notif-modal-icon">{getIconForNotif(selectedNotif.category, selectedNotif.iconSymbol)}</div>
                                        <h4>{selectedNotif.heading || "Notification"}</h4>
                                        <p>{selectedNotif.content}</p>
                                        <div className="notif-modal-meta">
                                            <span>📅 {new Date(selectedNotif.timestamp).toLocaleString('fr-FR')}</span>
                                            {selectedNotif.linkedSignalId && (
                                                <span>📋 #{selectedNotif.linkedSignalId.toString().slice(-6)}</span>
                                            )}
                                        </div>
                                        {selectedNotif.linkedSignalId && (
                                            <button 
                                                className="primary-action-btn"
                                                onClick={() => {
                                                    setSelectedNotif(null);
                                                    navigate(`/dashboard/signalements/${selectedNotif.linkedSignalId}`);
                                                }}
                                            >
                                                Voir le signalement
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserNotification;