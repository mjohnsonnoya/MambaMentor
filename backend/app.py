# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import openai
import os
import time
from datetime import datetime
from dotenv import load_dotenv

import logging

# Configure logging at the beginning of your file
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

load_dotenv()

# Configuration
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory conversation storage
conversations = {}

# OpenAI configuration
openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """You are a conversation assistant specializing in generating flirty/funny responses. 
Generate 1 suggestion matching the user's requested style. Keep responses under 100 characters.
Format as 3 sentences, seperated by newline."""

def generate_suggestions(prompt, style="flirty"):
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Conversation history:\n{prompt}\n\nGenerate {style} responses:"}
            ],
            temperature=0.7,
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Error: {e}")
        # Return a fallback suggestion set in JSON format
        return '{"suggestions": ["1) Let\'s talk about something else", "2) 😊", "3) How\'s your day going?"]}'

# Helper function to format conversation history
def format_conversation(convo_array):
    return "\n".join([f"{msg['sender']}: {msg['text']}" for msg in convo_array])

@socketio.on('send_message')
def handle_message(data):
    print("Received message:", data)
    conversation_id = data.get('conversation_id', 'default')
    conversation_history = data.get('text', 'No messages yet!')
    conversation_goal = data.get('goal', 'Connect with the other person')
    flirtiness = data.get('flirtiness', 50)
    humor = data.get('humor', 50)
    suggestions = ""
    
    # Generate suggestions based on the conversation history and other settings
    while suggestions.count('\n') < 2:
        # Build a combined prompt string that includes all the context:
        prompt = (
            f"Conversation History:\n\n{conversation_history}\n\n"
            f"Conversation Goal: {conversation_goal}\n"
            f"Flirtiness Level: {flirtiness}/100\n"
            f"Humor Level: {humor}/100\n"
            "Based on the above, generate three suggestions (under 100 characters) to respond to the last message or continue the conversation. Seperate them with newlines.\n"
        )
        
        print("\n" + "-" * 50)
        print("Prompt for OpenAI:", prompt[:-1])
        print("-" * 50 + "\n")
        
        # Get suggestions
        suggestions = generate_suggestions(prompt)
    
    # Broadcast the new message
    socketio.emit('new_message', {
        'suggestions': suggestions,
    })
    
    # Optionally, you can auto-refresh suggestions after a new message:
    refresh_suggestions_for_convo(conversation_id)
    
    print("\n" + "-" * 50)
    print(f"Suggestions sent:\n\n{suggestions}")
    print("-" * 50 + "\n")

@socketio.on('refresh_suggestions')
def refresh_suggestions_event(data):
    # When refresh button is pressed, data may contain conversation_id and style
    conversation_id = data.get('conversation_id', 'default')
    style = data.get('style', 'flirty')
    refresh_suggestions_for_convo(conversation_id)

def refresh_suggestions_for_convo(conversation_id):
    # Use the entire conversation history or a subset (e.g., last 5 messages)
    if conversation_id in conversations:
        # For richer context, you might want to use all messages or the last N messages.
        # Here we use all messages, formatted with sender labels.
        formatted_history = format_conversation(conversations[conversation_id])
    else:
        formatted_history = ""
    
    suggestions = generate_suggestions(formatted_history)
    
    # Emit the new suggestions back to the client
    socketio.emit('new_suggestions', {
        'conversation_id': conversation_id,
        'suggestions': suggestions
    })

# Optional route if you need to test suggestions via HTTP POST
@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    # You could accept JSON data here instead of hardcoding.
    data = request.json or {}
    conversation_history = data.get('history', "Other: Hi, how are you?\nYou: I'm doing well, how are you?\nOther: I'm doing well too.")
    style = data.get('style', 'flirty')
    return jsonify(generate_suggestions(conversation_history, style))

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5432, debug=True)
