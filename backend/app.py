# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import openai
import os
import time
from datetime import datetime
from dotenv import load_dotenv

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
Format as a JSON file with one response."""

def generate_suggestions(conversation_history, style="flirty"):
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Conversation history:\n{conversation_history}\n\nGenerate {style} responses:"}
            ],
            temperature=0.7,
            max_tokens=150
        )
        return response.choices[0].message.content.split("\n")
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return ["1) Let's talk about something else", "2) 😊", "3) How's your day going?"]

# @socketio.on('connect')
# def handle_connect():
#     print('Client connected:', request.sid)

# @socketio.on('disconnect')
# def handle_disconnect():
#     print('Client disconnected:', request.sid)

@socketio.on('send_message')
def handle_message(data):
    conversation_id = data.get('conversation_id', 'default')
    user_message = data['text']
    style = data.get('style', 'flirty')
    
    # Store message
    timestamp = datetime.now().isoformat()
    message_data = {
        'id': str(time.time_ns()),
        'sender': 'user',
        'text': user_message,
        'timestamp': timestamp
    }
    
    if conversation_id not in conversations:
        conversations[conversation_id] = []
    conversations[conversation_id].append(message_data)
    
    # Broadcast message
    socketio.emit('new_message', {
        'conversation_id': conversation_id,
        'message': message_data
    })
    
    # Generate and send suggestions
    history = "\n".join([msg['text'] for msg in conversations[conversation_id][-5:]])
    suggestions = generate_suggestions(history, style)
    
    socketio.emit('new_suggestions', {
        'conversation_id': conversation_id,
        'suggestions': suggestions
    })

# @app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    data = "Other: Hi, how are you?\nYou:I'm doing well, how are you?\nOther: I'm doing well too."
    #request.json 
    return generate_suggestions(data)

if __name__ == '__main__':
    # socketio.run(app, host='0.0.0.0', port=5000, debug=True)
    print(get_suggestions())
