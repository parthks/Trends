# read sam.json
import json

output_filename = 'bigData/tweets.json'
# input_filename = 'sam.json'
input_filename = 'bigData/top10.json'

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


def getMedia(tweet):
    media = []
    if 'media' in tweet['entities']:
        for media_data in tweet['entities']['media']:
            if 'video_info' in media_data:
                variants = media_data['video_info']['variants']
                # find the highest bitrate video and content_type = 'video/mp4'
                highest_bitrate_video = max(variants, key=lambda x: x['bitrate'] if x['content_type'] == 'video/mp4' else 0)
                if highest_bitrate_video:   
                    media.append({
                        'original_url': highest_bitrate_video['url'],
                        'thumbnail_url': media_data['media_url_https'],
                        'type': media_data['type']
                    })
            else:
                media.append({
                    'original_url': media_data['url'],
                    'url': media_data['media_url_https'],
                    'type': media_data['type']
                })
    return media

# remove duplicate id
seen_ids = set()
unique_tweets = []
for tweet in data:
    if tweet['id'] not in seen_ids:
        seen_ids.add(tweet['id'])
        unique_tweets.append(tweet)
data = unique_tweets


for tweet in data:
    tweet_data = {}
    tweet_data['media'] = getMedia(tweet)
    tweet_data['id'] = tweet['id']
    tweet_data['likeCount'] = tweet['likeCount']
    tweet_data['user'] = tweet['author']['userName']
    if tweet['conversationId'] != tweet['id']:
        tweet_data['conversationId'] = tweet['conversationId']
    if 'retweet' in tweet:
        tweet_data['retweet'] = expandUrls(tweet['retweet'], tweet['retweet']['text'])
        tweet_data['originalTweetId'] = tweet['retweet']['id']
        tweet_data['retweetUser'] = tweet['retweet']['author']['userName']
    else:
        tweet_data['text'] = expandUrls(tweet, tweet['fullText'])
    tweet_data['createdAt'] = tweet['createdAt']
    # add quote tweet data if it exists
    if 'quote' in tweet:
        tweet_data['quote'] = expandUrls(tweet['quote'], tweet['quote']['text'])
        tweet_data['quoteMedia'] = getMedia(tweet['quote'])
        tweet_data['quoteId'] = tweet['quote']['id']
        tweet_data['quoteUser'] = tweet['quote']['author']['userName']
    tweets.append(tweet_data)

# for each tweet, check if there are tweets with the same conversationId and add them to the main tweet
# then remove the conversationId tweets
# Create a dictionary to store conversations
conversations = {}

# First pass: Organize tweets into conversations
for tweet in tweets[:]:  # Create a copy of the list to iterate
    if 'conversationId' in tweet:
        conv_id = tweet['conversationId']
        if conv_id not in conversations:
            conversations[conv_id] = []
        conversations[conv_id].append(tweet)

# Second pass: Add replies to their parent tweets and remove them from the main list
for tweet in tweets[:]:  # Create a copy of the list to iterate
    tweet_id = tweet['id']
    if tweet_id in conversations:
        # This tweet has replies
        # Sort conversations by createdAt date
        tweet['thread'] = sorted(conversations[tweet_id], key=lambda x: x['createdAt'])
        # combine the media of the tweet and the thread
        thread_media = [media for thread in tweet['thread'] for media in thread['media']]
        quote_media = [media for thread in tweet['thread'] for media in thread.get('quoteMedia', []) if thread.get('quoteMedia')]
        tweet['media'] = tweet['media'] + thread_media + quote_media
        # combine the text of the tweet and the thread
        tweet['text'] = tweet['text'] + '. ' + '. '.join([thread['text'] for thread in tweet['thread']])
        # Remove the reply tweets from the main list
        for reply in conversations[tweet_id]:
            if reply in tweets:
                tweets.remove(reply)


# write tweets to a file
saveFile(tweets, output_filename)
