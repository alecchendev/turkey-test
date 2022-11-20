import os
from flask import Flask, request, send_from_directory

app = Flask(__name__, static_folder='app/build')

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.get('/api/v0/query')
def query_model():
    args = request.args
    query = args.get('q')
    return "[Response to {query}]".format(query=query)


if __name__ == '__main__':
    app.run(use_reloader=True, port=5000, threaded=True)