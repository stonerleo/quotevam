import json
import requests
import re
import os
import time
from deep_translator import GoogleTranslator

# Keywords to ban
BANNED_WORDS = ["god", "lord", "heaven", "hell", "holy", "divine", "prayer", "religion", "sin", "jesus", "christ", "devil", "bible", "church", "faith"]

# Helper to check for religious words
def is_religious(text):
    text_lower = text.lower()
    for word in BANNED_WORDS:
        # Match whole words only using regex to avoid filtering "godzilla" for "god"
        if re.search(rf'\b{word}\b', text_lower):
            return True
    return False

# Load existing english quotes
try:
    with open('assets/quotes_en.json', 'r', encoding='utf-8') as f:
        existing_quotes = json.load(f)
except FileNotFoundError:
    existing_quotes = []

valid_quotes = [q for q in existing_quotes if not is_religious(q['text'])]
print(f"Kept {len(valid_quotes)} valid quotes out of {len(existing_quotes)}.")

# If we need more to reach 500, fetch using an open API (like DummyJSON or ZenQuotes)
# We will use DummyJSON which we used before, but we might need to skip existing ones.
# DummyJSON quotes limit is 1454. We can safely fetch new quotes.

limit_needed = 500 - len(valid_quotes)

if limit_needed > 0:
    print(f"Fetching {limit_needed} new quotes to replace the filtered ones...")
    # Fetch all quotes and filter
    try:
        url = "https://dummyjson.com/quotes?limit=1454"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        # Filter these as well
        available = [q for q in data.get("quotes", []) if not is_religious(q["quote"])]
        
        # Get quotes we don't already have
        existing_texts = {q['text'] for q in valid_quotes}
        
        added = 0
        for q in available:
            if q["quote"] not in existing_texts:
                valid_quotes.append({"text": q["quote"], "author": q["author"]})
                existing_texts.add(q["quote"])
                added += 1
                if added >= limit_needed:
                    break
        print(f"Successfully added {added} non-religious quotes.")
    except Exception as e:
        print(f"Failed to fetch replacement quotes: {e}")

# Slice to exactly 500 if we have more
valid_quotes = valid_quotes[:500]
print(f"Final valid quotes count: {len(valid_quotes)}")

with open('assets/quotes_en.json', 'w', encoding='utf-8') as f:
    json.dump(valid_quotes, f, ensure_ascii=False, indent=4)

print("Running translations...")

LANGS = {'es': 'es', 'fr': 'fr', 'hi': 'hi', 'mr': 'mr', 'ml': 'ml'}

# Chunk helper
def chunk_list(lst, chunk_size):
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]

for lang_code, target_lang in LANGS.items():
    print(f"\nTranslating to {lang_code}...")
    translator = GoogleTranslator(source='en', target=target_lang)
    
    file_path = f'assets/quotes_{lang_code}.json'
    translated_quotes = []
    
    # Check if we should resume
    if os.path.exists(file_path):
        try:
             with open(file_path, 'r', encoding='utf-8') as f:
                 existing = json.load(f)
                 # Only resume if we're generating the exact same filtered source set
                 if len(existing) > 0 and type(existing) == list:
                     # Check if the English counterpart of the last translated quote matches our current final English list
                     # This is a bit complex, and since the English list has changed heavily by removals/insertions, 
                     # we should just force re-translate everything so the indexes correctly align with `quotes_en.json`
                     pass
        except:
             pass

    # We are forcing full translation for all so indexes align perfectly.
    # Because we removed items from the middle, the old translations don't correspond index-to-index anymore.
    # To be extremely safe, we will translate from scratch.
    
    chunks = list(chunk_list(valid_quotes, 10))
    failed = False
    for i, chunk in enumerate(chunks):
        texts = [q["text"] for q in chunk]
        authors = [q["author"] for q in chunk]
        
        retries = 3
        while retries > 0:
            try:
                trans_texts = translator.translate_batch(texts)
                trans_authors = translator.translate_batch(authors)
                
                for t, a in zip(trans_texts, trans_authors):
                    translated_quotes.append({"text": t, "author": a})
                
                print(f"[{lang_code}] Chunk {i+1}/{len(chunks)} OK")
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(translated_quotes, f, ensure_ascii=False, indent=4)
                    
                time.sleep(2)  # Cooldown API
                break
            except Exception as e:
                print(f"[{lang_code}] Chunk {i+1} err: {e}")
                retries -= 1
                time.sleep(10) # Heavy penalty wait
        
        if retries == 0:
            print(f"CRITICAL: Failed to translate chunk {i+1} for {lang_code} 3 times. Falling back to English.")
            for q in chunk:
                translated_quotes.append(q)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                 json.dump(translated_quotes, f, ensure_ascii=False, indent=4)

    print(f"Finished {lang_code}: {len(translated_quotes)} quotes.")
