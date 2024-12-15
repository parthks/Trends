# import tweets.json
import json
import re

with open('tweets.json', 'r') as f:
    tweets = json.load(f)


def cleanUnicode(text):
    # return re.sub(r'\\u[0-9a-fA-F]{4}|[\u0000-\uffff]', '', text)
    text = text.replace('\n', ' ')
    # remove urls
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    return ''.join(char for char in text if ord(char) < 128)


data = []
all_text = []
for tweet in tweets:
    # clean the tweet text
    if 'text' in tweet:
        tweet['text'] = cleanUnicode(tweet['text'])
    if 'retweet' in tweet:
        tweet['retweet'] = cleanUnicode(tweet['retweet'])
        tweet['text'] = tweet['retweet']
        del tweet['retweet']
    if 'quote' in tweet:
        tweet['quote'] = cleanUnicode(tweet['quote'])
        tweet['text'] = tweet['text'] + ' ' + tweet['quote']
        del tweet['quote']

    all_text.append(tweet['text'])
    data.append(tweet)



# write data to a file

# all text goes into gemini to get a key topics trend analysis: Analyse trends you see from these twitter posts. The posts are all from the Arweave Blockchain community. I want to group them into topics and trends
# The output goes into GPT to come up with the final topic list
with open('all_text.txt', 'w') as f:
    for text in all_text:
        f.write(text + '\n')

with open('cleaned_tweets.json', 'w') as f:
    json.dump(data, f)
