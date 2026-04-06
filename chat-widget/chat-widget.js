(function() {
    const CONFIG = {
        API_URL: 'https://ripdmhkmkfkvrezswmdw.supabase.co/functions/v1/chat',
        SESSION_KEY: 'leadbot_session_id',
        PRIMARY_COLOR: '#6366f1',
        GLASS_BACKGROUND: 'rgba(15, 23, 42, 0.9)',
        TEXT_COLOR: '#f8fafc',
    };

    function generateSessionId() {
        let sid = localStorage.getItem(CONFIG.SESSION_KEY);
        if (!sid) {
            sid = 'web_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
            localStorage.setItem(CONFIG.SESSION_KEY, sid);
        }
        return sid;
    }

    const sessionId = generateSessionId();

    const template = `
        <style>
            :host {
                --primary: ${CONFIG.PRIMARY_COLOR};
                --bg: ${CONFIG.GLASS_BACKGROUND};
                --text: ${CONFIG.TEXT_COLOR};
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9999;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }

            .chat-bubble {
                width: 64px;
                height: 64px;
                background: linear-gradient(135deg, var(--primary), #8b5cf6);
                border-radius: 50%;
                box-shadow: 0 4px 24px -1px rgba(99, 102, 241, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
                color: white;
            }

            .chat-bubble:hover {
                transform: scale(1.08) rotate(5deg);
                box-shadow: 0 8px 32px -1px rgba(99, 102, 241, 0.7);
            }

            .chat-window {
                position: absolute;
                bottom: 84px;
                right: 0;
                width: 380px;
                height: 560px;
                background: var(--bg);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                box-shadow: 0 12px 64px -12px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: translateY(20px) scale(0.95);
                opacity: 0;
                pointer-events: none;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .chat-window.active {
                transform: translateY(0) scale(1);
                opacity: 1;
                pointer-events: all;
            }

            .chat-header {
                padding: 24px;
                background: rgba(255, 255, 255, 0.05);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .avatar {
                width: 40px;
                height: 40px;
                background: var(--primary);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }

            .header-info h3 {
                margin: 0;
                font-size: 16px;
                color: var(--text);
            }

            .header-info p {
                margin: 4px 0 0;
                font-size: 13px;
                color: #94a3b8;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.1) transparent;
            }

            .message {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 16px;
                font-size: 14px;
                line-height: 1.5;
                animation: slideUp 0.3s ease-out;
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .bot-msg {
                background: rgba(255, 255, 255, 0.05);
                color: var(--text);
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            .user-msg {
                background: var(--primary);
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .quick-replies {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 8px;
            }

            .reply-btn {
                background: transparent;
                border: 1px solid var(--primary);
                color: var(--primary);
                padding: 8px 14px;
                border-radius: 20px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .reply-btn:hover {
                background: var(--primary);
                color: white;
            }

            .chat-input {
                padding: 20px;
                background: rgba(255, 255, 255, 0.05);
                display: flex;
                gap: 12px;
            }

            input {
                flex: 1;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 12px 16px;
                border-radius: 12px;
                color: white;
                outline: none;
            }

            input:focus {
                border-color: var(--primary);
            }

            .send-btn {
                background: var(--primary);
                color: white;
                border: none;
                width: 44px;
                height: 44px;
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .typing {
                font-style: italic;
                color: #94a3b8;
                font-size: 12px;
                margin-top: -8px;
            }
        </style>
        
        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                <div class="avatar">🤖</div>
                <div class="header-info">
                    <h3>Automation Assistant</h3>
                    <p>Usually replies instantly</p>
                </div>
            </div>
            <div class="chat-messages" id="messageArea"></div>
            <div class="chat-input">
                <input type="text" id="userInput" placeholder="Type a message..." autocomplete="off">
                <button class="send-btn" id="sendBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
            </div>
        </div>

        <div class="chat-bubble" id="bubble">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </div>
    `;

    class LeadChatWidget extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = template;
            this.isOpen = false;
        }

        connectedCallback() {
            this.setupEventListeners();
            this.initChat();
        }

        setupEventListeners() {
            const bubble = this.shadowRoot.getElementById('bubble');
            const chatWindow = this.shadowRoot.getElementById('chatWindow');
            const sendBtn = this.shadowRoot.getElementById('sendBtn');
            const input = this.shadowRoot.getElementById('userInput');

            bubble.onclick = () => {
                this.isOpen = !this.isOpen;
                chatWindow.classList.toggle('active', this.isOpen);
            };

            sendBtn.onclick = () => this.sendMessage();
            input.onkeypress = (e) => { if (e.key === 'Enter') this.sendMessage(); };
        }

        async sendMessage(text = null, payload = null) {
            const input = this.shadowRoot.getElementById('userInput');
            const msg = text || input.value.trim();
            if (!msg && !payload) return;

            if (!payload) input.value = '';
            
            // Add user message to UI
            if (msg) this.addMessage(msg, 'user-msg');

            // Show typing
            const typing = document.createElement('div');
            typing.className = 'typing';
            typing.innerText = 'Bot is typing...';
            this.shadowRoot.getElementById('messageArea').appendChild(typing);
            this.scrollToBottom();

            try {
                const res = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        messageText: payload ? null : msg,
                        payload
                    })
                });
                const data = await res.json();
                
                typing.remove();
                this.addMessage(data.text, 'bot-msg', data.replies);
            } catch (err) {
                typing.remove();
                this.addMessage("Sorry, I'm having connection issues. Please try again later.", 'bot-msg');
            }
        }

        addMessage(text, className, replies = []) {
            const area = this.shadowRoot.getElementById('messageArea');
            const msg = document.createElement('div');
            msg.className = `message ${className}`;
            msg.innerText = text;
            area.appendChild(msg);

            if (replies.length > 0) {
                const replyArea = document.createElement('div');
                replyArea.className = 'quick-replies';
                replies.forEach(r => {
                    const btn = document.createElement('button');
                    btn.className = 'reply-btn';
                    btn.innerText = r.title;
                    btn.onclick = () => {
                        this.addMessage(r.title, 'user-msg');
                        this.sendMessage(null, r.payload);
                        replyArea.remove(); // Remove buttons after click
                    };
                    replyArea.appendChild(btn);
                });
                area.appendChild(replyArea);
            }

            this.scrollToBottom();
        }

        scrollToBottom() {
            const area = this.shadowRoot.getElementById('messageArea');
            area.scrollTop = area.scrollHeight;
        }

        async initChat() {
            // Trigger initial greeting
            this.sendMessage(null, 'RESTART');
        }
    }

    customElements.define('lead-chat-widget', LeadChatWidget);
    
    // Inject component
    const widget = document.createElement('lead-chat-widget');
    document.body.appendChild(widget);
})();
