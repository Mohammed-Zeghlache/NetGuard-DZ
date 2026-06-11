import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Admin_css/AdminDashboard.css";
import "../Admin_css/Technicien.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const Technicien = () => {
  const [technicians, setTechnicians] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  // Form state for new technician
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    vehicle: "",
    vehiclePlate: "",
    workZone: "",
    status: "disponible",
    hireDate: new Date().toISOString().split("T")[0],
    experience: "1-3 ans",
    notes: ""
  });

  // Pre-defined data
  const specialties = [
    "Réseau Fibre Optique",
    "ADSL / VDSL",
    "Infrastructure Réseau",
    "Support Client Technique",
    "Installation Câblage",
    "Maintenance Préventive",
    "Dépannage Urgence",
    "Configuration Modem/Routeur"
  ];

  const workZones = [
    "Alger Centre",
    "Alger Est",
    "Alger Ouest",
    "Blida",
    "Tipaza",
    "Boumerdès",
    "Tizi Ouzou",
    "Béjaïa",
    "Sétif",
    "Constantine",
    "Annaba",
    "Oran",
    "Mostaganem",
    "Tlemcen"
  ];

  const vehicles = [
    { model: "Toyota Hilux", plate: "001-ABC-01", type: "4x4", color: "Blanc" },
    { model: "Renault Kangoo", plate: "002-ABC-02", type: "Utilitaire", color: "Blanc" },
    { model: "Peugeot Partner", plate: "003-ABC-03", type: "Utilitaire", color: "Gris" },
    { model: "Volkswagen Caddy", plate: "004-ABC-04", type: "Utilitaire", color: "Bleu" },
    { model: "Ford Ranger", plate: "005-ABC-05", type: "4x4", color: "Noir" },
    { model: "Nissan Navara", plate: "006-ABC-06", type: "4x4", color: "Argent" },
    { model: "Mitsubishi L200", plate: "007-ABC-07", type: "4x4", color: "Rouge" },
    { model: "Citroën Berlingo", plate: "008-ABC-08", type: "Utilitaire", color: "Blanc" }
  ];

  const experienceLevels = [
    "Moins d'1 an",
    "1-3 ans",
    "3-5 ans",
    "5-10 ans",
    "Plus de 10 ans"
  ];

  useEffect(() => {
    loadTechnicians();
    if (localStorage.getItem("technicians") === null) {
      initSampleData();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: "/admin", icon: "🏠", label: "Tableau de bord" },
    { path: "/admin/signals", icon: "📱", label: "Signalements" },
    { path: "/admin/tickets", icon: "🎫", label: "Tickets reçus" },
    { path: "/admin/techniciens", icon: "👨‍🔧", label: "Techniciens", active: true },
    { path: "/admin/pannes", icon: "🔴", label: "Pannes temps réel" },
    { path: "/admin/infrastructure", icon: "🏗️", label: "Infrastructure" },
    { path: "/admin/rapports", icon: "📊", label: "Rapports" },
    { path: "/admin/parametres", icon: "⚙️", label: "Paramètres" },
  ];

  const initSampleData = () => {
    const sampleTechnicians = [
      {
        id: 1,
        name: "Ahmed Benali",
        email: "ahmed.benali@netguard.dz",
        phone: "0555123456",
        specialty: "Réseau Fibre Optique",
        vehicle: "Toyota Hilux",
        vehiclePlate: "001-ABC-01",
        workZone: "Alger Centre",
        status: "disponible",
        hireDate: "2022-01-15",
        experience: "5-10 ans",
        notes: "Expert en fibre optique",
        activeTickets: 2,
        completedTickets: 156,
        rating: 4.8,
        avatar: "A",
        currentLocation: "Alger Centre - Siège",
        lastActive: new Date().toISOString()
      },
      {
        id: 2,
        name: "Karim Mansouri",
        email: "karim.mansouri@netguard.dz",
        phone: "0555234567",
        specialty: "ADSL / VDSL",
        vehicle: "Renault Kangoo",
        vehiclePlate: "002-ABC-02",
        workZone: "Alger Est",
        status: "occupe",
        hireDate: "2021-06-10",
        experience: "3-5 ans",
        notes: "Spécialiste ADSL",
        activeTickets: 3,
        completedTickets: 98,
        rating: 4.5,
        avatar: "K",
        currentLocation: "Bachdjarah - Intervention",
        lastActive: new Date().toISOString()
      },
      {
        id: 3,
        name: "Sofia Bouderbala",
        email: "sofia.bouderbala@netguard.dz",
        phone: "0555345678",
        specialty: "Infrastructure Réseau",
        vehicle: "Peugeot Partner",
        vehiclePlate: "003-ABC-03",
        workZone: "Alger Ouest",
        status: "en_route",
        hireDate: "2023-02-20",
        experience: "1-3 ans",
        notes: "Jeune talent",
        activeTickets: 1,
        completedTickets: 34,
        rating: 4.9,
        avatar: "S",
        currentLocation: "En route vers Chéraga",
        lastActive: new Date().toISOString()
      },
      {
        id: 4,
        name: "Mohamed Larbi",
        email: "mohamed.larbi@netguard.dz",
        phone: "0555456789",
        specialty: "Support Client Technique",
        vehicle: "Volkswagen Caddy",
        vehiclePlate: "004-ABC-04",
        workZone: "Blida",
        status: "disponible",
        hireDate: "2020-11-05",
        experience: "5-10 ans",
        notes: "Excellent support client",
        activeTickets: 0,
        completedTickets: 210,
        rating: 4.7,
        avatar: "M",
        currentLocation: "Blida - Agence",
        lastActive: new Date().toISOString()
      },
      {
        id: 5,
        name: "Nadia Cherif",
        email: "nadia.cherif@netguard.dz",
        phone: "0555567890",
        specialty: "Installation Câblage",
        vehicle: "Ford Ranger",
        vehiclePlate: "005-ABC-05",
        workZone: "Tipaza",
        status: "en_pause",
        hireDate: "2022-08-14",
        experience: "3-5 ans",
        notes: "Spécialiste câblage",
        activeTickets: 2,
        completedTickets: 78,
        rating: 4.6,
        avatar: "N",
        currentLocation: "Pause déjeuner - Koléa",
        lastActive: new Date().toISOString()
      },
      {
        id: 6,
        name: "Reda Djebbar",
        email: "reda.djebbar@netguard.dz",
        phone: "0555678901",
        specialty: "Maintenance Préventive",
        vehicle: "Nissan Navara",
        vehiclePlate: "006-ABC-06",
        workZone: "Boumerdès",
        status: "occupe",
        hireDate: "2021-04-22",
        experience: "3-5 ans",
        notes: "Maintenance expert",
        activeTickets: 3,
        completedTickets: 124,
        rating: 4.7,
        avatar: "R",
        currentLocation: "Boumerdès - Intervention",
        lastActive: new Date().toISOString()
      }
    ];
    localStorage.setItem("technicians", JSON.stringify(sampleTechnicians));
    setTechnicians(sampleTechnicians);
  };

  const loadTechnicians = () => {
    const techs = JSON.parse(localStorage.getItem("technicians") || "[]");
    setTechnicians(techs);
  };

  const saveTechnicians = (techs) => {
    localStorage.setItem("technicians", JSON.stringify(techs));
    setTechnicians(techs);
  };

  const addTechnician = (e) => {
    e.preventDefault();
    const newTechnician = {
      id: Date.now(),
      ...formData,
      activeTickets: 0,
      completedTickets: 0,
      rating: 0,
      avatar: formData.name.charAt(0).toUpperCase(),
      currentLocation: `${formData.workZone} - Agence`,
      lastActive: new Date().toISOString()
    };
    saveTechnicians([...technicians, newTechnician]);
    setShowAddModal(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialty: "",
      vehicle: "",
      vehiclePlate: "",
      workZone: "",
      status: "disponible",
      hireDate: new Date().toISOString().split("T")[0],
      experience: "1-3 ans",
      notes: ""
    });
  };

  const updateTechnicianStatus = (id, newStatus) => {
    const updated = technicians.map(tech =>
      tech.id === id ? { ...tech, status: newStatus, lastActive: new Date().toISOString() } : tech
    );
    saveTechnicians(updated);
  };

  const deleteTechnician = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce technicien ?")) {
      saveTechnicians(technicians.filter(t => t.id !== id));
    }
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case "disponible":
        return { text: "🟢 Disponible", class: "status-available", icon: "✅" };
      case "occupe":
        return { text: "🟡 Occupé", class: "status-busy", icon: "🔧" };
      case "en_route":
        return { text: "🚗 En route", class: "status-enroute", icon: "🚗" };
      case "en_pause":
        return { text: "☕ Pause", class: "status-pause", icon: "☕" };
      default:
        return { text: "⚪ Indisponible", class: "status-unavailable", icon: "❌" };
    }
  };

  const filteredTechnicians = technicians.filter(tech => {
    if (filter !== "all" && tech.status !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        tech.name.toLowerCase().includes(search) ||
        tech.email.toLowerCase().includes(search) ||
        tech.phone.includes(search) ||
        tech.specialty.toLowerCase().includes(search) ||
        tech.workZone.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const stats = {
    total: technicians.length,
    disponible: technicians.filter(t => t.status === "disponible").length,
    occupe: technicians.filter(t => t.status === "occupe").length,
    en_route: technicians.filter(t => t.status === "en_route").length,
    totalTickets: technicians.reduce((sum, t) => sum + (t.completedTickets || 0), 0)
  };

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
          <div className="technicien-container">
            {/* Header */}
            <div className="technicien-header">
              <div className="header-left">
                <div>
                  <h1>👨‍🔧 Gestion des Techniciens</h1>
                  <p>Suivi d'équipe, assignation et planning</p>
                </div>
              </div>
              <div className="header-right">
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                  + Ajouter un technicien
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total techniciens</div>
              </div>
              <div className="stat-card success">
                <div className="stat-value">{stats.disponible}</div>
                <div className="stat-label">Disponibles</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-value">{stats.occupe}</div>
                <div className="stat-label">En intervention</div>
              </div>
              <div className="stat-card info">
                <div className="stat-value">{stats.en_route}</div>
                <div className="stat-label">En route</div>
              </div>
              <div className="stat-card primary">
                <div className="stat-value">{stats.totalTickets}</div>
                <div className="stat-label">Tickets résolus</div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
              <div className="filter-tabs">
                <button className={`filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
                  Tous ({stats.total})
                </button>
                <button className={`filter-chip ${filter === "disponible" ? "active" : ""}`} onClick={() => setFilter("disponible")}>
                  🟢 Disponibles ({stats.disponible})
                </button>
                <button className={`filter-chip ${filter === "occupe" ? "active" : ""}`} onClick={() => setFilter("occupe")}>
                  🟡 En intervention ({stats.occupe})
                </button>
                <button className={`filter-chip ${filter === "en_route" ? "active" : ""}`} onClick={() => setFilter("en_route")}>
                  🚗 En route ({stats.en_route})
                </button>
                <button className={`filter-chip ${filter === "en_pause" ? "active" : ""}`} onClick={() => setFilter("en_pause")}>
                  ☕ En pause ({technicians.filter(t => t.status === "en_pause").length})
                </button>
              </div>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Rechercher un technicien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button className={`view-toggle ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                  ⊞
                </button>
                <button className={`view-toggle ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                  ☰
                </button>
              </div>
            </div>

            {/* Technicians List/Grid */}
            <div className={`technicians-container ${viewMode}`}>
              {filteredTechnicians.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👨‍🔧</div>
                  <h3>Aucun technicien trouvé</h3>
                  <p>Ajoutez votre premier technicien pour commencer</p>
                </div>
              ) : (
                filteredTechnicians.map((tech) => {
                  const statusInfo = getStatusInfo(tech.status);
                  return (
                    <div key={tech.id} className={`technician-card ${tech.status}`}>
                      <div className="card-header">
                        <div className="technician-avatar">
                          {tech.avatar}
                          <div className={`status-indicator ${tech.status}`}></div>
                        </div>
                        <div className="technician-info">
                          <h3>{tech.name}</h3>
                          <p className="specialty">{tech.specialty}</p>
                          <p className="work-zone">📍 {tech.workZone}</p>
                        </div>
                        <div className="card-actions">
                          <button className="action-btn view" onClick={() => {
                            setSelectedTechnician(tech);
                            setShowDetailsModal(true);
                          }} title="Voir détails">
                            👁️
                          </button>
                          <button className="action-btn delete" onClick={() => deleteTechnician(tech.id)} title="Supprimer">
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="card-body">
                        <div className="info-row">
                          <span className="info-label">📞 Téléphone</span>
                          <span className="info-value">{tech.phone}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">✉️ Email</span>
                          <span className="info-value">{tech.email}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">🚗 Véhicule</span>
                          <span className="info-value">{tech.vehicle} - {tech.vehiclePlate}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">📅 Expérience</span>
                          <span className="info-value">{tech.experience}</span>
                        </div>
                      </div>

                      <div className="card-footer">
                        <div className="status-badge">
                          <span className={statusInfo.class}>{statusInfo.text}</span>
                        </div>
                        <div className="ticket-stats">
                          <span title="Tickets actifs">🎫 {tech.activeTickets || 0} actifs</span>
                          <span title="Tickets résolus">✅ {tech.completedTickets || 0} résolus</span>
                          <span title="Note">⭐ {tech.rating || 0}</span>
                        </div>
                        <div className="status-actions">
                          <select 
                            value={tech.status} 
                            onChange={(e) => updateTechnicianStatus(tech.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="disponible">🟢 Disponible</option>
                            <option value="occupe">🟡 En intervention</option>
                            <option value="en_route">🚗 En route</option>
                            <option value="en_pause">☕ En pause</option>
                          </select>
                        </div>
                      </div>

                      {tech.currentLocation && (
                        <div className="current-location">
                          <span className="location-icon">📍</span>
                          <span className="location-text">{tech.currentLocation}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ADD TECHNICIAN MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Ajouter un technicien</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={addTechnician}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom complet *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Téléphone *</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Spécialité *</label>
                    <select value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} required>
                      <option value="">Sélectionner...</option>
                      {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Zone de travail *</label>
                    <select value={formData.workZone} onChange={(e) => setFormData({...formData, workZone: e.target.value})} required>
                      <option value="">Sélectionner...</option>
                      {workZones.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Statut</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="disponible">🟢 Disponible</option>
                      <option value="occupe">🟡 En intervention</option>
                      <option value="en_route">🚗 En route</option>
                      <option value="en_pause">☕ En pause</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Véhicule</label>
                    <select value={formData.vehicle} onChange={(e) => {
                      const selected = vehicles.find(v => v.model === e.target.value);
                      setFormData({
                        ...formData,
                        vehicle: e.target.value,
                        vehiclePlate: selected ? selected.plate : ""
                      });
                    }}>
                      <option value="">Sélectionner un véhicule...</option>
                      {vehicles.map(v => <option key={v.model} value={v.model}>{v.model} - {v.plate} ({v.color})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Plaque d'immatriculation</label>
                    <input type="text" value={formData.vehiclePlate} readOnly />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date d'embauche</label>
                    <input type="date" value={formData.hireDate} onChange={(e) => setFormData({...formData, hireDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Expérience</label>
                    <select value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}>
                      {experienceLevels.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes supplémentaires</label>
                  <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Compétences particulières, certifications..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Ajouter le technicien</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TECHNICIAN DETAILS MODAL */}
      {showDetailsModal && selectedTechnician && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👨‍🔧 Détails du technicien</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="details-header">
                <div className="details-avatar">
                  {selectedTechnician.avatar}
                  <div className={`status-indicator ${selectedTechnician.status}`}></div>
                </div>
                <div className="details-title">
                  <h2>{selectedTechnician.name}</h2>
                  <p>{selectedTechnician.specialty}</p>
                </div>
              </div>

              <div className="details-grid">
                <div className="details-section">
                  <h4>📋 Informations personnelles</h4>
                  <div className="detail-row">
                    <span className="detail-label">📞 Téléphone</span>
                    <span className="detail-value">{selectedTechnician.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">✉️ Email</span>
                    <span className="detail-value">{selectedTechnician.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📍 Zone de travail</span>
                    <span className="detail-value">{selectedTechnician.workZone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📅 Date d'embauche</span>
                    <span className="detail-value">{new Date(selectedTechnician.hireDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">⭐ Expérience</span>
                    <span className="detail-value">{selectedTechnician.experience}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h4>🚗 Informations véhicule</h4>
                  <div className="detail-row">
                    <span className="detail-label">🚘 Modèle</span>
                    <span className="detail-value">{selectedTechnician.vehicle}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🔢 Plaque</span>
                    <span className="detail-value">{selectedTechnician.vehiclePlate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📍 Position actuelle</span>
                    <span className="detail-value">{selectedTechnician.currentLocation}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🕐 Dernière activité</span>
                    <span className="detail-value">{new Date(selectedTechnician.lastActive).toLocaleString()}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h4>📊 Statistiques</h4>
                  <div className="detail-row">
                    <span className="detail-label">🎫 Tickets actifs</span>
                    <span className="detail-value">{selectedTechnician.activeTickets || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">✅ Tickets résolus</span>
                    <span className="detail-value">{selectedTechnician.completedTickets || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">⭐ Note moyenne</span>
                    <span className="detail-value">{selectedTechnician.rating || 0}/5</span>
                  </div>
                </div>

                {selectedTechnician.notes && (
                  <div className="details-section full-width">
                    <h4>📝 Notes</h4>
                    <p>{selectedTechnician.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Fermer</button>
              <button className="btn-primary" onClick={() => {
                setShowDetailsModal(false);
              }}>Modifier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Technicien; 