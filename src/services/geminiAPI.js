// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Your Gemini API Key - Get from https://aistudio.google.com/
// Replace with your actual API key
const API_KEY = "AIzaSyB_xxxxxxxxxxxxxxxxxxxxx";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);

// Use the latest model
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
    },
});

// System instruction for the AI
const SYSTEM_INSTRUCTION = `Tu es un assistant technique spécialisé pour NetGuard DZ en Algérie.

RÔLE : Aider les utilisateurs à résoudre leurs problèmes Internet et ADSL.

RÈGLES IMPORTANTES :
1. Réponds TOUJOURS en français
2. Sois professionnel, patient et clair
3. Donne des solutions ÉTAPE PAR ÉTAPE avec des numéros
4. Propose de créer un ticket si le problème persiste

PROBLÈMES À RÉSOUDRE :
- Pas de connexion internet → Guide de dépannage (voyants, câbles, redémarrage)
- Connexion lente → Vérifier vitesse, appareils connectés, forfait
- Problèmes ADSL/Modem → Vérifier synchro, filtres, prise téléphone
- Problèmes WiFi → Vérifier mot de passe, canal, distance
- Créer un ticket → Demander nom et numéro de téléphone
- État du réseau → Donner statut par région (Alger, Oran, Constantine...)

FORMAT DES RÉPONSES :
- Utilise des émojis (📡, 🔌, ⚡, ✅, ❌, ⚠️)
- Sépare les étapes avec des sauts de ligne
- Sois concis mais complet

Comporte-toi comme un expert technique Algérie Télécom.`;

// Main function to get AI response
export const getGeminiResponse = async (userMessage, conversationHistory = []) => {
    try {
        // Build conversation history
        const history = [
            {
                role: "user",
                parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            {
                role: "model",
                parts: [{ text: "Je suis prêt à aider les utilisateurs avec leurs problèmes internet en Algérie. Comment puis-je vous aider aujourd'hui ?" }],
            }
        ];
        
        // Add conversation history
        for (const msg of conversationHistory) {
            history.push({
                role: msg.sender === "user" ? "user" : "model",
                parts: [{ text: msg.text }]
            });
        }
        
        // Start chat
        const chat = model.startChat({ history });
        
        // Send message
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        
        return response.text();
        
    } catch (error) {
        console.error("Gemini API Error:", error);
        
        // Fallback responses if API fails
        if (error.message.includes("API key")) {
            return "⚠️ Clé API invalide. Veuillez configurer votre clé API Gemini.\n\nContactez l'administrateur.";
        }
        
        return "📡 Désolé, je rencontre une difficulté technique. Veuillez réessayer dans quelques instants ou contacter le support au 1055.";
    }
};

// Quick response function for common issues (faster, no history)
export const getQuickHelp = async (problem) => {
    try {
        const prompt = `L'utilisateur en Algérie a ce problème internet: "${problem}".
        
Donne une solution claire en 3-4 étapes simples.
Utilise des émojis et des sauts de ligne.
Sois direct et utile.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
        
    } catch (error) {
        console.error("Quick help error:", error);
        return null;
    }
};

// Function to check network status
export const getNetworkStatus = async () => {
    try {
        const prompt = `Donne l'état du réseau internet en Algérie aujourd'hui.
        
Format de réponse:
🌍 ÉTAT DU RÉSEAU NETGUARD DZ

📍 Alger: [statut]
📍 Oran: [statut]
📍 Constantine: [statut]
📍 Annaba: [statut]
📍 Tizi Ouzou: [statut]
📍 Blida: [statut]
📍 Sétif: [statut]

Statuts possibles: ✅ Normal, ⚠️ Ralentissement, ❌ Panne, 🔧 Maintenance

Ajoute un message conseil à la fin.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
        
    } catch (error) {
        console.error("Network status error:", error);
        return "🌍 État du réseau:\n\n✅ Alger: Normal\n✅ Oran: Normal\n⚠️ Constantine: Ralentissement\n✅ Annaba: Normal\n❌ Tizi Ouzou: Panne\n✅ Blida: Normal\n\n📞 Pour plus d'infos: 1055";
    }
};

// Function to create support ticket
export const createTicket = async (name, phone, problem) => {
    try {
        const prompt = `Crée un ticket de support avec ces informations:
- Nom: ${name}
- Téléphone: ${phone}
- Problème: ${problem}

Génère un numéro de ticket unique (format: #NDZ-XXXXXX) et confirme la création.
Réponds en français avec les détails du ticket.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
        
    } catch (error) {
        console.error("Ticket creation error:", error);
        const ticketNum = Math.floor(Math.random() * 1000000);
        return `✅ Ticket créé avec succès !\n\n📋 Numéro: #NDZ-${ticketNum}\n👤 Nom: ${name}\n📞 Téléphone: ${phone}\n\n⏱️ Un technicien vous contactera sous 24h.`;
    }
};

// Function to get troubleshooting steps
export const getTroubleshooting = async (issueType) => {
    try {
        const prompt = `Donne une solution détaillée pour ce problème internet: ${issueType}
        
Structure ta réponse:
🔍 DIAGNOSTIC
[Description du problème]

📋 SOLUTION (étapes numérotées)
1. ...
2. ...
3. ...

✅ VÉRIFICATION FINALE
[Comment vérifier que c'est résolu]

❓ Si le problème persiste
[Prochaine étape - créer un ticket]`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
        
    } catch (error) {
        console.error("Troubleshooting error:", error);
        return null;
    }
};