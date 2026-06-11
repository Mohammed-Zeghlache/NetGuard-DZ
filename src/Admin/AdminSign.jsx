import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Admin_css/AdminDashboard.css";
import "../Admin_css/AdminSign.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const AdminSign = () => {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [response, setResponse] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    nouveaux: 0,
    enCours: 0,
    resolus: 0,
    haute: 0,
    moyenne: 0,
    basse: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadSignals();
    const interval = setInterval(loadSignals, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSignals = () => {
    const adminSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
    const sortedSignals = adminSignals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setSignals(sortedSignals);
    updateStatistics(sortedSignals);
  };

  const updateStatistics = (signalsData) => {
    setStatistics({
      total: signalsData.length,
      nouveaux: signalsData.filter(s => s.status === 'nouveau').length,
      enCours: signalsData.filter(s => s.status === 'en_cours').length,
      resolus: signalsData.filter(s => s.status === 'resolu').length,
      haute: signalsData.filter(s => s.priority === 'haute').length,
      moyenne: signalsData.filter(s => s.priority === 'moyenne').length,
      basse: signalsData.filter(s => s.priority === 'basse').length
    });
  };

  const updateSignalStatus = (signalId, newStatus) => {
    const adminSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
    const updatedSignals = adminSignals.map(signal => 
      signal.id === signalId ? { ...signal, status: newStatus } : signal
    );
    localStorage.setItem('admin_signals', JSON.stringify(updatedSignals));
    
    const notification = {
      id: Date.now(),
      type: "signal_update",
      message: `Signalement #${signalId?.slice(-8)} mis à jour: ${newStatus}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    notifications.unshift(notification);
    localStorage.setItem('admin_notifications', JSON.stringify(notifications.slice(0, 100)));
    
    loadSignals();
    if (selectedSignal?.id === signalId) {
      setSelectedSignal({ ...selectedSignal, status: newStatus });
    }
  };

  const assignTechnician = (signalId, technicianId) => {
    const adminSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
    const technicians = JSON.parse(localStorage.getItem('technicians') || '[]');
    const technician = technicians.find(t => t.id === parseInt(technicianId));
    
    const updatedSignals = adminSignals.map(signal => 
      signal.id === signalId ? { 
        ...signal, 
        assignedTo: technicianId, 
        assignedToName: technician?.name,
        status: 'en_cours'
      } : signal
    );
    localStorage.setItem('admin_signals', JSON.stringify(updatedSignals));
    
    if (technician) {
      const updatedTechs = technicians.map(t => 
        t.id === parseInt(technicianId) ? { ...t, activeTickets: (t.activeTickets || 0) + 1 } : t
      );
      localStorage.setItem('technicians', JSON.stringify(updatedTechs));
    }
    
    loadSignals();
    if (selectedSignal?.id === signalId) {
      setSelectedSignal({ 
        ...selectedSignal, 
        assignedTo: technicianId, 
        assignedToName: technician?.name,
        status: 'en_cours'
      });
    }
  };

  const addResponse = (signalId) => {
    if (!response.trim()) return;
    
    const adminSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
    const updatedSignals = adminSignals.map(signal => 
      signal.id === signalId ? { 
        ...signal, 
        updates: [
          { 
            message: `📝 Réponse administrateur: ${response}`, 
            timestamp: new Date().toISOString(), 
            author: "Administrateur"
          },
          ...(signal.updates || [])
        ]
      } : signal
    );
    localStorage.setItem('admin_signals', JSON.stringify(updatedSignals));
    loadSignals();
    
    if (selectedSignal?.id === signalId) {
      setSelectedSignal({ 
        ...selectedSignal, 
        updates: [
          { 
            message: `📝 Réponse administrateur: ${response}`, 
            timestamp: new Date().toISOString(), 
            author: "Administrateur"
          },
          ...(selectedSignal.updates || [])
        ]
      });
    }
    setResponse("");
  };

  const deleteSignal = (signalId) => {
    if (window.confirm("⚠️ Supprimer définitivement ce signalement ?")) {
      const adminSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
      const updatedSignals = adminSignals.filter(signal => signal.id !== signalId);
      localStorage.setItem('admin_signals', JSON.stringify(updatedSignals));
      loadSignals();
      if (selectedSignal?.id === signalId) {
        setShowDetailModal(false);
        setSelectedSignal(null);
      }
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'haute': return { label: 'Haute', class: 'haute', icon: '🔴' };
      case 'moyenne': return { label: 'Moyenne', class: 'moyenne', icon: '🟡' };
      default: return { label: 'Basse', class: 'basse', icon: '🟢' };
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'nouveau': return { label: 'Nouveau', class: 'nouveau', icon: '🆕' };
      case 'en_cours': return { label: 'En cours', class: 'en_cours', icon: '🔄' };
      default: return { label: 'Résolu', class: 'resolu', icon: '✅' };
    }
  };

  const getProblemIcon = (problemType) => {
    const icons = {
      panne: "🔌",
      lent: "⚡",
      instable: "📡",
      wifi: "📶",
      facture: "💰",
      materiel: "🖥️"
    };
    return icons[problemType] || "⚠️";
  };

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: "/admin", icon: "🏠", label: "Tableau de bord" },
    { path: "/admin/signals", icon: "📱", label: "Signalements", active: true },
    { path: "/admin/tickets", icon: "🎫", label: "Tickets reçus" },
    { path: "/admin/techniciens", icon: "👨‍🔧", label: "Techniciens" },
    { path: "/admin/pannes", icon: "🔴", label: "Pannes temps réel" },
    { path: "/admin/infrastructure", icon: "🏗️", label: "Infrastructure" },
    { path: "/admin/rapports", icon: "📊", label: "Rapports" },
    { path: "/admin/parametres", icon: "⚙️", label: "Paramètres" },
  ];

  const filteredSignals = signals.filter(signal => {
    if (filter !== 'all' && signal.status !== filter) return false;
    if (priorityFilter !== 'all' && signal.priority !== priorityFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        signal.phoneNumber?.includes(search) ||
        signal.problemTitle?.toLowerCase().includes(search) ||
        signal.subProblemLabel?.toLowerCase().includes(search) ||
        signal.location?.wilaya?.toLowerCase().includes(search) ||
        signal.location?.commune?.toLowerCase().includes(search) ||
        signal.clientCode?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const technicians = JSON.parse(localStorage.getItem('technicians') || '[]');

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
          <div className="admin-sign-container">
            {/* Header */}
            <div className="sign-header">
              <div className="header-left">
                <div>
                  <h1>📱 Gestion des Signalements Clients</h1>
                  <p>Suivez et traitez les demandes d'assistance client</p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-sign-grid">
              <div className="stat-sign-card total">
                <div className="stat-sign-icon">📊</div>
                <div className="stat-sign-info">
                  <div className="stat-sign-value">{statistics.total}</div>
                  <div className="stat-sign-label">Total signalements</div>
                </div>
              </div>
              <div className="stat-sign-card nouveau">
                <div className="stat-sign-icon">🆕</div>
                <div className="stat-sign-info">
                  <div className="stat-sign-value">{statistics.nouveaux}</div>
                  <div className="stat-sign-label">Nouveaux</div>
                </div>
              </div>
              <div className="stat-sign-card en-cours">
                <div className="stat-sign-icon">🔄</div>
                <div className="stat-sign-info">
                  <div className="stat-sign-value">{statistics.enCours}</div>
                  <div className="stat-sign-label">En cours</div>
                </div>
              </div>
              <div className="stat-sign-card resolu">
                <div className="stat-sign-icon">✅</div>
                <div className="stat-sign-info">
                  <div className="stat-sign-value">{statistics.resolus}</div>
                  <div className="stat-sign-label">Résolus</div>
                </div>
              </div>
              <div className="stat-sign-card haute">
                <div className="stat-sign-icon">🔴</div>
                <div className="stat-sign-info">
                  <div className="stat-sign-value">{statistics.haute}</div>
                  <div className="stat-sign-label">Priorité haute</div>
                </div>
              </div>
              <div className="stat-sign-card moyenne">
                <div className="stat-sign-icon">🟡</div>
                <div className="stat-sign-info">
                  <div className="stat-sign-value">{statistics.moyenne}</div>
                  <div className="stat-sign-label">Priorité moyenne</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="sign-filters-bar">
              <div className="filter-group">
                <label>Statut:</label>
                <div className="filter-buttons">
                  <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    Tous ({statistics.total})
                  </button>
                  <button className={`filter-btn ${filter === 'nouveau' ? 'active' : ''}`} onClick={() => setFilter('nouveau')}>
                    🆕 Nouveaux ({statistics.nouveaux})
                  </button>
                  <button className={`filter-btn ${filter === 'en_cours' ? 'active' : ''}`} onClick={() => setFilter('en_cours')}>
                    🔄 En cours ({statistics.enCours})
                  </button>
                  <button className={`filter-btn ${filter === 'resolu' ? 'active' : ''}`} onClick={() => setFilter('resolu')}>
                    ✅ Résolus ({statistics.resolus})
                  </button>
                </div>
              </div>
              <div className="filter-group">
                <label>Priorité:</label>
                <div className="filter-buttons">
                  <button className={`filter-btn ${priorityFilter === 'all' ? 'active' : ''}`} onClick={() => setPriorityFilter('all')}>
                    Toutes
                  </button>
                  <button className={`filter-btn ${priorityFilter === 'haute' ? 'active' : ''}`} onClick={() => setPriorityFilter('haute')}>
                    🔴 Haute
                  </button>
                  <button className={`filter-btn ${priorityFilter === 'moyenne' ? 'active' : ''}`} onClick={() => setPriorityFilter('moyenne')}>
                    🟡 Moyenne
                  </button>
                  <button className={`filter-btn ${priorityFilter === 'basse' ? 'active' : ''}`} onClick={() => setPriorityFilter('basse')}>
                    🟢 Basse
                  </button>
                </div>
              </div>
              <div className="search-wrapper">
                <input 
                  type="text" 
                  placeholder="🔍 Rechercher par téléphone, ville, problème..." 
                  className="search-input-sign"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Signals Table */}
            {signals.length === 0 ? (
              <div className="empty-state-sign">
                <div className="empty-icon">📭</div>
                <h3>Aucun signalement</h3>
                <p>Les signalements clients apparaîtront ici</p>
              </div>
            ) : filteredSignals.length === 0 ? (
              <div className="empty-state-sign">
                <div className="empty-icon">🔍</div>
                <h3>Aucun résultat</h3>
                <p>Aucun signalement ne correspond à vos critères</p>
              </div>
            ) : (
              <div className="signals-table-wrapper">
                <table className="signals-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Client</th>
                      <th>Problème</th>
                      <th>Localisation</th>
                      <th>Priorité</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSignals.map((signal) => {
                      const priority = getPriorityLabel(signal.priority);
                      const status = getStatusLabel(signal.status);
                      return (
                        <tr key={signal.id} className={`priority-${signal.priority}`}>
                          <td className="signal-id-cell">
                            <span className="signal-id">{signal.id?.slice(-8)}</span>
                          </td>
                          <td>
                            <div className="client-info-cell">
                              <div className="client-phone">{signal.phoneNumber}</div>
                              <div className="client-code">{signal.clientCode || "Sans code"}</div>
                            </div>
                          </td>
                          <td>
                            <div className="problem-info-cell">
                              <div className="problem-icon">{getProblemIcon(signal.problemType)}</div>
                              <div className="problem-details">
                                <div className="problem-title">{signal.problemTitle}</div>
                                <div className="problem-sub">{signal.subProblemLabel}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="location-info-cell">
                              <div className="wilaya">{signal.location?.wilaya || "N/A"}</div>
                              <div className="commune">{signal.location?.commune || ""}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`priority-badge ${priority.class}`}>
                              {priority.icon} {priority.label}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge-sign ${status.class}`}>
                              {status.icon} {status.label}
                            </span>
                          </td>
                          <td>
                            <div className="date-info">
                              <div>{new Date(signal.createdAt).toLocaleDateString()}</div>
                              <div className="time">{new Date(signal.createdAt).toLocaleTimeString()}</div>
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-btn view-btn"
                                onClick={() => {
                                  setSelectedSignal(signal);
                                  setShowDetailModal(true);
                                }}
                                title="Voir détails"
                              >
                                👁️
                              </button>
                              <select 
                                className="status-select-small"
                                value={signal.status}
                                onChange={(e) => updateSignalStatus(signal.id, e.target.value)}
                              >
                                <option value="nouveau">🆕 Nouveau</option>
                                <option value="en_cours">🔄 En cours</option>
                                <option value="resolu">✅ Résolu</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signal Detail Modal */}
            {showDetailModal && selectedSignal && (
              <div className="modal-overlay-sign" onClick={() => setShowDetailModal(false)}>
                <div className="modal-content-sign large" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header-sign">
                    <h3>📱 Détail du signalement</h3>
                    <button className="modal-close-sign" onClick={() => setShowDetailModal(false)}>✕</button>
                  </div>
                  <div className="modal-body-sign">
                    <div className="signal-detail-grid-sign">
                      {/* Client Information */}
                      <div className="detail-section-sign">
                        <h4>📞 Informations client</h4>
                        <div className="detail-row-sign">
                          <span>Téléphone:</span>
                          <strong>{selectedSignal.phoneNumber}</strong>
                        </div>
                        <div className="detail-row-sign">
                          <span>Code client:</span>
                          <strong>{selectedSignal.clientCode || "Non renseigné"}</strong>
                        </div>
                        <div className="detail-row-sign">
                          <span>Contact préféré:</span>
                          <strong>
                            {selectedSignal.contactMethod === 'phone' ? '📞 Appel' : 
                             selectedSignal.contactMethod === 'whatsapp' ? '💬 WhatsApp' : '📱 SMS'}
                          </strong>
                        </div>
                        {selectedSignal.availableTimes && (
                          <div className="detail-row-sign">
                            <span>Disponibilité:</span>
                            <strong>{selectedSignal.availableTimes}</strong>
                          </div>
                        )}
                      </div>

                      {/* Problem Information */}
                      <div className="detail-section-sign">
                        <h4>🔍 Problème technique</h4>
                        <div className="detail-row-sign">
                          <span>Type:</span>
                          <strong>
                            <span className="problem-icon-small">{getProblemIcon(selectedSignal.problemType)}</span>
                            {' '}{selectedSignal.problemTitle}
                          </strong>
                        </div>
                        <div className="detail-row-sign">
                          <span>Sous-problème:</span>
                          <strong>{selectedSignal.subProblemLabel}</strong>
                        </div>
                        <div className="detail-row-sign">
                          <span>Priorité:</span>
                          <strong className={`priority-${selectedSignal.priority}`}>
                            {selectedSignal.priority === 'haute' ? '🔴 Haute' : 
                             selectedSignal.priority === 'moyenne' ? '🟡 Moyenne' : '🟢 Basse'}
                          </strong>
                        </div>
                        <div className="detail-row-sign full">
                          <span>Description:</span>
                          <p className="description-text-sign">{selectedSignal.description}</p>
                        </div>
                      </div>

                      {/* Location Information */}
                      <div className="detail-section-sign">
                        <h4>📍 Localisation</h4>
                        <div className="detail-row-sign">
                          <span>Wilaya:</span>
                          <strong>{selectedSignal.location?.wilaya || "Non spécifiée"}</strong>
                        </div>
                        {selectedSignal.location?.commune && (
                          <div className="detail-row-sign">
                            <span>Commune:</span>
                            <strong>{selectedSignal.location.commune}</strong>
                          </div>
                        )}
                        {selectedSignal.location?.address && (
                          <div className="detail-row-sign full">
                            <span>Adresse:</span>
                            <p>{selectedSignal.location.address}</p>
                          </div>
                        )}
                        {selectedSignal.location?.lat && (
                          <div className="detail-row-sign">
                            <span>Coordonnées GPS:</span>
                            <strong>
                              {selectedSignal.location.lat.toFixed(6)}, {selectedSignal.location.lng.toFixed(6)}
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Management Section */}
                      <div className="detail-section-sign">
                        <h4>⚙️ Gestion du signalement</h4>
                        <div className="detail-row-sign">
                          <span>Statut:</span>
                          <select 
                            value={selectedSignal.status} 
                            onChange={(e) => updateSignalStatus(selectedSignal.id, e.target.value)}
                            className="status-select-sign"
                          >
                            <option value="nouveau">🆕 Nouveau</option>
                            <option value="en_cours">🔄 En cours</option>
                            <option value="resolu">✅ Résolu</option>
                          </select>
                        </div>
                        <div className="detail-row-sign">
                          <span>Assigner à:</span>
                          <select 
                            onChange={(e) => assignTechnician(selectedSignal.id, e.target.value)}
                            value={selectedSignal.assignedTo || ""}
                            className="assign-select-sign"
                          >
                            <option value="">Non assigné</option>
                            {technicians.map(tech => (
                              <option key={tech.id} value={tech.id}>
                                {tech.name} ({tech.specialty})
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedSignal.assignedToName && (
                          <div className="detail-row-sign">
                            <span>Technicien:</span>
                            <strong>👨‍🔧 {selectedSignal.assignedToName}</strong>
                          </div>
                        )}
                        <div className="detail-row-sign">
                          <span>Date signalement:</span>
                          <strong>{new Date(selectedSignal.createdAt).toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Response Section */}
                    <div className="detail-section-sign response-section-sign">
                      <h4>💬 Répondre au client</h4>
                      <textarea 
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows="3"
                        placeholder="Écrivez votre réponse ici..."
                        className="response-textarea-sign"
                      />
                      <button 
                        className="btn-primary-sign"
                        onClick={() => addResponse(selectedSignal.id)}
                      >
                        📤 Envoyer la réponse
                      </button>
                    </div>

                    {/* Delete Button */}
                    <div className="detail-section-sign danger-section">
                      <button 
                        className="btn-danger-sign"
                        onClick={() => deleteSignal(selectedSignal.id)}
                      >
                        🗑️ Supprimer ce signalement
                      </button>
                    </div>

                    {/* Timeline / History */}
                    <div className="detail-section-sign">
                      <h4>📝 Historique des échanges</h4>
                      <div className="timeline-sign">
                        {(selectedSignal.updates || []).length === 0 ? (
                          <p className="no-history-sign">Aucun historique</p>
                        ) : (
                          (selectedSignal.updates || []).map((update, idx) => (
                            <div key={idx} className="timeline-item-sign">
                              <div className="timeline-dot-sign"></div>
                              <div className="timeline-content-sign">
                                <div className="timeline-message-sign">{update.message}</div>
                                <div className="timeline-date-sign">{new Date(update.timestamp).toLocaleString()}</div>
                                {update.author && <div className="timeline-author-sign">— {update.author}</div>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
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

export default AdminSign;