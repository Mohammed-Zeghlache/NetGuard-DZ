import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Admin_css/AdminDashboard.css";
import "../Admin_css/Ticket.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const Ticket = () => {
  // ==================== STATE MANAGEMENT ====================
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [response, setResponse] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [conversation, setConversation] = useState([]);
  const [diagnosticSteps, setDiagnosticSteps] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();

  // ==================== LOAD DATA ====================
  useEffect(() => {
    loadTickets();
    loadTechnicians();
    loadDiagnosticSteps();
    
    const interval = setInterval(loadTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTickets = () => {
    const adminTickets = JSON.parse(localStorage.getItem("admin_tickets") || "[]");
    const sortedTickets = adminTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setTickets(sortedTickets);
    
    if (selectedTicket) {
      const updated = sortedTickets.find(t => t.id === selectedTicket.id);
      if (updated) {
        setSelectedTicket(updated);
        setConversation(updated.updates || []);
      }
    }
  };

  const loadTechnicians = () => {
    const techs = JSON.parse(localStorage.getItem("technicians") || "[]");
    setTechnicians(techs);
  };

  const loadDiagnosticSteps = () => {
    const steps = [
      { id: 1, name: "Vérification ligne", status: "pending", icon: "📡" },
      { id: 2, name: "Test de débit", status: "pending", icon: "⚡" },
      { id: 3, name: "Vérification modem", status: "pending", icon: "📶" },
      { id: 4, name: "Vérification câblage", status: "pending", icon: "🔌" },
      { id: 5, name: "Contact client", status: "pending", icon: "📞" }
    ];
    setDiagnosticSteps(steps);
  };

  // ==================== TICKET MANAGEMENT ====================
  const updateTicket = (updatedTicket) => {
    const adminTickets = JSON.parse(localStorage.getItem("admin_tickets") || "[]");
    const updated = adminTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t);
    localStorage.setItem("admin_tickets", JSON.stringify(updated));
    setTickets(updated);
    setSelectedTicket(updatedTicket);
    
    const adminNotifications = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    adminNotifications.unshift({
      id: Date.now(),
      message: `Ticket #${updatedTicket.ticketNumber} a été mis à jour`,
      type: "ticket_update",
      ticketId: updatedTicket.id,
      read: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("admin_notifications", JSON.stringify(adminNotifications.slice(0, 100)));
  };

  const updateTicketStatus = (status) => {
    if (!selectedTicket) return;
    
    const updatedTicket = { ...selectedTicket, status: status };
    updateTicket(updatedTicket);
    
    const statusUpdate = {
      message: `Statut changé : ${status === "nouveau" ? "🆕 Nouveau" : status === "en_cours" ? "🔄 En cours" : "✅ Résolu"}`,
      timestamp: new Date().toISOString(),
      author: "Administrateur",
      type: "status"
    };
    
    const ticketWithUpdate = {
      ...updatedTicket,
      updates: [statusUpdate, ...(updatedTicket.updates || [])]
    };
    updateTicket(ticketWithUpdate);
    setConversation([statusUpdate, ...conversation]);
  };

  const sendResponse = () => {
    if (!response.trim() || !selectedTicket) return;
    
    const newUpdate = {
      message: response,
      timestamp: new Date().toISOString(),
      author: "Administrateur",
      type: "response"
    };
    
    const updatedTicket = {
      ...selectedTicket,
      updates: [newUpdate, ...(selectedTicket.updates || [])]
    };
    
    updateTicket(updatedTicket);
    setConversation([newUpdate, ...conversation]);
    setResponse("");
  };

  const assignTechnician = () => {
    if (!selectedTechnician || !selectedTicket) return;
    
    const technician = technicians.find(t => t.id === parseInt(selectedTechnician));
    const assignUpdate = {
      message: `Ticket assigné à ${technician.name} (${technician.specialty})`,
      timestamp: new Date().toISOString(),
      author: "Administrateur",
      type: "assignment"
    };
    
    const updatedTicket = {
      ...selectedTicket,
      assignedTo: technician.id,
      assignedToName: technician.name,
      updates: [assignUpdate, ...(selectedTicket.updates || [])]
    };
    
    updateTicket(updatedTicket);
    setConversation([assignUpdate, ...conversation]);
    setShowAssignModal(false);
    setSelectedTechnician("");
  };

  const updateDiagnosticStep = (stepId) => {
    const updatedSteps = diagnosticSteps.map(step => 
      step.id === stepId ? { ...step, status: "completed" } : step
    );
    setDiagnosticSteps(updatedSteps);
    
    const stepUpdate = {
      message: `✅ Étape diagnostique complétée: ${diagnosticSteps.find(s => s.id === stepId).name}`,
      timestamp: new Date().toISOString(),
      author: "Technicien",
      type: "diagnostic"
    };
    
    if (selectedTicket) {
      const updatedTicket = {
        ...selectedTicket,
        updates: [stepUpdate, ...(selectedTicket.updates || [])],
        diagnosticProgress: updatedSteps.filter(s => s.status === "completed").length
      };
      updateTicket(updatedTicket);
      setConversation([stepUpdate, ...conversation]);
    }
  };

  // ==================== FILTER TICKETS ====================
  const filteredTickets = tickets.filter(ticket => {
    if (filter !== "all" && ticket.status !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        ticket.ticketNumber?.toLowerCase().includes(search) ||
        ticket.fullName?.toLowerCase().includes(search) ||
        ticket.phone?.includes(search) ||
        ticket.location?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // ==================== STATISTICS ====================
  const stats = {
    total: tickets.length,
    nouveau: tickets.filter(t => t.status === "nouveau").length,
    en_cours: tickets.filter(t => t.status === "en_cours").length,
    resolu: tickets.filter(t => t.status === "resolu").length,
    high: tickets.filter(t => t.priority === "high" && t.status !== "resolu").length
  };

  // ==================== HELPER FUNCTIONS ====================
  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#64748b";
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case "high": return "🔴 Haute";
      case "medium": return "🟡 Moyenne";
      case "low": return "🟢 Basse";
      default: return "⚪ Non définie";
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case "nouveau": return { text: "🆕 Nouveau", class: "status-new" };
      case "en_cours": return { text: "🔄 En cours", class: "status-progress" };
      case "resolu": return { text: "✅ Résolu", class: "status-resolved" };
      default: return { text: "📋 Non défini", class: "" };
    }
  };

  const getStatusProgress = () => {
    const stepsCompleted = diagnosticSteps.filter(s => s.status === "completed").length;
    return (stepsCompleted / diagnosticSteps.length) * 100;
  };

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    navigate('/admin/login');
  };

  // Menu items for sidebar
  const menuItems = [
    { path: "/admin", icon: "🏠", label: "Tableau de bord", exact: true },
    { path: "/admin/signals", icon: "📱", label: "Signalements" },
    { path: "/admin/tickets", icon: "🎫", label: "Tickets reçus", active: true },
    { path: "/admin/techniciens", icon: "👨‍🔧", label: "Techniciens" },
    { path: "/admin/pannes", icon: "🔴", label: "Pannes temps réel" },
    { path: "/admin/infrastructure", icon: "🏗️", label: "Infrastructure" },
    { path: "/admin/rapports", icon: "📊", label: "Rapports" },
    { path: "/admin/parametres", icon: "⚙️", label: "Paramètres" },
  ];

  // ==================== RENDER ====================
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
          <div className="treatment-container">
            {/* Header */}
            <div className="treatment-header">
              <div className="header-left">
                <div>
                  <h1>🎫 Gestion des Tickets</h1>
                  <p>Traitement et suivi des demandes clients</p>
                </div>
              </div>
              <div className="header-right">
                <button className="refresh-btn" onClick={loadTickets} title="Actualiser">
                  🔄
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-row">
              <div className="stat-card-mini">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total tickets</div>
              </div>
              <div className="stat-card-mini warning">
                <div className="stat-value">{stats.nouveau}</div>
                <div className="stat-label">Nouveaux</div>
              </div>
              <div className="stat-card-mini info">
                <div className="stat-value">{stats.en_cours}</div>
                <div className="stat-label">En cours</div>
              </div>
              <div className="stat-card-mini success">
                <div className="stat-value">{stats.resolu}</div>
                <div className="stat-label">Résolus</div>
              </div>
              <div className="stat-card-mini danger">
                <div className="stat-value">{stats.high}</div>
                <div className="stat-label">Urgents</div>
              </div>
            </div>

            {/* Main Content */}
            <div className="treatment-main">
              {/* Left Panel - Ticket List */}
              <div className={`ticket-list-panel ${sidebarCollapsed ? "collapsed" : ""}`}>
                <div className="panel-header">
                  <h3>📋 Tickets</h3>
                </div>
                
                <div className="filter-bar">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filter-tabs">
                  <button className={`filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
                    Tous ({stats.total})
                  </button>
                  <button className={`filter-chip ${filter === "nouveau" ? "active" : ""}`} onClick={() => setFilter("nouveau")}>
                    Nouveaux ({stats.nouveau})
                  </button>
                  <button className={`filter-chip ${filter === "en_cours" ? "active" : ""}`} onClick={() => setFilter("en_cours")}>
                    En cours ({stats.en_cours})
                  </button>
                  <button className={`filter-chip ${filter === "resolu" ? "active" : ""}`} onClick={() => setFilter("resolu")}>
                    Résolus ({stats.resolu})
                  </button>
                </div>
                
                <div className="tickets-list">
                  {filteredTickets.length === 0 ? (
                    <div className="empty-tickets">
                      <div className="empty-icon">📭</div>
                      <p>Aucun ticket trouvé</p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`ticket-item ${selectedTicket?.id === ticket.id ? "selected" : ""} ${ticket.status}`}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setConversation(ticket.updates || []);
                          setActiveTab("details");
                        }}
                      >
                        <div className="ticket-header">
                          <span className="ticket-number">#{ticket.ticketNumber}</span>
                          <span className={`priority-dot ${ticket.priority}`}></span>
                        </div>
                        <div className="ticket-client">{ticket.fullName}</div>
                        <div className="ticket-problem">{ticket.problemType}</div>
                        <div className="ticket-footer">
                          <span className={`status-chip ${ticket.status}`}>
                            {ticket.status === "nouveau" ? "🆕" : ticket.status === "en_cours" ? "🔄" : "✅"}
                          </span>
                          <span className="ticket-date">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Panel - Ticket Treatment */}
              <div className="treatment-panel">
                {!selectedTicket ? (
                  <div className="no-selection">
                    <div className="no-selection-icon">🎫</div>
                    <h3>Aucun ticket sélectionné</h3>
                    <p>Sélectionnez un ticket dans la liste pour commencer le traitement</p>
                  </div>
                ) : (
                  <>
                    {/* Ticket Header */}
                    <div className="treatment-ticket-header">
                      <div className="ticket-info-header">
                        <h2>Ticket #{selectedTicket.ticketNumber}</h2>
                        <div className="header-badges">
                          <span className={`status-badge ${getStatusLabel(selectedTicket.status).class}`}>
                            {getStatusLabel(selectedTicket.status).text}
                          </span>
                          <span className="priority-badge" style={{ backgroundColor: getPriorityColor(selectedTicket.priority) }}>
                            {getPriorityLabel(selectedTicket.priority)}
                          </span>
                          <span className="source-badge">
                            {selectedTicket.source === "chatbot" ? "🤖 Chatbot" : "📝 Formulaire"}
                          </span>
                        </div>
                      </div>
                      <div className="ticket-actions-header">
                        <button 
                          className="btn-assign" 
                          onClick={() => setShowAssignModal(true)}
                          disabled={selectedTicket.status === "resolu"}
                        >
                          👨‍🔧 Assigner
                        </button>
                        <select 
                          value={selectedTicket.status} 
                          onChange={(e) => updateTicketStatus(e.target.value)}
                          className="status-select"
                          disabled={selectedTicket.status === "resolu"}
                        >
                          <option value="nouveau">🆕 Nouveau</option>
                          <option value="en_cours">🔄 En cours</option>
                          <option value="resolu">✅ Résolu</option>
                        </select>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="treatment-tabs">
                      <button className={`tab-btn ${activeTab === "details" ? "active" : ""}`} onClick={() => setActiveTab("details")}>
                        📋 Détails
                      </button>
                      <button className={`tab-btn ${activeTab === "diagnostic" ? "active" : ""}`} onClick={() => setActiveTab("diagnostic")}>
                        🔧 Diagnostic
                      </button>
                      <button className={`tab-btn ${activeTab === "conversation" ? "active" : ""}`} onClick={() => setActiveTab("conversation")}>
                        💬 Conversation ({conversation.length})
                      </button>
                      <button className={`tab-btn ${activeTab === "actions" ? "active" : ""}`} onClick={() => setActiveTab("actions")}>
                        ⚡ Actions
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="treatment-content">
                      {/* DETAILS TAB */}
                      {activeTab === "details" && (
                        <div className="details-tab">
                          <div className="info-card">
                            <h3>👤 Informations client</h3>
                            <div className="info-grid">
                              <div className="info-item">
                                <span className="info-label">Nom complet</span>
                                <span className="info-value">{selectedTicket.fullName}</span>
                              </div>
                              <div className="info-item">
                                <span className="info-label">Téléphone</span>
                                <span className="info-value">{selectedTicket.phone}</span>
                              </div>
                              {selectedTicket.email && (
                                <div className="info-item">
                                  <span className="info-label">Email</span>
                                  <span className="info-value">{selectedTicket.email}</span>
                                </div>
                              )}
                              <div className="info-item">
                                <span className="info-label">Localisation</span>
                                <span className="info-value">{selectedTicket.location}</span>
                              </div>
                              <div className="info-item">
                                <span className="info-label">Date de création</span>
                                <span className="info-value">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                              </div>
                              {selectedTicket.assignedToName && (
                                <div className="info-item">
                                  <span className="info-label">Assigné à</span>
                                  <span className="info-value">👨‍🔧 {selectedTicket.assignedToName}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="info-card">
                            <h3>🔧 Informations du problème</h3>
                            <div className="problem-type">
                              <span className="type-badge">{selectedTicket.problemType}</span>
                            </div>
                            <div className="problem-description">
                              <h4>Description détaillée</h4>
                              <p>{selectedTicket.problemDescription}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DIAGNOSTIC TAB */}
                      {activeTab === "diagnostic" && (
                        <div className="diagnostic-tab">
                          <div className="diagnostic-progress">
                            <div className="progress-header">
                              <h3>📊 Progression du diagnostic</h3>
                              <span className="progress-percent">{Math.round(getStatusProgress())}%</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${getStatusProgress()}%` }}></div>
                            </div>
                          </div>

                          <div className="diagnostic-steps">
                            {diagnosticSteps.map((step) => (
                              <div key={step.id} className={`diagnostic-step ${step.status}`}>
                                <div className="step-icon">{step.icon}</div>
                                <div className="step-info">
                                  <div className="step-name">{step.name}</div>
                                  <div className="step-status">
                                    {step.status === "pending" ? "⏳ En attente" : "✅ Complété"}
                                  </div>
                                </div>
                                {step.status === "pending" && selectedTicket.status !== "resolu" && (
                                  <button className="step-complete-btn" onClick={() => updateDiagnosticStep(step.id)}>
                                    Marquer complété
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CONVERSATION TAB */}
                      {activeTab === "conversation" && (
                        <div className="conversation-tab">
                          <div className="conversation-timeline">
                            {conversation.length === 0 ? (
                              <div className="empty-conversation">
                                <div className="empty-icon">💬</div>
                                <p>Aucune conversation pour le moment</p>
                              </div>
                            ) : (
                              conversation.map((update, idx) => (
                                <div key={idx} className={`timeline-item ${update.type}`}>
                                  <div className="timeline-dot"></div>
                                  <div className="timeline-content">
                                    <div className="timeline-header">
                                      <span className="timeline-author">{update.author || "Système"}</span>
                                      <span className="timeline-date">
                                        {new Date(update.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="timeline-message">{update.message}</div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="conversation-input">
                            <textarea
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              placeholder="Écrivez votre réponse au client..."
                              rows="3"
                            />
                            <button className="btn-primary" onClick={sendResponse}>
                              Envoyer la réponse
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ACTIONS TAB */}
                      {activeTab === "actions" && (
                        <div className="actions-tab">
                          <div className="action-card">
                            <h3>📞 Contacter le client</h3>
                            <div className="contact-options">
                              <a href={`tel:${selectedTicket.phone}`} className="contact-btn phone">
                                📱 Appeler {selectedTicket.phone}
                              </a>
                              <button className="contact-btn message" onClick={() => {
                                setActiveTab("conversation");
                              }}>
                                💬 Envoyer un message
                              </button>
                            </div>
                          </div>

                          <div className="action-card">
                            <h3>📝 Notes internes</h3>
                            <textarea 
                              placeholder="Ajoutez des notes internes (non visibles par le client)..."
                              rows="3"
                            />
                            <button className="btn-secondary">Sauvegarder les notes</button>
                          </div>

                          {selectedTicket.status !== "resolu" && (
                            <div className="action-card resolve-card">
                              <h3>✅ Résoudre le ticket</h3>
                              <p>Confirmez que le problème est résolu et fermez le ticket.</p>
                              <button className="btn-success" onClick={() => updateTicketStatus("resolu")}>
                                Marquer comme résolu
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👨‍🔧 Assigner un technicien</h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Sélectionner un technicien</label>
                <select value={selectedTechnician} onChange={(e) => setSelectedTechnician(e.target.value)}>
                  <option value="">Choisir un technicien...</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} - {tech.specialty} ({tech.status === "disponible" ? "🟢 Disponible" : "🟡 Occupé"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={assignTechnician}>Assigner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticket;