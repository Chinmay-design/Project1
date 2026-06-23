// Chat Controller
class ChatController {
    constructor() {
        this.messageContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
    }

    addMessage(text, sender) {
        // Remove welcome message if present
        const welcomeMsg = this.messageContainer.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        // Check for code blocks
        if (text.includes('```')) {
            messageDiv.innerHTML = this.formatCodeBlocks(text);
        } else {
            messageDiv.textContent = text;
        }

        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        messageDiv.appendChild(timestamp);

        this.messageContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Save to storage
        storage.saveMessage({
            text: text,
            sender: sender,
            timestamp: new Date().toISOString()
        });

        return messageDiv;
    }

    showTypingIndicator() {
        const template = document.getElementById('typingIndicator');
        const typingDiv = template.content.cloneNode(true);
        this.messageContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingDiv = this.messageContainer.querySelector('.typing');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        // Add user message
        this.addMessage(text, 'user');
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        // Get bot response (simulate delay)
        await this.delay(1000 + Math.random() * 2000);
        const response = this.getBotResponse(text);

        // Remove typing and add response
        this.removeTypingIndicator();
        this.addMessage(response, 'bot');
    }

    getBotResponse(message) {
        const msg = message.toLowerCase();
        
        // Simple rule-based responses
        const responses = {
            'hello': 'Hi there! How can I help you today? 👋',
            'hi': 'Hello! What can I do for you?',
            'hey': 'Hey! How are you doing?',
            'how are you': "I'm doing great, thanks for asking! How about you?",
            'bye': 'Goodbye! Have a wonderful day! 👋',
            'goodbye': 'See you later! Take care!',
            'thanks': "You're welcome! 😊",
            'thank you': "No problem! Happy to help!",
            'help': 'I can chat with you, remember conversations, and help with basic questions. Try saying hello!',
            'what can you do': 'I can:\n• Chat with you\n• Save our conversations\n• Export chats\n• Understand voice input\n• Work in dark mode\n\nWhat would you like to try?',
            'joke': 'Why do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛😄',
            'code': 'Here\'s a Python example:\n```python\nprint("Hello, World!")\nfor i in range(5):\n    print(f"Count: {i}")\n```',
        };

        // Check exact matches
        if (responses[msg]) {
            return responses[msg];
        }

        // Check partial matches
        if (msg.includes('joke')) return responses['joke'];
        if (msg.includes('code')) return responses['code'];
        if (msg.includes('help')) return responses['help'];
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
            return responses['hello'];
        }

        // Default responses
        const defaults = [
            "Interesting! Tell me more about that.",
            "I see. How does that make you feel?",
            "That's fascinating! Can you elaborate?",
            "I understand. What else would you like to know?",
            "Got it! Is there anything else I can help with?",
            "Hmm, I'm not sure about that. Could you rephrase?",
            "Thanks for sharing! What are your thoughts on this?"
        ];

        return defaults[Math.floor(Math.random() * defaults.length)];
    }

    formatCodeBlocks(text) {
        return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            const escapedCode = this.escapeHtml(code.trim());
            return `<pre><code class="language-${language || 'plaintext'}">${escapedCode}</code><button class="copy-btn" onclick="copyCode(this)">Copy</button></pre>`;
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadChat(chat) {
        this.messageContainer.innerHTML = '';
        
        if (chat.messages.length === 0) {
            this.showWelcomeMessage();
            return;
        }

        chat.messages.forEach(msg => {
            this.addMessage(msg.text, msg.sender);
        });
    }

    showWelcomeMessage() {
        this.messageContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">👋</div>
                <h2>Welcome to ChatBot</h2>
                <p>I'm a simple chatbot. How can I help you today?</p>
            </div>
        `;
    }

    scrollToBottom() {
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const chat = new ChatController();

// Global functions
function sendMessage() {
    chat.sendMessage();
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function copyCode(button) {
    const code = button.parentElement.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}

function clearChat() {
    if (confirm('Are you sure you want to clear this chat?')) {
        storage.clearCurrentChat();
        chat.showWelcomeMessage();
        updateChatList();
    }
}

function exportChat() {
    const currentChat = storage.getCurrentChat();
    if (!currentChat || currentChat.messages.length === 0) {
        alert('No messages to export!');
        return;
    }

    const exportData = currentChat.messages.map(msg => 
        `[${msg.timestamp}] ${msg.sender.toUpperCase()}: ${msg.text}`
    ).join('\n\n');

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${currentChat.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function handleFileUpload() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', function(e) {
    const files = e.target.files;
    if (files.length > 0) {
        chat.addMessage(`📎 Attached ${files.length} file(s): ${Array.from(files).map(f => f.name).join(', ')}`, 'user');
    }
});

function toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}

// Emoji click handler
document.getElementById('emojiPicker').addEventListener('click', function(e) {
    if (e.target.textContent.trim()) {
        const input = document.getElementById('messageInput');
        input.value += e.target.textContent.trim();
        input.focus();
        this.style.display = 'none';
    }
});

// Close emoji picker when clicking outside
document.addEventListener('click', function(e) {
    const picker = document.getElementById('emojiPicker');
    const emojiBtn = document.querySelector('.emoji-btn');
    if (!picker.contains(e.target) && !emojiBtn.contains(e.target)) {
        picker.style.display = 'none';
    }
});
