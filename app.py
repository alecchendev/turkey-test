import os
import random
from flask import Flask, request, send_from_directory
from flask_cors import CORS
from transformers import pipeline, set_seed

generator = pipeline('text-generation', model='gpt2')

app = Flask(__name__, static_folder='app/build')
CORS(app) # Enable CORS

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


if __name__ == '__main__':
    app.run(use_reloader=True, port=5000, threaded=True)