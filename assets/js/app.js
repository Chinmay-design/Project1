// Main App Controller
class App {
    constructor() {
        this.init();
    }

    init() {
        this.loadChatList();
        this.loadCurrentChat();
        this.setupKeyboardShortcuts();
    }

    loadChatList() {
        updateChatList();
    }

    loadCurrentChat() {
        const currentChat = storage.getCurrentChat();
        if (currentChat) {
            chat.loadChat(currentChat);
        } else {
            const newChat = storage.createNewChat();
            chat.loadChat(newChat);
            updateChatList();
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: New chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                createNewChat();
            }
            // Ctrl/Cmd + /: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                document.getElementById('searchChats').focus();
            }
        });
    }
}

function updateChatList(filterQuery = '') {
    const chatList = document.getElementById('chatList');
    let chats = storage.getAllChats();
    
    if (filterQuery) {
        const results = storage.searchChats(filterQuery);
        chats = {};
        results.forEach(chat => chats[chat.id] = chat);
    }
    
    const sortedChats = Object.values(chats).sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    chatList.innerHTML = sortedChats.map(chat => `
        <div class="chat-item ${chat.id === storage.currentChatId ? 'active' : ''}" 
             onclick="switchChat('${chat.id}')">
            <div>${chat.title}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">
                ${new Date(chat.updatedAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');

    if (sortedChats.length === 0) {
        chatList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No conversations yet</div>';
    }
}

function createNewChat() {
    const newChat = storage.createNewChat();
    chat.showWelcomeMessage();
    updateChatList();
}

function switchChat(chatId) {
    storage.setCurrentChat(chatId);
    const currentChat = storage.getChat(chatId);
    chat.loadChat(currentChat);
    updateChatList();
}

function filterChats() {
    const query = document.getElementById('searchChats').value;
    updateChatList(query);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// Initialize app
const app = new App();
