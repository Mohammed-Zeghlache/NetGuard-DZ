import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../Admin_css/AdminDashboard.css";
import "../Admin_css/Infrastructure.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different infrastructure types
const datacenterIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const antennaIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const fiberNodeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dslIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Algerian cities with coordinates
const cities = {
  "Alger Centre": { lat: 36.7538, lng: 3.0588 },
  "Oran": { lat: 35.6969, lng: -0.6331 },
  "Constantine": { lat: 36.3650, lng: 6.6147 },
  "Annaba": { lat: 36.9027, lng: 7.7552 },
  "Tizi Ouzou": { lat: 36.7110, lng: 4.0459 },
  "Blida": { lat: 36.4700, lng: 2.8277 },
  "Sétif": { lat: 36.1911, lng: 5.4097 },
  "Béjaïa": { lat: 36.7500, lng: 5.0833 },
  "Tlemcen": { lat: 34.8828, lng: -1.3150 },
  "Ouargla": { lat: 31.9493, lng: 5.3233 },
  "Batna": { lat: 35.5550, lng: 6.1741 },
  "Djelfa": { lat: 34.6707, lng: 3.2561 },
  "Biskra": { lat: 34.8500, lng: 5.7333 },
  "Ghardaïa": { lat: 32.4833, lng: 3.6667 },
  "Tamanrasset": { lat: 22.7850, lng: 5.5228 },
  "Béchar": { lat: 31.6167, lng: -2.2167 },
  "Adrar": { lat: 27.8667, lng: -0.2833 },
  "Illizi": { lat: 26.4833, lng: 8.4667 },
  "Laghouat": { lat: 33.8000, lng: 2.8650 },
  "Médéa": { lat: 36.2675, lng: 2.7534 },
  "Mostaganem": { lat: 35.9333, lng: 0.0833 },
  "Chlef": { lat: 36.1653, lng: 1.3364 },
  "Tiaret": { lat: 35.3711, lng: 1.3169 },
  "Tébessa": { lat: 35.4044, lng: 8.1211 },
  "Skikda": { lat: 36.8772, lng: 6.9067 },
  "Jijel": { lat: 36.8209, lng: 5.7711 },
  "El Oued": { lat: 33.3667, lng: 6.8667 },
  "Khenchela": { lat: 35.4167, lng: 7.1333 },
  "Mila": { lat: 36.4500, lng: 6.2667 },
  "Souk Ahras": { lat: 36.2833, lng: 7.9500 },
  "Tipaza": { lat: 36.5900, lng: 2.4400 },
  "Aïn Defla": { lat: 36.2667, lng: 1.9667 },
  "Naâma": { lat: 33.2667, lng: -0.3167 },
  "Tindouf": { lat: 27.6667, lng: -8.1333 },
  "Timimoun": { lat: 29.2500, lng: 0.2333 },
  "In Salah": { lat: 27.2000, lng: 2.4833 },
  "Djanet": { lat: 24.5500, lng: 9.4833 }
};

const DEFAULT_COORDS = { lat: 36.7538, lng: 3.0588 };

