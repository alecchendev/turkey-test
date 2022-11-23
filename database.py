from flask_sqlalchemy import SQLAlchemy
import time

db = SQLAlchemy()

# SQLAlchemy models
class Game(db.Model):
    __tablename__ = 'games'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(32), unique=True, nullable=False)
    type = db.Column(db.String(32), nullable=False)
    start_time = db.Column(db.Integer, nullable=False, default=int(time.time()))
    queries = db.Column(db.Integer, nullable=False, default=0)
    responses = db.Column(db.Integer, nullable=False, default=0)
    has_investigator = db.Column(db.Boolean, nullable=False, default=False)
    has_responder = db.Column(db.Boolean, nullable=False, default=False)

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
    
    # return scoreboard as dict
    def to_dict(self):
        return {
            'name': self.name,
            'ai_right': self.ai_right,
            'ai_wrong': self.ai_wrong,
            'human_right': self.human_right,
            'human_wrong': self.human_wrong
        }

# Helper functions for db operations

def get_scoreboard(name):
    return Scoreboard.query.filter_by(name=name).first()

def add_new_game(db, token, type, has_responder, has_investigator):
    game = Game(token=token, type=type, has_responder=has_responder, has_investigator=has_investigator)
    db.session.add(game)
    db.session.commit()

def get_game(token):
    game = Game.query.filter_by(token=token).first()
    return game

def increment_queries(db, game):
    game.queries += 1
    db.session.commit()

def increment_responses(db, game):
    game.responses += 1
    db.session.commit()

def update_scoreboard(db, scoreboard_name, evaluation, game_type):
    correct = evaluation == game_type
    is_ai = game_type == 'ai'
    is_human = game_type == 'human'
    scoreboard = Scoreboard.query.filter_by(name=scoreboard_name).first()

    if correct and is_ai:
        scoreboard.ai_right += 1
    elif correct and is_human:
        scoreboard.human_right += 1
    elif not correct and is_ai:
        scoreboard.ai_wrong += 1
    elif not correct and is_human:
        scoreboard.human_wrong += 1
    
    db.session.commit()

def delete_game(db, game):
    db.session.delete(game)
    db.session.commit()