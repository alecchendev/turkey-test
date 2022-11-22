import random
from transformers import pipeline, set_seed

import os
import openai
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_response(query):
    # return generate_response_openai(query, 'text-ada-001')
    return generate_response_transformer(query)

def generate_response_openai(query, model):
    # gpt3 ada
    res = openai.Completion.create(
        model=model,
        prompt=query,
        max_tokens=50, # openai reccomends 150 for chat
        temperature=0.9, # openai reccomends 0.9 for chat
        top_p=1, # openai reccomends 1 for chat
    )
    response = res['choices'][0]['text']
    return response

generator = pipeline('text-generation', model='gpt2')

def generate_response_transformer(query):
    # gpt2
    set_seed(random.randint(0, 1000000))
    response = generator(query, max_length=50, num_return_sequences=1)
    response = response[0]['generated_text'].replace(query, '', 1)
    return response