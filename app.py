import os
import secrets

from flask import Flask, request, send_from_directory
from flask_cors import CORS

from database import db, get_game, get_scoreboard, add_new_game, increment_queries, update_scoreboard, delete_game
from ai import generate_response

# Create app
app = Flask(__name__, static_folder='app/build')
CORS(app) # Enable CORS

# Initialize database with app
basedir = os.path.abspath(os.path.dirname(__file__))
db_name = 'database/database.db'
app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + os.path.join(basedir, db_name)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db.init_app(app)

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

# Endpoint for creating a new game
@app.post('/api/v0/new_game')
def new_game():

    # Create new game
    token = create_token()
    type = "ai" # or human
    add_new_game(db, token, type)

    # Return token
    return token

def create_token():
    return secrets.token_hex(16)

# Endpoint for querying the model
@app.post('/api/v0/query')
def query_model():
    # Get token
    args = request.args
    token = args.get('token')

    # Get game from database
    game = get_game(token)

    # Reject request if game does not exist
    if game is None:
        return 'Game does not exist', 400
    
    # Reject request if queries == 3
    if game.queries == 3:
        return 'Game has ended', 400

    # Get query
    query = args.get('q')

    # Generate response
    response = generate_response(query)

    # Update queries in game
    increment_queries(db, game)

    # Return response
    return response


# Endpoint to submit evaluation for a game
@app.post('/api/v0/evaluate')
def evaluate():
    # Get token
    args = request.args
    token = args.get('token')

    # Get game from database
    game = get_game(token)

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
    app.run(use_reloader=True, port=5000, threaded=True)
