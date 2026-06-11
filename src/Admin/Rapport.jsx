import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Admin_css/AdminDashboard.css";
import "../Admin_css/Rapport.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const Rapport = () => {
  const [activeTab, setActiveTab] = useState("pannes");
  const [dateRange, setDateRange] = useState("week");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportData, setReportData] = useState({
    pannes: [],
    infrastructure: [],
    statistics: {}
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const navigate = useNavigate();

  // Algerian cities list
  const cities = [
    "Alger", "Oran", "Constantine", "Annaba", "Tizi Ouzou", "Blida", "Sétif",
    "Béjaïa", "Tlemcen", "Ouargla", "Batna", "Djelfa", "Biskra", "Ghardaïa",
    "Tamanrasset", "Béchar", "Adrar", "Illizi", "Laghouat", "Médéa", "Mostaganem",
    "Chlef", "Tiaret", "Tébessa", "Skikda", "Jijel", "El Oued", "Khenchela"
  ];

  // Load data from localStorage
  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = () => {
    const pannes = JSON.parse(localStorage.getItem("realtime_pannes") || "[]");
    const infrastructure = JSON.parse(localStorage.getItem("infrastructure") || "[]");
    
    setReportData({
      pannes,
      infrastructure,
      statistics: calculateStatistics(pannes, infrastructure)
    });
  };

  const calculateStatistics = (pannes, infrastructure) => {
    const activePannes = pannes.filter(p => p.status !== "resolved");
    const resolvedPannes = pannes.filter(p => p.status === "resolved");
    
    let totalResolutionTime = 0;
    resolvedPannes.forEach(panne => {
      if (panne.resolvedAt) {
        const start = new Date(panne.timestamp);
        const end = new Date(panne.resolvedAt);
        totalResolutionTime += (end - start) / (1000 * 60 * 60);
      }
    });
    const avgResolutionTime = resolvedPannes.length > 0 
      ? (totalResolutionTime / resolvedPannes.length).toFixed(1) 
      : 0;
    
    const pannesByCity = {};
    activePannes.forEach(panne => {
      const city = panne.location;
      if (!pannesByCity[city]) {
        pannesByCity[city] = { critique: 0, majeure: 0, total: 0 };
      }
      pannesByCity[city][panne.severity]++;
      pannesByCity[city].total++;
    });
    
    const pannesByType = {
      reseau: activePannes.filter(p => p.type === "reseau").length,
      fibre: activePannes.filter(p => p.type === "fibre").length,
      adsl: activePannes.filter(p => p.type === "adsl").length
    };
    
    const infraByType = {
      datacenter: infrastructure.filter(i => i.type === "datacenter").length,
      antenna: infrastructure.filter(i => i.type === "antenna").length,
      fiberNode: infrastructure.filter(i => i.type === "fiberNode").length,
      dslam: infrastructure.filter(i => i.type === "dslam").length
    };
    
    const infraByStatus = {
      operational: infrastructure.filter(i => i.status === "operational").length,
      maintenance: infrastructure.filter(i => i.status === "maintenance").length,
      degraded: infrastructure.filter(i => i.status === "degraded").length
    };
    
    const totalAffected = activePannes.reduce((sum, p) => sum + (p.affectedCustomers || 0), 0);
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayPannes = pannes.filter(p => {
        const pDate = new Date(p.timestamp);
        pDate.setHours(0, 0, 0, 0);
        return pDate.getTime() === date.getTime();
      });
      
      last7Days.push({
        date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        count: dayPannes.length,
        critiques: dayPannes.filter(p => p.severity === "critique").length
      });
    }
    
    return {
      totalPannes: activePannes.length,
      totalResolved: resolvedPannes.length,
      critiques: activePannes.filter(p => p.severity === "critique").length,
      majeures: activePannes.filter(p => p.severity === "majeure").length,
      avgResolutionTime,
      totalAffected,
      pannesByCity,
      pannesByType,
      infraByType,
      infraByStatus,
      last7Days,
      operationalRate: infrastructure.length > 0 
        ? ((infraByStatus.operational / infrastructure.length) * 100).toFixed(1)
        : 0
    };
  };

  const getFilteredData = () => {
    let filteredPannes = [...reportData.pannes];
    let filteredInfra = [...reportData.infrastructure];
    
    const now = new Date();
    let startDate = new Date();
    
    switch(dateRange) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    filteredPannes = filteredPannes.filter(p => new Date(p.timestamp) >= startDate);
    
    if (selectedCity !== "all") {
      filteredPannes = filteredPannes.filter(p => 
        p.location?.toLowerCase().includes(selectedCity.toLowerCase())
      );
      filteredInfra = filteredInfra.filter(i => 
        i.city?.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }
    
    return { filteredPannes, filteredInfra };
  };

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("Rapport généré avec succès !");
    }, 1500);
  };

  const exportReport = () => {
    const { filteredPannes, filteredInfra } = getFilteredData();
    const stats = calculateStatistics(filteredPannes, filteredInfra);
    
    const reportContent = `
      RAPPORT D'ACTIVITÉ - ALGÉRIE TÉLÉCOM
      Date: ${new Date().toLocaleString("fr-FR")}
      Période: ${dateRange === "day" ? "24 heures" : dateRange === "week" ? "7 jours" : dateRange === "month" ? "30 jours" : "12 mois"}
      Ville: ${selectedCity === "all" ? "Toutes les villes" : selectedCity}
      
      ========== STATISTIQUES DES PANNES ==========
      • Total pannes actives: ${stats.totalPannes}
      • Pannes critiques: ${stats.critiques}
      • Pannes majeures: ${stats.majeures}
      • Pannes résolues: ${stats.totalResolved}
      • Temps moyen de résolution: ${stats.avgResolutionTime} heures
      • Clients affectés: ${stats.totalAffected.toLocaleString()}
      
      ========== STATISTIQUES INFRASTRUCTURE ==========
      • Data Centers: ${stats.infraByType.datacenter}
      • Antennes: ${stats.infraByType.antenna}
      • Nœuds Fibre: ${stats.infraByType.fiberNode}
      • DSLAMs: ${stats.infraByType.dslam}
      • Taux opérationnel: ${stats.operationalRate}%
      
      ========== RÉPARTITION PAR VILLE ==========
      ${Object.entries(stats.pannesByCity).map(([city, data]) => 
        `• ${city}: ${data.total} pannes (${data.critique} critiques, ${data.majeure} majeures)`
      ).join("\n")}
      
      ========== TENDANCE 7 JOURS ==========
      ${stats.last7Days.map(day => 
        `• ${day.date}: ${day.count} pannes (${day.critiques} critiques)`
      ).join("\n")}
    `;
    
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
    { path: "/admin/rapports", icon: "📊", label: "Rapports", active: true },
    { path: "/admin/parametres", icon: "⚙️", label: "Paramètres" },
  ];

  const { filteredPannes, filteredInfra } = getFilteredData();
  const stats = calculateStatistics(filteredPannes, filteredInfra);

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
          <div className="rapport-container">
            <div className="rapport-header">
              <div className="header-left">
                <div>
                  <h1>📊 Rapports & Analyses</h1>
                  <p>Générez des rapports détaillés sur les pannes et l'infrastructure</p>
                </div>
              </div>
              <div className="header-actions">
                <button className="btn-primary" onClick={generateReport} disabled={isGenerating}>
                  {isGenerating ? "⏳ Génération..." : "🔄 Générer Rapport"}
                </button>
                <button className="btn-secondary" onClick={exportReport}>
                  📥 Exporter
                </button>
              </div>
            </div>

            <div className="filters-bar">
              <div className="filter-group">
                <label>Période:</label>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option value="day">24 dernières heures</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                  <option value="year">12 derniers mois</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Ville:</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                  <option value="all">Toutes les villes</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Type de rapport:</label>
                <div className="tab-buttons">
                  <button className={`tab-btn ${activeTab === "pannes" ? "active" : ""}`} onClick={() => setActiveTab("pannes")}>
                    📋 Pannes
                  </button>
                  <button className={`tab-btn ${activeTab === "infrastructure" ? "active" : ""}`} onClick={() => setActiveTab("infrastructure")}>
                    🏗️ Infrastructure
                  </button>
                  <button className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
                    📈 Analyses
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon">🚨</div>
                <div className="kpi-value">{stats.totalPannes}</div>
                <div className="kpi-label">Pannes actives</div>
                <div className="kpi-trend">{stats.critiques} critiques</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon">✅</div>
                <div className="kpi-value">{stats.totalResolved}</div>
                <div className="kpi-label">Pannes résolues</div>
                <div className="kpi-trend">Moy. {stats.avgResolutionTime}h</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon">👥</div>
                <div className="kpi-value">{stats.totalAffected.toLocaleString()}</div>
                <div className="kpi-label">Clients affectés</div>
                <div className="kpi-trend">Impact total</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon">📡</div>
                <div className="kpi-value">{stats.operationalRate}%</div>
                <div className="kpi-label">Disponibilité réseau</div>
                <div className="kpi-trend">Infrastructure</div>
              </div>
            </div>

            {/* Main Content */}
            <div className="rapport-content">
              {activeTab === "pannes" && (
                <>
                  <div className="report-section">
                    <h2>📊 Répartition des pannes par type</h2>
                    <div className="stats-grid-3">
                      <div className="stat-box reseau">
                        <div className="stat-icon">🌐</div>
                        <div className="stat-number">{stats.pannesByType.reseau}</div>
                        <div className="stat-name">Réseau général</div>
                        <div className="stat-percent">
                          {((stats.pannesByType.reseau / stats.totalPannes) * 100 || 0).toFixed(1)}%
                        </div>
                      </div>
                      <div className="stat-box fibre">
                        <div className="stat-icon">🔌</div>
                        <div className="stat-number">{stats.pannesByType.fibre}</div>
                        <div className="stat-name">Fibre optique</div>
                        <div className="stat-percent">
                          {((stats.pannesByType.fibre / stats.totalPannes) * 100 || 0).toFixed(1)}%
                        </div>
                      </div>
                      <div className="stat-box adsl">
                        <div className="stat-icon">📡</div>
                        <div className="stat-number">{stats.pannesByType.adsl}</div>
                        <div className="stat-name">ADSL</div>
                        <div className="stat-percent">
                          {((stats.pannesByType.adsl / stats.totalPannes) * 100 || 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h2>📍 Top villes les plus affectées</h2>
                    <div className="city-ranking">
                      {Object.entries(stats.pannesByCity)
                        .sort((a, b) => b[1].total - a[1].total)
                        .slice(0, 10)
                        .map(([city, data], index) => (
                          <div key={city} className="city-rank-item">
                            <div className="rank-number">{index + 1}</div>
                            <div className="city-info">
                              <div className="city-name">{city}</div>
                              <div className="city-stats">
                                <span className="critique-count">🔴 {data.critique}</span>
                                <span className="majeure-count">🟠 {data.majeure}</span>
                              </div>
                            </div>
                            <div className="city-total">{data.total} pannes</div>
                            <div className="city-bar">
                              <div 
                                className="city-bar-fill" 
                                style={{ 
                                  width: `${(data.total / (Object.values(stats.pannesByCity)[0]?.total || 1)) * 100}%`,
                                  background: data.critique > data.majeure ? "#ef4444" : "#f59e0b"
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="report-section">
                    <h2>📈 Tendance des 7 derniers jours</h2>
                    <div className="trend-chart">
                      {stats.last7Days.map((day, index) => (
                        <div key={index} className="trend-bar-container">
                          <div className="trend-label">{day.date}</div>
                          <div className="trend-bars">
                            <div 
                              className="trend-bar critiques" 
                              style={{ height: `${Math.min(day.critiques * 8, 100)}px` }}
                              title={`${day.critiques} critiques`}
                            />
                            <div 
                              className="trend-bar total" 
                              style={{ height: `${Math.min(day.count * 4, 100)}px` }}
                              title={`${day.count} total`}
                            />
                          </div>
                          <div className="trend-values">
                            <span className="critique-value">{day.critiques}</span>
                            <span className="total-value">{day.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="chart-legend">
                      <span><span className="legend-color critique-color"></span> Critiques</span>
                      <span><span className="legend-color total-color"></span> Total pannes</span>
                    </div>
                  </div>

                  <div className="report-section">
                    <h2>🕐 Dernières pannes signalées</h2>
                    <div className="recent-list">
                      {filteredPannes.slice(0, 10).map(panne => (
                        <div key={panne.id} className="recent-item">
                          <div className={`recent-severity ${panne.severity}`}>
                            {panne.severity === "critique" ? "🔴" : "🟠"}
                          </div>
                          <div className="recent-info">
                            <div className="recent-title">{panne.title}</div>
                            <div className="recent-location">📍 {panne.location}</div>
                            <div className="recent-meta">
                              <span>📡 {panne.type}</span>
                              <span>👥 {panne.affectedCustomers?.toLocaleString() || 0} clients</span>
                            </div>
                          </div>
                          <div className="recent-date">
                            {new Date(panne.timestamp).toLocaleString("fr-FR")}
                          </div>
                        </div>
                      ))}
                      {filteredPannes.length === 0 && (
                        <div className="empty-state">
                          <div className="empty-icon">✅</div>
                          <p>Aucune panne dans la période sélectionnée</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "infrastructure" && (
                <>
                  <div className="report-section">
                    <h2>🏗️ Répartition de l'infrastructure</h2>
                    <div className="stats-grid-4">
                      <div className="stat-box datacenter">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-number">{stats.infraByType.datacenter}</div>
                        <div className="stat-name">Data Centers</div>
                      </div>
                      <div className="stat-box antenna">
                        <div className="stat-icon">📡</div>
                        <div className="stat-number">{stats.infraByType.antenna}</div>
                        <div className="stat-name">Antennes</div>
                      </div>
                      <div className="stat-box fiber">
                        <div className="stat-icon">🔌</div>
                        <div className="stat-number">{stats.infraByType.fiberNode}</div>
                        <div className="stat-name">Nœuds Fibre</div>
                      </div>
                      <div className="stat-box dslam">
                        <div className="stat-icon">🖥️</div>
                        <div className="stat-number">{stats.infraByType.dslam}</div>
                        <div className="stat-name">DSLAMs</div>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h2>⚙️ Statut de l'infrastructure</h2>
                    <div className="status-stats">
                      <div className="status-item operational">
                        <div className="status-dot"></div>
                        <div className="status-info">
                          <div className="status-label">Opérationnel</div>
                          <div className="status-count">{stats.infraByStatus.operational}</div>
                        </div>
                        <div className="status-percent">
                          {((stats.infraByStatus.operational / (filteredInfra.length || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="status-item maintenance">
                        <div className="status-dot"></div>
                        <div className="status-info">
                          <div className="status-label">En maintenance</div>
                          <div className="status-count">{stats.infraByStatus.maintenance}</div>
                        </div>
                        <div className="status-percent">
                          {((stats.infraByStatus.maintenance / (filteredInfra.length || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="status-item degraded">
                        <div className="status-dot"></div>
                        <div className="status-info">
                          <div className="status-label">Dégradé</div>
                          <div className="status-count">{stats.infraByStatus.degraded}</div>
                        </div>
                        <div className="status-percent">
                          {((stats.infraByStatus.degraded / (filteredInfra.length || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="status-progress">
                      <div 
                        className="progress-operational" 
                        style={{ width: `${(stats.infraByStatus.operational / (filteredInfra.length || 1)) * 100}%` }}
                      />
                      <div 
                        className="progress-maintenance" 
                        style={{ width: `${(stats.infraByStatus.maintenance / (filteredInfra.length || 1)) * 100}%` }}
                      />
                      <div 
                        className="progress-degraded" 
                        style={{ width: `${(stats.infraByStatus.degraded / (filteredInfra.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="report-section">
                    <h2>📋 Liste des équipements</h2>
                    <div className="infra-table">
                      <div className="table-header">
                        <span>Type</span>
                        <span>Nom</span>
                        <span>Ville</span>
                        <span>Statut</span>
                      </div>
                      {filteredInfra.slice(0, 20).map(infra => (
                        <div key={infra.id} className="table-row">
                          <span className="infra-type">{infra.type === "datacenter" ? "🏢" : infra.type === "antenna" ? "📡" : infra.type === "fiberNode" ? "🔌" : "🖥️"}</span>
                          <span>{infra.name}</span>
                          <span>{infra.city}</span>
                          <span className={`status-badge ${infra.status}`}>
                            {infra.status === "operational" ? "✅" : infra.status === "maintenance" ? "🔧" : "⚠️"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "analytics" && (
                <>
                  <div className="report-section">
                    <h2>💡 Insights clés</h2>
                    <div className="insights-grid">
                      <div className="insight-card">
                        <div className="insight-icon">⚠️</div>
                        <div className="insight-content">
                          <div className="insight-title">Criticité élevée</div>
                          <div className="insight-value">{stats.critiques} pannes critiques</div>
                          <div className="insight-desc">
                            {stats.critiques > 5 
                              ? "Niveau d'alerte élevé - Intervention urgente requise" 
                              : "Niveau de criticité sous contrôle"}
                          </div>
                        </div>
                      </div>
                      <div className="insight-card">
                        <div className="insight-icon">⏱️</div>
                        <div className="insight-content">
                          <div className="insight-title">Temps de résolution</div>
                          <div className="insight-value">{stats.avgResolutionTime} heures</div>
                          <div className="insight-desc">
                            {stats.avgResolutionTime < 4 
                              ? "Excellent - Résolution rapide" 
                              : stats.avgResolutionTime < 8 
                              ? "Correct - Peut être amélioré" 
                              : "Lent - Nécessite optimisation"}
                          </div>
                        </div>
                      </div>
                      <div className="insight-card">
                        <div className="insight-icon">🏙️</div>
                        <div className="insight-content">
                          <div className="insight-title">Ville critique</div>
                          <div className="insight-value">
                            {Object.entries(stats.pannesByCity)
                              .sort((a, b) => b[1].critique - a[1].critique)[0]?.[0] || "N/A"}
                          </div>
                          <div className="insight-desc">
                            Plus haut taux de pannes critiques
                          </div>
                        </div>
                      </div>
                      <div className="insight-card">
                        <div className="insight-icon">📊</div>
                        <div className="insight-content">
                          <div className="insight-title">Type le plus affecté</div>
                          <div className="insight-value">
                            {Object.entries(stats.pannesByType)
                              .sort((a, b) => b[1] - a[1])[0]?.[0] === "reseau" ? "Réseau" :
                             Object.entries(stats.pannesByType).sort((a, b) => b[1] - a[1])[0]?.[0] === "fibre" ? "Fibre" : "ADSL"}
                          </div>
                          <div className="insight-desc">
                            Infrastructure la plus vulnérable
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h2>🎯 Recommandations</h2>
                    <div className="recommendations-list">
                      {stats.critiques > 10 && (
                        <div className="recommendation-item high">
                          <div className="rec-icon">🔴</div>
                          <div className="rec-content">
                            <strong>Action urgente:</strong> Augmenter les équipes techniques dans les zones à forte criticité
                          </div>
                        </div>
                      )}
                      {stats.avgResolutionTime > 6 && (
                        <div className="recommendation-item medium">
                          <div className="rec-icon">🟠</div>
                          <div className="rec-content">
                            <strong>Optimisation:</strong> Réduire le temps moyen de résolution en améliorant les processus
                          </div>
                        </div>
                      )}
                      {stats.pannesByType.fibre > stats.pannesByType.reseau && (
                        <div className="recommendation-item medium">
                          <div className="rec-icon">🔌</div>
                          <div className="rec-content">
                            <strong>Investissement:</strong> Renforcer la redondance sur le réseau fibre optique
                          </div>
                        </div>
                      )}
                      <div className="recommendation-item low">
                        <div className="rec-icon">📊</div>
                        <div className="rec-content">
                          <strong>Monitoring:</strong> Mettre en place une surveillance proactive des équipements critiques
                        </div>
                      </div>
                      <div className="recommendation-item low">
                        <div className="rec-icon">👥</div>
                        <div className="rec-content">
                          <strong>Communication:</strong> Améliorer la communication avec les clients affectés
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h2>📊 Résumé de performance</h2>
                    <div className="performance-grid">
                      <div className="perf-item">
                        <div className="perf-label">Disponibilité réseau</div>
                        <div className="perf-value">{stats.operationalRate}%</div>
                        <div className={`perf-status ${stats.operationalRate > 95 ? "good" : stats.operationalRate > 85 ? "medium" : "bad"}`}>
                          {stats.operationalRate > 95 ? "Excellent" : stats.operationalRate > 85 ? "Correct" : "Critique"}
                        </div>
                      </div>
                      <div className="perf-item">
                        <div className="perf-label">Efficacité résolution</div>
                        <div className="perf-value">{stats.avgResolutionTime}h</div>
                        <div className={`perf-status ${stats.avgResolutionTime < 4 ? "good" : stats.avgResolutionTime < 8 ? "medium" : "bad"}`}>
                          {stats.avgResolutionTime < 4 ? "Rapide" : stats.avgResolutionTime < 8 ? "Moyen" : "Lent"}
                        </div>
                      </div>
                      <div className="perf-item">
                        <div className="perf-label">Couverture infrastructure</div>
                        <div className="perf-value">{filteredInfra.length}</div>
                        <div className="perf-status good">Déployé</div>
                      </div>
                      <div className="perf-item">
                        <div className="perf-label">Score global</div>
                        <div className="perf-value">
                          {Math.round(
                            (stats.operationalRate / 100) * 40 +
                            (1 - Math.min(stats.avgResolutionTime / 12, 1)) * 30 +
                            (1 - Math.min(stats.critiques / 20, 1)) * 30
                          )}%
                        </div>
                        <div className={`perf-status ${Math.round(
                          (stats.operationalRate / 100) * 40 +
                          (1 - Math.min(stats.avgResolutionTime / 12, 1)) * 30 +
                          (1 - Math.min(stats.critiques / 20, 1)) * 30
                        ) > 70 ? "good" : "medium"}`}>
                          {Math.round(
                            (stats.operationalRate / 100) * 40 +
                            (1 - Math.min(stats.avgResolutionTime / 12, 1)) * 30 +
                            (1 - Math.min(stats.critiques / 20, 1)) * 30
                          ) > 70 ? "Bon" : "À améliorer"}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rapport;