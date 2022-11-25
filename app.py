import os
import secrets

from flask import Flask, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room

from database import db, Game, get_game, get_scoreboard, add_new_game, increment_queries, increment_responses, update_scoreboard, delete_game
from ai import generate_response

# Create app
app = Flask(__name__, static_folder='app/build')
CORS(app) # Enable CORS

# Configure socketio
app.config['SECRET_KEY'] = 'secret!'                                            
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize database with app
basedir = os.path.abspath(os.path.dirname(__file__))
db_name = 'database/database.db'
app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + os.path.join(basedir, db_name)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db.init_app(app)

# Test socketio connection
@socketio.on('connect')                                                         
def on_connect():                                                                  
    emit('connect')

# Handle message on event 'join'
@socketio.on('join')
def on_join(data):
    role = data['role']
    token = new_game(role)

    # token = data['token']
    game = get_game(token=token)
    if game is None:
        emit('join', {'error': 'Game does not exist'})
        return
    
    gotMatch = game.investigator_id != '' and game.responder_id != ''
    
    join_room(token)
    emit('join', {'token': token, 'gotMatch': gotMatch }, room=token)

# On disconnect leave room and update database
@socketio.on('disconnect')
def on_disconnect():
    id = request.sid
    game = get_game(player_id=id)

    if game is None:
        return
    
    token = game.token
    if game.investigator_id == id:
        game.investigator_id = 'left'
        db.session.commit()
        if game.responder_id in ['', 'left', 'ai']:
            delete_game(db, game)
    elif game.responder_id == id:
        game.responder_id = 'left'
        db.session.commit()
        if game.investigator_id in ['', 'left']:
            delete_game(db, game)
    
    leave_room(game.token)
    emit('disconnect', {'message': 'left room'}, room=token)


# Handle message on event 'message'
@socketio.on('message')
def on_message(data):
    token = data['token']
    message = data['message']
    emit('message', message, room=token)

    game = get_game(token=token)

    # Reject request if game does not exist
    if game is None:
        emit('message', {'error': 'Game does not exist'})
        return
    
    if message['type'] == 'query':
        # Reject request if queries == 3
        if game.queries == 3:
            emit('message', {'error': 'You have reached the maximum number of queries'})
            return
        increment_queries(db, game)
    else:
        # Reject request if responses == 3
        if game.responses == 3:
            emit('message', {'error': 'You have reached the maximum number of responses'})
            return
        increment_responses(db, game)

    # If ai, must be type == query, generate response
    if game.type == 'ai':
        response = generate_response(message['text'])
        emit('message', {'text': response, 'type': 'response'}, room=token)
        increment_responses(db, get_game(token=token))

# Handler evaluation
@socketio.on('evaluate')
def on_evaluation(data):
    token = data['token']
    evaluation = data['evaluation']
    game = get_game(token=token)
    print("HANDLING EVALUATE\n\n\n")

    # Reject request if game does not exist
    if game is None:
        emit('evaluate', {'error': 'Game does not exist'})
        return
    
    # Reject request if evaluation is not valid
    if evaluation not in ['ai', 'human']:
        emit('evaluate', {'error': 'Evaluation must be "ai" or "human"'}, room=token)
    
    # Update score
    update_scoreboard(db, 'basic', evaluation, game.type)
    results = game.type

    # Delete game
    delete_game(db, game)

    emit('evaluate', { 'evaluation': evaluation, 'results': results }, room=token)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Endpoint for getting the scoreboard
@app.get('/api/v0/scoreboard/<name>')
def get_results(name):

    scoreboard = get_scoreboard(name)

    # Return scoreboard object as dict
    if scoreboard is None:
        return 'Scoreboard does not exist', 400
    
    return scoreboard.to_dict()

# Create new game
def new_game(role):

    # Try to join latest game where it's missing your role
    game = (Game.query.filter_by(responder_id='').order_by(Game.start_time.desc()).first()
        if role == 'responder' else Game.query.filter_by(investigator_id='').order_by(Game.start_time.desc()).first())
    if game is not None:
        game.responder_id = request.sid if role == 'responder' else game.responder_id
        game.investigator_id = request.sid if role == 'investigator' else game.investigator_id
        db.session.commit()
        return game.token

    # If can't join game, create new game
    token = create_token()
    if role == 'responder':
        game_type = "human"
        responder_id = request.sid
        investigator_id = ''
        add_new_game(db, token, game_type, responder_id, investigator_id)
        return token
    
    # role == 'investigator':
    game_type = "ai"
    responder_id = 'ai'
    investigator_id = request.sid
    add_new_game(db, token, game_type, responder_id, investigator_id)
    return token

def create_token():
    return secrets.token_hex(16)


# Endpoint to submit evaluation for a game
@app.post('/api/v0/evaluate')
def evaluate():
    # Get token
    args = request.args
    token = args.get('token')

    # Get game from database
    game = get_game(token=token)

    # Reject request if game does not exist
    if game is None:
        return 'Game does not exist', 400

    # Reject request if game has less than 1 query
    if game.queries < 1:
        return 'Must query once before evaluating', 400
    
    # Reject request if evaluation not equal to "ai" or "human"
    evaluation = args.get('e')
    if evaluation != 'ai' and evaluation != 'human':
        return 'Evaluation must be "ai" or "human"', 400
    
    # Update scoreboard 'basic' depending if evaluation matches type of game
    update_scoreboard(db, 'basic', evaluation, game.type)
    
    # Delete game from database
    delete_game(db, game)

    # Return response
    return game.type


if __name__ == '__main__':
    socketio.run(app, use_reloader=True, port=5000, threaded=True)
    # app.run(use_reloader=True, port=5000, threaded=True)
