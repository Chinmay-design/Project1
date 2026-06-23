// Voice Input Handler
class VoiceHandler {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.setupRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
            this.setupRecognition();
        }
    }

    setupRecognition() {
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('messageInput').value = transcript;
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopRecording();
        };

        this.recognition.onend = () => {
            this.stopRecording();
        };
    }

    startRecording() {
        if (!this.recognition) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        this.isRecording = true;
        this.recognition.start();
        
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.classList.add('recording');
        voiceBtn.innerHTML = '🔴';
    }

    stopRecording() {
        if (!this.recognition) return;
        
        this.isRecording = false;
        this.recognition.stop();
        
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '🎤';
    }
}

const voiceHandler = new VoiceHandler();

function startVoiceInput() {
    if (voiceHandler.isRecording) {
        voiceHandler.stopRecording();
    } else {
        voiceHandler.startRecording();
    }
}