const FitBounds = ({ infrastructures }) => {
  const map = useMap();
  useEffect(() => {
    if (infrastructures.length > 0) {
      const bounds = L.latLngBounds(infrastructures.map(inf => [inf.lat, inf.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [infrastructures, map]);
  return null;
};

// Generate infrastructure data
const generateInfrastructure = () => {
  const infra = [];
  
  const dataCenters = [
    { name: "Data Center Central", city: "Alger Centre", capacity: "10 Gbps", servers: 250 },
    { name: "Data Center Ouest", city: "Oran", capacity: "8 Gbps", servers: 180 },
    { name: "Data Center Est", city: "Constantine", capacity: "8 Gbps", servers: 175 },
    { name: "Data Center Annaba", city: "Annaba", capacity: "5 Gbps", servers: 120 },
    { name: "Data Center Tizi", city: "Tizi Ouzou", capacity: "4 Gbps", servers: 90 },
    { name: "Data Center Sétif", city: "Sétif", capacity: "4 Gbps", servers: 85 },
    { name: "Data Center Tlemcen", city: "Tlemcen", capacity: "3 Gbps", servers: 70 },
    { name: "Data Center Sud", city: "Ouargla", capacity: "3 Gbps", servers: 65 }
  ];
  
  const antennas = [];
  const antennaCities = ["Alger Centre", "Oran", "Constantine", "Annaba", "Tizi Ouzou", "Blida", "Sétif", "Béjaïa", "Tlemcen", "Batna", "Biskra", "Djelfa"];
  
  antennaCities.forEach(city => {
    const numAntennas = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numAntennas; i++) {
      antennas.push({
        name: `Antenne ${String.fromCharCode(65 + i)} - ${city}`,
        city: city,
        type: "4G/5G",
        coverage: `${Math.floor(Math.random() * 5) + 2} km`,
        frequency: i % 2 === 0 ? "1800 MHz" : "2600 MHz"
      });
    }
  });
  
  const fiberNodes = [];
  const fiberCities = Object.keys(cities);
  
  fiberCities.forEach(city => {
    const numNodes = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < numNodes; i++) {
      fiberNodes.push({
        name: `Nœud Fibre ${i + 1} - ${city}`,
        city: city,
        type: "GPON",
        ports: Math.floor(Math.random() * 100) + 50,
        speed: "1 Gbps"
      });
    }
  });
  
  const dslams = [];
  const dslamCities = Object.keys(cities);
  
  dslamCities.forEach(city => {
    const numDslam = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numDslam; i++) {
      dslams.push({
        name: `DSLAM ${i + 1} - ${city}`,
        city: city,
        type: "VDSL2",
        ports: Math.floor(Math.random() * 500) + 200,
        technology: "ADSL2+"
      });
    }
  });
  
  // Combine all infrastructure
  dataCenters.forEach((dc, idx) => {
    const coords = cities[dc.city] || DEFAULT_COORDS;
    infra.push({
      id: idx + 1,
      ...dc,
      lat: coords.lat,
      lng: coords.lng,
      type: "datacenter",
      status: "operational",
      uptime: "99.99%",
      lastMaintenance: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString()
    });
  });
  
  antennas.forEach((ant, idx) => {
    const coords = cities[ant.city] || DEFAULT_COORDS;
    infra.push({
      id: 1000 + idx,
      ...ant,
      lat: coords.lat + (Math.random() - 0.5) * 0.05,
      lng: coords.lng + (Math.random() - 0.5) * 0.05,
      type: "antenna",
      status: Math.random() > 0.9 ? "maintenance" : "operational",
      signalStrength: Math.floor(Math.random() * 40) + 60
    });
  });
  
  fiberNodes.forEach((node, idx) => {
    const coords = cities[node.city] || DEFAULT_COORDS;
    infra.push({
      id: 2000 + idx,
      ...node,
      lat: coords.lat + (Math.random() - 0.5) * 0.03,
      lng: coords.lng + (Math.random() - 0.5) * 0.03,
      type: "fiberNode",
      status: "operational",
      utilization: Math.floor(Math.random() * 50) + 30
    });
  });
  
  dslams.forEach((dslam, idx) => {
    const coords = cities[dslam.city] || DEFAULT_COORDS;
    infra.push({
      id: 3000 + idx,
      ...dslam,
      lat: coords.lat + (Math.random() - 0.5) * 0.02,
      lng: coords.lng + (Math.random() - 0.5) * 0.02,
      type: "dslam",
      status: Math.random() > 0.95 ? "degraded" : "operational",
      load: Math.floor(Math.random() * 80) + 20
    });
  });
  
  return infra;
};

const getInfrastructureIcon = (type) => {
  switch(type) {
    case "datacenter": return datacenterIcon;
    case "antenna": return antennaIcon;
    case "fiberNode": return fiberNodeIcon;
    case "dslam": return dslIcon;
    default: return datacenterIcon;
  }
};

const getStatusBadge = (status) => {
  switch(status) {
    case "operational": return <span className="status-badge operational">✅ Opérationnel</span>;
    case "maintenance": return <span className="status-badge maintenance">🔧 Maintenance</span>;
    case "degraded": return <span className="status-badge degraded">⚠️ Dégradé</span>;
    default: return <span className="status-badge unknown">❓ Inconnu</span>;
  }
};

const Infrastructure = () => {
  const [infrastructure, setInfrastructure] = useState([]);
  const [selectedInfra, setSelectedInfra] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("map");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    type: "datacenter"
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    datacenters: 0,
    antennas: 0,
    fiberNodes: 0,
    dslams: 0,
    operational: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("infrastructure");
    if (!saved || JSON.parse(saved).length === 0) {
      const infraData = generateInfrastructure();
      localStorage.setItem("infrastructure", JSON.stringify(infraData));
    }
    loadInfrastructure();
  }, []);

  const loadInfrastructure = () => {
    const saved = JSON.parse(localStorage.getItem("infrastructure") || "[]");
    setInfrastructure(saved);
    updateStatistics(saved);
  };

  const updateStatistics = (data) => {
    setStatistics({
      total: data.length,
      datacenters: data.filter(i => i.type === "datacenter").length,
      antennas: data.filter(i => i.type === "antenna").length,
      fiberNodes: data.filter(i => i.type === "fiberNode").length,
      dslams: data.filter(i => i.type === "dslam").length,
      operational: data.filter(i => i.status === "operational").length
    });
  };

  const updateStatus = (id, newStatus) => {
    const allInfra = JSON.parse(localStorage.getItem("infrastructure") || "[]");
    const updated = allInfra.map(infra => 
      infra.id === id ? { ...infra, status: newStatus, lastMaintenance: new Date().toISOString() } : infra
    );
    localStorage.setItem("infrastructure", JSON.stringify(updated));
    loadInfrastructure();
    if (selectedInfra?.id === id) setSelectedInfra(null);
  };

  const addInfrastructure = (e) => {
    e.preventDefault();
    const coords = cities[formData.city] || DEFAULT_COORDS;
    const newInfra = {
      id: Date.now(),
      name: formData.name,
      city: formData.city,
      lat: coords.lat + (Math.random() - 0.5) * 0.02,
      lng: coords.lng + (Math.random() - 0.5) * 0.02,
      type: formData.type,
      status: "operational",
      ...(formData.type === "datacenter" && { capacity: "1 Gbps", servers: 10 }),
      ...(formData.type === "antenna" && { coverage: "2 km", frequency: "1800 MHz" }),
      ...(formData.type === "fiberNode" && { ports: 48, speed: "1 Gbps" }),
      ...(formData.type === "dslam" && { ports: 200, technology: "ADSL2+" })
    };
    
    const allInfra = JSON.parse(localStorage.getItem("infrastructure") || "[]");
    localStorage.setItem("infrastructure", JSON.stringify([newInfra, ...allInfra]));
    loadInfrastructure();
    setShowAddModal(false);
    setFormData({ name: "", city: "", type: "datacenter" });
  };

  const deleteInfrastructure = (id) => {
    if (window.confirm("Supprimer cette infrastructure ?")) {
      const allInfra = JSON.parse(localStorage.getItem("infrastructure") || "[]");
      localStorage.setItem("infrastructure", JSON.stringify(allInfra.filter(i => i.id !== id)));
      loadInfrastructure();
      if (selectedInfra?.id === id) setSelectedInfra(null);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "datacenter": return "🏢";
      case "antenna": return "📡";
      case "fiberNode": return "🔌";
      case "dslam": return "🖥️";
      default: return "📍";
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case "datacenter": return "Data Center";
      case "antenna": return "Antenne";
      case "fiberNode": return "Nœud Fibre";
      case "dslam": return "DSLAM";
      default: return type;
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
    { path: "/admin/infrastructure", icon: "🏗️", label: "Infrastructure", active: true },
    { path: "/admin/rapports", icon: "📊", label: "Rapports" },
    { path: "/admin/parametres", icon: "⚙️", label: "Paramètres" },
  ];

  const filteredInfrastructure = infrastructure.filter(infra => {
    if (filter !== "all" && infra.type !== filter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return infra.name.toLowerCase().includes(s) || infra.city.toLowerCase().includes(s);
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
          <div className="infrastructure-container">
            <div className="infra-header">
              <div className="header-left">
                <div>
                  <h1>🏗️ Infrastructure Réseau Nationale</h1>
                  <p>{statistics.total} équipements déployés • {statistics.operational} opérationnels</p>
                </div>
              </div>
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Ajouter équipement</button>
            </div>

            <div className="stats-row">
              <div className="stat-card datacenter">
                <div className="stat-value">{statistics.datacenters}</div>
                <div className="stat-label">🏢 Data Centers</div>
              </div>
              <div className="stat-card antenna">
                <div className="stat-value">{statistics.antennas}</div>
                <div className="stat-label">📡 Antennes</div>
              </div>
              <div className="stat-card fiber">
                <div className="stat-value">{statistics.fiberNodes}</div>
                <div className="stat-label">🔌 Nœuds Fibre</div>
              </div>
              <div className="stat-card dslam">
                <div className="stat-value">{statistics.dslams}</div>
                <div className="stat-label">🖥️ DSLAMs</div>
              </div>
            </div>

            <div className="filters-bar">
              <div className="view-toggle-group">
                <button className={`view-toggle ${viewMode === "map" ? "active" : ""}`} onClick={() => setViewMode("map")}>🗺️ Vue Carte</button>
                <button className={`view-toggle ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>📋 Vue Liste</button>
              </div>
              <div className="filter-tabs">
                <button className={`filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Tous ({statistics.total})</button>
                <button className={`filter-chip ${filter === "datacenter" ? "active" : ""}`} onClick={() => setFilter("datacenter")}>🏢 DC ({statistics.datacenters})</button>
                <button className={`filter-chip ${filter === "antenna" ? "active" : ""}`} onClick={() => setFilter("antenna")}>📡 Antennes ({statistics.antennas})</button>
                <button className={`filter-chip ${filter === "fiberNode" ? "active" : ""}`} onClick={() => setFilter("fiberNode")}>🔌 Fibre ({statistics.fiberNodes})</button>
                <button className={`filter-chip ${filter === "dslam" ? "active" : ""}`} onClick={() => setFilter("dslam")}>🖥️ DSLAM ({statistics.dslams})</button>
              </div>
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="🔍 Rechercher équipement..." 
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
                    <h3>📍 Cartographie des infrastructures - {filteredInfrastructure.length} points</h3>
                    <div className="map-legend">
                      <span><span className="legend-dot datacenter"></span> Data Center</span>
                      <span><span className="legend-dot antenna"></span> Antenne</span>
                      <span><span className="legend-dot fiber"></span> Nœud Fibre</span>
                      <span><span className="legend-dot dslam"></span> DSLAM</span>
                    </div>
                  </div>
                  <MapContainer 
                    center={[28.0339, 1.6596]} 
                    zoom={5} 
                    style={{ height: "550px", width: "100%", borderRadius: "0 0 12px 12px" }}
                    zoomControl={true}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {filteredInfrastructure.map(infra => (
                      <Marker 
                        key={infra.id}
                        position={[infra.lat, infra.lng]} 
                        icon={getInfrastructureIcon(infra.type)} 
                        eventHandlers={{ click: () => setSelectedInfra(infra) }}
                      >
                        <Popup>
                          <div className="map-popup">
                            <h4>{getTypeIcon(infra.type)} {infra.name}</h4>
                            <p><strong>📍 {infra.city}</strong></p>
                            <p>{getStatusBadge(infra.status)}</p>
                            {infra.capacity && <p>📊 Capacité: {infra.capacity}</p>}
                            {infra.coverage && <p>📡 Couverture: {infra.coverage}</p>}
                            {infra.ports && <p>🔌 Ports: {infra.ports}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    <FitBounds infrastructures={filteredInfrastructure} />
                  </MapContainer>
                </div>

                {selectedInfra && (
                  <div className="selected-infra-details">
                    <div className="details-header">
                      <h3>{getTypeIcon(selectedInfra.type)} {selectedInfra.name}</h3>
                      <button className="close-details" onClick={() => setSelectedInfra(null)}>✕</button>
                    </div>
                    <div className="details-content">
                      <div className="detail-row">
                        <span className="detail-label">📍 Localisation</span>
                        <span className="detail-value">{selectedInfra.city}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">📡 Type</span>
                        <span className="detail-value">{getTypeLabel(selectedInfra.type)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">⚙️ Statut</span>
                        <span className="detail-value">{getStatusBadge(selectedInfra.status)}</span>
                      </div>
                      {selectedInfra.capacity && (
                        <div className="detail-row">
                          <span className="detail-label">📊 Capacité</span>
                          <span className="detail-value">{selectedInfra.capacity}</span>
                        </div>
                      )}
                      {selectedInfra.servers && (
                        <div className="detail-row">
                          <span className="detail-label">🖥️ Serveurs</span>
                          <span className="detail-value">{selectedInfra.servers}</span>
                        </div>
                      )}
                      {selectedInfra.coverage && (
                        <div className="detail-row">
                          <span className="detail-label">📡 Couverture</span>
                          <span className="detail-value">{selectedInfra.coverage}</span>
                        </div>
                      )}
                      {selectedInfra.ports && (
                        <div className="detail-row">
                          <span className="detail-label">🔌 Ports</span>
                          <span className="detail-value">{selectedInfra.ports}</span>
                        </div>
                      )}
                      {selectedInfra.uptime && (
                        <div className="detail-row">
                          <span className="detail-label">⏱️ Uptime</span>
                          <span className="detail-value">{selectedInfra.uptime}</span>
                        </div>
                      )}
                      <div className="status-actions">
                        <h4>Changer le statut:</h4>
                        <div className="status-buttons">
                          <button className="status-btn operational" onClick={() => updateStatus(selectedInfra.id, "operational")}>✅ Opérationnel</button>
                          <button className="status-btn maintenance" onClick={() => updateStatus(selectedInfra.id, "maintenance")}>🔧 Maintenance</button>
                          <button className="status-btn degraded" onClick={() => updateStatus(selectedInfra.id, "degraded")}>⚠️ Dégradé</button>
                        </div>
                      </div>
                      <div className="details-actions">
                        <button className="btn-delete" onClick={() => deleteInfrastructure(selectedInfra.id)}>
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === "list" && (
              <div className="list-view">
                <div className="list-header">
                  <span>Type</span>
                  <span>Nom / Ville</span>
                  <span>Statut</span>
                  <span>Détails</span>
                  <span>Actions</span>
                </div>
                {filteredInfrastructure.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🗺️</div>
                    <h3>Aucun équipement trouvé</h3>
                  </div>
                ) : (
                  <div className="infrastructure-list">
                    {filteredInfrastructure.map(infra => (
                      <div key={infra.id} className={`infra-card ${infra.type}`}>
                        <div className="infra-type-icon">{getTypeIcon(infra.type)}</div>
                        <div className="infra-info">
                          <div className="infra-name">{infra.name}</div>
                          <div className="infra-city">📍 {infra.city}</div>
                        </div>
                        <div className="infra-status">{getStatusBadge(infra.status)}</div>
                        <div className="infra-details">
                          {infra.capacity && <span className="detail-badge">{infra.capacity}</span>}
                          {infra.coverage && <span className="detail-badge">{infra.coverage}</span>}
                          {infra.ports && <span className="detail-badge">{infra.ports} ports</span>}
                        </div>
                        <div className="infra-actions">
                          <button className="action-btn view" onClick={() => setSelectedInfra(infra)}>👁️</button>
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
                    <h3>➕ Ajouter un équipement</h3>
                    <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                  </div>
                  <form onSubmit={addInfrastructure}>
                    <div className="modal-body">
                      <div className="form-group">
                        <label>Nom de l'équipement</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Ville</label>
                        <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} list="cities-list" required />
                        <datalist id="cities-list">
                          {Object.keys(cities).slice(0, 50).map(c => <option key={c} value={c} />)}
                        </datalist>
                      </div>
                      <div className="form-group">
                        <label>Type d'équipement</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                          <option value="datacenter">🏢 Data Center</option>
                          <option value="antenna">📡 Antenne</option>
                          <option value="fiberNode">🔌 Nœud Fibre</option>
                          <option value="dslam">🖥️ DSLAM</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                      <button type="submit" className="btn-primary">Ajouter</button>
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

export default Infrastructure;