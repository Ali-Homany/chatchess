import os
import random
from string import ascii_letters, digits
from dotenv import load_dotenv
from flask_cors import CORS
from flask import Flask, request, session, jsonify
from flask_socketio import join_room, leave_room, send, SocketIO


load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
CORS(app, origins=[os.getenv('FRONTEND_URL')])
socketio = SocketIO(app, cors_allowed_origins=[os.getenv('FRONTEND_URL')])


games = {}


def log(text: str) -> None:
    log_path = os.getenv('LOG_PATH')
    if not os.path.exists(log_path):
        with open(log_path, 'w') as f:
            f.write(text + '\n')
    else:
        with open(log_path, 'a') as f:
            f.write(text + '\n')


@app.route('/generate_game_id', methods=['GET'])
def generate_game_id():
    id = ''.join(random.choices(list(ascii_letters + digits), k=20))
    return jsonify({"gameId": id})


@app.route('/', methods=['POST'])
def enter_game():
    session.clear()
    # parse request data
    data = request.json
    game_id = data['game_id']
    username = data['username']
    is_creator = data['is_creator']
    # case 1: create new game
    if is_creator:
        if game_id in games:
            return jsonify({"error": "Game already exists"}), 400
        # create game object
        games[game_id] = {'players': [username], 'board': None, 'messages': [],}
    else:
        if game_id not in games:
            return jsonify({"error": "Game does not exist"}), 400
        if len(games[game_id]['players']) == 2:
            return jsonify({"error": "Game already full!"})
        if username in games[game_id]['players']:
            return jsonify({"error": "User already in game"}), 400
        # add username to game object
        games[game_id]['players'].append(username)
    # save game id to session
    session['game_id'] = game_id
    session['username'] = username
    log(f'Entered game {game_id} as ' + ('creator' if is_creator else 'player'))
    log(f'Session game_id: {session.get("game_id")}')
    return jsonify({"id": game_id})


@socketio.on("connect")
def connect(auth):
    log(f'Client tried to connect')
    game_id = session.get('game_id')
    if not game_id:
        game_id = request.args.get('game_id')
        if game_id:
            session['game_id'] = game_id
        else:
            log('No game id exists in session to connect to')
            return
    if game_id not in games:
        log(f'Game {game_id} does not exist to connect to')
        leave_room(game_id)
        return
    join_room(game_id)
    log(f'Player has connected to game {game_id}')


@socketio.on("disconnect")
def disconnect():
    game_id = session.get('game_id')
    username = "username"
    if not game_id:
        log('No game id exists in session')
        return
    leave_room(game_id)

    game = games[game_id]
    log(game)
    if not game['players'] or len(game['players']) == 0:
        del games[game_id]
    log(f'Disconnected game {game_id}')


@socketio.on('message')
def handle_message(message):
    game_id = session.get('game_id')
    log(f'Session game_id: {game_id}')
    if game_id:
        log(f"Message sent to game {game_id}: {message}")
        # Broadcast the message to the game
        send(message, game_id=game_id)
    else:
        log('No game id exists in session to send message to')


if __name__ == '__main__':
    socketio.run(app, debug=True)
