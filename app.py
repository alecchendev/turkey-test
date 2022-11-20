import os
import random

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
    args = request.args
    query = args.get('q')

    set_seed(random.randint(0, 1000000))
    response = generator(query, max_length=50, num_return_sequences=1)

    return response[0]['generated_text'].replace(query, '', 1)

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


# SQLAlchemy model for games
class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(80), unique=True, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    queries = db.Column(db.Integer, nullable=False)

# SQLAlchemy model for scoreboard
class Scoreboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    ai_right = db.Column(db.Integer, nullable=False)
    ai_wrong = db.Column(db.Integer, nullable=False)
    human_right = db.Column(db.Integer, nullable=False)
    human_wrong = db.Column(db.Integer, nullable=False)

if __name__ == '__main__':
    app.run(use_reloader=True, port=5000, threaded=True)