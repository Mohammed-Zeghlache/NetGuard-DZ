import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Algerie_telecom from "../images/Algerie_telecom.jpg";
import "../Styles/UserDashboard.css";
import "../Styles/UserSignal.css";

const UserSignal = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [location, setLocation] = useState({ lat: null, lng: null, address: "", wilaya: "", commune: "" });
    const [isLocating, setIsLocating] = useState(false);
    const [formData, setFormData] = useState({
        phoneNumber: "",
        clientCode: "",
        problemType: "",
        subProblem: "",
        description: "",
        priority: "moyenne",
        availableTimes: "",
        contactMethod: "phone"
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [touchedFields, setTouchedFields] = useState({});

    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(currentUser));
    }, [navigate]);

    // Problem categories with sub-problems
    const problemCategories = {
        panne: {
            icon: "🔌",
            title: "Panne Totale",
            color: "#ef4444",
            subProblems: [
                { id: "no_power", label: "Pas d'alimentation", icon: "⚡" },
                { id: "no_signal", label: "Aucun signal", icon: "📡" },
                { id: "modem_dead", label: "Modem ne s'allume pas", icon: "💀" },
                { id: "line_cut", label: "Coupure de ligne", icon: "✂️" }
            ]
        },
        lent: {
            icon: "⚡",
            title: "Connexion Lente",
            color: "#f59e0b",
            subProblems: [
                { id: "download_slow", label: "Téléchargement lent", icon: "📥" },
                { id: "upload_slow", label: "Téléversement lent", icon: "📤" },
                { id: "high_ping", label: "Latence élevée", icon: "⏱️" },
                { id: "buffering", label: "Buffering vidéo", icon: "🎬" }
            ]
        },
        instable: {
            icon: "📡",
            title: "Connexion Instable",
            color: "#8b5cf6",
            subProblems: [
                { id: "frequent_disconnect", label: "Déconnexions fréquentes", icon: "🔄" },
                { id: "wifi_drops", label: "WiFi qui saute", icon: "📶" },
                { id: "sync_loss", label: "Perte de synchro", icon: "⚠️" },
                { id: "intermittent", label: "Connexion intermittente", icon: "⏳" }
            ]
        },
        wifi: {
            icon: "📶",
            title: "Problème WiFi",
            color: "#10b981",
            subProblems: [
                { id: "no_wifi", label: "WiFi invisible", icon: "👻" },
                { id: "cant_connect", label: "Impossible de se connecter", icon: "🚫" },
                { id: "weak_signal", label: "Signal faible", icon: "📉" },
                { id: "password_error", label: "Erreur mot de passe", icon: "🔑" }
            ]
        },
        facture: {
            icon: "💰",
            title: "Problème Facturation",
            color: "#ec4899",
            subProblems: [
                { id: "wrong_amount", label: "Montant incorrect", icon: "💸" },
                { id: "payment_failed", label: "Paiement échoué", icon: "❌" },
                { id: "invoice_not_received", label: "Facture non reçue", icon: "📄" },
                { id: "overcharge", label: "Surcharge", icon: "⚠️" }
            ]
        },
        materiel: {
            icon: "🖥️",
            title: "Problème Matériel",
            color: "#06b6d4",
            subProblems: [
                { id: "modem_defect", label: "Modem défectueux", icon: "🔧" },
                { id: "cable_issue", label: "Câble endommagé", icon: "🔌" },
                { id: "port_damaged", label: "Port endommagé", icon: "💢" },
                { id: "overheating", label: "Surchauffe", icon: "🌡️" }
            ]
        }
    };

    // Wilayas of Algeria
    const wilayas = [
        "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
        "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
        "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara",
        "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
        "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
        "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt",
        "Djanet", "El M'Ghair", "El Menia"
    ];

    // Communes mapping
    const communes = {
        "Alger": ["Alger-Centre", "Sidi M'Hamed", "El Madania", "Belouizdad", "Bab El Oued", "Casbah", "Oued Koriche", "Birkhadem", "El Biar", "Bouzareah", "Ben Aknoun", "Hydra", "Dely Ibrahim", "Staoueli", "Rouïba", "Reghaïa", "Dar El Beïda", "Bab Ezzouar", "Bordj El Kiffan", "Mohammadia"],
        "Oran": ["Oran-Centre", "Sidi El Houari", "El Amir", "El Mokrani", "Es Sénia", "Bir El Djir", "Hassi Bounif", "Hassi Ben Okba", "Arzew", "Bethioua", "Mers El Kébir", "Boutlélis", "Tafraoui"],
        "Constantine": ["Constantine-Centre", "El Khroub", "Aïn Smara", "Beni Hamidene", "Didouche Mourad", "Hamma Bouziane", "Ibn Ziad", "Zighoud Youcef"],
        "Annaba": ["Annaba-Centre", "El Bouni", "El Hadjar", "Seraïdi", "Berrahal", "Chetaïbi", "Sidi Amar"],
        "Blida": ["Blida-Centre", "Boufarik", "Beni Mered", "El Affroun", "Mouzaia", "Soumaa", "Oued El Alleug", "Bouinan"],
        "Sétif": ["Sétif-Centre", "El Eulma", "Aïn Arnat", "Bazer Sra", "Hamma", "Guidjel", "Ouled Sabor"],
        "Tizi Ouzou": ["Tizi Ouzou-Centre", "Azazga", "Draâ Ben Khedda", "Boghni", "Ouaguenoun", "Mekla", "Azeffoun"]
    };

    // Validation functions for each step
    const validateStep1 = () => {
        const newErrors = {};
        const cleanPhone = formData.phoneNumber.replace(/\s/g, '');
        
        if (!formData.phoneNumber || cleanPhone.length !== 10) {
            newErrors.phoneNumber = "Numéro de téléphone invalide (10 chiffres)";
        }
        if (!formData.contactMethod) {
            newErrors.contactMethod = "Veuillez sélectionner une méthode de contact";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        
        if (!formData.problemType) {
            newErrors.problemType = "Veuillez sélectionner un type de problème";
        }
        if (!formData.subProblem) {
            newErrors.subProblem = "Veuillez sélectionner un sous-problème";
        }
        if (!formData.description || formData.description.trim().length < 10) {
            newErrors.description = "Description trop courte (minimum 10 caractères)";
        }
        if (!formData.priority) {
            newErrors.priority = "Veuillez sélectionner une priorité";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        
        if (!location.wilaya) {
            newErrors.wilaya = "Veuillez sélectionner votre wilaya";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle next button click with validation
    const handleNext = () => {
        let isValid = false;
        
        if (step === 1) {
            isValid = validateStep1();
        } else if (step === 2) {
            isValid = validateStep2();
        } else if (step === 3) {
            isValid = validateStep3();
        }
        
        if (isValid) {
            setStep(step + 1);
            setErrors({});
        }
    };

    // Handle previous button
    const handlePrev = () => {
        setStep(step - 1);
        setErrors({});
    };

    // Auto-detect phone line number
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        if (value.length >= 2) {
            value = value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
        }
        setFormData({ ...formData, phoneNumber: value });
        if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: "" });
    };

    // Auto-detect location
    const detectLocation = useCallback(() => {
        setIsLocating(true);
        
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation(prev => ({ ...prev, lat: latitude, lng: longitude }));
                
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`);
                    const data = await response.json();
                    
                    let wilaya = "";
                    let commune = "";
                    
                    if (data.address) {
                        commune = data.address.city || data.address.town || data.address.village || data.address.suburb || "";
                        wilaya = data.address.state || data.address.region || "";
                        
                        for (const w of wilayas) {
                            if (wilaya.includes(w) || w.includes(wilaya)) {
                                wilaya = w;
                                break;
                            }
                        }
                    }
                    
                    setLocation({
                        lat: latitude,
                        lng: longitude,
                        address: data.display_name || "",
                        wilaya: wilaya,
                        commune: commune
                    });
                    
                    setSuccess("📍 Localisation détectée avec succès");
                    setTimeout(() => setSuccess(""), 3000);
                    
                    if (errors.wilaya) setErrors({ ...errors, wilaya: "" });
                } catch (error) {
                    console.error("Reverse geocoding error:", error);
                    setLocation(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
                }
                setIsLocating(false);
            },
            (error) => {
                setIsLocating(false);
                let errorMessage = "Impossible de détecter votre position";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Veuillez autoriser la géolocalisation";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Position non disponible";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Délai dépassé";
                        break;
                }
                alert(errorMessage);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, [wilayas, errors]);

    const handleWilayaChange = (e) => {
        const selectedWilaya = e.target.value;
        setLocation(prev => ({ ...prev, wilaya: selectedWilaya, commune: "" }));
        if (errors.wilaya) setErrors({ ...errors, wilaya: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isStep1Valid = validateStep1();
        const isStep2Valid = validateStep2();
        const isStep3Valid = validateStep3();
        
        if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
            setStep(1);
            return;
        }
        
        setIsSubmitting(true);
        
        const cleanPhone = formData.phoneNumber.replace(/\s/g, '');
        
        const signalData = {
            phoneNumber: cleanPhone,
            clientCode: formData.clientCode || "",
            problemType: formData.problemType,
            problemTitle: problemCategories[formData.problemType]?.title,
            subProblem: formData.subProblem,
            subProblemLabel: problemCategories[formData.problemType]?.subProblems.find(p => p.id === formData.subProblem)?.label,
            description: formData.description,
            priority: formData.priority,
            contactMethod: formData.contactMethod,
            availableTimes: formData.availableTimes,
            wilaya: location.wilaya,
            commune: location.commune,
            address: location.address,
            lat: location.lat,
            lng: location.lng
        };
        
        try {
            const response = await fetch('http://localhost:5000/api/signals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signalData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSuccess("✅ Signalement envoyé avec succès ! Un technicien vous contactera sous 24h.");
                setTimeout(() => {
                    setIsSubmitting(false);
                    navigate('/dashboard');
                }, 3000);
            } else {
                alert(data.message || "Erreur lors de l'envoi du signalement");
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Error submitting signal:", err);
            alert("Erreur de connexion au serveur. Veuillez réessayer.");
            setIsSubmitting(false);
        }
    };

    const handleBlur = (field) => {
        setTouchedFields({ ...touchedFields, [field]: true });
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const menuItems = [
        { path: "/dashboard", icon: "🏠", label: "Tableau de bord", exact: true },
        { path: "/dashboard/signalements", icon: "📋", label: "Mes Signalements" },
        { path: "/dashboard/notifications", icon: "🔔", label: "Notifications" },
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
                    <div className="user-signal-container">
                        <div className="signal-bg-animation">
                            <div className="signal-orb orb-1"></div>
                            <div className="signal-orb orb-2"></div>
                            <div className="signal-orb orb-3"></div>
                        </div>

                        <div className="signal-card">
                            <div className="signal-header">
                                <div className="signal-header-content">
                                    <div className="signal-logo-wrapper">
                                        <img src={Algerie_telecom} alt="Algérie Télécom" className="signal-logo" />
                                    </div>
                                    <div>
                                        <h1>Signaler un problème</h1>
                                        <p>Décrivez votre problème technique en détail</p>
                                    </div>
                                </div>
                                <div className="signal-status-badge">
                                    <span className="status-dot"></span>
                                    <span>Support 24/7</span>
                                </div>
                            </div>

                            <div className="signal-steps">
                                <div className={`step ${step >= 1 ? 'active' : ''}`}>
                                    <div className="step-number">1</div>
                                    <span>Contact</span>
                                </div>
                                <div className="step-line"></div>
                                <div className={`step ${step >= 2 ? 'active' : ''}`}>
                                    <div className="step-number">2</div>
                                    <span>Problème</span>
                                </div>
                                <div className="step-line"></div>
                                <div className={`step ${step >= 3 ? 'active' : ''}`}>
                                    <div className="step-number">3</div>
                                    <span>Localisation</span>
                                </div>
                                <div className="step-line"></div>
                                <div className={`step ${step >= 4 ? 'active' : ''}`}>
                                    <div className="step-number">4</div>
                                    <span>Confirmation</span>
                                </div>
                            </div>

                            {success && (
                                <div className="success-toast">
                                    <span>✅</span>
                                    <span>{success}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="signal-form">
                                {step === 1 && (
                                    <div className="form-step">
                                        <h2>📞 Informations de contact</h2>
                                        
                                        <div className="form-group">
                                            <label>Numéro de ligne fixe *</label>
                                            <div className="input-with-icon">
                                                <span className="input-icon">📞</span>
                                                <input
                                                    type="tel"
                                                    value={formData.phoneNumber}
                                                    onChange={handlePhoneChange}
                                                    onBlur={() => handleBlur('phoneNumber')}
                                                    placeholder="05 XX XX XX XX"
                                                    className={errors.phoneNumber && touchedFields.phoneNumber ? 'error' : ''}
                                                />
                                            </div>
                                            {errors.phoneNumber && touchedFields.phoneNumber && (
                                                <span className="error-message">{errors.phoneNumber}</span>
                                            )}
                                            <small>Numéro Algerie Télécom (05, 06, 07 suivi de 8 chiffres)</small>
                                        </div>

                                        <div className="form-group">
                                            <label>Code client (optionnel)</label>
                                            <div className="input-with-icon">
                                                <span className="input-icon">🆔</span>
                                                <input
                                                    type="text"
                                                    value={formData.clientCode}
                                                    onChange={(e) => setFormData({ ...formData, clientCode: e.target.value })}
                                                    placeholder="Ex: AT123456789"
                                                />
                                            </div>
                                            <small>Accélère le traitement de votre demande</small>
                                        </div>

                                        <div className="form-group">
                                            <label>Méthode de contact préférée *</label>
                                            <div className="radio-group">
                                                <label className="radio-label">
                                                    <input 
                                                        type="radio" 
                                                        name="contactMethod" 
                                                        value="phone" 
                                                        checked={formData.contactMethod === 'phone'} 
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, contactMethod: e.target.value });
                                                            if (errors.contactMethod) setErrors({ ...errors, contactMethod: "" });
                                                        }}
                                                    />
                                                    <span>📞 Appel téléphonique</span>
                                                </label>
                                                <label className="radio-label">
                                                    <input 
                                                        type="radio" 
                                                        name="contactMethod" 
                                                        value="whatsapp" 
                                                        checked={formData.contactMethod === 'whatsapp'} 
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, contactMethod: e.target.value });
                                                            if (errors.contactMethod) setErrors({ ...errors, contactMethod: "" });
                                                        }}
                                                    />
                                                    <span>💬 WhatsApp</span>
                                                </label>
                                                <label className="radio-label">
                                                    <input 
                                                        type="radio" 
                                                        name="contactMethod" 
                                                        value="sms" 
                                                        checked={formData.contactMethod === 'sms'} 
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, contactMethod: e.target.value });
                                                            if (errors.contactMethod) setErrors({ ...errors, contactMethod: "" });
                                                        }}
                                                    />
                                                    <span>📱 SMS</span>
                                                </label>
                                            </div>
                                            {errors.contactMethod && <span className="error-message">{errors.contactMethod}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>Horaires disponibles pour intervention</label>
                                            <div className="input-with-icon">
                                                <span className="input-icon">⏰</span>
                                                <input
                                                    type="text"
                                                    value={formData.availableTimes}
                                                    onChange={(e) => setFormData({ ...formData, availableTimes: e.target.value })}
                                                    placeholder="Ex: 9h-12h ou 14h-17h"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-navigation">
                                            <button type="button" className="btn-next" onClick={handleNext}>
                                                Suivant
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="form-step">
                                        <h2>🔍 Décrivez votre problème</h2>
                                        
                                        <div className="form-group">
                                            <label>Type de problème *</label>
                                            <div className="problem-grid">
                                                {Object.entries(problemCategories).map(([key, cat]) => (
                                                    <div
                                                        key={key}
                                                        className={`problem-card ${formData.problemType === key ? 'selected' : ''}`}
                                                        style={{ '--problem-color': cat.color }}
                                                        onClick={() => {
                                                            setFormData({ ...formData, problemType: key, subProblem: "" });
                                                            if (errors.problemType) setErrors({ ...errors, problemType: "" });
                                                        }}
                                                    >
                                                        <div className="problem-icon">{cat.icon}</div>
                                                        <div className="problem-title">{cat.title}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.problemType && <span className="error-message center">{errors.problemType}</span>}
                                        </div>

                                        {formData.problemType && (
                                            <div className="form-group">
                                                <label>Problème spécifique *</label>
                                                <div className="subproblems-grid">
                                                    {problemCategories[formData.problemType].subProblems.map(sub => (
                                                        <div
                                                            key={sub.id}
                                                            className={`subproblem-card ${formData.subProblem === sub.id ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                setFormData({ ...formData, subProblem: sub.id });
                                                                if (errors.subProblem) setErrors({ ...errors, subProblem: "" });
                                                            }}
                                                        >
                                                            <span className="sub-icon">{sub.icon}</span>
                                                            <span>{sub.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {errors.subProblem && <span className="error-message center">{errors.subProblem}</span>}
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <label>Description détaillée *</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, description: e.target.value });
                                                    if (errors.description) setErrors({ ...errors, description: "" });
                                                }}
                                                onBlur={() => handleBlur('description')}
                                                rows="4"
                                                placeholder="Décrivez précisément votre problème (minimum 10 caractères)..."
                                                className={errors.description && touchedFields.description ? 'error' : ''}
                                            />
                                            <small>Minimum 10 caractères</small>
                                            {errors.description && touchedFields.description && (
                                                <span className="error-message">{errors.description}</span>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>Priorité *</label>
                                            <div className="priority-select">
                                                <button
                                                    type="button"
                                                    className={`priority-option ${formData.priority === 'haute' ? 'active haute' : ''}`}
                                                    onClick={() => {
                                                        setFormData({ ...formData, priority: 'haute' });
                                                        if (errors.priority) setErrors({ ...errors, priority: "" });
                                                    }}
                                                >
                                                    🔴 Haute - Urgence immédiate
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`priority-option ${formData.priority === 'moyenne' ? 'active moyenne' : ''}`}
                                                    onClick={() => {
                                                        setFormData({ ...formData, priority: 'moyenne' });
                                                        if (errors.priority) setErrors({ ...errors, priority: "" });
                                                    }}
                                                >
                                                    🟡 Moyenne - Intervention rapide
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`priority-option ${formData.priority === 'basse' ? 'active basse' : ''}`}
                                                    onClick={() => {
                                                        setFormData({ ...formData, priority: 'basse' });
                                                        if (errors.priority) setErrors({ ...errors, priority: "" });
                                                    }}
                                                >
                                                    🟢 Basse - Planifié
                                                </button>
                                            </div>
                                            {errors.priority && <span className="error-message center">{errors.priority}</span>}
                                        </div>

                                        <div className="form-navigation">
                                            <button type="button" className="btn-prev" onClick={handlePrev}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="15 18 9 12 15 6" />
                                                </svg>
                                                Précédent
                                            </button>
                                            <button type="button" className="btn-next" onClick={handleNext}>
                                                Suivant
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="form-step">
                                        <h2>📍 Votre localisation</h2>
                                        
                                        <div className="location-detect">
                                            <button type="button" className="detect-btn" onClick={detectLocation} disabled={isLocating}>
                                                {isLocating ? (
                                                    <>
                                                        <div className="btn-spinner-small"></div>
                                                        Localisation en cours...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>📍</span>
                                                        Détecter ma position automatique
                                                    </>
                                                )}
                                            </button>
                                            {location.lat && (
                                                <div className="location-preview">
                                                    <div className="location-coords">
                                                        📍 Lat: {location.lat.toFixed(6)} | Lng: {location.lng.toFixed(6)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Wilaya *</label>
                                                <select
                                                    value={location.wilaya}
                                                    onChange={handleWilayaChange}
                                                    onBlur={() => handleBlur('wilaya')}
                                                    className={errors.wilaya && touchedFields.wilaya ? 'error' : ''}
                                                >
                                                    <option value="">Sélectionnez votre wilaya</option>
                                                    {wilayas.map(w => (
                                                        <option key={w} value={w}>{w}</option>
                                                    ))}
                                                </select>
                                                {errors.wilaya && touchedFields.wilaya && (
                                                    <span className="error-message">{errors.wilaya}</span>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label>Commune</label>
                                                <select
                                                    value={location.commune}
                                                    onChange={(e) => setLocation(prev => ({ ...prev, commune: e.target.value }))}
                                                    disabled={!location.wilaya}
                                                >
                                                    <option value="">Sélectionnez votre commune</option>
                                                    {location.wilaya && communes[location.wilaya]?.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Adresse complète (optionnel)</label>
                                            <textarea
                                                value={location.address}
                                                onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                                                rows="3"
                                                placeholder="Nom de la rue, numéro, étage, point de repère..."
                                            />
                                        </div>

                                        <div className="form-navigation">
                                            <button type="button" className="btn-prev" onClick={handlePrev}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="15 18 9 12 15 6" />
                                                </svg>
                                                Précédent
                                            </button>
                                            <button type="button" className="btn-next" onClick={handleNext}>
                                                Suivant
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="form-step">
                                        <h2>✅ Confirmation du signalement</h2>
                                        
                                        <div className="summary-card">
                                            <div className="summary-section">
                                                <h3>📞 Informations de contact</h3>
                                                <div className="summary-row">
                                                    <span>Numéro fixe:</span>
                                                    <strong>{formData.phoneNumber}</strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span>Code client:</span>
                                                    <strong>{formData.clientCode || "Non renseigné"}</strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span>Contact via:</span>
                                                    <strong>{formData.contactMethod === 'phone' ? '📞 Appel' : formData.contactMethod === 'whatsapp' ? '💬 WhatsApp' : '📱 SMS'}</strong>
                                                </div>
                                                {formData.availableTimes && (
                                                    <div className="summary-row">
                                                        <span>Disponibilité:</span>
                                                        <strong>{formData.availableTimes}</strong>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="summary-section">
                                                <h3>🔍 Problème</h3>
                                                <div className="summary-row">
                                                    <span>Type:</span>
                                                    <strong>{problemCategories[formData.problemType]?.title}</strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span>Sous-problème:</span>
                                                    <strong>{problemCategories[formData.problemType]?.subProblems.find(p => p.id === formData.subProblem)?.label}</strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span>Priorité:</span>
                                                    <strong className={`priority-${formData.priority}`}>
                                                        {formData.priority === 'haute' ? '🔴 Haute' : formData.priority === 'moyenne' ? '🟡 Moyenne' : '🟢 Basse'}
                                                    </strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span>Description:</span>
                                                    <p className="description-text">{formData.description}</p>
                                                </div>
                                            </div>

                                            <div className="summary-section">
                                                <h3>📍 Localisation</h3>
                                                <div className="summary-row">
                                                    <span>Wilaya:</span>
                                                    <strong>{location.wilaya || "Non spécifiée"}</strong>
                                                </div>
                                                {location.commune && (
                                                    <div className="summary-row">
                                                        <span>Commune:</span>
                                                        <strong>{location.commune}</strong>
                                                    </div>
                                                )}
                                                {location.address && (
                                                    <div className="summary-row">
                                                        <span>Adresse:</span>
                                                        <strong>{location.address}</strong>
                                                    </div>
                                                )}
                                                {location.lat && (
                                                    <div className="summary-row">
                                                        <span>Coordonnées GPS:</span>
                                                        <strong>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="form-navigation">
                                            <button type="button" className="btn-prev" onClick={handlePrev}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="15 18 9 12 15 6" />
                                                </svg>
                                                Précédent
                                            </button>
                                            <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="btn-spinner"></div>
                                                        Envoi en cours...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Envoyer le signalement</span>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="22" y1="2" x2="11" y2="13" />
                                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>

                            <div className="signal-footer">
                                <div className="footer-badges">
                                    <span className="badge">🔒 Sécurisé</span>
                                    <span className="badge">⚡ Rapide</span>
                                    <span className="badge">🇩🇿 Algérie Télécom</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserSignal;