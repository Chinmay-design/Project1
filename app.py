import streamlit as st
from utils.chat_manager import ChatManager
from utils.responses import get_bot_response
from datetime import datetime
import os

# Page configuration
st.set_page_config(
    page_title="🤖 Minimal ChatBot",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load custom CSS
def load_css():
    with open('assets/style.css') as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

load_css()

# Initialize chat manager
if 'chat_manager' not in st.session_state:
    st.session_state.chat_manager = ChatManager()

chat_manager = st.session_state.chat_manager

# ============ SIDEBAR ============
with st.sidebar:
    st.title("🤖 ChatBot")
    
    # New Chat Button
    if st.button("➕ New Chat", use_container_width=True):
        chat_manager.create_new_chat()
        st.rerun()
    
    st.divider()
    
    # Search chats
    search_query = st.text_input("🔍 Search conversations", placeholder="Search...")
    
    # Display chat history
    st.subheader("💬 Conversations")
    
    chats = chat_manager.get_filtered_chats(search_query)
    
    if not chats:
        st.info("No conversations yet")
    
    for chat_id, chat_data in chats.items():
        col1, col2 = st.columns([4, 1])
        with col1:
            if st.button(
                f"📝 {chat_data['title'][:30]}...",
                key=f"chat_{chat_id}",
                use_container_width=True,
                type="secondary" if chat_id != chat_manager.current_chat_id else "primary"
            ):
                chat_manager.switch_chat(chat_id)
                st.rerun()
        with col2:
            if st.button("🗑️", key=f"delete_{chat_id}", help="Delete chat"):
                chat_manager.delete_chat(chat_id)
                st.rerun()
    
    st.divider()
    
    # Settings
    st.subheader("⚙️ Settings")
    
    # Theme toggle
    theme = st.selectbox("Theme", ["Light", "Dark"], key="theme")
    if theme == "Dark":
        st.markdown("""
            <style>
                .stApp { background-color: #0e1117; }
            </style>
        """, unsafe_allow_html=True)
    
    # Export chat
    if st.button("💾 Export Current Chat", use_container_width=True):
        chat_data = chat_manager.export_chat()
        if chat_data:
            st.download_button(
                label="📥 Download Chat",
                data=chat_data,
                file_name=f"chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                mime="text/plain"
            )
    
    st.divider()
    st.caption("Made with ❤️ using Streamlit")

# ============ MAIN CHAT AREA ============
st.title("💬 Chat Interface")

# Display current chat info
current_chat = chat_manager.get_current_chat()
if current_chat:
    st.caption(f"📅 Created: {current_chat['created_at'].strftime('%B %d, %Y at %I:%M %p')}")
    st.caption(f"💬 Messages: {len(current_chat['messages'])}")

st.divider()

# Chat container
chat_container = st.container()

# Display messages
with chat_container:
    if not current_chat or not current_chat['messages']:
        # Welcome message
        st.markdown("""
            <div class="welcome-message">
                <div style="font-size: 48px; text-align: center;">👋</div>
                <h2 style="text-align: center;">Welcome to ChatBot!</h2>
                <p style="text-align: center; color: #666;">
                    I'm a simple chatbot. How can I help you today?
                </p>
            </div>
        """, unsafe_allow_html=True)
    else:
        for msg in current_chat['messages']:
            with st.chat_message(msg['role']):
                st.markdown(msg['content'])
                st.caption(f"_{msg['timestamp'].strftime('%I:%M %p')}_")

# ============ INPUT AREA ============
st.divider()

# Input columns
col1, col2, col3 = st.columns([8, 1, 1])

with col1:
    user_input = st.chat_input("Type your message here...")

# Handle user input
if user_input:
    # Add user message
    chat_manager.add_message('user', user_input)
    
    # Get bot response
    with st.spinner('🤔 Thinking...'):
        bot_response = get_bot_response(user_input)
    
    # Add bot response
    chat_manager.add_message('assistant', bot_response)
    
    # Rerun to update chat
    st.rerun()

# Clear chat button
with col2:
    if st.button("🗑️ Clear", help="Clear current chat"):
        if current_chat:
            chat_manager.clear_current_chat()
            st.rerun()

# Voice input button (placeholder)
with col3:
    if st.button("🎤", help="Voice input (coming soon)"):
        st.info("Voice input feature coming soon!")

# Footer
st.divider()
st.caption("💡 Tip: Press Enter to send message")
