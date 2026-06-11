import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../Admin_css/AdminDashboard.css";
import "../Admin_css/Panne.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons
const criticalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const majorIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ALL ALGERIAN CITIES WITH COORDINATES (100+ cities)
const cities = {
  "Alger Centre": { lat: 36.7538, lng: 3.0588 },
  "Alger Bab Ezzouar": { lat: 36.7167, lng: 3.1833 },
  "Alger Hydra": { lat: 36.7350, lng: 3.0430 },
  "Alger Ben Aknoun": { lat: 36.7417, lng: 3.0183 },
  "Alger Birkhadem": { lat: 36.7144, lng: 3.0519 },
  "Alger Bouzaréah": { lat: 36.7650, lng: 2.9900 },
  "Alger Cheraga": { lat: 36.7683, lng: 2.9594 },
  "Alger Draria": { lat: 36.7194, lng: 2.9608 },
  "Alger El Biar": { lat: 36.7683, lng: 3.0339 },
  "Alger El Harrach": { lat: 36.7200, lng: 3.1431 },
  "Oran Centre": { lat: 35.6969, lng: -0.6331 },
  "Oran Es Senia": { lat: 35.6478, lng: -0.6239 },
  "Oran Bir El Djir": { lat: 35.7200, lng: -0.5500 },
  "Tlemcen": { lat: 34.8828, lng: -1.3150 },
  "Mansourah": { lat: 34.8719, lng: -1.3394 },
  "Maghnia": { lat: 34.8569, lng: -1.7308 },
  "Mostaganem": { lat: 35.9333, lng: 0.0833 },
  "Saïda": { lat: 34.8300, lng: 0.1517 },
  "Sidi Bel Abbès": { lat: 35.2000, lng: -0.6333 },
  "Mascara": { lat: 35.3967, lng: 0.1433 },
  "Relizane": { lat: 35.7369, lng: 0.5556 },
  "Chlef": { lat: 36.1653, lng: 1.3364 },
  "Aïn Defla": { lat: 36.2667, lng: 1.9667 },
  "Tiaret": { lat: 35.3711, lng: 1.3169 },
  "Tissemsilt": { lat: 35.6078, lng: 1.8108 },
  "Constantine": { lat: 36.3650, lng: 6.6147 },
  "Annaba": { lat: 36.9027, lng: 7.7552 },
  "Skikda": { lat: 36.8772, lng: 6.9067 },
  "Jijel": { lat: 36.8209, lng: 5.7711 },
  "El Tarf": { lat: 36.7667, lng: 8.3167 },
  "Guelma": { lat: 36.4625, lng: 7.4333 },
  "Souk Ahras": { lat: 36.2833, lng: 7.9500 },
  "Mila": { lat: 36.4500, lng: 6.2667 },
  "Oum El Bouaghi": { lat: 35.8753, lng: 7.1136 },
  "Khenchela": { lat: 35.4167, lng: 7.1333 },
  "Batna": { lat: 35.5550, lng: 6.1741 },
  "Tébessa": { lat: 35.4044, lng: 8.1211 },
  "Blida": { lat: 36.4700, lng: 2.8277 },
  "Bouira": { lat: 36.3689, lng: 3.9000 },
  "Tizi Ouzou": { lat: 36.7110, lng: 4.0459 },
  "Béjaïa": { lat: 36.7500, lng: 5.0833 },
  "Bordj Bou Arreridj": { lat: 36.0667, lng: 4.7667 },
  "BBA El Achir": { lat: 36.0639, lng: 4.6278 },
  "Médéa": { lat: 36.2675, lng: 2.7534 },
  "Aïn Oussera": { lat: 35.4394, lng: 2.9058 },
  "Djelfa": { lat: 34.6707, lng: 3.2561 },
  "M'Sila": { lat: 35.7058, lng: 4.5419 },
  "Sétif": { lat: 36.1911, lng: 5.4097 },
  "El Eulma": { lat: 36.1528, lng: 5.6903 },
  "Biskra": { lat: 34.8500, lng: 5.7333 },
  "Tolga": { lat: 34.7222, lng: 5.3783 },
  "Ouargla": { lat: 31.9493, lng: 5.3233 },
  "Hassi Messaoud": { lat: 31.7000, lng: 6.0667 },
  "El Oued": { lat: 33.3667, lng: 6.8667 },
  "Touggourt": { lat: 33.1000, lng: 6.0667 },
  "Ghardaïa": { lat: 32.4833, lng: 3.6667 },
  "Berriane": { lat: 32.8264, lng: 3.7669 },
  "Laghouat": { lat: 33.8000, lng: 2.8650 },
  "Aflou": { lat: 34.1128, lng: 2.1022 },
  "Béchar": { lat: 31.6167, lng: -2.2167 },
  "Tindouf": { lat: 27.6667, lng: -8.1333 },
  "Adrar": { lat: 27.8667, lng: -0.2833 },
  "Timimoun": { lat: 29.2500, lng: 0.2333 },
  "Illizi": { lat: 26.4833, lng: 8.4667 },
  "Djanet": { lat: 24.5500, lng: 9.4833 },
  "Tamanrasset": { lat: 22.7850, lng: 5.5228 },
  "In Salah": { lat: 27.2000, lng: 2.4833 },
  "In Amenas": { lat: 28.0500, lng: 9.5500 },
  "Bordj Badji Mokhtar": { lat: 21.3833, lng: 0.9500 },
  "Tipaza": { lat: 36.5900, lng: 2.4400 },
  "Cherchell": { lat: 36.6083, lng: 2.1919 },
  "Khemis Miliana": { lat: 36.2611, lng: 2.2203 },
  "Larbaâ": { lat: 36.5647, lng: 3.1544 },
  "Meftah": { lat: 36.6200, lng: 3.2225 },
  "Berrouaghia": { lat: 36.1350, lng: 2.9108 },
  "Bougara": { lat: 36.5417, lng: 3.0875 },
  "Sour El Ghozlane": { lat: 36.1478, lng: 3.6903 },
  "Azzazga": { lat: 36.7461, lng: 4.3733 },
  "Freha": { lat: 36.7569, lng: 4.3150 },
  "Mekla": { lat: 36.6814, lng: 4.2692 },
  "Timizart": { lat: 36.8000, lng: 4.2667 },
  "Boghni": { lat: 36.5422, lng: 3.9533 },
  "Draâ Ben Khedda": { lat: 36.7344, lng: 3.9625 },
  "Akbou": { lat: 36.4575, lng: 4.5347 },
  "El Kseur": { lat: 36.6789, lng: 4.8506 },
  "Amizour": { lat: 36.6400, lng: 4.9014 },
  "Barbacha": { lat: 36.5667, lng: 4.9667 },
  "Seddouk": { lat: 36.5483, lng: 4.6911 },
  "Feraoun": { lat: 36.5603, lng: 4.8544 }
};

