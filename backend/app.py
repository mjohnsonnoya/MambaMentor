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

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory conversation storage: a dict with conversation IDs as keys.
conversations = {}

# OpenAI configuration
openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """You are a conversation assistant specializing in generating flirty/funny responses. 
Generate 1 suggestion matching the user's requested style. Keep responses under 100 characters.
Format as 3 sentences, seperated by newline."""

def format_conversation(convo_array):
    return "\n".join([f"{msg['sender']}: {msg['text']}" for msg in convo_array])

# CHANGED: New function to generate a single GPT-4o reply based on conversation history.
def generate_ai_response(conversation_history_str):
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a friendly chat partner. Keep your reply short."},
                {"role": "user", "content": f"Conversation so far:\n{conversation_history_str}\nNow, reply as the other person:"}
            ],
            temperature=0.7,
            max_tokens=80
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI Error (single reply): {e}")
        return "Sorry, I'm a bit tongue-tied."

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
        return '{"suggestions": ["1) Let\'s talk about something else", "2) 😊", "3) How\'s your day going?"]}'
    
@socketio.on('request_suggestions')
def handle_suggestions(data):
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
    socketio.emit('new_suggestions', {
        'suggestions': suggestions,
    })
    
    # Optionally, you can auto-refresh suggestions after a new message:
    refresh_suggestions_for_convo(conversation_id)
    
    print("\n" + "-" * 50)
    print(f"Suggestions sent:\n\n{suggestions}")
    print("-" * 50 + "\n")

@socketio.on('send_message')
def handle_message(data):
    print("Received message:", data)
    conversation_id = data.get('conversation_id', 'default')
    user_text = data.get('text', '')
    conversation_goal = data.get('goal', 'Connect with the other person')
    flirtiness = data.get('flirtiness', 50)
    humor = data.get('humor', 50)
    
    # CHANGED: Store the user message with sender "Me"
    timestamp = datetime.now().isoformat()
    user_msg = {
        'id': str(time.time_ns()),
        'sender': 'Me',  # User's message
        'text': user_text,
        'timestamp': timestamp
    }
    if conversation_id not in conversations:
        conversations[conversation_id] = []
    conversations[conversation_id].append(user_msg)
    
    # CHANGED: Generate AI response using the entire conversation history
    conv_history_str = format_conversation(conversations[conversation_id])
    ai_reply = generate_ai_response(conv_history_str)
    
    # CHANGED: Create an AI message with sender "Other"
    ai_msg = {
        'id': str(time.time_ns()),
        'sender': 'Other',  # AI's response will appear as coming from the other person
        'text': ai_reply,
        'timestamp': datetime.now().isoformat()
    }
    conversations[conversation_id].append(ai_msg)
    
    # Emit both the user message and the AI reply
    if user_text:
        socketio.emit('new_message', {
            'conversation_id': conversation_id,
            'message': user_msg
        })
    socketio.emit('new_message', {
        'conversation_id': conversation_id,
        'message': ai_msg
    })
    

@socketio.on('refresh_suggestions')
def refresh_suggestions_event(data):
    conversation_id = data.get('conversation_id', 'default')
    style = data.get('style', 'flirty')
    refresh_suggestions_for_convo(conversation_id)

def refresh_suggestions_for_convo(conversation_id):
    if conversation_id in conversations:
        formatted_history = format_conversation(conversations[conversation_id])
    else:
        formatted_history = ""
    suggestions = generate_suggestions(formatted_history)
    socketio.emit('new_suggestions', {
        'conversation_id': conversation_id,
        'suggestions': suggestions
    })

@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    data = request.json or {}
    conversation_history = data.get('history', "Other: Hi, how are you?\nYou: I'm doing well, how are you?\nOther: I'm doing well too.")
    style = data.get('style', 'flirty')
    return jsonify(generate_suggestions(conversation_history, style))

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5432, debug=True)
