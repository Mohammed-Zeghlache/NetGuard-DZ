import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        phoneNumber: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.email || !formData.phoneNumber) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Veuillez entrer une adresse email valide");
            return;
        }

        // Phone validation (Algerian phone numbers)
        const phoneRegex = /^(05|06|07)[0-9]{8}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            setError("Numéro de téléphone invalide. Format: 05XXXXXXXX, 06XXXXXXXX ou 07XXXXXXXX");
            return;
        }

        setIsLoading(true);

        // Simulate API call / authentication
        setTimeout(() => {
            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const existingUser = users.find(
                u => u.email === formData.email && u.phoneNumber === formData.phoneNumber
            );

            if (existingUser) {
                // Login successful
                const userData = {
                    id: existingUser.id,
                    fullName: existingUser.fullName,
                    email: existingUser.email,
                    phone: existingUser.phoneNumber,
                    createdAt: existingUser.createdAt
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                setIsLoading(false);
                navigate('/dashboard');
            } else {
                // User doesn't exist - create new account
                const newUser = {
                    id: Date.now(),
                    fullName: formData.email.split('@')[0], // Temporary name from email
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
                        message: "Bienvenue sur NetGuard DZ ! 🎉",
                        icon: "🎉",
                        read: false,
                        date: new Date().toISOString()
                    },
                    {
                        id: Date.now() + 1,
                        message: "Votre espace personnel est prêt. Vous pouvez maintenant créer des signalements.",
                        icon: "✅",
                        read: false,
                        date: new Date().toISOString()
                    }
                ]));
                localStorage.setItem(`speedtests_${newUser.id}`, JSON.stringify([]));
                
                setIsLoading(false);
                navigate('/dashboard');
            }
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
                            <h2>Connexion</h2>
                            <p>Connectez-vous à votre espace</p>
                        </div>

                        {error && (
                            <div className="login-error">
                                <span className="error-icon">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
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
                                    <input type="checkbox" />
                                    <span>Se souvenir de moi</span>
                                </label>
                                <a href="#" className="login-forgot">Mot de passe oublié ?</a>
                            </div>

                            <button type="submit" className="login-btn" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className="login-spinner"></span>
                                        Connexion en cours...
                                    </>
                                ) : (
                                    "Se connecter"
                                )}
                            </button>
                        </form>

                        <p className="login-redirect">
                            Pas encore de compte ? 
                             <a onClick={() => navigate("/signin")} style={{ cursor: "pointer" }} >S'inscrire</a>
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

export default Login;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../Styles/Login.css";
// import Algerie_telecom from "../images/Algerie_telecom.jpg";

// const Login = () => {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({
//         email: "",
//         phoneNumber: ""
//     });
//     const [error, setError] = useState("");
//     const [isLoading, setIsLoading] = useState(false);

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//         // Clear error when user starts typing
//         if (error) setError("");
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         // Validation
//         if (!formData.email || !formData.phoneNumber) {
//             setError("Veuillez remplir tous les champs");
//             return;
//         }

//         // Email validation
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             setError("Veuillez entrer une adresse email valide");
//             return;
//         }

//         // Phone validation (Algerian phone numbers)
//         const phoneRegex = /^(05|06|07)[0-9]{8}$/;
//         if (!phoneRegex.test(formData.phoneNumber)) {
//             setError("Numéro de téléphone invalide. Format: 05XXXXXXXX, 06XXXXXXXX ou 07XXXXXXXX");
//             return;
//         }

//         setIsLoading(true);
//         setError("");

//         try {
//             const response = await fetch('http://localhost:5000/api/users/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ 
//                     email: formData.email, 
//                     phoneNumber: formData.phoneNumber 
//                 })
//             });

//             const data = await response.json();
            
