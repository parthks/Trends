# read sam.json
import json

output_filename = 'bigData/tweets.json'
# input_filename = 'sam.json'
input_filename = 'bigData/top9.json'

def saveFile(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f)

with open(input_filename, 'r') as f:
    data = json.load(f)

# print(data)
tweets = []

def expandUrls(tweet, text):
    urls = {}
    if len(tweet['entities']['urls']) > 0:
        for url_data in tweet['entities']['urls']:
            urls[url_data['url']] = url_data['expanded_url']
    
    for url in urls:
        text = text.replace(url, urls[url])
    return text

for tweet in data:
    tweet_data = {}
    tweet_data['id'] = tweet['id']
    tweet_data['likeCount'] = tweet['likeCount']
    tweet_data['user'] = tweet['author']['userName']
    if 'retweet' in tweet:
        tweet_data['retweet'] = expandUrls(tweet['retweet'], tweet['retweet']['text'])
        tweet_data['retweetUser'] = tweet['retweet']['author']['userName']
    else:
        tweet_data['text'] = expandUrls(tweet, tweet['fullText'])
    tweet_data['createdAt'] = tweet['createdAt']
    # add quote tweet data if it exists
    if 'quote' in tweet:
        tweet_data['quote'] = tweet['quote']['text']
        tweet_data['quoteId'] = tweet['quote']['id']
        tweet_data['quoteUser'] = tweet['quote']['author']['userName']
    tweets.append(tweet_data)

# write tweets to a file
saveFile(tweets, output_filename)
