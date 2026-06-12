import React from "react";
// import "../styles/Home.css";
import "../index.css";

import { useNavigate } from "react-router-dom";
import Algerie_telecom from "../images/Algerie_telecom.jpg";
import Map from "../images/Map.jpg";
// import Algerie from "../images/Algerie.png";

const Home = () => {
    
  const navigate = useNavigate();



    return (
        <div className="netguard-wrapper">
            <div className="netguard-container">
                {/* Header */}
                <header className="netguard-header">
                    <div className="header-logo">
                        {/* Algerian Telecom Logo Image */}
                        <img 
                            src={Algerie_telecom} 
                            alt="Algérie Télécom" 
                            className="algerie-telecom-logo-img"
                        />
                        <div className="logo-text">
                            <h1>Algérie Télécom</h1>
                            <p className="arabic-text">اتصالات الجزائر</p>
                        </div>
                    </div>
                    <div className="status-badge">
                        <span className="badge-dot"></span>
                        <span>En ligne</span>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="hero-section">
                    <div className="hero-left">
                        <h1 className="hero-title">NetGuard DZ</h1>
                        <p className="hero-subtitle">
                            AI-Powered Internet Monitoring &<br />
                            Outage Management Platform
                        </p>
                        <div className="hero-body">
                            <h3 className="hero-tagline">Smart. Fast. Reliable.</h3>
                            <p className="hero-description">
                                Real-time monitoring, AI detection, automatic compensation<br />
                                and a better internet experience for all Algerians.
                            </p>
                        </div>
                        <div className="hero-actions">
                            <button onClick={() => navigate("/signin")} className="btn btn-blue">Signaler un problème</button>
                            <button onClick={() => navigate("/signin")} className="btn btn-outline">Voir l'état du réseau</button>
                        </div>
                    </div>
                    
                    {/* Phone Mockup with Map Image */}
                    <div className="hero-visual">
                        <div className="phone-mockup">
                            <div className="island-notch"></div>
                            <div className="map-container">
                                <img 
                                    src={Map} 
                                    alt="Carte de l'Algérie" 
                                    className="map-image"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Strip */}
                <div className="stats-strip">
                    <div className="stat-box">
                        <span className="stat-number text-light-blue">12.4K</span>
                        <span className="stat-label">Signalements aujourd'hui</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number text-light-blue">2.45K</span>
                        <span className="stat-label">Utilisateurs affectés</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number text-dark-blue">48</span>
                        <span className="stat-label">Pannes actives</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number text-cyan">98.7%</span>
                        <span className="stat-label">Disponibilité réseau</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number text-green">2.4h</span>
                        <span className="stat-label">Temps moyen de résolution</span>
                    </div>
                </div>

                {/* Features Panel */}
                <div className="features-panel">
                    <h2 className="panel-heading">Pourquoi NetGuard DZ ?</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="icon-circle">
                                <div className="icon-eye-dot"></div>
                            </div>
                            <h4>Détection IA</h4>
                            <p>Détection automatique des pannes et anomalies</p>
                        </div>
                        <div className="feature-item">
                            <div className="icon-circle">
                                <div className="icon-refresh"></div>
                            </div>
                            <h4>Compensation Auto</h4>
                            <p>Passes internet et remboursement automatique</p>
                        </div>
                        <div className="feature-item">
                            <div className="icon-circle">
                                <div className="icon-pin"></div>
                            </div>
                            <h4>Carte en temps réel</h4>
                            <p>Visualiser les pannes en direct</p>
                        </div>
                        <div className="feature-item">
                            <div className="icon-circle">
                                <div className="icon-chat"></div>
                            </div>
                            <h4>Support Intelligent</h4>
                            <p>Chatbot IA disponible 24/7</p>
                        </div>
                        <div className="feature-item">
                            <div className="icon-circle">
                                <div className="icon-tech"></div>
                            </div>
                            <h4>Techniciens Proches</h4>
                            <p>Intervention rapide avec géolocalisation</p>
                        </div>
                        <div className="feature-item">
                            <div className="icon-circle">
                                <div className="icon-shield"></div>
                            </div>
                            <h4>Transparence Totale</h4>
                            <p>Suivi en temps réel de vos demandes</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="netguard-footer">
                    <h3 className="trust-title">Ils nous font confiance</h3>
                    <div className="footer-logos">
                        <div className="logo-brand">
                            <img 
                                src={Algerie_telecom} 
                                alt="Algérie Télécom" 
                                className="footer-logo-img"
                            />
                            <span>Algérie Télécom</span>
                        </div>
                        <div className="arabic-brand-text">
                            اتصالات الجزائر
                        </div>
                    </div>
                    <p className="footer-quote">
                        "Une plateforme intelligente pour un réseau plus fort et plus fiable."
                    </p>
                    <div className="trust-badges-bar">
                        <div className="badge-item">
                            <i className="dot-sec"></i>
                            <span>Sécurisé</span>
                        </div>
                        <div className="badge-item">
                            <i className="dot-fia"></i>
                            <span>Fiable</span>
                        </div>
                        <div className="badge-item">
                            <i className="dot-int"></i>
                            <span>Intelligent</span>
                        </div>
                        <div className="badge-item">
                            <i className="dot-dz"></i>
                            <span>Fait en Algérie</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;
