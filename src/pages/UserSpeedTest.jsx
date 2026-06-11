import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Algerie_telecom from "../images/Algerie_telecom.jpg";
import "../Styles/UserDashboard.css";
import "../Styles/UserSpeedTest.css";

const UserSpeedTest = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [testStatus, setTestStatus] = useState("idle");
    const [progress, setProgress] = useState(0);
    const [currentPhase, setCurrentPhase] = useState("");
    const [results, setResults] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedServer, setSelectedServer] = useState("algerie_telecom");
    
    const abortControllerRef = useRef(null);

    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(currentUser));
        loadTestHistory();
    }, [navigate]);

    const loadTestHistory = () => {
        setIsLoading(true);
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const savedHistory = JSON.parse(localStorage.getItem(`speedtests_${currentUser.id}`) || '[]');
        setHistory(savedHistory);
        setIsLoading(false);
    };

    const saveTestResult = (result) => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedHistory = [result, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(`speedtests_${currentUser.id}`, JSON.stringify(updatedHistory.slice(0, 20)));
    };

    const performSpeedTest = async () => {
        if (testStatus === "testing") return;
        
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        setTestStatus("testing");
        setResults(null);
        
        const phases = [
            { name: "🔄 Connexion au serveur...", duration: 500, weight: 5 },
            { name: "📡 Test de latence (Ping)...", duration: 1000, weight: 10 },
            { name: "📥 Test de téléchargement...", duration: 2500, weight: 50 },
            { name: "📤 Test de téléversement...", duration: 2000, weight: 30 },
            { name: "✅ Finalisation du test...", duration: 500, weight: 5 }
        ];
        
        let currentProgress = 0;
        let phaseResults = {
            ping: 0,
            download: 0,
            upload: 0,
            jitter: 0
        };
        
        for (let i = 0; i < phases.length; i++) {
            const phase = phases[i];
            setCurrentPhase(phase.name);
            
            if (phase.name.includes("Ping")) {
                const pingValues = [];
                for (let p = 0; p < 3; p++) {
                    await new Promise(r => setTimeout(r, 200));
                    const pingValue = Math.floor(Math.random() * 40 + 10);
                    pingValues.push(pingValue);
                    setCurrentPhase(`${phase.name} (${p + 1}/3) - ${pingValue}ms`);
                }
                phaseResults.ping = Math.floor(pingValues.reduce((a, b) => a + b, 0) / pingValues.length);
                phaseResults.jitter = Math.abs(pingValues[1] - pingValues[0]);
            }
            
            if (phase.name.includes("téléchargement")) {
                for (let step = 0; step <= 100; step += 10) {
                    await new Promise(r => setTimeout(r, 250));
                    const mockSpeed = 20 + (step / 100) * 80;
                    phaseResults.download = parseFloat(mockSpeed.toFixed(1));
                    setCurrentPhase(`${phase.name} ${step}% - ${phaseResults.download} Mbps`);
                }
            }
            
            if (phase.name.includes("téléversement")) {
                for (let step = 0; step <= 100; step += 10) {
                    await new Promise(r => setTimeout(r, 200));
                    const mockSpeed = 10 + (step / 100) * 40;
                    phaseResults.upload = parseFloat(mockSpeed.toFixed(1));
                    setCurrentPhase(`${phase.name} ${step}% - ${phaseResults.upload} Mbps`);
                }
            }
            
            currentProgress += phase.weight;
            setProgress(currentProgress);
            await new Promise(r => setTimeout(r, phase.duration));
        }
        
        const finalResults = {
            ping: phaseResults.ping || Math.floor(Math.random() * 40 + 10),
            jitter: phaseResults.jitter || Math.floor(Math.random() * 10 + 1),
            download: phaseResults.download || parseFloat((Math.random() * 80 + 20).toFixed(1)),
            upload: phaseResults.upload || parseFloat((Math.random() * 30 + 10).toFixed(1)),
            timestamp: new Date().toISOString(),
            server: selectedServer === "algerie_telecom" ? "Algérie Télécom - Alger" : "Serveur Oran",
            ip: "41.107.xxx.xxx"
        };
        
        setResults(finalResults);
        setCurrentPhase("✅ Test terminé avec succès !");
        setTestStatus("completed");
        
        saveTestResult(finalResults);
        
        setTimeout(() => {
            setTestStatus("idle");
            setProgress(0);
            setCurrentPhase("");
        }, 2000);
    };

    const getSpeedQuality = (speed) => {
        if (speed >= 50) return { label: "Excellent", color: "#10b981", icon: "🚀", class: "excellent" };
        if (speed >= 20) return { label: "Bon", color: "#3b82f6", icon: "👍", class: "good" };
        if (speed >= 8) return { label: "Moyen", color: "#f59e0b", icon: "⚠️", class: "average" };
        return { label: "Lent", color: "#ef4444", icon: "🐌", class: "poor" };
    };

    const getPingQuality = (ping) => {
        if (ping <= 20) return { label: "Excellent", color: "#10b981", icon: "🚀" };
        if (ping <= 50) return { label: "Bon", color: "#3b82f6", icon: "👍" };
        if (ping <= 100) return { label: "Moyen", color: "#f59e0b", icon: "⚠️" };
        return { label: "Lent", color: "#ef4444", icon: "🐌" };
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const clearHistory = () => {
        if (window.confirm("⚠️ Supprimer tout l'historique des tests ?")) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            localStorage.setItem(`speedtests_${currentUser.id}`, JSON.stringify([]));
            setHistory([]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const menuItems = [
        { path: "/dashboard", icon: "🏠", label: "Tableau de bord", exact: true },
        { path: "/dashboard/signalements", icon: "📋", label: "Mes Signalements" },
        { path: "/dashboard/notifications", icon: "🔔", label: "Notifications" },
        { path: "/dashboard/speedtests", icon: "⚡", label: "Tests de débit", active: true },
        { path: "/dashboard/assistant", icon: "🤖", label: "Assistant IA" },
        { path: "/dashboard/profile", icon: "👤", label: "Mon Profil" },
        { path: "/dashboard/settings", icon: "⚙️", label: "Paramètres" },
    ];

    const averageDownload = history.length > 0 
        ? (history.reduce((sum, t) => sum + t.download, 0) / history.length).toFixed(1)
        : 0;
    
    const bestDownload = history.length > 0
        ? Math.max(...history.map(t => t.download)).toFixed(1)
        : 0;

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
                    <div className="speedtest-main-wrapper">
                        <div className="speedtest-bg-animation">
                            <div className="speedtest-ball s-ball-1"></div>
                            <div className="speedtest-ball s-ball-2"></div>
                            <div className="speedtest-ball s-ball-3"></div>
                        </div>

                        <div className="speedtest-main-card">
                            {/* Header with Logo */}
                            <div className="speedtest-card-header">
                                <div className="speedtest-header-left">
                                    <div className="speedtest-logo-box">
                                        <img src={Algerie_telecom} alt="Algérie Télécom" className="speedtest-logo-img" />
                                    </div>
                                    <div className="speedtest-header-text">
                                        <h1 className="speedtest-main-title">Test de Débit</h1>
                                        <p className="speedtest-sub-title">Analysez la qualité de votre connexion</p>
                                    </div>
                                </div>
                                <div className="speedtest-header-right">
                                    <div className="speedtest-isp-badge">
                                        <span className="isp-dot"></span>
                                        <span>Algérie Télécom</span>
                                    </div>
                                </div>
                            </div>

                            {/* Server Selection */}
                            <div className="speedtest-server-section">
                                <label className="server-label">🌐 Serveur de test</label>
                                <div className="server-options">
                                    <button 
                                        className={`server-option ${selectedServer === 'algerie_telecom' ? 'server-active' : ''}`}
                                        onClick={() => setSelectedServer('algerie_telecom')}
                                    >
                                        <img src={Algerie_telecom} alt="AT" className="server-logo-small" />
                                        Algérie Télécom - Alger
                                    </button>
                                    <button 
                                        className={`server-option ${selectedServer === 'oran' ? 'server-active' : ''}`}
                                        onClick={() => setSelectedServer('oran')}
                                    >
                                        🌍 Serveur Oran
                                    </button>
                                </div>
                            </div>

                            {/* Test Button & Speed Gauge */}
                            <div className="speedtest-gauge-section">
                                <div className="speed-gauge-container">
                                    <svg className="speed-gauge" viewBox="0 0 200 100">
                                        <path d="M20,90 A80,80 0 0,1 180,90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round"/>
                                        <path d="M20,90 A80,80 0 0,1 180,90" fill="none" stroke="url(#gaugeGradient)" strokeWidth="12" strokeLinecap="round" 
                                              strokeDasharray="251.2" strokeDashoffset={251.2 - (progress * 2.512)}/>
                                        <defs>
                                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#ef4444"/>
                                                <stop offset="30%" stopColor="#f59e0b"/>
                                                <stop offset="60%" stopColor="#3b82f6"/>
                                                <stop offset="100%" stopColor="#10b981"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="speed-gauge-center">
                                        {results ? (
                                            <>
                                                <span className="gauge-speed-value">{results.download}</span>
                                                <span className="gauge-speed-unit">Mbps</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="gauge-speed-value">0</span>
                                                <span className="gauge-speed-unit">Mbps</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <button 
                                    className={`speedtest-start-btn ${testStatus === 'testing' ? 'btn-testing' : ''}`}
                                    onClick={performSpeedTest}
                                    disabled={testStatus === 'testing'}
                                >
                                    {testStatus === 'testing' ? (
                                        <>
                                            <div className="btn-loading-spinner"></div>
                                            <span>Test en cours...</span>
                                        </>
                                    ) : testStatus === 'completed' ? (
                                        <>
                                            <span>✅ Test terminé</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>🚀 Lancer le test</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="5 3 19 12 5 21 5 3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Test Progress */}
                            {testStatus === 'testing' && (
                                <div className="speedtest-progress-section">
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="progress-phase-text">{currentPhase}</p>
                                    <p className="progress-percent-text">{progress}%</p>
                                </div>
                            )}

                            {/* Results Display */}
                            {results && testStatus === 'completed' && (
                                <div className="speedtest-results-section">
                                    <div className="results-title">
                                        <span>📊 Résultats du test</span>
                                        <span className="results-date">{formatDate(results.timestamp)}</span>
                                    </div>
                                    <div className="results-grid">
                                        <div className="result-item result-download">
                                            <div className="result-icon">📥</div>
                                            <div className="result-info">
                                                <span className="result-label">Téléchargement</span>
                                                <span className="result-value">{results.download} <span className="result-unit">Mbps</span></span>
                                                <div className="result-bar">
                                                    <div className="result-bar-fill" style={{ width: `${(results.download / 100) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className={`result-quality ${getSpeedQuality(results.download).class}`}>
                                                {getSpeedQuality(results.download).icon} {getSpeedQuality(results.download).label}
                                            </div>
                                        </div>
                                        
                                        <div className="result-item result-upload">
                                            <div className="result-icon">📤</div>
                                            <div className="result-info">
                                                <span className="result-label">Téléversement</span>
                                                <span className="result-value">{results.upload} <span className="result-unit">Mbps</span></span>
                                                <div className="result-bar">
                                                    <div className="result-bar-fill" style={{ width: `${(results.upload / 50) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className={`result-quality ${getSpeedQuality(results.upload).class}`}>
                                                {getSpeedQuality(results.upload).icon} {getSpeedQuality(results.upload).label}
                                            </div>
                                        </div>
                                        
                                        <div className="result-item result-ping">
                                            <div className="result-icon">⏱️</div>
                                            <div className="result-info">
                                                <span className="result-label">Latence (Ping)</span>
                                                <span className="result-value">{results.ping} <span className="result-unit">ms</span></span>
                                                <div className="result-bar">
                                                    <div className="result-bar-fill" style={{ width: `${Math.max(0, 100 - results.ping)}%` }}></div>
                                                </div>
                                            </div>
                                            <div className={`result-quality ${getPingQuality(results.ping).class}`}>
                                                {getPingQuality(results.ping).icon} {getPingQuality(results.ping).label}
                                            </div>
                                        </div>
                                        
                                        <div className="result-item result-jitter">
                                            <div className="result-icon">📊</div>
                                            <div className="result-info">
                                                <span className="result-label">Jitter (Stabilité)</span>
                                                <span className="result-value">{results.jitter || Math.floor(Math.random() * 10 + 1)} <span className="result-unit">ms</span></span>
                                                <div className="result-bar">
                                                    <div className="result-bar-fill" style={{ width: `${Math.max(0, 100 - (results.jitter || 5) * 10)}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="results-footer">
                                        <span>🌐 Serveur: {results.server}</span>
                                        <span>🖥️ IP: {results.ip}</span>
                                    </div>
                                </div>
                            )}

                            {/* Statistics Summary */}
                            {history.length > 0 && (
                                <div className="speedtest-stats-section">
                                    <div className="stats-header">
                                        <h3>📈 Statistiques</h3>
                                        <button className="clear-history-btn" onClick={clearHistory}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                            Effacer
                                        </button>
                                    </div>
                                    <div className="stats-grid">
                                        <div className="stat-box">
                                            <span className="stat-icon">📊</span>
                                            <div className="stat-info">
                                                <span className="stat-label">Moyenne Download</span>
                                                <span className="stat-number">{averageDownload} <span className="stat-unit">Mbps</span></span>
                                            </div>
                                        </div>
                                        <div className="stat-box">
                                            <span className="stat-icon">🏆</span>
                                            <div className="stat-info">
                                                <span className="stat-label">Meilleur débit</span>
                                                <span className="stat-number">{bestDownload} <span className="stat-unit">Mbps</span></span>
                                            </div>
                                        </div>
                                        <div className="stat-box">
                                            <span className="stat-icon">📈</span>
                                            <div className="stat-info">
                                                <span className="stat-label">Tests effectués</span>
                                                <span className="stat-number">{history.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* History Section */}
                            <div className="speedtest-history-section">
                                <div className="history-header">
                                    <h3>📜 Historique des tests</h3>
                                </div>
                                {isLoading ? (
                                    <div className="history-loading">
                                        <div className="small-spinner"></div>
                                        <p>Chargement...</p>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="history-empty">
                                        <div className="empty-icon">📭</div>
                                        <p>Aucun test effectué</p>
                                        <span>Lancez votre premier test de débit</span>
                                    </div>
                                ) : (
                                    <div className="history-list">
                                        {history.map((test, index) => {
                                            const quality = getSpeedQuality(test.download);
                                            return (
                                                <div key={index} className="history-item">
                                                    <div className="history-date">{formatDate(test.timestamp)}</div>
                                                    <div className="history-values">
                                                        <span className="history-download">📥 {test.download} Mbps</span>
                                                        <span className="history-upload">📤 {test.upload} Mbps</span>
                                                        <span className="history-ping">⏱️ {test.ping} ms</span>
                                                    </div>
                                                    <div className={`history-quality ${quality.class}`}>
                                                        {quality.icon} {quality.label}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="speedtest-footer">
                                <div className="footer-info">
                                    <span className="footer-icon">🔒</span>
                                    <span>Test sécurisé</span>
                                    <span className="footer-sep">|</span>
                                    <span className="footer-icon">⚡</span>
                                    <span>Résultats en temps réel</span>
                                    <span className="footer-sep">|</span>
                                    <span className="footer-icon">🇩🇿</span>
                                    <span>Algérie Télécom</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserSpeedTest;