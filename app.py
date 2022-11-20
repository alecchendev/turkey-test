import os
import random
import secrets

from flask import Flask, request, send_from_directory
from flask_cors import CORS

from transformers import pipeline, set_seed

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text

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
    start_time = db.Column(db.Integer, nullable=False)
    queries = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<Game %r>' % self.token

class Scoreboard(db.Model):
    __tablename__ = 'scoreboard'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False)
    ai_right = db.Column(db.Integer, nullable=False)
    ai_wrong = db.Column(db.Integer, nullable=False)
    human_right = db.Column(db.Integer, nullable=False)
    human_wrong = db.Column(db.Integer, nullable=False)

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

# Endpoint for querying the model
@app.get('/api/v0/query')
def query_model():
    # Get http only cookie from request
    token = request.cookies.get('token')

    # Get game from database
    game = Game.query.filter_by(token=token).first()

    # Reject request if game does not exist
    if game is None:
        return 'Game does not exist', 400
    
    # Reject request if queries == 3
    if game.queries == 3:
        return 'Game has ended', 400

    # Get query
    args = request.args
    query = args.get('q')

    # Generate response
    set_seed(random.randint(0, 1000000))
    response = generator(query, max_length=50, num_return_sequences=1)

    # Update queries in game
    game.queries += 1
    db.session.commit()

    # Return response
    return response[0]['generated_text'].replace(query, '', 1)

# Endpoint for creating a new game
@app.post('/api/v0/new_game')
def new_game():

    # Create new game
    token = secrets.token_hex(16)
    type = "ai" # or human
    game = Game(token=token, type=type, start_time=0, queries=0)
    db.session.add(game)
    db.session.commit()

    # return response with token as http only cookie
    response = app.response_class(
        response='',
        status=200,
        mimetype='application/json'
    )
    response.set_cookie('token', token, httponly=True)

    return response

# Endpoint for getting the scoreboard
@app.get('/api/v0/scoreboard/<name>')
def get_scoreboard(name):

    scoreboard = Scoreboard.query.filter_by(name=name).first()

    # Return scoreboard object as dict
    if scoreboard is not None:
        return {
            'name': scoreboard.name,
            'ai_right': scoreboard.ai_right,
            'ai_wrong': scoreboard.ai_wrong,
            'human_right': scoreboard.human_right,
            'human_wrong': scoreboard.human_wrong
        }
    else:
        return 'Scoreboard does not exist', 400

# Endpoint to submit evaluation for a game
@app.post('/api/v0/evaluate')
def evaluate():
    # Get token
    args = request.args
    token = request.cookies.get('token')

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
    if evaluation == game.type and evaluation == 'ai':
        scoreboard.ai_right += 1
    elif evaluation == game.type and evaluation == 'human':
        scoreboard.human_right += 1
    elif evaluation != game.type and evaluation == 'ai':
        scoreboard.ai_wrong += 1
    elif evaluation != game.type and evaluation == 'human':
        scoreboard.human_wrong += 1
    db.session.commit()
    
    # Delete game from database
    db.session.delete(game)
    db.session.commit()

    # Return response
    return ''


# Endpoint to test db connection
@app.route('/api/v0/dbtest')
def testdb():
    try:
        db.session.query(text('1')).from_statement(text('SELECT 1')).all()
        return '<h1>It works.</h1>'
    except Exception as e:
        # e holds description of the error
        error_text = "<p>The error:<br>" + str(e) + "</p>"
        hed = '<h1>Something is broken.</h1>'
        return hed + error_text


if __name__ == '__main__':
    app.run(use_reloader=True, port=5000, threaded=True)