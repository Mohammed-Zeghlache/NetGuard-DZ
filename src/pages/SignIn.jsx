import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const Signin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        confirmPhone: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.fullName || !formData.email || !formData.phoneNumber) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        if (formData.fullName.length < 3) {
            setError("Le nom complet doit contenir au moins 3 caractères");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Veuillez entrer une adresse email valide");
            return;
        }

        const phoneRegex = /^(05|06|07)[0-9]{8}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            setError("Numéro de téléphone invalide. Format: 05XXXXXXXX, 06XXXXXXXX ou 07XXXXXXXX");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('https://netguard-dz-back.onrender.com/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    fullName: formData.fullName, 
                    email: formData.email, 
                    phoneNumber: formData.phoneNumber 
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Store user data in localStorage
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('token', data.token); // Store token if provided
                
                // Initialize empty data structures for the new user
                const userId = data.user.id;
                localStorage.setItem(`signalements_${userId}`, JSON.stringify([]));
                localStorage.setItem(`notifications_${userId}`, JSON.stringify([
                    {
                        id: Date.now(),
                        message: `Bienvenue ${formData.fullName} ! 🎉`,
                        icon: "🎉",
                        read: false,
                        date: new Date().toISOString()
                    },
                    {
                        id: Date.now() + 1,
                        message: "Votre compte a été créé avec succès. Vous pouvez maintenant créer des signalements.",
                        icon: "✅",
                        read: false,
                        date: new Date().toISOString()
                    },
                    {
                        id: Date.now() + 2,
                        message: "L'assistant IA est disponible pour vous aider 24/7",
                        icon: "🤖",
                        read: false,
                        date: new Date().toISOString()
                    }
                ]));
                localStorage.setItem(`speedtests_${userId}`, JSON.stringify([]));
                
                setIsLoading(false);
                navigate('/dashboard');
            } else {
                setError(data.message || "Erreur lors de l'inscription. Veuillez réessayer.");
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("Erreur de connexion au serveur. Veuillez réessayer.");
            setIsLoading(false);
            
            // Fallback to localStorage if backend is unavailable
            fallbackSignup();
        }
    };

    // Fallback function for when backend is unavailable
    const fallbackSignup = () => {
        // Check if user already exists in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(u => u.email === formData.email)) {
            setError("Un compte existe déjà avec cet email");
            setIsLoading(false);
            return;
        }
        
        if (users.some(u => u.phoneNumber === formData.phoneNumber)) {
            setError("Un compte existe déjà avec ce numéro de téléphone");
            setIsLoading(false);
            return;
        }

        setTimeout(() => {
            const newUser = {
                id: Date.now(),
                fullName: formData.fullName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                createdAt: new Date().toISOString()
            };
            
            const updatedUsers = [...users, newUser];
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            const userData = {
                id: newUser.id,
                fullName: newUser.fullName,
                email: newUser.email,
                phone: newUser.phoneNumber,
                createdAt: newUser.createdAt
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Initialize empty data for new user
            localStorage.setItem(`signalements_${newUser.id}`, JSON.stringify([]));
            localStorage.setItem(`notifications_${newUser.id}`, JSON.stringify([
                {
                    id: Date.now(),
                    message: `Bienvenue ${formData.fullName} ! 🎉`,
                    icon: "🎉",
                    read: false,
                    date: new Date().toISOString()
                },
                {
                    id: Date.now() + 1,
                    message: "Votre compte a été créé avec succès. Vous pouvez maintenant créer des signalements.",
                    icon: "✅",
                    read: false,
                    date: new Date().toISOString()
                },
                {
                    id: Date.now() + 2,
                    message: "L'assistant IA est disponible pour vous aider 24/7",
                    icon: "🤖",
                    read: false,
                    date: new Date().toISOString()
                }
            ]));
            localStorage.setItem(`speedtests_${newUser.id}`, JSON.stringify([]));
            
            setIsLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <img src={Algerie_telecom} alt="Algérie Télécom" className="login-logo" />
                        <div className="login-header-text">
                            <h1>Algérie Télécom</h1>
                            <p>اتصالات الجزائر</p>
                        </div>
                        <div className="login-status">
                            <span className="login-dot"></span>
                            <span>En ligne</span>
                        </div>
                    </div>

                    <div className="login-form-area">
                        <div className="login-form-header">
                            <h2>Inscription</h2>
                            <p>Créez votre espace personnel</p>
                        </div>

                        {error && (
                            <div className="login-error">
                                <span className="error-icon">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="login-input-group">
                                <label>Nom complet</label>
                                <div className="login-input-wrapper">
                                    <span className="login-icon">👤</span>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Votre nom et prénom"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="login-input-group">
                                <label>Adresse email</label>
                                <div className="login-input-wrapper">
                                    <span className="login-icon">📧</span>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="exemple@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="login-input-group">
                                <label>Numéro de téléphone</label>
                                <div className="login-input-wrapper">
                                    <span className="login-icon">📱</span>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        placeholder="05 XX XX XX XX"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="login-options">
                                <label className="login-checkbox">
                                    <input type="checkbox" required />
                                    <span>J'accepte les conditions d'utilisation</span>
                                </label>
                            </div>

                            <button type="submit" className="login-btn" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className="login-spinner"></span>
                                        Création du compte...
                                    </>
                                ) : (
                                    "S'inscrire"
                                )}
                            </button>
                        </form>

                        <p className="login-redirect">
                            Déjà un compte ?
                            <a onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>Se connecter</a>
                        </p>
                    
                    </div>

                    <div className="login-footer">
                        <div className="login-badges">
                            <span>🔒 Sécurisé</span>
                            <span>✓ Fiable</span>
                            <span>🧠 Intelligent</span>
                            <span>🇩🇿 Fait en Algérie</span>
                        </div>
                        <p>© 2026 NetGuard DZ</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;









// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../Styles/Login.css";
// import Algerie_telecom from "../images/Algerie_telecom.jpg";

// const Signin = () => {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({
//         fullName: "",
//         email: "",
//         phoneNumber: "",
//         confirmPhone: ""
//     });
//     const [error, setError] = useState("");
//     const [isLoading, setIsLoading] = useState(false);

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//         if (error) setError("");
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         // Validation
//         if (!formData.fullName || !formData.email || !formData.phoneNumber) {
//             setError("Veuillez remplir tous les champs");
//             return;
//         }

//         if (formData.fullName.length < 3) {
//             setError("Le nom complet doit contenir au moins 3 caractères");
//             return;
//         }

//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             setError("Veuillez entrer une adresse email valide");
//             return;
//         }

//         const phoneRegex = /^(05|06|07)[0-9]{8}$/;
//         if (!phoneRegex.test(formData.phoneNumber)) {
//             setError("Numéro de téléphone invalide. Format: 05XXXXXXXX, 06XXXXXXXX ou 07XXXXXXXX");
//             return;
//         }

//         setIsLoading(true);
//         setError("");

//         try {
//             const response = await fetch('http://localhost:5000/api/users/signup', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ 
//                     fullName: formData.fullName, 
//                     email: formData.email, 
//                     phoneNumber: formData.phoneNumber 
//                 })
//             });

//             const data = await response.json();
            
//             if (data.success) {
//                 // Store user data in localStorage
//                 localStorage.setItem('currentUser', JSON.stringify(data.user));
//                 if (data.token) {
//                     localStorage.setItem('token', data.token);
//                 }
                
//                 // Initialize empty data structures for the new user
//                 const userId = data.user.id;
//                 localStorage.setItem(`signalements_${userId}`, JSON.stringify([]));
//                 localStorage.setItem(`notifications_${userId}`, JSON.stringify([
//                     {
//                         id: Date.now(),
//                         message: `Bienvenue ${formData.fullName} ! 🎉`,
//                         icon: "🎉",
//                         read: false,
//                         date: new Date().toISOString()
//                     },
//                     {
//                         id: Date.now() + 1,
//                         message: "Votre compte a été créé avec succès. Vous pouvez maintenant créer des signalements.",
//                         icon: "✅",
//                         read: false,
//                         date: new Date().toISOString()
//                     },
//                     {
//                         id: Date.now() + 2,
//                         message: "L'assistant IA est disponible pour vous aider 24/7",
//                         icon: "🤖",
//                         read: false,
//                         date: new Date().toISOString()
//                     }
//                 ]));
//                 localStorage.setItem(`speedtests_${userId}`, JSON.stringify([]));
                
//                 setIsLoading(false);
//                 navigate('/dashboard');
//             } else {
//                 setError(data.message || "Erreur lors de l'inscription. Veuillez réessayer.");
//                 setIsLoading(false);
//             }
//         } catch (err) {
//             console.error("Signup error:", err);
//             setError("Erreur de connexion au serveur. Veuillez réessayer.");
//             setIsLoading(false);
            
//             // Fallback to localStorage if backend is unavailable
//             fallbackSignup();
//         }
//     };

//     // Fallback function for when backend is unavailable
//     const fallbackSignup = () => {
//         // Check if user already exists in localStorage
//         const users = JSON.parse(localStorage.getItem('users') || '[]');
        
//         if (users.some(u => u.email === formData.email)) {
//             setError("Un compte existe déjà avec cet email");
//             setIsLoading(false);
//             return;
//         }
        
//         if (users.some(u => u.phoneNumber === formData.phoneNumber)) {
//             setError("Un compte existe déjà avec ce numéro de téléphone");
//             setIsLoading(false);
//             return;
//         }

//         setTimeout(() => {
//             const newUser = {
//                 id: Date.now(),
//                 fullName: formData.fullName,
//                 email: formData.email,
//                 phoneNumber: formData.phoneNumber,
//                 createdAt: new Date().toISOString()
//             };
            
//             const updatedUsers = [...users, newUser];
//             localStorage.setItem('users', JSON.stringify(updatedUsers));
            
//             const userData = {
//                 id: newUser.id,
//                 fullName: newUser.fullName,
//                 email: newUser.email,
//                 phone: newUser.phoneNumber,
//                 createdAt: newUser.createdAt
//             };
//             localStorage.setItem('currentUser', JSON.stringify(userData));
            
//             // Initialize empty data for new user
//             localStorage.setItem(`signalements_${newUser.id}`, JSON.stringify([]));
//             localStorage.setItem(`notifications_${newUser.id}`, JSON.stringify([
//                 {
//                     id: Date.now(),
//                     message: `Bienvenue ${formData.fullName} ! 🎉`,
//                     icon: "🎉",
//                     read: false,
//                     date: new Date().toISOString()
//                 },
//                 {
//                     id: Date.now() + 1,
//                     message: "Votre compte a été créé avec succès. Vous pouvez maintenant créer des signalements.",
//                     icon: "✅",
//                     read: false,
//                     date: new Date().toISOString()
//                 },
//                 {
//                     id: Date.now() + 2,
//                     message: "L'assistant IA est disponible pour vous aider 24/7",
//                     icon: "🤖",
//                     read: false,
//                     date: new Date().toISOString()
//                 }
//             ]));
//             localStorage.setItem(`speedtests_${newUser.id}`, JSON.stringify([]));
            
//             setIsLoading(false);
//             navigate('/dashboard');
//         }, 1500);
//     };

//     return (
//         <div className="login-wrapper">
//             <div className="login-container">
//                 <div className="login-card">
//                     <div className="login-header">
//                         <img src={Algerie_telecom} alt="Algérie Télécom" className="login-logo" />
//                         <div className="login-header-text">
//                             <h1>Algérie Télécom</h1>
//                             <p>اتصالات الجزائر</p>
//                         </div>
//                         <div className="login-status">
//                             <span className="login-dot"></span>
//                             <span>En ligne</span>
//                         </div>
//                     </div>

//                     <div className="login-form-area">
//                         <div className="login-form-header">
//                             <h2>Inscription</h2>
//                             <p>Créez votre espace personnel</p>
//                         </div>

//                         {error && (
//                             <div className="login-error">
//                                 <span className="error-icon">⚠️</span>
//                                 <span>{error}</span>
//                             </div>
//                         )}

//                         <form onSubmit={handleSubmit}>
//                             <div className="login-input-group">
//                                 <label>Nom complet</label>
//                                 <div className="login-input-wrapper">
//                                     <span className="login-icon">👤</span>
//                                     <input
//                                         type="text"
//                                         name="fullName"
//                                         placeholder="Votre nom et prénom"
//                                         value={formData.fullName}
//                                         onChange={handleChange}
//                                         required
//                                         disabled={isLoading}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="login-input-group">
//                                 <label>Adresse email</label>
//                                 <div className="login-input-wrapper">
//                                     <span className="login-icon">📧</span>
//                                     <input
//                                         type="email"
//                                         name="email"
//                                         placeholder="exemple@email.com"
//                                         value={formData.email}
//                                         onChange={handleChange}
//                                         required
//                                         disabled={isLoading}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="login-input-group">
//                                 <label>Numéro de téléphone</label>
//                                 <div className="login-input-wrapper">
//                                     <span className="login-icon">📱</span>
//                                     <input
//                                         type="tel"
//                                         name="phoneNumber"
//                                         placeholder="05 XX XX XX XX"
//                                         value={formData.phoneNumber}
//                                         onChange={handleChange}
//                                         required
//                                         disabled={isLoading}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="login-options">
//                                 <label className="login-checkbox">
//                                     <input type="checkbox" required />
//                                     <span>J'accepte les conditions d'utilisation</span>
//                                 </label>
//                             </div>

//                             <button type="submit" className="login-btn" disabled={isLoading}>
//                                 {isLoading ? (
//                                     <>
//                                         <span className="login-spinner"></span>
//                                         Création du compte...
//                                     </>
//                                 ) : (
//                                     "S'inscrire"
//                                 )}
//                             </button>
//                         </form>

//                         <p className="login-redirect">
//                             Déjà un compte ?
//                             <a onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>Se connecter</a>
//                         </p>
                    
//                     </div>

//                     <div className="login-footer">
//                         <div className="login-badges">
//                             <span>🔒 Sécurisé</span>
//                             <span>✓ Fiable</span>
//                             <span>🧠 Intelligent</span>
//                             <span>🇩🇿 Fait en Algérie</span>
//                         </div>
//                         <p>© 2026 NetGuard DZ</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Signin;





