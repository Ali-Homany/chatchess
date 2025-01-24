import os
from dotenv import load_dotenv
from flask_cors import CORS
from flask import Flask, request, session, jsonify
from flask_socketio import join_room, leave_room, SocketIO
from utils.chess_game import ChessGame
from utils.helper import generate_random_id
import logging


load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
CORS(app, origins=[os.getenv('FRONTEND_URL')])
socketio = SocketIO(app, cors_allowed_origins=[os.getenv('FRONTEND_URL')])
# setup logger for debugging
logger = logging.getLogger('Backend')
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.FileHandler('./backend.log'))


games = {}


@app.route('/generate_game_room_id', methods=['GET'])
def generate_room_id():
    return jsonify({"gameRoomId": generate_random_id()})


@app.route('/', methods=['POST'])
def enter_game():
    session.clear()
    # parse request data
    data = request.json
    game_room_id, username, is_creator = data['game_room_id'], data['username'], data['is_creator']
    # case 1: create new game
    if is_creator:
        if game_room_id in games:
            return jsonify({"error": "Game already exists"}), 400
        # Initialize new game with improved structure
        games[game_room_id] = {
            'players': {
                'white': {
                    'username': username,
                    'connected': True
                },
                'black': None
            },
            'game': ChessGame(),
            'messages': [],
            'status': 'waiting', # waiting, active, completed
        }
    else:
        if game_room_id not in games:
            return jsonify({"error": "Game does not exist"}), 400
        game = games[game_room_id]
        if game['players']['black'] is not None:
            return jsonify({"error": "Game already full!"}), 400
        # Add second player
        game['players']['black'] = {
            'username': username,
            'connected': True
        }
        game['status'] = 'active'
    # save game id to session
    session.update({'game_room_id': game_room_id, 'username': username, 'is_white': is_creator})
    logger.debug(f'{username} Entered game {game_room_id} as ' + ('creator' if is_creator else 'player'))
    return jsonify({"id": game_room_id})


@socketio.on("connect")
def connect(auth):
    logger.debug(f'Client tried to connect')
    game_room_id, username = session.get('game_room_id'), session.get('username')
    if not game_room_id:
        game_room_id = request.args.get('game_room_id')
        username = request.args.get('username')
        if game_room_id:
            session['game_room_id'] = game_room_id
            session['username'] = username
        else:
            logger.debug('No game id exists in session to connect to')
            return
    if game_room_id not in games:
        logger.debug(f'Game {game_room_id} does not exist to connect to')
        leave_room(game_room_id)
        return
    session['is_white'] = games[game_room_id]['players']['white']['username'] == username
    games[game_room_id]['players']['white']['connected'] = True
    join_room(game_room_id)
    logger.debug(f'Player {username} has connected to game {game_room_id} successfully')


@socketio.on("disconnect")
def disconnect():
    game_room_id, is_white = session.get('game_room_id'), session.get('is_white')
    if not game_room_id or game_room_id not in games:
        logger.debug('No game id exists in session')
        return
    game = games[game_room_id]
    player_color = 'white' if is_white == True else 'black'
    
    if game['players'][player_color]:
        game['players'][player_color]['connected'] = False
    
    # If both players disconnected, cleanup the game
    white_player = game['players']['white']
    black_player = game['players']['black']
    if (white_player and not white_player['connected'] and 
        black_player and not black_player['connected']):
        del games[game_room_id]

    leave_room(game_room_id)
    logger.debug(f'{player_color} Disconnected game {game_room_id}')


@socketio.on('message')
def handle_message(message):
    game_room_id, username, is_white = session.get('game_room_id'), session.get('username'), session.get('is_white')
    logger.debug(f'Message recieved from game_room_id: {game_room_id}, username: {username}, is_white: {is_white}')
    game_room: ChessGame = games[game_room_id]
    logger.debug('Game Room: ' + str(game_room))
    if not game_room_id:
        logger.debug('No game id exists in session to send message to')
        return
    if game_room['status'] != 'active':
        return socketio.emit('error', {'message': 'Game has ' + ('not started yet' if game_room['status'] == 'waiting' else 'already ended.')})
    # Pass move to chessgame
    game = game_room['game']
    # check whose turn it is
    if is_white is None:
        is_white = game_room['players']['white']['username'] == username
    if is_white != game.is_white_turn():
        logger.debug(f'{is_white} != {game.is_white_turn()}')
        return socketio.emit('error', {'message': 'It is not your turn.'})
    try:
        game.update_board(message)
        if game_outcome := game.is_game_ended():
            game_room['status'] = 'completed'
            game_outcome['winner'] = game_room['players']['white' if game_outcome['is_white_winner'] else 'black']['username']
            socketio.emit('game_over', game_outcome)
    except Exception as e:
        return socketio.emit('error', {'message': str(e)})
    # Broadcast the message to the game
    socketio.emit("message", message, room=game_room_id)
    logger.debug(f"Message sent to game {game_room_id}: {message}")


if __name__ == '__main__':
    socketio.run(app, debug=True)
