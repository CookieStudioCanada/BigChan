// Configuration du chat
const API_URL = 'https://chatwithalex-ik32xiclqq-uc.a.run.app';

// Structure de l'historique du chat conforme à l'API Gemini
let chatHistory = [];

// Éléments du DOM
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Fonction pour convertir les *mots* en texte en gras
function formatBoldText(text) {
    return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

// Fonction pour ajouter un message au chat
function addMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'alex-message');
    messageDiv.innerHTML = formatBoldText(content);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Mettre à jour l'historique dans le format attendu par Gemini
    chatHistory.push({
        role: isUser ? "user" : "model",
        content: content
    });

    // Garder seulement les 10 derniers messages pour éviter de surcharger le contexte
    if (chatHistory.length > 10) {
        chatHistory = chatHistory.slice(-10);
    }
}

// Fonction pour appeler l'API d'Alex
async function getAlexResponse(userMessage) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                history: chatHistory // L'historique est déjà dans le bon format
            })
        });

        if (!response.ok) {
            console.error('Response status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            console.error('API Error:', data.error);
            throw new Error(data.error || "Erreur de communication avec Alex");
        }
        
        return data.response;
    } catch (error) {
        console.error('Erreur détaillée:', error);
        return "Désolé, j'ai un petit bug... Essaie encore!";
    }
}

// Gestionnaire d'envoi de message
async function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;

    // Afficher le message de l'utilisateur
    addMessage(message, true);
    userInput.value = '';

    // Simuler la saisie d'Alex
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'alex-message');
    loadingMessage.textContent = 'Alex est en train d\'écrire...';
    chatMessages.appendChild(loadingMessage);

    try {
        // Obtenir et afficher la réponse d'Alex
        const response = await getAlexResponse(message);
        chatMessages.removeChild(loadingMessage);
        addMessage(response, false);
    } catch (error) {
        chatMessages.removeChild(loadingMessage);
        addMessage("Désolé, j'ai un petit bug... Essaie encore!", false);
        console.error('Erreur lors de l\'envoi du message:', error);
    }
}

// Event listeners
sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSend();
    }
});

// Message de bienvenue
addMessage("Salut! Je suis BigChan, ton ami préféré. Comment puis-je t'aider aujourd'hui?", false);