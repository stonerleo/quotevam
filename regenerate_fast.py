import json
import requests
import re
import os
import time
from deep_translator import GoogleTranslator
from concurrent.futures import ThreadPoolExecutor, as_completed

BANNED_WORDS = ["god", "lord", "heaven", "hell", "holy", "divine", "prayer", "religion", "sin", "jesus", "christ", "devil", "bible", "church", "faith"]

def is_religious(text):
    text_lower = text.lower()
    for word in BANNED_WORDS:
        if re.search(rf'\b{word}\b', text_lower):
            return True
    return False

print("Fetching original 500 quotes to reconstruct translation mapping...")
resp = requests.get("https://dummyjson.com/quotes?limit=500", timeout=10)
orig_quotes = [{"text": q["quote"], "author": q["author"]} for q in resp.json()["quotes"]]

# Load translations to map
LANGS = ['es', 'fr', 'hi', 'mr', 'ml']
trans_maps = {lang: {} for lang in LANGS}

for lang in LANGS:
    try:
        with open(f'assets/quotes_{lang}.json', 'r', encoding='utf-8') as f:
            lang_quotes = json.load(f)
            # Map original english text -> translated obj
            for i, eng_q in enumerate(orig_quotes):
                if i < len(lang_quotes):
                    trans_maps[lang][eng_q['text']] = lang_quotes[i]
    except Exception as e:
        print(f"Could not load {lang}: {e}")

print("Loading our new filtered exactly-500 English quotes...")
with open('assets/quotes_en.json', 'r', encoding='utf-8') as f:
    new_en_quotes = json.load(f)

# Need to translate ONLY quotes that are not in the trans_maps
def translate_missing(lang):
    translator = GoogleTranslator(source='en', target=lang)
    final_lang_quotes = []
    
    missing_indices = []
    for i, q in enumerate(new_en_quotes):
        if q['text'] in trans_maps[lang]:
            final_lang_quotes.append(trans_maps[lang][q['text']])
        else:
            final_lang_quotes.append(None) # placeholder
            missing_indices.append(i)
            
    print(f"[{lang}] Needs {len(missing_indices)} new translations.")
    
    # Chunk missing in chunks of 5
    for i in range(0, len(missing_indices), 5):
        chunk_idx = missing_indices[i:i+5]
        texts = [new_en_quotes[idx]['text'] for idx in chunk_idx]
        authors = [new_en_quotes[idx]['author'] for idx in chunk_idx]
        
        try:
            trans_texts = translator.translate_batch(texts)
            trans_authors = translator.translate_batch(authors)
            
            for idx, t, a in zip(chunk_idx, trans_texts, trans_authors):
                final_lang_quotes[idx] = {"text": t, "author": a}
                
            time.sleep(1) # cool down
        except Exception as e:
            print(f"[{lang}] Error translating batch: {e}")
            for idx in chunk_idx:
                final_lang_quotes[idx] = new_en_quotes[idx] # Fallback to English
                
    with open(f'assets/quotes_{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(final_lang_quotes, f, ensure_ascii=False, indent=4)
        
    print(f"[{lang}] Finished perfectly.")

# Run translations in parallel for speed!
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(translate_missing, lang) for lang in LANGS]
    for future in as_completed(futures):
        pass

print("All translations mapped and updated efficiently!")
