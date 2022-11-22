import os
import random
import secrets
from datetime import datetime
import time

from flask import Flask, request, send_from_directory
from flask_cors import CORS

import os
import openai
openai.api_key = os.getenv("OPENAI_API_KEY")

from transformers import pipeline, set_seed

from flask_sqlalchemy import SQLAlchemy

# Create generator
generator = pipeline('text-generation', model='gpt2')

# Create app
app = Flask(__name__, static_folder='app/build')
CORS(app) # Enable CORS

# Connect to database
basedir = os.path.abspath(os.path.dirname(__file__))
db_name = 'database/database.db'
app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + os.path.join(basedir, db_name)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)

# SQLAlchemy models
class Game(db.Model):
    __tablename__ = 'games'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(32), unique=True, nullable=False)
    type = db.Column(db.String(32), nullable=False)
    start_time = db.Column(db.Integer, nullable=False, default=int(time.time()))
    queries = db.Column(db.Integer, nullable=False, default=0)

    def __repr__(self):
        return '<Game %r>' % self.token

class Scoreboard(db.Model):
    __tablename__ = 'scoreboard'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False)
    ai_right = db.Column(db.Integer, nullable=False, default=0)
    ai_wrong = db.Column(db.Integer, nullable=False, default=0)
    human_right = db.Column(db.Integer, nullable=False, default=0)
    human_wrong = db.Column(db.Integer, nullable=False, default=0)

    def __repr__(self):
        return '<Scoreboard %r>' % self.name

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
def get_scoreboard(name):

    scoreboard = Scoreboard.query.filter_by(name=name).first()

    # Return scoreboard object as dict
    if scoreboard is None:
        return 'Scoreboard does not exist', 400
    
    return {
        'name': scoreboard.name,
        'ai_right': scoreboard.ai_right,
        'ai_wrong': scoreboard.ai_wrong,
        'human_right': scoreboard.human_right,
        'human_wrong': scoreboard.human_wrong
    }


# Endpoint for creating a new game
@app.post('/api/v0/new_game')
def new_game():

    # Create new game
    token = secrets.token_hex(16)
    type = "ai" # or human
    game = Game(token=token, type=type)
    db.session.add(game)
    db.session.commit()

    # Return token
    return token

# Endpoint for querying the model
@app.post('/api/v0/query')
def query_model():
    # Get http only cookie from request
    # token = request.cookies.get('token')
    args = request.args
    token = args.get('token')

    # Get game from database
    game = Game.query.filter_by(token=token).first()

    # Reject request if game does not exist
    if game is None:
        return 'Game does not exist', 400
    
    # Reject request if queries == 3
    if game.queries == 3:
        return 'Game has ended', 400

    # Get query
    query = args.get('q')

    # Generate response
    # set_seed(random.randint(0, 1000000))
    response = generator(query, max_length=50, num_return_sequences=1)
    response = response[0]['generated_text'].replace(query, '', 1)
    # res = openai.Completion.create(
    #     model="text-ada-001",
    #     prompt=query,
    #     max_tokens=50, # openai reccomends 150 for chat
    #     temperature=0.9, # openai reccomends 0.9 for chat
    #     top_p=1, # openai reccomends 1 for chat
    # )
    # response = res['choices'][0]['text']

    # Update queries in game
    game.queries += 1
    db.session.commit()

    # Return response
    return response

# Endpoint to submit evaluation for a game
@app.post('/api/v0/evaluate')
def evaluate():
    # Get token
    args = request.args
    token = args.get('token')
    # token = request.cookies.get('token')

    # Get game from database
    game = Game.query.filter_by(token=token).first()

    # Reject request if game does not exist
    if game is None:
        return 'Game does not exist', 400

    # Reject request if game has less than 1 query
    if game.queries < 1:
        return {
            'error': 'Game has less than 1 query'
        }
    
    # Reject request if evaluation not equal to "ai" or "human"
    evaluation = args.get('e')
    if evaluation != 'ai' and evaluation != 'human':
        return {
            'error': 'Evaluation must be "ai" or "human"'
        }
    
    # Update scoreboard 'basic' depending if evaluation matches type of game
    scoreboard = Scoreboard.query.filter_by(name='basic').first()
    if evaluation == game.type and game.type == 'ai':
        scoreboard.ai_right += 1
    elif evaluation == game.type and game.type == 'human':
        scoreboard.human_right += 1
    elif evaluation != game.type and game.type == 'ai':
        scoreboard.ai_wrong += 1
    elif evaluation != game.type and game.type == 'human':
        scoreboard.human_wrong += 1
    db.session.commit()
    
    # Delete game from database
    db.session.delete(game)
    db.session.commit()

    # Return response
    return game.type


if __name__ == '__main__':
    app.run(use_reloader=True, port=5000, threaded=True)