//             if (data.success) {
//                 // Store user data in localStorage
//                 localStorage.setItem('currentUser', JSON.stringify(data.user));
//                 localStorage.setItem('token', data.token); // Store token if provided
//                 setIsLoading(false);
//                 navigate('/dashboard');
//             } else {
//                 setError(data.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
//                 setIsLoading(false);
//             }
//         } catch (err) {
//             console.error("Login error:", err);
//             setError("Erreur de connexion au serveur. Veuillez réessayer.");
//             setIsLoading(false);
            
//             // Fallback to localStorage if backend is unavailable
//             fallbackLogin();
//         }
//     };

//     // Fallback function for when backend is unavailable
//     const fallbackLogin = () => {
//         // Simulate API call / authentication
//         setTimeout(() => {
//             // Check if user exists in localStorage
//             const users = JSON.parse(localStorage.getItem('users') || '[]');
//             const existingUser = users.find(
//                 u => u.email === formData.email && u.phoneNumber === formData.phoneNumber
//             );

//             if (existingUser) {
//                 // Login successful
//                 const userData = {
//                     id: existingUser.id,
//                     fullName: existingUser.fullName,
//                     email: existingUser.email,
//                     phone: existingUser.phoneNumber,
//                     createdAt: existingUser.createdAt
//                 };
//                 localStorage.setItem('currentUser', JSON.stringify(userData));
//                 setIsLoading(false);
//                 navigate('/dashboard');
//             } else {
//                 // User doesn't exist - create new account
//                 const newUser = {
//                     id: Date.now(),
//                     fullName: formData.email.split('@')[0], // Temporary name from email
//                     email: formData.email,
//                     phoneNumber: formData.phoneNumber,
//                     createdAt: new Date().toISOString()
//                 };
                
//                 const updatedUsers = [...users, newUser];
//                 localStorage.setItem('users', JSON.stringify(updatedUsers));
                
//                 const userData = {
//                     id: newUser.id,
//                     fullName: newUser.fullName,
//                     email: newUser.email,
//                     phone: newUser.phoneNumber,
//                     createdAt: newUser.createdAt
//                 };
//                 localStorage.setItem('currentUser', JSON.stringify(userData));
                
//                 // Initialize empty data for new user
//                 localStorage.setItem(`signalements_${newUser.id}`, JSON.stringify([]));
//                 localStorage.setItem(`notifications_${newUser.id}`, JSON.stringify([
//                     {
//                         id: Date.now(),
//                         message: "Bienvenue sur NetGuard DZ ! 🎉",
//                         icon: "🎉",
//                         read: false,
//                         date: new Date().toISOString()
//                     },
//                     {
//                         id: Date.now() + 1,
//                         message: "Votre espace personnel est prêt. Vous pouvez maintenant créer des signalements.",
//                         icon: "✅",
//                         read: false,
//                         date: new Date().toISOString()
//                     }
//                 ]));
//                 localStorage.setItem(`speedtests_${newUser.id}`, JSON.stringify([]));
                
//                 setIsLoading(false);
//                 navigate('/dashboard');
//             }
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
//                             <h2>Connexion</h2>
//                             <p>Connectez-vous à votre espace</p>
//                         </div>

//                         {error && (
//                             <div className="login-error">
//                                 <span className="error-icon">⚠️</span>
//                                 <span>{error}</span>
//                             </div>
//                         )}

//                         <form onSubmit={handleSubmit}>
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
//                                     <input type="checkbox" />
//                                     <span>Se souvenir de moi</span>
//                                 </label>
//                                 <a href="#" className="login-forgot">Mot de passe oublié ?</a>
//                             </div>

//                             <button type="submit" className="login-btn" disabled={isLoading}>
//                                 {isLoading ? (
//                                     <>
//                                         <span className="login-spinner"></span>
//                                         Connexion en cours...
//                                     </>
//                                 ) : (
//                                     "Se connecter"
//                                 )}
//                             </button>
//                         </form>

//                         <p className="login-redirect">
//                             Pas encore de compte ? 
//                             <a onClick={() => navigate("/signin")} style={{ cursor: "pointer" }}>S'inscrire</a>
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

// export default Login;