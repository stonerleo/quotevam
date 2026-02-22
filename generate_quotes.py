import json
import requests
from deep_translator import GoogleTranslator
import os

print("Fetching quotes from DummyJSON...")
res = requests.get('https://dummyjson.com/quotes?limit=500')
quotes = res.json()['quotes']
english_quotes = [{"text": q["quote"], "author": q["author"]} for q in quotes]

with open('assets/quotes_en.json', 'w', encoding='utf-8') as f:
    json.dump(english_quotes, f, ensure_ascii=False, indent=4)

print(f"Saved {len(english_quotes)} English quotes.")

langs = {'es': 'es', 'fr': 'fr', 'hi': 'hi', 'mr': 'mr', 'ml': 'ml'}

def chunk_list(lst, chunk_size):
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]

for lang_code, target_lang in langs.items():
    print(f"Translating to {lang_code}...")
    translator = GoogleTranslator(source='en', target=target_lang)
    translated_quotes = []
    
    # Chunk quotes to respect 5000 character Google Translate limit (approx 30 quotes per chunk)
    chunks = list(chunk_list(english_quotes, 30))
    for i, chunk in enumerate(chunks):
        texts = [q["text"] for q in chunk]
        authors = [q["author"] for q in chunk]
        
        try:
            trans_texts = translator.translate_batch(texts)
            trans_authors = translator.translate_batch(authors)
            
            for t, a in zip(trans_texts, trans_authors):
                translated_quotes.append({"text": t, "author": a})
        except Exception as e:
            print(f"Error on chunk {i} for {lang_code}: {e}")
            for q in chunk:
                translated_quotes.append(q) # fallback to english on error if batch fails
                
    with open(f'assets/quotes_{lang_code}.json', 'w', encoding='utf-8') as f:
        json.dump(translated_quotes, f, ensure_ascii=False, indent=4)
    print(f"Finished {lang_code}: {len(translated_quotes)} quotes.")

print("All translations generated successfully!")
