import json
import os
import time

from dotenv import load_dotenv
from openai import OpenAI

# 2 seconds for the OpenAI call

# Load environment variables
load_dotenv()

# Get API key from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("No OpenAI API key found. Please set OPENAI_API_KEY environment variable.")

client = OpenAI(api_key=OPENAI_API_KEY)

def saveToFile(data):
    with open('summary.json', 'w') as file:
        json.dump(data, file) 


tweets = []
tweets_by_tag = {}
# import categorized.json
with open('categorized.json', 'r') as file:
    tweets = json.load(file)

# get tweets by tag
for tweet in tweets:
    for tag in tweet['tags']:
        tweets_by_tag[tag] = tweets_by_tag.get(tag, []) + [tweet]

# for each tag, segregate tweets by the day using the createdAt field
tweets_by_tag_and_day = {}
# import summary.json
try:
    with open('summary.json', 'r') as summary_file:
        tweets_by_tag_and_day = json.load(summary_file)
except:
    tweets_by_tag_and_day = {}
    for tag, tag_tweets in tweets_by_tag.items():
        tweets_by_tag_and_day[tag] = {}
        for tweet in tag_tweets:
            # Parse the date string and get just the date part (ignore time)
            date_str = tweet['createdAt']
            # Convert to time struct and format as YYYY-MM-DD
            date_obj = time.strptime(date_str, "%a %b %d %H:%M:%S %z %Y")
            day_key = time.strftime("%Y-%m-%d", date_obj)

            # Add tweet to the appropriate day
            if day_key not in tweets_by_tag_and_day[tag]:
                tweets_by_tag_and_day[tag][day_key] = {"tweets": [], "summary": ""}
            tweets_by_tag_and_day[tag][day_key]["tweets"].append(tweet)

    # Save the organized data to a file
    saveToFile(tweets_by_tag_and_day)



# display the count distribution of number of tweets per day for each tag
# for tag, days in tweets_by_tag_and_day.items():
#     print(f"\nTag: {tag}")
#     print("Date Distribution:")
#     for day, tweets in sorted(days.items()):
#         print(f"  {day}: {len(tweets)} tweets")



def getSummary(tweets, previousDaySummary, category, date):
    prompt = f'''Summarize the key updates from tweets for the category {category} on {date}. Use only the provided tweets as the source material, and avoid repeating anything already covered in the previous day’s summary. If there’s an external link in the tweets (like to a website or blog), include it so people can easily explore more.
Focus on delivering a concise, actionable summary without unnecessary openings or conclusions. Use a friendly but efficient tone, and only include the essential updates. 
'''
    prompt += "\n\n#### Previous Day Summary:"+previousDaySummary
    prompt += "\n\n#### Tweets:"+json.dumps( tweets )
    prompt += '''\n\n#### Expected Output:
    [Summary for the category, in concise paragraphs, with external links included where relevant. If you think more details would be available in the tweet, include the tweet link as well. Tweet links are like this: https://twitter.com/[[user_handle]]/status/[[tweet_id]]]. Prefer external links over tweet links. Only use tweet links if there is no external link available and more details would be available in the tweet.
    Add links through hyperlink text like this: [link text](https://example.com)
    ]'''
            
    # print(prompt)

    response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": '''You are an AI assistant tasked with summarizing tweets for a specific category. Your goal is to create an accurate and concise summary based solely on the provided tweets. Summaries should highlight key updates for the day and include any external links present in the tweets for easy user navigation.
                Key guidelines:
                1. Use only the provided tweets as the source material.
                2. Exclude links to the tweets themselves, but include any external links (e.g., websites) mentioned in the tweet text.
                3. Avoid duplicating information from the previous day's summary.
                4. Organize the summary into multiple paragraphs if necessary to cover distinct points.'''
        },
        {
        "role": "user",
        "content": [
            {
            "type": "text",
                "text": prompt
            }
        ]},
    ],
    temperature=0.1,
    max_tokens=500,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0,
    # text response
    response_format={
        "type": "text"
    }
    )
    return response.choices[0].message.content


previousDaySummary = "NULL"
for tag, days in tweets_by_tag_and_day.items():
    for day, tweets in days.items():
        if tweets_by_tag_and_day[tag][day]["summary"] != "":
            continue
        summary = getSummary(tweets["tweets"], previousDaySummary, tag, day)
        tweets_by_tag_and_day[tag][day]["summary"] = summary
        saveToFile(tweets_by_tag_and_day)
        # print it nicely, print the tweets for the day as well
        print(f"\n\n#### {tag} {day} ####\n\n"+summary+"\n\n")
        previousDaySummary = summary
        
        # raise Exception("Stop here")


all_tweets = []
with open('tweets.json', 'r') as file:
    all_tweets = json.load(file)

# add likeCount to tweets in tweets_by_tag_and_day
for tag, days in tweets_by_tag_and_day.items():
    for day, tweets in days.items():
        for tweet in tweets["tweets"]:
            # find tweet by id from all_tweets
            tweet_data = next((t for t in all_tweets if t['id'] == tweet['id']), None)
            tweet["likeCount"] = tweet_data["likeCount"]

saveToFile(tweets_by_tag_and_day)