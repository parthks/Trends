import typesense
import os
import json
from datetime import datetime

from dotenv import load_dotenv
# Load environment variables
load_dotenv()
# Get API key from environment
TYPESENSE_API_KEY = os.getenv('TYPESENSE_API_KEY')
if not TYPESENSE_API_KEY:
    raise ValueError("No Typesense API key found. Please set TYPESENSE_API_KEY environment variable.")

client = typesense.Client({
  'nodes': [{
    'host': 'yic0jokl7s3quw65p-1.a1.typesense.net',  # For Typesense Cloud use xxx.a1.typesense.net
    'port': '443',       # For Typesense Cloud use 443
    'protocol': 'https'    # For Typesense Cloud use https
  }],
  'api_key': TYPESENSE_API_KEY,
  'connection_timeout_seconds': 300
})

input_filename = 'bigData/tweets.json'

with open(input_filename, 'r') as file:
    data = json.load(file)

print(len(data), 'Data loaded from', input_filename)

# loop over data and convert createdAt to unix timestamp
for i, tweet in enumerate(data):
    # "createdAt": "Wed Nov 20 15:34:28 +0000 2024"
    data[i]['created_at'] = int(datetime.strptime(tweet['created_at'], '%a %b %d %H:%M:%S +0000 %Y').timestamp())
    del data[i]['like_count']

# loop over data and upload 100 at a time to Typesense  
for i in range(0, len(data), 100):
    print(i, 'Uploading to Typesense')
    print(client.collections['tweets'].documents.import_(data[i:i+100], {'action': 'upsert'}))


print('Data uploaded to Typesense')