const DEFAULT_COORDS = { lat: 36.7538, lng: 3.0588 };

const FitBounds = ({ pannes }) => {
  const map = useMap();
  useEffect(() => {
    if (pannes.length > 0) {
      const bounds = L.latLngBounds(pannes.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([DEFAULT_COORDS.lat, DEFAULT_COORDS.lng], 6);
    }
  }, [pannes, map]);
  return null;
};

const getCoordinatesFromLocation = (location) => {
  if (!location) return DEFAULT_COORDS;
  for (const [city, coords] of Object.entries(cities)) {
    if (location.toLowerCase().includes(city.toLowerCase())) return coords;
  }
  return DEFAULT_COORDS;
};

// Generate 150+ pannes across all cities
const generateSamplePannes = () => {
  const cityList = Object.keys(cities);
  const severities = ["critique", "majeure"];
  const types = ["reseau", "fibre", "adsl"];
  const problems = [
    "Panne réseau", "Coupure fibre", "Ralentissement", "Perte de connexion",
    "Déconnexions", "Latence élevée", "Panne DSLAM", "Câble endommagé",
    "Nœud saturé", "Panne électrique", "Routeur HS", "Liaison coupée",
    "Saturation", "DDoS", "Maintenance", "Orage", "Incendie",
    "Vol de câble", "Travaux", "Surcharge", "Update", "Bug logiciel"
  ];
  
  const samples = [];
  
  for (let i = 0; i < cityList.length; i++) {
    const city = cityList[i];
    const coords = cities[city];
    const numPannes = Math.floor(Math.random() * 4) + 2;
    
    for (let j = 0; j < numPannes; j++) {
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const problem = problems[Math.floor(Math.random() * problems.length)];
      const hoursAgo = Math.floor(Math.random() * 72);
      
      samples.push({
        id: i * 100 + j,
        title: `${problem} - ${city}`,
        location: city,
        lat: coords.lat,
        lng: coords.lng,
        type: type,
        severity: severity,
        description: `${problem} à ${city}. Impact: ${Math.floor(Math.random() * 10000) + 100} clients.`,
        affectedCustomers: Math.floor(Math.random() * 10000) + 100,
        timestamp: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
        status: "active"
      });
    }
  }
  
  return samples;
};

const Panne = () => {
  const [pannes, setPannes] = useState([]);
  const [selectedPanne, setSelectedPanne] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState("map");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statistics, setStatistics] = useState({ total: 0, critiques: 0, majeures: 0, totalCustomers: 0 });
  const [formData, setFormData] = useState({
    title: "", location: "", type: "reseau", severity: "majeure", description: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("realtime_pannes");
    if (!saved || JSON.parse(saved).length === 0) {
      const samplePannes = generateSamplePannes();
      localStorage.setItem("realtime_pannes", JSON.stringify(samplePannes));
    }
    loadPannes();
  }, []);

  const loadPannes = () => {
    const saved = JSON.parse(localStorage.getItem("realtime_pannes") || "[]");
    const validPannes = saved.map(panne => {
      if (!panne.lat || !panne.lng) {
        const coords = getCoordinatesFromLocation(panne.location);
        return { ...panne, lat: coords.lat, lng: coords.lng };
      }
      return panne;
    }).filter(p => p.status !== "resolved");
    
    setPannes(validPannes);
    updateStatistics(validPannes);
  };

  const updateStatistics = (pannesData) => {
    setStatistics({
      total: pannesData.length,
      critiques: pannesData.filter(p => p.severity === "critique").length,
      majeures: pannesData.filter(p => p.severity === "majeure").length,
      totalCustomers: pannesData.reduce((sum, p) => sum + (p.affectedCustomers || 0), 0)
    });
  };

  const addPanne = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location) return;
    
    const coords = getCoordinatesFromLocation(formData.location);
    const newPanne = {
      id: Date.now(),
      ...formData,
      lat: coords.lat,
      lng: coords.lng,
      affectedCustomers: Math.floor(Math.random() * 5000) + 100,
      timestamp: new Date().toISOString(),
      status: "active"
    };
    
    const allPannes = JSON.parse(localStorage.getItem("realtime_pannes") || "[]");
    localStorage.setItem("realtime_pannes", JSON.stringify([newPanne, ...allPannes]));
    
    loadPannes();
    setShowAddModal(false);
    setFormData({ title: "", location: "", type: "reseau", severity: "majeure", description: "" });
  };

  const resolvePanne = (id) => {
    const allPannes = JSON.parse(localStorage.getItem("realtime_pannes") || "[]");
    const updated = allPannes.map(p => 
      p.id === id ? { ...p, status: "resolved", resolvedAt: new Date().toISOString() } : p
    );
    localStorage.setItem("realtime_pannes", JSON.stringify(updated));
    loadPannes();
    if (selectedPanne?.id === id) setSelectedPanne(null);
  };

  const deletePanne = (id) => {
    if (window.confirm("Supprimer cette panne ?")) {
      const allPannes = JSON.parse(localStorage.getItem("realtime_pannes") || "[]");
      localStorage.setItem("realtime_pannes", JSON.stringify(allPannes.filter(p => p.id !== id)));
      loadPannes();
      if (selectedPanne?.id === id) setSelectedPanne(null);
    }
  };

  const getMarkerIcon = (severity) => severity === "critique" ? criticalIcon : majorIcon;
  const getSeverityLabel = (s) => s === "critique" ? "Critique" : "Majeure";
  const getTypeIcon = (t) => ({ reseau: "🌐", fibre: "🔌", adsl: "📡" }[t] || "⚠️");

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: "/admin", icon: "🏠", label: "Tableau de bord" },
    { path: "/admin/signals", icon: "📱", label: "Signalements" },
    { path: "/admin/tickets", icon: "🎫", label: "Tickets reçus" },
    { path: "/admin/techniciens", icon: "👨‍🔧", label: "Techniciens" },
    { path: "/admin/pannes", icon: "🔴", label: "Pannes temps réel", active: true },
    { path: "/admin/infrastructure", icon: "🏗️", label: "Infrastructure" },
    { path: "/admin/rapports", icon: "📊", label: "Rapports" },
    { path: "/admin/parametres", icon: "⚙️", label: "Paramètres" },
  ];

  const filteredPannes = pannes.filter(p => {
    if (filter !== "all" && p.severity !== filter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return p.title.toLowerCase().includes(s) || p.location.toLowerCase().includes(s);
    }
    return true;
  });

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
          <div className="panne-container">
            <div className="panne-header">
              <div className="header-left">
                <div>
                  <h1>🛜 Algérie Télécom - Surveillance Nationale</h1>
                  <p>{pannes.length} incidents actifs • {statistics.totalCustomers.toLocaleString()} clients affectés</p>
                </div>
              </div>
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Nouvelle panne</button>
            </div>

            <div className="stats-row">
              <div className="stat-card danger">
                <div className="stat-value">{statistics.critiques}</div>
                <div className="stat-label">Critiques 🔴</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-value">{statistics.majeures}</div>
                <div className="stat-label">Majeures 🟠</div>
              </div>
              <div className="stat-card primary">
                <div className="stat-value">{statistics.total}</div>
                <div className="stat-label">Total actives</div>
              </div>
              <div className="stat-card info">
                <div className="stat-value">{statistics.totalCustomers.toLocaleString()}</div>
                <div className="stat-label">Clients affectés</div>
              </div>
            </div>

            <div className="filters-bar">
              <div className="view-toggle-group">
                <button className={`view-toggle ${viewMode === "map" ? "active" : ""}`} onClick={() => setViewMode("map")}>🗺️ Vue Carte</button>
                <button className={`view-toggle ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>📋 Vue Liste</button>
              </div>
              <div className="filter-tabs">
                <button className={`filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Toutes ({statistics.total})</button>
                <button className={`filter-chip ${filter === "critique" ? "active" : ""}`} onClick={() => setFilter("critique")}>🔴 Critiques ({statistics.critiques})</button>
                <button className={`filter-chip ${filter === "majeure" ? "active" : ""}`} onClick={() => setFilter("majeure")}>🟠 Majeures ({statistics.majeures})</button>
              </div>
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="🔍 Rechercher par ville..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="search-input" 
                />
              </div>
            </div>

            {viewMode === "map" && (
              <div className="map-view">
                <div className="map-container-real">
                  <div className="map-header">
                    <h3>📍 Carte des incidents - {filteredPannes.length} points actifs</h3>
                    <div className="map-legend">
                      <span><span className="legend-dot critical"></span> Critique</span>
                      <span><span className="legend-dot major"></span> Majeure</span>
                    </div>
                  </div>
                  <MapContainer 
                    center={[28.0339, 1.6596]} 
                    zoom={5} 
                    style={{ height: "550px", width: "100%", borderRadius: "0 0 12px 12px" }}
                    zoomControl={true}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {filteredPannes.map(panne => (
                      <React.Fragment key={panne.id}>
                        <Marker 
                          position={[panne.lat, panne.lng]} 
                          icon={getMarkerIcon(panne.severity)} 
                          eventHandlers={{ click: () => setSelectedPanne(panne) }}
                        >
                          <Popup>
                            <div className="map-popup">
                              <h4>🚨 {panne.title}</h4>
                              <p><strong>📍 {panne.location}</strong></p>
                              <p>⚠️ {getSeverityLabel(panne.severity)}</p>
                              <p>📡 {panne.type.toUpperCase()}</p>
                              <p>👥 {panne.affectedCustomers.toLocaleString()} clients</p>
                              <button className="popup-resolve" onClick={() => resolvePanne(panne.id)}>
                                ✅ Résoudre
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                        <Circle 
                          center={[panne.lat, panne.lng]} 
                          radius={panne.severity === "critique" ? 3000 : 2000} 
                          pathOptions={{ 
                            color: panne.severity === "critique" ? "#ef4444" : "#f59e0b", 
                            fillOpacity: 0.15,
                            weight: 2
                          }} 
                        />
                      </React.Fragment>
                    ))}
                    <FitBounds pannes={filteredPannes} />
                  </MapContainer>
                </div>

                {selectedPanne && (
                  <div className="selected-panne-details">
                    <div className="details-header">
                      <h3>Détails incident</h3>
                      <button className="close-details" onClick={() => setSelectedPanne(null)}>✕</button>
                    </div>
                    <div className="details-content">
                      <div className="detail-title">{selectedPanne.title}</div>
                      <div className="detail-row">
                        <span className="detail-label">📍 Localisation</span>
                        <span className="detail-value">{selectedPanne.location}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">⚠️ Sévérité</span>
                        <span className={`detail-value ${selectedPanne.severity}`}>{getSeverityLabel(selectedPanne.severity)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">📡 Type</span>
                        <span className="detail-value">{getTypeIcon(selectedPanne.type)} {selectedPanne.type}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">👥 Clients</span>
                        <span className="detail-value">{selectedPanne.affectedCustomers.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">🕐 Signalée</span>
                        <span className="detail-value">{new Date(selectedPanne.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="details-actions">
                        <button className="btn-resolve" onClick={() => resolvePanne(selectedPanne.id)}>✅ Résoudre</button>
                        <button className="btn-delete" onClick={() => deletePanne(selectedPanne.id)}>🗑️ Supprimer</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === "list" && (
              <div className="list-view">
                {filteredPannes.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>Aucune panne active</h3>
                    <p>Tous les réseaux sont opérationnels</p>
                  </div>
                ) : (
                  <div className="pannes-list">
                    {filteredPannes.map(panne => (
                      <div key={panne.id} className={`panne-card ${panne.severity}`}>
                        <div className="panne-status-icon">{panne.severity === "critique" ? "🔴" : "🟠"}</div>
                        <div className="panne-info">
                          <div className="panne-title">{panne.title}</div>
                          <div className="panne-location">📍 {panne.location}</div>
                          <div className="panne-meta">
                            <span className="meta-badge">{getTypeIcon(panne.type)} {panne.type}</span>
                            <span className="meta-time">🕐 {new Date(panne.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="panne-customers">{panne.affectedCustomers.toLocaleString()} clients</div>
                        <div className="panne-actions">
                          <button className="action-btn view" onClick={() => setSelectedPanne(panne)}>👁️ Détails</button>
                          <button className="action-btn resolve" onClick={() => resolvePanne(panne.id)}>✅ Résoudre</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showAddModal && (
              <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>⚠️ Signaler une panne</h3>
                    <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                  </div>
                  <form onSubmit={addPanne}>
                    <div className="modal-body">
                      <div className="form-group">
                        <label>Titre</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Localisation</label>
                        <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} list="cities-list" required />
                        <datalist id="cities-list">
                          {Object.keys(cities).slice(0, 50).map(c => <option key={c} value={c} />)}
                        </datalist>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Type</label>
                          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                            <option value="reseau">🌐 Réseau</option>
                            <option value="fibre">🔌 Fibre</option>
                            <option value="adsl">📡 ADSL</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Sévérité</label>
                          <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                            <option value="majeure">🟠 Majeure</option>
                            <option value="critique">🔴 Critique</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                      <button type="submit" className="btn-primary">Signaler</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Panne;