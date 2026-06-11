import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import "../Admin_css/AdminDashboard.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

// ==================== DASHBOARD HOME / OVERVIEW ====================
const DashboardHome = ({ admin }) => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalSignals: 0,
    pendingTickets: 0,
    pendingSignals: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    activeTechnicians: 0,
    criticalPannes: 0,
    avgResponseTime: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentSignals, setRecentSignals] = useState([]);
  const [realtimePannes, setRealtimePannes] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadRealtimePannes, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    const adminTickets = JSON.parse(localStorage.getItem('admin_tickets') || '[]');
    const adminSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
    
    setRecentTickets(adminTickets.slice(0, 5));
    setRecentSignals(adminSignals.slice(0, 5));
    
    setStats({
      totalTickets: adminTickets.length,
      totalSignals: adminSignals.length,
      pendingTickets: adminTickets.filter(t => t.status === 'nouveau').length,
      pendingSignals: adminSignals.filter(s => s.status === 'nouveau').length,
      inProgressTickets: adminTickets.filter(t => t.status === 'en_cours').length,
      resolvedTickets: adminTickets.filter(t => t.status === 'resolu').length,
      activeTechnicians: JSON.parse(localStorage.getItem('technicians') || '[]').length,
      criticalPannes: adminSignals.filter(s => s.priority === 'haute' && s.status !== 'resolu').length,
      avgResponseTime: 0
    });
    
    loadTechnicians();
  };

  const loadTechnicians = () => {
    const techs = JSON.parse(localStorage.getItem('technicians') || '[]');
    setTechnicians(techs);
  };

  const loadRealtimePannes = () => {
    const pannes = JSON.parse(localStorage.getItem('realtime_pannes') || '[]');
    setRealtimePannes(pannes.slice(0, 10));
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'haute': return '🔴';
      case 'moyenne': return '🟡';
      default: return '🟢';
    }
  };

  return (
    <div className="admin-dashboard-home">
      <div className="admin-hero-section">
        <div className="hero-content">
          <div className="greeting-badge">
            <span className="shield-emoji">🛡️</span>
            <span>Administration</span>
          </div>
          <h1>
            Bonjour, <span className="highlight">{admin.fullName}</span>
          </h1>
          <p>Gérez les tickets, signalements, techniciens et infrastructures réseau</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-header">
            <div className="stat-icon">🎫</div>
            <span className="stat-value">{stats.totalTickets + stats.totalSignals}</span>
          </div>
          <div className="stat-body">
            <h4>Demandes totales</h4>
            <p>Chatbot + Signalements</p>
          </div>
        </div>

        <div className="stat-card stat-orange">
          <div className="stat-header">
            <div className="stat-icon">⏳</div>
            <span className="stat-value">{stats.pendingTickets + stats.pendingSignals}</span>
          </div>
          <div className="stat-body">
            <h4>En attente</h4>
            <p>À traiter immédiatement</p>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-header">
            <div className="stat-icon">🔄</div>
            <span className="stat-value">{stats.inProgressTickets}</span>
          </div>
          <div className="stat-body">
            <h4>En cours</h4>
            <p>Assignés aux techniciens</p>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-header">
            <div className="stat-icon">✅</div>
            <span className="stat-value">{stats.resolvedTickets}</span>
          </div>
          <div className="stat-body">
            <h4>Résolus</h4>
            <p>Taux: {stats.totalTickets ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100) : 0}%</p>
          </div>
        </div>

        <div className="stat-card stat-cyan">
          <div className="stat-header">
            <div className="stat-icon">👨‍🔧</div>
            <span className="stat-value">{stats.activeTechnicians}</span>
          </div>
          <div className="stat-body">
            <h4>Techniciens</h4>
            <p>Actifs aujourd'hui</p>
          </div>
        </div>

        <div className="stat-card stat-red">
          <div className="stat-header">
            <div className="stat-icon">⚠️</div>
            <span className="stat-value">{stats.criticalPannes}</span>
          </div>
          <div className="stat-body">
            <h4>Urgences</h4>
            <p>Priorité absolue</p>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-col">
          <div className="recent-signals-section">
            <div className="section-header">
              <div className="header-left">
                <span className="section-icon pulse">🆕</span>
                <h3>Derniers signalements</h3>
              </div>
              <Link to="/admin/signals" className="view-all-link">
                Voir tout →
              </Link>
            </div>
            {recentSignals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>Aucun signalement reçu</p>
              </div>
            ) : (
              <div className="signals-list">
                {recentSignals.map((signal) => (
                  <div key={signal.id} className={`signal-item priority-${signal.priority}`}>
                    <div className="signal-icon">
                      {getPriorityIcon(signal.priority)}
                    </div>
                    <div className="signal-info">
                      <div className="signal-title">{signal.problemTitle}</div>
                      <div className="signal-subtitle">{signal.subProblemLabel}</div>
                      <div className="signal-location">📍 {signal.location?.wilaya || "Localisation inconnue"}</div>
                    </div>
                    <div className="signal-status">
                      <span className={`status-badge-small ${signal.status}`}>
                        {signal.status === "nouveau" ? "Nouveau" : signal.status === "en_cours" ? "En cours" : "Résolu"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-col">
          <div className="technicians-section">
            <div className="section-header">
              <div className="header-left">
                <span className="section-icon">👨‍🔧</span>
                <h3>Techniciens disponibles</h3>
              </div>
              <Link to="/admin/techniciens" className="view-all-link">
                Gérer →
              </Link>
            </div>
            {technicians.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>Aucun technicien</p>
              </div>
            ) : (
              <div className="technicians-list">
                {technicians.slice(0, 4).map((tech) => (
                  <div key={tech.id} className="technician-item">
                    <div className="tech-avatar">
                      {tech.name.charAt(0)}
                      <div className={`tech-status ${tech.status}`}></div>
                    </div>
                    <div className="tech-info">
                      <h4>{tech.name}</h4>
                      <p>{tech.specialty}</p>
                    </div>
                    <div className="tech-tickets">{tech.activeTickets} tickets</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="recent-tickets-section">
        <div className="section-header">
          <div className="header-left">
            <span className="section-icon">📋</span>
            <h3>Derniers tickets reçus</h3>
          </div>
          <Link to="/admin/tickets" className="view-all-link">
            Voir tous les tickets →
          </Link>
        </div>
        {recentTickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>Aucun ticket reçu</p>
          </div>
        ) : (
          <div className="tickets-table-container">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Problème</th>
                  <th>Priorité</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>#{ticket.ticketNumber}</td>
                    <td>{ticket.fullName}</td>
                    <td>{ticket.problemType}</td>
                    <td>
                      <span className={`priority-badge ${ticket.priority === 'high' ? 'haute' : ticket.priority === 'medium' ? 'moyenne' : 'basse'}`}>
                        {ticket.priority === 'high' ? 'Haute' : ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${ticket.status}`}>
                        {ticket.status === "nouveau" ? "Nouveau" : ticket.status === "en_cours" ? "En cours" : "Résolu"}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/tickets/${ticket.id}`} className="action-link">
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== SIGNALS MANAGEMENT (NEW) ====================
const SignalsManagement = () => {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = () => {
    const adminSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
    setSignals(adminSignals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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
      message: `Signalement #${signalId} mis à jour: ${newStatus}`,
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
    const technician = JSON.parse(localStorage.getItem('technicians') || '[]').find(t => t.id === technicianId);
    
    const updatedSignals = adminSignals.map(signal => 
      signal.id === signalId ? { ...signal, assignedTo: technicianId, assignedToName: technician?.name, status: 'en_cours' } : signal
    );
    localStorage.setItem('admin_signals', JSON.stringify(updatedSignals));
    
    if (technician) {
      const technicians = JSON.parse(localStorage.getItem('technicians') || '[]');
      const updatedTechs = technicians.map(t => 
        t.id === technicianId ? { ...t, activeTickets: (t.activeTickets || 0) + 1 } : t
      );
      localStorage.setItem('technicians', JSON.stringify(updatedTechs));
    }
    
    loadSignals();
    if (selectedSignal?.id === signalId) {
      setSelectedSignal({ ...selectedSignal, assignedTo: technicianId, assignedToName: technician?.name, status: 'en_cours' });
    }
  };

  const addResponse = (signalId, response) => {
    const adminSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
    const updatedSignals = adminSignals.map(signal => 
      signal.id === signalId ? { 
        ...signal, 
        updates: [
          { message: `Réponse administrateur: ${response}`, timestamp: new Date().toISOString(), author: "Administrateur" },
          ...(signal.updates || [])
        ]
      } : signal
    );
    localStorage.setItem('admin_signals', JSON.stringify(updatedSignals));
    loadSignals();
  };

  const filteredSignals = signals.filter(signal => {
    if (filter !== 'all' && signal.status !== filter) return false;
    if (priorityFilter !== 'all' && signal.priority !== priorityFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        signal.phoneNumber?.includes(search) ||
        signal.problemTitle?.toLowerCase().includes(search) ||
        signal.subProblemLabel?.toLowerCase().includes(search) ||
        signal.location?.wilaya?.toLowerCase().includes(search)
      );
    }
    return true;
  });

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

  const technicians = JSON.parse(localStorage.getItem('technicians') || '[]');

  return (
    <div className="signals-management">
      <div className="page-header">
        <div className="header-left">
          <h2>📱 Gestion des Signalements</h2>
          <p>Signalements clients depuis le formulaire web</p>
        </div>
        <div className="header-actions">
          <input 
            type="text" 
            placeholder="Rechercher par téléphone, ville..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Statut:</label>
          <div className="filter-buttons">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tous ({signals.length})</button>
            <button className={`filter-btn ${filter === 'nouveau' ? 'active' : ''}`} onClick={() => setFilter('nouveau')}>🆕 Nouveaux ({signals.filter(s => s.status === 'nouveau').length})</button>
            <button className={`filter-btn ${filter === 'en_cours' ? 'active' : ''}`} onClick={() => setFilter('en_cours')}>🔄 En cours ({signals.filter(s => s.status === 'en_cours').length})</button>
            <button className={`filter-btn ${filter === 'resolu' ? 'active' : ''}`} onClick={() => setFilter('resolu')}>✅ Résolus ({signals.filter(s => s.status === 'resolu').length})</button>
          </div>
        </div>
        <div className="filter-group">
          <label>Priorité:</label>
          <div className="filter-buttons">
            <button className={`filter-btn ${priorityFilter === 'all' ? 'active' : ''}`} onClick={() => setPriorityFilter('all')}>Toutes</button>
            <button className={`filter-btn ${priorityFilter === 'haute' ? 'active' : ''}`} onClick={() => setPriorityFilter('haute')}>🔴 Haute</button>
            <button className={`filter-btn ${priorityFilter === 'moyenne' ? 'active' : ''}`} onClick={() => setPriorityFilter('moyenne')}>🟡 Moyenne</button>
            <button className={`filter-btn ${priorityFilter === 'basse' ? 'active' : ''}`} onClick={() => setPriorityFilter('basse')}>🟢 Basse</button>
          </div>
        </div>
      </div>

      {signals.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon">📭</div>
          <h3>Aucun signalement</h3>
          <p>Les signalements clients apparaîtront ici</p>
        </div>
      ) : (
        <div className="signals-table-container">
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
                  <tr key={signal.id}>
                    <td className="signal-id">{signal.id?.slice(-8)}</td>
                    <td>
                      <div className="client-info">
                        <div className="client-phone">{signal.phoneNumber}</div>
                        <div className="client-code">{signal.clientCode}</div>
                      </div>
                    </td>
                    <td>
                      <div className="problem-info">
                        <div className="problem-title">{signal.problemTitle}</div>
                        <div className="problem-sub">{signal.subProblemLabel}</div>
                      </div>
                    </td>
                    <td>
                      <div className="location-info">
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
                      <span className={`status-badge ${status.class}`}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td>{new Date(signal.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="action-btn view-btn"
                        onClick={() => {
                          setSelectedSignal(signal);
                          setShowDetailModal(true);
                        }}
                      >
                        👁️ Détails
                      </button>
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
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📱 Détail du signalement</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="signal-detail-grid">
                <div className="detail-section">
                  <h4>📞 Informations client</h4>
                  <div className="detail-row">
                    <span>Téléphone:</span>
                    <strong>{selectedSignal.phoneNumber}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Code client:</span>
                    <strong>{selectedSignal.clientCode || "Non renseigné"}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Contact préféré:</span>
                    <strong>
                      {selectedSignal.contactMethod === 'phone' ? '📞 Appel' : 
                       selectedSignal.contactMethod === 'whatsapp' ? '💬 WhatsApp' : '📱 SMS'}
                    </strong>
                  </div>
                  {selectedSignal.availableTimes && (
                    <div className="detail-row">
                      <span>Disponibilité:</span>
                      <strong>{selectedSignal.availableTimes}</strong>
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h4>🔍 Problème technique</h4>
                  <div className="detail-row">
                    <span>Type:</span>
                    <strong>{selectedSignal.problemTitle}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Sous-problème:</span>
                    <strong>{selectedSignal.subProblemLabel}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Priorité:</span>
                    <strong className={`priority-${selectedSignal.priority}`}>
                      {selectedSignal.priority === 'haute' ? '🔴 Haute' : 
                       selectedSignal.priority === 'moyenne' ? '🟡 Moyenne' : '🟢 Basse'}
                    </strong>
                  </div>
                  <div className="detail-row full">
                    <span>Description:</span>
                    <p>{selectedSignal.description}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>📍 Localisation</h4>
                  <div className="detail-row">
                    <span>Wilaya:</span>
                    <strong>{selectedSignal.location?.wilaya || "Non spécifiée"}</strong>
                  </div>
                  {selectedSignal.location?.commune && (
                    <div className="detail-row">
                      <span>Commune:</span>
                      <strong>{selectedSignal.location.commune}</strong>
                    </div>
                  )}
                  {selectedSignal.location?.address && (
                    <div className="detail-row full">
                      <span>Adresse:</span>
                      <p>{selectedSignal.location.address}</p>
                    </div>
                  )}
                  {selectedSignal.location?.lat && (
                    <div className="detail-row">
                      <span>GPS:</span>
                      <strong>{selectedSignal.location.lat.toFixed(6)}, {selectedSignal.location.lng.toFixed(6)}</strong>
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h4>⚙️ Gestion</h4>
                  <div className="detail-row">
                    <span>Statut:</span>
                    <select 
                      value={selectedSignal.status} 
                      onChange={(e) => updateSignalStatus(selectedSignal.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="nouveau">🆕 Nouveau</option>
                      <option value="en_cours">🔄 En cours</option>
                      <option value="resolu">✅ Résolu</option>
                    </select>
                  </div>
                  <div className="detail-row">
                    <span>Assigner à:</span>
                    <select 
                      onChange={(e) => assignTechnician(selectedSignal.id, parseInt(e.target.value))}
                      value={selectedSignal.assignedTo || ""}
                      className="assign-select"
                    >
                      <option value="">Non assigné</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.name} ({tech.specialty})</option>
                      ))}
                    </select>
                  </div>
                  {selectedSignal.assignedToName && (
                    <div className="detail-row">
                      <span>Technicien:</span>
                      <strong>👨‍🔧 {selectedSignal.assignedToName}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>💬 Répondre au client</h4>
                <textarea 
                  id="responseText"
                  rows="3"
                  placeholder="Écrivez votre réponse ici..."
                  className="response-textarea"
                />
                <button 
                  className="btn-primary"
                  onClick={() => {
                    const textarea = document.getElementById('responseText');
                    if (textarea.value.trim()) {
                      addResponse(selectedSignal.id, textarea.value);
                      textarea.value = '';
                      alert("Réponse ajoutée avec succès");
                    }
                  }}
                >
                  Envoyer la réponse
                </button>
              </div>

              <div className="detail-section">
                <h4>📝 Historique</h4>
                <div className="timeline">
                  {(selectedSignal.updates || []).map((update, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-message">{update.message}</div>
                        <div className="timeline-date">{new Date(update.timestamp).toLocaleString()}</div>
                        {update.author && <div className="timeline-author">— {update.author}</div>}
                      </div>
                    </div>
                  ))}
                  {(!selectedSignal.updates || selectedSignal.updates.length === 0) && (
                    <p className="no-history">Aucun historique</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== TICKETS MANAGEMENT ====================
const TicketsManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllTickets();
  }, []);

  const loadAllTickets = () => {
    const adminTickets = JSON.parse(localStorage.getItem('admin_tickets') || '[]');
    setTickets(adminTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    const adminTickets = JSON.parse(localStorage.getItem('admin_tickets') || '[]');
    const updatedTickets = adminTickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    );
    localStorage.setItem('admin_tickets', JSON.stringify(updatedTickets));
    
    const adminNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    adminNotifications.unshift({
      id: Date.now(),
      message: `Ticket #${ticketId} mis à jour: ${newStatus}`,
      type: "ticket_update",
      read: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications.slice(0, 100)));
    
    loadAllTickets();
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter !== 'all' && ticket.status !== filter) return false;
    if (searchTerm && !ticket.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !ticket.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="tickets-management">
      <div className="page-header">
        <div className="header-left">
          <h2>🎫 Gestion des Tickets</h2>
          <p>Tous les tickets reçus du chatbot</p>
        </div>
        <div className="header-actions">
          <input 
            type="text" 
            placeholder="Rechercher un ticket..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tous ({tickets.length})
        </button>
        <button className={`filter-tab ${filter === 'nouveau' ? 'active' : ''}`} onClick={() => setFilter('nouveau')}>
          Nouveaux ({tickets.filter(t => t.status === 'nouveau').length})
        </button>
        <button className={`filter-tab ${filter === 'en_cours' ? 'active' : ''}`} onClick={() => setFilter('en_cours')}>
          En cours ({tickets.filter(t => t.status === 'en_cours').length})
        </button>
        <button className={`filter-tab ${filter === 'resolu' ? 'active' : ''}`} onClick={() => setFilter('resolu')}>
          Résolus ({tickets.filter(t => t.status === 'resolu').length})
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon">📭</div>
          <h3>Aucun ticket</h3>
          <p>Les tickets créés via le chatbot apparaîtront ici</p>
        </div>
      ) : (
        <div className="tickets-table-container">
          <table className="tickets-table-full">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Localisation</th>
                <th>Type</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>#{ticket.ticketNumber}</td>
                  <td>{ticket.fullName}</td>
                  <td>{ticket.phone}</td>
                  <td>{ticket.location}</td>
                  <td>{ticket.problemType}</td>
                  <td>
                    <span className={`priority-badge ${ticket.priority === 'high' ? 'haute' : ticket.priority === 'medium' ? 'moyenne' : 'basse'}`}>
                      {ticket.priority === 'high' ? 'Haute' : ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={ticket.status} 
                      onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="nouveau">🆕 Nouveau</option>
                      <option value="en_cours">🔄 En cours</option>
                      <option value="resolu">✅ Résolu</option>
                    </select>
                   </td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/admin/tickets/${ticket.id}`} className="action-link">
                      Détails
                    </Link>
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

// ==================== TICKET DETAIL ====================
const TicketDetail = () => {
  const [ticket, setTicket] = useState(null);
  const [response, setResponse] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = () => {
    const adminTickets = JSON.parse(localStorage.getItem('admin_tickets') || '[]');
    const found = adminTickets.find(t => t.id === parseInt(id));
    if (found) {
      setTicket(found);
    } else {
      navigate('/admin/tickets');
    }
  };

  const updateTicket = (updatedTicket) => {
    const adminTickets = JSON.parse(localStorage.getItem('admin_tickets') || '[]');
    const updated = adminTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t);
    localStorage.setItem('admin_tickets', JSON.stringify(updated));
    setTicket(updatedTicket);
  };

  const sendResponse = () => {
    if (!response.trim()) return;
    
    const updatedTicket = {
      ...ticket,
      updates: [
        { 
          message: `Réponse administrateur: ${response}`, 
          timestamp: new Date().toISOString(),
          author: "Administrateur"
        },
        ...(ticket.updates || [])
      ]
    };
    
    updateTicket(updatedTicket);
    setResponse('');
  };

  const updateStatus = (newStatus) => {
    const updatedTicket = { ...ticket, status: newStatus };
    updateTicket(updatedTicket);
  };

  if (!ticket) return <div className="loading"><div className="loading-spinner"></div><p>Chargement...</p></div>;

  return (
    <div className="ticket-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/admin/tickets')}>← Retour</button>
        <h2>Détail du Ticket #{ticket.ticketNumber}</h2>
      </div>

      <div className="detail-card">
        <div className="detail-info">
          <div className="detail-title-section">
            <h3>{ticket.problemType}</h3>
            <span className={`detail-status ${ticket.status}`}>
              {ticket.status === "en_cours" ? "🔄 En cours" : ticket.status === "resolu" ? "✅ Résolu" : "🆕 Nouveau"}
            </span>
          </div>
          
          <div className="detail-meta">
            <span className="detail-priority">
              Priorité: {ticket.priority === 'high' ? '🔴 Haute' : ticket.priority === 'medium' ? '🟡 Moyenne' : '🟢 Basse'}
            </span>
            <span className="detail-client">Client: {ticket.fullName}</span>
            <span className="detail-phone">📞 {ticket.phone}</span>
            <span className="detail-location">📍 {ticket.location}</span>
          </div>
          
          <div className="description-section">
            <h4>Description du problème</h4>
            <p>{ticket.problemDescription}</p>
          </div>
        </div>

        <div className="status-actions">
          <h4>Changer le statut</h4>
          <div className="status-buttons">
            <button 
              className={`status-btn ${ticket.status === 'nouveau' ? 'active' : ''}`}
              onClick={() => updateStatus('nouveau')}
            >
              🆕 Nouveau
            </button>
            <button 
              className={`status-btn ${ticket.status === 'en_cours' ? 'active' : ''}`}
              onClick={() => updateStatus('en_cours')}
            >
              🔄 En cours
            </button>
            <button 
              className={`status-btn ${ticket.status === 'resolu' ? 'active' : ''}`}
              onClick={() => updateStatus('resolu')}
            >
              ✅ Résolu
            </button>
          </div>
        </div>

        <div className="response-section">
          <h4>Répondre au client</h4>
          <textarea 
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Écrivez votre réponse ici..."
            rows="4"
          />
          <button className="btn-primary" onClick={sendResponse}>Envoyer la réponse</button>
        </div>

        <div className="detail-updates">
          <h4>📝 Historique des échanges</h4>
          <div className="timeline">
            {(ticket.updates || []).map((update, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-message">{update.message}</div>
                  <div className="timeline-date">{update.timestamp ? new Date(update.timestamp).toLocaleString() : ''}</div>
                  {update.author && <div className="timeline-author">— {update.author}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== TECHNICIANS MANAGEMENT ====================
const TechniciansManagement = () => {
  const [technicians, setTechnicians] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTech, setNewTech] = useState({ name: '', email: '', specialty: '', phone: '' });

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = () => {
    const techs = JSON.parse(localStorage.getItem('technicians') || '[]');
    setTechnicians(techs);
  };

  const saveTechnicians = (techs) => {
    localStorage.setItem('technicians', JSON.stringify(techs));
    setTechnicians(techs);
  };

  const addTechnician = (e) => {
    e.preventDefault();
    const newTechnician = {
      id: Date.now(),
      ...newTech,
      status: 'disponible',
      activeTickets: 0,
      joinDate: new Date().toISOString()
    };
    saveTechnicians([...technicians, newTechnician]);
    setShowAddForm(false);
    setNewTech({ name: '', email: '', specialty: '', phone: '' });
  };

  const deleteTechnician = (id) => {
    if (window.confirm("Supprimer ce technicien ?")) {
      saveTechnicians(technicians.filter(t => t.id !== id));
    }
  };

  const updateTechStatus = (id, status) => {
    const updated = technicians.map(t => t.id === id ? { ...t, status } : t);
    saveTechnicians(updated);
  };

  return (
    <div className="technicians-management">
      <div className="page-header">
        <div className="header-left">
          <h2>👨‍🔧 Gestion des Techniciens</h2>
          <p>Gérez l'équipe technique</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          + Ajouter un technicien
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Nouveau Technicien</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={addTechnician}>
              <div className="form-group">
                <label>Nom complet</label>
                <input type="text" value={newTech.name} onChange={(e) => setNewTech({...newTech, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={newTech.email} onChange={(e) => setNewTech({...newTech, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" value={newTech.phone} onChange={(e) => setNewTech({...newTech, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Spécialité</label>
                <select value={newTech.specialty} onChange={(e) => setNewTech({...newTech, specialty: e.target.value})} required>
                  <option value="">Sélectionner</option>
                  <option value="Réseau Fibre">Réseau Fibre</option>
                  <option value="ADSL">ADSL</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Support Client">Support Client</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {technicians.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon">👥</div>
          <h3>Aucun technicien</h3>
          <p>Ajoutez votre premier technicien</p>
        </div>
      ) : (
        <div className="technicians-grid">
          {technicians.map(tech => (
            <div key={tech.id} className="technician-card">
              <div className="tech-card-header">
                <div className="tech-avatar-large">
                  {tech.name.charAt(0)}
                  <div className={`tech-status-dot ${tech.status}`}></div>
                </div>
                <h3>{tech.name}</h3>
                <p>{tech.specialty}</p>
              </div>
              <div className="tech-card-body">
                <div className="tech-info-row">
                  <span>📧</span>
                  <span>{tech.email}</span>
                </div>
                <div className="tech-info-row">
                  <span>📱</span>
                  <span>{tech.phone || "Non renseigné"}</span>
                </div>
                <div className="tech-info-row">
                  <span>🎫</span>
                  <span>{tech.activeTickets} tickets actifs</span>
                </div>
              </div>
              <div className="tech-card-footer">
                <select value={tech.status} onChange={(e) => updateTechStatus(tech.id, e.target.value)} className="status-select">
                  <option value="disponible">🟢 Disponible</option>
                  <option value="occupe">🟡 Occupé</option>
                  <option value="absent">🔴 Absent</option>
                </select>
                <button className="btn-danger-small" onClick={() => deleteTechnician(tech.id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== REAL-TIME PANNES ====================
const RealtimePannes = () => {
  const [pannes, setPannes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPanne, setNewPanne] = useState({ title: '', location: '', type: 'reseau', severity: 'majeure' });

  useEffect(() => {
    loadPannes();
    const interval = setInterval(loadPannes, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadPannes = () => {
    const saved = JSON.parse(localStorage.getItem('realtime_pannes') || '[]');
    setPannes(saved);
  };

  const savePannes = (data) => {
    localStorage.setItem('realtime_pannes', JSON.stringify(data));
    setPannes(data);
  };

  const addPanne = (e) => {
    e.preventDefault();
    const panne = {
      id: Date.now(),
      ...newPanne,
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    savePannes([panne, ...pannes]);
    setShowAddForm(false);
    setNewPanne({ title: '', location: '', type: 'reseau', severity: 'majeure' });
  };

  const resolvePanne = (id) => {
    const updated = pannes.filter(p => p.id !== id);
    savePannes(updated);
  };

  return (
    <div className="realtime-pannes">
      <div className="page-header">
        <div className="header-left">
          <h2>🔴 Pannes en temps réel</h2>
          <p>Surveillance des incidents réseau</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          + Ajouter une panne
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Nouvelle Panne</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={addPanne}>
              <div className="form-group">
                <label>Titre de la panne</label>
                <input type="text" value={newPanne.title} onChange={(e) => setNewPanne({...newPanne, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Localisation</label>
                <input type="text" value={newPanne.location} onChange={(e) => setNewPanne({...newPanne, location: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={newPanne.type} onChange={(e) => setNewPanne({...newPanne, type: e.target.value})}>
                    <option value="reseau">🌐 Réseau</option>
                    <option value="fibre">🔌 Fibre optique</option>
                    <option value="adsl">📡 ADSL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sévérité</label>
                  <select value={newPanne.severity} onChange={(e) => setNewPanne({...newPanne, severity: e.target.value})}>
                    <option value="majeure">🟠 Majeure</option>
                    <option value="critique">🔴 Critique</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Signaler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pannes.length === 0 ? (
        <div className="empty-state-large">
          <div className="empty-icon">✅</div>
          <h3>Aucune panne active</h3>
          <p>Tous les réseaux sont opérationnels</p>
        </div>
      ) : (
        <div className="pannes-grid">
          {pannes.map(panne => (
            <div key={panne.id} className={`panne-card ${panne.severity}`}>
              <div className="panne-header">
                <div className="panne-alert-icon">⚠️</div>
                <span className={`severity-tag ${panne.severity}`}>
                  {panne.severity === "critique" ? "CRITIQUE" : "MAJEURE"}
                </span>
              </div>
              <h3>{panne.title}</h3>
              <div className="panne-location">📍 {panne.location}</div>
              <div className="panne-type">{panne.type === "reseau" ? "🌐 Réseau" : panne.type === "fibre" ? "🔌 Fibre" : "📡 ADSL"}</div>
              <div className="panne-time">🕐 {new Date(panne.timestamp).toLocaleString()}</div>
              <button className="resolve-btn" onClick={() => resolvePanne(panne.id)}>✅ Marquer résolue</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== INFRASTRUCTURE MONITORING ====================
const InfrastructureMonitoring = () => {
  const [infra, setInfra] = useState([
    { id: 1, name: "Datacenter Alger", status: "online", load: 45, responseTime: 23 },
    { id: 2, name: "Nœud Oran", status: "online", load: 62, responseTime: 45 },
    { id: 3, name: "Nœud Constantine", status: "degraded", load: 88, responseTime: 120 },
    { id: 4, name: "Nœud Annaba", status: "online", load: 34, responseTime: 28 },
    { id: 5, name: "Station Tizi Ouzou", status: "offline", load: 0, responseTime: 999 },
  ]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'online': return '🟢';
      case 'degraded': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="infrastructure-monitoring">
      <div className="page-header">
        <div className="header-left">
          <h2>🏗️ Infrastructure Réseau</h2>
          <p>Surveillance des nœuds et datacenters</p>
        </div>
      </div>

      <div className="infra-stats">
        <div className="infra-stat">
          <div className="infra-stat-value">{infra.filter(i => i.status === 'online').length}</div>
          <div className="infra-stat-label">Nœuds actifs</div>
        </div>
        <div className="infra-stat">
          <div className="infra-stat-value">{infra.filter(i => i.status === 'degraded').length}</div>
          <div className="infra-stat-label">Dégradés</div>
        </div>
        <div className="infra-stat">
          <div className="infra-stat-value">{infra.filter(i => i.status === 'offline').length}</div>
          <div className="infra-stat-label">Hors ligne</div>
        </div>
      </div>

      <div className="infra-grid">
        {infra.map(node => (
          <div key={node.id} className={`infra-card ${node.status}`}>
            <div className="infra-header">
              <span className="infra-status">{getStatusIcon(node.status)}</span>
              <span className="infra-name">{node.name}</span>
            </div>
            <div className="infra-details">
              <div className="infra-detail">
                <span>Charge:</span>
                <div className="progress-bar-small">
                  <div className="progress-fill" style={{ width: `${node.load}%`, backgroundColor: node.load > 80 ? '#ef4444' : node.load > 60 ? '#f59e0b' : '#10b981' }}></div>
                </div>
                <span>{node.load}%</span>
              </div>
              <div className="infra-detail">
                <span>Latence:</span>
                <strong>{node.responseTime}ms</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="infra-map-placeholder">
        <div className="map-icon">🗺️</div>
        <p>Carte réseau interactive (intégration API géographique)</p>
      </div>
    </div>
  );
};

// ==================== REPORTS & ANALYTICS ====================
const ReportsAnalytics = () => {
  const [reportType, setReportType] = useState('signals');
  const [dateRange, setDateRange] = useState('week');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange]);

  const generateReport = () => {
    const allSignals = JSON.parse(localStorage.getItem('admin_signals') || '[]');
    const allTickets = JSON.parse(localStorage.getItem('admin_tickets') || '[]');
    
    let data = [];
    if (reportType === 'signals') data = allSignals;
    else if (reportType === 'tickets') data = allTickets;
    else data = [...allSignals, ...allTickets];

    const now = new Date();
    let filteredData = data;
    
    if (dateRange === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filteredData = data.filter(item => new Date(item.createdAt) > weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filteredData = data.filter(item => new Date(item.createdAt) > monthAgo);
    }

    const byStatus = {
      nouveau: filteredData.filter(item => item.status === 'nouveau').length,
      en_cours: filteredData.filter(item => item.status === 'en_cours').length,
      resolu: filteredData.filter(item => item.status === 'resolu').length
    };

    const byPriority = {
      haute: filteredData.filter(item => item.priority === 'haute' || item.priority === 'high').length,
      moyenne: filteredData.filter(item => item.priority === 'moyenne' || item.priority === 'medium').length,
      basse: filteredData.filter(item => item.priority === 'basse' || item.priority === 'low').length
    };

    setReportData({ total: filteredData.length, byStatus, byPriority });
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      type: reportType,
      dateRange,
      data: reportData
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${reportType}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!reportData) return <div className="loading">Chargement...</div>;

  return (
    <div className="reports-analytics">
      <div className="page-header">
        <div className="header-left">
          <h2>📊 Rapports & Analyses</h2>
          <p>Statistiques et indicateurs de performance</p>
        </div>
        <button className="btn-primary" onClick={exportReport}>
          📥 Exporter le rapport
        </button>
      </div>

      <div className="report-filters">
        <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="filter-select">
          <option value="signals">Signalements clients</option>
          <option value="tickets">Tickets chatbot</option>
          <option value="all">Toutes les demandes</option>
        </select>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="filter-select">
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="all">Tout</option>
        </select>
      </div>

      <div className="report-stats">
        <div className="report-stat-card">
          <div className="report-stat-value">{reportData.total}</div>
          <div className="report-stat-label">Total demandes</div>
        </div>
        <div className="report-stat-card">
          <div className="report-stat-value">{Math.round((reportData.byStatus.resolu / reportData.total) * 100) || 0}%</div>
          <div className="report-stat-label">Taux résolution</div>
        </div>
      </div>

      <div className="report-sections">
        <div className="report-section">
          <h3>Par statut</h3>
          <div className="chart-bars">
            <div className="chart-item">
              <span>Nouveaux</span>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ width: `${(reportData.byStatus.nouveau / reportData.total) * 100}%`, backgroundColor: '#f59e0b' }}></div>
                <span className="chart-value">{reportData.byStatus.nouveau}</span>
              </div>
            </div>
            <div className="chart-item">
              <span>En cours</span>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ width: `${(reportData.byStatus.en_cours / reportData.total) * 100}%`, backgroundColor: '#3b82f6' }}></div>
                <span className="chart-value">{reportData.byStatus.en_cours}</span>
              </div>
            </div>
            <div className="chart-item">
              <span>Résolus</span>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ width: `${(reportData.byStatus.resolu / reportData.total) * 100}%`, backgroundColor: '#10b981' }}></div>
                <span className="chart-value">{reportData.byStatus.resolu}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h3>Par priorité</h3>
          <div className="stats-list">
            <div className="stat-item">
              <span className="stat-label">🔴 Haute</span>
              <span className="stat-number">{reportData.byPriority.haute}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🟡 Moyenne</span>
              <span className="stat-number">{reportData.byPriority.moyenne}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🟢 Basse</span>
              <span className="stat-number">{reportData.byPriority.basse}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== ADMIN SETTINGS ====================
const AdminSettings = ({ admin }) => {
  const [settings, setSettings] = useState({
    autoAssignTickets: true,
    emailAlerts: true,
    backupEnabled: false,
    maintenanceMode: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('admin_settings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('admin_settings', JSON.stringify(newSettings));
  };

  const clearAllData = () => {
    if (window.confirm("⚠️ Supprimer TOUTES les données ? Cette action est irréversible !")) {
      localStorage.removeItem('admin_tickets');
      localStorage.removeItem('admin_signals');
      localStorage.removeItem('admin_notifications');
      localStorage.removeItem('realtime_pannes');
      alert("Toutes les données ont été supprimées.");
      window.location.reload();
    }
  };

  return (
    <div className="admin-settings">
      <div className="page-header">
        <div className="header-left">
          <h2>⚙️ Paramètres Administrateur</h2>
          <p>Configuration du système</p>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-section">
          <h3>🤖 Automatisation</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Assignation automatique</span>
              <span className="setting-desc">Assigner automatiquement les tickets aux techniciens</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.autoAssignTickets} onChange={() => saveSettings({...settings, autoAssignTickets: !settings.autoAssignTickets})} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>🔔 Alertes</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Alertes email</span>
              <span className="setting-desc">Recevoir des alertes par email</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.emailAlerts} onChange={() => saveSettings({...settings, emailAlerts: !settings.emailAlerts})} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>💾 Sauvegarde</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Sauvegarde automatique</span>
              <span className="setting-desc">Sauvegarde quotidienne des données</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.backupEnabled} onChange={() => saveSettings({...settings, backupEnabled: !settings.backupEnabled})} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section danger">
          <h3>⚠️ Zone de danger</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Mode maintenance</span>
              <span className="setting-desc">Rendre le site inaccessible aux utilisateurs</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={() => saveSettings({...settings, maintenanceMode: !settings.maintenanceMode})} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Supprimer toutes les données</span>
              <span className="setting-desc">Supprime tickets, signalements et pannes</span>
            </div>
            <button className="btn-danger" onClick={clearAllData}>Tout supprimer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN ADMIN DASHBOARD ====================
const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentAdmin = localStorage.getItem('currentAdmin');
    if (!currentAdmin) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(currentAdmin));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    navigate('/admin/login');
  };

  if (!admin) return null;

  const menuItems = [
    { path: "/admin", icon: "🏠", label: "Tableau de bord", exact: true },
    { path: "/admin/signals", icon: "📱", label: "Signalements", exact: false },
    { path: "/admin/tickets", icon: "🎫", label: "Tickets reçus" },
    { path: "/admin/techniciens", icon: "👨‍🔧", label: "Techniciens" },
    { path: "/admin/pannes", icon: "🔴", label: "Pannes temps réel" },
    { path: "/admin/infrastructure", icon: "🏗️", label: "Infrastructure" },
    { path: "/admin/rapports", icon: "📊", label: "Rapports" },
    { path: "/admin/parametres", icon: "⚙️", label: "Paramètres" },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`admin-dashboard ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <div className="hamburger-icon"><span></span><span></span><span></span></div>
      </button>

      <button className="sidebar-toggle-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
        {sidebarCollapsed ? "→" : "←"}
      </button>

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
            {admin.fullName.charAt(0).toUpperCase()}
            <div className="user-status admin"></div>
          </div>
          {!sidebarCollapsed && (
            <div className="user-details">
              <h4>{admin.fullName}</h4>
              <p>Administrateur</p>
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

      <main className="admin-main">
        <div className="admin-content">
          <Routes>
            <Route path="/" element={<DashboardHome admin={admin} />} />
            <Route path="/signals" element={<SignalsManagement />} />
            <Route path="/tickets" element={<TicketsManagement />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/techniciens" element={<TechniciansManagement />} />
            <Route path="/pannes" element={<RealtimePannes />} />
            <Route path="/infrastructure" element={<InfrastructureMonitoring />} />
            <Route path="/rapports" element={<ReportsAnalytics />} />
            <Route path="/parametres" element={<AdminSettings admin={admin} />} />
          </Routes>
        </div>
      </main>

      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>}
    </div>
  );
};

function useParams() {
  const location = useLocation();
  const match = location.pathname.match(/\/admin\/tickets\/(\d+)/);
  return { id: match ? match[1] : null };
}

export default AdminDashboard;