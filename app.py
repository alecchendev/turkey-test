from flask import Flask, request

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.get('/api/v0/query')
def login_get():
    args = request.args
    query = args.get('q')
    return "<p>{query}</p>".format(query=query)