// Storage Manager
class StorageManager {
    constructor() {
        this.currentChatId = localStorage.getItem('currentChatId') || null;
    }

    getAllChats() {
        const chats = localStorage.getItem('chats');
        return chats ? JSON.parse(chats) : {};
    }

    getChat(chatId) {
        const chats = this.getAllChats();
        return chats[chatId] || null;
    }

    getCurrentChat() {
        if (!this.currentChatId) {
            this.createNewChat();
        }
        return this.getChat(this.currentChatId);
    }

    createNewChat() {
        const chatId = Date.now().toString();
        const chats = this.getAllChats();
        
        chats[chatId] = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('chats', JSON.stringify(chats));
        localStorage.setItem('currentChatId', chatId);
        this.currentChatId = chatId;
        
        return chats[chatId];
    }

    saveMessage(message) {
        const chats = this.getAllChats();
        const chat = chats[this.currentChatId];
        
        if (!chat) return;
        
        chat.messages.push(message);
        chat.updatedAt = new Date().toISOString();
        
        // Auto-generate title from first user message
        if (chat.title === 'New Chat' && message.sender === 'user') {
            chat.title = message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '');
        }
        
        localStorage.setItem('chats', JSON.stringify(chats));
    }

    clearCurrentChat() {
        const chats = this.getAllChats();
        if (this.currentChatId && chats[this.currentChatId]) {
            chats[this.currentChatId].messages = [];
            localStorage.setItem('chats', JSON.stringify(chats));
        }
    }

    deleteChat(chatId) {
        const chats = this.getAllChats();
        delete chats[chatId];
        localStorage.setItem('chats', JSON.stringify(chats));
        
        if (this.currentChatId === chatId) {
            this.currentChatId = null;
            localStorage.removeItem('currentChatId');
        }
    }

    setCurrentChat(chatId) {
        this.currentChatId = chatId;
        localStorage.setItem('currentChatId', chatId);
    }

    searchChats(query) {
        const chats = this.getAllChats();
        const results = [];
        
        for (let chat of Object.values(chats)) {
            const titleMatch = chat.title.toLowerCase().includes(query.toLowerCase());
            const messageMatch = chat.messages.some(msg => 
                msg.text.toLowerCase().includes(query.toLowerCase())
            );
            
            if (titleMatch || messageMatch) {
                results.push(chat);
            }
        }
        
        return results;
    }
}

const storage = new StorageManager();
