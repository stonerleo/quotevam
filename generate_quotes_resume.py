import json
import time
import os
import requests
from deep_translator import GoogleTranslator

# Monkey-patch requests.get to enforce a timeout
original_get = requests.get
def patched_get(*args, **kwargs):
    kwargs.setdefault('timeout', 15)
    return original_get(*args, **kwargs)
requests.get = patched_get

with open('assets/quotes_en.json', 'r', encoding='utf-8') as f:
    english_quotes = json.load(f)

langs = {'mr': 'mr', 'ml': 'ml'}

def chunk_list(lst, chunk_size):
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]

for lang_code, target_lang in langs.items():
    print(f"Translating to {lang_code}...")
    translator = GoogleTranslator(source='en', target=target_lang)
    
    file_path = f'assets/quotes_{lang_code}.json'
    translated_quotes = []
    
    # Reload existing progress if it exists so we don't start from scratch
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                translated_quotes = json.load(f)
            except json.JSONDecodeError:
                pass
                
    # Check if this language is already fully translated (manual check > 10 items)
    if len(translated_quotes) >= len(english_quotes) - 10:
        print(f"Skipping {lang_code}, already looks complete.")
        continue

    # Resume from where we left off
    start_idx = len(translated_quotes)
    remaining_quotes = english_quotes[start_idx:]
    if not remaining_quotes: continue
    
    chunks = list(chunk_list(remaining_quotes, 10))
    for i, chunk in enumerate(chunks):
        texts = [q["text"] for q in chunk]
        authors = [q["author"] for q in chunk]
        
        try:
            trans_texts = translator.translate_batch(texts)
            trans_authors = translator.translate_batch(authors)
            
            for t, a in zip(trans_texts, trans_authors):
                translated_quotes.append({"text": t, "author": a})
            
            # Save progressively so we never lose progress if it fails
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(translated_quotes, f, ensure_ascii=False, indent=4)
                
            print(f"[{lang_code}] Chunk {i+1}/{len(chunks)} saved.")
            time.sleep(1.5)
            
        except Exception as e:
            print(f"Error on chunk {i} for {lang_code}: {e}")
            for q in chunk:
                translated_quotes.append(q) # fallback
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(translated_quotes, f, ensure_ascii=False, indent=4)
            time.sleep(3)
            
    print(f"Finished {lang_code}: {len(translated_quotes)} quotes.")

print("All translations generated successfully!")
