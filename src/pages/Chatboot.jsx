import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Styles/UserDashboard.css";
import "../Styles/Chatboot.css";
import Algerie_telecom from "../images/Algerie_telecom.jpg";

const Chatboot = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // ==================== CHAT STATE MANAGEMENT ====================
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            text: "🌟 **Bienvenue sur NetGuard DZ Assistant**\n\nJe suis votre assistant IA dédié au support technique Algérie Télécom.\n\n🔧 **Capacités avancées :**\n• Diagnostic intelligent en temps réel\n• Base de connaissance enrichie\n• Gestion complète des tickets\n• Suivi des interventions\n• Alertes réseau par région\n\n💬 **Comment puis-je vous aider aujourd'hui ?**",
            sender: "bot",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "greeting"
        }
    ]);
    const [userInputMessage, setUserInputMessage] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [showChipSuggestions, setShowChipSuggestions] = useState(true);
    const [isVoiceSupported, setIsVoiceSupported] = useState(false);
    const [isVoiceListening, setIsVoiceListening] = useState(false);
    
    // ==================== AI STATE MANAGEMENT ====================
    const [isUsingAI, setIsUsingAI] = useState(false); // Changé à false par défaut pour éviter les erreurs
    const [aiAvailable, setAIAvailable] = useState(false);
    const [aiError, setAiError] = useState(false);
    
    const [networkStatusAlerts, setNetworkStatusAlerts] = useState([
        { region: "Alger", status: "normal", message: "Réseau optimal" },
        { region: "Oran", status: "normal", message: "Réseau optimal" },
        { region: "Constantine", status: "warning", message: "Ralentissements temporaires" },
        { region: "Annaba", status: "normal", message: "Réseau optimal" },
        { region: "Tizi Ouzou", status: "critical", message: "Intervention en cours" },
    ]);
    
    const [conversationFlowState, setConversationFlowState] = useState({
        step: "initial",
        userInfo: {
            name: "",
            phone: "",
            location: "",
            problemType: "",
            problemDescription: ""
        },
        currentDiagnosis: null
    });
    
    const chatMessagesEndRef = useRef(null);
    const chatInputRef = useRef(null);
    const speechRecognitionRef = useRef(null);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(currentUser));
        checkAIAvailability();
    }, [navigate]);

    // Check if AI API is available
    const checkAIAvailability = async () => {
        try {
            console.log("🔍 Checking API health...");
            const response = await fetch('/api/health');
            if (response.ok) {
                const data = await response.json();
                console.log("📡 API Health:", data);
                console.log("🤖 aiAvailable:", data.aiAvailable);
                setAIAvailable(data.aiAvailable === true);
                
                if (data.aiAvailable === true) {
                    console.log("✅ AI is AVAILABLE!");
                    setIsUsingAI(true);
                    addBotResponse("🧠 **Mode IA activé !**\n\nJe suis connecté à l'assistant IA avancé. Posez-moi vos questions techniques !");
                } else {
                    console.log("⚠️ AI not available - using local mode");
                    setIsUsingAI(false);
                    addBotResponse("📡 **Mode local activé**\n\nL'assistant IA n'est pas disponible. Je fonctionne avec ma base de connaissances intégrée pour vous aider efficacement.");
                }
            } else {
                console.log("❌ Health check failed, using local mode");
                setAIAvailable(false);
                setIsUsingAI(false);
            }
        } catch (error) {
            console.error('API not available, using local mode:', error);
            setAIAvailable(false);
            setIsUsingAI(false);
        }
    };

    // Auto-scroll function
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            if (chatMessagesEndRef.current) {
                chatMessagesEndRef.current.scrollIntoView({ 
                    behavior: "smooth", 
                    block: "end" 
                });
            }
        }, 100);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, isBotTyping, scrollToBottom]);

    useEffect(() => {
        chatInputRef.current?.focus();
    }, []);

    // Voice recognition setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsVoiceSupported(true);
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            speechRecognitionRef.current = new SpeechRecognition();
            speechRecognitionRef.current.continuous = false;
            speechRecognitionRef.current.interimResults = false;
            speechRecognitionRef.current.lang = 'fr-FR';
            
            speechRecognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setUserInputMessage(transcript);
                setIsVoiceListening(false);
                setTimeout(() => sendUserMessage(transcript), 100);
            };
            
            speechRecognitionRef.current.onerror = () => {
                setIsVoiceListening(false);
                addBotResponse("🎤 Je n'ai pas pu comprendre. Pouvez-vous réessayer ?");
                scrollToBottom();
            };
        }
    }, [scrollToBottom]);

    const addBotResponse = useCallback((text, type = "message") => {
        const newMessage = {
            id: Date.now(),
            text: text,
            sender: "bot",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: type
        };
        setChatMessages(prev => [...prev, newMessage]);
        scrollToBottom();
        return newMessage;
    }, [scrollToBottom]);

    // ==================== AI RESPONSE (OpenAI/Gemini) ====================
    const getAIResponse = useCallback(async (userMessage) => {
        // Vérification stricte des conditions
        if (!isUsingAI || !aiAvailable) {
            console.log("❌ AI not used - isUsingAI:", isUsingAI, "aiAvailable:", aiAvailable);
            return null;
        }
        
        try {
            console.log("🚀 Calling AI API for:", userMessage.substring(0, 50));
            
            const response = await fetch('https://netguard-dz-back.onrender.com/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: chatMessages.slice(-10).map(msg => ({
                        sender: msg.sender,
                        text: msg.text
                    })),
                    userInfo: {
                        name: user?.fullName || user?.name || "Client",
                        location: user?.wilaya || user?.location || "Algérie"
                    }
                })
            });
            
            if (!response.ok) {
                console.error("HTTP Error:", response.status);
                return null;
            }
            
            const data = await response.json();
            console.log("📡 API Response success:", data.success);
            
            if (data.success === true && data.message) {
                console.log("✅ AI Response received!");
                setAiError(false);
                return { text: data.message, type: "ai_response" };
            } else if (data.fallback === true || data.success === false) {
                console.log("⚠️ AI returned fallback response");
                return null;
            } else {
                console.log("❌ AI Response error:", data.error);
                return null;
            }
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }, [isUsingAI, aiAvailable, chatMessages, user]);

    // Toggle AI mode
    const toggleAIMode = () => {
        if (!aiAvailable) {
            addBotResponse("⚠️ **Mode IA non disponible**\n\nL'assistant IA avancé n'est pas disponible pour le moment. Je fonctionne en mode local.");
            return;
        }
        
        const newMode = !isUsingAI;
        setIsUsingAI(newMode);
        addBotResponse(newMode ? 
            "🧠 **Mode IA activé**\n\nJe peux maintenant utiliser mes capacités avancées pour mieux vous aider ! Posez vos questions techniques." :
            "📡 **Mode local activé**\n\nJe fonctionne avec ma base de connaissances intégrée. Les fonctionnalités avancées sont désactivées."
        );
    };

    // ==================== TICKET FUNCTIONS ====================
    const generateUniqueTicketNumber = useCallback(() => {
        const prefix = "TKT";
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${year}${month}${day}-${random}`;
    }, []);

    const saveTicketToAdmin = useCallback((ticketData) => {
        const existingTickets = JSON.parse(localStorage.getItem('admin_tickets') || '[]');
        existingTickets.unshift(ticketData);
        localStorage.setItem('admin_tickets', JSON.stringify(existingTickets));
        
        const adminNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        adminNotifications.unshift({
            id: Date.now(),
            message: `🎫 Nouveau ticket #${ticketData.ticketNumber} de ${ticketData.fullName}`,
            type: "new_ticket",
            ticketId: ticketData.id,
            priority: ticketData.priority,
            read: false,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications.slice(0, 100)));
        
        if (ticketData.priority === "high") {
            const existingPannes = JSON.parse(localStorage.getItem('realtime_pannes') || '[]');
            existingPannes.unshift({
                id: Date.now(),
                title: `Panne signalée - ${ticketData.location}`,
                location: ticketData.location,
                type: ticketData.problemType,
                severity: "critique",
                ticketNumber: ticketData.ticketNumber,
                customerName: ticketData.fullName,
                timestamp: new Date().toISOString(),
                status: 'active'
            });
            localStorage.setItem('realtime_pannes', JSON.stringify(existingPannes.slice(0, 20)));
        }
        
        return ticketData;
    }, []);

    const createSupportTicket = useCallback(async (problemType, userInfo, problemDescription) => {
        const priority = (problemType === "internetDown" || problemType === "adslProblem" || problemType === "fibreOptique") ? "high" : "medium";
        
        let displayProblemType = "Non spécifié";
        if (problemType === "internetDown") displayProblemType = "Panne Internet";
        else if (problemType === "slowInternet") displayProblemType = "Connexion lente";
        else if (problemType === "adslProblem") displayProblemType = "Problème ADSL";
        else if (problemType === "wifiIssue") displayProblemType = "Problème WiFi";
        else if (problemType === "fibreOptique") displayProblemType = "Problème Fibre Optique";
        
        const ticketData = {
            id: Date.now(),
            ticketNumber: generateUniqueTicketNumber(),
            fullName: userInfo.name,
            phone: userInfo.phone,
            location: userInfo.location,
            problemType: displayProblemType,
            problemDescription: problemDescription,
            priority: priority,
            status: "nouveau",
            createdAt: new Date().toISOString(),
            source: "chatbot",
            updates: [{ message: `Ticket créé via chatbot par ${userInfo.name}`, timestamp: new Date().toISOString(), author: "Chatbot IA" }]
        };
        
        saveTicketToAdmin(ticketData);
        return ticketData.ticketNumber;
    }, [generateUniqueTicketNumber, saveTicketToAdmin]);

    // ==================== KNOWLEDGE BASE ====================
    const supportKnowledgeBase = useMemo(() => ({
        internetDown: {
            keywords: ["pas internet", "plus internet", "coupé", "panne", "ne marche pas", "internet down", "connexion perdue", "déconnecté"],
            solution: "🔴 **DIAGNOSTIC PANNE INTERNET**\n\n**📊 Vérification des voyants :**\n• Power (Vert) → ✅ Alimentation OK\n• DSL/ADSL (Vert fixe) → ✅ Ligne synchronisée\n• Internet (Vert) → ✅ Connexion active\n\n**🔄 Redémarrage complet :**\n1. Débranchez le modem 60 secondes\n2. Rebranchez et attendez 3 minutes\n3. Redémarrez votre appareil\n\n✅ **Problème résolu ?** Sinon, je peux créer un ticket."
        },
        slowInternet: {
            keywords: ["lent", "vitesse", "débit", "rame", "buffer", "charge lentement", "streaming"],
            solution: "⚡ **OPTIMISATION CONNEXION LENTE**\n\n**Solutions :**\n1. Redémarrez votre modem\n2. Limitez les appareils connectés\n3. Utilisez la bande 5GHz\n4. Éloignez le modem des murs\n\n❓ **Toujours lent ?** Je peux créer un ticket."
        },
        adslProblem: {
            keywords: ["adsl", "dsl", "synchro", "clignote", "perte synchro"],
            solution: "📡 **RÉSOLUTION PROBLÈME ADSL**\n\n**Vérifications :**\n• Débranchez TOUS les téléphones\n• Testez sur la prise d'arrivée\n• Remplacez le filtre ADSL\n\n**📞 Besoin d'un technicien ?** Je crée un ticket."
        },
        wifiIssue: {
            keywords: ["wifi", "sans fil", "connecte pas", "mot de passe", "wifi invisible"],
            solution: "📶 **GUIDE PROBLÈMES WiFi**\n\n**Solutions :**\n1. Vérifiez le mot de passe\n2. Redémarrez le routeur\n3. Oubliez puis reconnectez-vous\n4. Changez de canal (1,6,11)"
        },
        fibreOptique: {
            keywords: ["fibre", "ftth", "gpon", "ont", "fibre optique"],
            solution: "🔮 **ASSISTANCE FIBRE OPTIQUE**\n\n**Voyants ONT :**\n• 💚 PON → Signal OK\n• 💛 LOS → Perte de signal (urgence)\n\n**Actions :**\n• Vérifiez que le câble n'est pas plié\n• Ne touchez pas l'embout fibre"
        }
    }), []);

    const detectUserProblem = useCallback((userInput) => {
        const input = userInput.toLowerCase().trim();
        let bestMatch = null;
        let bestScore = 0;
        
        for (const [key, value] of Object.entries(supportKnowledgeBase)) {
            let score = 0;
            for (const keyword of value.keywords) {
                if (input.includes(keyword)) {
                    score += keyword.length;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = { type: key, solution: value.solution };
            }
        }
        return bestMatch;
    }, [supportKnowledgeBase]);

    const getRegionNetworkStatus = useCallback((region) => {
        const found = networkStatusAlerts.find(a => a.region.toLowerCase() === region.toLowerCase());
        return found || { status: "unknown", message: "Information non disponible" };
    }, [networkStatusAlerts]);

    // ==================== RESPONSE GENERATION ====================
    const generateResponse = useCallback(async (userInput) => {
        const input = userInput.toLowerCase().trim();
        
        // Gestion des commandes spéciales (toujours prioritaires)
        if (input.startsWith("/")) {
            const command = input.slice(1).split(" ")[0];
            if (command === "reset") {
                setConversationFlowState({
                    step: "initial",
                    userInfo: { name: "", phone: "", location: "", problemType: "", problemDescription: "" },
                    currentDiagnosis: null
                });
                return { text: "🔄 **Conversation réinitialisée**\n\nComment puis-je vous aider ?", type: "reset" };
            }
            if (command === "ai") {
                toggleAIMode();
                return { text: isUsingAI ? "📡 Mode local activé" : "🧠 Mode IA activé", type: "info" };
            }
            return { text: "📋 **Commandes :**\n• `/reset` - Nouvelle conversation\n• `/ai` - Activer/désactiver l'IA", type: "commands" };
        }
        
        // Essayer l'IA si disponible
        if (isUsingAI && aiAvailable) {
            console.log("🎯 Trying AI response for:", userInput);
            const aiResponse = await getAIResponse(userInput);
            if (aiResponse && aiResponse.text) {
                console.log("✅ Returning AI response");
                return aiResponse;
            }
            console.log("⚠️ AI returned null, falling back to local");
        }
        
        // Fallback to local response
        console.log("📚 Using local response for:", userInput);
        const detectedProblem = detectUserProblem(userInput);
        
        switch (conversationFlowState.step) {
            case "initial":
                if (detectedProblem) {
                    setConversationFlowState(prev => ({
                        ...prev,
                        step: "diagnosing",
                        currentDiagnosis: detectedProblem.type
                    }));
                    return {
                        text: detectedProblem.solution + "\n\n❓ **Ce guide vous a-t-il aidé ?**\n• 'Oui' - Problème résolu\n• 'Non' - Créer un ticket",
                        type: "solution"
                    };
                }
                
                if (input.includes("ticket") || input.includes("signaler") || input.includes("créer un ticket") || input.includes("intervention")) {
                    setConversationFlowState(prev => ({ ...prev, step: "collecting_name" }));
                    return {
                        text: "📋 **Création d'un ticket de support**\n\n**Quel est votre nom complet ?**",
                        type: "form"
                    };
                }
                
                if (input.includes("état") || input.includes("réseau") || input.includes("region")) {
                    let region = input.replace(/état|réseau|region|de|la|du/g, '').trim();
                    if (region) {
                        const status = getRegionNetworkStatus(region);
                        const icon = status.status === "normal" ? "🟢" : status.status === "warning" ? "🟡" : "🔴";
                        return {
                            text: `🌍 **État du réseau - ${region}**\n\n${icon} Statut : ${status.status === "normal" ? "Normal" : status.status === "warning" ? "Attention" : "Panne critique"}\n📝 ${status.message}`,
                            type: "status"
                        };
                    }
                    let list = "🌍 **État du réseau :**\n\n";
                    networkStatusAlerts.forEach(a => {
                        const icon = a.status === "normal" ? "🟢" : a.status === "warning" ? "🟡" : "🔴";
                        list += `${icon} **${a.region}** : ${a.message}\n`;
                    });
                    return { text: list, type: "status" };
                }
                
                if (input.match(/^(bonjour|salut|coucou|hello)$/i)) {
                    return {
                        text: "🌟 **Bonjour !**\n\nQue puis-je faire ?\n• 🔌 Diagnostiquer une panne\n• 🎫 Créer un ticket\n• 🌍 Vérifier l'état réseau\n\n💡 Tapez `/ai` pour activer/désactiver l'IA",
                        type: "menu"
                    };
                }
                
                return {
                    text: "🤖 **Comment puis-je vous aider ?**\n\nExemples :\n• \"Pas internet\"\n• \"Connexion lente\"\n• \"Je veux créer un ticket\"\n• \"État réseau Alger\"\n\n💡 Tapez `/ai` pour activer/désactiver l'IA",
                    type: "menu"
                };
                
            case "collecting_name":
                if (input.length < 2) {
                    return { text: "⚠️ Nom invalide (minimum 2 caractères) :", type: "error" };
                }
                setConversationFlowState(prev => ({
                    ...prev,
                    step: "collecting_phone",
                    userInfo: { ...prev.userInfo, name: userInput }
                }));
                return {
                    text: `✅ Merci ${userInput} !\n\n**📱 Votre numéro de téléphone :**\n(Format: 05XXXXXXXX)`,
                    type: "form"
                };
                
            case "collecting_phone":
                const phoneRegex = /^(05|06|07)[0-9]{8}$/;
                if (phoneRegex.test(userInput.replace(/\s/g, ''))) {
                    setConversationFlowState(prev => ({
                        ...prev,
                        step: "collecting_location",
                        userInfo: { ...prev.userInfo, phone: userInput.replace(/\s/g, '') }
                    }));
                    return {
                        text: `📞 Téléphone enregistré\n\n**📍 Votre localisation :**\n(Wilaya, Commune)`,
                        type: "form"
                    };
                }
                return {
                    text: "⚠️ **Numéro invalide**\nFormat: 05XXXXXXXX (10 chiffres)",
                    type: "error"
                };
                
            case "collecting_location":
                if (input.length < 3) {
                    return { text: "⚠️ Localisation invalide (minimum 3 caractères) :", type: "error" };
                }
                setConversationFlowState(prev => ({
                    ...prev,
                    step: "collecting_problem_description",
                    userInfo: { ...prev.userInfo, location: userInput }
                }));
                return {
                    text: `📍 Localisation: ${userInput}\n\n**📝 Décrivez votre problème :**\n• Depuis quand ?\n• À quelle fréquence ?`,
                    type: "form"
                };
                
            case "collecting_problem_description":
                if (input.length < 10) {
                    return { text: "⚠️ Description trop courte (minimum 10 caractères) :", type: "error" };
                }
                
                const problemType = conversationFlowState.currentDiagnosis || "Non spécifié";
                
                setConversationFlowState(prev => ({
                    ...prev,
                    step: "confirming_ticket",
                    userInfo: { 
                        ...prev.userInfo, 
                        problemDescription: userInput,
                        problemType: problemType
                    }
                }));
                
                return {
                    text: `📋 **Récapitulatif :**\n\n• **Nom:** ${conversationFlowState.userInfo.name}\n• **Téléphone:** ${conversationFlowState.userInfo.phone}\n• **Localisation:** ${conversationFlowState.userInfo.location}\n• **Problème:** ${problemType}\n• **Description:** ${userInput.substring(0, 150)}...\n\n**Confirmez-vous la création du ticket ?** (Oui/Non)`,
                    type: "confirmation"
                };
                
            case "confirming_ticket":
                if (input.includes("oui") || input.includes("yes") || input.includes("ok") || input.includes("valide") || input.includes("confirme")) {
                    const ticketNum = await createSupportTicket(
                        conversationFlowState.currentDiagnosis,
                        conversationFlowState.userInfo,
                        conversationFlowState.userInfo.problemDescription
                    );
                    
                    setConversationFlowState(prev => ({
                        ...prev,
                        step: "ticket_created",
                        ticketCreated: true,
                        ticketNumber: ticketNum
                    }));
                    
                    const priority = conversationFlowState.currentDiagnosis === "internetDown" || conversationFlowState.currentDiagnosis === "adslProblem" ? "HAUTE" : "NORMALE";
                    
                    return {
                        text: `✅ **TICKET CRÉÉ AVEC SUCCÈS !**\n\n**📋 Détails du ticket :**\n• Numéro : **${ticketNum}**\n• Nom : ${conversationFlowState.userInfo.name}\n• Téléphone : ${conversationFlowState.userInfo.phone}\n• Localisation : ${conversationFlowState.userInfo.location}\n• Priorité : ${priority}\n• Date : ${new Date().toLocaleDateString('fr-FR')}\n\n**⏱️ Délais d'intervention :**\n• ${priority === "HAUTE" ? "24-48h" : "48-72h"}\n\n**❓ Besoin d'autre chose ?**`,
                        type: "ticket"
                    };
                } else if (input.includes("non")) {
                    setConversationFlowState({
                        step: "initial",
                        userInfo: { name: "", phone: "", location: "", problemType: "", problemDescription: "" },
                        currentDiagnosis: null
                    });
                    return {
                        text: "🔄 **Ticket annulé**\n\nComment puis-je vous aider autrement ?",
                        type: "reset"
                    };
                }
                return { text: "❓ Confirmez-vous la création ? (Oui/Non)", type: "question" };
                
            case "diagnosing":
                if (input.includes("oui") || input.includes("merci") || input.includes("résolu")) {
                    setConversationFlowState(prev => ({ ...prev, step: "initial" }));
                    return {
                        text: "🎉 **Excellent !** N'hésitez pas si vous avez d'autres questions.",
                        type: "feedback"
                    };
                } else if (input.includes("non")) {
                    setConversationFlowState(prev => ({ ...prev, step: "collecting_name" }));
                    return {
                        text: "📝 **Créons un ticket pour vous aider.**\n\n**Quel est votre nom ?**",
                        type: "form"
                    };
                }
                return {
                    text: "❓ Le guide vous a-t-il aidé ? (Oui/Non)",
                    type: "question"
                };
                
            case "ticket_created":
                if (input.includes("oui") || input.includes("autre")) {
                    setConversationFlowState({
                        step: "initial",
                        userInfo: { name: "", phone: "", location: "", problemType: "", problemDescription: "" },
                        currentDiagnosis: null
                    });
                    return {
                        text: "✨ **Que puis-je faire d'autre ?**\n\n• Diagnostiquer une panne\n• Vérifier l'état réseau\n• Autre demande",
                        type: "menu"
                    };
                }
                return {
                    text: "🎯 **Merci !** Service client: 1055. À bientôt !",
                    type: "goodbye"
                };
                
            default:
                return {
                    text: "🤝 **Comment puis-je vous aider ?**\n\nDécrivez votre problème.",
                    type: "help"
                };
        }
    }, [conversationFlowState, detectUserProblem, getRegionNetworkStatus, networkStatusAlerts, createSupportTicket, isUsingAI, aiAvailable, getAIResponse]);

    const sendUserMessage = useCallback(async (textToSend = userInputMessage) => {
        if (!textToSend.trim()) return;

        const userMsgText = textToSend;

        setChatMessages(prev => [...prev, {
            id: Date.now(),
            text: userMsgText,
            sender: "user",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        setUserInputMessage("");
        setShowChipSuggestions(false);
        setIsBotTyping(true);

        setTimeout(() => scrollToBottom(), 50);

        try {
            const response = await generateResponse(userMsgText);
            
            setChatMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: response.text,
                sender: "bot",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: response.type
            }]);
        } catch (error) {
            console.error("Error generating response:", error);
            setChatMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "❌ Désolé, une erreur s'est produite. Veuillez réessayer.",
                sender: "bot",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: "error"
            }]);
        }
        
        setIsBotTyping(false);
        setShowChipSuggestions(true);
        setTimeout(() => scrollToBottom(), 100);
        
    }, [userInputMessage, generateResponse, scrollToBottom]);

    const handleVoiceCommand = useCallback(() => {
        if (!speechRecognitionRef.current) return;
        
        if (isVoiceListening) {
            speechRecognitionRef.current.stop();
            setIsVoiceListening(false);
        } else {
            try {
                speechRecognitionRef.current.start();
                setIsVoiceListening(true);
            } catch (error) {
                addBotResponse("🎤 Reconnaissance vocale non disponible.");
            }
        }
    }, [isVoiceListening, addBotResponse]);

    const handleChipAction = useCallback((action) => {
        sendUserMessage(action);
    }, [sendUserMessage]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const menuItems = [
        { path: "/dashboard", icon: "🏠", label: "Tableau de bord", exact: true },
        { path: "/dashboard/signalements", icon: "📋", label: "Mes Signalements" },
        { path: "/dashboard/notifications", icon: "🔔", label: "Notifications" },
        { path: "/dashboard/speedtests", icon: "⚡", label: "Tests de débit" },
        { path: "/dashboard/assistant", icon: "🤖", label: "Assistant IA", active: true },
        { path: "/dashboard/profile", icon: "👤", label: "Mon Profil" },
        { path: "/dashboard/settings", icon: "⚙️", label: "Paramètres" },
    ];

    const suggestionChips = [
        { icon: "🔌", text: "Pas internet", action: "pas internet" },
        { icon: "⚡", text: "Connexion lente", action: "internet lent" },
        { icon: "🎫", text: "Créer ticket", action: "je veux créer un ticket" },
        { icon: "🌍", text: "État réseau", action: "état réseau Alger" },
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
                    <div className="chat-main-container">
                        <div className="chat-bg-animation">
                            <div className="bg-glow-ball glow-ball-1"></div>
                            <div className="bg-glow-ball glow-ball-2"></div>
                            <div className="bg-glow-ball glow-ball-3"></div>
                        </div>

                        <div className="chat-main-card">
                            <div className="chat-header-section">
                                <div className="header-top-glow"></div>
                                <div className="header-main-content">
                                    <div className="brand-logo-area">
                                        <div className="logo-animation-wrapper">
                                            <img src={Algerie_telecom} alt="Algérie Télécom" className="brand-logo-img" />
                                            <div className="logo-pulse-ring"></div>
                                        </div>
                                        <div className="brand-text-info">
                                            <h1>NetGuard DZ <span className="ai-label">AI</span></h1>
                                            <p>Assistant Intelligent Support Technique</p>
                                        </div>
                                    </div>
                                    <div className="status-bar-area">
                                        <div className="online-status-indicator">
                                            <span className="status-green-dot"></span>
                                            <span>En ligne</span>
                                        </div>
                                        {/* AI Toggle Button */}
                                        <button 
                                            className={`ai-toggle-btn ${isUsingAI && aiAvailable ? 'ai-active' : ''}`}
                                            onClick={toggleAIMode}
                                            title={isUsingAI && aiAvailable ? "Mode IA actif - Désactiver" : "Mode local - Activer l'IA"}
                                            style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: (isUsingAI && aiAvailable) ? 'linear-gradient(135deg, #0ea5e9, #0369a1)' : 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            🧠
                                        </button>
                                        {isVoiceSupported && (
                                            <button 
                                                className={`voice-input-btn ${isVoiceListening ? 'active-voice' : ''}`}
                                                onClick={handleVoiceCommand}
                                                title="Commande vocale"
                                            >
                                                🎤
                                            </button>
                                        )}
                                        <button 
                                            className="reset-chat-btn"
                                            onClick={() => sendUserMessage("/reset")}
                                            title="Nouvelle conversation"
                                        >
                                            🔄
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="chat-messages-panel" ref={messagesContainerRef}>
                                <div className="messages-list-container">
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className={`message-row ${msg.sender}`}>
                                            <div className={`message-balloon ${msg.sender} ${msg.type || ""}`}>
                                                {msg.sender === "bot" && (
                                                    <div className="bot-profile-avatar">
                                                        <span>🤖</span>
                                                    </div>
                                                )}
                                                <div className="message-balloon-content">
                                                    <div className="message-text-content">
                                                        {msg.text.split('\n').map((line, i) => {
                                                            if (line.trim().startsWith('•')) {
                                                                return <span key={i} className="bullet-point-item">{line}</span>;
                                                            }
                                                            if (line.includes('**') && line.match(/\*\*.+\*\*/)) {
                                                                const parts = line.split(/(\*\*.*?\*\*)/);
                                                                return (
                                                                    <span key={i}>
                                                                        {parts.map((part, j) => 
                                                                            part.startsWith('**') && part.endsWith('**') ? 
                                                                                <strong key={j}>{part.slice(2, -2)}</strong> : 
                                                                                part
                                                                        )}
                                                                        {i < msg.text.split('\n').length - 1 && <br />}
                                                                    </span>
                                                                );
                                                            }
                                                            return (
                                                                <React.Fragment key={i}>
                                                                    {line}
                                                                    {i < msg.text.split('\n').length - 1 && <br />}
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="message-timestamp">{msg.time}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {isBotTyping && (
                                        <div className="message-row bot">
                                            <div className="message-balloon bot">
                                                <div className="bot-profile-avatar"><span>🤖</span></div>
                                                <div className="typing-animation">
                                                    <div className="typing-dot-group">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </div>
                                                    <span className="typing-status-text">
                                                        {isUsingAI && aiAvailable ? "NetGuard DZ réfléchit..." : "NetGuard DZ analyse..."}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatMessagesEndRef} />
                                </div>
                            </div>

                            {showChipSuggestions && !isBotTyping && chatMessages[chatMessages.length - 1]?.sender === "bot" && (
                                <div className="suggestions-chip-bar">
                                    {suggestionChips.map((chip, index) => (
                                        <button
                                            key={index}
                                            className="suggestion-chip"
                                            onClick={() => handleChipAction(chip.action)}
                                        >
                                            <span className="chip-emoji">{chip.icon}</span>
                                            <span className="chip-label">{chip.text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="chat-input-footer">
                                <div className="input-field-wrapper">
                                    <div className="input-field-glow"></div>
                                    <div className="chat-input-field">
                                        <span className="input-field-icon">💬</span>
                                        <input
                                            ref={chatInputRef}
                                            type="text"
                                            placeholder={isVoiceListening ? "🎤 Écoute en cours..." : "Posez votre question ici..."}
                                            value={userInputMessage}
                                            onChange={(e) => setUserInputMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendUserMessage();
                                                }
                                            }}
                                            className="chat-text-input"
                                            disabled={isVoiceListening}
                                        />
                                        {isVoiceSupported && (
                                            <button 
                                                className={`voice-input-send ${isVoiceListening ? 'listening-mode' : ''}`}
                                                onClick={handleVoiceCommand}
                                            >
                                                🎤
                                            </button>
                                        )}
                                        <button onClick={() => sendUserMessage()} className="send-message-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                            <span>Envoyer</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="input-security-footer">
                                    <span className="security-icon">🔒</span>
                                    <span>Espace sécurisé - Support technique</span>
                                    <span className="footer-separator">|</span>
                                    <span className="security-icon">💡</span>
                                    <span>Tapez /reset pour nouvelle conversation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Chatboot;
